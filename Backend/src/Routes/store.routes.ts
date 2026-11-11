import { Router } from "express";
import * as storeController from "../Controllers/store.controller.js";
import * as governanceController from "../Controllers/governance.controller.js";

const router = Router();

// Public Storefront Routes
router.get("/hero-banner", governanceController.getStorefrontBanner);
router.get("/games", storeController.getStoreGames);
router.get("/games/:id", storeController.getStoreGameById);

export default router;
