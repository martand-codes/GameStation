import { SlidingWindowLog } from "../RateLimiter/SlidingWindowLog.js";
import type { RateLimitPolicy } from "../RateLimiter/types.js";

async function runRateLimiterTests() {
  console.log("=========================================================");
  console.log("🛡️ GAMESTATION SLIDING-WINDOW RATE LIMITER TEST SUITE");
  console.log("=========================================================\n");

  const limiter = SlidingWindowLog.getInstance();
  limiter.reset();

  const testPolicy: RateLimitPolicy = {
    tierName: "TEST_AUTH_TIER",
    windowMs: 1000, // 1 second window for rapid test
    maxRequests: 3
  };

  const client = "ip:192.168.1.100";

  // 1. Test Consumption under threshold
  console.log("1. Testing consumption within allowed threshold (Limit: 3/sec)...");
  for (let i = 1; i <= 3; i++) {
    const res = limiter.consume(client, testPolicy);
    console.log(`   Request #${i}: Allowed=${res.allowed}, Remaining=${res.remaining}/${res.limit}`);
    if (!res.allowed || res.remaining !== 3 - i) {
      throw new Error(`Expected request ${i} to be allowed with ${3 - i} remaining, got allowed=${res.allowed}`);
    }
  }
  console.log("   ✅ Normal consumption within limit verified.\n");

  // 2. Test 4th request (Threshold violation)
  console.log("2. Testing threshold breach (4th request)...");
  const breachRes = limiter.consume(client, testPolicy);
  console.log(`   Request #4: Allowed=${breachRes.allowed}, Remaining=${breachRes.remaining}, RetryAfter=${breachRes.retryAfterSeconds}s`);

  if (breachRes.allowed || breachRes.remaining !== 0 || !breachRes.retryAfterSeconds) {
    throw new Error("Expected 4th request to be blocked with RetryAfter seconds!");
  }
  console.log("   ✅ Immediate 429 threshold throttling verified.\n");

  // 3. Test Boundary Burst Immunity (Sliding Window vs Fixed Window)
  console.log("3. Testing Sliding Window Log rollover...");
  console.log("   Waiting 1.1 seconds for sliding window to slide past initial burst...");
  await new Promise((r) => setTimeout(r, 1100));

  const restoredRes = limiter.consume(client, testPolicy);
  console.log(`   Request after window slide: Allowed=${restoredRes.allowed}, Remaining=${restoredRes.remaining}`);
  if (!restoredRes.allowed || restoredRes.remaining !== 2) {
    throw new Error("Expected capacity to be restored after window elapsed!");
  }
  console.log("   ✅ Sliding window expiration and capacity restoration verified.\n");

  // 4. Test Abuse Telemetry
  console.log("4. Testing Abuse Tracking Telemetry...");
  const abuseStats = limiter.getAbuseStats();
  console.log(`   Total Blocked Requests: ${abuseStats.totalBlockedRequests}`);
  console.log(`   Active Clients Tracked: ${abuseStats.activeTrackedClients}`);
  console.log(`   Top Offenders: ${JSON.stringify(abuseStats.topOffenders)}`);

  if (abuseStats.totalBlockedRequests < 1 || abuseStats.topOffenders.length === 0) {
    throw new Error("Expected abuse stats to record the blocked breach!");
  }
  console.log("   ✅ Abuse tracking and offender logging verified.\n");

  console.log("=========================================================");
  console.log("🎉 ALL RATE LIMITER & ABUSE SHIELD TESTS PASSED!");
  console.log("=========================================================");
}

runRateLimiterTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

