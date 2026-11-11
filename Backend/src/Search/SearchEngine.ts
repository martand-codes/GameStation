import { InvertedIndex, type SearchableDocument } from "./InvertedIndex.js";
import { Trie } from "./Trie.js";
import { BM25Scorer } from "./BM25.js";
import { tokenize } from "./Tokenizer.js";

export interface SearchOptions {
  limit?: number;
  fuzzy?: boolean;
  maxDistance?: number;
}

export interface SearchResultItem extends SearchableDocument {
  highlightedTitle: string;
  snippet: string;
  score: number;
  matchedFields: string[];
  matchedTerms: string[];
}

export interface SearchResponse {
  query: string;
  correctedQuery?: string;
  totalMatches: number;
  latencyMs: number;
  results: SearchResultItem[];
}

export class SearchEngine {
  private static instance: SearchEngine;
  private index: InvertedIndex = new InvertedIndex();
  private trie: Trie = new Trie();
  private scorer: BM25Scorer = new BM25Scorer();
  private isReady: boolean = false;

  private constructor() {}

  public static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }

  /**
   * Index a game into both the Inverted Index and the Vocabulary Trie
   */
  public indexDocument(doc: SearchableDocument): void {
    this.index.addDocument(doc);

    // Populate Trie vocabulary
    const allTokens = [
      ...tokenize(doc.title),
      ...tokenize(doc.genre),
      ...tokenize(doc.tags.join(" ")),
      ...tokenize(doc.description),
    ];

    for (const token of allTokens) {
      this.trie.insert(token);
    }

    this.isReady = true;
  }

  /**
   * Bulk index an array of documents
   */
  public bulkIndex(docs: SearchableDocument[]): void {
    this.index.clear();
    for (const doc of docs) {
      this.indexDocument(doc);
    }
  }

  /**
   * Remove a game from the index
   */
  public removeDocument(docId: string): void {
    this.index.removeDocument(docId);
  }

  /**
   * Fast In-Memory Search with BM25 Scoring and Levenshtein Typo Tolerance
   */
  public search(query: string, options: SearchOptions = {}): SearchResponse {
    const startTime = performance.now();
    const { limit = 10, fuzzy = true, maxDistance = 2 } = options;

    const cleanQuery = (query || "").trim();
    if (!cleanQuery) {
      return {
        query: cleanQuery,
        totalMatches: 0,
        latencyMs: 0,
        results: [],
      };
    }

    // 1. Tokenize query
    const rawTokens = tokenize(cleanQuery, { removeStopWords: false });
    const processedTokens = tokenize(cleanQuery, { removeStopWords: true });

    let finalQueryTokens: string[] = processedTokens.length > 0 ? processedTokens : rawTokens;
    let correctedTerms: string[] = [];
    let hadCorrection = false;

    // 2. Prefix Matching & Fuzzy Typo Recovery
    finalQueryTokens = finalQueryTokens.flatMap((token) => {
      // A. If exact term exists in vocabulary, use it!
      if (this.index.getDocumentFrequency(token) > 0) {
        correctedTerms.push(token);
        return [token];
      }

      // B. Check PREFIX MATCH FIRST!
      // If user typed "cyb" or "cybe", autocomplete finds "cyberpunk"
      const prefixMatches = this.trie.autocomplete(token, 3);
      if (prefixMatches.length > 0) {
        correctedTerms.push(prefixMatches[0]);
        return prefixMatches;
      }

      // C. If NO prefix match exists and fuzzy is enabled, check Levenshtein typo distance
      if (fuzzy) {
        const fuzzyCandidates = this.trie.searchFuzzy(token, maxDistance);
        if (fuzzyCandidates.length > 0 && fuzzyCandidates[0].distance > 0) {
          hadCorrection = true;
          const bestMatch = fuzzyCandidates[0].word;
          correctedTerms.push(bestMatch);
          return [bestMatch];
        }
      }

      correctedTerms.push(token);
      return [token];
    });

    // 3. Score candidate documents using Okapi BM25
    const rankedCandidates = this.scorer.score(this.index, finalQueryTokens);

    // 4. Build highlighted responses & snippets
    const results: SearchResultItem[] = rankedCandidates
      .slice(0, limit)
      .map((candidate) => {
        const doc = this.index.getDocument(candidate.docId)!;
        return {
          ...doc,
          highlightedTitle: this.highlightText(doc.title, finalQueryTokens),
          snippet: this.generateSnippet(doc.description, finalQueryTokens),
          score: candidate.score,
          matchedFields: candidate.matchedFields,
          matchedTerms: candidate.matchedTerms,
        };
      });

    const latencyMs = Number((performance.now() - startTime).toFixed(3));

    return {
      query: cleanQuery,
      correctedQuery: hadCorrection ? correctedTerms.join(" ") : undefined,
      totalMatches: rankedCandidates.length,
      latencyMs,
      results,
    };
  }

  /**
   * Fast prefix autocomplete suggestions
   */
  public autocomplete(prefix: string, maxResults: number = 5): string[] {
    return this.trie.autocomplete(prefix, maxResults);
  }

  public getStats() {
    return {
      totalDocuments: this.index.getTotalDocs(),
      totalVocabulary: this.trie.getCount(),
      avgDocLength: Number(this.index.getAvgDocLength().toFixed(1)),
      isReady: this.isReady,
    };
  }

  private highlightText(text: string, searchTerms: string[]): string {
    if (!text || searchTerms.length === 0) return text;
    let highlighted = text;

    for (const term of searchTerms) {
      if (term.length <= 1) continue;
      const regex = new RegExp(`(${term})`, "gi");
      highlighted = highlighted.replace(regex, "<mark class='gs-search-hit'>$1</mark>");
    }

    return highlighted;
  }

  private generateSnippet(text: string, searchTerms: string[], maxLength: number = 140): string {
    if (!text) return "";
    const lower = text.toLowerCase();

    // Find first occurrence of any search term
    let bestIndex = -1;
    for (const term of searchTerms) {
      const idx = lower.indexOf(term.toLowerCase());
      if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
        bestIndex = idx;
      }
    }

    if (bestIndex === -1) {
      return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    }

    const start = Math.max(0, bestIndex - 30);
    const end = Math.min(text.length, bestIndex + maxLength - 30);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < text.length ? "..." : "";

    const rawSnippet = `${prefix}${text.slice(start, end)}${suffix}`;
    return this.highlightText(rawSnippet, searchTerms);
  }
}

