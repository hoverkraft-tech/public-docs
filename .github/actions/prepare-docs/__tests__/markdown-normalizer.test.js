import { describe, it, expect, beforeEach, afterEach } from "vitest";
import mockFs from "mock-fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  normalizeMarkdownBody,
} = require("../lib/markdown/markdown-normalizer");

function createOptions(overrides = {}) {
  return {
    assetMap: overrides.assetMap ?? new Map(),
    docRelativePath: overrides.docRelativePath ?? "docs/guide/index.md",
    docsPath: overrides.docsPath ?? "/workspace/docs",
    staticPath: overrides.staticPath ?? "/workspace/static/ci-namespace",
  };
}

describe("normalizeMarkdownBody", () => {
  beforeEach(() => {
    mockFs({
      "/workspace": {
        docs: {
          guide: {
            "index.md": "",
          },
        },
        static: {
          "ci-namespace": {
            assets: {
              images: {
                "logo.png": "image-bytes",
              },
              "photo.jpg": "image-bytes",
            },
          },
        },
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("returns the original content when input is empty", () => {
    const result = normalizeMarkdownBody("", createOptions());

    expect(result).toBe("");
  });

  it("converts angle bracket links and rewrites local asset references", () => {
    const assetMap = new Map([
      [
        "docs/images/logo.png",
        {
          storageRelativePath: "assets/images/logo.png",
          publicPath: "/assets/images/logo.png",
        },
      ],
      [
        "docs/assets/photo.jpg",
        {
          storageRelativePath: "assets/photo.jpg",
          publicPath: "/assets/photo.jpg",
        },
      ],
    ]);

    const options = createOptions({ assetMap });

    const input = `
Visit <https://example.com> or email <docs@example.com>.
![Logo](../images/logo.png "Logo")
[Docs][docs-link]

[docs-link]: ../docs/guide.md "Guide"
<img src="../assets/photo.jpg" alt="Photo">
<a href="../docs/start.md">Start</a>
`;

    const result = normalizeMarkdownBody(input, options);

    expect(result).toBe(`
Visit [https://example.com](https://example.com) or email [docs@example.com](mailto:docs@example.com).
![Logo](/ci-namespace/assets/images/logo.png "Logo")
[Docs][docs-link]

[docs-link]: ../docs/guide.md "Guide"
<img src="/ci-namespace/assets/photo.jpg" alt="Photo">
<a href="../docs/start.md">Start</a>
`);
  });

  it("preserves original targets when the asset map has no matches", () => {
    const input = `
[External](https://example.com "Example")
<img src=" https://cdn.example.com/logo.svg " alt="Logo">
`;

    const result = normalizeMarkdownBody(input, createOptions());

    expect(result).toBe(`
[External](https://example.com "Example")
<img src=" https://cdn.example.com/logo.svg " alt="Logo">
`);
  });

  it("throws when markdown references an unregistered asset", () => {
    const input = "![Missing](../images/missing.png)";

    expect(() => normalizeMarkdownBody(input, createOptions())).toThrow(
      /Missing asset registration/,
    );
  });

  it("rewrites links for existing static assets even without registration", () => {
    const input = "![Logo](../images/logo.png)";

    const result = normalizeMarkdownBody(input, createOptions());

    expect(result).toBe("![Logo](/ci-namespace/assets/images/logo.png)");
  });
});
