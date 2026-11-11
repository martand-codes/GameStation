import { prisma } from "../prisma/db.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../Utils/errors.js";

export interface SubmitReviewInput {
  gameId: string;
  overallRating: number;
  headline?: string;
  content: string;
  optimization?: number;
  funFactor?: number;
  soundDesign?: number;
  visuals?: number;
  stabilityNetcode?: number;
}

export const submitReview = async (userId: string, data: SubmitReviewInput) => {
  if (!data.gameId) {
    throw new BadRequestError("Game ID is required.");
  }

  // Validate Overall 5-Star Rating
  const rating = Number(data.overallRating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new BadRequestError("Overall rating must be an integer between 1 and 5 stars.");
  }

  if (!data.content || !data.content.trim()) {
    throw new BadRequestError("Review feedback content cannot be empty.");
  }

  // Validate optional Deep-Dive sub-scores (1 to 5)
  const validateSubScore = (val?: number, name?: string) => {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (!Number.isInteger(num) || num < 1 || num > 5) {
        throw new BadRequestError(`${name} score must be an integer between 1 and 5.`);
      }
      return num;
    }
    return null;
  };

  const optimization = validateSubScore(data.optimization, "Optimization");
  const funFactor = validateSubScore(data.funFactor, "Fun Factor");
  const soundDesign = validateSubScore(data.soundDesign, "Sound Design");
  const visuals = validateSubScore(data.visuals, "Visuals");
  const stabilityNetcode = validateSubScore(data.stabilityNetcode, "Stability & Connectivity");

  // Verify the target game exists and is published
  const game = await prisma.game.findUnique({
    where: { id: data.gameId },
    select: { id: true, title: true, status: true },
  });

  if (!game) {
    throw new NotFoundError("Game not found.");
  }

  // Verify Player Ownership in UserLibrary (Steam-Grade Verification)
  const libraryRecord = await prisma.userLibrary.findUnique({
    where: {
      userId_gameId: {
        userId,
        gameId: data.gameId,
      },
    },
  });

  if (!libraryRecord) {
    throw new ForbiddenError(
      "Verified Ownership Required: You must own this digital license in your GameStation Library to publish a review."
    );
  }

  // Upsert the Verified Player Review
  const review = await prisma.gameReview.upsert({
    where: {
      userId_gameId: {
        userId,
        gameId: data.gameId,
      },
    },
    update: {
      overallRating: rating,
      headline: data.headline?.trim() || null,
      content: data.content.trim(),
      optimization,
      funFactor,
      soundDesign,
      visuals,
      stabilityNetcode,
      playtimeAtReview: libraryRecord.playTime,
      updatedAt: new Date(),
    },
    create: {
      userId,
      gameId: data.gameId,
      overallRating: rating,
      headline: data.headline?.trim() || null,
      content: data.content.trim(),
      optimization,
      funFactor,
      soundDesign,
      visuals,
      stabilityNetcode,
      playtimeAtReview: libraryRecord.playTime,
      isVerifiedOwner: true,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
  });

  return review;
};

