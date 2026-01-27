import { describe, it, expect, afterEach, vi } from "vitest";
import mockFs from "mock-fs";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { run } = require("../inject-docs");

async function copyRecursive(src, dest) {
  const sourceStats = await fs.promises.stat(src);
  if (sourceStats.isDirectory()) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src);
    await Promise.all(
      entries.map((entry) =>
        copyRecursive(path.join(src, entry), path.join(dest, entry)),
      ),
    );
    return;
  }

  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.copyFile(src, dest);
}

function createIo() {
  return {
    rmRF: vi.fn(async (targetPath) => {
      await fs.promises.rm(targetPath, { recursive: true, force: true });
    }),
    mkdirP: vi.fn(async (targetPath) => {
      await fs.promises.mkdir(targetPath, { recursive: true });
    }),
    cp: vi.fn(async (src, dest) => {
      await copyRecursive(src, dest);
    }),
    mv: vi.fn(async (src, dest) => {
      await fs.promises.mkdir(path.dirname(dest), { recursive: true });
      await fs.promises.rename(src, dest);
    }),
  };
}

describe("inject-docs", () => {
  afterEach(() => {
    mockFs.restore();
    vi.restoreAllMocks();
  });

  it("fails when prepared dir is missing", async () => {
    mockFs();

    const core = { setFailed: vi.fn(), info: vi.fn() };
    const io = createIo();

    await run({
      core,
      io,
      env: {
        SOURCE_REPOSITORY: "hoverkraft-tech/ci-github-common",
        DOCS_PATH:
          "application/docs/projects/github-actions-and-reusable-workflows/ci-github-common",
        STATIC_PATH: "application/static/ci-github-common",
        PREPARED_DIR: "/tmp/does-not-exist",
      },
    });

    expect(core.setFailed).toHaveBeenCalledWith(
      "Prepared documentation directory not found.",
    );
  });

  it("injects docs and moves static assets", async () => {
    const core = { setFailed: vi.fn(), info: vi.fn() };
    const io = createIo();

    const preparedDir = "/tmp/prepared";
    const docsPath = "application/docs/projects/ci-cd-tools/demo";
    const staticPath = "application/static/demo";

    mockFs({
      [preparedDir]: {
        "index.md": "# Hello",
        static: {
          "logo.png": "binary",
        },
      },
      application: {
        docs: {
          projects: {
            "ci-cd-tools": {
              demo: {
                "old.md": "old",
              },
            },
          },
        },
        static: {
          demo: {
            "old.png": "old",
          },
        },
      },
    });

    await run({
      core,
      io,
      env: {
        SOURCE_REPOSITORY: "hoverkraft-tech/demo",
        DOCS_PATH: docsPath,
        STATIC_PATH: staticPath,
        PREPARED_DIR: preparedDir,
      },
    });

    expect(core.setFailed).not.toHaveBeenCalled();

    expect(fs.existsSync(path.join(docsPath, "index.md"))).toBe(true);
    expect(fs.existsSync(path.join(docsPath, "old.md"))).toBe(false);

    expect(fs.existsSync(path.join(staticPath, "logo.png"))).toBe(true);
    expect(fs.existsSync(path.join(staticPath, "old.png"))).toBe(false);

    expect(fs.existsSync(path.join(docsPath, "static"))).toBe(false);

    expect(io.rmRF).toHaveBeenCalled();
    expect(io.cp).toHaveBeenCalled();
  });
});
