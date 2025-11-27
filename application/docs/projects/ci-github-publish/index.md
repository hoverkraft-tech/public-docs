---
title: Ci Github Publish
source_repo: hoverkraft-tech/ci-github-publish
source_path: README.md
source_branch: main
source_run_id: 19729975878
last_synced: 2025-11-27T08:35:03.090Z
---

# Continuous Integration - GitHub - Publish

<div align="center">
  <img src="/ci-github-publish/assets/github/logo.svg" width="60px" align="center" alt="Logo for Continuous Integration - GitHub - Publish" />
</div>

---

[![Continuous Integration](https://github.com/hoverkraft-tech/ci-github-publish/actions/workflows/__main-ci.yml/badge.svg)](https://github.com/hoverkraft-tech/ci-github-publish/actions/workflows/__main-ci.yml)
[![GitHub tag](https://img.shields.io/github/tag/hoverkraft-tech/ci-github-publish?include_prereleases=&sort=semver&color=blue)](https://github.com/hoverkraft-tech/ci-github-publish/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

Opinionated GitHub Actions and workflows for streamlined release, deployment, and publishing.

## Actions

### ArgoCD

_Actions dedicated to ArgoCD workflows._

#### - [Get manifest files](actions/argocd/get-manifest-files/index.md)

### Checks

_Actions for validating the result of a deploy._

#### - [URL - Lighthouse](actions/check/url-lighthouse/index.md)

#### - [URL - Ping](actions/check/url-ping/index.md)

### Clean deploy

_Actions for cleaning deployments on various platforms._

#### - [Repository dispatch](actions/clean-deploy/repository-dispatch/index.md)

### Deploy

_Actions for deploying to various platforms._

#### - [Argocd manifest files](actions/deploy/argocd-manifest-files/index.md)

#### - [Get environment](actions/deploy/get-environment/index.md)

#### - [GitHub Pages](actions/deploy/github-pages/index.md)

#### - [Helm repository dispatch](actions/deploy/helm-repository-dispatch/index.md)

#### - [Jampack](actions/deploy/jampack/index.md)

#### - [Jekyll](actions/deploy/jekyll/index.md)

#### - [Report](actions/deploy/report/index.md)

### Deployment

_Actions for managing deployments._

#### - [Create](actions/deployment/create/index.md)

#### - [Delete](actions/deployment/delete/index.md)

#### - [Get finished](actions/deployment/get-finished/index.md)

#### - [Read](actions/deployment/read/index.md)

#### - [Update](actions/deployment/update/index.md)

### Release

_Actions for managing releases._

#### - [Create](actions/release/create/index.md)

### Workflow

_Actions for managing workflows._

#### - [Get workflow failure](actions/workflow/get-workflow-failure/index.md)

## Reusable Workflows

### Cleaning deploy

#### - [Clean deploy](github/workflows/clean-deploy.md)

#### - [Clean deploy argocd app of apps](github/workflows/clean-deploy-argocd-app-of-apps.md)

### Performs deploy

#### - [Deploy argocd app of apps](github/workflows/deploy-argocd-app-of-apps.md)

#### - [Deploy chart](github/workflows/deploy-chart.md)

#### - [Deploy start](github/workflows/deploy-start.md)

#### - [Deploy checks](github/workflows/deploy-checks.md)

#### - [Deploy finish](github/workflows/deploy-finish.md)

#### - [Finish deploy argocd app of apps](github/workflows/finish-deploy-argocd-app-of-apps.md)

### Releases

_Reusable workflows for managing release process._

#### - [Prepare release](github/workflows/prepare-release.md)

#### - [Release](github/workflows/release.md)

#### - [Release actions](github/workflows/release-actions.md)

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-publish/blob/main/CONTRIBUTING.md) for more details.

### Action Structure Pattern

All actions follow this consistent structure:

```text
actions/{category}/{action-name}/
├── action.yml          # Action definition with inputs/outputs
├── README.md          # Usage documentation
└── *.js              # Optional Node.js scripts (e.g., prepare-site.js)
```

### Development Standards

#### Action Definition Standards

1. **Consistent branding**: All actions use `author: hoverkraft`, `icon: <specific-icon>`, `color: blue`
2. **Composite actions**: Use `using: "composite"` with GitHub Script for complex logic
3. **Pinned dependencies**: Always pin action versions with SHA (e.g., `@ed597411d8f924073f98dfc5c65a23a2325f34cd`)
4. **Input validation**: Validate inputs early in GitHub Script steps

#### JavaScript Patterns

- **Class-based architecture**: Use classes like `AssetManager` for complex functionality
- **Path utilities**: Extensive use of Node.js `path` module for cross-platform compatibility
- **Regular expression patterns**: Define constants for reusable patterns (`MARKDOWN_IMAGE_REGEX`, `HTML_IMAGE_REGEX`)
- **Caching**: Implement Map-based caching for expensive operations

### Development Workflow

#### Linting & Testing

```bash
make lint        # Run Super Linter (dockerized)
make lint-fix    # Auto-fix issues where possible

# Use GitHub Actions locally with `act`
gh act -W .github/workflows/workflow-file-to-test.yml
```

#### File Conventions

- **Dockerfile**: Uses Super Linter slim image for consistent code quality
- **Tests**: Located in `tests/` with expected vs actual file comparisons
- **Workflows**: Private workflows prefixed with `__` (e.g., `__main-ci.yml`)

#### Action Development Conventions

**Always follow these patterns when creating/modifying actions:**

1. **Pinned Dependencies**: Use exact SHA commits for all action dependencies:

   ```yaml
   uses: actions/github-script@ed597411d8f924073f98dfc5c65a23a2325f34cd # v8.0.0
   ```

2. **Consistent Branding**: Every action.yml must include:

   ```yaml
   author: hoverkraft
   branding:
     icon: <specific-icon>
     color: blue
   ```

3. **Input Validation**: Always validate inputs early in GitHub Script steps:
   ```javascript
   const urlInput = ${{ toJson(inputs.url ) }};
   if (!urlInput) {
     return core.setFailed("URL input is required.");
   }
   ```

#### JavaScript Development Patterns

**For Node.js scripts (like `prepare-site.js`):**

- Use class-based architecture for complex functionality
- Define regular expression patterns as constants (`MARKDOWN_IMAGE_REGEX`, `HTML_IMAGE_REGEX`)
- Implement Map-based caching for expensive operations
- Always use Node.js `path` module for cross-platform compatibility

#### File Structure Understanding

```text
actions/{category}/{action-name}/     # Modular action organization
├── action.yml                        # Action definition with inputs/outputs
├── README.md                         # Usage documentation
└── *.js                             # Optional Node.js scripts

.github/workflows/                    # Reusable workflows
├── deploy-*.yml                      # Deployment orchestration
├── clean-deploy-*.yml               # Cleanup workflows
└── __*.yml                          # Private/internal workflows

tests/                               # Expected vs actual comparisons
└── argocd-app-of-apps/             # Template testing structure
```

## Author

🏢 **Hoverkraft [contact@hoverkraft.cloud](mailto:contact@hoverkraft.cloud)**

- Site: [https://hoverkraft.cloud](https://hoverkraft.cloud)
- GitHub: [@hoverkraft-tech](https://github.com/hoverkraft-tech)

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2025 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).
