import { prisma } from "../prisma/db.js";
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from "../Utils/errors.js";
import { getSystemControls } from "./governance.service.js";

export const getPendingGames = async (requesterId?: string) => {
  let role = "ADMIN";
  if (requesterId) {
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (requester) role = requester.role;
  }

  // PRIVACY & CLEARANCE ISOLATION:
  // Root Sovereign (OWNER) has global fleet visibility to oversee all queues.
  // Standard Staff (ADMIN) can ONLY see tickets assigned to them or unassigned in the public pool.
  // Work assigned to other admins is strictly blinded and inaccessible.
  const whereClause: any = { status: "PENDING" };
  if (role !== "OWNER" && requesterId) {
    whereClause.OR = [
      { assignedAdminId: requesterId },
      { assignedAdminId: null },
    ];
  }

  return await prisma.game.findMany({
    where: whereClause,
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
      assignedAdmin: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      },
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
  let reviewerRole = "ADMIN";
  if (reviewerId) {
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (reviewer) {
      reviewerName = reviewer.username;
      reviewerRole = reviewer.role;
    }
  }

  // TICKET COLLISION & LOCK CHECK:
  if (game.assignedAdminId && reviewerId && game.assignedAdminId !== reviewerId && reviewerRole !== "OWNER") {
    throw new ForbiddenError("Ticket is currently locked by another QA reviewer.");
  }

  // MANDATORY QA CERTIFICATION GATE:
  // Title must complete Ring-3 QA Sandbox diagnostics and have field telemetry notes recorded before storefront publication.
  // Root Sovereign (OWNER) maintains emergency release override clearance.
  if (!game.qaNotes && reviewerRole !== "OWNER") {
    throw new BadRequestError(
      "Certification Protocol Violation: Target title has not passed Ring-3 QA Sandbox diagnostics and compliance validation. Launch Sandbox Rig to complete inspection."
    );
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
  let reviewerRole = "ADMIN";
  if (reviewerId) {
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (reviewer) {
      reviewerName = reviewer.username;
      reviewerRole = reviewer.role;
    }
  }

  // TICKET COLLISION & LOCK CHECK:
  if (game.assignedAdminId && reviewerId && game.assignedAdminId !== reviewerId && reviewerRole !== "OWNER") {
    throw new ForbiddenError("Ticket is currently locked by another QA reviewer.");
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

export const getAdminDashboardMetrics = async (requesterId?: string) => {
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbLatencyMs = Date.now() - start;

  let role = "ADMIN";
  if (requesterId) {
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (requester) role = requester.role;
  }
  const isOwner = role === "OWNER";

  const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Scoped backlog query: Owner sees all, Admin sees only their assigned workload + unassigned pool
  const backlogWhere: any = { status: "PENDING" };
  const certsWhere: any = { status: { in: ["PUBLISHED", "REJECTED"] }, reviewedAt: { not: null } };
  const logsWhere: any = {
    action: {
      in: [
        "GAME_CERTIFIED",
        "GAME_REJECTED",
        "ROOT_GAME_MODERATION",
        "USER_SUSPENDED",
        "USER_RESTORED",
        "USER_ROLE_REASSIGNED",
      ],
    },
  };

  if (!isOwner && requesterId) {
    backlogWhere.OR = [
      { assignedAdminId: requesterId },
      { assignedAdminId: null },
    ];
    certsWhere.reviewedByAdminId = requesterId;
    logsWhere.actorId = requesterId;
  }

  const [
    pendingCount,
    publishedCount,
    hiddenCount,
    rejectedCount,
    totalUsersCount,
    suspendedUsersCount,
    developersCount,
    pendingBacklogRaw,
    approvedPast24h,
    rejectedPast24h,
    recentCertifications,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.game.count({ where: backlogWhere }),
    prisma.game.count({ where: { status: "PUBLISHED" } }),
    prisma.game.count({ where: { status: "HIDDEN" } }),
    prisma.game.count({ where: { status: "REJECTED" } }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { role: "DEVELOPER" } }),
    // Oldest waiting submissions first
    prisma.game.findMany({
      where: backlogWhere,
      select: {
        id: true,
        title: true,
        genre: true,
        description: true,
        updatedAt: true,
        developer: {
          select: { id: true, username: true, email: true },
        },
        pricing: {
          select: { price: true, isFree: true, editionName: true },
        },
        media: {
          select: { coverImageUrl: true, trailerUrl: true },
        },
        versions: {
          select: { version: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        assignedAdmin: {
          select: { id: true, username: true },
        },
      },
      orderBy: { updatedAt: "asc" },
      take: 6,
    }),
    prisma.game.count({
      where: {
        status: "PUBLISHED",
        reviewedAt: { gte: past24h },
        ...(!isOwner && requesterId ? { reviewedByAdminId: requesterId } : {}),
      },
    }),
    prisma.game.count({
      where: {
        status: "REJECTED",
        reviewedAt: { gte: past24h },
        ...(!isOwner && requesterId ? { reviewedByAdminId: requesterId } : {}),
      },
    }),
    prisma.game.findMany({
      where: certsWhere,
      select: {
        id: true,
        title: true,
        status: true,
        reviewedAt: true,
        rejectionReason: true,
        developer: { select: { username: true } },
        reviewedByAdmin: { select: { username: true } },
      },
      orderBy: { reviewedAt: "desc" },
      take: 6,
    }),
    prisma.governanceAuditLog.findMany({
      where: logsWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Compute SLA waiting times
  const pendingBacklog = pendingBacklogRaw.map((game) => {
    const elapsedMs = Date.now() - new Date(game.updatedAt).getTime();
    const waitingHours = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60)));
    const slaStatus: "NORMAL" | "WARNING" | "BREACHED" =
      waitingHours >= 48 ? "BREACHED" : waitingHours >= 24 ? "WARNING" : "NORMAL";

    return {
      ...game,
      waitingHours,
      slaStatus,
    };
  });

  const totalReviews24h = approvedPast24h + rejectedPast24h;
  const approvalRatePercent =
    totalReviews24h > 0 ? Math.round((approvedPast24h / totalReviews24h) * 100) : 100;

  const sovereignStatus = getSystemControls();

  return {
    kpis: {
      pendingCertifications: pendingCount,
      liveStorefrontGames: publishedCount,
      hiddenOrModeratedGames: hiddenCount,
      rejectedSubmissions: rejectedCount,
      totalUsers: totalUsersCount,
      suspendedUsers: suspendedUsersCount,
      activeDevelopers: developersCount,
    },
    velocity: {
      approvedPast24h,
      rejectedPast24h,
      totalReviews24h,
      approvalRatePercent,
    },
    pendingBacklog,
    recentCertifications,
    recentAuditLogs,
    sovereignStatus: {
      maintenanceMode: sovereignStatus.maintenanceMode,
      maintenanceNotice: sovereignStatus.maintenanceNotice,
      marketplaceFrozen: sovereignStatus.marketplaceFrozen,
      submissionsFrozen: sovereignStatus.submissionsFrozen,
      broadcastActive: sovereignStatus.broadcastActive,
      broadcastMessage: sovereignStatus.broadcastMessage,
      broadcastSeverity: sovereignStatus.broadcastSeverity,
    },
    telemetry: {
      dbLatencyMs,
      timestamp: new Date().toISOString(),
    },
  };
};

export const getAdminProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) throw new NotFoundError("Staff account not found");

  return {
    ...user,
    clearanceLevel: user.role === "OWNER" ? "ROOT_SOVEREIGN" : "LEVEL_1_OPERATOR",
    themeCode: user.role === "OWNER" ? "RUBY_RED" : "NAVY_BLUE",
  };
};

export const getAdminCatalog = async (search?: string, status?: string) => {
  const whereClause: any = {};
  if (status && status !== "ALL") {
    whereClause.status = status;
  }
  if (search && search.trim()) {
    whereClause.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { genre: { contains: search.trim(), mode: "insensitive" } },
      { developer: { username: { contains: search.trim(), mode: "insensitive" } } },
    ];
  }

  return await prisma.game.findMany({
    where: whereClause,
    include: {
      developer: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      pricing: true,
      media: true,
      reviewedByAdmin: {
        select: {
          id: true,
          username: true,
        },
      },
      _count: {
        select: {
          payments: true,
          library: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

export const moderateAdminGame = async (data: {
  gameId: string;
  status: "PUBLISHED" | "HIDDEN" | "REJECTED";
  reason?: string | undefined;
  adminId: string;
  ipAddress?: string | undefined;
}) => {
  const { gameId, status, reason, adminId, ipAddress } = data;
  const staff = await prisma.user.findUnique({ where: { id: adminId } });
  if (!staff || (staff.role !== "ADMIN" && staff.role !== "OWNER")) {
    throw new ForbiddenError("Insufficient clearance for catalog moderation.");
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new NotFoundError("Game not found");

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      status,
      rejectionReason: reason || null,
      reviewedByAdminId: adminId,
      reviewedAt: new Date(),
    },
  });

  await prisma.governanceAuditLog.create({
    data: {
      action: "ROOT_GAME_MODERATION",
      actorId: adminId,
      actorName: staff.username,
      targetId: gameId,
      targetName: game.title,
      details: `[STAFF MODERATION] Title "${game.title}" status shifted to [${status}]. Note: ${reason || "Standard moderation directive"}`,
      ipAddress: ipAddress || "127.0.0.1",
    },
  });

  return updated;
};

export const getAdminUsers = async (search?: string, role?: string, status?: string) => {
  const whereClause: any = {};
  if (role && role !== "ALL") {
    whereClause.role = role;
  }
  if (status && status !== "ALL") {
    whereClause.isActive = status === "ACTIVE";
  }
  if (search && search.trim()) {
    whereClause.OR = [
      { username: { contains: search.trim(), mode: "insensitive" } },
      { email: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  return await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      walletBalance: true,
      createdAt: true,
      _count: {
        select: {
          games: true,
          library: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

export const moderateAdminUserSuspension = async (data: {
  targetUserId: string;
  adminId: string;
  reason?: string | undefined;
  ipAddress?: string | undefined;
}) => {
  const { targetUserId, adminId, reason, ipAddress } = data;
  const staff = await prisma.user.findUnique({ where: { id: adminId } });
  if (!staff || (staff.role !== "ADMIN" && staff.role !== "OWNER")) {
    throw new ForbiddenError("Insufficient clearance for user account moderation.");
  }

  if (targetUserId === adminId) {
    throw new BadRequestError("You cannot alter your own staff standing.");
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new NotFoundError("Target user not found");

  if (staff.role === "ADMIN" && (target.role === "OWNER" || target.role === "ADMIN")) {
    throw new ForbiddenError("Operator clearance insufficient: You cannot suspend Platform Leadership or fellow staff.");
  }

  if (target.role === "OWNER") {
    throw new ForbiddenError("The Root Sovereign cannot be suspended.");
  }

  const newStatus = !target.isActive;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: targetUserId },
      data: { isActive: newStatus },
    });

    if (!newStatus) {
      await (tx.session as any).deleteMany({
        where: { userId: targetUserId },
      });
    }

    await tx.governanceAuditLog.create({
      data: {
        action: newStatus ? "USER_RESTORED" : "USER_SUSPENDED",
        actorId: adminId,
        actorName: staff.username,
        targetId: targetUserId,
        targetName: target.username,
        details: `[STAFF ACTION] User @${target.username} (${target.role}) set to ${newStatus ? "ACTIVE" : "SUSPENDED"}. Directive: ${reason || "Terms enforcement"}`,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });
  });

  return {
    userId: targetUserId,
    isActive: newStatus,
    message: `Account @${target.username} marked as ${newStatus ? "Active" : "Suspended"}.`,
  };
};

export const updateUserRole = async (data: {
  targetUserId: string;
  newRole: "ADMIN" | "PLAYER" | "DEVELOPER";
  actingStaffId: string;
  reason?: string | undefined;
  ipAddress?: string | undefined;
}) => {
  const { targetUserId, newRole, actingStaffId, reason, ipAddress } = data;
  const actingStaff = await prisma.user.findUnique({ where: { id: actingStaffId } });
  if (!actingStaff) {
    throw new ForbiddenError("Acting staff not found.");
  }

  // Only the Platform Owner can promote to ADMIN or demote ADMINs
  if (actingStaff.role !== "OWNER") {
    throw new ForbiddenError("Clearance Denied: Only the Platform Owner holds authority to grant or revoke Admin clearance.");
  }

  if (targetUserId === actingStaffId) {
    throw new BadRequestError("The Platform Owner cannot alter their own root sovereignty.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    throw new NotFoundError("Target user not found.");
  }

  if (targetUser.role === "OWNER") {
    throw new ForbiddenError("Cannot alter the role of the Platform Owner.");
  }

  if (targetUser.role === newRole) {
    throw new BadRequestError(`User @${targetUser.username} already holds the role of ${newRole}.`);
  }

  const oldRole = targetUser.role;

  // If demoting an admin who holds active game review locks, release those tickets back to the unassigned pool
  if (oldRole === "ADMIN" && newRole !== "ADMIN") {
    await prisma.game.updateMany({
      where: { assignedAdminId: targetUserId, status: "PENDING" },
      data: { assignedAdminId: null, assignedAt: null },
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole as any },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      walletBalance: true,
      createdAt: true,
      _count: {
        select: {
          games: true,
          library: true,
          payments: true,
        },
      },
    },
  });

  const isStaffPromotion = newRole === "ADMIN";
  const isStaffRevocation = oldRole === "ADMIN";

  const actionName = isStaffPromotion
    ? "STAFF_PROMOTED"
    : isStaffRevocation
    ? "STAFF_REVOKED"
    : "USER_ROLE_REASSIGNED";

  const directiveDetails = isStaffPromotion
    ? `[STAFF PROMOTION] Owner @${actingStaff.username} elevated @${targetUser.username} to ADMIN (Staff Operator). Reason: ${reason || "Field promotion"}`
    : isStaffRevocation
    ? `[STAFF REVOCATION] Owner @${actingStaff.username} revoked Admin clearance for @${targetUser.username}, transitioning account to ${newRole}. Reason: ${reason || "Clearance decommissioned"}`
    : `[ROLE REASSIGNMENT] User @${targetUser.username} role changed from ${oldRole} to ${newRole} by @${actingStaff.username}.`;

  await prisma.governanceAuditLog.create({
    data: {
      action: actionName,
      actorId: actingStaffId,
      actorName: actingStaff.username,
      targetId: targetUserId,
      targetName: targetUser.username,
      details: directiveDetails,
      ipAddress: ipAddress || "127.0.0.1",
    },
  });

  return {
    user: updatedUser,
    message: isStaffPromotion
      ? `User @${targetUser.username} has been successfully promoted to Staff Admin!`
      : isStaffRevocation
      ? `Staff clearance revoked for @${targetUser.username}. Transitioned to ${newRole}.`
      : `Role for @${targetUser.username} updated to ${newRole}.`,
  };
};

export const getAdminAuditLogs = async (limit = 100, action?: string) => {
  const whereClause: any = {};
  if (action && action !== "ALL") {
    whereClause.action = action;
  }

  return await prisma.governanceAuditLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const getStaffRoster = async () => {
  return await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "OWNER"] },
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedGameReviews: {
            where: { status: "PENDING" },
          },
          reviewedGames: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

export const claimGameReview = async (data: {
  gameId: string;
  adminId: string;
  ipAddress?: string | undefined;
}) => {
  const { gameId, adminId, ipAddress } = data;
  const staff = await prisma.user.findUnique({ where: { id: adminId } });
  if (!staff || (staff.role !== "ADMIN" && staff.role !== "OWNER")) {
    throw new ForbiddenError("Insufficient clearance to claim review tickets.");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { assignedAdmin: { select: { id: true, username: true } } },
  });
  if (!game) throw new NotFoundError("Game submission not found");
  if (game.status !== "PENDING") throw new BadRequestError("Only pending submissions can be claimed");

  if (game.assignedAdminId && game.assignedAdminId !== adminId) {
    throw new ConflictError(`This game is currently claimed by @${game.assignedAdmin?.username || "another staff member"}`);
  }

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      assignedAdminId: adminId,
      assignedAt: new Date(),
    },
    include: {
      assignedAdmin: {
        select: { id: true, username: true, email: true, role: true },
      },
      developer: { select: { username: true } },
    },
  });

  await prisma.governanceAuditLog.create({
    data: {
      action: "GAME_REVIEW_CLAIMED",
      actorId: adminId,
      actorName: staff.username,
      targetId: gameId,
      targetName: game.title,
      details: `[TICKET CLAIM] Staff @${staff.username} claimed review ticket for "${game.title}". Review status locked.`,
      ipAddress: ipAddress || "127.0.0.1",
    },
  });

  return updated;
};

export const releaseGameReview = async (data: {
  gameId: string;
  adminId: string;
  ipAddress?: string | undefined;
}) => {
  const { gameId, adminId, ipAddress } = data;
  const staff = await prisma.user.findUnique({ where: { id: adminId } });
  if (!staff || (staff.role !== "ADMIN" && staff.role !== "OWNER")) {
    throw new ForbiddenError("Insufficient clearance to release review tickets.");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { assignedAdmin: { select: { id: true, username: true } } },
  });
  if (!game) throw new NotFoundError("Game submission not found");

  if (game.assignedAdminId && game.assignedAdminId !== adminId && staff.role !== "OWNER") {
    throw new ForbiddenError("You cannot release a ticket claimed by another operator unless you hold Owner clearance.");
  }

  const previousClaimant = game.assignedAdmin?.username || "unassigned";

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      assignedAdminId: null,
      assignedAt: null,
    },
    include: {
      assignedAdmin: {
        select: { id: true, username: true, email: true, role: true },
      },
      developer: { select: { username: true } },
    },
  });

  await prisma.governanceAuditLog.create({
    data: {
      action: "GAME_REVIEW_RELEASED",
      actorId: adminId,
      actorName: staff.username,
      targetId: gameId,
      targetName: game.title,
      details: `[TICKET RELEASED] Review ticket for "${game.title}" (previously held by @${previousClaimant}) released back to unassigned queue by @${staff.username}.`,
      ipAddress: ipAddress || "127.0.0.1",
    },
  });

  return updated;
};

export const assignGameReview = async (data: {
  gameId: string;
  targetAdminId: string;
  actingStaffId: string;
  ipAddress?: string | undefined;
}) => {
  const { gameId, targetAdminId, actingStaffId, ipAddress } = data;
  const actingStaff = await prisma.user.findUnique({ where: { id: actingStaffId } });
  if (!actingStaff || (actingStaff.role !== "ADMIN" && actingStaff.role !== "OWNER")) {
    throw new ForbiddenError("Insufficient clearance to delegate tickets.");
  }

  const targetAdmin = await prisma.user.findUnique({ where: { id: targetAdminId } });
  if (!targetAdmin || (targetAdmin.role !== "ADMIN" && targetAdmin.role !== "OWNER") || !targetAdmin.isActive) {
    throw new BadRequestError("Target staff member not found or is inactive.");
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new NotFoundError("Game submission not found");
  if (game.status !== "PENDING") throw new BadRequestError("Only pending submissions can be delegated");

  // DELEGATION CLEARANCE RULE:
  // Root Sovereign (OWNER) can delegate ANY ticket across all staff.
  // Standard Staff (ADMIN) can ONLY delegate a ticket that is currently assigned to THEMSELVES (or unassigned).
  // An admin cannot reassign, hijack, or steal another admin's locked ticket!
  if (game.assignedAdminId && game.assignedAdminId !== actingStaffId && actingStaff.role !== "OWNER") {
    throw new ForbiddenError(
      "Privilege Violation: You cannot reassign a ticket held by another staff reviewer. Only the Sovereign Owner or the holding reviewer can delegate this ticket."
    );
  }

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      assignedAdminId: targetAdminId,
      assignedAt: new Date(),
    },
    include: {
      assignedAdmin: {
        select: { id: true, username: true, email: true, role: true },
      },
      developer: { select: { username: true } },
    },
  });

  await prisma.governanceAuditLog.create({
    data: {
      action: "GAME_REVIEW_DELEGATED",
      actorId: actingStaffId,
      actorName: actingStaff.username,
      targetId: gameId,
      targetName: game.title,
      details: `[TICKET DELEGATED] Staff @${actingStaff.username} assigned review ticket for "${game.title}" to @${targetAdmin.username}.`,
      ipAddress: ipAddress || "127.0.0.1",
    },
  });

  return updated;
};

