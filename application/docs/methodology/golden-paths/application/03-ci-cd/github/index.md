---
sidebar_position: 1
---

# GitHub CI/CD

This is the GitHub Actions implementation of the pipeline. If you use another CI/CD platform,
mirror the same structure: build `ci` and runtime images, run tests inside the `ci` image, and
drive deploy/release jobs with the built artifacts. The defaults below use the Node.js reusable
workflow; if you ship another stack, swap `hoverkraft-tech/ci-github-nodejs` for the appropriate
reusable workflow while keeping the same calling pattern, or translate the jobs into your
platform's templates. Replace `<version-sha>` / `x.y.z` with your pinned commit and released
version.

## Prerequisites

- Create a GitHub App for your organization with permissions to read/write contents, deployments, issues, pull requests, and `id-token` usage (for OIDC).
- Store the app ID in variable `CI_BOT_APP_ID` and the private key in secret `CI_BOT_APP_PRIVATE_KEY`; install the app on the repository so workflows can authenticate.
- Pin every reusable workflow and action to a released commit SHA (never `@main`). Use the latest release SHA from the repositories' Releases page or `git ls-remote https://github.com/repo/action.git refs/tags/<version>` and record the exact commit in your workflows, annotating the `uses:` line with the human version (e.g., `@<sha> # v0.30.3`).

## Repository layout

Choose the guide that matches your repository structure:

- **[Single application](./single-app.md)** — one Dockerfile, one service, one chart.
- **[Multi-application](./multi-app.md)** — multiple services (e.g., `backend` + `frontend`), one Dockerfile per service, umbrella chart.

## Pull requests (`pull-request-ci.yml`)

```yaml title=".github/workflows/pull-request-ci.yml"
name: Pull request - Continuous Integration

on: # yamllint disable-line rule:truthy
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions: {}

jobs:
  ci:
    name: Continuous Integration
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      actions: read
      checks: write
      contents: read
      id-token: write
      issues: read
      packages: write
      pull-requests: write
      security-events: write
      statuses: write
    secrets: inherit
```
