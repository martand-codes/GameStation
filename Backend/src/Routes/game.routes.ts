import { Router } from "express";
import * as gameController from "../Controllers/game.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import { requireRole } from "../Middlewares/role.middleware.js";

const router = Router();

// Apply auth and role middleware to all developer routes
router.use(requireToken);
router.use(requireRole(["DEVELOPER"]));

// Core Game Routes
router.post("/", gameController.createGame);
router.get("/", gameController.getGames);
router.get("/:id", gameController.getGameById);
router.patch("/:id", gameController.updateGame);
router.delete("/:id", gameController.deleteGame);

// Modular Config Updates
router.put("/:id/pricing", gameController.updatePricing);
router.post("/:id/discounts", gameController.addDiscount);
router.put("/:id/media", gameController.updateMedia);
router.post("/:id/versions", gameController.addVersion);

// Submission Workflow
router.post("/:id/submit", gameController.submitGame);

export default router;
