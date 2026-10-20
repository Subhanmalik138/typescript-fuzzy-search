import { FuzzyIndex } from "../src/fuzzyIndex";

interface Doc {
  id: number;
  title: string;
}

function sampleIndex(): FuzzyIndex<Doc> {
  const index = new FuzzyIndex<Doc>();
  const docs: Doc[] = [
    { id: 1, title: "apple" },
    { id: 2, title: "apply" },
    { id: 3, title: "applet" },
    { id: 4, title: "banana" },
    { id: 5, title: "pineapple" },
  ];
  index.addAll(docs, (d) => d.title);
  return index;
}

describe("FuzzyIndex", () => {
  it("ranks the closest term first for a typo", () => {
    const results = sampleIndex().search("aple");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.title).toBe("apple");
  });

  it("returns results sorted by descending score", () => {
    const results = sampleIndex().search("appl", { limit: 5 });
    const scores = results.map((r) => r.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("respects the limit option", () => {
    expect(sampleIndex().search("a", { limit: 2, maxDistance: 5 }).length).toBeLessThanOrEqual(2);
  });

  it("finds nothing when the query is too far away", () => {
    expect(sampleIndex().search("zzzzzzzz", { maxDistance: 1 })).toEqual([]);
  });

  it("returns no results for a blank query", () => {
    expect(sampleIndex().search("   ")).toEqual([]);
  });

  it("matches case-insensitively by default", () => {
    const results = sampleIndex().search("APLE");
    expect(results[0].item.title).toBe("apple");
  });

  it("supports multiple items under one key", () => {
    const index = new FuzzyIndex<string>();
    index.add("apple", "fruit");
    index.add("apple", "company");
    const results = index.search("apple", { maxDistance: 0 });
    expect(results.map((r) => r.item).sort()).toEqual(["company", "fruit"]);
  });

  it("reports the number of unique keys", () => {
    expect(sampleIndex().size).toBe(5);
  });
});
