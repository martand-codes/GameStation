import type { Request, Response, NextFunction } from "express";
import * as adminService from "../Services/admin.service.js";

export const getPendingGames = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await adminService.getPendingGames();
    res.status(200).json(games);
  } catch (error) {
    next(error);
  }
};

export const approveGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const game = await adminService.approveGame(gameId);
    res.status(200).json({ success: true, message: "Game approved and published", game });
  } catch (error) {
    next(error);
  }
};

export const rejectGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const game = await adminService.rejectGame(gameId);
    res.status(200).json({ success: true, message: "Game rejected", game });
  } catch (error) {
    next(error);
  }
};
