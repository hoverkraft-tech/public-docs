import { describe, it, expect } from "vitest";

const { RepositoryCategorizer } = await import(
  "../lib/repository-categorizer.js"
);

describe("RepositoryCategorizer", () => {
  it("keeps fallback category last", () => {
    const categorizer = new RepositoryCategorizer();
    const categories = categorizer.categorize([{ name: "repo" }]);
    const keys = Object.keys(categories);

    expect(keys.at(-1)).toBe("Other");
  });

  it("keeps custom fallback category last", () => {
    const categorizer = new RepositoryCategorizer({ fallbackCategory: "Misc" });
    const categories = categorizer.categorize([{ name: "repo" }]);
    const keys = Object.keys(categories);

    expect(keys.at(-1)).toBe("Misc");
  });
});
