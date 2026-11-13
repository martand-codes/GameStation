import type { RateLimitPolicy } from "./types.js";

/**
 * Pre-configured Rate Limiting Policy Tiers
 */
export const RATE_LIMIT_POLICIES = {
    // 1. Auth: 30 attempts per 60 seconds (Protects against automated credential stuffing without locking out humans)
    AUTH: {
        tierName: "AUTH_TIER",
        windowMs: 60_000,
        maxRequests: 30
    },

    // 2. Search Engine: 120 queries per 60 seconds
    SEARCH: {
        tierName: "SEARCH_TIER",
        windowMs: 60_000,
        maxRequests: 120
    },

    // 3. Financial / Saga Transactions: 30 checkouts per 60 seconds
    SAGA: {
        tierName: "SAGA_TIER",
        windowMs: 60_000,
        maxRequests: 30
    },

    // 4. Global Platform Baseline: 500 requests per 60 seconds (Ensures fast dashboard telemetry without throttling)
    GLOBAL: {
        tierName: "GLOBAL_TIER",
        windowMs: 60_000,
        maxRequests: 500
    }
} as const satisfies Record<string, RateLimitPolicy>;

