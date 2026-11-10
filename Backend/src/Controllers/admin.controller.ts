import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import * as adminService from "../Services/admin.service.js";

export const getPendingGames = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const games = await adminService.getPendingGames();
    res.status(200).json(games);
  } catch (error) {
    next(error);
  }
};

export const approveGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const reviewerId = req.user?.userId;
    const game = await adminService.approveGame(gameId, reviewerId);
    res.status(200).json({ success: true, message: "Game approved and certified for storefront", game });
  } catch (error) {
    next(error);
  }
};

export const rejectGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const reviewerId = req.user?.userId;
    const { reason } = req.body;
    const game = await adminService.rejectGame(gameId, reviewerId, reason);
    res.status(200).json({ success: true, message: "Game certification rejected", game });
  } catch (error) {
    next(error);
  }
};
