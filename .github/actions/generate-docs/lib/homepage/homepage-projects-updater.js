const {
  FEATURED_REPOSITORY_LIMIT,
  HOMEPAGE_CARD_LIMIT,
} = require("../constants");
const { resolveIcon } = require("../builders/resolve-icon");
const {
  ConstDeclarationUpdater,
} = require("../builders/const-declaration-updater");
const {
  ApplicationBiomeFormatter,
} = require("../builders/application-biome-formatter");

class HomepageProjectsUpdater {
  constructor({ homepagePath, constDeclarationUpdater, formatter }) {
    this.homepagePath = homepagePath;
    this.constDeclarationUpdater =
      constDeclarationUpdater ?? new ConstDeclarationUpdater();
    this.formatter = formatter ?? new ApplicationBiomeFormatter();
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
    const hasChanges = await this.constDeclarationUpdater.update(
      this.homepagePath,
      [
        {
          name: "projects",
          value: projectsModel,
          serialize: serializeHomepageProjects,
        },
      ],
    );

    if (hasChanges) {
      await this.formatter.format(this.homepagePath);
    }
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

function serializeHomepageProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return "[]";
  }

  const body = projects
    .map((project) => serializeHomepageProject(project, 1))
    .join(",\n");

  return `\n${body}\n`;
}

function serializeHomepageProject(project, indentLevel) {
  const indent = "  ".repeat(indentLevel);
  const propertyIndent = "  ".repeat(indentLevel + 1);

  return [
    `${indent}{`,
    `${propertyIndent}name: ${serializeHomepageString(project.name)},`,
    `${propertyIndent}icon: ${serializeHomepageString(project.icon)},`,
    `${propertyIndent}url: ${serializeHomepageString(project.url)},`,
    `${propertyIndent}stars: ${String(project.stars ?? 0)},`,
    `${propertyIndent}language: ${serializeHomepageString(project.language)},`,
    serializeHomepageDescription(project.description, propertyIndent),
    `${propertyIndent}tags: ${serializeHomepageInlineStringArray(project.tags)},`,
    `${propertyIndent}accent: ${serializeHomepageString(project.accent)},`,
    `${indent}}`,
  ].join("\n");
}

function serializeHomepageDescription(description, indent) {
  const normalizedDescription = description ?? "";
  const serialized = serializeHomepageString(normalizedDescription);
  const singleLine = `${indent}description: ${serialized},`;

  if (singleLine.length <= 80) {
    return singleLine;
  }

  return `${indent}description:\n${indent}  ${serialized},`;
}

function serializeHomepageInlineStringArray(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "[]";
  }

  return `[${values.map((value) => serializeHomepageString(value)).join(", ")}]`;
}

function serializeHomepageString(value) {
  return `"${escapeHomepageString(String(value ?? ""))}"`;
}

function escapeHomepageString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/"/g, '\\"');
}

module.exports = {
  HomepageProjectsUpdater,
};
