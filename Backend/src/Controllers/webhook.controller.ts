import type { Response } from "express";
import { prisma } from "../prisma/db.js";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import { HMACSigner } from "../Webhooks/HMACSigner.js";
import { webhookDispatcher } from "../Webhooks/WebhookDispatcher.js";

/**
 * Register a new studio webhook endpoint
 * POST /api/webhooks/subscriptions
 */
export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || (role !== "DEVELOPER" && role !== "OWNER")) {
            res.status(403).json({ success: false, message: "Forbidden: Developer clearance required." });
            return;
        }

        const { url, events, description } = req.body;

        if (!url || typeof url !== "string" || !url.startsWith("http")) {
            res.status(400).json({ success: false, message: "Valid HTTP/HTTPS webhook target URL is required." });
            return;
        }

        if (!events || !Array.isArray(events) || events.length === 0) {
            res.status(400).json({ success: false, message: "At least one subscribed event must be selected." });
            return;
        }

        // Generate cryptographic secret
        const secret = HMACSigner.generateSecret();

        const subscription = await prisma.webhookSubscription.create({
            data: {
                developerId: userId,
                url,
                secret,
                events,
                description: description || null
            }
        });

        res.status(201).json({
            success: true,
            message: "Webhook subscription registered successfully.",
            subscription
        });
    } catch (err: any) {
        console.error("[Webhook Controller] createSubscription error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to register webhook." });
    }
};

/**
 * List studio webhook endpoints
 * GET /api/webhooks/subscriptions
 */
export const getSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }

        const whereClause: any = {};
        if (role !== "OWNER") {
            whereClause.developerId = userId;
        }

        const subscriptions = await prisma.webhookSubscription.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { deliveries: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({
            success: true,
            subscriptions
        });
    } catch (err: any) {
        console.error("[Webhook Controller] getSubscriptions error:", err);
        res.status(500).json({ success: false, message: "Failed to list subscriptions." });
    }
};

/**
 * Delete a webhook subscription
 * DELETE /api/webhooks/subscriptions/:id
 */
export const deleteSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { id } = req.params;

        const existing = await prisma.webhookSubscription.findUnique({
            where: { id }
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Webhook subscription not found." });
            return;
        }

        if (role !== "OWNER" && existing.developerId !== userId) {
            res.status(403).json({ success: false, message: "Forbidden: Not authorized to delete this webhook." });
            return;
        }

        await prisma.webhookSubscription.delete({ where: { id } });

        res.status(200).json({ success: true, message: "Webhook subscription deleted successfully." });
    } catch (err: any) {
        console.error("[Webhook Controller] deleteSubscription error:", err);
        res.status(500).json({ success: false, message: "Failed to delete subscription." });
    }
};

/**
 * Send a test ping webhook
 * POST /api/webhooks/subscriptions/:id/test
 */
export const sendTestPing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { id } = req.params;

        const sub = await prisma.webhookSubscription.findUnique({ where: { id } });
        if (!sub) {
            res.status(404).json({ success: false, message: "Subscription not found." });
            return;
        }

        if (role !== "OWNER" && sub.developerId !== userId) {
            res.status(403).json({ success: false, message: "Forbidden." });
            return;
        }

        const dispatchResult = await webhookDispatcher.dispatch(
            "game.certified",
            {
                ping: true,
                message: "Test webhook verification ping from GameStation Developer Engine.",
                timestamp: new Date().toISOString()
            },
            sub.developerId
        );

        res.status(200).json({
            success: true,
            message: "Test webhook ping enqueued.",
            dispatchResult
        });
    } catch (err: any) {
        console.error("[Webhook Controller] sendTestPing error:", err);
        res.status(500).json({ success: false, message: "Failed to trigger test ping." });
    }
};

/**
 * List delivery logs & Dead-Letter Queue (DLQ)
 * GET /api/webhooks/deliveries
 */
export const getDeliveries = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { status, limit = "40" } = req.query;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }

        const whereClause: any = {};
        if (role !== "OWNER") {
            whereClause.subscription = { developerId: userId };
        }

        if (status && typeof status === "string" && status !== "ALL") {
            whereClause.status = status;
        }

        const deliveries = await prisma.webhookDeliveryLog.findMany({
            where: whereClause,
            include: {
                subscription: {
                    select: {
                        id: true,
                        url: true,
                        description: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: Math.min(Number(limit) || 40, 100)
        });

        // Count DLQ items
        const dlqCount = await prisma.webhookDeliveryLog.count({
            where: {
                ...(role !== "OWNER" ? { subscription: { developerId: userId } } : {}),
                status: "FAILED_DLQ"
            }
        });

        res.status(200).json({
            success: true,
            total: deliveries.length,
            dlqCount,
            deliveries
        });
    } catch (err: any) {
        console.error("[Webhook Controller] getDeliveries error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch deliveries." });
    }
};

/**
 * Replay a failed event from Dead-Letter Queue (DLQ)
 * POST /api/webhooks/deliveries/:id/replay
 */
export const replayDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { id } = req.params;

        const delivery = await prisma.webhookDeliveryLog.findUnique({
            where: { id },
            include: { subscription: true }
        });

        if (!delivery) {
            res.status(404).json({ success: false, message: "Delivery record not found." });
            return;
        }

        if (role !== "OWNER" && delivery.subscription.developerId !== userId) {
            res.status(403).json({ success: false, message: "Forbidden." });
            return;
        }

        const replayed = await webhookDispatcher.replay(id);

        res.status(200).json({
            success: replayed,
            message: replayed ? "Delivery re-enqueued for dispatch." : "Failed to replay delivery."
        });
    } catch (err: any) {
        console.error("[Webhook Controller] replayDelivery error:", err);
        res.status(500).json({ success: false, message: "Failed to replay delivery." });
    }
};

