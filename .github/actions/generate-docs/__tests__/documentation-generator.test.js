import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const previousOwner = process.env.GITHUB_REPOSITORY_OWNER;
const previousRepository = process.env.GITHUB_REPOSITORY;
const previousWorkspace = process.env.GITHUB_WORKSPACE;

const workspaceRoot = path.resolve(__dirname, "../../../..");
const projectsPagePath = path.join(
  workspaceRoot,
  "application/docs/projects/index.mdx",
);
const homepagePath = path.join(
  workspaceRoot,
  "application/src/pages/index.tsx",
);

process.env.GITHUB_REPOSITORY_OWNER = "hoverkraft-tech";
process.env.GITHUB_REPOSITORY = "hoverkraft-tech/public-docs";
process.env.GITHUB_WORKSPACE = workspaceRoot;

const { DocumentationGenerator } = await import(
  "../lib/documentation-generator.js"
);
const { PROJECTS_PAGE_PATH, HOMEPAGE_PATH } = await import(
  "../lib/constants.js"
);

beforeAll(() => {
  if (!fs.existsSync(projectsPagePath) || !fs.existsSync(homepagePath)) {
    throw new Error(
      "Required fixture files for projects or homepage were not found.",
    );
  }
});

afterAll(() => {
  process.env.GITHUB_REPOSITORY_OWNER = previousOwner;
  process.env.GITHUB_REPOSITORY = previousRepository;
  process.env.GITHUB_WORKSPACE = previousWorkspace;
});

describe("DocumentationGenerator", () => {
  let githubClient;
  let temporaryDirectory;
  let outputProjectsPath;
  let outputHomepagePath;

  beforeEach(() => {
    githubClient = createGithubClient();

    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "generate-docs-test-"),
    );
    outputProjectsPath = path.join(temporaryDirectory, "projects.mdx");
    outputHomepagePath = path.join(temporaryDirectory, "index.tsx");
    fs.copyFileSync(PROJECTS_PAGE_PATH, outputProjectsPath);
    fs.copyFileSync(HOMEPAGE_PATH, outputHomepagePath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  describe("run", () => {
    it("orchestrates repository generation end-to-end without service stubs", async () => {
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

      const generator = new DocumentationGenerator({
        github: githubClient,
        projectsPagePath: outputProjectsPath,
        homepagePath: outputHomepagePath,
      });

      await generator.run();

      expect(consoleLog).toHaveBeenCalledWith(
        "🚀 Starting documentation generation...",
      );
      expect(consoleLog).toHaveBeenCalledWith(
        "✅ Documentation generation completed!",
      );

      const projectsOutput = fs.readFileSync(outputProjectsPath, "utf8");
      const homepageOutput = fs.readFileSync(outputHomepagePath, "utf8");

      expect(projectsOutput).toContain("const projectSections");
      expect(homepageOutput).toContain("const projects = [");
    });
  });

  describe("writeProjectsAssets", () => {
    it("updates projects page and logs relative paths without stubbing services", async () => {
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

      const generator = new DocumentationGenerator({
        github: githubClient,
        projectsPagePath: outputProjectsPath,
        homepagePath: outputHomepagePath,
      });

      const categories = {
        "Core Services": [
          {
            name: "alpha",
            html_url: "https://github.com/hoverkraft-tech/alpha",
            language: "TypeScript",
            stargazers_count: 10,
            updated_at: "2025-01-01T00:00:00.000Z",
            description: "Alpha project",
            topics: ["github-actions"],
          },
        ],
      };

      const repositories = Object.values(categories).flat();

      const generatedAt = new Date("2025-01-02T00:00:00.000Z");

      await generator.writeProjectsAssets({
        categories,
        repositories,
        generatedAt,
      });

      const projectsOutput = fs.readFileSync(outputProjectsPath, "utf8");
      expect(projectsOutput).toContain("Alpha project");
      expect(projectsOutput).toContain("const statsSummary");

      const projectsRelative = path.relative(
        process.env.GITHUB_WORKSPACE,
        outputProjectsPath,
      );
      const homepageRelative = path.relative(
        process.env.GITHUB_WORKSPACE,
        outputHomepagePath,
      );

      expect(consoleLog).toHaveBeenNthCalledWith(1, "📄 Generated files:");
      expect(consoleLog).toHaveBeenNthCalledWith(2, `   - ${projectsRelative}`);
      expect(consoleLog).toHaveBeenNthCalledWith(3, `   - ${homepageRelative}`);
    });
  });
});

function createGithubClient() {
  return {
    rest: {
      repos: {
        listForOrg: vi.fn().mockResolvedValue({
          data: [
            {
              name: "alpha",
              stargazers_count: 10,
              language: "TypeScript",
              updated_at: "2025-01-01T00:00:00.000Z",
              html_url: "https://github.com/hoverkraft-tech/alpha",
              description: "Alpha project",
              topics: ["github-actions"],
            },
          ],
        }),
      },
    },
    paginate: vi.fn(async (method, params) => {
      const response = await method(params);
      return response.data;
    }),
    graphql: vi.fn(async () => ({
      organization: {
        pinnedItems: {
          nodes: [
            {
              name: "alpha",
            },
          ],
        },
      },
    })),
  };
}
