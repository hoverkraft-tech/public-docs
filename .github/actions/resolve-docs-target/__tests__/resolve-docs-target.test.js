import { describe, expect, it, vi } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  run,
  sanitizeSegment,
  parseRepositorySlug,
} = require("../resolve-docs-target");

describe("sanitizeSegment", () => {
  it("lowercases and replaces invalid chars with dashes", () => {
    expect(sanitizeSegment("  Hello World!! ")).toBe("hello-world");
  });

  it("removes leading dots and trims dashes", () => {
    expect(sanitizeSegment("..My--Repo-")).toBe("my-repo");
  });
});

describe("parseRepositorySlug", () => {
  it("parses owner/repo", () => {
    expect(parseRepositorySlug("acme/demo")).toEqual({
      owner: "acme",
      repo: "demo",
    });
  });

  it("throws for invalid slug", () => {
    expect(() => parseRepositorySlug("demo")).toThrow(
      /Invalid repository slug/,
    );
  });
});

describe("run", () => {
  it("resolves category and paths based on topics", async () => {
    const github = {
      rest: {
        repos: {
          get: vi.fn().mockResolvedValue({ data: { description: "demo" } }),
          getAllTopics: vi
            .fn()
            .mockResolvedValue({ data: { names: ["github-actions"] } }),
        },
      },
    };

    const result = await run({
      github,
      core: { debug: vi.fn() },
      repository: "hoverkraft-tech/ci-github-common",
    });

    expect(result.categoryName).toBe("GitHub Actions and Reusable Workflows");
    expect(result.categorySlug).toBe("github-actions-and-reusable-workflows");
    expect(result.docsPath).toBe(
      "application/docs/projects/github-actions-and-reusable-workflows/ci-github-common",
    );
    expect(result.staticPath).toBe("application/static/ci-github-common");
  });

  it("falls back to 'Other' when no topic matches", async () => {
    const github = {
      rest: {
        repos: {
          get: vi.fn().mockResolvedValue({ data: { description: "" } }),
          getAllTopics: vi.fn().mockResolvedValue({ data: { names: [] } }),
        },
      },
    };

    const result = await run({
      github,
      core: { debug: vi.fn() },
      repository: "acme/unknown",
    });

    expect(result.categoryName).toBe("Other");
    expect(result.categorySlug).toBe("other");
    expect(result.docsPath).toBe("application/docs/projects/other/unknown");
    expect(result.staticPath).toBe("application/static/unknown");
  });
});
