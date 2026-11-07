import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import os from "node:os";
import { writeFixtureTree } from "./fixtures.mjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let workspace;
beforeEach(() => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "prepare-docs-test-"));
});
afterEach(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

const require = createRequire(import.meta.url);
const { DocumentationPreparer } = require("../lib/documentation-preparer");

function createGithub(branch = "main") {
  const getWorkflowRun = vi
    .fn()
    .mockResolvedValue({ data: { head_branch: branch } });

  return {
    rest: {
      actions: {
        getWorkflowRun,
      },
    },
  };
}

function createIo() {
  return {
    mkdirP: vi.fn((dir) => fs.promises.mkdir(dir, { recursive: true })),
    rmRF: vi.fn((target) =>
      fs.promises.rm(target, { recursive: true, force: true }),
    ),
    cp: vi.fn((src, dest) => fs.promises.copyFile(src, dest)),
  };
}

function createOptions(overrides = {}) {
  const github = overrides.github ?? createGithub();
  const io = overrides.io ?? createIo();
  const core = overrides.core ?? {
    info: vi.fn(),
    setFailed: vi.fn(),
  };

  return {
    github,
    core,
    io,
    artifactPath: overrides.artifactPath ?? path.join(workspace, "artifact"),
    outputPath: overrides.outputPath ?? path.join(workspace, "output"),
    sourceRepository: overrides.sourceRepository ?? "hoverkraft-tech/example",
    runId: overrides.runId ?? "12345",
    docsPath: overrides.docsPath ?? path.join(workspace, "site/docs"),
    staticPath: overrides.staticPath ?? path.join(workspace, "site/static"),
    ...overrides,
  };
}

function listRelativeFiles(root) {
  const results = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        results.push(path.relative(root, fullPath));
      }
    }
  }

  if (fs.existsSync(root)) {
    walk(root);
  }

  return results.sort();
}

