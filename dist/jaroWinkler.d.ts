/**
 * Jaro and Jaro-Winkler string similarity (0..1).
 *
 * Jaro rewards strings that share characters in roughly the same order;
 * Winkler's prefix bonus pushes scores up when strings share a common
 * prefix, which is exactly what matters for autocomplete and typo
 * correction ("kitten" vs "sitting": similar strings, but the shared
 * prefix is what surfaces the right suggestion first).
 */
export declare function jaro(s1: string, s2: string): number;
export declare const WINKLER_PREFIX_SCALE = 0.1;
export declare const WINKLER_MAX_PREFIX = 4;
/** Jaro-Winkler similarity: Jaro plus a bonus for a shared prefix (capped at 4 chars). */
export declare function jaroWinkler(s1: string, s2: string): number;
