import { tokenize } from "./Tokenizer.js";

export interface SearchableDocument {
  id: string;
  title: string;
  genre: string;
  tags: string[];
  description: string;
  price: number;
  coverImageUrl?: string;
  developerName?: string;
}

export interface Posting {
  docId: string;
  termFrequency: number;
  fieldHits: {
    title: number;
    tags: number;
    genre: number;
    description: number;
  };
}

export class InvertedIndex {
  private postings: Map<string, Posting[]> = new Map();
  private documents: Map<string, SearchableDocument> = new Map();
  private docLengths: Map<string, number> = new Map();
  private totalCorpusTokens: number = 0;

  /**
   * Index or update a document in the Inverted Index
   */
  public addDocument(doc: SearchableDocument): void {
    // If updating an existing doc, remove old postings first
    if (this.documents.has(doc.id)) {
      this.removeDocument(doc.id);
    }

    this.documents.set(doc.id, doc);

    // 1. Tokenize fields individually to support field-weighting
    const titleTokens = tokenize(doc.title);
    const genreTokens = tokenize(doc.genre);
    const tagTokens = tokenize(doc.tags.join(" "));
    const descTokens = tokenize(doc.description);

    const docLength = titleTokens.length + genreTokens.length + tagTokens.length + descTokens.length;
    this.docLengths.set(doc.id, docLength);
    this.totalCorpusTokens += docLength;

    // 2. Count term occurrences per field
    const termMap: Map<string, Posting["fieldHits"]> = new Map();

    const recordTokens = (tokens: string[], field: keyof Posting["fieldHits"]) => {
      for (const t of tokens) {
        if (!termMap.has(t)) {
          termMap.set(t, { title: 0, tags: 0, genre: 0, description: 0 });
        }
        termMap.get(t)![field]++;
      }
    };

    recordTokens(titleTokens, "title");
    recordTokens(genreTokens, "genre");
    recordTokens(tagTokens, "tags");
    recordTokens(descTokens, "description");

    // 3. Append to Inverted Postings List
    for (const [term, hits] of termMap.entries()) {
      if (!this.postings.has(term)) {
        this.postings.set(term, []);
      }

      const totalTf = hits.title + hits.genre + hits.tags + hits.description;
      this.postings.get(term)!.push({
        docId: doc.id,
        termFrequency: totalTf,
        fieldHits: hits,
      });
    }
  }

  /**
   * Remove a document from the index
   */
  public removeDocument(docId: string): void {
    if (!this.documents.has(docId)) return;

    this.documents.delete(docId);
    const length = this.docLengths.get(docId) || 0;
    this.totalCorpusTokens -= length;
    this.docLengths.delete(docId);

    // Filter out docId from all postings lists
    for (const [term, list] of this.postings.entries()) {
      const filtered = list.filter((p) => p.docId !== docId);
      if (filtered.length === 0) {
        this.postings.delete(term);
      } else {
        this.postings.set(term, filtered);
      }
    }
  }

  public getPostings(term: string): Posting[] {
    return this.postings.get(term) || [];
  }

  public getDocument(docId: string): SearchableDocument | undefined {
    return this.documents.get(docId);
  }

  public getDocumentLength(docId: string): number {
    return this.docLengths.get(docId) || 0;
  }

  public getDocumentFrequency(term: string): number {
    return this.postings.get(term)?.length || 0;
  }

  public getTotalDocs(): number {
    return this.documents.size;
  }

  public getAvgDocLength(): number {
    const totalDocs = this.documents.size;
    if (totalDocs === 0) return 0;
    return this.totalCorpusTokens / totalDocs;
  }

  public getAllVocabulary(): string[] {
    return Array.from(this.postings.keys());
  }

  public clear(): void {
    this.postings.clear();
    this.documents.clear();
    this.docLengths.clear();
    this.totalCorpusTokens = 0;
  }
}

