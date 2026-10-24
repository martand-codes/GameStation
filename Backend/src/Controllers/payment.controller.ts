import type { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { stripe } from "../Services/stripe.service.js";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";

const prisma = new PrismaClient();

/**
 * 1. CREATE SINGLE GAME CHECKOUT SESSION ("Buy Now")
 */
export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { gameId } = req.params;
    if (!gameId || typeof gameId !== "string") {
      res.status(400).json({ success: false, message: "Valid Game ID is required" });
      return;
    }

    const pricingId = typeof req.body?.pricingId === "string" ? req.body.pricingId : undefined;

    // if the game exists and is PUBLISHED
    const game = await prisma.game.findFirst({
      where: { id: gameId, status: "PUBLISHED" },
      include: {
        pricing: true,
        media: true,
      },
    });

    if (!game) {
      res.status(404).json({ success: false, message: "Game not found or unavailable for purchase" });
      return;
    }

    // B. Check existing ownership and edition tier across all successful payments
    const successfulPayments = await prisma.payment.findMany({
      where: { userId, gameId, status: "SUCCESS" },
      include: { pricing: true },
    });

    let highestOwnedPrice = 0;
    for (const p of successfulPayments) {
      const pPrice = p.pricing?.price ? Number(p.pricing.price) : Number(p.amount);
      if (pPrice > highestOwnedPrice) {
        highestOwnedPrice = pPrice;
      }
    }

    // C. Select pricing tier
    const selectedPricing = pricingId
      ? game.pricing.find((p: { id: string }) => p.id === pricingId)
      : game.pricing[0];

    if (!selectedPricing) {
      res.status(400).json({ success: false, message: "Valid pricing edition not found for this game" });
      return;
    }

    const targetPrice = Number(selectedPricing.price);

    // If user already owns this edition or a higher edition
    if (successfulPayments.length > 0 && targetPrice <= highestOwnedPrice) {
      res.status(400).json({
        success: false,
        message: "You already own this edition or a higher tier in your library!",
      });
      return;
    }

    // Upgrade pricing calculation: only charge the difference
    const effectivePrice = successfulPayments.length > 0 ? Math.max(targetPrice - highestOwnedPrice, 0) : targetPrice;
    const isUpgrade = successfulPayments.length > 0 && effectivePrice > 0;

    // Handle free games directly with idempotent upsert
    if (selectedPricing.isFree || Number(selectedPricing.price) === 0) {
      await prisma.userLibrary.upsert({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
        create: {
          userId,
          gameId,
          pricingId: selectedPricing.id,
        },
        update: {
          pricingId: selectedPricing.id,
        },
      });

      res.status(200).json({
        success: true,
        isFree: true,
        message: "Free game claimed and added to your library!",
      });
      return;
    }

    // D. Calculate amount in smallest unit (e.g., INR -> Paise)
    // Note: Stripe requires a minimum equivalent to $0.50 USD (~₹50 INR = 5000 paise)
    const currency = (selectedPricing.currency || "INR").toLowerCase();
    const minChargePaise = currency === "inr" ? 5000 : 50;
    const calculatedPaise = Math.round(effectivePrice * 100);
    const amountInSmallestUnit = Math.max(calculatedPaise, minChargePaise);

    // E. Idempotency Check: Re-use open pending session if created within the last 30 mins
    const activePayment = await prisma.payment.findFirst({
      where: {
        userId,
        gameId,
        pricingId: selectedPricing.id,
        status: "PENDING",
        providerSessionId: { not: null },
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activePayment?.providerSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(activePayment.providerSessionId);
        if (existingSession.status === "open" && existingSession.url) {
          res.status(200).json({
            success: true,
            checkoutUrl: existingSession.url,
            sessionId: existingSession.id,
          });
          return;
        }
      } catch (err) {
        // If session was expired or not found, proceed to create a fresh one
      }
    }

    // F. Construct Stripe Checkout Session with Stripe Idempotency Key
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const productData: { name: string; description?: string; images?: string[] } = {
      name: isUpgrade
        ? `Upgrade: ${game.title} (${selectedPricing.editionName})`
        : `${game.title} (${selectedPricing.editionName})`,
    };
    if (game.genre) {
      productData.description = `Genre: ${game.genre}`;
    }
    if (game.media?.coverImageUrl) {
      productData.images = [game.media.coverImageUrl];
    }

    // 10-minute deterministic idempotency window
    const timeBucket = Math.floor(Date.now() / (10 * 60 * 1000));
    const idempotencyKey = `cs-single-${userId}-${game.id}-${selectedPricing.id}-${timeBucket}`;

    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price_data: {
              currency,
              product_data: productData,
              unit_amount: amountInSmallestUnit,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${frontendBaseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendBaseUrl}/payment/cancelled?game_id=${game.id}`,
        metadata: {
          userId: userId,
          gameId: game.id,
          pricingId: selectedPricing.id,
        },
      },
      {
        idempotencyKey,
      }
    );

    // G. Store or reuse the PENDING Payment record via unique providerSessionId
    await prisma.payment.upsert({
      where: { providerSessionId: session.id },
      create: {
        userId,
        gameId: game.id,
        pricingId: selectedPricing.id,
        amount: effectivePrice,
        currency: selectedPricing.currency,
        status: "PENDING",
        provider: "stripe",
        providerSessionId: session.id,
      },
      update: {},
    });

    res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe Checkout Session error:", error);
    res.status(500).json({ success: false, message: "Failed to initialize payment session" });
  }
};

/**
 * 2. CREATE CART CHECKOUT SESSION (Universal Cart Checkout)
 */
export const createCartCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { items } = req.body; // Array of { gameId, editionName }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Cart is empty" });
      return;
    }

    const gameIds = items.map((i) => i.gameId);

    // Fetch all games in cart
    const games = await prisma.game.findMany({
      where: {
        id: { in: gameIds },
        status: "PUBLISHED",
      },
      include: {
        pricing: true,
        media: true,
      },
    });

    // Check existing library ownership
    const ownedItems = await prisma.userLibrary.findMany({
      where: {
        userId,
        gameId: { in: gameIds },
      },
    });
    const ownedGameIds = new Set(ownedItems.map((o) => o.gameId));

    const lineItems: any[] = [];
    const paymentRecords: any[] = [];
    const gamesToBuy: string[] = [];

    for (const item of items) {
      if (ownedGameIds.has(item.gameId)) continue; // skip already owned games

      const game = games.find((g) => g.id === item.gameId);
      if (!game) continue;

      const pricing = item.editionName
        ? game.pricing.find((p) => p.editionName === item.editionName) || game.pricing[0]
        : game.pricing[0];

      if (!pricing) continue;

      // Create pending payment row
      const payment = await prisma.payment.create({
        data: {
          userId,
          gameId: game.id,
          pricingId: pricing.id,
          amount: pricing.price,
          currency: pricing.currency,
          status: "PENDING",
          provider: "stripe",
        },
      });

      paymentRecords.push(payment);
      gamesToBuy.push(game.id);

      const currency = (pricing.currency || "INR").toLowerCase();
      const minChargePaise = currency === "inr" ? 5000 : 50;
      const priceAmount = Number(pricing.price);
      const amountInSmallestUnit = Math.max(Math.round(priceAmount * 100), minChargePaise);

      const productData: { name: string; description?: string; images?: string[] } = {
        name: `${game.title} - ${pricing.editionName}`,
      };
      if (game.media?.coverImageUrl) {
        productData.images = [game.media.coverImageUrl];
      }

      lineItems.push({
        price_data: {
          currency,
          product_data: productData,
          unit_amount: amountInSmallestUnit,
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      res.status(400).json({ success: false, message: "All items in cart are already owned in your library!" });
      return;
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendBaseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/payment/cancelled`,
      metadata: {
        userId,
        paymentIds: paymentRecords.map((p) => p.id).join(","),
        gameIds: gamesToBuy.join(","),
      },
    });

    // Update payments with session ID
    await prisma.payment.updateMany({
      where: {
        id: { in: paymentRecords.map((p) => p.id) },
      },
      data: { providerSessionId: session.id },
    });

    res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Cart Checkout error:", error);
    res.status(500).json({ success: false, message: "Failed to create cart checkout session" });
  }
};

