import { Router } from "express";
import * as paymentController from "../Controllers/payment.controller.js";
import { requireToken } from "../Middlewares/bouncer.middleware.js";

const router = Router();

// 1. Single Game Instant Checkout ("Buy Now")
router.post("/checkout/:gameId", requireToken as any, paymentController.createCheckoutSession);

// 2. Universal Cart Checkout ("Checkout with Stripe")
router.post("/cart-checkout", requireToken as any, paymentController.createCartCheckoutSession);

// 3. Verify Session Status (Immediate Unlock & Details on /payment/success)
router.get("/session-status/:sessionId", requireToken as any, paymentController.getSessionStatus);

// 4. Player Library
router.get("/library", requireToken as any, paymentController.getUserLibrary);

// 5. Ownership Verification
router.get("/ownership/:gameId", requireToken as any, paymentController.checkGameOwnership);

// 6. Automated Refund Engine
router.get("/refund-eligibility/:gameId", requireToken as any, paymentController.getRefundEligibility);
router.post("/refund/:gameId", requireToken as any, paymentController.requestRefund);

export default router;

