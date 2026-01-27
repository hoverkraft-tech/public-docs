const { buildProfile } = require("./repository-profile");

function hasTopic(profile, topic) {
  return profile.topics.has(topic);
}

const hasAnyTopic = (profile, topics) =>
  topics.some((topic) => hasTopic(profile, topic));

const CATEGORY_RULES = [
  {
    name: "GitHub Actions and Reusable Workflows",
    icon: "⚡",
    predicate: (profile) =>
      hasAnyTopic(profile, ["github-actions", "action", "workflow"]),
  },
  {
    name: "CI/CD Tools",
    icon: "🐳",
    predicate: (profile) =>
      hasAnyTopic(profile, [
        "continuous-integration",
        "continuous-delivery",
        "ci",
        "cd",
      ]),
  },
  {
    name: "Infrastructure & DevOps",
    icon: "🏗️",
    predicate: (profile) =>
      hasAnyTopic(profile, [
        "terraform",
        "aws",
        "infrastructure",
        "devops",
        "iac",
      ]),
  },
  {
    name: "Container & Kubernetes",
    icon: "☸️",
    predicate: (profile) =>
      hasAnyTopic(profile, [
        "docker",
        "container",
        "containers",
        "kubernetes",
        "helm",
        "chart",
      ]),
  },
  {
    name: "Development Tools",
    icon: "🔧",
    predicate: (profile) =>
      hasAnyTopic(profile, [
        "developer-tools",
        "tooling",
        "cli",
        "sdk",
        "open-source",
      ]),
  },
  {
    name: "Documentation & Themes",
    icon: "📚",
    predicate: (profile) =>
      hasAnyTopic(profile, [
        "documentation",
        "docs",
        "docusaurus",
        "jekyll",
        "theme",
      ]),
  },
  {
    name: "Libraries & Frameworks",
    icon: "📦",
    predicate: (profile) =>
      hasAnyTopic(profile, ["library", "framework", "sdk", "api"]),
  },
];

class RepositoryCategorizer {
  constructor({ fallbackCategory = "Other", fallbackIcon = "🔧" } = {}) {
    this.rules = CATEGORY_RULES;
    this.fallbackCategory = fallbackCategory;
    this.fallbackIcon = fallbackIcon;
  }

  resolveCategory(repository) {
    const profile = buildProfile(repository);
    const matchingRule = this.rules.find((rule) => rule.predicate(profile));

    if (matchingRule) {
      return { name: matchingRule.name, icon: matchingRule.icon };
    }

    return { name: this.fallbackCategory, icon: this.fallbackIcon };
  }

  categorize(repositories) {
    const categories = this.initializeCategories();

    repositories.forEach((repository) => {
      const resolved = this.resolveCategory(repository);
      categories[resolved.name].push(repository);
    });

    return categories;
  }

  initializeCategories() {
    const categories = this.rules.reduce((accumulator, rule) => {
      accumulator[rule.name] = [];
      return accumulator;
    }, {});

    categories[this.fallbackCategory] = [];
    return categories;
  }
}

module.exports = {
  RepositoryCategorizer,
};
