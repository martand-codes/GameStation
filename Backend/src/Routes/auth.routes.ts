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
    makeMeAdminHandler,
    getProfileHandler,
    updateProfileHandler,
    changePasswordHandler,
    revokeOtherSessionsHandler
} 
from "../Controllers/auth.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import { requireRole } from "../Middlewares/role.middleware.js";
import { ROLES } from "../Utils/role.validator.js";
import { createRateLimiter } from "../RateLimiter/rateLimitMiddleware.js";
import { RATE_LIMIT_POLICIES } from "../RateLimiter/policies.js";

const router = Router();

const authLimiter = createRateLimiter(RATE_LIMIT_POLICIES.AUTH);

router.post("/register", authLimiter, validate(registerValidator), registerHandler);
router.post("/login", authLimiter, validate(loginValidator), loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);

// User Profile & Account Data
router.get("/profile", requireToken as any, getProfileHandler);
router.patch("/profile", requireToken as any, updateProfileHandler);
router.post("/change-password", requireToken as any, changePasswordHandler);
router.post("/revoke-sessions", requireToken as any, revokeOtherSessionsHandler);

router.get("/test-player", requireToken, testPlayerHandler);
router.get("/test-admin", requireToken, requireRole([ROLES.ADMIN]), testAdminHandler);
router.get("/test-dev", requireToken, requireRole([ROLES.ADMIN, ROLES.DEVELOPER]), testDevHandler);
// Temporary Testing Route
router.post("/make-me-admin", makeMeAdminHandler);
export default router;
