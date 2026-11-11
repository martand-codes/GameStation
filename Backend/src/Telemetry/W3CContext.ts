import crypto from "node:crypto";

/**
 * W3C Trace Context Specification (Level 1)
 * Format: version-traceId-parentId-traceFlags
 * Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 */
export interface ParsedTraceParent {
    version: string;
    traceId: string;
    parentSpanId: string;
    traceFlags: string;
    isSampled: boolean;
}

export class W3CContext {
    private static readonly VERSION = "00";
    private static readonly SAMPLED_FLAG = "01";

    /**
     * Generate a 32-hex character W3C Trace ID (16 bytes)
     */
    public static generateTraceId(): string {
        return crypto.randomBytes(16).toString("hex");
    }

    /**
     * Generate a 16-hex character W3C Span ID (8 bytes)
     */
    public static generateSpanId(): string {
        return crypto.randomBytes(8).toString("hex");
    }

    /**
     * Parse incoming `traceparent` header string
     */
    public static parse(header?: string | null): ParsedTraceParent | null {
        if (!header || typeof header !== "string") {
            return null;
        }

        const parts = header.trim().split("-");
        if (parts.length !== 4 || !parts[0] || !parts[1] || !parts[2] || !parts[3]) {
            return null;
        }

        const version = parts[0];
        const traceId = parts[1];
        const parentSpanId = parts[2];
        const traceFlags = parts[3];

        // Validation per W3C spec
        if (version !== "00" && !/^[0-9a-f]{2}$/i.test(version)) {
            return null;
        }
        if (!/^[0-9a-f]{32}$/i.test(traceId) || traceId === "00000000000000000000000000000000") {
            return null;
        }
        if (!/^[0-9a-f]{16}$/i.test(parentSpanId) || parentSpanId === "0000000000000000") {
            return null;
        }

        return {
            version,
            traceId: traceId.toLowerCase(),
            parentSpanId: parentSpanId.toLowerCase(),
            traceFlags,
            isSampled: (parseInt(traceFlags, 16) & 1) === 1
        };
    }

    /**
     * Format into W3C `traceparent` string
     */
    public static format(traceId: string, spanId: string, sampled: boolean = true): string {
        const flags = sampled ? this.SAMPLED_FLAG : "00";
        return `${this.VERSION}-${traceId}-${spanId}-${flags}`;
    }
}

