import type { Request, Response, NextFunction } from "express";
import { rateLimiter } from "./SlidingWindowLog.js";
import type { RateLimitPolicy } from "./types.js";
import { tracer } from "../Telemetry/Tracer.js";

/**
 * Express Middleware Factory for Sliding Window Rate Limiting (RFC 6585)
 */
export const createRateLimiter = (policy: RateLimitPolicy) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // 1. Resolve client key: prioritize verified userId over IP
        const authUser = (req as any).user;
        let clientKey: string;

        if (authUser && authUser.userId) {
            clientKey = `user:${authUser.userId}`;
        } else {
            const rawIp = req.header("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "127.0.0.1";
            clientKey = `ip:${rawIp}`;
        }

        // 2. Consume token under sliding window log algorithm
        const result = rateLimiter.consume(clientKey, policy);

        // 3. Inject RFC 6585 standard headers
        res.setHeader("X-RateLimit-Limit", result.limit);
        res.setHeader("X-RateLimit-Remaining", result.remaining);
        res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

        // 4. Handle Throttled Request
        if (!result.allowed) {
            const retryAfter = result.retryAfterSeconds || 1;
            res.setHeader("Retry-After", retryAfter);

            // Tag active telemetry trace with rate-limit event
            tracer.setTag("rateLimited", true);
            tracer.setTag("rateLimitTier", policy.tierName);
            tracer.setTag("clientKey", clientKey);

            res.status(429).json({
                success: false,
                error: "RATE_LIMIT_EXCEEDED",
                message: `Too many requests. You have exceeded the ${policy.tierName} quota. Please wait ${retryAfter} second(s) before retrying.`,
                retryAfter,
                tier: policy.tierName
            });
            return;
        }

        next();
    };
};

