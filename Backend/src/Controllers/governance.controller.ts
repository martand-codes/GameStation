import type { Request, Response, NextFunction } from "express";
import * as governanceService from "../Services/governance.service.js";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";

export const getStatus = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await governanceService.getGovernanceStatus();
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

export const claimRoot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    const userAgent = req.headers["user-agent"] as string | undefined;
    const ipAddress = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress) as string | undefined;

    const result = await governanceService.claimRootOwnership({
      username,
      email,
      password,
      userAgent,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      message: "Platform root authority claimed. Genesis ceremony completed.",
      user: result.user,
      accessToken: result.session.accessToken,
      refreshToken: result.session.refreshToken,
      recoveryPhrase: result.recoveryPhrase,
    });
  } catch (error) {
    next(error);
  }
};

export const createStaffInvite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { role, expiresInHours } = req.body;
    const ipAddress = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress) as string | undefined;

    const invite = await governanceService.createStaffInvite({
      ownerId,
      role,
      expiresInHours: expiresInHours ? Number(expiresInHours) : 24,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      message: "Staff invitation generated successfully.",
      invite,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffInvites = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invites = await governanceService.getStaffInvites();
    res.status(200).json(invites);
  } catch (error) {
    next(error);
  }
};

export const revokeStaffInvite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const inviteId = req.params.id as string;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    await governanceService.revokeStaffInvite(inviteId, ownerId, ipAddress);
    res.status(200).json({ success: true, message: "Invitation revoked." });
  } catch (error) {
    next(error);
  }
};

export const verifyStaffInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const verification = await governanceService.verifyStaffInvite(token);
    res.status(200).json(verification);
  } catch (error) {
    next(error);
  }
};

export const acceptStaffInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, username, email, password } = req.body;
    const userAgent = req.headers["user-agent"] as string | undefined;
    const ipAddress = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress) as string | undefined;

    const result = await governanceService.acceptStaffInvite({
      token,
      username,
      email,
      password,
      userAgent,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      message: "Welcome to GameStation Staff. Admin clearance granted.",
      user: result.user,
      accessToken: result.session.accessToken,
      refreshToken: result.session.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffMembers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const staff = await governanceService.getStaffMembers();
    res.status(200).json(staff);
  } catch (error) {
    next(error);
  }
};

export const revokeStaffMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const staffId = req.params.id as string;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.revokeStaffMember(staffId, ownerId, ipAddress);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await governanceService.getGovernanceAuditLogs();
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

export const getEmpireMetrics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await governanceService.getEmpireMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    next(error);
  }
};

export const getEmpireChartMetrics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const charts = await governanceService.getEmpireChartMetrics();
    res.status(200).json(charts);
  } catch (error) {
    next(error);
  }
};

// --- Sovereign Killswitches & Public Broadcast ---
export const getPublicBroadcast = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const broadcast = governanceService.getPublicBroadcastStatus();
    res.status(200).json(broadcast);
  } catch (error) {
    next(error);
  }
};

export const updatePublicBroadcast = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { active, message, severity } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.updatePublicBroadcast({
      active: Boolean(active),
      message: String(message || ""),
      severity: severity || "INFO",
      ownerId,
      ipAddress,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getSystemTelemetry = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const telemetry = await governanceService.getSystemTelemetry();
    res.status(200).json(telemetry);
  } catch (error) {
    next(error);
  }
};

export const updateRoyaltyRate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { rate } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.updatePlatformRoyaltyRate(Number(rate), ownerId, ipAddress);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const verifyMasterKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { masterKey } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.verifyMasterKey(ownerId, masterKey, ipAddress);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSecurityChallenge = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const challenge = await governanceService.getSecurityChallenge(ownerId);
    res.status(200).json(challenge);
  } catch (error) {
    next(error);
  }
};

export const verifySecurityChallenge = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { questionIndex, answer } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.verifySecurityChallenge({
      ownerId,
      questionIndex: Number(questionIndex),
      answer,
      ipAddress,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const breakGlassOverride = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { seedPhrase } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.breakGlassOverride({
      ownerId,
      seedPhrase,
      ipAddress,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSystemKillswitches = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = await governanceService.getSystemKillswitches();
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

export const toggleSystemKillswitch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { switchName, state, notice } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.toggleSystemKillswitch({
      switchName,
      state: Boolean(state),
      notice,
      ownerId,
      ipAddress,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const purgeAllSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.purgeAllSessions(ownerId, ipAddress);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// --- Game Catalog Moderation ---
export const getAllGames = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const games = await governanceService.getAllPlatformGames(search);
    res.status(200).json(games);
  } catch (error) {
    next(error);
  }
};

export const moderateGameStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const gameId = req.params.id as string;
    const { status, reason } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.moderateGameStatus({
      gameId,
      status,
      reason,
      ownerId,
      ipAddress,
    });
    res.status(200).json({ success: true, game: result });
  } catch (error) {
    next(error);
  }
};

// --- Treasury Ledger & Developer Disbursals ---
export const getTreasuryLedger = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ledger = await governanceService.getTreasuryLedger();
    res.status(200).json(ledger);
  } catch (error) {
    next(error);
  }
};

export const getDeveloperPayouts = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await governanceService.getDeveloperPayoutBalances();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const disburseDeveloperPayout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const { developerId, amount, notes } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.disburseDeveloperPayout({
      developerId,
      amount: Number(amount),
      notes,
      ownerId,
      ipAddress,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// --- User Management ---
export const getPlatformUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const users = await governanceService.getPlatformUsers(search);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const toggleUserSuspension = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const targetUserId = req.params.id as string;
    const { reason } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.toggleUserSuspension({
      targetUserId,
      ownerId,
      reason,
      ipAddress,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const targetUserId = req.params.id as string;
    const { role } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await governanceService.changeUserRole({
      targetUserId,
      newRole: role,
      ownerId,
      ipAddress,
    });
    res.status(200).json({ success: true, user: result });
  } catch (error) {
    next(error);
  }
};

// --- Storefront Merchandising & Hero Event Banner ---
export const getStorefrontBanner = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = governanceService.getStorefrontBanner();
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

export const updateStorefrontBanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.userId;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
    const banner = await governanceService.updateStorefrontBanner(req.body, ownerId, ipAddress);
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

