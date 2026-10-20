import { BKTree } from "./bkTree";
import { jaroWinkler } from "./jaroWinkler";
import { normalizedSimilarity } from "./levenshtein";

export interface SearchOptions {
  /** Maximum Levenshtein distance a candidate may be from the query. Default 2. */
  maxDistance?: number;
  /** Maximum number of results to return. Default 10. */
  limit?: number;
  /** Case-insensitive matching. Default true. */
  ignoreCase?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score: number; // 0..1, higher is better
}

/**
 * Ranked fuzzy search over arbitrary records.
 *
 * The BK-tree does the cheap candidate retrieval (edit-distance radius),
 * then candidates are re-ranked with a blend of normalized Levenshtein
 * similarity and Jaro-Winkler. The Winkler prefix bonus matters here:
 * for queries that are prefixes of longer terms ("app" -> "apple",
 * "application"), Jaro-Winkler lifts the right candidates above plain
 * edit-distance ties.
 */
export class FuzzyIndex<T> {
  private tree = new BKTree();
  private items = new Map<string, T[]>();
  private ignoreCase: boolean;

  constructor(options: Pick<SearchOptions, "ignoreCase"> = {}) {
    this.ignoreCase = options.ignoreCase ?? true;
  }

  private normalize(text: string): string {
    return this.ignoreCase ? text.toLowerCase() : text;
  }

  /** Index one record under a searchable string key. */
  add(key: string, item: T): void {
    const normalized = this.normalize(key);
    this.tree.add(normalized);
    const bucket = this.items.get(normalized);
    if (bucket) bucket.push(item);
    else this.items.set(normalized, [item]);
  }

  /** Bulk-index records; `keyOf` extracts the searchable string per record. */
  addAll(items: T[], keyOf: (item: T) => string): void {
    for (const item of items) this.add(keyOf(item), item);
  }

  get size(): number {
    return this.tree.size;
  }

  search(query: string, options: SearchOptions = {}): Array<SearchResult<T>> {
    const { maxDistance = 2, limit = 10 } = options;
    const normalized = this.normalize(query.trim());
    if (normalized.length === 0) return [];

    const candidates = this.tree.query(normalized, maxDistance);
    const scored: Array<SearchResult<T>> = [];
    for (const [term, distance] of candidates) {
      const levScore = normalizedSimilarity(normalized, term);
      const jwScore = jaroWinkler(normalized, term);
      // Blend: exact edit closeness matters, but prefix alignment wins ties.
      const score = 0.5 * levScore + 0.5 * jwScore;
      for (const item of this.items.get(term) ?? []) {
        scored.push({ item, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}
