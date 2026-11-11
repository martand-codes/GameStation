import type { Response } from "express";
import { prisma } from "../prisma/db.js";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import { tracer } from "../Telemetry/Tracer.js";
import type { TelemetryFilter } from "../Telemetry/types.js";

/**
 * Helper: Retrieve game IDs owned by a developer for multi-tenant telemetry scoping
 */
async function getStudioGameIds(developerId: string): Promise<string[]> {
  const games = await prisma.game.findMany({
    where: { developerId },
    select: { id: true },
  });
  return games.map((g) => g.id);
}

/**
 * GET /api/telemetry/traces
 * Query filtered traces from the in-memory ring buffer
 * - OWNER: Platform-wide infrastructure access
 * - DEVELOPER: Scoped strictly to traces containing their studio's gameIds
 * - ADMIN / PLAYER: 403 Forbidden (Admins handle moderation; Developers handle their games; Owner handles infra)
 */
export const getTraces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (user.role === "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Forbidden: Staff Admins handle game certification and catalog moderation. System APM and distributed tracing are restricted to the platform Owner.",
      });
      return;
    }

    if (user.role === "PLAYER") {
      res.status(403).json({
        success: false,
        message: "Forbidden: Telemetry traces are restricted to developers and the platform owner.",
      });
      return;
    }

    const {
      status,
      category,
      minDurationMs,
      search,
      route,
      gameId,
      limit = "50",
      offset = "0",
    } = req.query;

    const filter: TelemetryFilter = {
      status: (status as any) || "ALL",
      category: (category as any) || "ALL",
      minDurationMs: minDurationMs ? Number(minDurationMs) : undefined,
      search: search ? String(search) : undefined,
      route: route ? String(route) : undefined,
      gameId: gameId ? String(gameId) : undefined,
      limit: Math.min(Number(limit) || 50, 100),
      offset: Number(offset) || 0,
    };

    // Multi-tenant Scoping: If user is a DEVELOPER, only query traces touching their games
    if (user.role === "DEVELOPER") {
      const studioGameIds = await getStudioGameIds(user.userId);
      filter.studioGameIds = studioGameIds;
    }

    const result = tracer.ringBuffer.query(filter);

    res.status(200).json({
      success: true,
      total: result.total,
      count: result.traces.length,
      limit: filter.limit,
      offset: filter.offset,
      traces: result.traces,
    });
  } catch (error: any) {
    console.error("[Telemetry Controller] getTraces error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve traces" });
  }
};

/**
 * GET /api/telemetry/traces/:traceId
 * Retrieve detailed trace with full span call tree (for Flame Graph rendering)
 */
export const getTraceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (user.role === "ADMIN" || user.role === "PLAYER") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const { traceId } = req.params;
    const trace = tracer.ringBuffer.getById(traceId);

    if (!trace) {
      res.status(404).json({ success: false, message: `Trace with id ${traceId} not found in active buffer.` });
      return;
    }

    // Multi-tenant verification for DEVELOPER role
    if (user.role === "DEVELOPER") {
      const studioGameIds = await getStudioGameIds(user.userId);
      const touchesStudioGame =
        (trace.tags.gameId && studioGameIds.includes(trace.tags.gameId)) ||
        trace.spans.some((s) => s.attributes.gameId && studioGameIds.includes(s.attributes.gameId));

      if (!touchesStudioGame) {
        res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view traces outside your studio's games.",
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      trace,
    });
  } catch (error: any) {
    console.error("[Telemetry Controller] getTraceById error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve trace" });
  }
};

/**
 * GET /api/telemetry/metrics
 * Get P50, P95, P99 latency percentiles, error rates, and category distribution
 */
export const getMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (user.role === "ADMIN" || user.role === "PLAYER") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    let studioGameIds: string[] | undefined;
    if (user.role === "DEVELOPER") {
      studioGameIds = await getStudioGameIds(user.userId);
    }

    const metrics = tracer.ringBuffer.computeMetrics(studioGameIds);

    res.status(200).json({
      success: true,
      role: user.role,
      metrics,
    });
  } catch (error: any) {
    console.error("[Telemetry Controller] getMetrics error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to compute metrics" });
  }
};

/**
 * Record and sync gameplay session time into UserLibrary
 * POST /api/telemetry/playtime
 */
export const recordPlaytime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { gameId, additionalSeconds } = req.body;

    if (!gameId || typeof gameId !== "string") {
      res.status(400).json({ success: false, message: "Valid gameId is required" });
      return;
    }

    const secondsToAdd = Number(additionalSeconds);
    if (isNaN(secondsToAdd) || secondsToAdd <= 0) {
      res.status(400).json({ success: false, message: "additionalSeconds must be a positive number" });
      return;
    }

    const safeIncrement = Math.min(Math.floor(secondsToAdd), 86400);

    const existing = await prisma.userLibrary.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Game not found in user library" });
      return;
    }

    const updated = await prisma.userLibrary.update({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      data: {
        playTime: { increment: safeIncrement },
        lastPlayed: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Playtime updated successfully",
      playtimeHours: Number((updated.playTime / 3600).toFixed(1)),
    });
  } catch (error: any) {
    console.error("[Telemetry Controller] recordPlaytime error:", error);
    res.status(500).json({ success: false, message: "Failed to record playtime" });
  }
};
