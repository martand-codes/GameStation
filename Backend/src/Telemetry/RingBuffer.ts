import type { Trace, TelemetryFilter, TelemetryMetrics, SpanCategory, CategorySummary } from "./types.js";

/**
 * Fixed-size In-Memory Circular Ring Buffer for Traces
 * Guarantees O(1) insertions, zero memory leakage, and bounded RAM usage (~15MB max for 2,000 traces).
 */
export class TraceRingBuffer {
    private readonly capacity: number;
    private readonly buffer: (Trace | null)[];
    private head: number = 0;
    private count: number = 0;

    constructor(capacity: number = 2000) {
        this.capacity = capacity;
        this.buffer = new Array(capacity).fill(null);
    }

    /**
     * Push a new trace into the circular buffer in O(1) time
     */
    public push(trace: Trace): void {
        this.buffer[this.head] = trace;
        this.head = (this.head + 1) % this.capacity;
        if (this.count < this.capacity) {
            this.count++;
        }
    }

    /**
     * Retrieve a specific trace by traceId
     */
    public getById(traceId: string): Trace | null {
        for (let i = 0; i < this.count; i++) {
            const index = (this.head - 1 - i + this.capacity) % this.capacity;
            const item = this.buffer[index];
            if (item && item.traceId === traceId) {
                return item;
            }
        }
        return null;
    }

    /**
     * Query traces with multi-tenant filtering, pagination, and search
     */
    public query(filter: TelemetryFilter = {}): { traces: Trace[]; total: number } {
        const matches: Trace[] = [];
        const {
            status = 'ALL',
            category = 'ALL',
            minDurationMs,
            search,
            route,
            gameId,
            studioGameIds,
            limit = 50,
            offset = 0
        } = filter;

        const normalizedSearch = search?.toLowerCase().trim();

        // Traverse in reverse chronological order (newest first)
        for (let i = 0; i < this.count; i++) {
            const index = (this.head - 1 - i + this.capacity) % this.capacity;
            const item = this.buffer[index];
            if (!item) continue;

            // Status filter
            if (status === 'ERROR' && !item.hasErrors) continue;
            if (status === 'OK' && item.hasErrors) continue;

            // Min duration filter
            if (typeof minDurationMs === 'number' && item.durationMs < minDurationMs) continue;

            // Route filter
            if (route && item.tags.route !== route) continue;

            // Game ID filter
            if (gameId && item.tags.gameId !== gameId) continue;

            // Multi-tenant Studio isolation filter:
            // If studioGameIds is provided, trace MUST touch at least one game belonging to that studio
            if (studioGameIds && studioGameIds.length > 0) {
                const touchesStudioGame = item.tags.gameId && studioGameIds.includes(item.tags.gameId) ||
                    item.spans.some(s => s.attributes.gameId && studioGameIds.includes(s.attributes.gameId));
                if (!touchesStudioGame) continue;
            }

            // Category filter
            if (category !== 'ALL') {
                const hasCategory = item.spans.some(s => s.category === category);
                if (!hasCategory) continue;
            }

            // Search filter
            if (normalizedSearch) {
                const matchesRoute = item.tags.route?.toLowerCase().includes(normalizedSearch);
                const matchesMethod = item.tags.method?.toLowerCase().includes(normalizedSearch);
                const matchesRoot = item.rootSpan.name.toLowerCase().includes(normalizedSearch);
                const matchesTraceId = item.traceId.toLowerCase().includes(normalizedSearch);
                if (!matchesRoute && !matchesMethod && !matchesRoot && !matchesTraceId) continue;
            }

            matches.push(item);
        }

        const total = matches.length;
        const paginated = matches.slice(offset, offset + limit);

        return {
            traces: paginated,
            total
        };
    }

