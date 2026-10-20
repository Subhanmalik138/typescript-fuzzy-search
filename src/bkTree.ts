import { levenshtein } from "./levenshtein";

/**
 * BK-tree for metric-space nearest-neighbor search.
 *
 * A BK-tree organizes strings by their Levenshtein distance from a root
 * term: each child lives under the edge labeled with its distance to the
 * parent. Querying with a radius r only descends into edges whose label is
 * within [d - r, d + r] of the query's distance to the current node, which
 * prunes the vast majority of the tree. That turns a brute-force
 * O(n) scan per query into something close to O(log n) in practice —
 * the structure spell-checkers use.
 */
interface BKNode {
  term: string;
  children: Map<number, BKNode>;
}

export class BKTree {
  private root: BKNode | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  add(term: string): void {
    if (this.root === null) {
      this.root = { term, children: new Map() };
      this._size++;
      return;
    }
    let node = this.root;
    while (true) {
      const dist = levenshtein(term, node.term);
      if (dist === 0) return; // already present
      const child = node.children.get(dist);
      if (child === undefined) {
        node.children.set(dist, { term, children: new Map() });
        this._size++;
        return;
      }
      node = child;
    }
  }

  /**
   * All indexed terms within `maxDistance` edits of `query`,
   * returned as [term, distance] pairs sorted by distance.
   */
  query(query: string, maxDistance: number): Array<[string, number]> {
    const results: Array<[string, number]> = [];
    if (this.root === null) return results;

    const stack: BKNode[] = [this.root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      const dist = levenshtein(query, node.term);
      if (dist <= maxDistance) results.push([node.term, dist]);
      // Triangle inequality: only edges in [dist - r, dist + r] can match.
      const lo = dist - maxDistance;
      const hi = dist + maxDistance;
      for (const [edge, child] of node.children) {
        if (edge >= lo && edge <= hi) stack.push(child);
      }
    }
    results.sort((a, b) => a[1] - b[1]);
    return results;
  }
}
