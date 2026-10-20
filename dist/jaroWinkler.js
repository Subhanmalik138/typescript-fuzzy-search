"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WINKLER_MAX_PREFIX = exports.WINKLER_PREFIX_SCALE = void 0;
exports.jaro = jaro;
exports.jaroWinkler = jaroWinkler;
/**
 * Jaro and Jaro-Winkler string similarity (0..1).
 *
 * Jaro rewards strings that share characters in roughly the same order;
 * Winkler's prefix bonus pushes scores up when strings share a common
 * prefix, which is exactly what matters for autocomplete and typo
 * correction ("kitten" vs "sitting": similar strings, but the shared
 * prefix is what surfaces the right suggestion first).
 */
function jaro(s1, s2) {
    if (s1 === s2)
        return 1;
    const len1 = s1.length;
    const len2 = s2.length;
    if (len1 === 0 || len2 === 0)
        return 0;
    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
    const s1Matched = new Array(len1).fill(false);
    const s2Matched = new Array(len2).fill(false);
    let matches = 0;
    for (let i = 0; i < len1; i++) {
        const start = Math.max(0, i - matchWindow);
        const end = Math.min(len2 - 1, i + matchWindow);
        for (let j = start; j <= end; j++) {
            if (!s2Matched[j] && s1[i] === s2[j]) {
                s1Matched[i] = true;
                s2Matched[j] = true;
                matches++;
                break;
            }
        }
    }
    if (matches === 0)
        return 0;
    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < len1; i++) {
        if (s1Matched[i]) {
            while (!s2Matched[k])
                k++;
            if (s1[i] !== s2[k])
                transpositions++;
            k++;
        }
    }
    transpositions /= 2;
    return ((matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3);
}
exports.WINKLER_PREFIX_SCALE = 0.1;
exports.WINKLER_MAX_PREFIX = 4;
/** Jaro-Winkler similarity: Jaro plus a bonus for a shared prefix (capped at 4 chars). */
function jaroWinkler(s1, s2) {
    const j = jaro(s1, s2);
    let prefix = 0;
    const maxPrefix = Math.min(s1.length, s2.length, exports.WINKLER_MAX_PREFIX);
    while (prefix < maxPrefix && s1[prefix] === s2[prefix])
        prefix++;
    return j + prefix * exports.WINKLER_PREFIX_SCALE * (1 - j);
}
//# sourceMappingURL=jaroWinkler.js.map