export const saveQANotes = async (data: {
  gameId: string;
  adminId: string;
  qaNotes: string;
  ipAddress?: string | undefined;
}) => {
  const { gameId, adminId, qaNotes, ipAddress } = data;
  const staff = await prisma.user.findUnique({ where: { id: adminId } });
  if (!staff || (staff.role !== "ADMIN" && staff.role !== "OWNER")) {
    throw new ForbiddenError("Insufficient clearance to submit QA logs.");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { assignedAdmin: { select: { id: true, username: true } } },
  });
  if (!game) throw new NotFoundError("Game submission not found");
  if (game.status !== "PENDING") throw new BadRequestError("Only pending submissions can have QA notes recorded");

  if (game.assignedAdminId && game.assignedAdminId !== adminId && staff.role !== "OWNER") {
    throw new ForbiddenError("Ticket is currently locked by another QA reviewer.");
  }

  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      qaNotes: qaNotes.trim(),
      assignedAdminId: game.assignedAdminId || adminId,
      assignedAt: game.assignedAt || new Date(),
    },
    include: {
      assignedAdmin: {
        select: { id: true, username: true, email: true, role: true },
      },
      developer: { select: { username: true } },
    },
  });

  await prisma.governanceAuditLog.create({
    data: {
      action: "GAME_QA_NOTES_SAVED",
      actorId: adminId,
      actorName: staff.username,
      targetId: gameId,
      targetName: game.title,
      details: `[QA TELEMETRY RECORDED] Operator @${staff.username} recorded test harness field notes & diagnostics for "${game.title}".`,
      ipAddress: ipAddress || "127.0.0.1",
    },
  });

  return updated;
};

