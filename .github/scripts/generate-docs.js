#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = "hoverkraft-tech";

async function fetchRepositories() {
  try {
    console.log("🔍 Fetching repositories...");
    const { data: repos } = await octokit.rest.repos.listForOrg({
      org: OWNER,
      type: "public",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    });

    console.log(`📦 Found ${repos.length} repositories`);
    return repos;
  } catch (error) {
    console.error("❌ Error fetching repositories:", error);
    throw error;
  }
}

function categorizeRepositories(repos) {
  const categories = {
    "GitHub Actions": [],
    "CI/CD Tools": [],
    "Infrastructure & DevOps": [],
    "Container & Kubernetes": [],
    "Development Tools": [],
    "Documentation & Themes": [],
    "Libraries & Frameworks": [],
    Other: [],
  };

  repos.forEach((repo) => {
    const topics = repo.topics || [];
    const name = repo.name.toLowerCase();
    const description = (repo.description || "").toLowerCase();

    if (
      topics.includes("github-actions") ||
      name.includes("ci-github") ||
      name.includes("action")
    ) {
      categories["GitHub Actions"].push(repo);
    } else if (
      topics.includes("continuous-integration") ||
      topics.includes("continuous-delivery") ||
      name.includes("compose-action")
    ) {
      categories["CI/CD Tools"].push(repo);
    } else if (
      topics.includes("terraform") ||
      topics.includes("aws") ||
      topics.includes("infrastructure") ||
      name.includes("terraform") ||
      name.includes("infrastructure")
    ) {
      categories["Infrastructure & DevOps"].push(repo);
    } else if (
      topics.includes("docker") ||
      topics.includes("kubernetes") ||
      topics.includes("helm") ||
      topics.includes("chart") ||
      name.includes("helm") ||
      name.includes("docker")
    ) {
      categories["Container & Kubernetes"].push(repo);
    } else if (
      topics.includes("open-source") &&
      (name.includes("base") ||
        name.includes("starters") ||
        name.includes("template") ||
        description.includes("tool"))
    ) {
      categories["Development Tools"].push(repo);
    } else if (
      topics.includes("documentation") ||
      topics.includes("docusaurus") ||
      topics.includes("jekyll") ||
      name.includes("docs") ||
      name.includes("theme")
    ) {
      categories["Documentation & Themes"].push(repo);
    } else if (
      topics.includes("library") ||
      topics.includes("framework") ||
      description.includes("library") ||
      description.includes("framework")
    ) {
      categories["Libraries & Frameworks"].push(repo);
    } else {
      categories["Other"].push(repo);
    }
  });

  return categories;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generateProjectCard(repo) {
  const topics = repo.topics || [];
  const topicsHtml = topics
    .slice(0, 5)
    .map((topic) => `<span className={styles.projectTag}>${topic}</span>`)
    .join("\n            ");

  const stars = repo.stargazers_count;
  const language = repo.language || "Unknown";
  const lastUpdated = formatDate(repo.updated_at);

  return `        <div className={styles.projectCard}>
          <div className={styles.projectHeader}>
            <div className={styles.projectIcon}>
              ${getProjectIcon(repo)}
            </div>
            <div>
              <h3 className={styles.projectTitle}>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                  ${repo.name}
                </a>
              </h3>
              <p className={styles.projectMeta}>
                ${language} • ⭐ ${stars} • Updated ${lastUpdated}
              </p>
            </div>
          </div>
          <p className={styles.projectDescription}>
            ${repo.description || "No description available."}
          </p>
          <div className={styles.projectFooter}>
            ${topicsHtml}
          </div>
          <div className={styles.projectLinks}>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
              View on GitHub
            </a>
            ${
              repo.homepage
                ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
              Live Demo
            </a>`
                : ""
            }
          </div>
        </div>`;
}

function getProjectIcon(repo) {
  const topics = repo.topics || [];
  const name = repo.name.toLowerCase();

  if (topics.includes("github-actions") || name.includes("action")) {
    return "⚡";
  } else if (topics.includes("helm") || topics.includes("kubernetes")) {
    return "☸️";
  } else if (topics.includes("docker") || name.includes("docker")) {
    return "🐳";
  } else if (topics.includes("terraform") || name.includes("terraform")) {
    return "🏗️";
  } else if (topics.includes("documentation") || name.includes("docs")) {
    return "📚";
  } else if (name.includes("theme")) {
    return "🎨";
  } else if (topics.includes("email") || name.includes("mail")) {
    return "📧";
  } else if (topics.includes("backup") || name.includes("snapshot")) {
    return "💾";
  } else if (topics.includes("authentication") || name.includes("auth")) {
    return "🔐";
  } else {
    return "🔧";
  }
}

function generateCategorySection(categoryName, repos) {
  if (repos.length === 0) return "";

  const projectCards = repos.map(generateProjectCard).join("\n\n");

  return `## ${categoryName}

<div className={styles.projectsGrid}>
${projectCards}
</div>

`;
}

async function generateProjectsPage(categories) {
  const allRepos = Object.values(categories).flat();
  const totalRepos = allRepos.length;
  const totalStars = allRepos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0,
  );
  const languages = [
    ...new Set(allRepos.map((repo) => repo.language).filter(Boolean)),
  ];

  const categorySections = Object.entries(categories)
    .filter(([_, repos]) => repos.length > 0)
    .map(([categoryName, repos]) =>
      generateCategorySection(categoryName, repos),
    )
    .join("\n");

  const content = `---
sidebar_position: 2
---

# Projects

import styles from './projects.module.css';

Welcome to the Hoverkraft project ecosystem! We maintain **${totalRepos} open-source projects** with a combined **${totalStars} stars** across multiple technologies including ${languages.slice(0, 5).join(", ")}, and more.

## 📊 Quick Stats

- **${totalRepos}** Active Projects
- **${totalStars}** GitHub Stars
- **${languages.length}** Programming Languages
- **100%** Open Source

${categorySections}

---

*This page is automatically generated from our GitHub repositories. Last updated: ${new Date().toISOString().split("T")[0]}*
`;

  return content;
}

async function generateProjectsCSS() {
  const css = `/* Projects page styles */
.projectsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.projectCard {
  background: var(--ifm-card-background-color);
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  height: fit-content;
}

.projectCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--ifm-color-primary);
}

