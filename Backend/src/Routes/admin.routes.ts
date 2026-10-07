import { Router } from "express";
import * as adminController from "../Controllers/admin.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import { requireRole } from "../Middlewares/role.middleware.js";

const router = Router();

router.use(requireToken);
router.use(requireRole(["ADMIN", "OWNER"]));

// Review workflow
router.get("/games/pending", adminController.getPendingGames);
router.post("/games/:id/approve", adminController.approveGame);
router.post("/games/:id/reject", adminController.rejectGame);

export default router;
