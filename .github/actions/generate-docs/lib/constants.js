const path = require("path");

const ACTION_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(ACTION_ROOT, "..", "..", "..");
const APPLICATION_ROOT = path.join(REPO_ROOT, "application");
const DOCS_DIR = path.join(APPLICATION_ROOT, "docs");
const PROJECTS_MD_PATH = path.join(DOCS_DIR, "projects.md");
const HOMEPAGE_PATH = path.join(APPLICATION_ROOT, "src", "pages", "index.tsx");
const TEMPLATE_DIR = path.join(__dirname, "templates");
const PROJECTS_MD_TEMPLATE = path.join(TEMPLATE_DIR, "projects.md.ejs");
const FEATURED_REPOSITORY_LIMIT = 6;
const HOMEPAGE_CARD_LIMIT = 3;

const OWNER = process.env.GITHUB_REPOSITORY_OWNER;

if (!OWNER) {
  throw new Error(
    "GITHUB_REPOSITORY_OWNER environment variable must be set for documentation generation."
  );
}

const REPOSITORY_SLUG = process.env.GITHUB_REPOSITORY;

if (!REPOSITORY_SLUG) {
  throw new Error(
    "GITHUB_REPOSITORY environment variable must be set for documentation generation."
  );
}

const [, REPOSITORY_NAME] = REPOSITORY_SLUG.split("/");

if (!REPOSITORY_NAME) {
  throw new Error(
    `Unable to determine repository name from GITHUB_REPOSITORY='${REPOSITORY_SLUG}'.`
  );
}

const IGNORED_REPOSITORIES = new Set([REPOSITORY_NAME]);

module.exports = {
  OWNER,
  DOCS_DIR,
  PROJECTS_MD_PATH,
  HOMEPAGE_PATH,
  PROJECTS_MD_TEMPLATE,
  IGNORED_REPOSITORIES,
  FEATURED_REPOSITORY_LIMIT,
  HOMEPAGE_CARD_LIMIT,
};
