export declare class BKTree {
    private root;
    private _size;
    get size(): number;
    add(term: string): void;
    /**
     * All indexed terms within `maxDistance` edits of `query`,
     * returned as [term, distance] pairs sorted by distance.
     */
    query(query: string, maxDistance: number): Array<[string, number]>;
}
