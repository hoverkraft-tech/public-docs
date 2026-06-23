import path from "node:path";
import { describe, expect, it, vi } from "vitest";

process.env.GITHUB_REPOSITORY_OWNER ??= "hoverkraft-tech";
process.env.GITHUB_REPOSITORY ??= "hoverkraft-tech/public-docs";

const { HomepageProjectsUpdater } = await import(
  "../lib/homepage/homepage-projects-updater.js"
);

describe("HomepageProjectsUpdater", () => {
  it("formats the homepage file after updating featured projects", async () => {
    const constDeclarationUpdater = {
      update: vi.fn().mockResolvedValue(true),
    };
    const formatter = {
      format: vi.fn().mockResolvedValue(undefined),
    };
    const homepagePath = path.join(
      process.cwd(),
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

    const updater = new HomepageProjectsUpdater({
      homepagePath,
      constDeclarationUpdater,
      formatter,
    });

    await updater.update(repositories);

    expect(constDeclarationUpdater.update).toHaveBeenCalledWith(homepagePath, [
      {
        name: "projects",
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
      },
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
    const homepagePath = path.join(
      process.cwd(),
      "application/src/pages/index.tsx",
    );
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
});
