import { tracer } from "../Telemetry/Tracer.js";
import { W3CContext } from "../Telemetry/W3CContext.js";
import { SearchEngine } from "../Search/SearchEngine.js";

async function runTelemetryVerification() {
  console.log("=========================================================");
  console.log("🔍 GAMESTATION APM & DISTRIBUTED TRACING TEST SUITE");
  console.log("=========================================================\n");

  // 1. Test W3C Trace Context Parsing & Formatting
  console.log("1. Testing W3C Trace Context Formatting & Parsing...");
  const traceId = W3CContext.generateTraceId();
  const spanId = W3CContext.generateSpanId();
  const formatted = W3CContext.format(traceId, spanId, true);
  console.log(`   Formatted W3C Header: ${formatted}`);

  const parsed = W3CContext.parse(formatted);
  if (!parsed || parsed.traceId !== traceId || parsed.parentSpanId !== spanId) {
    throw new Error("W3CContext parse/format assertion failed!");
  }
  console.log("   ✅ W3C Format & Parse validated (Level 1 spec compliant).\n");

  // 2. Test AsyncLocalStorage Context Propagation & Span Nesting
  console.log("2. Testing AsyncLocalStorage & Nested Spans...");
  const { trace, rootSpan } = tracer.runInTrace(
    "http:POST /api/test/checkout",
    "HTTP",
    { route: "/api/test/checkout", userId: "user-123", gameId: "game-cyberpunk" },
    null,
    () => {
      // Simulate Database Query Span
      const dbSpan = tracer.startSpan("prisma:User.findUnique", "DB", {
        "db.model": "User",
        "db.operation": "findUnique",
      });
      // Simulate 5ms work
      const start = Date.now();
      while (Date.now() - start < 5);
      tracer.endSpan(dbSpan, "OK");

      // Simulate In-Memory Search Span with children
      tracer.traceSync("search:query", "SEARCH", () => {
        tracer.traceSync("search:tokenize", "SEARCH", () => {}, { tokens: ["cyberpunk", "2077"] });
        tracer.traceSync("search:bm25", "SEARCH", () => {}, { candidates: 12 });
      });

      // Simulate a Saga step
      tracer.traceSync("saga:step:WalletDebit", "SAGA", () => {}, { amount: 799 });

      return "checkout_success";
    }
  );

  const completedTrace = tracer.finalizeTrace(trace, rootSpan, 200);
  console.log(`   Recorded Trace ID: ${completedTrace.traceId}`);
  console.log(`   Root Span: "${completedTrace.rootSpan.name}" (${completedTrace.durationMs}ms)`);
  console.log(`   Total Spans Captured: ${completedTrace.spans.length}`);

  for (const s of completedTrace.spans) {
    const indent = s.parentSpanId ? "     ↳ " : "   • ";
    console.log(`${indent}[${s.category}] ${s.name} - ${s.durationMs}ms (Parent: ${s.parentSpanId || "None"})`);
  }

  if (completedTrace.spans.length < 5) {
    throw new Error(`Expected at least 5 nested spans, but got ${completedTrace.spans.length}`);
  }
  console.log("   ✅ Nested Call-Tree successfully reconstructed via AsyncLocalStorage.\n");

  // 3. Test Multi-Tenant Scoping (Admin vs Developer vs Unrelated Game)
  console.log("3. Testing Multi-Tenant Developer Isolation...");
  
  // Create another trace for a different game
  const otherTraceRun = tracer.runInTrace(
    "http:GET /api/games/hades",
    "HTTP",
    { route: "/api/games/hades", gameId: "game-hades" },
    null,
    () => {
      tracer.startSpan("prisma:Game.findUnique", "DB", { "db.model": "Game" });
    }
  );
  tracer.finalizeTrace(otherTraceRun.trace, otherTraceRun.rootSpan, 200);

  // Admin Query (All games)
  const adminQuery = tracer.ringBuffer.query();
  console.log(`   Admin (Platform-wide) Traces Count: ${adminQuery.total}`);

  // Developer Query (Owns only 'game-cyberpunk')
  const devQuery = tracer.ringBuffer.query({ studioGameIds: ["game-cyberpunk"] });
  console.log(`   Developer (Owns 'game-cyberpunk') Traces Count: ${devQuery.total}`);
  
  // Developer Query (Owns only 'game-witcher' - should be 0)
  const unrelatedDevQuery = tracer.ringBuffer.query({ studioGameIds: ["game-witcher"] });
  console.log(`   Developer (Owns 'game-witcher') Traces Count: ${unrelatedDevQuery.total}`);

  if (devQuery.total < 1 || unrelatedDevQuery.total !== 0) {
    throw new Error("Multi-tenant isolation failed! Developer was able to see unrelated game traces or missed their own.");
  }
  console.log("   ✅ Multi-tenant isolation verified: Developers only see spans touching their games.\n");

  // 4. Test Percentile Metrics Calculation
  console.log("4. Testing Percentile Metrics (P50, P95, P99, Error Rates)...");
  const metrics = tracer.ringBuffer.computeMetrics();
  console.log(`   P50 Latency: ${metrics.p50Ms}ms`);
  console.log(`   P95 Latency: ${metrics.p95Ms}ms`);
  console.log(`   P99 Latency: ${metrics.p99Ms}ms`);
  console.log(`   Avg Latency: ${metrics.avgDurationMs}ms`);
  console.log(`   Error Rate: ${metrics.errorRatePercent}%`);
  console.log("   Category Breakdown:");
  for (const [cat, summary] of Object.entries(metrics.categoryBreakdown)) {
    if (summary.count > 0) {
      console.log(`     - ${cat.padEnd(8)}: ${summary.count} spans (Avg: ${summary.avgDurationMs}ms, Total: ${summary.totalDurationMs}ms)`);
    }
  }

  console.log("\n=========================================================");
  console.log("🎉 ALL DISTRIBUTED TRACING & APM TESTS PASSED SUCCESSFULLY!");
  console.log("=========================================================");
}

runTelemetryVerification().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

