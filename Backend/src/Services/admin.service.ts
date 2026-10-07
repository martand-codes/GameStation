import { prisma } from "../prisma/db.js";
import { NotFoundError, BadRequestError } from "../Utils/errors.js";

export const getPendingGames = async () => {
  return await prisma.game.findMany({
    where: { status: "PENDING" },
  });
};

export const approveGame = async (gameId: string) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });
  if (!game) throw new NotFoundError("Game not found");
  if (game.status !== "PENDING") throw new BadRequestError("Game is not pending approval");

  return await prisma.game.update({
    where: { id: gameId },
    data: { status: "PUBLISHED" },
  });
};

export const rejectGame = async (gameId: string) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });
  if (!game) throw new NotFoundError("Game not found");
  if (game.status !== "PENDING") throw new BadRequestError("Game is not pending approval");

  return await prisma.game.update({
    where: { id: gameId },
    data: { status: "REJECTED" },
  });
};
