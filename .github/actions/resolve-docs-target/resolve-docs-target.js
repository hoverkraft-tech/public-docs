const { RepositoryCategorizer } = require("./lib/repository-categorizer");

function sanitizeSegment(segment) {
  return String(segment ?? "")
    .replace(/^[.\s]+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function parseRepositorySlug(repository) {
  const [owner, repo] = String(repository ?? "").split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid repository slug: ${repository}`);
  }

  return { owner, repo };
}

async function fetchRepositoryProfile({ github, owner, repo }) {
  const repositoryResponse = await github.rest.repos.get({ owner, repo });
  const repositoryMetadata = repositoryResponse.data;

  const topicsResponse = await github.rest.repos.getAllTopics({ owner, repo });
  const topics = topicsResponse?.data?.names ?? [];

  return {
    description: repositoryMetadata?.description ?? "",
    topics,
  };
}

function resolveCategory({ repositoryName, description, topics }) {
  try {
    const categorizer = new RepositoryCategorizer();
    return categorizer.resolveCategory({
      name: repositoryName,
      description,
      topics,
    }).name;
  } catch {
    return "Other";
  }
}

async function run({ github, core, repository }) {
  if (!github) {
    throw new Error("Missing github client");
  }

  const { owner, repo } = parseRepositorySlug(repository);

  const sanitizedRepoName = sanitizeSegment(repo);
  if (!sanitizedRepoName) {
    throw new Error(
      `Unable to sanitize repository ${repo} name for documentation path.`,
    );
  }

  const { description, topics } = await fetchRepositoryProfile({
    github,
    owner,
    repo,
  });

  const categoryName = resolveCategory({
    repositoryName: repo,
    description,
    topics,
  });

  const categorySlug = sanitizeSegment(categoryName) || "other";

  const docsPath = `application/docs/projects/${categorySlug}/${sanitizedRepoName}`;
  const staticPath = `application/static/${sanitizedRepoName}`;

  if (core?.debug) {
    core.debug(`Resolved category: ${categoryName} (${categorySlug})`);
    core.debug(`Docs path: ${docsPath}`);
    core.debug(`Static path: ${staticPath}`);
  }

  return {
    owner,
    repo,
    sanitizedRepoName,
    categoryName,
    categorySlug,
    docsPath,
    staticPath,
  };
}

module.exports = {
  run,
  sanitizeSegment,
  parseRepositorySlug,
  resolveCategory,
};
