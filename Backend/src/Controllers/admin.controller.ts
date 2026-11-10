import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import * as adminService from "../Services/admin.service.js";

export const getPendingGames = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requesterId = req.user?.userId;
    const games = await adminService.getPendingGames(requesterId);
    res.status(200).json(games);
  } catch (error) {
    next(error);
  }
};

export const approveGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const reviewerId = req.user?.userId;
    const game = await adminService.approveGame(gameId, reviewerId);
    res.status(200).json({ success: true, message: "Game approved and certified for storefront", game });
  } catch (error) {
    next(error);
  }
};

export const rejectGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const reviewerId = req.user?.userId;
    const { reason } = req.body;
    const game = await adminService.rejectGame(gameId, reviewerId, reason);
    res.status(200).json({ success: true, message: "Game certification rejected", game });
  } catch (error) {
    next(error);
  }
};

export const getDashboardMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requesterId = req.user?.userId;
    const data = await adminService.getAdminDashboardMetrics(requesterId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await adminService.getAdminProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const getAdminCatalog = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status } = req.query;
    const games = await adminService.getAdminCatalog(
      typeof search === "string" ? search : undefined,
      typeof status === "string" ? status : undefined
    );
    res.status(200).json(games);
  } catch (error) {
    next(error);
  }
};

export const moderateGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const adminId = req.user!.userId;
    const { status, reason } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const game = await adminService.moderateAdminGame({
      gameId,
      status: status as "PUBLISHED" | "HIDDEN" | "REJECTED",
      reason: typeof reason === "string" ? reason : undefined,
      adminId,
      ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
    });
    res.status(200).json({ success: true, message: `Game status set to ${status}`, game });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, role, status } = req.query;
    const users = await adminService.getAdminUsers(
      typeof search === "string" ? search : undefined,
      typeof role === "string" ? role : undefined,
      typeof status === "string" ? status : undefined
    );
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const toggleUserSuspension = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.params.id as string;
    const adminId = req.user!.userId;
    const { reason } = req.body;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await adminService.moderateAdminUserSuspension({
      targetUserId,
      adminId,
      reason: typeof reason === "string" ? reason : undefined,
      ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.params.id as string;
    const { role, reason } = req.body;
    const actingStaffId = req.user!.userId;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const result = await adminService.updateUserRole({
      targetUserId,
      newRole: role,
      actingStaffId,
      reason: typeof reason === "string" ? reason : undefined,
      ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAdminAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit, action } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 100;
    const logs = await adminService.getAdminAuditLogs(
      parsedLimit,
      typeof action === "string" ? action : undefined
    );
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

export const getStaffRoster = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roster = await adminService.getStaffRoster();
    res.status(200).json(roster);
  } catch (error) {
    next(error);
  }
};

export const claimGameReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const adminId = req.user!.userId;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const game = await adminService.claimGameReview({
      gameId,
      adminId,
      ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
    });
    res.status(200).json({ success: true, message: "Review ticket claimed successfully", game });
  } catch (error) {
    next(error);
  }
};

export const releaseGameReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const adminId = req.user!.userId;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const game = await adminService.releaseGameReview({
      gameId,
      adminId,
      ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
    });
    res.status(200).json({ success: true, message: "Review ticket released back to pool", game });
  } catch (error) {
    next(error);
  }
};

export const assignGameReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const { targetAdminId } = req.body;
    const actingStaffId = req.user!.userId;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const game = await adminService.assignGameReview({
      gameId,
      targetAdminId,
      actingStaffId,
      ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
    });
    res.status(200).json({ success: true, message: "Review ticket delegated successfully", game });
  } catch (error) {
    next(error);
  }
};

export const saveQANotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id as string;
    const { qaNotes } = req.body;
    const adminId = req.user!.userId;
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

    const game = await adminService.saveQANotes({
      gameId,
      adminId,
      qaNotes: typeof qaNotes === "string" ? qaNotes : "",
      ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
    });
    res.status(200).json({ success: true, message: "QA notes and telemetry updated", game });
  } catch (error) {
    next(error);
  }
};

