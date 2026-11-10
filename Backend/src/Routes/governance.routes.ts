import { Router } from "express";
import * as governanceController from "../Controllers/governance.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import { requireRole } from "../Middlewares/role.middleware.js";

const router = Router();

// --- Public Genesis & Onboarding Handshakes ---
router.get("/status", governanceController.getStatus);
router.get("/broadcast", governanceController.getPublicBroadcast);
router.post("/claim-ownership", governanceController.claimRoot);
router.get("/staff/verify-token", governanceController.verifyStaffInvite);
router.post("/staff/accept-invitation", governanceController.acceptStaffInvite);

// --- Protected Owner Executive Routes ---
router.use(requireToken);
router.use(requireRole(["OWNER"]));

// Sovereign Security Challenge & Break-Glass Enclave
router.get("/security-challenge", governanceController.getSecurityChallenge);
router.post("/verify-challenge", governanceController.verifySecurityChallenge);
router.post("/break-glass-override", governanceController.breakGlassOverride);
router.post("/verify-master-key", governanceController.verifyMasterKey);
router.get("/metrics", governanceController.getEmpireMetrics);
router.get("/metrics/charts", governanceController.getEmpireChartMetrics);
router.get("/audit-logs", governanceController.getAuditLogs);

// Staff Guild & Invites
router.post("/staff/invite", governanceController.createStaffInvite);
router.get("/staff/invites", governanceController.getStaffInvites);
router.delete("/staff/invites/:id", governanceController.revokeStaffInvite);

// Staff Directory & Killswitch
router.get("/staff/roster", governanceController.getStaffMembers);
router.delete("/staff/roster/:id", governanceController.revokeStaffMember);

// Sovereign Emergency Killswitches & Telemetry
router.get("/system/telemetry", governanceController.getSystemTelemetry);
router.post("/system/royalty-rate", governanceController.updateRoyaltyRate);
router.get("/system/killswitches", governanceController.getSystemKillswitches);
router.post("/system/killswitch", governanceController.toggleSystemKillswitch);
router.post("/system/purge-sessions", governanceController.purgeAllSessions);
router.post("/system/broadcast", governanceController.updatePublicBroadcast);

// Root Game Moderation (DMCA & Marketplace Overrides)
router.get("/games/catalog", governanceController.getAllGames);
router.post("/games/:id/status", governanceController.moderateGameStatus);

// Sovereign Treasury Ledger & Developer Disbursals
router.get("/treasury/ledger", governanceController.getTreasuryLedger);
router.get("/treasury/developer-payouts", governanceController.getDeveloperPayouts);
router.post("/treasury/disburse", governanceController.disburseDeveloperPayout);

// Platform User Directory & Moderation ("Ban Hammer")
router.get("/users", governanceController.getPlatformUsers);
router.post("/users/:id/toggle-status", governanceController.toggleUserSuspension);
router.post("/users/:id/role", governanceController.changeUserRole);

export default router;
