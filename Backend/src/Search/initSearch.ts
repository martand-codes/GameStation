import { SearchEngine } from "./SearchEngine.js";
import { prisma } from "../prisma/db.js";

export async function initSearchIndex(): Promise<void> {
  try {
    const engine = SearchEngine.getInstance();
    const games = await prisma.game.findMany({
      where: { status: "PUBLISHED" },
      include: {
        pricing: true,
        media: true,
        developer: { select: { username: true } },
      },
    });

    const docs = games.map((g) => ({
      id: g.id,
      title: g.title,
      genre: g.genre || "Action",
      tags: g.tags || [],
      description: g.description || "",
      price: g.pricing?.[0] ? Number(g.pricing[0].price) : 0,
      coverImageUrl: g.media?.coverImageUrl ?? undefined,
      developerName: g.developer?.username ?? "Studio",
    }));

    engine.bulkIndex(docs);
    const stats = engine.getStats();
    console.log(`[SearchEngine] In-Memory Index initialized: ${stats.totalDocuments} published games, ${stats.totalVocabulary} vocabulary terms in Trie.`);
  } catch (err) {
    console.error("[SearchEngine] Failed to initialize in-memory search index:", err);
  }
}

