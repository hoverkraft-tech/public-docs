import path from "node:path";
import fs from "node:fs";
import mockFs from "mock-fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../..");

process.env.GITHUB_REPOSITORY_OWNER ??= "hoverkraft-tech";
process.env.GITHUB_REPOSITORY ??= "hoverkraft-tech/public-docs";

const { HomepageProjectsUpdater } = await import(
  "../lib/homepage/homepage-projects-updater.js"
);
const { ConstDeclarationUpdater } = await import(
  "../lib/builders/const-declaration-updater.js"
);

const homepagePath = path.join(
  workspaceRoot,
  "application/src/pages/index.tsx",
);
const repositories = [
  {
    name: "compose-action",
    html_url: "https://github.com/hoverkraft-tech/compose-action",
    stargazers_count: 210,
    language: "TypeScript",
    description:
      "This action runs your docker-compose file and clean up before action finished",
    topics: ["continuous-integration", "docker-compose", "github-actions"],
  },
];

describe("HomepageProjectsUpdater", () => {
  it("formats the homepage file after updating featured projects", async () => {
    const constDeclarationUpdater = {
      update: vi.fn().mockResolvedValue(true),
    };
    const formatter = {
      format: vi.fn().mockResolvedValue(undefined),
    };
    const updater = new HomepageProjectsUpdater({
      homepagePath,
      constDeclarationUpdater,
      formatter,
    });

    await updater.update(repositories);

    expect(constDeclarationUpdater.update).toHaveBeenCalledWith(homepagePath, [
      expect.objectContaining({
        name: "projects",
        serialize: expect.any(Function),
        value: [
          {
            accent: "primary",
            description:
              "This action runs your docker-compose file and clean up before action finished",
            icon: "⚡",
            language: "TypeScript",
            name: "compose-action",
            stars: 210,
            tags: [
              "continuous-integration",
              "docker-compose",
              "github-actions",
            ],
            url: "https://github.com/hoverkraft-tech/compose-action",
          },
        ],
      }),
    ]);
    expect(formatter.format).toHaveBeenCalledWith(homepagePath);
  });

  it("skips formatting when the homepage file is unchanged", async () => {
    const constDeclarationUpdater = {
      update: vi.fn().mockResolvedValue(false),
    };
    const formatter = {
      format: vi.fn().mockResolvedValue(undefined),
    };
    const updater = new HomepageProjectsUpdater({
      homepagePath,
      constDeclarationUpdater,
      formatter,
    });

    await updater.update([
      {
        name: "compose-action",
        html_url: "https://github.com/hoverkraft-tech/compose-action",
        stargazers_count: 210,
        language: "TypeScript",
        description:
          "This action runs your docker-compose file and clean up before action finished",
        topics: ["continuous-integration", "docker-compose", "github-actions"],
      },
    ]);

    expect(formatter.format).not.toHaveBeenCalled();
  });

  it("writes homepage projects using lint-compatible TSX style", async () => {
    const homepageContent = fs.readFileSync(homepagePath, "utf8");

    mockFs({
      [homepagePath]: homepageContent,
    });

    try {
      const formatter = {
        format: vi.fn().mockResolvedValue(undefined),
      };
      const updater = new HomepageProjectsUpdater({
        homepagePath,
        constDeclarationUpdater: new ConstDeclarationUpdater(),
        formatter,
      });

      await updater.update(repositories);

      const updatedHomepage = fs.readFileSync(homepagePath, "utf8");

      expect(updatedHomepage).toContain('name: "compose-action"');
      expect(updatedHomepage).toContain("const projects = [");
      expect(updatedHomepage).toContain(
        'tags: ["continuous-integration", "docker-compose", "github-actions"]',
      );
      expect(updatedHomepage).toContain('accent: "primary",\n    },\n  ];');
      expect(updatedHomepage).not.toContain("name: 'compose-action'");
      expect(updatedHomepage).not.toContain("'continuous-integration'");
    } finally {
      mockFs.restore();
    }
  });
});
