import type { Response } from "express";
import { prisma } from "../prisma/db.js";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";

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

    // Cap single increment to 24 hours to prevent crazy abuse/overflow
    const safeIncrement = Math.min(Math.floor(secondsToAdd), 86400);

    // Verify ownership in library
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
      message: "Playtime recorded successfully",
      data: {
        gameId,
        totalPlayTime: updated.playTime,
        lastPlayed: updated.lastPlayed,
      },
    });
  } catch (error) {
    console.error("Telemetry recordPlaytime error:", error);
    res.status(500).json({ success: false, message: "Failed to record playtime" });
  }
};
