---
title: Ci Github Nodejs
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: README.md
source_branch: main
source_run_id: 19637675224
last_synced: 2025-11-24T14:31:28.424Z
---

# Continuous Integration - GitHub - Node.js

[![Continuous Integration](https://github.com/hoverkraft-tech/ci-github-nodejs/actions/workflows/__main-ci.yml/badge.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/actions/workflows/__main-ci.yml)
[![GitHub tag](https://img.shields.io/github/tag/hoverkraft-tech/ci-github-nodejs?include_prereleases=&sort=semver&color=blue)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Opinionated GitHub Actions and reusable workflows for Node.js continuous integration pipelines.

---

## Overview

This repository centralizes the Hoverkraft toolkit for building, testing, and shipping Node.js projects on GitHub. It bundles:

- Composite actions that detect project tooling, manage dependencies, and bootstrap runtimes.
- Reusable workflows that apply those actions to deliver consistent CI pipelines across repositories.

## Actions

### CI Actions

_Actions for continuous integration steps: build, lint, and test._

#### - [Build](actions/build/index.md)

#### - [Lint](actions/lint/index.md)

#### - [Test](actions/test/index.md)

### Dependencies

_Actions dedicated to caching and validating Node.js dependencies._

#### - [Dependencies cache](actions/dependencies-cache/index.md)

#### - [Has installed dependencies](actions/has-installed-dependencies/index.md)

### Environment setup

_Actions focused on discovering and preparing the Node.js environment._

#### - [Get package manager](actions/get-package-manager/index.md)

#### - [Setup node](actions/setup-node/index.md)

## Reusable Workflows

### Continuous Integration

- [Continuous Integration](github/workflows/continuous-integration.md) — documentation for the reusable Node.js CI workflow.

## Contributing

Contributions are welcome! Please review the [contributing guidelines](CONTRIBUTING.md) before opening a PR.

### Action Structure Pattern

All actions follow a consistent layout:

```text
actions/{category}/{action-name}/
├── action.yml          # Action definition with inputs/outputs
├── README.md           # Usage documentation and examples
└── index.js / scripts  # Optional Node.js helpers (when required)
```

### Development Standards

#### Action Definition Standards

1. **Consistent branding**: Use `author: hoverkraft` with `color: blue` and a meaningful `icon`.
2. **Pinned dependencies**: Reference third-party actions via exact SHAs to guarantee reproducibility.
3. **Input validation**: Validate critical inputs early within composite steps or supporting scripts.
4. **Idempotent steps**: Ensure actions can run multiple times without leaving residual state in the workspace.
5. **Multi-platform support**: Test actions in both `ubuntu-latest` and `windows-latest` runners when applicable.
6. **Cross-platform compatibility**: Uses `actions/github-script` steps for cross-platform compatibility. Avoid `run` steps.
7. **Logging**: Use structured logs with clear prefixes (`[build-image]`, `[helm-test-chart]`, …) to simplify debugging.
8. **Security**: Avoid shell interpolation with untrusted inputs; prefer parameterized commands or `set -euo pipefail` wrappers.

#### File Conventions

- **Tests**: Located in `tests/` with fixtures for container builds and chart-testing scenarios.
- **Workflows**: Reusable definitions live in `.github/workflows/`; internal/private workflows are prefixed with `__`.

#### JavaScript Development Patterns

- Encapsulate reusable logic in modules under the action directory (for example, `actions/my-action/index.js`).
- Prefer async/await with explicit error handling when interacting with the GitHub API or filesystem.
- Centralize environment variable parsing and validation to keep composite YAML lean.

### Development Workflow

#### Linting & Testing

```bash
make lint                 # Run the dockerized Super Linter
make lint-fix             # Attempt auto-fixes for lint findings
```

## Author

🏢 **Hoverkraft [contact@hoverkraft.cloud](mailto:contact@hoverkraft.cloud)**

- Site: [https://hoverkraft.cloud](https://hoverkraft.cloud)
- GitHub: [@hoverkraft-tech](https://github.com/hoverkraft-tech)

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2023 [Hoverkraft](https://hoverkraft.cloud).

For more details, see the [license](http://choosealicense.com/licenses/mit/).
