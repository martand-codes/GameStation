import type { InvertedIndex, Posting } from "./InvertedIndex.js";

export interface BM25Config {
  k1?: number; // Term frequency saturation (standard = 1.2 to 2.0)
  b?: number;  // Length normalization (standard = 0.75)
  fieldWeights?: {
    title: number;
    tags: number;
    genre: number;
    description: number;
  };
}

const DEFAULT_CONFIG: Required<BM25Config> = {
  k1: 1.2,
  b: 0.75,
  fieldWeights: {
    title: 3.5,       // Title matches get massive prominence
    tags: 2.2,        // Tags are high semantic descriptors
    genre: 1.8,       // Genre classification match
    description: 1.0, // Body description baseline
  },
};

export class BM25Scorer {
  private config: Required<BM25Config>;

  constructor(config?: BM25Config) {
    this.config = {
      k1: config?.k1 ?? DEFAULT_CONFIG.k1,
      b: config?.b ?? DEFAULT_CONFIG.b,
      fieldWeights: {
        ...DEFAULT_CONFIG.fieldWeights,
        ...(config?.fieldWeights || {}),
      },
    };
  }

  /**
   * Calculate Robertson-Spärck Jones Inverse Document Frequency (IDF)
   * Formula: ln( 1 + (N - n + 0.5) / (n + 0.5) )
   */
  public calculateIDF(docFrequency: number, totalDocs: number): number {
    if (totalDocs === 0) return 0;
    const numerator = totalDocs - docFrequency + 0.5;
    const denominator = docFrequency + 0.5;
    return Math.max(0.1, Math.log(1 + numerator / denominator));
  }

  /**
   * Score all candidate documents matching a list of query terms
   */
  public score(
    index: InvertedIndex,
    queryTerms: string[]
  ): { docId: string; score: number; matchedTerms: string[]; matchedFields: string[] }[] {
    const totalDocs = index.getTotalDocs();
    const avgDocLength = index.getAvgDocLength();
    if (totalDocs === 0) return [];

    const scores: Map<string, { score: number; matchedTerms: Set<string>; matchedFields: Set<string> }> = new Map();

    for (const term of queryTerms) {
      const postings = index.getPostings(term);
      if (postings.length === 0) continue;

      const idf = this.calculateIDF(postings.length, totalDocs);

      for (const p of postings) {
        // Calculate weighted term frequency across fields
        const weightedTf =
          p.fieldHits.title * this.config.fieldWeights.title +
          p.fieldHits.tags * this.config.fieldWeights.tags +
          p.fieldHits.genre * this.config.fieldWeights.genre +
          p.fieldHits.description * this.config.fieldWeights.description;

        if (weightedTf <= 0) continue;

        const docLength = index.getDocumentLength(p.docId);
        const lengthNorm = 1 - this.config.b + this.config.b * (docLength / (avgDocLength || 1));
        const numerator = weightedTf * (this.config.k1 + 1);
        const denominator = weightedTf + this.config.k1 * lengthNorm;

        const termScore = idf * (numerator / denominator);

        if (!scores.has(p.docId)) {
          scores.set(p.docId, {
            score: 0,
            matchedTerms: new Set(),
            matchedFields: new Set(),
          });
        }

        const entry = scores.get(p.docId)!;
        entry.score += termScore;
        entry.matchedTerms.add(term);

        if (p.fieldHits.title > 0) entry.matchedFields.add("title");
        if (p.fieldHits.tags > 0) entry.matchedFields.add("tags");
        if (p.fieldHits.genre > 0) entry.matchedFields.add("genre");
        if (p.fieldHits.description > 0) entry.matchedFields.add("description");
      }
    }

    // Convert map to sorted ranked array
    return Array.from(scores.entries())
      .map(([docId, data]) => ({
        docId,
        score: Number(data.score.toFixed(4)),
        matchedTerms: Array.from(data.matchedTerms),
        matchedFields: Array.from(data.matchedFields),
      }))
      .sort((a, b) => b.score - a.score);
  }
}

