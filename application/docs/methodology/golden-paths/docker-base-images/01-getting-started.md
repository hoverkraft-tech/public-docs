---
sidebar_position: 2
---

# Getting started

Use this guide when one repository must publish several Docker base images from an `images/` directory while delegating CI/CD logic to pinned Hoverkraft reusable workflows.

## Target outcome

By the end of the setup, your repository will:

- Build changed images on pull requests and publish preview tags
- Rebuild on `main` and prune pull-request tags after merge
- Run black-box image tests from `.test.js` files when present
- Prepare release pull requests per image directory
- Publish releases only for images that changed since their latest image-specific tag

## Prerequisites

Before starting, ensure you have:

- A GitHub repository dedicated to Docker images
- Docker and `buildx` available locally
- Basic familiarity with Dockerfiles and GitHub Actions
- A `main` branch that acts as the release base branch

## Repository settings

Set the following repository options before you add workflows:

1. **Actions**: `Settings -> Actions -> General`
   - Allow reusable workflows from `hoverkraft-tech/*`
   - If your organization restricts actions, add explicit allow rules for the Hoverkraft repositories you pin

2. **Workflow permissions**: `Settings -> Actions -> General`
   - Select `Read and write permissions`
   - Enable `Allow GitHub Actions to create and approve pull requests`

3. **Packages**:
   - Ensure the account or organization used by the workflows can push images to your chosen OCI registry

## Required variables and secrets

The production pattern keeps registry details outside workflow files.

| Name             | Type                | Required          | Purpose                                                                                     |
| ---------------- | ------------------- | ----------------- | ------------------------------------------------------------------------------------------- |
| `OCI_REGISTRY`   | Repository variable | Yes               | Registry host used by CI and release workflows, for example `ghcr.io`                       |
| `GITHUB_TOKEN`   | Built-in secret     | Yes               | Used by GitHub Actions for checkout, release preparation, preview pushes, releases and GHCR |
| `GHCR_PAT_TOKEN` | Repository secret   | Optional fallback | Dedicated package token for external registries or cross-owner package access when required |

### Token guidance

- If you publish to GitHub Container Registry under the same repository owner, `GITHUB_TOKEN` is usually sufficient as long as the workflow has `packages: write`
- Use a dedicated secret such as `GHCR_PAT_TOKEN` only when you push to a different registry, publish across owners, or hit package permission boundaries that the built-in token cannot satisfy
- Keep `OCI_REGISTRY` configurable even when the current value is `ghcr.io`

## Reusable repositories to pin

You will pin released SHAs from these repositories:

- `hoverkraft-tech/docker-base-images`
- `hoverkraft-tech/ci-github-common`
- `hoverkraft-tech/ci-github-publish`
- `hoverkraft-tech/ci-github-container`

Do not use floating refs such as `@main` in production. Always copy the released commit SHA and keep the version comment beside it.

## Architecture overview

The repository shape is intentionally simple:

```txt
your-docker-base-images/
├── images/<image>/...              # One image per directory
├── .github/workflows/__shared-ci.yml
├── .github/workflows/pull-request-ci.yml
├── .github/workflows/main-ci.yml
├── .github/workflows/prepare-release.yml
└── .github/workflows/release.yml
```

The runtime flow looks like this:

```txt
pull_request
  -> pull-request-ci.yml
  -> __shared-ci.yml
  -> hoverkraft-tech/docker-base-images/.github/workflows/continuous-integration.yml
  -> preview image tags + optional test reports

push to main
  -> main-ci.yml
  -> __shared-ci.yml
  -> continuous integration reusable workflow
  -> prune-pull-requests-images-tags.yml

workflow_dispatch
  -> prepare-release.yml
  -> image-specific release pull requests

workflow_dispatch
  -> release.yml
  -> release only changed images since latest image-specific tag
```

## Key concepts

### One directory equals one published image

Every subdirectory under `images/` is treated as a distinct published image. The directory name becomes the image suffix in the registry path.

### The shared workflow is the contract boundary

Your repository should own only a thin `__shared-ci.yml` wrapper. That wrapper pins the Hoverkraft reusable CI workflow and injects your registry configuration.

### Tests are optional but first-class

If `images/<image>/<image>.test.js` exists, the CI pipeline will run it automatically with the shared `testcontainers-node` runner image and collect `junit.xml` output from the image directory.

### Releases are image-specific

Releases are not repository-wide version bumps. The release workflow detects changes per image directory and creates image-specific Git tags such as `<image>-<version>`. Those tags are then converted into OCI image tags for the corresponding image.

## Repository structure

The complete structure is covered on the next page, but the minimum shape is:

```txt
your-docker-base-images/
├── .github/workflows/
├── .github/dependabot.yml
├── images/
│   └── your-image/
│       ├── Dockerfile
│       ├── README.md
│       └── your-image.test.js
├── Dockerfile               # Local linter image
├── Makefile                 # Local developer entrypoints
├── .gitignore               # Ignore generated test reports
└── README.md
```

## Bootstrap Checklist

Before moving to the structure page, confirm that you have:

- The repository variable `OCI_REGISTRY`
- Workflow permissions that grant `packages: write` so `GITHUB_TOKEN` can push to GHCR
- A fallback registry credential only if your target registry or ownership model requires it
- Permission to call reusable workflows from the pinned `hoverkraft-tech` repositories
- A decision on which platforms you will build, for example `linux/amd64` only or both `linux/amd64` and `linux/arm64`
- A plan to pin released SHAs instead of using branch refs

## Next step

Continue with **[Project Structure](./02-project-structure.md)**.

Start with one image, one platform, and one registry. Add more images or multi-platform builds only after the first CI and release cycle is working cleanly.
