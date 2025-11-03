const path = require("path");
const {
  OWNER,
  IGNORED_REPOSITORIES,
  PROJECTS_PAGE_PATH,
  HOMEPAGE_PATH,
} = require("./constants");
const { CATEGORY_RULES } = require("./rules");
const {
  GitHubRepositoryService,
} = require("./services/github-repository-service");
const { RepositoryFilter } = require("./repository-filter");
const { RepositoryCategorizer } = require("./repository-categorizer");
const {
  HomepageProjectsUpdater,
} = require("./homepage/homepage-projects-updater");
const { ProjectsIndexUpdater } = require("./projects/projects-index-updater");

class DocumentationGenerator {
  constructor({ github }) {
    this.repositoryService = new GitHubRepositoryService(github);
    this.repositoryFilter = new RepositoryFilter({
      ignoredNames: IGNORED_REPOSITORIES,
    });
    this.repositoryCategorizer = new RepositoryCategorizer(CATEGORY_RULES);
    this.homepageUpdater = new HomepageProjectsUpdater({
      homepagePath: HOMEPAGE_PATH,
    });
    this.projectsIndexUpdater = new ProjectsIndexUpdater({
      projectsPagePath: PROJECTS_PAGE_PATH,
    });
  }

  async run() {
    console.log("🚀 Starting documentation generation...");

    const rawRepositories =
      await this.repositoryService.fetchOrganizationRepositories(OWNER);

    const showcaseRepositories = this.repositoryFilter.apply(rawRepositories);
    const categories =
      this.repositoryCategorizer.categorize(showcaseRepositories);
    const generatedAt = new Date();

    const pinnedRepositoryNames =
      await this.repositoryService.fetchOrganizationPinnedRepositories(OWNER);

    await this.homepageUpdater.update(rawRepositories, pinnedRepositoryNames);

    await this.writeProjectsAssets({
      categories,
      repositories: showcaseRepositories,
      generatedAt,
    });

    console.log("✅ Documentation generation completed!");
    this.logSummary(categories);
  }

  async writeProjectsAssets({ categories, repositories, generatedAt }) {
    await this.projectsIndexUpdater.update({
      categories,
      repositories,
      generatedAt,
    });

    const projectsRelative = path.relative(
      process.env.GITHUB_WORKSPACE,
      PROJECTS_PAGE_PATH,
    );
    const homepageRelative = path.relative(
      process.env.GITHUB_WORKSPACE,
      HOMEPAGE_PATH,
    );

    console.log("📄 Generated files:");
    console.log(`   - ${projectsRelative}`);
    console.log(`   - ${homepageRelative}`);
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
