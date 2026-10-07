import type { Request, Response, NextFunction } from "express";
import * as gameService from "../Services/game.service.js";
import { createGameSchema, updateGameSchema, pricingSchema, discountSchema, mediaSchema, versionSchema } from "../Utils/game.validator.js";

// Types
interface AuthRequest extends Request {
  user?: any;
}

export const createGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createGameSchema.parse(req.body);
    const game = await gameService.createGame(req.user!.userId, validatedData);
    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
};

export const getGames = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const games = await gameService.getDeveloperGames(req.user!.userId);
    res.status(200).json(games);
  } catch (error) {
    next(error);
  }
};

export const getGameById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.getGameById(req.params.id as string, req.user!.userId);
    res.status(200).json(game);
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateGameSchema.parse(req.body);
    const game = await gameService.updateGame(req.params.id as string, req.user!.userId, validatedData);
    res.status(200).json(game);
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await gameService.deleteGame(req.params.id as string, req.user!.userId);
    res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const submitGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.submitGame(req.params.id as string, req.user!.userId);
    res.status(200).json({ message: "Game submitted for review", game });
  } catch (error) {
    next(error);
  }
};

// Modular Updates

export const updatePricing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = pricingSchema.parse(req.body);
    const pricing = await gameService.updateGamePricing(req.params.id as string, req.user!.userId, validatedData);
    res.status(200).json(pricing);
  } catch (error) {
    next(error);
  }
};

export const addDiscount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = discountSchema.parse(req.body);
    const discount = await gameService.addGameDiscount(req.params.id as string, req.user!.userId, validatedData);
    res.status(201).json(discount);
  } catch (error) {
    next(error);
  }
};

export const updateMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = mediaSchema.parse(req.body);
    const media = await gameService.updateGameMedia(req.params.id as string, req.user!.userId, validatedData);
    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
};

export const addVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = versionSchema.parse(req.body);
    const version = await gameService.addGameVersion(req.params.id as string, req.user!.userId, validatedData);
    res.status(201).json(version);
  } catch (error) {
    next(error);
  }
};
