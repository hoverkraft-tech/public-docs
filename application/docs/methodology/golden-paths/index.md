---
sidebar_position: 2
---

# Golden Paths

Welcome to the Hoverkraft golden path guides. This section provides step-by-step tutorials for creating new repositories using Hoverkraft's reusable workflows and best practices.

## What is a Golden Path?

A golden path is an opinionated sequence for setting up a new repository with the correct structure, workflows, and configurations to follow Hoverkraft best practices from the start. Instead of starting from scratch, you can leverage our reusable components to:

- **Get up and running quickly**: Pre-built workflows handle CI/CD, releases, and maintenance
- **Follow best practices**: Consistent structure and patterns across all your projects
- **Stay updated**: Dependabot keeps workflows and dependencies current
- **Focus on your code**: Infrastructure and automation are already handled

## Available Golden Paths

### Docker Base Images Repository

Create your own Docker base images repository with automated builds, multi-platform support, and semantic versioning:

👉 **[Docker Base Images Repository](./docker-base-images/)**

This tutorial covers:

- Repository structure for Docker images
- Setting up reusable workflows from [hoverkraft-tech/docker-base-images](https://github.com/hoverkraft-tech/docker-base-images)
- Automated PR builds and image tagging
- Release workflows with semantic versioning
- Multi-platform image builds (amd64, arm64)

## How to Use These Guides

1. **Choose your project type**: Select the golden path that matches what you want to build
2. **Follow step-by-step**: Each guide walks you through the complete setup process
3. **Customize as needed**: Adapt the templates and workflows to your specific requirements
4. **Stay connected**: Use Dependabot to receive updates to the reusable workflows

## Why Follow Hoverkraft Golden Paths?

### Consistency

All Hoverkraft projects follow the same patterns, making it easier to:

- Onboard new team members
- Switch between projects
- Share knowledge and improvements

### Quality

Built-in automation ensures:

- Semantic PR validation
- Automated testing and linting
- Security scanning
- Proper versioning

### Maintenance

Dependabot integration means:

- Automatic dependency updates
- Workflow version updates
- Reduced maintenance burden

## Contributing

Have a new golden path template to share? We welcome contributions!

1. Create your template following Hoverkraft patterns
2. Document the setup process thoroughly
3. Submit a pull request to add your guide

---

Ready to follow your first golden path? Start with the **[Docker Base Images Repository](./docker-base-images/)** guide →