describe("DocumentationPreparer", () => {
  it("prepares the documentation bundle end-to-end", async () => {
    writeFixtureTree(workspace, {
      artifact: {
        docs: {
          "guide.md": "# Guide\n\nContent",
          nested: {
            "overview.md": "# Overview\n\nDetails",
          },
        },
        images: {
          "logo.png": "binary",
        },
      },
      site: {
        docs: {},
        static: {},
      },
    });

    const options = createOptions();
    const preparer = new DocumentationPreparer(options);
    const result = await preparer.run();

    expect(options.github.rest.actions.getWorkflowRun).toHaveBeenCalledWith({
      owner: "hoverkraft-tech",
      repo: "example",
      run_id: options.runId,
    });

    expect(options.io.rmRF).toHaveBeenCalledWith(options.outputPath);
    expect(options.io.mkdirP).toHaveBeenCalledWith(options.outputPath);

    const processedFiles = result.processedFiles.slice().sort();
    expect(processedFiles).toEqual([
      "_index.md",
      "docs/guide.md",
      "docs/nested/_index.md",
      "docs/nested/overview.md",
      "static/assets/images/logo.png",
    ]);
    expect(result.sourceBranch).toBe("main");

    const outputFiles = listRelativeFiles(options.outputPath);
    expect(outputFiles).toEqual([
      "_index.md",
      "docs/guide.md",
      "docs/nested/_index.md",
      "docs/nested/overview.md",
      "static/assets/images/logo.png",
    ]);

    const docContent = fs.readFileSync(
      path.join(options.outputPath, "docs/guide.md"),
      "utf8",
    );
    expect(docContent).toContain("source_repo: hoverkraft-tech/example");
    expect(docContent).toContain("last_synced:");

    const indexContent = fs.readFileSync(
      path.join(options.outputPath, "_index.md"),
      "utf8",
    );
    expect(indexContent).toContain("Documentation for the Example project.");

    const nestedIndexContent = fs.readFileSync(
      path.join(options.outputPath, "docs/nested/_index.md"),
      "utf8",
    );
    expect(nestedIndexContent).toContain("title: Nested");
    expect(nestedIndexContent).toContain(
      "This page is generated automatically to introduce the Nested documentation section.",
    );

    expect(options.core.info).toHaveBeenCalledWith(
      "Preparing documentation bundle for hoverkraft-tech/example",
    );
    expect(options.core.info).toHaveBeenCalledWith(
      "  Generated nested index: docs/nested/_index.md",
    );
    expect(options.core.info).toHaveBeenCalledWith(
      "Documentation bundle prepared with 5 files.",
    );
  });

  it("creates index pages for intermediate directories without direct markdown", async () => {
    writeFixtureTree(workspace, {
      artifact: {
        actions: {
          checkout: {
            "README.md": "# Checkout\n\nDetails",
          },
          slugify: {
            "README.md": "# Slugify\n\nDetails",
          },
        },
      },
      site: {
        docs: {},
        static: {},
      },
    });

    const options = createOptions();
    const preparer = new DocumentationPreparer(options);
    const result = await preparer.run();

    expect(result.processedFiles).toContain("actions/_index.md");
    expect(result.processedFiles).toContain("actions/checkout/index.md");
    expect(result.processedFiles).toContain("actions/slugify/index.md");

    const actionIndexPath = path.join(options.outputPath, "actions/_index.md");
    expect(fs.existsSync(actionIndexPath)).toBe(true);

    const content = fs.readFileSync(actionIndexPath, "utf8");
    expect(content).toContain("title: Actions");
  });

  it("does not create a fallback _index when the bundle already contains index.md", async () => {
    writeFixtureTree(workspace, {
      artifact: {
        "README.md": "# Example\n\nMain page",
        actions: {
          checkout: {
            "README.md": "# Checkout\n\nDetails",
          },
        },
      },
      site: {
        docs: {},
        static: {},
      },
    });

    const options = createOptions();
    const preparer = new DocumentationPreparer(options);
    const result = await preparer.run();

    expect(result.processedFiles).toContain("index.md");
    expect(result.processedFiles).not.toContain("_index.md");
    expect(fs.existsSync(path.join(options.outputPath, "index.md"))).toBe(true);
    expect(fs.existsSync(path.join(options.outputPath, "_index.md"))).toBe(
      false,
    );
    expect(options.core.info).not.toHaveBeenCalledWith(
      "Generated default index page for documentation bundle.",
    );
  });

  it("keeps bundled Markdown links local and links omitted guides to their source", async () => {
    writeFixtureTree(workspace, {
      artifact: {
        "README.md":
          "# Example\n\n[Guides](docs/README.md#usage)\n[Action](actions/demo/README.md)\n[License](LICENSE)",
        actions: {
          demo: {
            "README.md":
              "# Demo\n\n[Home](../../README.md)\n[Guide](../../docs/Getting Started.md?raw=1#usage)",
          },
        },
      },
    });
    const options = createOptions();
    await new DocumentationPreparer(options).run();
    const homepage = fs.readFileSync(
      path.join(options.outputPath, "index.md"),
      "utf8",
    );
    expect(homepage).toContain(
      "[Guides](https://github.com/hoverkraft-tech/example/blob/main/docs/README.md#usage)",
    );
    expect(homepage).toContain("[Action](actions/demo/index.md)");
    expect(homepage).toContain(
      "[License](https://github.com/hoverkraft-tech/example/blob/main/LICENSE)",
    );
    const actionPage = fs.readFileSync(
      path.join(options.outputPath, "actions/demo/index.md"),
      "utf8",
    );
    expect(actionPage).toContain("[Home](../../index.md)");
    expect(actionPage).toContain(
      "[Guide](https://github.com/hoverkraft-tech/example/blob/main/docs/Getting%20Started.md?raw=1#usage)",
    );
  });

  it("fails fast when the source repository slug is invalid", async () => {
    writeFixtureTree(workspace, {
      artifact: {},
      site: {
        docs: {},
        static: {},
      },
    });

    const options = createOptions({
      sourceRepository: "hoverkraft-tech",
    });
    const preparer = new DocumentationPreparer(options);

    await expect(preparer.run()).rejects.toThrow(
      'Invalid repository slug "hoverkraft-tech".',
    );

    expect(options.github.rest.actions.getWorkflowRun).not.toHaveBeenCalled();
    expect(options.io.rmRF).toHaveBeenCalledWith(options.outputPath);
    expect(options.io.mkdirP).toHaveBeenCalledWith(options.outputPath);
    expect(listRelativeFiles(options.outputPath)).toEqual([]);
  });
});
