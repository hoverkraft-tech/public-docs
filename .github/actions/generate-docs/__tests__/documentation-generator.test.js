import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const previousOwner = process.env.GITHUB_REPOSITORY_OWNER;
const previousRepository = process.env.GITHUB_REPOSITORY;
const previousWorkspace = process.env.GITHUB_WORKSPACE;

const workspaceRoot = path.resolve(__dirname, "../../../..");
process.env.GITHUB_REPOSITORY_OWNER = "hoverkraft-tech";
process.env.GITHUB_REPOSITORY = "hoverkraft-tech/public-docs";
process.env.GITHUB_WORKSPACE = workspaceRoot;

const { DocumentationGenerator } = await import(
  "../lib/documentation-generator.js"
);
const { PROJECTS_MD_PATH, HOMEPAGE_PATH } = await import("../lib/constants.js");

afterAll(() => {
  process.env.GITHUB_REPOSITORY_OWNER = previousOwner;
  process.env.GITHUB_REPOSITORY = previousRepository;
  process.env.GITHUB_WORKSPACE = previousWorkspace;
});

describe("DocumentationGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("run", () => {
    let generator;
    let fetchRepositories;
    let fetchPinned;
    let filterRepositories;
    let categorizeRepositories;
    let homepageUpdate;

    const rawRepositories = [
      { name: "alpha", stargazers_count: 10 },
      { name: "beta", stargazers_count: 7 },
    ];

    const showcaseRepositories = [{ name: "alpha", stargazers_count: 10 }];

    const categorized = {
      "Core Services": [{ name: "alpha" }],
      Other: [],
    };

    beforeEach(() => {
      generator = new DocumentationGenerator({ github: {} });

      fetchRepositories = vi.fn().mockResolvedValue(rawRepositories);
      fetchPinned = vi.fn().mockResolvedValue(["alpha"]);
      generator.repositoryService = {
        fetchOrganizationRepositories: fetchRepositories,
        fetchOrganizationPinnedRepositories: fetchPinned,
      };

      filterRepositories = vi.fn().mockReturnValue(showcaseRepositories);
      generator.repositoryFilter = { apply: filterRepositories };

      categorizeRepositories = vi.fn().mockReturnValue(categorized);
      generator.repositoryCategorizer = {
        categorize: categorizeRepositories,
      };

      homepageUpdate = vi.fn().mockResolvedValue();
      generator.homepageUpdater = { update: homepageUpdate };
    });

    it("orchestrates repository generation end-to-end", async () => {
      const writeAssets = vi
        .spyOn(generator, "writeProjectsAssets")
        .mockResolvedValue();
      const logSummary = vi
        .spyOn(generator, "logSummary")
        .mockImplementation(() => {});
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

      await generator.run();

      expect(fetchRepositories).toHaveBeenCalledWith(
        process.env.GITHUB_REPOSITORY_OWNER,
      );
      expect(filterRepositories).toHaveBeenCalledWith(rawRepositories);
      expect(categorizeRepositories).toHaveBeenCalledWith(showcaseRepositories);

      expect(writeAssets).toHaveBeenCalledTimes(1);
      const callArgs = writeAssets.mock.calls[0][0];
      expect(callArgs.categories).toBe(categorized);
      expect(callArgs.repositories).toBe(showcaseRepositories);
      expect(callArgs.generatedAt).toBeInstanceOf(Date);

      expect(fetchPinned).toHaveBeenCalledWith(
        process.env.GITHUB_REPOSITORY_OWNER,
      );
      expect(homepageUpdate).toHaveBeenCalledWith(rawRepositories, ["alpha"]);

      expect(logSummary).toHaveBeenCalledWith(categorized);
      expect(consoleLog).toHaveBeenCalledWith(
        "🚀 Starting documentation generation...",
      );
      expect(consoleLog).toHaveBeenCalledWith(
        "✅ Documentation generation completed!",
      );
    });
  });

  describe("writeProjectsAssets", () => {
    it("writes generated markdown and logs relative paths", async () => {
      const generator = new DocumentationGenerator({ github: {} });
      const generatedAt = new Date("2025-01-01T00:00:00.000Z");
      const categories = { Other: [] };
      const repositories = [];

      const buildContent = vi
        .spyOn(generator.projectsContentBuilder, "build")
        .mockReturnValue("# Projects");
      const writeFile = vi.spyOn(fs.promises, "writeFile").mockResolvedValue();
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

      await generator.writeProjectsAssets({
        categories,
        repositories,
        generatedAt,
      });

      expect(buildContent).toHaveBeenCalledWith({
        categories,
        repositories,
        generatedAt,
      });
      expect(writeFile).toHaveBeenCalledWith(
        PROJECTS_MD_PATH,
        "# Projects",
        "utf8",
      );

      const projectsRelative = path.relative(
        process.env.GITHUB_WORKSPACE,
        PROJECTS_MD_PATH,
      );
      const homepageRelative = path.relative(
        process.env.GITHUB_WORKSPACE,
        HOMEPAGE_PATH,
      );

      expect(consoleLog).toHaveBeenNthCalledWith(1, "📄 Generated files:");
      expect(consoleLog).toHaveBeenNthCalledWith(2, `   - ${projectsRelative}`);
      expect(consoleLog).toHaveBeenNthCalledWith(3, `   - ${homepageRelative}`);
    });
  });
});
