const path = require("path");
const fs = require("fs").promises;
const {
  OWNER,
  IGNORED_REPOSITORIES,
  PROJECTS_MD_PATH,
  HOMEPAGE_PATH,
} = require("./constants");
const { CATEGORY_RULES } = require("./rules");
const {
  GitHubRepositoryService,
} = require("./services/github-repository-service");
const { RepositoryFilter } = require("./repository-filter");
const { RepositoryCategorizer } = require("./repository-categorizer");
const {
  ProjectsContentBuilder,
} = require("./builders/projects-content-builder");
const {
  HomepageProjectsUpdater,
} = require("./homepage/homepage-projects-updater");

class DocumentationGenerator {
  constructor({ github }) {
    this.repositoryService = new GitHubRepositoryService(github);
    this.repositoryFilter = new RepositoryFilter({
      ignoredNames: IGNORED_REPOSITORIES,
    });
    this.repositoryCategorizer = new RepositoryCategorizer(CATEGORY_RULES);
    this.projectsContentBuilder = new ProjectsContentBuilder();
    this.homepageUpdater = new HomepageProjectsUpdater();
  }

  async run() {
    console.log("🚀 Starting documentation generation...");

    const rawRepositories =
      await this.repositoryService.fetchOrganizationRepositories(OWNER);

    const showcaseRepositories = this.repositoryFilter.apply(rawRepositories);
    const categories =
      this.repositoryCategorizer.categorize(showcaseRepositories);

    await this.writeProjectsAssets({
      categories,
      repositories: showcaseRepositories,
      generatedAt: new Date(),
    });

    const pinnedRepositoryNames =
      await this.repositoryService.fetchOrganizationPinnedRepositories(OWNER);

    await this.homepageUpdater.update(rawRepositories, pinnedRepositoryNames);

    console.log("✅ Documentation generation completed!");
    this.logSummary(categories);
  }

  async writeProjectsAssets({ categories, repositories, generatedAt }) {
    const markdown = this.projectsContentBuilder.build({
      categories,
      repositories,
      generatedAt,
    });

    await fs.writeFile(PROJECTS_MD_PATH, markdown, "utf8");

    console.log("📄 Generated files:");
    console.log(
      `   - ${path.relative(process.env.GITHUB_WORKSPACE, PROJECTS_MD_PATH)}`,
    );
    console.log(
      `   - ${path.relative(process.env.GITHUB_WORKSPACE, HOMEPAGE_PATH)}`,
    );
  }

  logSummary(categories) {
    console.log("\n📊 Repository Summary:");

    Object.entries(categories).forEach(([category, repositories]) => {
      if (repositories.length > 0) {
        console.log(`   ${category}: ${repositories.length} projects`);
      }
    });
  }
}

module.exports = {
  DocumentationGenerator,
};
