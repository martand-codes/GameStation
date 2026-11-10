import { prisma } from "../prisma/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { verifyRecoveryPhrase } from "../Utils/recovery.util.js";

dotenv.config();

const parseArgs = () => {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, ...values] = arg.slice(2).split("=");
      if (key) {
        result[key] = values.join("=");
      }
    }
  }

  return result;
};

const runBreakGlass = async () => {
  console.log("\n=======================================================");
  console.log("   GAMESTATION EMERGENCY BREAK-GLASS DISASTER RECOVERY ");
  console.log("=======================================================\n");

  const args = parseArgs();
  const username = args.username;
  const newPassword = args["new-password"] || args.password;
  const phrase = args.phrase || args["recovery-phrase"];
  const masterKey = args.key || args["master-key"];

  if (!username) {
    console.error("❌ Error: Missing --username argument.");
    console.log("Usage: npx tsx src/Scripts/break-glass.ts --username=<OWNER_USERNAME> --new-password=<NEW_PASS> [--phrase='12 words' | --key=<MASTER_KEY>]");
    process.exit(1);
  }

  if (!newPassword || newPassword.length < 8) {
    console.error("❌ Error: Valid --new-password (min 8 chars) is required.");
    process.exit(1);
  }

  // 1. Locate the Owner
  const owner = await prisma.user.findFirst({
    where: {
      username,
      role: "OWNER",
    },
  });

  if (!owner) {
    console.error(`❌ Security Rejection: No OWNER account found with username: '${username}'`);
    process.exit(1);
  }

  // 2. Validate Authority via either the 12-Word Recovery Phrase OR the Environment Master Key
  let authorized = false;

  const envMasterKey = process.env.PLATFORM_MASTER_RECOVERY_KEY || "gs_master_emergency_default_key_2026";
  if (masterKey && masterKey === envMasterKey) {
    authorized = true;
    console.log("🔒 Authorization verified via Master Environment Recovery Key.");
  } else if (phrase && owner.recoveryPhraseHash) {
    const isPhraseValid = await verifyRecoveryPhrase(phrase, owner.recoveryPhraseHash);
    if (isPhraseValid) {
      authorized = true;
      console.log("🔒 Authorization verified via 12-Word Offline Recovery Phrase.");
    }
  }

  if (!authorized) {
    console.error("❌ Authentication Failed: Invalid recovery phrase or master key.");
    console.error("Access Denied: Disaster recovery aborted to protect platform integrity.");
    process.exit(1);
  }

  // 3. Execute Emergency Reset Transaction
  console.log("\n⚡ Executing Emergency Platform Purge...");
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction(async (tx) => {
    // A. Reset Owner Credentials
    await tx.user.update({
      where: { id: owner.id },
      data: { password: hashedPassword },
    });

    // B. Nuke ALL Sessions platform-wide
    const purgedSessions = await (tx.session as any).deleteMany({});
    console.log(`💥 Terminated ${purgedSessions.count} active sessions platform-wide. (Attacker sessions ejected)`);

    // C. Invalidate all pending staff invite tokens
    const revokedInvites = await tx.staffInvite.updateMany({
      where: { isUsed: false },
      data: {
        isUsed: true,
        usedByEmail: "REVOKED_BY_EMERGENCY_BREAK_GLASS",
      },
    });
    console.log(`🚫 Revoked ${revokedInvites.count} active staff invite tokens to eliminate leaked backdoors.`);

    // D. Log Emergency Event in Flight Recorder
    await tx.governanceAuditLog.create({
      data: {
        action: "BREAK_GLASS_TRIGGERED",
        actorId: owner.id,
        actorName: "CLI_ROOT_OPERATOR",
        details: `Disaster Recovery Executed for @${owner.username}. All sessions purged. Password reset.`,
        ipAddress: "127.0.0.1 (INTERNAL_CLI)",
      },
    });
  });

  console.log("\n✅ PLATFORM AUTHORITY SUCCESSFULLY RESTORED.");
  console.log(`👤 Owner @${owner.username} password has been updated.`);
  console.log("🌐 You can now log in securely via the web portal.\n");
  process.exit(0);
};

runBreakGlass().catch((err) => {
  console.error("Fatal error during break-glass execution:", err);
  process.exit(1);
});

