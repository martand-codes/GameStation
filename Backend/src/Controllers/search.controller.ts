import type { Request, Response } from "express";
import { SearchEngine } from "../Search/SearchEngine.js";
import { initSearchIndex } from "../Search/initSearch.js";

/**
 * GET /api/search?q=...&limit=10&fuzzy=true
 * In-memory sub-millisecond search with BM25 scoring & Damerau-Levenshtein typo correction
 */
export const searchGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || "";
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const fuzzy = req.query.fuzzy !== "false"; // default true

    const engine = SearchEngine.getInstance();
    const result = engine.search(q, { limit, fuzzy });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Search query error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Search evaluation failed",
    });
  }
};

/**
 * GET /api/search/autocomplete?prefix=cyb
 * Instant Trie prefix suggestions
 */
export const autocompleteSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const prefix = (req.query.prefix as string) || "";
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 5, 1), 20);

    const engine = SearchEngine.getInstance();
    const suggestions = engine.autocomplete(prefix, limit);

    res.status(200).json({
      success: true,
      prefix,
      suggestions,
    });
  } catch (error: any) {
    console.error("Autocomplete error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Autocomplete failed",
    });
  }
};

/**
 * POST /api/search/reindex
 * Force re-build the in-memory index from PostgreSQL
 */
export const reindexAllGames = async (_req: Request, res: Response): Promise<void> => {
  try {
    await initSearchIndex();
    const stats = SearchEngine.getInstance().getStats();

    res.status(200).json({
      success: true,
      message: "In-memory search index rebuilt successfully.",
      stats,
    });
  } catch (error: any) {
    console.error("Reindex error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to reindex search corpus",
    });
  }
};

/**
 * GET /api/search/stats
 * Telemetry and memory size metrics
 */
export const getSearchStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = SearchEngine.getInstance().getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch search telemetry",
    });
  }
};

