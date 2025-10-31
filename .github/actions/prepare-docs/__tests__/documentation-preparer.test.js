import { describe, it, expect, afterEach, vi } from "vitest";
import mockFs from "mock-fs";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

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
    artifactPath: overrides.artifactPath ?? "/workspace/artifact",
    outputPath: overrides.outputPath ?? "/workspace/output",
    sourceRepository: overrides.sourceRepository ?? "hoverkraft-tech/example",
    runId: overrides.runId ?? "12345",
    docsPath: overrides.docsPath ?? "/workspace/site/docs",
    staticPath: overrides.staticPath ?? "/workspace/site/static",
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
  afterEach(() => {
    mockFs.restore();
  });

  it("prepares the documentation bundle end-to-end", async () => {
    mockFs({
      "/workspace": {
        artifact: {
          docs: {
            "guide.md": "# Guide\n\nContent",
          },
          images: {
            "logo.png": "binary",
          },
        },
        site: {
          docs: {},
          static: {},
        },
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
      "static/assets/images/logo.png",
    ]);
    expect(result.sourceBranch).toBe("main");

    const outputFiles = listRelativeFiles(options.outputPath);
    expect(outputFiles).toEqual([
      "_index.md",
      "docs/guide.md",
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

    expect(options.core.info).toHaveBeenCalledWith(
      "Preparing documentation bundle for hoverkraft-tech/example",
    );
    expect(options.core.info).toHaveBeenCalledWith(
      "Documentation bundle prepared with 3 files.",
    );
  });

  it("fails fast when the source repository slug is invalid", async () => {
    mockFs({
      "/workspace": {
        artifact: {},
        site: {
          docs: {},
          static: {},
        },
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
