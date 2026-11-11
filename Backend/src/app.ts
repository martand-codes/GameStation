import express from "express";
import authRoutes from "./Routes/auth.routes.js";
import type { Request, Response } from "express";
import { requireToken, type AuthRequest} from "./Middlewares/bouncer.middleware.js";
import cors from "cors";
import { traceMiddleware } from "./Telemetry/traceMiddleware.js";
import { createRateLimiter } from "./RateLimiter/rateLimitMiddleware.js";
import { RATE_LIMIT_POLICIES } from "./RateLimiter/policies.js";
const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    credentials: true,
    exposedHeaders: ["traceparent", "X-Trace-Id"]
}));

// Automatic W3C Distributed Tracing Middleware (Must run before routes)
app.use(traceMiddleware);

// Stripe Webhook needs the raw payload for signature verification (MUST be before express.json())
import { handleStripeWebhook } from "./Controllers/payment.controller.js";
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());

// Global Platform Rate Limiter: 120 req / min
app.use("/api", createRateLimiter(RATE_LIMIT_POLICIES.GLOBAL));

// Tiered Protection: Auth (5 req/min), Search (60 req/min), Saga (10 req/min)
app.use("/api/auth", createRateLimiter(RATE_LIMIT_POLICIES.AUTH), authRoutes);
import gameRoutes from "./Routes/game.routes.js";
app.use("/api/developer/games", gameRoutes);

import storeRoutes from "./Routes/store.routes.js";
app.use("/api/store", storeRoutes);

import adminRoutes from "./Routes/admin.routes.js";
app.use("/api/admin", adminRoutes);

import governanceRoutes from "./Routes/governance.routes.js";
app.use("/api/governance", governanceRoutes);

import paymentRoutes from "./Routes/payment.routes.js";
app.use("/api/payments", paymentRoutes);

import walletRoutes from "./Routes/wallet.routes.js";
app.use("/api/wallet", walletRoutes);

import telemetryRoutes from "./Routes/telemetry.routes.js";
app.use("/api/telemetry", telemetryRoutes);

import reviewRoutes from "./Routes/review.routes.js";
app.use("/api/reviews", reviewRoutes);

import friendRoutes from "./Routes/friend.routes.js";
app.use("/api/friends", friendRoutes);

import sagaRoutes from "./Routes/saga.routes.js";
app.use("/api/saga", createRateLimiter(RATE_LIMIT_POLICIES.SAGA), sagaRoutes);

import searchRoutes from "./Routes/search.routes.js";
app.use("/api/search", createRateLimiter(RATE_LIMIT_POLICIES.SEARCH), searchRoutes);

import webhookRoutes from "./Routes/webhook.routes.js";
app.use("/api/webhooks", webhookRoutes);

app.get("/", (_req: Request, res: Response) => {
    res.status(200).send("Health Route working!");
});

app.get("/bouncer", requireToken, (req: AuthRequest, res: Response,) => {
    res.status(200).json({
        sucess: true,
        message: "boucer Bouncing!",
        userId: req.user?.userId
    });
});

export default app;