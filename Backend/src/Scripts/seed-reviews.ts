import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REVIEW_TEMPLATES = [
  {
    overallRating: 5,
    headline: 'Peak dark fantasy experience with flawless frame pacing',
    content:
      'Absolute masterpiece from start to finish. The boss design is unforgiving but exceptionally fair. DualSense haptic implementation and the dynamic soundtrack make every single encounter memorable. Easily in my top 3 games of the decade.',
    optimization: 5,
    funFactor: 5,
    soundDesign: 5,
    visuals: 5,
    stabilityNetcode: 4,
  },
  {
    overallRating: 5,
    headline: 'Next-generation open world immersion at its finest',
    content:
      'The city feels alive in a way no other game has managed. Ray tracing on PC with DLSS 3.5 frame gen is shockingly smooth. Incredible soundtrack, deep character arcs, and high replayability with different build specializations.',
    optimization: 4,
    funFactor: 5,
    soundDesign: 5,
    visuals: 5,
    stabilityNetcode: 4,
  },
  {
    overallRating: 4,
    headline: 'Incredible atmosphere and mechanics, minor stutter on ultra',
    content:
      'The environmental storytelling and audio design are 10/10. Combat feels weighty and impactful. Only knocking one star because the shader compilation had slight hitching in dense open areas before the recent patch.',
    optimization: 3,
    funFactor: 5,
    soundDesign: 5,
    visuals: 4,
    stabilityNetcode: 4,
  },
  {
    overallRating: 5,
    headline: 'An indie triumph with unmatched mechanical polish',
    content:
      'Every single frame is hand-crafted perfection. Responsive input latency, hypnotic soundtrack, and boss fights that test your reflexes without ever feeling cheap. Runs at a locked 144 FPS with negligible power draw.',
    optimization: 5,
    funFactor: 5,
    soundDesign: 5,
    visuals: 5,
    stabilityNetcode: 5,
  },
  {
    overallRating: 4,
    headline: 'High-octane adrenaline rush with great co-op netcode',
    content:
      'Played 20+ hours with friends across different regions and experienced zero desync or dropped packets. Progression pacing is rewarding, though inventory management could use a quality-of-life hotfix.',
    optimization: 4,
    funFactor: 5,
    soundDesign: 4,
    visuals: 4,
    stabilityNetcode: 5,
  },
  {
    overallRating: 3,
    headline: 'Fun core loop held back by unoptimized CPU bottlenecks',
    content:
      'The core gameplay loop and art direction are fantastic, but performance takes a noticeable hit during dense weather particles. Looking forward to developer patch v1.1.0 to smooth out frametimes.',
    optimization: 2,
    funFactor: 4,
    soundDesign: 4,
    visuals: 4,
    stabilityNetcode: 3,
  },
];

async function main() {
  console.log('====================================================');
  console.log('⭐ GAMESTATION SEEDER: VERIFIED PLAYER REVIEWS');
  console.log('====================================================\n');

  // Find all seeded players (Player@01 to Player@10)
  const players = await prisma.user.findMany({
    where: {
      username: { startsWith: 'Player@' },
    },
    include: {
      library: {
        include: {
          game: { select: { id: true, title: true } },
        },
      },
    },
  });

  console.log(`[PLAYERS] Found ${players.length} registered player accounts.`);

  let totalReviewsCreated = 0;

  for (const player of players) {
    console.log(`\nReviewing library for ${player.username} (${player.library.length} owned games)...`);

    // For each game the player owns, have them review 2 to 3 of them
    const gamesToReview = player.library.slice(0, 3);

    for (let idx = 0; idx < gamesToReview.length; idx++) {
      const libItem = gamesToReview[idx];
      const template = REVIEW_TEMPLATES[(totalReviewsCreated + idx) % REVIEW_TEMPLATES.length];

      // Calculate snapshot playtime (e.g. 70% of total playtime)
      const reviewPlaytime = Math.max(600, Math.floor(libItem.playTime * 0.75));

      const review = await prisma.gameReview.upsert({
        where: {
          userId_gameId: {
            userId: player.id,
            gameId: libItem.game.id,
          },
        },
        update: {
          overallRating: template.overallRating,
          headline: template.headline,
          content: template.content,
          optimization: template.optimization,
          funFactor: template.funFactor,
          soundDesign: template.soundDesign,
          visuals: template.visuals,
          stabilityNetcode: template.stabilityNetcode,
          playtimeAtReview: reviewPlaytime,
          isVerifiedOwner: true,
          updatedAt: new Date(),
        },
        create: {
          userId: player.id,
          gameId: libItem.game.id,
          overallRating: template.overallRating,
          headline: template.headline,
          content: template.content,
          optimization: template.optimization,
          funFactor: template.funFactor,
          soundDesign: template.soundDesign,
          visuals: template.visuals,
          stabilityNetcode: template.stabilityNetcode,
          playtimeAtReview: reviewPlaytime,
          isVerifiedOwner: true,
        },
      });

      totalReviewsCreated++;
      console.log(
        `  ✓ ${player.username} reviewed "${libItem.game.title}" [${review.overallRating}★ - ${(review.playtimeAtReview / 3600).toFixed(1)}h logged]`
      );
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 SUCCESS: Seeded ${totalReviewsCreated} Verified Player Reviews!`);
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

