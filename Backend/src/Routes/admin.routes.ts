import { Router } from "express";
import * as adminController from "../Controllers/admin.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import { requireRole } from "../Middlewares/role.middleware.js";

const router = Router();

router.use(requireToken);
router.use(requireRole(["ADMIN", "OWNER"]));

// Staff Identity & Dashboard
router.get("/profile", adminController.getAdminProfile);
router.get("/metrics/dashboard", adminController.getDashboardMetrics);
router.get("/staff/roster", adminController.getStaffRoster);

// Review & Certification Workflow
router.get("/games/pending", adminController.getPendingGames);
router.post("/games/:id/claim", adminController.claimGameReview);
router.post("/games/:id/release", adminController.releaseGameReview);
router.post("/games/:id/assign", adminController.assignGameReview);
router.post("/games/:id/qa-notes", adminController.saveQANotes);
router.post("/games/:id/approve", adminController.approveGame);
router.post("/games/:id/reject", adminController.rejectGame);

// Storefront Catalog Moderation
router.get("/catalog", adminController.getAdminCatalog);
router.post("/catalog/:id/status", adminController.moderateGame);

// User Support & Moderation
router.get("/users", adminController.getAdminUsers);
router.post("/users/:id/suspend", adminController.toggleUserSuspension);
router.post("/users/:id/role", adminController.updateUserRole);

// Operations Flight Recorder / Audit Logs
router.get("/logs", adminController.getAdminAuditLogs);

export default router;
