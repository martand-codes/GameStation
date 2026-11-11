import { HMACSigner } from "../Webhooks/HMACSigner.js";
import { WebhookDispatcher } from "../Webhooks/WebhookDispatcher.js";
import { prisma } from "../prisma/db.js";
import http from "node:http";

async function runWebhookTests() {
  console.log("=========================================================");
  console.log("⚡ GAMESTATION ENTERPRISE WEBHOOK ENGINE TEST SUITE");
  console.log("=========================================================\n");

  // 1. Test HMAC Signature Generation & Verification
  console.log("1. Testing HMAC-SHA256 Cryptographic Signatures...");
  const secret = HMACSigner.generateSecret();
  console.log(`   Generated Webhook Secret: ${secret}`);

  const rawPayload = JSON.stringify({
    id: "evt_test_123",
    event: "purchase.completed",
    amount: 2999,
    game: "Cyberpunk 2077"
  });

  const timestamp = Date.now();
  const signatureHeader = HMACSigner.sign(rawPayload, secret, timestamp);
  console.log(`   Signature Header: ${signatureHeader}`);

  const validResult = HMACSigner.verify(rawPayload, signatureHeader, secret, 300);
  console.log(`   Verification Result: ${validResult.valid ? "PASSED" : "FAILED"}`);
  if (!validResult.valid) {
    throw new Error(`HMAC Verification failed: ${validResult.reason}`);
  }

  // 2. Test Anti-Tamper & Anti-Replay
  console.log("2. Testing Tamper Resistance & Anti-Replay Protection...");
  const tamperedPayload = JSON.stringify({
    id: "evt_test_123",
    event: "purchase.completed",
    amount: 1, // Tampered amount!
    game: "Cyberpunk 2077"
  });

  const tamperedResult = HMACSigner.verify(tamperedPayload, signatureHeader, secret, 300);
  console.log(`   Tampered Payload Verification (Should Fail): ${!tamperedResult.valid ? "SUCCESSFULLY BLOCKED" : "FAILED"}`);
  if (tamperedResult.valid) {
    throw new Error("Tampered payload was mistakenly accepted!");
  }

  const expiredTimestamp = Date.now() - 600_000; // 10 minutes ago
  const expiredSignature = HMACSigner.sign(rawPayload, secret, expiredTimestamp);
  const expiredResult = HMACSigner.verify(rawPayload, expiredSignature, secret, 300);
  console.log(`   Expired Replay Attack (Should Fail): ${!expiredResult.valid ? "SUCCESSFULLY BLOCKED" : "FAILED"}`);
  if (expiredResult.valid) {
    throw new Error("Expired signature was mistakenly accepted!");
  }
  console.log("   ✅ Cryptographic verification & anti-replay validated.\n");

  // 3. Test Live Delivery to a Local Mock Studio Server
  console.log("3. Testing Live Webhook HTTP Dispatch to Mock Studio Server...");
  let receivedWebhook: any = null;
  let receivedSignature: string | null = null;

  // Spin up temporary mock server on port 9876
  const mockServer = http.createServer((req, res) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      receivedWebhook = JSON.parse(body);
      receivedSignature = req.headers["x-gamestation-signature"] as string;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: true }));
    });
  });

  await new Promise<void>((resolve) => mockServer.listen(9876, () => resolve()));
  console.log("   Mock Studio Endpoint listening on http://localhost:9876");

  // Find a developer user
  let devUser = await prisma.user.findFirst({
    where: { role: { in: ["DEVELOPER", "OWNER"] } }
  });

  if (!devUser) {
    throw new Error("No developer user found in database for test.");
  }

  // Create temporary subscription
  const sub = await prisma.webhookSubscription.create({
    data: {
      developerId: devUser.id,
      url: "http://localhost:9876/webhook",
      secret: secret,
      events: ["purchase.completed"],
      description: "Automated Test Webhook"
    }
  });

  const dispatcher = WebhookDispatcher.getInstance();
  const dispatchResult = await dispatcher.dispatch(
    "purchase.completed",
    {
      orderId: "ord_test_888",
      gameTitle: "The Witcher 3: Wild Hunt",
      amount: 1499,
      timestamp: new Date().toISOString()
    },
    devUser.id
  );

  console.log(`   Dispatched: Queued ${dispatchResult.queuedCount} delivery job(s).`);

  // Wait for worker to deliver (up to 3 seconds)
  const pollStart = Date.now();
  while (!receivedWebhook && Date.now() - pollStart < 3000) {
    await new Promise(r => setTimeout(r, 100));
  }

  mockServer.close();

  if (!receivedWebhook || !receivedSignature) {
    throw new Error("Mock studio server did not receive the webhook delivery within timeout!");
  }

  console.log(`   Mock Studio received event: "${receivedWebhook.event}" for "${receivedWebhook.data.gameTitle}"`);
  console.log(`   Received Signature: ${receivedSignature}`);

  // Verify signature received by mock server
  const mockVerify = HMACSigner.verify(JSON.stringify(receivedWebhook), receivedSignature, secret);
  if (!mockVerify.valid) {
    throw new Error(`Mock server signature verification failed: ${mockVerify.reason}`);
  }
  console.log("   ✅ Mock server verified signature successfully!");

  // Clean up test subscription
  await prisma.webhookSubscription.delete({ where: { id: sub.id } });
  console.log("   Cleaned up test subscription from database.\n");

  console.log("=========================================================");
  console.log("🎉 ALL ENTERPRISE WEBHOOK TESTS PASSED SUCCESSFULLY!");
  console.log("=========================================================");
}

runWebhookTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

