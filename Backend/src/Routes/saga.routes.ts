import { Router } from "express";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import { createRateLimiter } from "../RateLimiter/rateLimitMiddleware.js";
import { RATE_LIMIT_POLICIES } from "../RateLimiter/policies.js";
import {
  executePurchaseSaga,
  getSagaHistory,
  getSagaDetails,
} from "../Controllers/saga.controller.js";

const router = Router();

// Purchase execution via Saga Engine (Protected by SAGA_TIER rate limiter)
router.post("/purchase", requireToken, createRateLimiter(RATE_LIMIT_POLICIES.SAGA), executePurchaseSaga);

// Query Saga transactions history (Read queries should not consume checkout quota)
router.get("/history", requireToken, getSagaHistory);

// Query single Saga trace
router.get("/:sagaId", requireToken, getSagaDetails);

export default router;

