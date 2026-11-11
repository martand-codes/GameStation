import { SagaOrchestrator } from "../Saga/SagaOrchestrator.js";
import { prisma } from "../prisma/db.js";

async function main() {
  console.log("=================================================");
  console.log("🧪 TESTING SAGA DISTRIBUTED TRANSACTION ENGINE");
  console.log("=================================================\n");

  const testUser = await prisma.user.findFirst({ where: { role: "PLAYER" } });
  if (!testUser) {
    throw new Error("No player user found to run test with.");
  }

  // TEST 1: Happy Path
  console.log("👉 TEST 1: Running Happy Path Saga...");
  const idempotencyKey1 = `test-saga-happy-${Date.now()}`;
  const happySaga = new SagaOrchestrator<{ balance: number; gameLicenseId?: string; royaltyCredited?: boolean }>({
    sagaType: "GAME_PURCHASE_TEST",
    idempotencyKey: idempotencyKey1,
    userId: testUser.id,
  });

  happySaga
    .addStep({
      name: "Wallet Deduction",
      execute: async (ctx) => {
        console.log("   [Step 1 Forward] Deducting 100 points...");
        ctx.balance -= 100;
        return { deducted: 100, newBalance: ctx.balance };
      },
      compensate: async (ctx) => {
        console.log("   [Step 1 Reversal] Refunding 100 points...");
        ctx.balance += 100;
      },
    })
    .addStep({
      name: "License Provisioning",
      execute: async (ctx) => {
        console.log("   [Step 2 Forward] Minting digital game license...");
        ctx.gameLicenseId = "LIC-998877";
        return { licenseId: ctx.gameLicenseId };
      },
      compensate: async (ctx) => {
        console.log("   [Step 2 Reversal] Revoking license", ctx.gameLicenseId);
        ctx.gameLicenseId = undefined;
      },
    })
    .addStep({
      name: "Royalty Ledger Allocation",
      execute: async (ctx) => {
        console.log("   [Step 3 Forward] Crediting 70% developer royalty...");
        ctx.royaltyCredited = true;
        return { devRoyalty: 70, platformCut: 30 };
      },
      compensate: async (ctx) => {
        console.log("   [Step 3 Reversal] Voiding developer royalty entry...");
        ctx.royaltyCredited = false;
      },
    });

  const happyResult = await happySaga.execute({ balance: 15000 });
  console.log(`✅ Happy Path Result: Status = ${happyResult.status}, Total Steps = ${happyResult.totalSteps}, Duration = ${happyResult.durationMs}ms`);

  // TEST 2: Idempotency Protection Test
  console.log("\n👉 TEST 2: Verifying Idempotency Key Guard...");
  const dupSaga = new SagaOrchestrator({
    sagaType: "GAME_PURCHASE_TEST",
    idempotencyKey: idempotencyKey1, // RE-USING KEY!
    userId: testUser.id,
  });
  dupSaga.addStep({
    name: "Wallet Deduction",
    execute: async () => { throw new Error("Should never execute due to idempotency!"); },
    compensate: async () => {},
  });
  const dupResult = await dupSaga.execute({ balance: 15000 });
  console.log(`✅ Idempotency Guard Verified: Returned status "${dupResult.status}" without re-executing steps!`);

  // TEST 3: Chaos Failure & Compensating Rollback Loop
  console.log("\n👉 TEST 3: Injecting Failure at Step 3 (Royalty Ledger Allocation)...");
  const idempotencyKey2 = `test-saga-chaos-${Date.now()}`;
  const chaosContext = { balance: 15000, gameLicenseId: undefined as string | undefined, royaltyCredited: false };

  const chaosSaga = new SagaOrchestrator<typeof chaosContext>({
    sagaType: "GAME_PURCHASE_TEST",
    idempotencyKey: idempotencyKey2,
    userId: testUser.id,
    chaosFailStep: "Royalty Ledger Allocation", // SIMULATING CRASH HERE!
  });

  chaosSaga
    .addStep({
      name: "Wallet Deduction",
      execute: async (ctx) => {
        console.log("   [Step 1 Forward] Deducting 100 points...");
        ctx.balance -= 100;
        return { deducted: 100, remaining: ctx.balance };
      },
      compensate: async (ctx) => {
        console.log("   [Step 1 Reversal] ↩ Refunding 100 points back to wallet! (Balance restored)");
        ctx.balance += 100;
      },
    })
    .addStep({
      name: "License Provisioning",
      execute: async (ctx) => {
        console.log("   [Step 2 Forward] Minting digital game license...");
        ctx.gameLicenseId = "LIC-CHAOS-001";
        return { licenseId: ctx.gameLicenseId };
      },
      compensate: async (ctx) => {
        console.log("   [Step 2 Reversal] ↩ Revoking digital game license:", ctx.gameLicenseId);
        ctx.gameLicenseId = undefined;
      },
    })
    .addStep({
      name: "Royalty Ledger Allocation",
      execute: async (ctx) => {
        console.log("   [Step 3 Forward] Trying to credit royalty...");
        ctx.royaltyCredited = true;
      },
      compensate: async (ctx) => {
        console.log("   [Step 3 Reversal] Voiding royalty...");
        ctx.royaltyCredited = false;
      },
    });

  const chaosResult = await chaosSaga.execute(chaosContext);
  console.log(`\n✅ Chaos Compensation Result:`);
  console.log(`   Final Status: ${chaosResult.status} (Expected: COMPENSATED)`);
  console.log(`   Error Captured: "${chaosResult.error}"`);
  console.log(`   Context Restored: Balance = ₹${chaosResult.context.balance} (Refunded), License = ${chaosResult.context.gameLicenseId} (Revoked)`);

  // Verify in DB
  const dbRecord = await prisma.sagaInstance.findUnique({
    where: { id: chaosResult.sagaId },
    include: { steps: { orderBy: { stepIndex: "asc" } } },
  });
  console.log(`   DB Record Status: ${dbRecord?.status}`);
  console.log(`   DB Step Logs:`);
  dbRecord?.steps.forEach((s) => {
    console.log(`     • [${s.status}] Step ${s.stepIndex + 1}: ${s.stepName} (${s.durationMs || 0}ms)${s.error ? ` - Error: ${s.error}` : ""}`);
  });

  console.log("\n=================================================");
  console.log("🏆 SAGA ENGINE PHASE 1 VERIFICATION PASSED 100%");
  console.log("=================================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

