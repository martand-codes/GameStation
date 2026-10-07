import { Router } from "express";
import * as storeController from "../Controllers/store.controller.js";

const router = Router();

// Public Storefront Routes
router.get("/games", storeController.getStoreGames);
router.get("/games/:id", storeController.getStoreGameById);

export default router;
