import type { Response } from "express";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import { prisma } from "../prisma/db.js";
import { createGamePurchaseSaga } from "../Saga/Definitions/GamePurchaseSaga.js";
import { BadRequestError, NotFoundError } from "../Utils/errors.js";
import crypto from "crypto";

/**
 * POST /api/saga/purchase
 * Executes a resilient, idempotent Game Purchase Saga with compensation rollback guarantees.
 */
export const executePurchaseSaga = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { gameId, pricingId, chaosFailStep } = req.body;
    if (!gameId) {
      res.status(400).json({ success: false, message: "Game ID is required." });
      return;
    }

    // 1. Idempotency Key extraction or generation
    const headerKey = req.headers["idempotency-key"] as string | undefined;
    const bodyKey = req.body?.idempotencyKey as string | undefined;
    const idempotencyKey = headerKey || bodyKey || `saga-checkout-${userId}-${gameId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    // 2. Instantiate and execute the Saga
    const saga = createGamePurchaseSaga({
      sagaType: "GAME_PURCHASE",
      idempotencyKey,
      userId,
      chaosFailStep: typeof chaosFailStep === "string" ? chaosFailStep : undefined,
    });

    const result = await saga.execute({
      userId,
      gameId,
      pricingId,
    });

    if (result.status === "COMPLETED") {
      res.status(200).json({
        success: true,
        message: `Successfully purchased "${result.context.gameTitle}"!`,
        saga: {
          id: result.sagaId,
          status: result.status,
          durationMs: result.durationMs,
          totalSteps: result.totalSteps,
          gameTitle: result.context.gameTitle,
          editionName: result.context.editionName,
          cost: result.context.cost,
          remainingBalance: result.context.newBalance,
          stepLogs: result.stepLogs,
        },
      });
      return;
    }

    if (result.status === "COMPENSATED") {
      res.status(400).json({
        success: false,
        message: `Checkout failed: ${result.error || "A step failed"}. All changes were safely rolled back and your wallet balance was restored.`,
        saga: {
          id: result.sagaId,
          status: result.status,
          durationMs: result.durationMs,
          error: result.error,
          stepLogs: result.stepLogs,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: `Critical Saga failure: ${result.error}`,
      saga: {
        id: result.sagaId,
        status: result.status,
        durationMs: result.durationMs,
        error: result.error,
        stepLogs: result.stepLogs,
      },
    });
  } catch (error: any) {
    console.error("Execute Purchase Saga error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to execute purchase saga",
    });
  }
};

/**
 * GET /api/saga/history
 * Returns saga execution history. Players see their own; Admins & Owner see platform-wide.
 */
export const getSagaHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { status, sagaType, limit = "20" } = req.query;
    const take = Math.min(Math.max(parseInt(limit as string) || 20, 1), 100);

    const where: any = {};
    if (userRole !== "OWNER" && userRole !== "ADMIN") {
      where.userId = userId;
    } else if (req.query.userId) {
      where.userId = String(req.query.userId);
    }

    if (status && typeof status === "string") {
      where.status = status;
    }
    if (sagaType && typeof sagaType === "string") {
      where.sagaType = sagaType;
    }

    const sagas = await prisma.sagaInstance.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { id: true, username: true, role: true } },
        steps: { orderBy: { stepIndex: "asc" } },
      },
    });

    res.status(200).json({
      success: true,
      count: sagas.length,
      data: sagas,
    });
  } catch (error: any) {
    console.error("Get Saga History error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve saga history" });
  }
};

/**
 * GET /api/saga/:sagaId
 * Returns detailed trace & execution timeline for a single saga.
 */
export const getSagaDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const sagaId = String(req.params.sagaId);

    if (!sagaId) {
      res.status(400).json({ success: false, message: "Saga ID required" });
      return;
    }

    const saga = await prisma.sagaInstance.findUnique({
      where: { id: sagaId },
      include: {
        user: { select: { id: true, username: true, role: true } },
        steps: { orderBy: { stepIndex: "asc" } },
      },
    });

    if (!saga) {
      throw new NotFoundError("Saga instance not found.");
    }

    // Authorization check: only owner of saga or ADMIN/OWNER can view
    if (saga.userId !== userId && userRole !== "OWNER" && userRole !== "ADMIN") {
      res.status(403).json({ success: false, message: "Access forbidden" });
      return;
    }

    res.status(200).json({
      success: true,
      data: saga,
    });
  } catch (error: any) {
    console.error("Get Saga Details error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve saga details",
    });
  }
};

