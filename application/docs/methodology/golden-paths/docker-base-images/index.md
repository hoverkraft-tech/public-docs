---
sidebar_position: 1
---

# Docker Base Images Repository

Create your own Docker base images repository using the reusable workflows from [hoverkraft-tech/docker-base-images](https://github.com/hoverkraft-tech/docker-base-images). This tutorial walks you through setting up a complete CI/CD pipeline for building, testing, and publishing Docker images.

## Tutorial Pages

1. **[Getting Started](./01-getting-started.md)** - Prerequisites and overview
2. **[Project Structure](./02-project-structure.md)** - Repository layout and Dockerfile conventions
3. **[Workflows Setup](./03-workflows-setup.md)** - Configuring CI/CD workflows
4. **[Release and Publishing](./04-release-publishing.md)** - Semantic versioning and image publishing

## Who This Is For

- Developers building custom Docker base images
- Teams standardizing container images across projects
- Anyone needing automated multi-platform Docker builds

## Time Required

- **Basic setup**: 20 minutes
- **Full setup with release workflow**: 30 minutes

## What You'll Build

By the end of this tutorial, your repository will have:

✅ Automated image builds on pull requests  
✅ Multi-platform support (linux/amd64, linux/arm64)  
✅ Automatic image tagging with PR numbers  
✅ Cleanup of PR-related image tags on merge  
✅ Semantic versioned releases  
✅ Images published to GitHub Container Registry (ghcr.io)

## Hoverkraft Reusable Workflows

This tutorial uses the following reusable workflows from the [docker-base-images](https://github.com/hoverkraft-tech/docker-base-images) repository:

| Workflow                              | Purpose                                           |
| ------------------------------------- | ------------------------------------------------- |
| `get-available-images-matrix.yml`     | Discovers all image directories for matrix builds |
| `docker-build-images.yml`             | Builds and pushes Docker images                   |
| `prune-pull-requests-images-tags.yml` | Cleans up image tags from merged PRs              |
| `prepare-release.yml`                 | Creates release PRs with semantic versioning      |
| `release.yml`                         | Builds and tags images for releases               |

## Approach

**Linear**: Follow pages 1-4 in order for the complete setup  
**Selective**: Jump to specific sections if you already have parts configured

## Start

👉 **[Getting Started →](./01-getting-started.md)**

---

Need help? [Hoverkraft Discussions](https://github.com/orgs/hoverkraft-tech/discussions)