/**
 * 3. RETRIEVE CHECKOUT SESSION STATUS (Immediate Verification on Success Page)
 */
export const getSessionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ success: false, message: "Session ID required" });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Handle Wallet Top-Up Session
      if (session.metadata?.type === "WALLET_TOPUP") {
        const topupUserId = String(session.metadata.userId || userId || "");
        const topupAmount = Number(session.metadata.amount);

        if (topupUserId && topupAmount > 0) {
          const existingTx = await prisma.wallet.findFirst({
            where: { referenceId: session.id },
          });

          if (!existingTx) {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: topupUserId },
                data: { walletBalance: { increment: topupAmount } },
              }),
              prisma.wallet.create({
                data: {
                  userId: topupUserId,
                  amount: topupAmount,
                  type: "TOP_UP",
                  description: `Topped up ₹${topupAmount.toFixed(2)} PTS via Stripe`,
                  referenceId: session.id,
                },
              }),
            ]);
          }
        }

        const updatedUser = topupUserId
          ? await prisma.user.findUnique({
              where: { id: topupUserId },
              select: { walletBalance: true },
            })
          : null;

        res.status(200).json({
          success: true,
          status: "paid",
          type: "wallet_topup",
          amountTotal: topupAmount,
          currency: "INR",
          newBalance: Number(updatedUser?.walletBalance || 0),
        });
        return;
      }

      const metaUserId = session.metadata?.userId || userId;
      const paymentId = session.metadata?.paymentId;
      const paymentIdsStr = session.metadata?.paymentIds;
      const gameId = session.metadata?.gameId;
      const gameIdsStr = session.metadata?.gameIds;

      const targetPaymentIds = paymentIdsStr ? paymentIdsStr.split(",") : paymentId ? [paymentId] : [];
      const targetGameIds = gameIdsStr ? gameIdsStr.split(",") : gameId ? [gameId] : [];

      if (metaUserId && targetGameIds.length > 0) {
        // Unlock games for user
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: {
              OR: [
                { id: { in: targetPaymentIds } },
                { providerSessionId: session.id },
              ],
            },
            data: {
              status: "SUCCESS",
              providerPaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
            },
          }),
          ...targetGameIds.map((gId) =>
            prisma.userLibrary.upsert({
              where: {
                userId_gameId: {
                  userId: metaUserId,
                  gameId: gId,
                },
              },
              create: {
                userId: metaUserId,
                gameId: gId,
                pricingId: session.metadata?.pricingId || null,
              },
              update: {
                ...(session.metadata?.pricingId ? { pricingId: session.metadata.pricingId } : {}),
              },
            })
          ),
        ]);
      }

      // Fetch unlocked games details to show user
      const unlockedGames = await prisma.game.findMany({
        where: { id: { in: targetGameIds } },
        include: { media: true, pricing: true },
      });

      res.status(200).json({
        success: true,
        status: "paid",
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase(),
        games: unlockedGames,
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: session.payment_status,
      message: "Payment is pending or incomplete",
    });
  } catch (error) {
    console.error("Retrieve session error:", error);
    res.status(500).json({ success: false, message: "Failed to check session status" });
  }
};

