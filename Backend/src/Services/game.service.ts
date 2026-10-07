import { prisma } from "../prisma/db.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../Utils/errors.js";
import type { CreateGameInput, UpdateGameInput, PricingInput, DiscountInput, MediaInput, VersionInput } from "../Utils/game.validator.js";

export const createGame = async (developerId: string, data: CreateGameInput) => {
  return await prisma.game.create({
    data: {
      developerId,
      status: "DRAFT",
      title: data.title,
      genre: data.genre,
      description: data.description,
      tags: data.tags || [],
    }
  });
};

export const getDeveloperGames = async (developerId: string) => {
  return await prisma.game.findMany({
    where: { developerId }
  });
};

export const getGameById = async (gameId: string, developerId: string) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      pricing: {
        include: {
          discounts: true
        }
      },
      media: true,
      versions: true
    }
  });
  
  if (!game) throw new NotFoundError("Game not found");
  if (game.developerId !== developerId) throw new ForbiddenError("Forbidden: You do not own this game");

  return game;
};

export const updateGame = async (gameId: string, developerId: string, data: UpdateGameInput) => {
  await getGameById(gameId, developerId); // Ensuring OwnerShip

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.genre !== undefined) updateData.genre = data.genre;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.tags !== undefined) updateData.tags = data.tags;

  return await prisma.game.update({
    where: { id: gameId },
    data: updateData
  });
};

export const deleteGame = async (gameId: string, developerId: string) => {
  const game = await getGameById(gameId, developerId); // Ensuring OwnerShip

  if (game.status !== "DRAFT") {
    throw new BadRequestError("Only DRAFT games can be deleted");
  }

  await prisma.game.delete({
    where: { id: gameId }
  });
  return { message: "Game deleted successfully" };
};

export const submitGame = async (gameId: string, developerId: string) => {
  const game = await getGameById(gameId, developerId); // Ensuring OwnerShip

  if (!game.pricing) throw new BadRequestError("Cannot submit: Game pricing is missing");
  if (!game.media) throw new BadRequestError("Cannot submit: Game media is missing");
  if (!game.versions || game.versions.length === 0) {
    throw new BadRequestError("Cannot submit: Game must have at least one version uploaded");
  }

  return await prisma.game.update({
    where: { id: gameId },
    data: { status: "PENDING" }
  });
};

// --- Modular Config Updates ---

export const updateGamePricing = async (gameId: string, developerId: string, data: PricingInput) => {
  await getGameById(gameId, developerId);

  return await prisma.gamePricing.upsert({
    where: { gameId },
    update: {
      isFree: data.isFree,
      price: data.price || 0,
      currency: data.currency
    },
    create: {
      gameId,
      isFree: data.isFree,
      price: data.price || 0,
      currency: data.currency || "INR"
    }
  });
};

export const addGameDiscount = async (gameId: string, developerId: string, data: DiscountInput) => {
  const game = await getGameById(gameId, developerId);
  if (!game.pricing) throw new BadRequestError("Pricing must be set before adding discounts");

  return await prisma.gameDiscount.create({
    data: {
      pricingId: game.pricing.id,
      percentage: data.percentage,
      startsAt: data.startsAt,
      endsAt: data.endsAt
    }
  });
};

export const updateGameMedia = async (gameId: string, developerId: string, data: MediaInput) => {
  await getGameById(gameId, developerId);

  return await prisma.gameMedia.upsert({
    where: { gameId },
    update: {
      coverImageUrl: data.coverImageUrl ?? null,
      bannerImageUrl: data.bannerImageUrl ?? null
    },
    create: {
      gameId,
      coverImageUrl: data.coverImageUrl ?? null,
      bannerImageUrl: data.bannerImageUrl ?? null
    }
  });
};

export const addGameVersion = async (gameId: string, developerId: string, data: VersionInput) => {
  await getGameById(gameId, developerId);

  return await prisma.gameVersion.create({
    data: {
      gameId,
      version: data.version,
      downloadUrl: data.downloadUrl ?? null,
      changelog: data.changelog ?? null
    }
  });
};
