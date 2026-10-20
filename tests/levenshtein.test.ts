import { levenshtein, normalizedSimilarity } from "../src/levenshtein";

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("kitten", "kitten")).toBe(0);
    expect(levenshtein("", "")).toBe(0);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  it("computes the classic example", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });

  it("counts single edits", () => {
    expect(levenshtein("cat", "cut")).toBe(1); // substitution
    expect(levenshtein("cat", "cats")).toBe(1); // insertion
    expect(levenshtein("cats", "cat")).toBe(1); // deletion
  });

  it("is symmetric", () => {
    expect(levenshtein("saturday", "sunday")).toBe(
      levenshtein("sunday", "saturday")
    );
  });

  it("short-circuits past the limit", () => {
    expect(levenshtein("kitten", "sitting", 1)).toBeGreaterThan(1);
    expect(levenshtein("kitten", "sitting", 3)).toBe(3);
  });
});

describe("normalizedSimilarity", () => {
  it("returns 1 for identical strings", () => {
    expect(normalizedSimilarity("abc", "abc")).toBe(1);
  });

  it("returns 0 for completely different strings", () => {
    expect(normalizedSimilarity("abc", "xyz")).toBe(0);
  });

  it("stays in [0, 1]", () => {
    const s = normalizedSimilarity("kitten", "sitting");
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
});
