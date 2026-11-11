import { Router } from "express";
import {
  searchGames,
  autocompleteSuggestions,
  reindexAllGames,
  getSearchStats,
} from "../Controllers/search.controller.js";

const router = Router();

// Public in-memory search
router.get("/", searchGames);

// Public fast prefix autocomplete
router.get("/autocomplete", autocompleteSuggestions);

// Internal stats & metrics
router.get("/stats", getSearchStats);

// Reindex trigger (Admin/Owner)
router.post("/reindex", reindexAllGames);

export default router;

