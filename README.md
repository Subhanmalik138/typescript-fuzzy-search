# Fuzzy Search Engine (TypeScript)

A small, dependency-free fuzzy string matching library: typo-tolerant search over any list of strings or records. Useful as the engine behind autocomplete, spell-check suggestions, and "did you mean?" features.

```
$ fuzzy-search -f words.txt "aple"
0.873   apple
0.789   applet
0.713   apply
```

## How it works

The library layers three classic pieces:

1. **Levenshtein distance** — edit distance computed with a single-row DP table (O(min(m,n)) memory), with early exit past a caller-supplied limit.
2. **BK-tree** — the terms are indexed in a metric tree keyed by edit distance, so a radius query only visits branches that can contain matches (triangle-inequality pruning) instead of scanning every term.
3. **Re-ranking** — candidates from the BK-tree are re-scored with a 50/50 blend of normalized Levenshtein similarity and Jaro-Winkler similarity. The Winkler prefix bonus is what lifts the *right* suggestion above edit-distance ties (`"aple"` → `"apple"`, not `"apply"`).

`FuzzyIndex<T>` ties it together: bulk-index any records, search by a string key, get typed results with scores in [0, 1].

## Design decisions

- **Two-phase retrieval (BK-tree → re-rank).** Edit distance is a great *filter* (cheap triangle-inequality pruning) but a mediocre *ranker* — it treats all edits equally and ignores prefix structure. Splitting retrieval from ranking keeps queries fast on large term lists while producing noticeably better suggestion order.
- **Score blending, not a single metric.** Pure Jaro-Winkler over-weights short prefix matches; pure Levenshtein under-weights transpositions. The blend scores "kiten" → "kitten" high while keeping unrelated same-prefix words down.
- **Zero runtime dependencies.** Everything is hand-rolled algorithms, so the library has nothing to audit and compiles anywhere TypeScript does. Jest/ts-jest are dev-only.
- **Metric kept generic (`FuzzyIndex<T>`).** Callers index records (`addAll(docs, d => d.title)`) and get their own objects back, not bare strings — the same shape a search API response would have.

## Run

```bash
npm install
npm run build        # compiles to dist/
npm test             # jest suite

# CLI
npm run cli -- "aple" apple apply applet banana
npm run cli -- -f words.txt --limit 5 --distance 3 "wrld"
```

CLI options: `-f/--file <path>` reads terms one per line; `--limit N` caps results (default 10); `--distance N` sets the max edit-distance radius (default 2).

## Library usage

```ts
import { FuzzyIndex } from "./src/fuzzyIndex";

const index = new FuzzyIndex<{ id: number; title: string }>();
index.addAll(products, (p) => p.title);

const hits = index.search("wireles headphones", { maxDistance: 2, limit: 5 });
for (const { item, score } of hits) {
  console.log(score.toFixed(3), item.title);
}
```

Individual metrics are exported too: `levenshtein`, `normalizedSimilarity`, `jaro`, `jaroWinkler`, `BKTree`.

## Tech stack

TypeScript (strict mode) · Jest + ts-jest · zero runtime dependencies

## Tests

29 cases across 4 suites: metric correctness against known examples (kitten/sitting = 3, MARTHA/MARHTA ≈ 0.944), BK-tree agreement with brute force, ranking order, limits, case-insensitivity, and duplicate keys.
