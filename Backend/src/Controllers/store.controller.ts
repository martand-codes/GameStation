import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all PUBLISHED games for the storefront
export const getStoreGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const games = await prisma.game.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        pricing: true,
        media: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error("Store Games fetch error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch a single game for the Storefront Game Details page
export const getStoreGameById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findFirst({
      where: {
        id: id,
        status: "PUBLISHED", // Only allow players to see published games
      },
      include: {
        pricing: true,
        media: true,
        telemetry: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        developer: {
          select: { username: true }
        }
      },
    });

    if (!game) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error("Store Game fetch error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