.projectHeader {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.projectIcon {
  font-size: 2rem;
  flex-shrink: 0;
}

.projectTitle {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.projectTitle a {
  text-decoration: none;
  color: var(--ifm-color-primary);
}

.projectTitle a:hover {
  text-decoration: underline;
}

.projectMeta {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ifm-color-emphasis-600);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.projectDescription {
  color: var(--ifm-color-emphasis-700);
  line-height: 1.6;
  margin-bottom: 1rem;
  flex: 1;
}

.projectFooter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.projectTag {
  background: var(--ifm-color-emphasis-100);
  color: var(--ifm-color-emphasis-600);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.projectLinks {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.projectLink {
  background: var(--ifm-color-primary);
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none !important;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.projectLink:hover {
  background: var(--ifm-color-primary-dark);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .projectsGrid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .projectCard {
    padding: 1rem;
  }
  
  .projectLinks {
    flex-direction: column;
    gap: 0.5rem;
  }
}
`;

  return css;
}

async function updateHomepageProjects(repos) {
  const featuredRepos = repos
    .filter(
      (repo) =>
        repo.stargazers_count > 0 ||
        repo.name === "compose-action" ||
        repo.name === "ci-github-container" ||
        repo.name === "public-docs",
    )
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  const projectCards = featuredRepos
    .slice(0, 3)
    .map((repo) => {
      return `          <div className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <div className={styles.projectIcon}>${getProjectIcon(repo)}</div>
              <div>
                <h3 className={styles.projectTitle}>${repo.name}</h3>
                <p className={styles.projectMeta}>⭐ ${repo.stargazers_count} • ${repo.language || "Mixed"}</p>
              </div>
            </div>
            <p className={styles.projectDescription}>
              ${repo.description || "A powerful open-source project from Hoverkraft."}
            </p>
            <div className={styles.projectFooter}>
              ${(repo.topics || [])
                .slice(0, 3)
                .map(
                  (topic) =>
                    `<span className={styles.projectTag}>${topic}</span>`,
                )
                .join("\n              ")}
            </div>
          </div>`;
    })
    .join("\n\n");

  // Read the current homepage
  const homepagePath = path.join(__dirname, "..", "src", "pages", "index.tsx");
  let homepageContent = await fs.readFile(homepagePath, "utf8");

  // Replace the projects section
  const projectsStart = homepageContent.indexOf(
    "<div className={styles.projectsGrid}>",
  );
  const projectsEnd = homepageContent.indexOf("</div>", projectsStart) + 6;

  if (projectsStart !== -1 && projectsEnd !== -1) {
    const newProjectsSection = `<div className={styles.projectsGrid}>
${projectCards}
        </div>`;

    homepageContent =
      homepageContent.substring(0, projectsStart) +
      newProjectsSection +
      homepageContent.substring(projectsEnd);
    await fs.writeFile(homepagePath, homepageContent, "utf8");
    console.log("✅ Updated homepage with real project data");
  }
}

async function main() {
  try {
    console.log("🚀 Starting documentation generation...");

    // Fetch repositories
    const repos = await fetchRepositories();

    // Filter out specific repos we might not want to showcase
    const filteredRepos = repos.filter(
      (repo) => !repo.name.startsWith(".") && repo.name !== "public-docs", // Exclude this current docs repo from projects list
    );

    // Categorize repositories
    const categories = categorizeRepositories(filteredRepos);

    // Generate projects page
    const projectsContent = await generateProjectsPage(categories);
    const docsDir = path.join(__dirname, "..", "docs");
    await fs.writeFile(
      path.join(docsDir, "projects.md"),
      projectsContent,
      "utf8",
    );

    // Generate CSS for projects
    const projectsCSS = await generateProjectsCSS();
    await fs.writeFile(
      path.join(docsDir, "projects.module.css"),
      projectsCSS,
      "utf8",
    );

    // Update homepage with featured projects
    await updateHomepageProjects(repos);

    console.log("✅ Documentation generation completed!");
    console.log("📄 Generated files:");
    console.log("   - docs/projects.md");
    console.log("   - docs/projects.module.css");
    console.log("   - Updated src/pages/index.tsx");

    // Print summary
    console.log("\n📊 Repository Summary:");
    Object.entries(categories).forEach(([category, repos]) => {
      if (repos.length > 0) {
        console.log(`   ${category}: ${repos.length} projects`);
      }
    });
  } catch (error) {
    console.error("❌ Error during generation:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
