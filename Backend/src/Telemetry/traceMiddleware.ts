import type { Request, Response, NextFunction } from "express";
import { tracer } from "./Tracer.js";
import { W3CContext } from "./W3CContext.js";

/**
 * Express Middleware for Automatic Distributed HTTP Tracing
 * Compliant with W3C Trace Context Level 1
 */
export const traceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // 1. Extract existing traceparent or prepare for generation
    const incomingTraceParent = req.header("traceparent");
    const name = `http:${req.method} ${req.baseUrl || req.path}`;

    const attributes: Record<string, any> = {
        "http.method": req.method,
        "http.url": req.originalUrl || req.url,
        "http.path": req.path,
        "http.ip": req.ip || req.socket.remoteAddress,
        "http.user_agent": req.header("user-agent") || "unknown"
    };

    // Dynamically detect gameId across params, route, query, or body (Zero hardcoding)
    const detectedGameId =
        req.params?.gameId ||
        (req.path.includes('/games/') || req.baseUrl.includes('game') ? req.params?.id : undefined) ||
        req.query?.gameId ||
        (req.body && typeof req.body === 'object' ? req.body.gameId : undefined);

    if (detectedGameId && typeof detectedGameId === 'string') {
        attributes["gameId"] = detectedGameId;
    }

    // 2. Wrap request execution in AsyncLocalStorage context
    tracer.runInTrace(
        name,
        'HTTP',
        attributes,
        incomingTraceParent,
        (trace, rootSpan) => {
            // 3. Inject W3C Trace Context into outgoing response headers
            const traceParentHeader = W3CContext.format(trace.traceId, rootSpan.spanId, true);
            res.setHeader("traceparent", traceParentHeader);
            res.setHeader("X-Trace-Id", trace.traceId);

            // 4. Intercept response completion to finalize trace
            res.on("finish", () => {
                rootSpan.attributes["http.status_code"] = res.statusCode;
                trace.tags.route = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
                trace.tags.method = req.method;
                trace.tags.statusCode = res.statusCode;

                tracer.finalizeTrace(trace, rootSpan, res.statusCode);
            });

            next();
        }
    );
};
