const ejs = require("ejs");
const fs = require("fs");
const { resolveIcon } = require("./resolve-icon");
const { PROJECTS_MD_TEMPLATE } = require("../constants");

class ProjectsContentBuilder {
  constructor({ templatePath } = {}) {
    this.templatePath = templatePath || PROJECTS_MD_TEMPLATE;
    this.template = fs.readFileSync(this.templatePath, "utf8");
  }

  build({ categories, repositories, generatedAt }) {
    const stats = this.buildStats(repositories, generatedAt);
    const categoryModels = this.buildCategoryModels(categories);

    return ejs.render(
      this.template,
      {
        stats,
        categories: categoryModels,
      },
      { filename: this.templatePath }
    );
  }

  buildStats(repositories, generatedAt) {
    const totalRepos = repositories.length;
    const totalStars = repositories.reduce(
      (sum, repository) => sum + (repository.stargazers_count || 0),
      0
    );
    const languages = [
      ...new Set(
        repositories.map((repository) => repository.language).filter(Boolean)
      ),
    ];
    const primaryLanguages = languages.slice(0, 5);

    return {
      totalRepos,
      totalStars,
      languageCount: languages.length,
      languagesSummary:
        primaryLanguages.length > 0
          ? primaryLanguages.join(", ")
          : "various stacks",
      generatedDate: generatedAt.toISOString().split("T")[0],
    };
  }

  buildCategoryModels(categories) {
    return Object.entries(categories)
      .filter(([, repositories]) => repositories.length > 0)
      .map(([name, repositories]) => ({
        name,
        repositories: repositories.map((repository) =>
          this.buildRepositoryModel(repository)
        ),
      }));
  }

  buildRepositoryModel(repository) {
    return {
      name: repository.name,
      htmlUrl: repository.html_url,
      icon: resolveIcon(repository),
      language: repository.language || "Unknown",
      stars: repository.stargazers_count || 0,
      lastUpdated: this.formatDate(repository.updated_at),
      description: repository.description || "No description available.",
      topics: (repository.topics || []).slice(0, 5),
      homepage: repository.homepage,
    };
  }

  formatDate(dateString) {
    if (!dateString) {
      return "Unknown";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

module.exports = {
  ProjectsContentBuilder,
};
