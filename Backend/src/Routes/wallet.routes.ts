import { Router } from "express";
import * as walletController from "../Controllers/wallet.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";

const router = Router();

// 1. Fetch balance & transactions
router.get("/", requireToken as any, walletController.getWalletDetails);

// 2. Create Stripe Top-Up Session
router.post("/topup", requireToken as any, walletController.createTopUpSession);

// 3. 1-Click Game Purchase with Wallet PTS
router.post("/checkout", requireToken as any, walletController.checkoutWithWallet);

export default router;
