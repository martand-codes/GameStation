/**
 * Prefix Trie Data Structure with Dynamic Programming Levenshtein Automaton
 * Provides sub-millisecond prefix auto-complete and typo-tolerant fuzzy matching.
 */

class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  public isEndOfWord: boolean = false;
  public word?: string;
  public frequency: number = 0;
}

export class Trie {
  private root: TrieNode = new TrieNode();
  private size: number = 0;

  /**
   * Insert a term into the Trie
   */
  public insert(word: string, frequency: number = 1): void {
    if (!word) return;
    const cleanWord = word.toLowerCase().trim();
    let current = this.root;

    for (const char of cleanWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    if (!current.isEndOfWord) {
      this.size++;
    }
    current.isEndOfWord = true;
    current.word = cleanWord;
    current.frequency += frequency;
  }

  /**
   * Return total unique words in Trie
   */
  public getCount(): number {
    return this.size;
  }

  /**
   * Exact match check
   */
  public has(word: string): boolean {
    const cleanWord = word.toLowerCase().trim();
    let current = this.root;

    for (const char of cleanWord) {
      if (!current.children.has(char)) return false;
      current = current.children.get(char)!;
    }

    return current.isEndOfWord;
  }

  /**
   * Fast Prefix Autocomplete (e.g. "cyb" -> ["cyberpunk", "cyber"])
   */
  public autocomplete(prefix: string, maxResults: number = 5): string[] {
    const cleanPrefix = prefix.toLowerCase().trim();
    let current = this.root;

    for (const char of cleanPrefix) {
      if (!current.children.has(char)) return [];
      current = current.children.get(char)!;
    }

    const results: { word: string; frequency: number }[] = [];
    this.collectWords(current, results);

    return results
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, maxResults)
      .map((r) => r.word);
  }

  private collectWords(node: TrieNode, results: { word: string; frequency: number }[]): void {
    if (node.isEndOfWord && node.word) {
      results.push({ word: node.word, frequency: node.frequency });
    }

    for (const child of node.children.values()) {
      this.collectWords(child, results);
    }
  }

  /**
   * Fuzzy Search with Damerau-Levenshtein Distance (including adjacent character transpositions).
   * Finds words in the Trie within maxDistance (default = 2) edits in sub-millisecond time.
   */
  public searchFuzzy(target: string, maxDistance: number = 2): { word: string; distance: number }[] {
    const cleanTarget = target.toLowerCase().trim();
    if (!cleanTarget) return [];

    // Initial DP row: distance from empty prefix to target prefixes [0, 1, 2, ... N]
    const initialRow: number[] = [];
    for (let i = 0; i <= cleanTarget.length; i++) {
      initialRow.push(i);
    }

    const matches: { word: string; distance: number; frequency: number }[] = [];

    // Recursively explore all children of the root
    for (const [char, childNode] of this.root.children.entries()) {
      this.searchFuzzyRecursive(childNode, char, undefined, cleanTarget, initialRow, undefined, matches, maxDistance);
    }

    // Sort by smallest distance first, then highest word frequency
    return matches
      .sort((a, b) => a.distance - b.distance || b.frequency - a.frequency)
      .map(({ word, distance }) => ({ word, distance }));
  }

  private searchFuzzyRecursive(
    node: TrieNode,
    char: string,
    parentChar: string | undefined,
    target: string,
    previousRow: number[],
    twoRowsAgo: number[] | undefined,
    matches: { word: string; distance: number; frequency: number }[],
    maxDistance: number
  ): void {
    const columns = target.length + 1;
    const currentRow: number[] = [previousRow[0] + 1];

    // Compute DP distance values for this Trie node
    for (let col = 1; col < columns; col++) {
      const insertCost = currentRow[col - 1] + 1;
      const deleteCost = previousRow[col] + 1;
      const replaceCost = char === target[col - 1] ? previousRow[col - 1] : previousRow[col - 1] + 1;

      let minCost = Math.min(insertCost, deleteCost, replaceCost);

      // Damerau Transposition: if adjacent chars are swapped (e.g. "by" vs "yb")
      if (
        twoRowsAgo &&
        col > 1 &&
        parentChar !== undefined &&
        char === target[col - 2] &&
        parentChar === target[col - 1]
      ) {
        minCost = Math.min(minCost, twoRowsAgo[col - 2] + 1);
      }

      currentRow.push(minCost);
    }

    // If this node represents a valid word and the last cell <= maxDistance, record it!
    const distance = currentRow[currentRow.length - 1];
    if (node.isEndOfWord && node.word && distance <= maxDistance) {
      matches.push({ word: node.word, distance, frequency: node.frequency });
    }

    // Branch & Bound Pruning: If the minimum value in this row > maxDistance, prune subtree!
    const minRowCost = Math.min(...currentRow);
    if (minRowCost <= maxDistance) {
      for (const [nextChar, nextChild] of node.children.entries()) {
        this.searchFuzzyRecursive(nextChild, nextChar, char, target, currentRow, previousRow, matches, maxDistance);
      }
    }
  }
}
