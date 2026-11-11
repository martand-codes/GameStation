import { Router } from "express";
import * as reviewController from "../Controllers/review.controller.js";
import { requireToken, optionalToken } from "../Middlewares/bouncer.middleware.js";

const router = Router();

// Public / Personalized listing
router.get("/game/:gameId", optionalToken, reviewController.getGameReviews);

// Developer Portal: Studio Review Telemetry Feed
router.get("/studio/feed", requireToken, reviewController.getStudioReviews);

// Developer Portal: Official Studio Reply
router.post("/:reviewId/response", requireToken, reviewController.replyToReview);
router.delete("/:reviewId/response", requireToken, reviewController.deleteReply);

// Authenticated Review Submission & Upsert
router.post("/", requireToken, reviewController.submitReview);

// Community Utility: Vote Helpful or Unhelpful
router.post("/:reviewId/vote", requireToken, reviewController.voteReview);

// Authenticated Deletion
router.delete("/:reviewId", requireToken, reviewController.deleteReview);

export default router;

