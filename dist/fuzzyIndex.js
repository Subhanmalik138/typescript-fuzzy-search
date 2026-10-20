"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuzzyIndex = void 0;
const bkTree_1 = require("./bkTree");
const jaroWinkler_1 = require("./jaroWinkler");
const levenshtein_1 = require("./levenshtein");
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
class FuzzyIndex {
    constructor(options = {}) {
        this.tree = new bkTree_1.BKTree();
        this.items = new Map();
        this.ignoreCase = options.ignoreCase ?? true;
    }
    normalize(text) {
        return this.ignoreCase ? text.toLowerCase() : text;
    }
    /** Index one record under a searchable string key. */
    add(key, item) {
        const normalized = this.normalize(key);
        this.tree.add(normalized);
        const bucket = this.items.get(normalized);
        if (bucket)
            bucket.push(item);
        else
            this.items.set(normalized, [item]);
    }
    /** Bulk-index records; `keyOf` extracts the searchable string per record. */
    addAll(items, keyOf) {
        for (const item of items)
            this.add(keyOf(item), item);
    }
    get size() {
        return this.tree.size;
    }
    search(query, options = {}) {
        const { maxDistance = 2, limit = 10 } = options;
        const normalized = this.normalize(query.trim());
        if (normalized.length === 0)
            return [];
        const candidates = this.tree.query(normalized, maxDistance);
        const scored = [];
        for (const [term, distance] of candidates) {
            const levScore = (0, levenshtein_1.normalizedSimilarity)(normalized, term);
            const jwScore = (0, jaroWinkler_1.jaroWinkler)(normalized, term);
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
exports.FuzzyIndex = FuzzyIndex;
//# sourceMappingURL=fuzzyIndex.js.map