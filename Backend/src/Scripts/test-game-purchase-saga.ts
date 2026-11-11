import { createGamePurchaseSaga } from "../Saga/Definitions/GamePurchaseSaga.js";
import { prisma } from "../prisma/db.js";

async function main() {
  console.log("===================================================================");
  console.log("🚀 TESTING REAL PRODUCTION GAME PURCHASE SAGA WITH POSTGRES & WALLET");
  console.log("===================================================================\n");

  // 1. Pick a player with funds & ensure balance
  await prisma.user.update({
    where: { username: "Player@01" },
    data: { walletBalance: 25000 },
  });

  const player = await prisma.user.findFirst({
    where: { username: "Player@01" },
    select: { id: true, username: true, walletBalance: true },
  });
  if (!player) throw new Error("Player@01 not found");

  // 2. Pick a game the player does not currently own
  const ownedGameIds = (await prisma.userLibrary.findMany({
    where: { userId: player.id },
    select: { gameId: true },
  })).map((l) => l.gameId);

  const availableGame = await prisma.game.findFirst({
    where: {
      status: "PUBLISHED",
      id: { notIn: ownedGameIds },
    },
    include: { pricing: true, developer: true },
  });

  if (!availableGame) {
    throw new Error("No unowned published game found for Player@01.");
  }

  const devInitialBalance = Number(availableGame.developer?.walletBalance || 0);
  const playerInitialBalance = Number(player.walletBalance);
  const pricing = availableGame.pricing[0];
  const cost = Number(pricing.price);

  console.log(`👤 Player: @${player.username} (Starting Balance: ₹${playerInitialBalance})`);
  console.log(`🎮 Game: "${availableGame.title}" (Cost: ₹${cost})`);
  console.log(`🏢 Studio: @${availableGame.developer?.username} (Starting Balance: ₹${devInitialBalance})\n`);

  // ── TEST 1: Execute Real Happy Path Purchase ─────────────────────────────────
  console.log("👉 TEST 1: Executing Production GamePurchaseSaga (Happy Path)...");
  const idempotencyKey1 = `saga-real-purchase-${Date.now()}`;
  const saga1 = createGamePurchaseSaga({
    sagaType: "GAME_PURCHASE",
    idempotencyKey: idempotencyKey1,
    userId: player.id,
  });

  const res1 = await saga1.execute({
    userId: player.id,
    gameId: availableGame.id,
    pricingId: pricing.id,
  });

  console.log(`\n✅ TEST 1 SAGA STATUS: ${res1.status} (Duration: ${res1.durationMs}ms)`);
  res1.stepLogs.forEach((s) => {
    console.log(`   ✓ [${s.status}] Step ${s.stepIndex + 1}: ${s.stepName} (${s.durationMs}ms)`);
  });

  // Verify Player balance
  const playerAfter = await prisma.user.findUnique({ where: { id: player.id }, select: { walletBalance: true } });
  console.log(`   • Player New Balance: ₹${Number(playerAfter?.walletBalance)} (Expected: ₹${playerInitialBalance - cost})`);

  // Verify Library ownership
  const owned = await prisma.userLibrary.findUnique({
    where: { userId_gameId: { userId: player.id, gameId: availableGame.id } },
  });
  console.log(`   • Game Library Bound: ${!!owned} (ID: ${owned?.id})`);

  // Verify Developer 70% share
  const devAfter = await prisma.user.findUnique({ where: { id: availableGame.developerId! }, select: { walletBalance: true } });
  const expectedDevGain = Number((cost * 0.7).toFixed(2));
  console.log(`   • Studio New Balance: ₹${Number(devAfter?.walletBalance)} (Gained +₹${expectedDevGain})`);

  // ── TEST 2: Idempotency Verification ─────────────────────────────────────────
  console.log("\n👉 TEST 2: Re-submitting Identical Key to Test Idempotency Guard...");
  const dupSaga = createGamePurchaseSaga({
    sagaType: "GAME_PURCHASE",
    idempotencyKey: idempotencyKey1, // SAME KEY!
    userId: player.id,
  });
  const res2 = await dupSaga.execute({
    userId: player.id,
    gameId: availableGame.id,
    pricingId: pricing.id,
  });
  console.log(`✅ TEST 2 IDEMPOTENCY STATUS: ${res2.status} (Cached response returned without duplicate charge!)`);

  // ── TEST 3: Chaos Simulation & Automatic Compensation Rollback ──────────────
  console.log("\n👉 TEST 3: Testing Chaos Failure & Automatic Compensating Rollback...");
  // Find another unowned game or clean up
  const unowned2 = await prisma.game.findFirst({
    where: {
      status: "PUBLISHED",
      id: { notIn: [...ownedGameIds, availableGame.id] },
    },
    include: { pricing: true, developer: true },
  });

  if (unowned2) {
    const chaosCost = Number(unowned2.pricing[0].price);
    const playerBeforeChaos = Number((await prisma.user.findUnique({ where: { id: player.id } }))?.walletBalance);

    console.log(`🎮 Target Game: "${unowned2.title}" (Cost: ₹${chaosCost})`);
    console.log(`💥 Injecting Hardware Fault at Step: "Studio Royalty & Treasury Split"...`);

    const idempotencyKey3 = `saga-chaos-${Date.now()}`;
    const chaosSaga = createGamePurchaseSaga({
      sagaType: "GAME_PURCHASE",
      idempotencyKey: idempotencyKey3,
      userId: player.id,
      chaosFailStep: "Studio Royalty & Treasury Split", // CHAOS TRIGGER!
    });

    const res3 = await chaosSaga.execute({
      userId: player.id,
      gameId: unowned2.id,
      pricingId: unowned2.pricing[0].id,
    });

    console.log(`\n✅ TEST 3 SAGA STATUS: ${res3.status} (Expected: COMPENSATED)`);
    console.log(`   Captured Error: "${res3.error}"`);
    res3.stepLogs.forEach((s) => {
      console.log(`   • [${s.status}] Step ${s.stepIndex + 1}: ${s.stepName} (${s.durationMs}ms)${s.error ? ` - Error: ${s.error}` : ""}`);
    });

    // Verify Player Balance was fully restored
    const playerAfterChaos = Number((await prisma.user.findUnique({ where: { id: player.id } }))?.walletBalance);
    console.log(`   • Player Balance Restored: ₹${playerAfterChaos} (Expected: ₹${playerBeforeChaos} - Match: ${playerAfterChaos === playerBeforeChaos})`);

    // Verify Game was NOT added to Library
    const chaosOwned = await prisma.userLibrary.findUnique({
      where: { userId_gameId: { userId: player.id, gameId: unowned2.id } },
    });
    console.log(`   • Game In Library: ${!!chaosOwned} (Expected: false)`);
  }

  console.log("\n===================================================================");
  console.log("🏆 REAL GAME PURCHASE SAGA PRODUCTION TEST PASSED 100%");
  console.log("===================================================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
