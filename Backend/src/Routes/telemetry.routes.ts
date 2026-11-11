import { Router } from "express";
import * as telemetryController from "../Controllers/telemetry.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";

const router = Router();

// Distributed Tracing & APM Endpoints (W3C OpenTelemetry compliant)
router.get("/traces", requireToken as any, telemetryController.getTraces);
router.get("/traces/:traceId", requireToken as any, telemetryController.getTraceById);
router.get("/metrics", requireToken as any, telemetryController.getMetrics);

// Legacy Gameplay playtime sync
router.post("/playtime", requireToken as any, telemetryController.recordPlaytime);

export default router;
