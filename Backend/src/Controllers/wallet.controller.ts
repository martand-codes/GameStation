import type { Response } from "express";
import { prisma } from "../prisma/db.js";
import { stripe } from "../Services/stripe.service.js";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";

export const getWalletDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const [user, transactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, walletBalance: true },
      }),
      prisma.wallet.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        balance: Number(user.walletBalance),
        transactions: transactions.map((t) => ({
          id: t.id,
          amount: Number(t.amount),
          type: t.type,
          description: t.description,
          referenceId: t.referenceId,
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Fetch wallet details error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wallet details" });
  }
};


export const createTopUpSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const amount = Number(req.body?.amount);
    if (isNaN(amount) || amount < 10) {
      res.status(400).json({ success: false, message: "Minimum top-up amount is ₹10 (10 PTS)" });
      return;
    }

    const clientOrigin = req.headers.origin || "http://localhost:5173";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${amount} GameStation PTS (Points)`,
              description: `Top up ₹${amount} to your GameStation Wallet`,
              images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80"],
            },
            unit_amount: Math.round(amount * 100), // Stripe takes paisa
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "WALLET_TOPUP",
        userId: userId,
        amount: String(amount),
      },
      success_url: `${clientOrigin}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=wallet_topup`,
      cancel_url: `${clientOrigin}/payment/cancelled?type=wallet_topup`,
    });

    res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Create wallet topup session error:", error);
    res.status(500).json({ success: false, message: "Failed to create wallet top-up session" });
  }
};

/**
  CHECKOUT WITH WALLET (Instant 1-Click Game Purchase using PTS)
 * POST /api/wallet/checkout
 */
export const checkoutWithWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { gameId, pricingId, items } = req.body;

    // Handle single game or cart array
    let purchaseItems: { gameId: string; pricingId?: string }[] = [];
    if (Array.isArray(items) && items.length > 0) {
      purchaseItems = items;
    } else if (gameId) {
      purchaseItems = [{ gameId, pricingId }];
    } else {
      res.status(400).json({ success: false, message: "No game items provided for purchase" });
      return;
    }

    // 1. Fetch user & check current wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const currentBalance = Number(user.walletBalance);

    // 2. Fetch all games and validate pricing
    let totalCost = 0;
    const validatedItems: {
      game: any;
      pricing: any;
      cost: number;
    }[] = [];

    for (const item of purchaseItems) {
      const game = await prisma.game.findFirst({
        where: { id: item.gameId, status: "PUBLISHED" },
        include: { pricing: true },
      });

      if (!game) {
        res.status(404).json({ success: false, message: `Game ${item.gameId} not found or unpublished` });
        return;
      }

      // Check if user already owns it
      const alreadyOwned = await prisma.userLibrary.findUnique({
        where: { userId_gameId: { userId, gameId: item.gameId } },
      });

      if (alreadyOwned) {
        res.status(400).json({ success: false, message: `You already own "${game.title}" in your library!` });
        return;
      }

      const selectedPricing = item.pricingId
        ? game.pricing.find((p) => p.id === item.pricingId)
        : game.pricing[0];

      if (!selectedPricing) {
        res.status(400).json({ success: false, message: `Pricing edition not found for ${game.title}` });
        return;
      }

      const cost = selectedPricing.isFree ? 0 : Number(selectedPricing.price);
      totalCost += cost;

      validatedItems.push({
        game,
        pricing: selectedPricing,
        cost,
      });
    }

    // 3. Verify sufficient balance
    if (currentBalance < totalCost) {
      res.status(400).json({
        success: false,
        message: `Insufficient PTS Balance. Required: ₹${totalCost.toFixed(2)} PTS, Available: ₹${currentBalance.toFixed(2)} PTS. Please top up your wallet.`,
        required: totalCost,
        currentBalance,
      });
      return;
    }

    // 4. Atomic Prisma Transaction: Deduct Balance + Log Transaction + Add Payment + Add to Library
    const titleList = validatedItems.map((v) => v.game.title).join(", ");

    const result = await prisma.$transaction(async (tx) => {
      // A. Deduct wallet balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { decrement: totalCost },
        },
        select: { walletBalance: true },
      });

      // B. Create Wallet Transaction record
      await tx.wallet.create({
        data: {
          userId,
          amount: totalCost,
          type: "GAME_PURCHASE",
          description: `Purchased: ${titleList}`,
        },
      });

      // C. Create Payment and Library records for each game
      for (const v of validatedItems) {
        await tx.payment.create({
          data: {
            userId,
            gameId: v.game.id,
            pricingId: v.pricing.id,
            amount: v.cost,
            currency: "INR",
            provider: "wallet",
            status: "SUCCESS",
          },
        });

        await tx.userLibrary.upsert({
          where: { userId_gameId: { userId, gameId: v.game.id } },
          create: {
            userId,
            gameId: v.game.id,
            pricingId: v.pricing.id,
            playTime: 0,
          },
          update: {
            pricingId: v.pricing.id,
          },
        });
      }

      return updatedUser;
    });

    res.status(200).json({
      success: true,
      message: `Purchase successful! "${titleList}" has been added to your Library.`,
      newBalance: Number(result.walletBalance),
      totalSpent: totalCost,
    });
  } catch (error) {
    console.error("Checkout with wallet error:", error);
    res.status(500).json({ success: false, message: "Failed to complete purchase with Wallet" });
  }
};