    /**
     * Compute statistical aggregations: P50, P95, P99, error rate, category breakdown
     */
    public computeMetrics(studioGameIds?: string[]): TelemetryMetrics {
        const eligibleTraces: Trace[] = [];

        for (let i = 0; i < this.count; i++) {
            const index = (this.head - 1 - i + this.capacity) % this.capacity;
            const item = this.buffer[index];
            if (!item) continue;

            if (studioGameIds && studioGameIds.length > 0) {
                const touchesStudioGame = item.tags.gameId && studioGameIds.includes(item.tags.gameId) ||
                    item.spans.some(s => s.attributes.gameId && studioGameIds.includes(s.attributes.gameId));
                if (!touchesStudioGame) continue;
            }

            eligibleTraces.push(item);
        }

        const totalTraces = eligibleTraces.length;
        if (totalTraces === 0) {
            return {
                totalTraces: 0,
                activeSpansCount: 0,
                p50Ms: 0,
                p95Ms: 0,
                p99Ms: 0,
                avgDurationMs: 0,
                errorRatePercent: 0,
                categoryBreakdown: this.getEmptyCategoryBreakdown(),
                slowestTraces: []
            };
        }

        // Sort durations for percentiles
        const durations = eligibleTraces.map(t => t.durationMs).sort((a, b) => a - b);
        const p50Ms = this.getPercentile(durations, 50);
        const p95Ms = this.getPercentile(durations, 95);
        const p99Ms = this.getPercentile(durations, 99);
        const avgDurationMs = Number((durations.reduce((sum, d) => sum + d, 0) / totalTraces).toFixed(2));

        const errorCount = eligibleTraces.filter(t => t.hasErrors).length;
        const errorRatePercent = Number(((errorCount / totalTraces) * 100).toFixed(2));

        // Category breakdown
        const categoryBreakdown = this.getEmptyCategoryBreakdown();
        let totalSpans = 0;

        for (const trace of eligibleTraces) {
            for (const span of trace.spans) {
                totalSpans++;
                const cat = categoryBreakdown[span.category] || categoryBreakdown['INTERNAL'];
                cat.count++;
                cat.totalDurationMs += span.durationMs;
            }
        }

        for (const key of Object.keys(categoryBreakdown) as SpanCategory[]) {
            const cat = categoryBreakdown[key];
            cat.avgDurationMs = cat.count > 0 ? Number((cat.totalDurationMs / cat.count).toFixed(3)) : 0;
            cat.totalDurationMs = Number(cat.totalDurationMs.toFixed(3));
        }

        // Top 5 slowest traces
        const slowestTraces = eligibleTraces
            .slice()
            .sort((a, b) => b.durationMs - a.durationMs)
            .slice(0, 5)
            .map(t => ({
                traceId: t.traceId,
                name: t.rootSpan.name,
                durationMs: t.durationMs,
                route: t.tags.route,
                statusCode: t.tags.statusCode
            }));

        return {
            totalTraces,
            activeSpansCount: totalSpans,
            p50Ms,
            p95Ms,
            p99Ms,
            avgDurationMs,
            errorRatePercent,
            categoryBreakdown,
            slowestTraces
        };
    }

    private getPercentile(sorted: number[], p: number): number {
        if (sorted.length === 0) return 0;
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        const val = sorted[Math.max(0, Math.min(index, sorted.length - 1))];
        return val !== undefined ? Number(val.toFixed(2)) : 0;
    }

    private getEmptyCategoryBreakdown(): Record<SpanCategory, CategorySummary> {
        return {
            HTTP: { count: 0, avgDurationMs: 0, totalDurationMs: 0 },
            DB: { count: 0, avgDurationMs: 0, totalDurationMs: 0 },
            SEARCH: { count: 0, avgDurationMs: 0, totalDurationMs: 0 },
            SAGA: { count: 0, avgDurationMs: 0, totalDurationMs: 0 },
            COMPUTE: { count: 0, avgDurationMs: 0, totalDurationMs: 0 },
            INTERNAL: { count: 0, avgDurationMs: 0, totalDurationMs: 0 }
        };
    }
}