export const getGameReviews = async (
  gameId: string,
  currentUserId?: string,
  sortBy: string = 'helpful'
) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true },
  });

  if (!game) {
    throw new NotFoundError("Game not found.");
  }

  // Construct Sorting Condition
  let orderByClause: any = [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
  if (sortBy === 'recent') {
    orderByClause = { createdAt: 'desc' };
  } else if (sortBy === 'highest') {
    orderByClause = [{ overallRating: 'desc' }, { helpfulCount: 'desc' }];
  } else if (sortBy === 'lowest') {
    orderByClause = [{ overallRating: 'asc' }, { helpfulCount: 'desc' }];
  }

  const reviews = await prisma.gameReview.findMany({
    where: { gameId },
    orderBy: orderByClause,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
  });

  // Calculate Aggregates
  const total = reviews.length;
  let sumRating = 0;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let optSum = 0, optCount = 0;
  let funSum = 0, funCount = 0;
  let sndSum = 0, sndCount = 0;
  let visSum = 0, visCount = 0;
  let stabSum = 0, stabCount = 0;

  for (const r of reviews) {
    sumRating += r.overallRating;
    if (distribution[r.overallRating] !== undefined) {
      distribution[r.overallRating]++;
    }
    if (r.optimization != null) { optSum += r.optimization; optCount++; }
    if (r.funFactor != null) { funSum += r.funFactor; funCount++; }
    if (r.soundDesign != null) { sndSum += r.soundDesign; sndCount++; }
    if (r.visuals != null) { visSum += r.visuals; visCount++; }
    if (r.stabilityNetcode != null) { stabSum += r.stabilityNetcode; stabCount++; }
  }

  const averageRating = total > 0 ? Number((sumRating / total).toFixed(1)) : 0;

  let sentiment = "NO REVIEWS YET";
  if (total > 0) {
    if (averageRating >= 4.5) sentiment = "OVERWHELMINGLY POSITIVE";
    else if (averageRating >= 4.0) sentiment = "VERY POSITIVE";
    else if (averageRating >= 3.5) sentiment = "MOSTLY POSITIVE";
    else if (averageRating >= 2.5) sentiment = "MIXED";
    else sentiment = "MOSTLY NEGATIVE";
  }

  // Deep Dive Telemetry Averages
  const deepDiveAverages = {
    optimization: optCount > 0 ? Number((optSum / optCount).toFixed(1)) : null,
    funFactor: funCount > 0 ? Number((funSum / funCount).toFixed(1)) : null,
    soundDesign: sndCount > 0 ? Number((sndSum / sndCount).toFixed(1)) : null,
    visuals: visCount > 0 ? Number((visSum / visCount).toFixed(1)) : null,
    stabilityNetcode: stabCount > 0 ? Number((stabSum / stabCount).toFixed(1)) : null,
  };

  // User Library & Vote Status
  let userStatus = {
    isOwner: false,
    playTimeSeconds: 0,
    hasReviewed: false,
    userReview: null as any,
  };

  const userVotesMap = new Map<string, boolean>();

  if (currentUserId) {
    const libraryRecord = await prisma.userLibrary.findUnique({
      where: {
        userId_gameId: {
          userId: currentUserId,
          gameId,
        },
      },
    });

    if (libraryRecord) {
      userStatus.isOwner = true;
      userStatus.playTimeSeconds = libraryRecord.playTime;
    }

    const existingReview = reviews.find((r) => r.userId === currentUserId);
    if (existingReview) {
      userStatus.hasReviewed = true;
      userStatus.userReview = existingReview;
    }

    // Bulk fetch current user's votes on these reviews
    if (reviews.length > 0) {
      const votes = await prisma.gameReviewVote.findMany({
        where: {
          userId: currentUserId,
          reviewId: { in: reviews.map((r) => r.id) },
        },
        select: { reviewId: true, isHelpful: true },
      });
      votes.forEach((v) => userVotesMap.set(v.reviewId, v.isHelpful));
    }
  }

  const enrichedReviews = reviews.map((r) => ({
    ...r,
    userVote: userVotesMap.has(r.id) ? (userVotesMap.get(r.id) ?? null) : null,
  }));

  return {
    gameId,
    gameTitle: game.title,
    summary: {
      totalReviews: total,
      averageRating,
      sentiment,
      ratingDistribution: distribution,
      deepDiveAverages,
    },
    userStatus,
    reviews: enrichedReviews,
  };
};

