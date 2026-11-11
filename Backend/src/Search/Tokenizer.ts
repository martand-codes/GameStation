/**
 * Custom Text Preprocessing & Tokenization Engine
 * Handles normalization, stop-word pruning, and suffix stemming.
 */

// Common English stop words that add zero semantic discrimination value
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
  "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves"
]);

/**
 * Lightweight Porter-style algorithmic stemmer for English suffixes
 */
export function stem(word: string): string {
  if (word.length <= 3) return word;

  let w = word.toLowerCase();

  // Step 1: Plurals and participle endings
  if (w.endsWith("sses")) w = w.slice(0, -2);
  else if (w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.endsWith("ss")) { /* keep ss */ }
  else if (w.endsWith("s") && !w.endsWith("is") && !w.endsWith("us")) w = w.slice(0, -1);

  if (w.endsWith("eed")) {
    if (w.length > 4) w = w.slice(0, -1);
  } else if (w.endsWith("ed") && w.length > 4) {
    w = w.slice(0, -2);
  } else if (w.endsWith("ing") && w.length > 5) {
    w = w.slice(0, -3);
  }

  // Step 2: Common derivational suffixes
  if (w.endsWith("tional")) w = w.slice(0, -2);
  else if (w.endsWith("ization")) w = w.slice(0, -5);
  else if (w.endsWith("ation")) w = w.slice(0, -3);
  else if (w.endsWith("ator")) w = w.slice(0, -2);
  else if (w.endsWith("alism")) w = w.slice(0, -3);
  else if (w.endsWith("ness")) w = w.slice(0, -4);
  else if (w.endsWith("ment") && w.length > 6) w = w.slice(0, -4);

  return w;
}

/**
 * Clean and normalize a string into individual semantic tokens
 */
export function tokenize(text: string, options: { removeStopWords?: boolean; applyStemming?: boolean } = {}): string[] {
  const { removeStopWords = true, applyStemming = true } = options;
  if (!text || typeof text !== "string") return [];

  // 1. Lowercase and replace non-alphanumeric (except digits and hyphens) with spaces
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[-_]/g, " ");

  // 2. Split into terms
  const terms = cleaned.split(/\s+/).filter((t) => t.length > 1);

  // 3. Filter stop words & apply stemming
  const tokens: string[] = [];
  for (const term of terms) {
    if (removeStopWords && STOP_WORDS.has(term)) continue;
    tokens.push(applyStemming ? stem(term) : term);
  }

  return tokens;
}

