import { describe, it, expect } from "vitest";
import mockFs from "mock-fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const { AssetRewriter } = require("../lib/services/asset-rewriter");

function createRewriter(overrides = {}) {
  const hasDocsPath = Object.prototype.hasOwnProperty.call(
    overrides,
    "docsPath",
  );
  const hasStaticPath = Object.prototype.hasOwnProperty.call(
    overrides,
    "staticPath",
  );

  return new AssetRewriter({
    assetMap: overrides.assetMap ?? new Map(),
    docRelativePath: overrides.docRelativePath ?? "projects/index.md",
    docsPath: hasDocsPath ? overrides.docsPath : "/workspace/docs",
    staticPath: hasStaticPath
      ? overrides.staticPath
      : "/workspace/static/ci-github-common",
  });
}

function createRegistration(overrides = {}) {
  return {
    storageRelativePath: "assets/images/logo.png",
    publicPath: "/assets/images/logo.png",
    ...overrides,
  };
}

describe("AssetRewriter", () => {
  it("returns early for external targets", () => {
    const rewriter = createRewriter();

    const result = rewriter.rewrite("https://example.com/logo.png");

    expect(result).toEqual({
      value: "https://example.com/logo.png",
      changed: false,
    });
  });

  it("rewrites known assets to the namespaced static path while preserving suffixes", () => {
    const assetMap = new Map([["images/logo.png", createRegistration()]]);

    const rewriter = createRewriter({ assetMap });

    const result = rewriter.rewrite("../images/logo.png?raw=1#hero");

    expect(result).toEqual({
      value: "/ci-github-common/assets/images/logo.png?raw=1#hero",
      changed: true,
    });
  });

  it("normalizes relative paths when no asset mapping is available", () => {
    const rewriter = createRewriter({
      docRelativePath: "guides/getting-started/index.md",
    });

    const result = rewriter.rewrite(" ../My Folder/README.md ");

    expect(result).toEqual({
      value: "My-Folder/index.md",
      changed: true,
    });
  });

  it("throws when an asset reference has no registration", () => {
    const rewriter = createRewriter();

    expect(() => rewriter.rewrite("../images/logo.png")).toThrow(
      /Missing asset registration/,
    );
  });

  it("uses an existing static asset when registration is missing", () => {
    mockFs({
      "/workspace/static/ci-github-common/assets/images": {
        "logo.png": "binary",
      },
    });

    try {
      const rewriter = createRewriter();

      const result = rewriter.rewrite("../images/logo.png");

      expect(result).toEqual({
        value: "/ci-github-common/assets/images/logo.png",
        changed: true,
      });
    } finally {
      mockFs.restore();
    }
  });

  it("retains absolute static links when the asset already exists", () => {
    mockFs({
      "/workspace/static/ci-github-common/assets/images": {
        "logo.png": "binary",
      },
    });

    try {
      const rewriter = createRewriter();

      const result = rewriter.rewrite(
        "/ci-github-common/assets/images/logo.png",
      );

      expect(result).toEqual({
        value: "/ci-github-common/assets/images/logo.png",
        changed: false,
      });
    } finally {
      mockFs.restore();
    }
  });

  it("falls back to the registered public path when no static namespace is configured", () => {
    const assetMap = new Map([["images/logo.png", createRegistration()]]);

    const rewriter = createRewriter({
      assetMap,
      staticPath: undefined,
      docsPath: undefined,
    });

    const result = rewriter.rewrite("../images/logo.png");

    expect(result).toEqual({
      value: "/assets/images/logo.png",
      changed: true,
    });
  });
});
