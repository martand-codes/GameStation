import { prisma } from "../prisma/db.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../Utils/errors.js";
import type { 
  CreateGameInput, 
  UpdateGameInput, 
  PricingInput, 
  EditionInput,
  DiscountInput, 
  MediaInput, 
  RequirementsInput,
  TelemetryInput,
  VersionInput 
} from "../Utils/game.validator.js";

export const createGame = async (developerId: string, data: CreateGameInput) => {
  return await prisma.game.create({
    data: {
      developerId,
      status: "DRAFT",
      title: data.title,
      genre: data.genre,
      description: data.description,
      tags: data.tags || [],
      ...(data.coverImageUrl || data.bannerImageUrl
        ? {
            media: {
              create: {
                coverImageUrl: data.coverImageUrl || null,
                bannerImageUrl: data.bannerImageUrl || null,
                screenshots: [],
              },
            },
          }
        : {}),
      ...(data.price !== undefined
        ? {
            pricing: {
              create: {
                editionName: "Standard Edition",
                price: data.price,
                isFree: data.price === 0,
                currency: "INR",
              },
            },
          }
        : {}),
    },
    include: {
      media: true,
      pricing: {
        include: {
          discounts: true,
        },
      },
      versions: true,
      _count: {
        select: {
          library: true,
          payments: true,
        },
      },
    },
  });
};

export const getDeveloperGames = async (developerId: string) => {
  return await prisma.game.findMany({
    where: { developerId },
    include: {
      media: true,
      pricing: {
        include: {
          discounts: true,
        },
        orderBy: { price: "asc" },
      },
      versions: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          library: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getGameById = async (gameId: string, developerId: string) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      pricing: {
        include: {
          discounts: true,
        },
        orderBy: { price: "asc" },
      },
      media: true,
      versions: {
        orderBy: { createdAt: "desc" },
      },
      requirements: true,
      telemetry: true,
      _count: {
        select: {
          library: true,
          payments: true,
        },
      },
    },
  });
  
  if (!game) throw new NotFoundError("Game not found");
  if (game.developerId !== developerId) throw new ForbiddenError("Forbidden: You do not own this game");

  return game;
};

export const assertGameEditable = (game: { status: string }) => {
  if (game.status === "PENDING") {
    throw new BadRequestError("Game is currently locked under administrative review. Modifications are frozen until review concludes.");
  }
};

export const updateGame = async (gameId: string, developerId: string, data: UpdateGameInput) => {
  const game = await getGameById(gameId, developerId); // Ensuring Ownership
  assertGameEditable(game);

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.genre !== undefined) updateData.genre = data.genre;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.tags !== undefined) updateData.tags = data.tags;

  return await prisma.game.update({
    where: { id: gameId },
    data: updateData,
  });
};

export const deleteGame = async (gameId: string, developerId: string) => {
  const game = await getGameById(gameId, developerId); // Ensuring Ownership

  if (game.status !== "DRAFT") {
    throw new BadRequestError("Only DRAFT games can be deleted");
  }

  await prisma.game.delete({
    where: { id: gameId },
  });
  return { message: "Game deleted successfully" };
};

export const submitGame = async (gameId: string, developerId: string) => {
  const game = await getGameById(gameId, developerId); // Ensuring Ownership

  if (game.status === "PENDING") {
    throw new BadRequestError("Cannot submit: Game is already pending administrative review.");
  }
  if (game.status === "PUBLISHED") {
    throw new BadRequestError("Cannot submit: Game is already published on the live storefront.");
  }

  // 1. Core Metadata Validation
  if (!game.title || game.title.trim().length < 2) {
    throw new BadRequestError("Cannot submit: Game title must be at least 2 characters.");
  }
  if (!game.genre || game.genre.trim().length === 0) {
    throw new BadRequestError("Cannot submit: Game genre is required.");
  }
  if (!game.description || game.description.trim().length < 15) {
    throw new BadRequestError("Cannot submit: Comprehensive game description (at least 15 characters) is required.");
  }

  // 2. Pricing & Editions Validation
  if (!game.pricing || game.pricing.length === 0) {
    throw new BadRequestError("Cannot submit: At least one pricing edition (e.g. Standard Edition) must be configured.");
  }

  // 3. Media Presentation Validation
  if (!game.media || !game.media.coverImageUrl) {
    throw new BadRequestError("Cannot submit: Storefront cover art image is required.");
  }
  if (!game.media.screenshots || game.media.screenshots.length === 0) {
    throw new BadRequestError("Cannot submit: At least one in-game screenshot is required.");
  }

  // 4. Hardware Specifications Validation
  const reqs = game.requirements;
  if (!reqs || !reqs.minOs || !reqs.minCpu || !reqs.minGpu || !reqs.minMem || !reqs.minStorage) {
    throw new BadRequestError("Cannot submit: Complete minimum hardware specifications (OS, CPU, GPU, RAM, Storage) must be defined.");
  }

  // 5. Version Build Validation
  if (!game.versions || game.versions.length === 0) {
    throw new BadRequestError("Cannot submit: Game must have at least one executable version build deployed.");
  }

  return await prisma.game.update({
    where: { id: gameId },
    data: { 
      status: "PENDING",
      rejectionReason: null // Reset prior rejection notes on clean resubmission
    },
  });
};

