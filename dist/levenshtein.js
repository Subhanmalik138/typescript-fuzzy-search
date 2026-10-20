"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levenshtein = levenshtein;
exports.normalizedSimilarity = normalizedSimilarity;
/**
 * Levenshtein edit distance between two strings.
 *
 * Implemented with a single-row dynamic programming table, so memory is
 * O(min(m, n)) instead of O(m*n). Short-circuits when the absolute length
 * difference already exceeds the limit (if provided).
 */
function levenshtein(a, b, limit) {
    if (a === b)
        return 0;
    if (a.length === 0)
        return b.length;
    if (b.length === 0)
        return a.length;
    // Keep `a` as the shorter string to minimize the DP row size.
    if (a.length > b.length)
        [a, b] = [b, a];
    if (limit !== undefined && b.length - a.length > limit)
        return limit + 1;
    let prev = new Array(a.length + 1);
    let curr = new Array(a.length + 1);
    for (let i = 0; i <= a.length; i++)
        prev[i] = i;
    for (let j = 1; j <= b.length; j++) {
        curr[0] = j;
        let rowMin = curr[0];
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[i] = Math.min(prev[i] + 1, curr[i - 1] + 1, prev[i - 1] + cost);
            if (curr[i] < rowMin)
                rowMin = curr[i];
        }
        if (limit !== undefined && rowMin > limit)
            return limit + 1;
        [prev, curr] = [curr, prev];
    }
    return prev[a.length];
}
/** Edit distance normalized to [0, 1]: 1 means identical, 0 means maximally different. */
function normalizedSimilarity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0)
        return 1;
    return 1 - levenshtein(a, b) / maxLen;
}
//# sourceMappingURL=levenshtein.js.map