export interface RateLimitPolicy {
    tierName: string;
    windowMs: number;
    maxRequests: number;
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number; // Unix epoch ms
    retryAfterSeconds?: number;
    clientKey: string;
}

export interface OffenderRecord {
    key: string;
    count: number;
    lastBlockedAt: Date;
    tierName: string;
}

export interface AbuseStats {
    totalBlockedRequests: number;
    activeTrackedClients: number;
    topOffenders: OffenderRecord[];
}

