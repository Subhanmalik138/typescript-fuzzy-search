import { BKTree } from "../src/bkTree";
import { levenshtein } from "../src/levenshtein";

describe("BKTree", () => {
  it("returns no results when empty", () => {
    expect(new BKTree().query("hello", 2)).toEqual([]);
  });

  it("finds an exact match", () => {
    const tree = new BKTree();
    tree.add("hello");
    expect(tree.query("hello", 0)).toEqual([["hello", 0]]);
  });

  it("finds terms within the radius and sorts by distance", () => {
    const tree = new BKTree();
    for (const word of ["apple", "apply", "applet", "banana", "pineapple"]) {
      tree.add(word);
    }
    const results = tree.query("aple", 2);
    const terms = results.map(([t]) => t);
    expect(terms).toContain("apple");
    expect(terms).toContain("apply");
    expect(terms).not.toContain("banana");
    // distances must be non-decreasing
    const distances = results.map(([, d]) => d);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it("ignores duplicate inserts", () => {
    const tree = new BKTree();
    tree.add("dup");
    tree.add("dup");
    expect(tree.size).toBe(1);
  });

  it("agrees with brute force on a word list", () => {
    const words = [
      "kitten", "sitting", "kitchen", "mitten", "written",
      "button", "bitten", "bit", "kite", "site",
    ];
    const tree = new BKTree();
    words.forEach((w) => tree.add(w));

    // brute-force reference (compare as sets ordered by [distance, term],
    // since ties have no defined order in the tree traversal)
    const byTerm = (a: [string, number], b: [string, number]) =>
      a[1] - b[1] || a[0].localeCompare(b[0]);
    const brute = words
      .map((w) => [w, levenshtein("kiten", w)] as [string, number])
      .filter(([, d]) => d <= 2)
      .sort(byTerm);

    expect(tree.query("kiten", 2).sort(byTerm)).toEqual(brute);
  });
});
