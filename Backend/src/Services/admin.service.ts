import { prisma } from "../prisma/db.js";
import { NotFoundError, BadRequestError } from "../Utils/errors.js";

export const getPendingGames = async () => {
  return await prisma.game.findMany({
    where: { status: "PENDING" },
    include: {
      developer: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      pricing: {
        include: {
          discounts: true,
        },
      },
      media: true,
      versions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      requirements: true,
      telemetry: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const approveGame = async (gameId: string, reviewerId?: string) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { developer: true },
  });
  if (!game) throw new NotFoundError("Game not found");
  if (game.status !== "PENDING") throw new BadRequestError("Game is not pending certification approval");

  let reviewerName = "System Sentinel";
  if (reviewerId) {
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (reviewer) reviewerName = reviewer.username;
  }

  const updatedGame = await prisma.game.update({
    where: { id: gameId },
    data: {
      status: "PUBLISHED",
      reviewedByAdminId: reviewerId || null,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
    include: {
      developer: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // Record into immutable flight recorder
  await prisma.governanceAuditLog.create({
    data: {
      action: "GAME_CERTIFIED",
      actorId: reviewerId || null,
      actorName: reviewerName,
      targetId: gameId,
      targetName: game.title,
      details: `Title "${game.title}" officially certified and published to the live storefront by @${reviewerName}.`,
    },
  });

  return updatedGame;
};

export const rejectGame = async (gameId: string, reviewerId?: string, reason?: string) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { developer: true },
  });
  if (!game) throw new NotFoundError("Game not found");
  if (game.status !== "PENDING") throw new BadRequestError("Game is not pending certification approval");

  const rejectionReason = reason?.trim() || "Submission does not meet GameStation platform quality and security guidelines.";

  let reviewerName = "System Sentinel";
  if (reviewerId) {
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (reviewer) reviewerName = reviewer.username;
  }

  const updatedGame = await prisma.game.update({
    where: { id: gameId },
    data: {
      status: "REJECTED",
      rejectionReason,
      reviewedByAdminId: reviewerId || null,
      reviewedAt: new Date(),
    },
    include: {
      developer: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // Record into immutable flight recorder
  await prisma.governanceAuditLog.create({
    data: {
      action: "GAME_REJECTED",
      actorId: reviewerId || null,
      actorName: reviewerName,
      targetId: gameId,
      targetName: game.title,
      details: `Title "${game.title}" rejected certification: ${rejectionReason}`,
    },
  });

  return updatedGame;
};
