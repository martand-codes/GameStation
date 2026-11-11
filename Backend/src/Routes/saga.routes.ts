import { Router } from "express";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import {
  executePurchaseSaga,
  getSagaHistory,
  getSagaDetails,
} from "../Controllers/saga.controller.js";

const router = Router();

// Purchase execution via Saga Engine
router.post("/purchase", requireToken, executePurchaseSaga);

// Query Saga transactions history
router.get("/history", requireToken, getSagaHistory);

// Query single Saga trace
router.get("/:sagaId", requireToken, getSagaDetails);

export default router;

