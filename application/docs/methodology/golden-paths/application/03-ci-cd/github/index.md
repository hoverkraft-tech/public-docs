---
sidebar_position: 1
---

# GitHub Actions

This is the GitHub Actions implementation of the golden-path application pipeline.
It reflects two reference application shapes:

- A single-application repository with one Dockerfile and one chart.
- A multi-application repository with several Dockerfiles and an umbrella chart.

Use another CI/CD platform if you want, but preserve the same contracts:

1. Build immutable images first.
2. Run CI inside dedicated `ci` images.
3. Prepare release metadata continuously.
4. Deploy tagged artifacts through GitOps rather than rebuilding during deploy.

## Prerequisites

- Create a GitHub App for your organization with permissions to read/write contents, deployments, issues, pull requests, and `id-token` usage (for OIDC).
- Store the GitHub App client ID in variable `CI_BOT_APP_CLIENT_ID` and the private key in secret `CI_BOT_APP_PRIVATE_KEY`.
- Configure `OCI_REGISTRY` plus environment URLs such as `REVIEW_APPS_URL`, `UAT_URL`, and `PRODUCTION_URL` when you use preview and promoted environments.
- Pin every reusable workflow and action to a released commit SHA (never `@main`). The snippets in this section keep placeholders such as `@<version-sha>` because exact SHAs change over time. In a real repository, replace those placeholders with the release tag you want to track, run `ratchet upgrade .github/workflows/*.yml`, and commit the rewritten SHA pins.

## Guides

- **[Single application](./single-app.md)** is the primary walkthrough for a repository with one deployable application image and one chart.
- **[Multi-application](./multi-app.md)** is the primary walkthrough for a repository with several deployable services and one umbrella chart.
- **[GitHub CI](./ci.md)** is the reusable CI reference across both shapes.
- **[GitHub CD](./cd.md)** is the reusable CD reference across both shapes.

## Recommended path

Start with the page that matches your repository shape:

- **Single application**
  One Dockerfile with `ci` and `prod` targets, one runtime image, and one chart release.
- **Multi-application**
  One Dockerfile per service, one `ci` image per service, and one coordinated umbrella-chart release.

Read the generic CI and CD pages after that when you want the reusable workflow contract without the repository-specific details.

## Shared model

Both reference shapes use the same workflow families, but the repository shape changes the image matrix:

- **Single application**
  Build one `ci` image and one runtime image from the same Dockerfile, then map a single chart image.
- **Multi-application**
  Build one `ci` image per service, run CI per service in a matrix, then publish one runtime image per service and map all of them into the umbrella chart.

## Release model

The GitHub implementation separates release preparation from deployment:

1. `prepare-release.yml` keeps release metadata ready on pull requests and on `main`.
2. `release.yml` creates the immutable tag to promote.
3. `deploy.yml` updates the GitOps delivery repository for review, UAT, or production.
4. `clean-deploy.yml` removes temporary deployments when a pull request closes.

That split is the main thing to preserve if you translate these workflows to another platform.
