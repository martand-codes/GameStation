import { AsyncLocalStorage } from "node:async_hooks";
import { performance } from "node:perf_hooks";
import { W3CContext } from "./W3CContext.js";
import { TraceRingBuffer } from "./RingBuffer.js";
import type { Span, Trace, SpanCategory, SpanStatus } from "./types.js";

interface ActiveTraceContext {
    traceId: string;
    activeSpanId?: string;
    spans: Span[];
    tags: Record<string, any>;
    startTime: number;
}

export class Tracer {
    private static instance: Tracer;
    private readonly contextStorage: AsyncLocalStorage<ActiveTraceContext>;
    public readonly ringBuffer: TraceRingBuffer;

    private constructor(capacity: number = 2000) {
        this.contextStorage = new AsyncLocalStorage<ActiveTraceContext>();
        this.ringBuffer = new TraceRingBuffer(capacity);
    }

    public static getInstance(): Tracer {
        if (!Tracer.instance) {
            Tracer.instance = new Tracer();
        }
        return Tracer.instance;
    }

    /**
     * Start a new root trace and execute callback inside the AsyncLocalStorage context
     */
    public runInTrace<T>(
        name: string,
        category: SpanCategory = 'HTTP',
        attributes: Record<string, any> = {},
        incomingTraceParentHeader?: string | null,
        callback?: (trace: ActiveTraceContext, rootSpan: Span) => T
    ): { trace: ActiveTraceContext; rootSpan: Span; result: T } {
        const parsed = W3CContext.parse(incomingTraceParentHeader);
        const traceId = parsed ? parsed.traceId : W3CContext.generateTraceId();
        const rootSpanId = W3CContext.generateSpanId();
        const parentSpanId = parsed ? parsed.parentSpanId : undefined;

        const startTime = performance.now();

        const rootSpan: Span = {
            spanId: rootSpanId,
            parentSpanId,
            traceId,
            name,
            category,
            startTime,
            durationMs: 0,
            status: 'OK',
            attributes: this.sanitizeAttributes(attributes)
        };

        const traceContext: ActiveTraceContext = {
            traceId,
            activeSpanId: rootSpanId,
            spans: [rootSpan],
            tags: { ...attributes },
            startTime
        };

        let result: T;
        if (callback) {
            result = this.contextStorage.run(traceContext, () => callback(traceContext, rootSpan));
        } else {
            result = undefined as unknown as T;
        }

        return { trace: traceContext, rootSpan, result };
    }

    /**
     * Start a child span under the currently active span in context
     */
    public startSpan(
        name: string,
        category: SpanCategory = 'INTERNAL',
        attributes: Record<string, any> = {}
    ): Span | null {
        const store = this.contextStorage.getStore();
        if (!store) {
            return null; // No active trace context
        }

        const spanId = W3CContext.generateSpanId();
        const span: Span = {
            spanId,
            parentSpanId: store.activeSpanId,
            traceId: store.traceId,
            name,
            category,
            startTime: performance.now(),
            durationMs: 0,
            status: 'OK',
            attributes: this.sanitizeAttributes(attributes)
        };

        store.spans.push(span);
        store.activeSpanId = spanId;
        return span;
    }

    /**
     * End a span, compute duration, update status, and restore parent span
     */
    public endSpan(
        span: Span | null,
        status: SpanStatus = 'OK',
        error?: Error | { message: string; stack?: string }
    ): void {
        if (!span) return;

        const endTime = performance.now();
        span.endTime = endTime;
        span.durationMs = Number((endTime - span.startTime).toFixed(3));
        span.status = status;

        if (error) {
            span.status = 'ERROR';
            span.error = {
                message: error.message,
                stack: error.stack
            };
        }

        const store = this.contextStorage.getStore();
        if (store) {
            // Restore previous active span id
            store.activeSpanId = span.parentSpanId;
        }
    }

    /**
     * Convenient wrapper for tracing an async block
     */
    public async traceAsync<T>(
        name: string,
        category: SpanCategory,
        fn: () => Promise<T>,
        attributes: Record<string, any> = {}
    ): Promise<T> {
        const span = this.startSpan(name, category, attributes);
        try {
            const result = await fn();
            this.endSpan(span, 'OK');
            return result;
        } catch (err: any) {
            this.endSpan(span, 'ERROR', err);
            throw err;
        }
    }

    /**
     * Synchronous block trace wrapper
     */
    public traceSync<T>(
        name: string,
        category: SpanCategory,
        fn: () => T,
        attributes: Record<string, any> = {}
    ): T {
        const span = this.startSpan(name, category, attributes);
        try {
            const result = fn();
            this.endSpan(span, 'OK');
            return result;
        } catch (err: any) {
            this.endSpan(span, 'ERROR', err);
            throw err;
        }
    }

    /**
     * Set a metadata tag on the active trace (e.g. gameId, userId, studioId)
     */
    public setTag(key: string, value: any): void {
        const store = this.contextStorage.getStore();
        if (store) {
            store.tags[key] = value;
        }
    }

    /**
     * Get the active trace context
     */
    public getActiveContext(): ActiveTraceContext | undefined {
        return this.contextStorage.getStore();
    }

    /**
     * Finalize and record a complete trace into the ring buffer
     */
    public finalizeTrace(traceContext: ActiveTraceContext, rootSpan: Span, finalStatusCode: number = 200): Trace {
        const endTime = performance.now();
        rootSpan.endTime = endTime;
        rootSpan.durationMs = Number((endTime - rootSpan.startTime).toFixed(3));
        rootSpan.status = finalStatusCode >= 400 ? 'ERROR' : 'OK';

        const hasErrors = rootSpan.status === 'ERROR' || traceContext.spans.some(s => s.status === 'ERROR');

        const completedTrace: Trace = {
            traceId: traceContext.traceId,
            rootSpan,
            spans: [...traceContext.spans],
            startTime: traceContext.startTime,
            endTime,
            durationMs: rootSpan.durationMs,
            hasErrors,
            tags: {
                ...traceContext.tags,
                statusCode: finalStatusCode
            }
        };

        this.ringBuffer.push(completedTrace);
        return completedTrace;
    }

    /**
     * Sanitize sensitive keys like password, token, authorization from telemetry attributes
     */
    private sanitizeAttributes(attrs: Record<string, any>): Record<string, any> {
        const sanitized: Record<string, any> = {};
        const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'creditcard', 'apikey', 'cookie'];

        for (const [key, value] of Object.entries(attrs)) {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(s => lowerKey.includes(s))) {
                sanitized[key] = '[REDACTED]';
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sanitized[key] = this.sanitizeAttributes(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}

export const tracer = Tracer.getInstance();
