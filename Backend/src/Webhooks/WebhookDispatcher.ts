import { prisma } from "../prisma/db.js";
import { HMACSigner } from "./HMACSigner.js";
import { tracer } from "../Telemetry/Tracer.js";
import type { WebhookSupportedEvent, WebhookPayload, WebhookDispatchResult } from "./types.js";
import crypto from "node:crypto";

export class WebhookDispatcher {
    private static instance: WebhookDispatcher;
    private static readonly MAX_ATTEMPTS = 5;
    private static readonly TIMEOUT_MS = 5000;

    private constructor() {}

    public static getInstance(): WebhookDispatcher {
        if (!WebhookDispatcher.instance) {
            WebhookDispatcher.instance = new WebhookDispatcher();
        }
        return WebhookDispatcher.instance;
    }

    /**
     * Dispatch an event to all matching active studio webhook subscriptions
     * Decoupled & Non-blocking: Enqueues and triggers in background.
     */
    public async dispatch<T extends Record<string, any>>(
        event: WebhookSupportedEvent,
        data: T,
        developerId?: string
    ): Promise<WebhookDispatchResult> {
        // 1. Build immutable event envelope
        const eventId = crypto.randomUUID();
        const payload: WebhookPayload<T> = {
            id: eventId,
            event,
            createdAt: new Date().toISOString(),
            data
        };

        // 2. Query matching active subscriptions
        const whereClause: any = {
            isActive: true,
            events: { has: event }
        };

        if (developerId) {
            whereClause.developerId = developerId;
        }

        const subscriptions = await prisma.webhookSubscription.findMany({
            where: whereClause
        });

        if (subscriptions.length === 0) {
            return { queuedCount: 0, subscriptions: [] };
        }

        const queuedIds: string[] = [];

        // 3. Create Delivery Logs in database
        for (const sub of subscriptions) {
            const deliveryLog = await prisma.webhookDeliveryLog.create({
                data: {
                    subscriptionId: sub.id,
                    event,
                    payload: payload as any,
                    attempt: 1,
                    maxAttempts: WebhookDispatcher.MAX_ATTEMPTS,
                    status: "PENDING"
                }
            });

            queuedIds.push(deliveryLog.id);

            // 4. Fire asynchronous worker (non-blocking, detached promise)
            setImmediate(() => {
                this.executeDelivery(deliveryLog.id, sub.url, sub.secret, payload, 1).catch(err => {
                    console.error(`[WEBHOOK WORKER ERROR] Delivery ${deliveryLog.id} crashed:`, err);
                });
            });
        }

        return {
            queuedCount: queuedIds.length,
            subscriptions: subscriptions.map(s => s.id)
        };
    }

    /**
     * Execute an individual delivery attempt with HMAC signature and exponential backoff
     */
    public async executeDelivery(
        logId: string,
        url: string,
        secret: string,
        payload: WebhookPayload,
        attempt: number
    ): Promise<void> {
        const rawBody = JSON.stringify(payload);
        const timestamp = Date.now();
        const signatureHeader = HMACSigner.sign(rawBody, secret, timestamp);

        const startTime = Date.now();
        let statusCode: number | null = null;
        let responseBody: string | null = null;
        let errorDetails: string | null = null;
        let isSuccess = false;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), WebhookDispatcher.TIMEOUT_MS);

        try {
            await tracer.traceAsync(`webhook:send:${payload.event}`, 'HTTP', async () => {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "GameStation-Webhook-Dispatcher/1.0",
                        "X-GameStation-Event": payload.event,
                        "X-GameStation-Timestamp": String(timestamp),
                        "X-GameStation-Signature": signatureHeader
                    },
                    body: rawBody,
                    signal: controller.signal
                });

                statusCode = response.status;
                const text = await response.text();
                responseBody = text.slice(0, 1000); // Truncate response to prevent DB bloat

                if (response.ok) {
                    isSuccess = true;
                } else {
                    errorDetails = `HTTP ${statusCode}: ${response.statusText}`;
                }
            }, { webhookLogId: logId, attempt, targetUrl: url });
        } catch (err: any) {
            errorDetails = err.name === "AbortError" ? "Delivery timed out after 5000ms" : err.message || "Network error";
        } finally {
            clearTimeout(timeout);
        }

        const durationMs = Date.now() - startTime;

        if (isSuccess) {
            // ✅ Successful Delivery
            await prisma.webhookDeliveryLog.update({
                where: { id: logId },
                data: {
                    status: "SUCCESS",
                    statusCode,
                    responseBody,
                    durationMs,
                    error: null,
                    nextRetryAt: null
                }
            });
            console.log(`[WEBHOOK SUCCESS] Delivered "${payload.event}" to ${url} (${durationMs}ms)`);
            return;
        }

        // ❌ Delivery Failed -> Handle Retry or Dead-Letter Queue (DLQ)
        if (attempt < WebhookDispatcher.MAX_ATTEMPTS) {
            // Exponential Backoff with Full Jitter: min(120s, base * 2^attempt + jitter)
            const baseMs = 1500;
            const expMs = Math.min(120_000, baseMs * Math.pow(2, attempt));
            const jitterMs = Math.floor(Math.random() * 1000);
            const delayMs = expMs + jitterMs;
            const nextRetryAt = new Date(Date.now() + delayMs);

            await prisma.webhookDeliveryLog.update({
                where: { id: logId },
                data: {
                    status: "RETRYING",
                    attempt: attempt + 1,
                    statusCode,
                    responseBody,
                    durationMs,
                    error: errorDetails,
                    nextRetryAt
                }
            });

            console.warn(
                `[WEBHOOK RETRYING] Attempt ${attempt} failed for ${url}: ${errorDetails}. Retrying in ${Math.round(delayMs / 1000)}s`
            );

            // Schedule next attempt
            setTimeout(() => {
                this.executeDelivery(logId, url, secret, payload, attempt + 1).catch(console.error);
            }, delayMs).unref();
        } else {
            // 💥 Exhausted Retries -> Push to Dead-Letter Queue (DLQ)
            await prisma.webhookDeliveryLog.update({
                where: { id: logId },
                data: {
                    status: "FAILED_DLQ",
                    statusCode,
                    responseBody,
                    durationMs,
                    error: `Dead-Letter Queue: ${errorDetails} (Exhausted all ${WebhookDispatcher.MAX_ATTEMPTS} attempts)`,
                    nextRetryAt: null
                }
            });

            console.error(`🚨 [WEBHOOK DLQ] Delivery ${logId} moved to Dead-Letter Queue after 5 failed attempts.`);
        }
    }

    /**
     * Manual replay from Dead-Letter Queue (DLQ)
     */
    public async replay(logId: string): Promise<boolean> {
        const log = await prisma.webhookDeliveryLog.findUnique({
            where: { id: logId },
            include: { subscription: true }
        });

        if (!log || !log.subscription) {
            return false;
        }

        // Reset log to PENDING
        await prisma.webhookDeliveryLog.update({
            where: { id: logId },
            data: {
                status: "PENDING",
                attempt: 1,
                error: null,
                nextRetryAt: null
            }
        });

        // Trigger delivery
        setImmediate(() => {
            this.executeDelivery(
                log.id,
                log.subscription.url,
                log.subscription.secret,
                log.payload as any,
                1
            ).catch(console.error);
        });

        return true;
    }
}

export const webhookDispatcher = WebhookDispatcher.getInstance();

