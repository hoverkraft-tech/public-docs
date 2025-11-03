const { resolveIcon } = require("../builders/resolve-icon");

class ProjectsContentBuilder {
  build({ categories, repositories, generatedAt }) {
    const stats = this.buildStats(repositories);
    const projectSections = this.buildProjectSections(categories);

    return {
      projectSections,
      statsSummary: this.buildStatsSummary(stats),
      projectSnapshot: this.buildProjectSnapshot(stats, generatedAt),
    };
  }

  buildStats(repositories) {
    const activeProjects = repositories.length;
    const totalStars = repositories.reduce(
      (sum, repository) => sum + (repository.stargazers_count || 0),
      0,
    );

    const languages = Array.from(
      new Set(
        repositories
          .map((repository) => repository.language)
          .filter(Boolean)
          .map((language) => language.trim()),
      ),
    ).filter(Boolean);

    return {
      activeProjects,
      totalStars,
      languages,
    };
  }

  buildStatsSummary({ activeProjects, totalStars, languages }) {
    return {
      activeProjects,
      totalStars,
      programmingLanguages: languages.length,
      openSourcePercentage: 100,
    };
  }

  buildProjectSnapshot(stats, generatedAt) {
    const technologiesSummary = this.composeTechnologiesSummary(
      stats.languages,
    );

    return {
      lastUpdated: generatedAt.toISOString().split("T")[0],
      technologiesSummary,
    };
  }

  buildProjectSections(categories) {
    return Object.entries(categories)
      .filter(([, repositories]) => repositories.length > 0)
      .map(([title, repositories]) => ({
        title,
        projects: repositories.map((repository) =>
          this.buildRepositoryModel(repository),
        ),
      }));
  }

  buildRepositoryModel(repository) {
    const language = repository.language || "Unknown";
    const stars = repository.stargazers_count || 0;
    const lastUpdated = this.formatDate(repository.updated_at);

    return {
      icon: resolveIcon(repository),
      title: repository.name,
      titleHref: repository.html_url,
      meta: `${language} • ⭐ ${stars} • Updated ${lastUpdated}`,
      description: repository.description || "No description available.",
      tags: (repository.topics || []).slice(0, 5),
      actions: this.buildActions(repository),
    };
  }

  buildActions(repository) {
    const actions = [{ label: "View on GitHub", href: repository.html_url }];

    if (repository.homepage) {
      actions.push({ label: "Documentation", href: repository.homepage });
    }

    return actions;
  }

  composeTechnologiesSummary(languages) {
    if (languages.length === 0) {
      return "including various stacks.";
    }

    const primary = languages.slice(0, 5);
    const hasMore = languages.length > primary.length;
    const formattedList = hasMore
      ? primary.join(", ")
      : formatLanguageList(primary);
    const suffix = hasMore ? ", and more." : ".";

    return `including ${formattedList}${suffix}`;
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

function formatLanguageList(languages) {
  if (languages.length <= 1) {
    return languages.join("");
  }

  if (languages.length === 2) {
    return `${languages[0]} and ${languages[1]}`;
  }

  const head = languages.slice(0, -1);
  const tail = languages[languages.length - 1];
  return `${head.join(", ")}, and ${tail}`;
}

module.exports = {
  ProjectsContentBuilder,
};