// --- Modular Config Updates ---

export const updateGamePricing = async (gameId: string, developerId: string, data: PricingInput) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);

  if (data.id) {
    return await prisma.gamePricing.update({
      where: { id: data.id },
      data: {
        editionName: data.editionName,
        features: data.features || [],
        isFree: data.isFree,
        price: data.price || 0,
        currency: data.currency || "INR",
      },
    });
  }

  const existingPricing = await prisma.gamePricing.findFirst({
    where: { gameId },
  });

  if (existingPricing) {
    return await prisma.gamePricing.update({
      where: { id: existingPricing.id },
      data: {
        editionName: data.editionName || existingPricing.editionName,
        features: data.features || existingPricing.features,
        isFree: data.isFree,
        price: data.price || 0,
        currency: data.currency || existingPricing.currency,
      },
    });
  }

  return await prisma.gamePricing.create({
    data: {
      gameId,
      editionName: data.editionName || "Standard Edition",
      features: data.features || [],
      isFree: data.isFree,
      price: data.price || 0,
      currency: data.currency || "INR",
    },
  });
};

export const addPricingEdition = async (gameId: string, developerId: string, data: EditionInput) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);

  return await prisma.gamePricing.create({
    data: {
      gameId,
      editionName: data.editionName,
      features: data.features || [],
      isFree: data.isFree,
      price: data.price || 0,
      currency: data.currency || "INR",
    },
  });
};

export const deletePricingEdition = async (gameId: string, developerId: string, pricingId: string) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);

  const count = await prisma.gamePricing.count({ where: { gameId } });
  if (count <= 1) {
    throw new BadRequestError("Cannot delete the only pricing edition for a game.");
  }

  await prisma.gamePricing.delete({
    where: { id: pricingId },
  });

  return { message: "Pricing edition removed successfully" };
};

export const addGameDiscount = async (gameId: string, developerId: string, data: DiscountInput) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);
  const targetPricingId = data.pricingId || game.pricing?.[0]?.id;
  if (!targetPricingId) throw new BadRequestError("Pricing edition must be set before adding discounts");

  return await prisma.gameDiscount.create({
    data: {
      pricingId: targetPricingId,
      percentage: data.percentage,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    },
  });
};

export const updateGameMedia = async (gameId: string, developerId: string, data: MediaInput) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);

  return await prisma.gameMedia.upsert({
    where: { gameId },
    update: {
      coverImageUrl: data.coverImageUrl ?? null,
      bannerImageUrl: data.bannerImageUrl ?? null,
      screenshots: data.screenshots || [],
      trailerUrl: data.trailerUrl ?? null,
    },
    create: {
      gameId,
      coverImageUrl: data.coverImageUrl ?? null,
      bannerImageUrl: data.bannerImageUrl ?? null,
      screenshots: data.screenshots || [],
      trailerUrl: data.trailerUrl ?? null,
    },
  });
};

export const updateGameRequirements = async (gameId: string, developerId: string, data: RequirementsInput) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);

  return await prisma.gameRequirements.upsert({
    where: { gameId },
    update: {
      minOs: data.minOs,
      minCpu: data.minCpu,
      minGpu: data.minGpu,
      minMem: data.minMem,
      minStorage: data.minStorage,
      minNetwork: data.minNetwork,
      optOs: data.optOs,
      optCpu: data.optCpu,
      optGpu: data.optGpu,
      optMem: data.optMem,
      optStorage: data.optStorage,
      optNetwork: data.optNetwork,
    },
    create: {
      gameId,
      minOs: data.minOs,
      minCpu: data.minCpu,
      minGpu: data.minGpu,
      minMem: data.minMem,
      minStorage: data.minStorage,
      minNetwork: data.minNetwork,
      optOs: data.optOs,
      optCpu: data.optCpu,
      optGpu: data.optGpu,
      optMem: data.optMem,
      optStorage: data.optStorage,
      optNetwork: data.optNetwork,
    },
  });
};

export const updateGameTelemetry = async (gameId: string, developerId: string, data: TelemetryInput) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);

  return await prisma.gameTelemetry.upsert({
    where: { gameId },
    update: {
      mainStoryHours: data.mainStoryHours ?? null,
      mainExtrasHours: data.mainExtrasHours ?? null,
      completionistHours: data.completionistHours ?? null,
    },
    create: {
      gameId,
      mainStoryHours: data.mainStoryHours ?? null,
      mainExtrasHours: data.mainExtrasHours ?? null,
      completionistHours: data.completionistHours ?? null,
    },
  });
};

export const addGameVersion = async (gameId: string, developerId: string, data: VersionInput) => {
  const game = await getGameById(gameId, developerId);
  assertGameEditable(game);

  return await prisma.gameVersion.create({
    data: {
      gameId,
      version: data.version,
      downloadUrl: data.downloadUrl ?? null,
      changelog: data.changelog ?? null,
    },
  });
};