/**
 * 4. STRIPE WEBHOOK HANDLER
 */
export const handleStripeWebhook = async (req: any, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const metaUserId = session.metadata?.userId;
    const paymentId = session.metadata?.paymentId;
    const paymentIdsStr = session.metadata?.paymentIds;
    const gameId = session.metadata?.gameId;
    const gameIdsStr = session.metadata?.gameIds;

    const targetPaymentIds = paymentIdsStr ? paymentIdsStr.split(",") : paymentId ? [paymentId] : [];
    const targetGameIds = gameIdsStr ? gameIdsStr.split(",") : gameId ? [gameId] : [];

    if (metaUserId && targetGameIds.length > 0) {
      try {
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: {
              OR: [
                { id: { in: targetPaymentIds } },
                { providerSessionId: session.id },
              ],
            },
            data: {
              status: "SUCCESS",
              providerPaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
            },
          }),
          ...targetGameIds.map((gId: string) =>
            prisma.userLibrary.upsert({
              where: {
                userId_gameId: {
                  userId: metaUserId,
                  gameId: gId,
                },
              },
              create: {
                userId: metaUserId,
                gameId: gId,
                pricingId: session.metadata?.pricingId || null,
              },
              update: {
                ...(session.metadata?.pricingId ? { pricingId: session.metadata.pricingId } : {}),
              },
            })
          ),
        ]);

        console.log(`🎮 Game(s) [${targetGameIds.join(", ")}] unlocked for user ${metaUserId}!`);
      } catch (dbError) {
        console.error("Failed to update database on checkout.session.completed:", dbError);
      }
    } else if (session.metadata?.type === "WALLET_TOPUP") {
      try {
        const topupUserId = session.metadata.userId;
        const topupAmount = Number(session.metadata.amount);

        if (topupUserId && topupAmount > 0) {
          const existingTx = await prisma.wallet.findFirst({
            where: { referenceId: session.id },
          });

          if (!existingTx) {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: topupUserId },
                data: { walletBalance: { increment: topupAmount } },
              }),
              prisma.wallet.create({
                data: {
                  userId: topupUserId,
                  amount: topupAmount,
                  type: "TOP_UP",
                  description: `Topped up ₹${topupAmount.toFixed(2)} PTS via Stripe`,
                  referenceId: session.id,
                },
              }),
            ]);
            console.log(`💳 Webhook: Topped up ₹${topupAmount} PTS for user ${topupUserId}!`);
          }
        }
      } catch (topupError) {
        console.error("Failed to process wallet topup in webhook:", topupError);
      }
    }
  }

  res.status(200).json({ received: true });
};

