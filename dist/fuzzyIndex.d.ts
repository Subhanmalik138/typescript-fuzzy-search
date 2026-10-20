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
    score: number;
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
export declare class FuzzyIndex<T> {
    private tree;
    private items;
    private ignoreCase;
    constructor(options?: Pick<SearchOptions, "ignoreCase">);
    private normalize;
    /** Index one record under a searchable string key. */
    add(key: string, item: T): void;
    /** Bulk-index records; `keyOf` extracts the searchable string per record. */
    addAll(items: T[], keyOf: (item: T) => string): void;
    get size(): number;
    search(query: string, options?: SearchOptions): Array<SearchResult<T>>;
}
