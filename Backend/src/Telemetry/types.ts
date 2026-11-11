export type SpanCategory = 'HTTP' | 'DB' | 'SEARCH' | 'SAGA' | 'COMPUTE' | 'INTERNAL';

export type SpanStatus = 'OK' | 'ERROR';

export interface Span {
    spanId: string;              // 16-hex characters (W3C standard)
    parentSpanId?: string | undefined; // 16-hex characters of parent span (undefined for root)
    traceId: string;             // 32-hex characters (W3C standard)
    name: string;                // e.g. "http:GET /api/search", "prisma:Game.findMany", "search:bm25"
    category: SpanCategory;
    startTime: number;           // performance.now() high-resolution timestamp
    endTime?: number | undefined;
    durationMs: number;          // Milliseconds rounded to 3 decimal places (sub-microsecond precision)
    status: SpanStatus;
    attributes: Record<string, any>; // Arbitrary metadata (e.g. query, status_code, model, gameId)
    error?: {
        message: string;
        stack?: string | undefined;
    } | undefined;
}

export interface Trace {
    traceId: string;
    rootSpan: Span;
    spans: Span[];
    startTime: number;
    endTime: number;
    durationMs: number;
    hasErrors: boolean;
    tags: {
        route?: string | undefined;
        method?: string | undefined;
        statusCode?: number | undefined;
        gameId?: string | undefined;
        studioId?: string | undefined;
        userId?: string | undefined;
        source?: string | undefined;
        [key: string]: any;
    };
}

export interface TelemetryFilter {
    status?: 'OK' | 'ERROR' | 'ALL' | undefined;
    category?: SpanCategory | 'ALL' | undefined;
    minDurationMs?: number | undefined;
    search?: string | undefined;
    route?: string | undefined;
    gameId?: string | undefined;
    studioGameIds?: string[] | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}

export interface CategorySummary {
    count: number;
    avgDurationMs: number;
    totalDurationMs: number;
}

export interface TelemetryMetrics {
    totalTraces: number;
    activeSpansCount: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    avgDurationMs: number;
    errorRatePercent: number;
    categoryBreakdown: Record<SpanCategory, CategorySummary>;
    slowestTraces: Array<{
        traceId: string;
        name: string;
        durationMs: number;
        route?: string | undefined;
        statusCode?: number | undefined;
    }>;
}