/**
 * 5. GET USER LIBRARY
 */
export const getUserLibrary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const [libraryItems, payments] = await Promise.all([
      prisma.userLibrary.findMany({
        where: { userId },
        include: {
          pricing: true,
          game: {
            include: {
              media: true,
              pricing: true,
              requirements: true,
              telemetry: true,
              developer: {
                select: {
                  id: true,
                  username: true,
                },
              },
              versions: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.payment.findMany({
        where: { userId, status: "SUCCESS" },
        select: {
          id: true,
          gameId: true,
          pricingId: true,
          amount: true,
          currency: true,
          providerPaymentId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const paymentByGame = new Map<string, any>();
    payments.forEach((p) => {
      if (!paymentByGame.has(p.gameId)) {
        paymentByGame.set(p.gameId, p);
      }
    });

    res.status(200).json({
      success: true,
      data: libraryItems.map((item: any) => ({
        libraryId: item.id,
        acquiredAt: item.createdAt,
        playTime: item.playTime || 0,
        lastPlayed: item.lastPlayed || null,
        ownedPricing: item.pricing,
        latestPayment: paymentByGame.get(item.gameId) || null,
        game: item.game,
      })),
    });
  } catch (error) {
    console.error("Fetch library error:", error);
    res.status(500).json({ success: false, message: "Failed to load library" });
  }
};

/**
 * 6. CHECK GAME OWNERSHIP
 */
export const checkGameOwnership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { gameId } = req.params;

    if (!userId || !gameId || typeof gameId !== "string") {
      res.status(200).json({ success: true, isOwned: false });
      return;
    }

    const ownership = await prisma.userLibrary.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      include: {
        pricing: true,
      },
    });

    if (!ownership) {
      res.status(200).json({
        success: true,
        isOwned: false,
        ownedPrice: 0,
      });
      return;
    }

    // Retrieve all successful payments for this game to find highest edition tier owned
    const successfulPayments = await prisma.payment.findMany({
      where: {
        userId,
        gameId,
        status: "SUCCESS",
      },
      include: {
        pricing: true,
      },
    });

    let highestTierPrice = 0;
    let highestTierPayment = null;

    for (const p of successfulPayments) {
      const pPrice = p.pricing?.price ? Number(p.pricing.price) : Number(p.amount);
      if (pPrice >= highestTierPrice) {
        highestTierPrice = pPrice;
        highestTierPayment = p;
      }
    }

    // Also check if userLibrary has an assigned pricing (e.g. from free claim or direct tier upgrade)
    if (ownership.pricing?.price) {
      const libPrice = Number(ownership.pricing.price);
      if (libPrice > highestTierPrice) {
        highestTierPrice = libPrice;
      }
    }

    const ownedEditionName =
      highestTierPayment?.pricing?.editionName ||
      ownership.pricing?.editionName ||
      "Standard Edition";

    res.status(200).json({
      success: true,
      isOwned: true,
      ownedPrice: highestTierPrice,
      ownedPricingId: highestTierPayment?.pricingId || ownership.pricingId,
      ownedEditionName,
    });
  } catch (error) {
    console.error("Check ownership error:", error);
    res.status(500).json({ success: false, message: "Failed to verify ownership" });
  }
};

/**
 * 7. CHECK REFUND ELIGIBILITY (Steam 14-day / 2-hour Playtime Rules)
 * GET /api/payments/refund-eligibility/:gameId
 */
export const getRefundEligibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const rawGameId = req.params.gameId;
    const gameId = typeof rawGameId === "string" ? rawGameId : "";

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!gameId) {
      res.status(400).json({ success: false, message: "Valid gameId is required" });
      return;
    }

    // 1. Verify user owns the game
    const libraryItem: any = await prisma.userLibrary.findUnique({
      where: { userId_gameId: { userId, gameId } },
      include: { game: true, pricing: true },
    });

    if (!libraryItem) {
      res.status(404).json({ success: false, message: "Game not found in your library" });
      return;
    }

    // 2. Find latest successful payment for this game
    const payment = await prisma.payment.findFirst({
      where: { userId, gameId, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      res.status(400).json({
        success: false,
        message: "No refundable purchase found. This game may have been claimed for free or already refunded.",
      });
      return;
    }

    const playTimeSeconds = libraryItem.playTime || 0;
    const playTimeMinutes = Math.floor(playTimeSeconds / 60);
    const maxPlayTimeMinutes = 120; // 2 hours

    const daysSincePurchase = (Date.now() - new Date(payment.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const maxDays = 14;

    const playTimePass = playTimeSeconds <= 7200;
    const purchaseDatePass = daysSincePurchase <= maxDays;
    const isEligible = playTimePass && purchaseDatePass && Number(payment.amount) > 0;

    res.status(200).json({
      success: true,
      data: {
        gameId,
        gameTitle: libraryItem.game.title,
        paymentId: payment.id,
        refundableAmount: Number(payment.amount),
        provider: payment.provider, // "stripe" | "wallet"
        purchasedAt: payment.createdAt,
        daysSincePurchase: Math.floor(daysSincePurchase),
        daysRemaining: Math.max(0, Math.ceil(maxDays - daysSincePurchase)),
        playTimeSeconds,
        playTimeMinutes,
        maxPlayTimeMinutes,
        playTimePass,
        purchaseDatePass,
        isEligible,
      },
    });
  } catch (error) {
    console.error("Refund eligibility check error:", error);
    res.status(500).json({ success: false, message: "Failed to evaluate refund eligibility" });
  }
};

/**
 * 8. REQUEST & PROCESS REFUND
 * POST /api/payments/refund/:gameId
 */
export const requestRefund = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const rawGameId = req.params.gameId;
    const gameId = typeof rawGameId === "string" ? rawGameId : "";
    const { refundTarget, reason } = req.body; // refundTarget: "WALLET" | "ORIGINAL_PAYMENT"

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!gameId) {
      res.status(400).json({ success: false, message: "Valid gameId is required" });
      return;
    }

    // 1. Verify ownership in library
    const libraryItem: any = await prisma.userLibrary.findUnique({
      where: { userId_gameId: { userId, gameId } },
      include: { game: true },
    });

    if (!libraryItem) {
      res.status(404).json({ success: false, message: "Game not found in library" });
      return;
    }

    // 2. Playtime check (<= 2 hours / 7200s)
    const playTimeSeconds = libraryItem.playTime || 0;
    if (playTimeSeconds > 7200) {
      res.status(400).json({
        success: false,
        message: `Refund Denied: Playtime (${Math.floor(playTimeSeconds / 60)} mins) exceeds the 2 hours limit (Steam Policy).`,
      });
      return;
    }

    // 3. Find successful payment
    const payment = await prisma.payment.findFirst({
      where: { userId, gameId, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      res.status(400).json({ success: false, message: "No active payment found to refund" });
      return;
    }

    // 4. 14-day window check
    const daysSincePurchase = (Date.now() - new Date(payment.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePurchase > 14) {
      res.status(400).json({
        success: false,
        message: `Refund Denied: Purchase was made more than 14 days ago (${Math.floor(daysSincePurchase)} days ago).`,
      });
      return;
    }

    const refundAmount = Number(payment.amount);
    // If original payment was with wallet, refund must go back to wallet
    const target = payment.provider === "wallet" ? "WALLET" : refundTarget === "ORIGINAL_PAYMENT" ? "ORIGINAL_PAYMENT" : "WALLET";

    if (target === "WALLET") {
      // Instant PTS Wallet Refund
      const result = await prisma.$transaction(async (tx) => {
        // Credit user's wallet
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: refundAmount } },
          select: { walletBalance: true },
        });

        // Record wallet ledger transaction
        await tx.wallet.create({
          data: {
            userId,
            amount: refundAmount,
            type: "REFUND",
            description: `Refund for "${libraryItem.game.title}"${reason ? ` (${reason})` : ""}`,
            referenceId: payment.id,
          },
        });

        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED" },
        });

        // Revoke license from user library
        await tx.userLibrary.delete({
          where: { id: libraryItem.id },
        });

        return updatedUser;
      });

      res.status(200).json({
        success: true,
        message: `Refund processed! ₹${refundAmount.toFixed(2)} PTS has been credited to your GameStation Wallet.`,
        refundMethod: "WALLET",
        refundedAmount: refundAmount,
        newBalance: Number(result.walletBalance),
      });
      return;
    } else {
      // Stripe Gateway Card Reversal
      if (!payment.providerPaymentId) {
        res.status(400).json({
          success: false,
          message: "Unable to process gateway refund: Missing Stripe payment reference. You can choose refund to Wallet PTS instead.",
        });
        return;
      }

      await stripe.refunds.create({
        payment_intent: payment.providerPaymentId,
        reason: "requested_by_customer",
      });

      // Update DB
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED" },
        }),
        prisma.userLibrary.delete({
          where: { id: libraryItem.id },
        }),
      ]);

      res.status(200).json({
        success: true,
        message: `Refund initiated! ₹${refundAmount.toFixed(2)} will be credited back to your original payment method in 5-10 business days.`,
        refundMethod: "STRIPE",
        refundedAmount: refundAmount,
      });
      return;
    }
  } catch (error: any) {
    console.error("Refund processing error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to process refund request",
    });
  }
};

