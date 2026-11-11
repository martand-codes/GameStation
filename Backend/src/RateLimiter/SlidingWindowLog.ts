import type { RateLimitPolicy, RateLimitResult, AbuseStats, OffenderRecord } from "./types.js";

/**
 * Sliding Window Log Rate Limiter
 * Provides mathematically exact rate limiting with zero boundary-burst vulnerabilities.
 * Memory footprint is strictly bounded via periodic cleanup sweeps.
 */
export class SlidingWindowLog {
    private static instance: SlidingWindowLog;
    // Map of clientKey -> array of timestamp logs (epoch ms)
    private readonly clientLogs: Map<string, number[]> = new Map();
    // Abuse tracking
    private totalBlockedRequests: number = 0;
    private readonly offenders: Map<string, OffenderRecord> = new Map();

    private constructor() {
        // Run background memory garbage collection every 60 seconds
        setInterval(() => this.cleanupExpiredEntries(), 60_000).unref();
    }

    public static getInstance(): SlidingWindowLog {
        if (!SlidingWindowLog.instance) {
            SlidingWindowLog.instance = new SlidingWindowLog();
        }
        return SlidingWindowLog.instance;
    }

    /**
     * Consume a token under the given policy using the Sliding Window Log algorithm
     */
    public consume(clientKey: string, policy: RateLimitPolicy): RateLimitResult {
        const now = Date.now();
        const windowStart = now - policy.windowMs;

        // 1. Get or create log array for this client
        let timestamps = this.clientLogs.get(clientKey);
        if (!timestamps) {
            timestamps = [];
            this.clientLogs.set(clientKey, timestamps);
        }

        // 2. Evict timestamps outside the active sliding window
        // Since timestamps are pushed sequentially, binary search or linear filter is fast
        let validStartIndex = 0;
        while (validStartIndex < timestamps.length && timestamps[validStartIndex]! <= windowStart) {
            validStartIndex++;
        }

        if (validStartIndex > 0) {
            timestamps = timestamps.slice(validStartIndex);
            this.clientLogs.set(clientKey, timestamps);
        }

        // 3. Evaluate capacity
        const currentCount = timestamps.length;
        const resetTime = timestamps.length > 0 ? timestamps[0]! + policy.windowMs : now + policy.windowMs;

        if (currentCount < policy.maxRequests) {
            // Request Allowed
            timestamps.push(now);
            const remaining = policy.maxRequests - timestamps.length;

            return {
                allowed: true,
                limit: policy.maxRequests,
                remaining: Math.max(0, remaining),
                resetTime,
                clientKey
            };
        }

        // 4. Rate Limit Exceeded
        this.totalBlockedRequests++;
        const oldestTimestamp = timestamps[0]!;
        const retryAfterMs = Math.max(0, oldestTimestamp + policy.windowMs - now);
        const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

        // Track abuse stats
        const existingOffender = this.offenders.get(clientKey);
        if (existingOffender) {
            existingOffender.count++;
            existingOffender.lastBlockedAt = new Date();
        } else {
            this.offenders.set(clientKey, {
                key: clientKey,
                count: 1,
                lastBlockedAt: new Date(),
                tierName: policy.tierName
            });
        }

        return {
            allowed: false,
            limit: policy.maxRequests,
            remaining: 0,
            resetTime,
            retryAfterSeconds,
            clientKey
        };
    }

    /**
     * Retrieve aggregated abuse telemetry
     */
    public getAbuseStats(): AbuseStats {
        const topOffenders = Array.from(this.offenders.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalBlockedRequests: this.totalBlockedRequests,
            activeTrackedClients: this.clientLogs.size,
            topOffenders
        };
    }

    /**
     * Reset telemetry (for tests)
     */
    public reset(): void {
        this.clientLogs.clear();
        this.offenders.clear();
        this.totalBlockedRequests = 0;
    }

    /**
     * Periodic garbage collection to remove idle clients
     */
    private cleanupExpiredEntries(): void {
        const now = Date.now();
        const maxWindow = 300_000; // 5 minutes max retention

        for (const [key, timestamps] of this.clientLogs.entries()) {
            if (timestamps.length === 0 || timestamps[timestamps.length - 1]! < now - maxWindow) {
                this.clientLogs.delete(key);
            }
        }
    }
}

export const rateLimiter = SlidingWindowLog.getInstance();

