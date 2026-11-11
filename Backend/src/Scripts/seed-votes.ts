import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('👍 GAMESTATION SEEDER: COMMUNITY REVIEW VOTES');
  console.log('====================================================\n');

  // Fetch all reviews and all players
  const reviews = await prisma.gameReview.findMany({
    include: {
      game: { select: { title: true } },
    },
  });

  const players = await prisma.user.findMany({
    where: { username: { startsWith: 'Player@' } },
  });

  console.log(`Found ${reviews.length} reviews and ${players.length} players.`);

  let totalVotes = 0;

  for (const review of reviews) {
    // Pick 2 to 5 random players who are NOT the review author
    const eligibleVoters = players.filter((p) => p.id !== review.userId);
    const votersCount = Math.min(eligibleVoters.length, 2 + Math.floor(Math.random() * 4));

    // Shuffle and pick
    const selectedVoters = eligibleVoters.sort(() => 0.5 - Math.random()).slice(0, votersCount);

    let helpfulCount = 0;
    let unhelpfulCount = 0;

    for (const voter of selectedVoters) {
      // 85% chance helpful, 15% unhelpful
      const isHelpful = Math.random() < 0.85;

      await prisma.gameReviewVote.upsert({
        where: {
          userId_reviewId: {
            userId: voter.id,
            reviewId: review.id,
          },
        },
        update: { isHelpful },
        create: {
          userId: voter.id,
          reviewId: review.id,
          isHelpful,
        },
      });

      if (isHelpful) helpfulCount++;
      else unhelpfulCount++;
      totalVotes++;
    }

    // Update review cached counters
    await prisma.gameReview.update({
      where: { id: review.id },
      data: { helpfulCount, unhelpfulCount },
    });

    console.log(
      `  ✓ Review on "${review.game.title}" received ${helpfulCount} 👍 and ${unhelpfulCount} 👎`
    );
  }

  console.log('\n====================================================');
  console.log(`🎉 SUCCESS: Seeded ${totalVotes} Community Review Votes!`);
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Seeding votes failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

