const {
  FEATURED_REPOSITORY_LIMIT,
  HOMEPAGE_CARD_LIMIT,
} = require("../constants");
const { resolveIcon } = require("../builders/resolve-icon");
const {
  ConstDeclarationUpdater,
} = require("../builders/const-declaration-updater");

class HomepageProjectsUpdater {
  constructor({ homepagePath }) {
    this.homepagePath = homepagePath;
    this.constDeclarationUpdater = new ConstDeclarationUpdater();
  }

  async update(repositories, pinnedRepositoryNames = []) {
    const featured = this.pickFeaturedRepositories(
      repositories,
      pinnedRepositoryNames,
    );

    if (featured.length === 0) {
      throw new Error("No repositories available to feature on the homepage");
    }

    const projectsModel = this.buildProjectsModel(featured);
    await this.constDeclarationUpdater.update(this.homepagePath, [
      { name: "projects", value: projectsModel },
    ]);
  }

  pickFeaturedRepositories(repositories, pinnedRepositoryNames) {
    if (!Array.isArray(repositories) || !Array.isArray(pinnedRepositoryNames)) {
      throw new Error(
        "Both repositories and pinnedRepositoryNames must be arrays",
      );
    }

    const pinnedRepositories = pinnedRepositoryNames
      .map((name) => repositories.find((repo) => repo.name === name))
      .filter(Boolean);

    if (pinnedRepositories.length > 0) {
      return pinnedRepositories.slice(0, FEATURED_REPOSITORY_LIMIT);
    }

    return repositories
      .filter((repository) => typeof repository?.stargazers_count === "number")
      .sort(
        (left, right) =>
          (right.stargazers_count || 0) - (left.stargazers_count || 0),
      )
      .slice(0, FEATURED_REPOSITORY_LIMIT);
  }

  buildProjectsModel(repositories) {
    return repositories
      .slice(0, HOMEPAGE_CARD_LIMIT)
      .map((repository, index) => ({
        name: repository.name,
        icon: resolveIcon(repository),
        url: repository.html_url,
        stars: repository.stargazers_count || 0,
        language: repository.language || "Mixed",
        description: repository.description || "",
        tags: (repository.topics || []).slice(0, 3),
        accent: index % 2 === 0 ? "primary" : "neutral",
      }));
  }
}

module.exports = {
  HomepageProjectsUpdater,
};
