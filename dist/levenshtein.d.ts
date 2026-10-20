/**
 * Levenshtein edit distance between two strings.
 *
 * Implemented with a single-row dynamic programming table, so memory is
 * O(min(m, n)) instead of O(m*n). Short-circuits when the absolute length
 * difference already exceeds the limit (if provided).
 */
export declare function levenshtein(a: string, b: string, limit?: number): number;
/** Edit distance normalized to [0, 1]: 1 means identical, 0 means maximally different. */
export declare function normalizedSimilarity(a: string, b: string): number;