export const voteReview = async (userId: string, reviewId: string, isHelpful: boolean) => {
  const review = await prisma.gameReview.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, helpfulCount: true, unhelpfulCount: true },
  });

  if (!review) {
    throw new NotFoundError("Review not found.");
  }

  if (review.userId === userId) {
    throw new BadRequestError("Community Integrity Rule: You cannot vote on your own review.");
  }

  const existingVote = await prisma.gameReviewVote.findUnique({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  });

  let userVote: boolean | null = null;
  let helpfulChange = 0;
  let unhelpfulChange = 0;

  if (!existingVote) {
    // 1. New Vote
    await prisma.gameReviewVote.create({
      data: {
        userId,
        reviewId,
        isHelpful,
      },
    });
    userVote = isHelpful;
    if (isHelpful) helpfulChange = 1;
    else unhelpfulChange = 1;
  } else if (existingVote.isHelpful === isHelpful) {
    // 2. Toggle Off (Clicking the active button removes vote)
    await prisma.gameReviewVote.delete({
      where: { id: existingVote.id },
    });
    userVote = null;
    if (isHelpful) helpfulChange = -1;
    else unhelpfulChange = -1;
  } else {
    // 3. Switch Vote (from helpful to unhelpful or vice versa)
    await prisma.gameReviewVote.update({
      where: { id: existingVote.id },
      data: { isHelpful },
    });
    userVote = isHelpful;
    if (isHelpful) {
      helpfulChange = 1;
      unhelpfulChange = -1;
    } else {
      helpfulChange = -1;
      unhelpfulChange = 1;
    }
  }

  const updatedReview = await prisma.gameReview.update({
    where: { id: reviewId },
    data: {
      helpfulCount: { increment: helpfulChange },
      unhelpfulCount: { increment: unhelpfulChange },
    },
    select: { id: true, helpfulCount: true, unhelpfulCount: true },
  });

  return {
    success: true,
    userVote,
    helpfulCount: Math.max(0, updatedReview.helpfulCount),
    unhelpfulCount: Math.max(0, updatedReview.unhelpfulCount),
  };
};

export const deleteReview = async (userId: string, userRole: string, reviewId: string) => {
  const review = await prisma.gameReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError("Review not found.");
  }

  // Only the review author, or ROOT OWNER / ADMIN can delete
  const isAuthor = review.userId === userId;
  const isStaff = userRole === "OWNER" || userRole === "ADMIN";

  if (!isAuthor && !isStaff) {
    throw new ForbiddenError("You do not have permission to delete this review.");
  }

  await prisma.gameReview.delete({
    where: { id: reviewId },
  });

  return { success: true, message: "Review deleted successfully." };
};

