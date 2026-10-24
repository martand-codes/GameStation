import { Router } from "express";
import * as telemetryController from "../Controllers/telemetry.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";

const router = Router();

// Sync gameplay playtime from launcher
router.post("/playtime", requireToken as any, telemetryController.recordPlaytime);

export default router;
