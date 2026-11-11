import { prisma } from "../prisma/db.js";

async function main() {
  console.log("🌱 Starting Friendship and Direct Message Seeding...");

  // 1. Fetch Users
  const users = await prisma.user.findMany({
    where: {
      username: {
        in: [
          "Player@01",
          "Player@02",
          "Player@03",
          "Player@04",
          "Player@05",
          "Player@06",
          "Player@07",
          "Player@08",
          "Martand_Prakhar",
        ],
      },
    },
    select: { id: true, username: true },
  });

  const userMap = new Map<string, string>();
  users.forEach((u) => userMap.set(u.username, u.id));

  const p1 = userMap.get("Player@01");
  const p2 = userMap.get("Player@02");
  const p3 = userMap.get("Player@03");
  const p4 = userMap.get("Player@04");
  const p5 = userMap.get("Player@05");
  const p8 = userMap.get("Player@08");
  const owner = userMap.get("Martand_Prakhar");

  if (!p1 || !p2 || !p4) {
    console.error("❌ Required players not found. Please ensure seed-players.ts has been run.");
    process.exit(1);
  }

  // 2. Clear Existing Friendships and Messages
  await prisma.directMessage.deleteMany();
  await prisma.friendship.deleteMany();
  console.log("🧹 Cleared old friendships and messages.");

  // 3. Define Friendships
  const friendshipsData: Array<{
    senderId: string;
    receiverId: string;
    status: "ACCEPTED" | "PENDING";
  }> = [
    // Player@01 Friendships
    { senderId: p1, receiverId: p2, status: "ACCEPTED" },
    { senderId: p1, receiverId: p4, status: "ACCEPTED" },
    { senderId: p8, receiverId: p1, status: "ACCEPTED" },
    { senderId: p3, receiverId: p1, status: "PENDING" }, // Incoming request for Player@01

    // Inter-Player Friendships
    { senderId: p2, receiverId: p4, status: "ACCEPTED" },
    { senderId: p4, receiverId: p8, status: "ACCEPTED" },
  ];

  if (owner) {
    friendshipsData.push(
      { senderId: p1, receiverId: owner, status: "ACCEPTED" },
      { senderId: p2, receiverId: owner, status: "ACCEPTED" },
      { senderId: p4, receiverId: owner, status: "ACCEPTED" },
      { senderId: p5, receiverId: owner, status: "PENDING" } // Incoming request for Owner
    );
  }

  for (const f of friendshipsData) {
    await prisma.friendship.create({ data: f });
  }
  console.log(`✅ Created ${friendshipsData.length} friendships (including pending requests).`);

  // 4. Seed Direct Messages
  const messagesData = [
    // Chat between Player@01 and Player@02
    {
      senderId: p2,
      receiverId: p1,
      content: "Yo! Are you jumping into Vice City co-op tonight?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true,
    },
    {
      senderId: p1,
      receiverId: p2,
      content: "Yeah! Just tweaked engine optimization settings. Locked at 144 FPS now.",
      createdAt: new Date(Date.now() - 1000 * 60 * 55),
      isRead: true,
    },
    {
      senderId: p2,
      receiverId: p1,
      content: "Awesome, let me know as soon as you launch the game session.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      isRead: true,
    },
    {
      senderId: p1,
      receiverId: p2,
      content: "Launching the launcher now! See you in the matrix.",
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      isRead: false,
    },

    // Chat between Player@01 and Player@04
    {
      senderId: p4,
      receiverId: p1,
      content: "Did you check the new community reviews matrix on the storefront?",
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      isRead: true,
    },
    {
      senderId: p1,
      receiverId: p4,
      content: "Yeah, rated Cyberpunk a 5/5 Masterpiece yesterday. The sub-scores radar is great.",
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
      isRead: true,
    },
  ];

  if (owner) {
    messagesData.push(
      {
        senderId: p4,
        receiverId: owner,
        content: "Hey Sovereign! Noticed the new telemetry radar in the Governance Cockpit. Looks incredible.",
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
        isRead: true,
      },
      {
        senderId: owner,
        receiverId: p4,
        content: "Glad you like it! Ring-3 stability protocols and real-time WebSockets are now live platform-wide.",
        createdAt: new Date(Date.now() - 1000 * 60 * 20),
        isRead: true,
      }
    );
  }

  for (const m of messagesData) {
    await prisma.directMessage.create({ data: m });
  }
  console.log(`✅ Seeded ${messagesData.length} direct chat messages.`);

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding friends:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