export const getStudioReviews = async (
  userId: string,
  userRole: string,
  studioId?: string,
  gameId?: string
) => {
  const isElevated = userRole === 'OWNER' || userRole === 'ADMIN';

  // Determine game filter based on developer ownership or sovereign view
  let gameFilter: any = {};
  if (isElevated) {
    if (studioId && studioId !== 'ALL') {
      gameFilter.developerId = studioId;
    }
  } else {
    gameFilter.developerId = userId;
  }

  if (gameId && gameId !== 'ALL') {
    gameFilter.id = gameId;
  }

  // Fetch games eligible under this filter
  const eligibleGames = await prisma.game.findMany({
    where: gameFilter,
    select: {
      id: true,
      title: true,
      genre: true,
      developerId: true,
      developer: { select: { id: true, username: true } },
      media: { select: { coverImageUrl: true } },
    },
  });

  const eligibleGameIds = eligibleGames.map((g) => g.id);

  if (eligibleGameIds.length === 0) {
    return {
      reviews: [],
      summary: {
        totalReviews: 0,
        averageRating: 0,
        sentiment: 'NO REVIEWS YET',
        unansweredCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        deepDiveAverages: {
          optimization: null,
          funFactor: null,
          soundDesign: null,
          visuals: null,
          stabilityNetcode: null,
        },
      },
      gamesList: eligibleGames,
    };
  }

  const reviews = await prisma.gameReview.findMany({
    where: {
      gameId: { in: eligibleGameIds },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
      game: {
        select: {
          id: true,
          title: true,
          developer: { select: { id: true, username: true } },
          media: { select: { coverImageUrl: true } },
        },
      },
    },
  });

  // Calculate Aggregates
  const total = reviews.length;
  let sumRating = 0;
  let unansweredCount = 0;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let optSum = 0, optCount = 0;
  let funSum = 0, funCount = 0;
  let sndSum = 0, sndCount = 0;
  let visSum = 0, visCount = 0;
  let stabSum = 0, stabCount = 0;

  for (const r of reviews) {
    sumRating += r.overallRating;
    if (distribution[r.overallRating] !== undefined) {
      distribution[r.overallRating]++;
    }
    if (!r.developerResponse) unansweredCount++;
    if (r.optimization != null) { optSum += r.optimization; optCount++; }
    if (r.funFactor != null) { funSum += r.funFactor; funCount++; }
    if (r.soundDesign != null) { sndSum += r.soundDesign; sndCount++; }
    if (r.visuals != null) { visSum += r.visuals; visCount++; }
    if (r.stabilityNetcode != null) { stabSum += r.stabilityNetcode; stabCount++; }
  }

  const averageRating = total > 0 ? Number((sumRating / total).toFixed(1)) : 0;

  let sentiment = 'NO REVIEWS YET';
  if (total > 0) {
    if (averageRating >= 4.5) sentiment = 'OVERWHELMINGLY POSITIVE';
    else if (averageRating >= 4.0) sentiment = 'VERY POSITIVE';
    else if (averageRating >= 3.5) sentiment = 'MOSTLY POSITIVE';
    else if (averageRating >= 2.5) sentiment = 'MIXED';
    else sentiment = 'MOSTLY NEGATIVE';
  }

  const deepDiveAverages = {
    optimization: optCount > 0 ? Number((optSum / optCount).toFixed(1)) : null,
    funFactor: funCount > 0 ? Number((funSum / funCount).toFixed(1)) : null,
    soundDesign: sndCount > 0 ? Number((sndSum / sndCount).toFixed(1)) : null,
    visuals: visCount > 0 ? Number((visSum / visCount).toFixed(1)) : null,
    stabilityNetcode: stabCount > 0 ? Number((stabSum / stabCount).toFixed(1)) : null,
  };

  return {
    reviews,
    summary: {
      totalReviews: total,
      averageRating,
      sentiment,
      unansweredCount,
      ratingDistribution: distribution,
      deepDiveAverages,
    },
    gamesList: eligibleGames,
  };
};

export const replyToReview = async (
  userId: string,
  userRole: string,
  reviewId: string,
  response: string
) => {
  if (!response || !response.trim()) {
    throw new BadRequestError("Developer response cannot be empty.");
  }

  const review = await prisma.gameReview.findUnique({
    where: { id: reviewId },
    include: {
      game: { select: { developerId: true, title: true } },
    },
  });

  if (!review) {
    throw new NotFoundError("Review not found.");
  }

  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';
  const isGameDeveloper = review.game.developerId === userId;

  if (!isGameDeveloper && !isOwnerOrAdmin) {
    throw new ForbiddenError(
      "Clearance Denied: Only the creator of this title or platform administration can publish an official response."
    );
  }

  const updated = await prisma.gameReview.update({
    where: { id: reviewId },
    data: {
      developerResponse: response.trim(),
      developerRespondedAt: new Date(),
    },
    include: {
      user: { select: { id: true, username: true } },
      game: { select: { id: true, title: true } },
    },
  });

  return updated;
};

export const deleteReply = async (userId: string, userRole: string, reviewId: string) => {
  const review = await prisma.gameReview.findUnique({
    where: { id: reviewId },
    include: {
      game: { select: { developerId: true } },
    },
  });

  if (!review) {
    throw new NotFoundError("Review not found.");
  }

  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';
  const isGameDeveloper = review.game.developerId === userId;

  if (!isGameDeveloper && !isOwnerOrAdmin) {
    throw new ForbiddenError(
      "Clearance Denied: Only the creator of this title or platform administration can remove this official response."
    );
  }

  const updated = await prisma.gameReview.update({
    where: { id: reviewId },
    data: {
      developerResponse: null,
      developerRespondedAt: null,
    },
  });

  return updated;
};

