---
sidebar_position: 1
---

# Docker Base Images Repository

Create and operate a Docker base images repository using the same model as [hoverkraft-tech/docker-base-images](https://github.com/hoverkraft-tech/docker-base-images) and the production [aircorsica/docker-base-images](https://github.com/aircorsica/docker-base-images) implementation.

The golden path keeps application teams out of bespoke CI logic: each image lives under `images/`, reusable Hoverkraft workflows discover what changed, and releases are prepared and published per image.

## Tutorial pages

1. **[Getting Started](./01-getting-started.md)** - repository prerequisites, required variables and the operating model
2. **[Project Structure](./02-project-structure.md)** - image layout, test conventions, local tooling and Dependabot
3. **[Workflows Setup](./03-workflows-setup.md)** - production-ready wrappers around Hoverkraft reusable workflows
4. **[Release and Publishing](./04-release-publishing.md)** - image-scoped release preparation, publishing and verification

## Who this is for

- Platform teams maintaining shared container foundations
- Developers publishing reusable Docker images from a mono-repository layout
- Teams that want consistent PR previews, automated testing, and controlled releases

## Time required

- **Repository bootstrap**: 20 to 30 minutes
- **Full production setup**: 45 to 60 minutes

## What you will build

By the end of this tutorial, your repository will have:

- A dedicated `images/` directory with one published image per folder
- Per-image documentation and optional black-box tests with `.test.js` files
- Pull request builds with preview tags pushed to your OCI registry
- Main branch rebuilds plus pull-request tag cleanup after merge
- Manual release preparation and publishing for changed images only
- Dependabot coverage for Dockerfiles, GitHub Actions, devcontainers and optional runner dependencies

## Implementation model

The recommended setup is intentionally thin:

- Your repository owns the public entry workflows in `.github/workflows/`
- A private `__shared-ci.yml` wrapper centralizes the common CI contract
- Hoverkraft reusable workflows handle linting, selective image builds, test execution, release preparation, and release publishing
- Repository-specific configuration lives in regular GitHub variables, secrets, and Dependabot settings

This matches the production pattern used in Air Corsica:

- Public entrypoints named `pull-request-ci.yml`, `main-ci.yml`, `prepare-release.yml`, and `release.yml`
- A single internal `__shared-ci.yml` workflow calling `hoverkraft-tech/docker-base-images/.github/workflows/continuous-integration.yml`
- Registry configuration provided through `vars.OCI_REGISTRY`
- Registry authentication provided through `secrets.GITHUB_TOKEN` for same-owner GHCR publishing, or a dedicated registry credential when required

## Hoverkraft building blocks

This guide relies on these reusable components from [hoverkraft-tech/docker-base-images](https://github.com/hoverkraft-tech/docker-base-images):

| Component                             | Purpose                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `continuous-integration.yml`          | Lints the repository, builds changed images, and runs image-local `.test.js` suites       |
| `prepare-release.yml`                 | Opens release pull requests for all discovered image directories                          |
| `release.yml`                         | Detects changes since the latest image-specific tag, builds, then creates image releases  |
| `prune-pull-requests-images-tags.yml` | Removes preview tags created by pull-request builds after merge                           |
| `actions/get-available-images`        | Lists first-level directories under `images/`                                             |
| `actions/should-build-images`         | Decides which image directories need to be rebuilt from a diff or image-specific base SHA |

## Common drift this guide avoids

Older internal documentation often drifts in the same places:

- Treating `docker-build-images.yml` as the public entrypoint instead of the higher-level `continuous-integration.yml` workflow
- Release flows triggered from `release.published` instead of the current manual `workflow_dispatch` model
- Missing repository variables and secrets needed for non-default registries
- Missing guidance for `.test.js` image tests, `junit.xml` output, and the shared `testcontainers-node` runner
- Dependabot examples that update only one image instead of the whole repository shape

The rest of this tutorial uses the current implementation model and removes those gaps.

## How to read this guide

- Follow pages 1 to 4 in order if you are bootstrapping a new repository
- Jump directly to page 3 or 4 if your repository already has images and only needs CI or release cleanup
- Keep the Hoverkraft source repository open while implementing so you can pin exact workflow SHAs from a released version

## Start here

Start with **[Getting Started](./01-getting-started.md)**.

---

Need help? [Hoverkraft Discussions](https://github.com/orgs/hoverkraft-tech/discussions)
