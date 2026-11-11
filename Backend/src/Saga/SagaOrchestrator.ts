import { prisma } from "../prisma/db.js";
import { broadcastPlatformEvent, sendUserNotification } from "../socket.js";
import type { SagaStep, SagaOptions, SagaExecutionResult } from "./types.js";
import { BadRequestError, ConflictError } from "../Utils/errors.js";
import { tracer } from "../Telemetry/Tracer.js";

export class SagaOrchestrator<TContext extends Record<string, any>> {
  private steps: SagaStep<TContext>[] = [];
  private options: SagaOptions;

  constructor(options: SagaOptions) {
    if (!options.sagaType || !options.idempotencyKey) {
      throw new BadRequestError("Saga requires a valid sagaType and idempotencyKey.");
    }
    this.options = options;
  }

  /**
   * Register a step in sequential execution order
   */
  public addStep(step: SagaStep<TContext>): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Execute the Saga
   */
  public async execute(initialContext: TContext): Promise<SagaExecutionResult<TContext>> {
    const startTime = Date.now();
    const { sagaType, idempotencyKey, userId, chaosFailStep } = this.options;

    // Dynamically tag active telemetry trace with gameId if present in context
    if (initialContext && (initialContext as any).gameId) {
      tracer.setTag('gameId', (initialContext as any).gameId);
    }

    // 1. Check Idempotency Key to avoid duplicate transactions
    const existing = await prisma.sagaInstance.findUnique({
      where: { idempotencyKey },
      include: { steps: { orderBy: { stepIndex: "asc" } } },
    });

    if (existing) {
      if (
        existing.status === "COMPLETED" ||
        existing.status === "COMPENSATED" ||
        existing.status === "FAILED"
      ) {
        console.log(`[SAGA IDEMPOTENCY] Found existing ${existing.status} transaction for key: ${idempotencyKey}`);
        return {
          sagaId: existing.id,
          idempotencyKey: existing.idempotencyKey,
          status: existing.status,
          currentStep: existing.currentStep,
          totalSteps: existing.totalSteps,
          durationMs: existing.durationMs || 0,
          context: (existing.payload as any) || initialContext,
          error: existing.error || undefined,
          stepLogs: existing.steps.map((s) => ({
            stepIndex: s.stepIndex,
            stepName: s.stepName,
            status: s.status,
            durationMs: s.durationMs || 0,
            error: s.error || undefined,
          })),
        };
      }

      if (existing.status === "RUNNING" || existing.status === "COMPENSATING") {
        throw new ConflictError(
          `A transaction with idempotency key ${idempotencyKey} is currently ${existing.status}. Please wait.`
        );
      }
    }

    // 2. Initialize Saga Instance in PostgreSQL
    const saga = await prisma.sagaInstance.create({
      data: {
        sagaType,
        idempotencyKey,
        userId: userId || null,
        status: "RUNNING",
        currentStep: 0,
        totalSteps: this.steps.length,
        payload: initialContext,
      },
    });

    // Seed Step Logs
    await prisma.sagaStepLog.createMany({
      data: this.steps.map((step, idx) => ({
        sagaId: saga.id,
        stepIndex: idx,
        stepName: step.name,
        status: "PENDING",
      })),
    });

    this.broadcastSagaUpdate(saga.id, "RUNNING", 0, "Saga initialized and started.");

    const context = { ...initialContext };
    const executedSteps: { step: SagaStep<TContext>; index: number }[] = [];

    // 3. Forward Execution Loop
    try {
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        const stepStart = Date.now();

        await prisma.sagaInstance.update({
          where: { id: saga.id },
          data: { currentStep: i + 1 },
        });

        await prisma.sagaStepLog.update({
          where: { sagaId_stepIndex: { sagaId: saga.id, stepIndex: i } },
          data: { status: "RUNNING" },
        });

        this.broadcastSagaUpdate(saga.id, "RUNNING", i + 1, `Executing step: ${step.name}`);

        // Chaos Failure Injection for testing compensation rollbacks
        if (chaosFailStep && chaosFailStep.toUpperCase() === step.name.toUpperCase()) {
          throw new Error(`[CHAOS SIMULATION] Injected hardware fault during step: "${step.name}"`);
        }

        // Execute Forward Step Action with Telemetry Span
        const output = await tracer.traceAsync(
          `saga:step:${step.name}`,
          'SAGA',
          () => step.execute(context),
          { sagaId: saga.id, stepIndex: i, sagaType }
        );
        const stepDuration = Date.now() - stepStart;

        // Record Step Success
        await prisma.sagaStepLog.update({
          where: { sagaId_stepIndex: { sagaId: saga.id, stepIndex: i } },
          data: {
            status: "SUCCESS",
            output: output ? JSON.parse(JSON.stringify(output)) : undefined,
            durationMs: stepDuration,
          },
        });

        executedSteps.push({ step, index: i });
      }

      // All Steps Succeeded!
      const totalDuration = Date.now() - startTime;
      const completed = await prisma.sagaInstance.update({
        where: { id: saga.id },
        data: {
          status: "COMPLETED",
          durationMs: totalDuration,
          completedAt: new Date(),
        },
        include: { steps: { orderBy: { stepIndex: "asc" } } },
      });

      this.broadcastSagaUpdate(saga.id, "COMPLETED", this.steps.length, "All saga steps completed successfully.");

      return {
        sagaId: completed.id,
        idempotencyKey: completed.idempotencyKey,
        status: "COMPLETED",
        currentStep: this.steps.length,
        totalSteps: this.steps.length,
        durationMs: totalDuration,
        context,
        stepLogs: completed.steps.map((s) => ({
          stepIndex: s.stepIndex,
          stepName: s.stepName,
          status: s.status,
          durationMs: s.durationMs || 0,
        })),
      };
    } catch (stepError: any) {
      // 💥 4. Forward Failure -> Initiate Backward Compensation Loop
      const failedStepIndex = executedSteps.length;
      const errorMessage = stepError?.message || "Unknown error during forward execution";

      console.error(
        `🚨 [SAGA FAILURE] Step ${failedStepIndex + 1} (${this.steps[failedStepIndex]?.name || "Unknown"}) failed: ${errorMessage}`
      );

      // Record Failed Step in log
      if (failedStepIndex < this.steps.length) {
        await prisma.sagaStepLog.update({
          where: { sagaId_stepIndex: { sagaId: saga.id, stepIndex: failedStepIndex } },
          data: {
            status: "FAILED",
            error: errorMessage,
            durationMs: Date.now() - startTime,
          },
        });
      }

      // Mark Saga as COMPENSATING
      await prisma.sagaInstance.update({
        where: { id: saga.id },
        data: {
          status: "COMPENSATING",
          error: errorMessage,
        },
      });

      this.broadcastSagaUpdate(
        saga.id,
        "COMPENSATING",
        failedStepIndex,
        `Step "${this.steps[failedStepIndex]?.name}" failed. Commencing compensation rollback.`
      );

      // Execute Backward Compensation in REVERSE order
      const reversedSteps = [...executedSteps].reverse();
      let compensationFailed = false;

      for (const item of reversedSteps) {
        const compStart = Date.now();
        try {
          await prisma.sagaStepLog.update({
            where: { sagaId_stepIndex: { sagaId: saga.id, stepIndex: item.index } },
            data: { status: "COMPENSATING" },
          });

          this.broadcastSagaUpdate(
            saga.id,
            "COMPENSATING",
            item.index + 1,
            `Compensating step: ${item.step.name}`
          );

          // Run compensation handler with Telemetry Span
          await tracer.traceAsync(
            `saga:compensate:${item.step.name}`,
            'SAGA',
            () => item.step.compensate(context, stepError),
            { sagaId: saga.id, stepIndex: item.index }
          );

          await prisma.sagaStepLog.update({
            where: { sagaId_stepIndex: { sagaId: saga.id, stepIndex: item.index } },
            data: {
              status: "COMPENSATED",
              compensatedAt: new Date(),
              durationMs: Date.now() - compStart,
            },
          });
        } catch (compError: any) {
          console.error(
            `💥 [CRITICAL COMPENSATION ERROR] Failed to compensate step "${item.step.name}":`,
            compError
          );
          compensationFailed = true;
          await prisma.sagaStepLog.update({
            where: { sagaId_stepIndex: { sagaId: saga.id, stepIndex: item.index } },
            data: {
              status: "FAILED",
              error: `Compensation failed: ${compError?.message || "Unknown error"}`,
            },
          });
        }
      }

      const finalStatus = compensationFailed ? "FAILED" : "COMPENSATED";
      const totalDuration = Date.now() - startTime;

      const finalSaga = await prisma.sagaInstance.update({
        where: { id: saga.id },
        data: {
          status: finalStatus,
          durationMs: totalDuration,
          completedAt: new Date(),
        },
        include: { steps: { orderBy: { stepIndex: "asc" } } },
      });

      this.broadcastSagaUpdate(
        saga.id,
        finalStatus,
        failedStepIndex,
        compensationFailed
          ? "CRITICAL: Compensation encountered errors! Manual intervention required."
          : "Compensation completed successfully. All distributed changes rolled back."
      );

      return {
        sagaId: finalSaga.id,
        idempotencyKey: finalSaga.idempotencyKey,
        status: finalStatus,
        currentStep: failedStepIndex,
        totalSteps: this.steps.length,
        durationMs: totalDuration,
        context,
        error: errorMessage,
        stepLogs: finalSaga.steps.map((s) => ({
          stepIndex: s.stepIndex,
          stepName: s.stepName,
          status: s.status,
          durationMs: s.durationMs || 0,
          error: s.error || undefined,
        })),
      };
    }
  }

  private broadcastSagaUpdate(
    sagaId: string,
    status: string,
    step: number,
    message: string
  ) {
    broadcastPlatformEvent("saga:telemetry:stream", {
      sagaId,
      sagaType: this.options.sagaType,
      idempotencyKey: this.options.idempotencyKey,
      userId: this.options.userId,
      status,
      currentStep: step,
      totalSteps: this.steps.length,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

