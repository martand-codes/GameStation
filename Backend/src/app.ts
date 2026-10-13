import express from "express";
import authRoutes from "./Routes/auth.routes.js";
import type { Request, Response } from "express";
import { requireToken, type AuthRequest} from "./Middlewares/bouncer.middleware.js";
import cors from "cors";
const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    credentials: true 
}));

// Stripe Webhook needs the raw payload for signature verification (MUST be before express.json())
import { handleStripeWebhook } from "./Controllers/payment.controller.js";
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());
app.use("/api/auth", authRoutes);
import gameRoutes from "./Routes/game.routes.js";
app.use("/api/developer/games", gameRoutes);

import storeRoutes from "./Routes/store.routes.js";
app.use("/api/store", storeRoutes);

import adminRoutes from "./Routes/admin.routes.js";
app.use("/api/admin", adminRoutes);

import paymentRoutes from "./Routes/payment.routes.js";
app.use("/api/payments", paymentRoutes);

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