const fsp = require("fs").promises;
const {
  HOMEPAGE_PATH,
  FEATURED_REPOSITORY_LIMIT,
  HOMEPAGE_CARD_LIMIT,
} = require("../constants");
const { resolveIcon } = require("../builders/resolve-icon");

class HomepageProjectsUpdater {
  constructor(homepagePath = HOMEPAGE_PATH) {
    this.homepagePath = homepagePath;
  }

  async update(repositories, pinnedRepositoryNames = []) {
    const featured = this.pickFeaturedRepositories(
      repositories,
      pinnedRepositoryNames,
    );

    if (featured.length === 0) {
      throw new Error("No repositories available to feature on the homepage");
    }

    const projectSection = this.buildHomepageSection(featured);
    await this.replaceProjectsArray(projectSection);
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

  buildHomepageSection(repositories) {
    const cardsModel = repositories
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

    const projectEntries = cardsModel.map((project, index) =>
      this.formatProject(project, index === cardsModel.length - 1),
    );

    const joinedEntries = projectEntries.join("\n");

    return `const projects = [
${joinedEntries}
];
`;
  }

  formatProject(project, isLastEntry) {
    const indentOuter = "  ";
    const indentInner = "    ";
    const tags = Array.isArray(project.tags) ? project.tags : [];
    const tagsLiteral = tags
      .map((tag) => `'${escapeJsString(tag)}'`)
      .join(", ");

    const lines = [
      `${indentOuter}{`,
      `${indentInner}icon: '${escapeJsString(project.icon)}',`,
      `${indentInner}name: '${escapeJsString(project.name)}',`,
      `${indentInner}url: '${escapeJsString(project.url)}',`,
      `${indentInner}stars: ${project.stars},`,
      `${indentInner}language: '${escapeJsString(project.language)}',`,
      `${indentInner}description: '${escapeJsString(project.description)}',`,
      `${indentInner}tags: [${tagsLiteral}],`,
      `${indentInner}accent: '${escapeJsString(project.accent)}',`,
      `${indentOuter}}${isLastEntry ? "" : ","}`,
    ];

    return lines.join("\n");
  }

  async replaceProjectsArray(projectSection) {
    const content = await fsp.readFile(this.homepagePath, "utf8");
    const marker = "const projects = [";
    const markerIndex = content.indexOf(marker);

    if (markerIndex === -1) {
      throw new Error(
        "Could not locate the projects array declaration in the homepage.",
      );
    }

    const arrayStart = content.indexOf("[", markerIndex);

    if (arrayStart === -1) {
      throw new Error("Projects array declaration is malformed (missing '[').");
    }

    const arrayEnd = findClosingBracketIndex(content, arrayStart);

    if (arrayEnd === -1) {
      throw new Error("Could not determine the end of the projects array.");
    }

    let sliceEnd = arrayEnd + 1;

    while (sliceEnd < content.length && /\s/.test(content[sliceEnd])) {
      sliceEnd += 1;
    }

    if (content[sliceEnd] === ";") {
      sliceEnd += 1;
    }

    const updatedContent = `${content.slice(
      0,
      markerIndex,
    )}${projectSection}${content.slice(sliceEnd)}`;

    await fsp.writeFile(this.homepagePath, updatedContent, "utf8");
  }
}

function escapeJsString(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, " ");
}

function findClosingBracketIndex(source, startIndex) {
  let depth = 0;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

module.exports = {
  HomepageProjectsUpdater,
};
