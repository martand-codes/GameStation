import type { RateLimitPolicy } from "./types.js";

/**
 * Pre-configured Rate Limiting Policy Tiers
 */
export const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
    // 1. Strict Auth: 5 attempts per 60 seconds (Stops brute-force credential stuffing)
    AUTH: {
        tierName: "AUTH_TIER",
        windowMs: 60_000,
        maxRequests: 5
    },

    // 2. Search Engine: 60 queries per 60 seconds (Protects In-Memory BM25 & Trie from scraping)
    SEARCH: {
        tierName: "SEARCH_TIER",
        windowMs: 60_000,
        maxRequests: 60
    },

    // 3. Financial / Saga Transactions: 10 checkouts per 60 seconds (Prevents double-spend races)
    SAGA: {
        tierName: "SAGA_TIER",
        windowMs: 60_000,
        maxRequests: 10
    },

    // 4. Global Platform Baseline: 120 requests per 60 seconds
    GLOBAL: {
        tierName: "GLOBAL_TIER",
        windowMs: 60_000,
        maxRequests: 120
    }
};

