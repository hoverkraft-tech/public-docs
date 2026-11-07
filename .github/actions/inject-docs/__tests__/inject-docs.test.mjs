import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import os from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  let workspace;
  beforeEach(() => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), "inject-docs-test-"));
  });
  afterEach(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("fails when prepared dir is missing", async () => {
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
        PREPARED_DIR: path.join(workspace, "does-not-exist"),
      },
    });

    expect(core.setFailed).toHaveBeenCalledWith(
      "Prepared documentation directory not found.",
    );
  });

  it("injects docs and moves static assets", async () => {
    const core = { setFailed: vi.fn(), info: vi.fn() };
    const io = createIo();

    const preparedDir = path.join(workspace, "prepared");
    const docsPath = path.join(
      workspace,
      "application/docs/projects/ci-cd-tools/demo",
    );
    const staticPath = path.join(workspace, "application/static/demo");

    for (const directory of [
      path.join(preparedDir, "static"),
      docsPath,
      staticPath,
    ]) {
      fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(path.join(preparedDir, "index.md"), "# Hello");
    fs.writeFileSync(path.join(preparedDir, "static/logo.png"), "binary");
    fs.writeFileSync(path.join(docsPath, "old.md"), "old");
    fs.writeFileSync(path.join(staticPath, "old.png"), "old");

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
