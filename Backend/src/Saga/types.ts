import type { SagaStatus, SagaStepStatus } from "@prisma/client";

export interface SagaStep<TContext> {
  name: string;
  execute: (context: TContext) => Promise<any>;
  compensate: (context: TContext, error?: any) => Promise<void>;
}

export interface SagaOptions {
  sagaType: string;
  idempotencyKey: string;
  userId?: string;
  chaosFailStep?: string; // Step name to purposefully simulate a failure on for testing
}

export interface SagaExecutionResult<TContext> {
  sagaId: string;
  idempotencyKey: string;
  status: SagaStatus;
  currentStep: number;
  totalSteps: number;
  durationMs: number;
  context: TContext;
  error?: string;
  stepLogs: {
    stepIndex: number;
    stepName: string;
    status: SagaStepStatus;
    durationMs?: number;
    error?: string;
  }[];
}

