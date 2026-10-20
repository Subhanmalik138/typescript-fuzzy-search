"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BKTree = void 0;
const levenshtein_1 = require("./levenshtein");
class BKTree {
    constructor() {
        this.root = null;
        this._size = 0;
    }
    get size() {
        return this._size;
    }
    add(term) {
        if (this.root === null) {
            this.root = { term, children: new Map() };
            this._size++;
            return;
        }
        let node = this.root;
        while (true) {
            const dist = (0, levenshtein_1.levenshtein)(term, node.term);
            if (dist === 0)
                return; // already present
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
    query(query, maxDistance) {
        const results = [];
        if (this.root === null)
            return results;
        const stack = [this.root];
        while (stack.length > 0) {
            const node = stack.pop();
            const dist = (0, levenshtein_1.levenshtein)(query, node.term);
            if (dist <= maxDistance)
                results.push([node.term, dist]);
            // Triangle inequality: only edges in [dist - r, dist + r] can match.
            const lo = dist - maxDistance;
            const hi = dist + maxDistance;
            for (const [edge, child] of node.children) {
                if (edge >= lo && edge <= hi)
                    stack.push(child);
            }
        }
        results.sort((a, b) => a[1] - b[1]);
        return results;
    }
}
exports.BKTree = BKTree;
//# sourceMappingURL=bkTree.js.map