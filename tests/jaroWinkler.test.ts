import { jaro, jaroWinkler } from "../src/jaroWinkler";

describe("jaro", () => {
  it("returns 1 for identical strings", () => {
    expect(jaro("martha", "martha")).toBe(1);
  });

  it("returns 0 when there is no overlap", () => {
    expect(jaro("abc", "xyz")).toBe(0);
  });

  it("returns 0 for empty strings", () => {
    expect(jaro("", "abc")).toBe(0);
  });

  it("matches the known MARTHA/MARHTA example", () => {
    // jaro("MARTHA", "MARHTA") = 0.9444...
    expect(jaro("MARTHA", "MARHTA")).toBeCloseTo(0.9444, 3);
  });
});

describe("jaroWinkler", () => {
  it("boosts scores for shared prefixes", () => {
    const plain = jaro("application", "apple");
    const boosted = jaroWinkler("application", "apple");
    // shared prefix "appl": Winkler must lift the score
    expect(boosted).toBeGreaterThan(plain);
  });

  it("never exceeds 1", () => {
    expect(jaroWinkler("abc", "abd")).toBeLessThanOrEqual(1);
    expect(jaroWinkler("abc", "abc")).toBe(1);
  });

  it("ranks a typo'd prefix above an unrelated word", () => {
    const typo = jaroWinkler("aple", "apple");
    const unrelated = jaroWinkler("aple", "zebra");
    expect(typo).toBeGreaterThan(unrelated);
  });
});
