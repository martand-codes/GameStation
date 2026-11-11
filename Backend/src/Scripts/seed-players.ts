import { PrismaClient, Role, GameStatus, PaymentStatus, WalletTransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PLAYERS_COUNT = 10;
const INITIAL_TOP_UP = 15000; // 15,000 points initial allocation

async function main() {
  console.log('====================================================');
  console.log('🚀 GAMESTATION SEEDER: 10 PLAYERS & LIBRARY PURCHASES');
  console.log('====================================================\n');

  // 1. Fetch available published games with pricing
  const publishedGames = await prisma.game.findMany({
    where: { status: GameStatus.PUBLISHED },
    include: {
      pricing: true,
      developer: { select: { id: true, username: true } },
    },
  });

  console.log(`[CATALOG] Found ${publishedGames.length} published titles in storefront.`);
  if (publishedGames.length < 4) {
    console.warn(`[WARNING] Fewer than 4 published games found (${publishedGames.length}). Fetching all approved/non-draft titles as fallback...`);
    const allEligible = await prisma.game.findMany({
      where: { status: { in: [GameStatus.PUBLISHED, GameStatus.PENDING] } },
      include: {
        pricing: true,
        developer: { select: { id: true, username: true } },
      },
    });
    publishedGames.push(...allEligible.filter(g => !publishedGames.some(pg => pg.id === g.id)));
  }

  if (publishedGames.length === 0) {
    throw new Error('No games found in the database to purchase! Ensure games are seeded first.');
  }

  console.log(`[CATALOG] Utilizing pool of ${publishedGames.length} eligible titles for purchases.\n`);

  const hashedPassword = await bcrypt.hash('Player@01', 10);

  // 2. Loop through 10 players
  for (let i = 1; i <= PLAYERS_COUNT; i++) {
    const pad = String(i).padStart(2, '0');
    const username = `Player@${pad}`;
    const email = `player${pad}@gmail.com`;

    console.log(`----------------------------------------------------`);
    console.log(`👤 Processing Player: ${username} (${email})`);

    // Clean up existing player records if re-running
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      select: { id: true },
    });

    let userId: string;

    if (existingUser) {
      console.log(`   ↳ Existing user detected (ID: ${existingUser.id}). Resetting wallet, library, and payments...`);
      await prisma.userLibrary.deleteMany({ where: { userId: existingUser.id } });
      await prisma.payment.deleteMany({ where: { userId: existingUser.id } });
      await prisma.wallet.deleteMany({ where: { userId: existingUser.id } });

      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username,
          email,
          password: hashedPassword,
          role: Role.PLAYER,
          walletBalance: INITIAL_TOP_UP,
          isActive: true,
        },
      });
      userId = updated.id;
    } else {
      console.log(`   ↳ Creating fresh user account...`);
      const created = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: Role.PLAYER,
          walletBalance: INITIAL_TOP_UP,
          isActive: true,
        },
      });
      userId = created.id;
    }

    // Record initial top-up transaction in Wallet ledger
    await prisma.wallet.create({
      data: {
        userId,
        amount: INITIAL_TOP_UP,
        type: WalletTransactionType.TOP_UP,
        description: 'Genesis sovereign wallet allocation (+₹15,000 pts)',
      },
    });

    // 3. Select 4 to 6 games to purchase
    const gamesToBuyCount = Math.min(publishedGames.length, 4 + ((i - 1) % 3)); // 4, 5, or 6 games
    
    // Rotate game selection so different players own different libraries
    const startIndex = (i * 2) % publishedGames.length;
    const selectedGames: typeof publishedGames = [];
    for (let g = 0; g < gamesToBuyCount; g++) {
      const idx = (startIndex + g) % publishedGames.length;
      if (!selectedGames.some(sg => sg.id === publishedGames[idx].id)) {
        selectedGames.push(publishedGames[idx]);
      }
    }

    console.log(`   ↳ Purchasing ${selectedGames.length} titles...`);

    let currentBalance = INITIAL_TOP_UP;

    for (const game of selectedGames) {
      // Pick first pricing tier or fallback to standard pricing
      const pricing = game.pricing[0] || {
        id: undefined,
        price: 999,
        editionName: 'Standard Edition',
      };

      const gamePrice = Number(pricing.price) || 0;

      // Ensure player maintains at least 500 pts minimum balance
      if (currentBalance - gamePrice < 500) {
        console.log(`   ↳ [GUARD] Purchase of "${game.title}" (₹${gamePrice}) would breach 500 pts minimum balance (Current: ₹${currentBalance}). Skipping extra purchase.`);
        break;
      }

      currentBalance -= gamePrice;

      // Realistic play time: 1.5 hrs (5400s) to 32 hrs (115200s)
      const randomHours = (1.5 + Math.random() * 30).toFixed(1);
      const playTimeSeconds = Math.round(Number(randomHours) * 3600);
      const daysAgo = Math.floor(Math.random() * 10);
      const lastPlayedDate = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 36000000);

      // Create Payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          gameId: game.id,
          pricingId: pricing.id!,
          amount: gamePrice,
          currency: 'INR',
          status: PaymentStatus.SUCCESS,
          provider: 'wallet',
          providerPaymentId: `wallet_pay_${userId.slice(0, 8)}_${game.id.slice(0, 8)}_${Date.now()}`,
          createdAt: new Date(Date.now() - (daysAgo + 1) * 86400000),
        },
      });

      // Record Wallet deduction transaction
      await prisma.wallet.create({
        data: {
          userId,
          amount: gamePrice,
          type: WalletTransactionType.GAME_PURCHASE,
          description: `Purchased title "${game.title}" (${pricing.editionName})`,
          referenceId: payment.id,
          createdAt: payment.createdAt,
        },
      });

      // Add to Player Library with Playtime
      await prisma.userLibrary.create({
        data: {
          userId,
          gameId: game.id,
          pricingId: pricing.id,
          playTime: playTimeSeconds,
          lastPlayed: lastPlayedDate,
          createdAt: payment.createdAt,
        },
      });

      console.log(`      ✓ "${game.title}" [${pricing.editionName}] — ₹${gamePrice} pts | Playtime: ${randomHours} hrs (Studio: @${game.developer.username})`);
    }

    // Finalize player's updated wallet balance in User record
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: currentBalance },
    });

    console.log(`   💰 Final Wallet Balance: ₹${currentBalance.toLocaleString('en-IN')} pts (Meets >= 500 pts requirement)`);
  }

  console.log('\n====================================================');
  console.log('✅ STEP 1 COMPLETE: 10 PLAYERS SEEDED SUCCESSFULLY');
  console.log('====================================================');

  // Print Summary Table
  const allPlayers = await prisma.user.findMany({
    where: { username: { startsWith: 'Player@' } },
    include: {
      library: {
        include: {
          game: { select: { title: true } },
        },
      },
      walletTransactions: true,
    },
    orderBy: { username: 'asc' },
  });

  console.log('\n📊 SEEDED PLAYERS ROSTER:');
  for (const p of allPlayers) {
    const titlesList = p.library.map(l => `${l.game.title} (${(l.playTime / 3600).toFixed(1)}h)`).join(', ');
    console.log(`• ${p.username.padEnd(10)} | Balance: ₹${Number(p.walletBalance).toLocaleString('en-IN').padStart(7)} pts | Owned: ${p.library.length} titles [ ${titlesList} ]`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeder Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

