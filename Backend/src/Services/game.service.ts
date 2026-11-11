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

export const getDeveloperDashboardMetrics = async (
  userId: string,
  userRole: string,
  targetStudioId?: string
) => {
  const isElevated = userRole === "OWNER" || userRole === "ADMIN";

  // Determine developer filter
  let developerFilter: any = {};
  if (isElevated) {
    if (targetStudioId && targetStudioId !== "ALL") {
      developerFilter = { developerId: targetStudioId };
    } else {
      // Default elevated view: all games across the platform
      developerFilter = {};
    }
  } else {
    developerFilter = { developerId: userId };
  }

  // Fetch studio roster for elevated switcher
  let studiosList: Array<{ id: string; username: string; gamesCount: number }> = [];
  if (isElevated) {
    const devs = await prisma.user.findMany({
      where: { role: { in: ["DEVELOPER", "OWNER", "ADMIN"] } },
      select: {
        id: true,
        username: true,
        _count: { select: { games: true } },
      },
      orderBy: { username: "asc" },
    });

    studiosList = devs
      .filter((d) => d._count.games > 0)
      .map((d) => ({
        id: d.id,
        username: d.username,
        gamesCount: d._count.games,
      }));
  }

  // Fetch games for active filter
  const games = await prisma.game.findMany({
    where: developerFilter,
    include: {
      developer: {
        select: { id: true, username: true, email: true },
      },
      media: true,
      pricing: {
        include: { discounts: true },
        orderBy: { price: "asc" },
      },
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      reviewedByAdmin: {
        select: { id: true, username: true },
      },
      payments: {
        where: { status: "SUCCESS" },
        select: { amount: true, createdAt: true },
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

  // Calculate KPIs
  const totalTitles = games.length;
  const publishedTitles = games.filter((g) => g.status === "PUBLISHED").length;
  const pendingTitles = games.filter((g) => g.status === "PENDING").length;
  const rejectedTitles = games.filter((g) => g.status === "REJECTED").length;
  const draftTitles = games.filter((g) => g.status === "DRAFT").length;

  const totalPlayers = games.reduce((acc, g) => acc + (g._count.library || 0), 0);

  let grossRevenue = 0;
  for (const g of games) {
    for (const p of g.payments) {
      grossRevenue += Number(p.amount) || 0;
    }
  }

  // 70% standard developer revenue cut
  const netRevenue = Math.round(grossRevenue * 0.7);

  // Format performance list
  const performance = games.map((g) => {
    let gameGross = 0;
    for (const p of g.payments) {
      gameGross += Number(p.amount) || 0;
    }
    const lowestPrice = g.pricing[0]?.price ?? 0;
    const latestVersion = g.versions[0]?.version ?? "v1.0.0";

    return {
      id: g.id,
      title: g.title,
      genre: g.genre,
      status: g.status,
      developer: g.developer,
      coverImageUrl: g.media?.coverImageUrl || null,
      price: lowestPrice,
      editionsCount: g.pricing.length,
      version: latestVersion,
      players: g._count.library || 0,
      grossRevenue: gameGross,
      netRevenue: Math.round(gameGross * 0.7),
      qaNotes: g.qaNotes,
      reviewedByAdmin: g.reviewedByAdmin,
      reviewedAt: g.reviewedAt,
      createdAt: g.createdAt,
    };
  });

  // Synthesize chronological activity events
  const activities: Array<{
    id: string;
    type: "CERTIFICATION" | "SUBMISSION" | "VERSION" | "PURCHASE";
    title: string;
    description: string;
    timestamp: Date;
    gameTitle: string;
    gameId: string;
  }> = [];

  for (const g of games) {
    if (g.status === "PUBLISHED") {
      activities.push({
        id: `cert-${g.id}`,
        type: "CERTIFICATION",
        title: `${g.title} officially certified`,
        description: `Passed QA Ring-3 diagnostics and cleared for live storefront by @${g.reviewedByAdmin?.username || "Staff QA"}`,
        timestamp: g.reviewedAt || g.updatedAt || g.createdAt,
        gameTitle: g.title,
        gameId: g.id,
      });
    }

    if (g.versions && g.versions[0]) {
      activities.push({
        id: `ver-${g.id}`,
        type: "VERSION",
        title: `Build ${g.versions[0].version} deployed`,
        description: `Deployed executable production package for ${g.title}`,
        timestamp: g.versions[0].createdAt || g.createdAt,
        gameTitle: g.title,
        gameId: g.id,
      });
    }

    if (g.status === "PENDING") {
      activities.push({
        id: `pending-${g.id}`,
        type: "SUBMISSION",
        title: `${g.title} submitted for certification`,
        description: `Enqueued for administrator compliance review`,
        timestamp: g.updatedAt || g.createdAt,
        gameTitle: g.title,
        gameId: g.id,
      });
    }
  }

  // Sort activities chronologically (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    isElevated,
    activeStudioId: targetStudioId || (isElevated ? "ALL" : userId),
    studiosList,
    kpis: {
      totalTitles,
      publishedTitles,
      pendingTitles,
      rejectedTitles,
      draftTitles,
      totalPlayers,
      grossRevenue,
      netRevenue,
    },
    performance,
    recentActivity: activities.slice(0, 10),
  };
};
