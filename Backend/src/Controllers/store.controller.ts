import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all PUBLISHED games for the storefront
export const getStoreGames = async (_req: Request, res: Response): Promise<void> => {
  try {
    const games = await prisma.game.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        pricing: true,
        media: true,
        reviews: {
          select: {
            overallRating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    const gamesWithRatings = games.map((game) => {
      const reviewCount = game.reviews?.length || 0;
      const averageRating =
        reviewCount > 0
          ? Number(
              (
                game.reviews.reduce((acc, r) => acc + r.overallRating, 0) /
                reviewCount
              ).toFixed(1)
            )
          : null;

      const { reviews, ...gameData } = game;
      return {
        ...gameData,
        rating: averageRating,
        reviewCount,
      };
    });

    res.status(200).json({
      success: true,
      data: gamesWithRatings,
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
    if (!id || typeof id !== "string") {
      res.status(400).json({ success: false, message: "Invalid game ID" });
      return;
    }

    const authReq = req as any;
    const user = authReq.user;

    const whereClause: any = { id };
    // If not admin or owner, allow published titles OR the developer's own draft/pending titles
    if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
      if (user?.userId) {
        whereClause.OR = [
          { status: "PUBLISHED" },
          { developerId: user.userId },
        ];
      } else {
        whereClause.status = "PUBLISHED";
      }
    }

    const game = await prisma.game.findFirst({
      where: whereClause,
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
        },
        reviews: {
          select: {
            overallRating: true,
          },
        },
      },
    });

    if (!game) {
      res.status(404).json({ success: false, message: "Game not found" });
      return;
    }

    const reviewCount = game.reviews?.length || 0;
    const averageRating =
      reviewCount > 0
        ? Number(
            (
              game.reviews.reduce((acc, r) => acc + r.overallRating, 0) /
              reviewCount
            ).toFixed(1)
          )
        : null;

    let sentiment = "NO REVIEWS";
    if (reviewCount > 0 && averageRating) {
      if (averageRating >= 4.5) sentiment = "Overwhelmingly Positive";
      else if (averageRating >= 4.0) sentiment = "Very Positive";
      else if (averageRating >= 3.0) sentiment = "Mixed";
      else sentiment = "Mostly Negative";
    }

    const { reviews, ...gameData } = game;
    res.status(200).json({
      success: true,
      data: {
        ...gameData,
        rating: averageRating,
        reviewCount,
        reviewSentiment: sentiment,
      },
    });
  } catch (error) {
    console.error("Store Game fetch error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
