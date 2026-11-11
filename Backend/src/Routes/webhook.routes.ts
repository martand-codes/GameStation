import { Router } from "express";
import * as webhookController from "../Controllers/webhook.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";

const router = Router();

// Apply auth middleware to all webhook endpoints
router.use(requireToken as any);

// Subscription Management
router.post("/subscriptions", webhookController.createSubscription);
router.get("/subscriptions", webhookController.getSubscriptions);
router.delete("/subscriptions/:id", webhookController.deleteSubscription);
router.post("/subscriptions/:id/test", webhookController.sendTestPing);

// Delivery Logs & Dead-Letter Queue (DLQ)
router.get("/deliveries", webhookController.getDeliveries);
router.post("/deliveries/:id/replay", webhookController.replayDelivery);

export default router;

