import { prisma } from "../../prisma/db.js";
import { SagaOrchestrator } from "../SagaOrchestrator.js";
import { sendUserNotification, broadcastActivity } from "../../socket.js";
import { BadRequestError, NotFoundError } from "../../Utils/errors.js";
import { webhookDispatcher } from "../../Webhooks/WebhookDispatcher.js";
import type { SagaOptions } from "../types.js";

export interface GamePurchaseContext {
  userId: string;
  gameId: string;
  pricingId?: string;

  // Populated during execution
  username?: string;
  gameTitle?: string;
  editionName?: string;
  cost?: number;
  currency?: string;
  developerId?: string;
  developerUsername?: string;

  // Step 1: Wallet
  walletTransactionId?: string;
  priorBalance?: number;
  newBalance?: number;

  // Step 2: License
  libraryId?: string;
  paymentId?: string;

  // Step 3: Royalty
  devRoyaltyAmount?: number;
  platformRoyaltyAmount?: number;
  devTransactionId?: string;
}

export const createGamePurchaseSaga = (options: SagaOptions) => {
  const saga = new SagaOrchestrator<GamePurchaseContext>(options);

  // ── Step 1: Wallet Point Debit ───────────────────────────────────────────────
  saga.addStep({
    name: "Wallet Point Debit",
    execute: async (ctx) => {
      // 1. Fetch user & validate balance
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { id: true, username: true, walletBalance: true },
      });
      if (!user) throw new NotFoundError("Player account not found.");
      ctx.username = user.username;
      ctx.priorBalance = Number(user.walletBalance);

      // 2. Fetch game & validate pricing
      const game = await prisma.game.findFirst({
        where: { id: ctx.gameId, status: "PUBLISHED" },
        include: {
          pricing: true,
          developer: { select: { id: true, username: true } },
        },
      });
      if (!game) throw new NotFoundError("Game not found or unavailable for purchase.");

      ctx.gameTitle = game.title;
      ctx.developerId = game.developerId;
      ctx.developerUsername = game.developer?.username;

      // Check if user already owns it
      const existingOwnership = await prisma.userLibrary.findUnique({
        where: { userId_gameId: { userId: ctx.userId, gameId: ctx.gameId } },
      });
      if (existingOwnership) {
        throw new BadRequestError(`You already own "${game.title}" in your library!`);
      }

      const selectedPricing = ctx.pricingId
        ? game.pricing.find((p) => p.id === ctx.pricingId)
        : game.pricing[0];
      if (!selectedPricing) {
        throw new BadRequestError("Valid pricing tier not found for this title.");
      }

      ctx.editionName = selectedPricing.editionName;
      ctx.cost = selectedPricing.isFree ? 0 : Number(selectedPricing.price);
      ctx.currency = selectedPricing.currency || "INR";

      if (ctx.priorBalance < ctx.cost) {
        throw new BadRequestError(
          `Insufficient points balance. Required: ₹${ctx.cost.toFixed(2)} PTS, Available: ₹${ctx.priorBalance.toFixed(2)} PTS.`
        );
      }

      // Deduct balance atomically
      const updatedUser = await prisma.user.update({
        where: { id: ctx.userId },
        data: { walletBalance: { decrement: ctx.cost } },
      });
      ctx.newBalance = Number(updatedUser.walletBalance);

      // Record transaction ledger entry
      const tx = await prisma.wallet.create({
        data: {
          userId: ctx.userId,
          amount: ctx.cost,
          type: "GAME_PURCHASE",
          description: `SAGA Purchase: ${ctx.gameTitle} (${ctx.editionName})`,
          referenceId: options.idempotencyKey,
        },
      });
      ctx.walletTransactionId = tx.id;

      return {
        debitedAmount: ctx.cost,
        newBalance: ctx.newBalance,
        walletTxId: tx.id,
      };
    },
    compensate: async (ctx) => {
      if (ctx.cost && ctx.cost > 0) {
        console.log(`[SAGA COMPENSATION] Refunding ₹${ctx.cost} to Player @${ctx.username}...`);
        await prisma.user.update({
          where: { id: ctx.userId },
          data: { walletBalance: { increment: ctx.cost } },
        });

        await prisma.wallet.create({
          data: {
            userId: ctx.userId,
            amount: ctx.cost,
            type: "TOP_UP",
            description: `[SAGA_ROLLBACK: REVERSAL] Refund for failed purchase of ${ctx.gameTitle || "game"}`,
            referenceId: `ROLLBACK_${options.idempotencyKey}`,
          },
        });
      }
    },
  });

  // ── Step 2: Digital Software License Provisioning ───────────────────────────
  saga.addStep({
    name: "Software License Provisioning",
    execute: async (ctx) => {
      if (!ctx.cost && ctx.cost !== 0) throw new Error("Cost context missing.");

      // Bind title to UserLibrary
      const libraryEntry = await prisma.userLibrary.create({
        data: {
          userId: ctx.userId,
          gameId: ctx.gameId,
        },
      });
      ctx.libraryId = libraryEntry.id;

      // Create Payment record
      const paymentRecord = await prisma.payment.create({
        data: {
          userId: ctx.userId,
          gameId: ctx.gameId,
          pricingId: ctx.pricingId || (await prisma.gamePricing.findFirst({ where: { gameId: ctx.gameId } }))!.id,
          amount: ctx.cost,
          currency: ctx.currency || "INR",
          status: "SUCCESS",
          provider: "wallet_saga",
          providerPaymentId: `SAGA_PAY_${options.idempotencyKey}`,
          providerSessionId: options.idempotencyKey,
        },
      });
      ctx.paymentId = paymentRecord.id;

      return {
        libraryId: libraryEntry.id,
        paymentId: paymentRecord.id,
        licenseBound: true,
      };
    },
    compensate: async (ctx) => {
      console.log(`[SAGA COMPENSATION] Revoking game license for Game ${ctx.gameId}...`);
      if (ctx.libraryId) {
        await prisma.userLibrary.delete({
          where: { id: ctx.libraryId },
        }).catch(() => {});
      } else {
        await prisma.userLibrary.deleteMany({
          where: { userId: ctx.userId, gameId: ctx.gameId },
        }).catch(() => {});
      }

      if (ctx.paymentId) {
        await prisma.payment.update({
          where: { id: ctx.paymentId },
          data: { status: "REFUNDED" },
        }).catch(() => {});
      }
    },
  });

  // ── Step 3: Studio Royalty Allocation & Treasury Split ───────────────────────
  saga.addStep({
    name: "Studio Royalty & Treasury Split",
    execute: async (ctx) => {
      const totalAmount = ctx.cost || 0;
      if (totalAmount <= 0 || !ctx.developerId) {
        return { skipped: true, reason: "Free game or missing developer ID" };
      }

      // 70% Developer / 30% Platform split
      const devShare = Number((totalAmount * 0.7).toFixed(2));
      const platformShare = Number((totalAmount * 0.3).toFixed(2));
      ctx.devRoyaltyAmount = devShare;
      ctx.platformRoyaltyAmount = platformShare;

      // Credit Developer Wallet
      await prisma.user.update({
        where: { id: ctx.developerId },
        data: { walletBalance: { increment: devShare } },
      });

      const devTx = await prisma.wallet.create({
        data: {
          userId: ctx.developerId,
          amount: devShare,
          type: "GAME_PURCHASE", // Income entry
          description: `70% Studio Royalty for "${ctx.gameTitle}" (Sold to @${ctx.username})`,
          referenceId: `ROYALTY_${options.idempotencyKey}`,
        },
      });
      ctx.devTransactionId = devTx.id;

      return {
        developerShare: devShare,
        platformShare,
        developerTxId: devTx.id,
      };
    },
    compensate: async (ctx) => {
      if (ctx.devRoyaltyAmount && ctx.devRoyaltyAmount > 0 && ctx.developerId) {
        console.log(`[SAGA COMPENSATION] Reversing ₹${ctx.devRoyaltyAmount} developer royalty...`);
        await prisma.user.update({
          where: { id: ctx.developerId },
          data: { walletBalance: { decrement: ctx.devRoyaltyAmount } },
        }).catch(() => {});

        await prisma.wallet.create({
          data: {
            userId: ctx.developerId,
            amount: ctx.devRoyaltyAmount,
            type: "WITHDRAWAL",
            description: `[SAGA_ROLLBACK: REVERSAL] Voided 70% Royalty for ${ctx.gameTitle || "game"}`,
            referenceId: `VOID_${options.idempotencyKey}`,
          },
        }).catch(() => {});
      }
    },
  });

  // ── Step 4: Real-Time Event Dispatch & Notifications ─────────────────────────
  saga.addStep({
    name: "Real-Time Event Dispatch",
    execute: async (ctx) => {
      // 1. Send receipt notification to buyer
      sendUserNotification(ctx.userId, {
        type: "SALE",
        title: "Order Confirmed!",
        message: `Successfully purchased "${ctx.gameTitle}". The title is now unlocked in your library.`,
        targetUrl: "/store/library",
      });

      // 2. Send royalty notification to developer
      if (ctx.developerId && ctx.devRoyaltyAmount) {
        sendUserNotification(ctx.developerId, {
          type: "SALE",
          title: "New Game Sale!",
          message: `@${ctx.username} purchased "${ctx.gameTitle}". +₹${ctx.devRoyaltyAmount.toFixed(2)} credited to your studio balance.`,
          targetUrl: "/developer/revenue",
        });
      }

      // 3. Broadcast ticker activity across storefront
      broadcastActivity({
        type: "COMMUNITY_VOTE",
        username: ctx.username || "Player",
        gameTitle: ctx.gameTitle || "Game",
        gameId: ctx.gameId,
        details: `Unlocked ${ctx.editionName || "Edition"}`,
      });

      // 4. Asynchronous Cryptographic Webhook Dispatch to Studio Server
      if (ctx.developerId) {
        webhookDispatcher.dispatch(
          "purchase.completed",
          {
            orderId: ctx.paymentId,
            gameId: ctx.gameId,
            gameTitle: ctx.gameTitle,
            buyerId: ctx.userId,
            buyerUsername: ctx.username,
            amount: ctx.cost,
            royaltyEarned: ctx.devRoyaltyAmount,
            currency: ctx.currency || "INR",
            idempotencyKey: options.idempotencyKey,
            timestamp: new Date().toISOString()
          },
          ctx.developerId
        ).catch(err => console.error("[SAGA WEBHOOK DISPATCH ERROR]:", err));
      }

      return { notificationsDispatched: true };
    },
    compensate: async (ctx, error) => {
      // Notify player of rollback
      sendUserNotification(ctx.userId, {
        type: "SYSTEM",
        title: "Transaction Rolled Back",
        message: `Purchase for "${ctx.gameTitle || "game"}" could not be completed. All funds were safely restored to your wallet.`,
        targetUrl: "/store/wallet",
      });
    },
  });

  return saga;
};

