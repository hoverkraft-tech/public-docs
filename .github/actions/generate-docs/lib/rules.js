function hasTopic(profile, topic) {
  return profile.topics.has(topic);
}

const hasAnyTopic = (profile, topics) =>
  topics.some((topic) => hasTopic(profile, topic));

const CATEGORY_RULES = [
  {
    name: "GitHub Actions and Reusable Workflows",
    predicate: (profile) =>
      hasAnyTopic(profile, ["github-actions", "action", "workflow"]),
  },
  {
    name: "CI/CD Tools",
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
    predicate: (profile) =>
      hasAnyTopic(profile, ["library", "framework", "sdk", "api"]),
  },
];

const ICON_RULES = [
  {
    icon: "⚡",
    predicate: (profile) =>
      hasAnyTopic(profile, ["github-actions", "action", "workflow"]),
  },
  {
    icon: "☸️",
    predicate: (profile) => hasAnyTopic(profile, ["helm", "kubernetes"]),
  },
  {
    icon: "🐳",
    predicate: (profile) => hasAnyTopic(profile, ["docker", "container"]),
  },
  {
    icon: "🏗️",
    predicate: (profile) => hasAnyTopic(profile, ["terraform", "iac"]),
  },
  {
    icon: "📚",
    predicate: (profile) =>
      hasAnyTopic(profile, ["documentation", "docs", "docusaurus"]),
  },
  {
    icon: "🎨",
    predicate: (profile) => hasTopic(profile, "theme"),
  },
  {
    icon: "📧",
    predicate: (profile) => hasAnyTopic(profile, ["email", "mail"]),
  },
  {
    icon: "💾",
    predicate: (profile) =>
      hasAnyTopic(profile, ["backup", "snapshot", "storage"]),
  },
  {
    icon: "🔐",
    predicate: (profile) =>
      hasAnyTopic(profile, ["authentication", "auth", "security"]),
  },
];

module.exports = {
  CATEGORY_RULES,
  ICON_RULES,
};
