import { describe, expect, it, vi } from "vitest";

process.env.GITHUB_REPOSITORY_OWNER ??= "hoverkraft-tech";
process.env.GITHUB_REPOSITORY ??= "hoverkraft-tech/public-docs";

const { ApplicationBiomeFormatter } = await import(
  "../lib/builders/application-biome-formatter.js"
);

describe("ApplicationBiomeFormatter", () => {
  it("runs biome check --write from the application root", async () => {
    const exec = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
    const formatter = new ApplicationBiomeFormatter({
      applicationRoot: "/repo/application",
      exec,
    });

    await formatter.format("/repo/application/src/pages/index.tsx");

    expect(exec).toHaveBeenCalledWith(
      "npm",
      [
        "--prefix",
        "/repo/application",
        "exec",
        "--",
        "biome",
        "check",
        "--write",
        "src/pages/index.tsx",
      ],
      {
        cwd: "/repo/application",
      },
    );
  });
});
