import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import * as reviewService from "../Services/review.service.js";

export const submitReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const review = await reviewService.submitReview(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Verified review published successfully.",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getGameReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.gameId;
    const currentUserId = (req as AuthRequest).user?.userId;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "helpful";
    const data = await reviewService.getGameReviews(gameId, currentUserId, sortBy);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const voteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const reviewId = req.params.reviewId;
    const isHelpful = req.body.isHelpful === true;
    const result = await reviewService.voteReview(userId, reviewId, isHelpful);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const reviewId = req.params.reviewId;
    const result = await reviewService.deleteReview(userId, userRole, reviewId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getStudioReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const studioId = typeof req.query.studioId === "string" ? req.query.studioId : undefined;
    const gameId = typeof req.query.gameId === "string" ? req.query.gameId : undefined;
    const data = await reviewService.getStudioReviews(userId, userRole, studioId, gameId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const reviewId = req.params.reviewId;
    const responseText = req.body.response;
    const updated = await reviewService.replyToReview(userId, userRole, reviewId, responseText);
    res.status(200).json({
      success: true,
      message: "Official developer response published.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReply = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const reviewId = req.params.reviewId;
    const updated = await reviewService.deleteReply(userId, userRole, reviewId);
    res.status(200).json({
      success: true,
      message: "Official developer response removed.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

