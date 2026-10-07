import { Router } from "express";
import { validate } from "../Middlewares/validate.middleware.js";

import { 
    registerValidator,
     loginValidator
}
from "../Utils/auth.validator.js";

import { 
    registerHandler, 
    loginHandler, 
    refreshHandler, 
    logoutHandler, 
    testPlayerHandler, 
    testAdminHandler, 
    testDevHandler,
    makeMeAdminHandler 
} 
from "../Controllers/auth.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import { requireRole } from "../Middlewares/role.middleware.js";
import { ROLES } from "../Utils/role.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), registerHandler);
router.post("/login", validate(loginValidator), loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/test-player", requireToken, testPlayerHandler);
router.get("/test-admin", requireToken, requireRole([ROLES.ADMIN]), testAdminHandler);
router.get("/test-dev", requireToken, requireRole([ROLES.ADMIN, ROLES.DEVELOPER]), testDevHandler);
// Temporary Testing Route
router.post("/make-me-admin", makeMeAdminHandler);
export default router;
