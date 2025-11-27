---
sidebar_position: 1
---

# Getting Started

Set up your own Docker base images repository using Hoverkraft's reusable workflows. This guide covers prerequisites and provides an overview of what you'll build.

## What You'll Build

By the end of this tutorial, you'll have a repository that:

✅ Automatically builds Docker images on every PR  
✅ Supports multiple platforms (linux/amd64, linux/arm64)  
✅ Tags images with PR numbers for testing  
✅ Cleans up PR tags when PRs are merged  
✅ Creates semantic versioned releases  
✅ Publishes images to GitHub Container Registry

## Prerequisites

Before starting, ensure you have:

- **GitHub repository**: A new or existing repository where you'll host your Docker images
- **Basic Docker knowledge**: Understanding of Dockerfiles and image builds
- **GitHub Actions familiarity**: Basic understanding of workflow files (helpful but not required)

### Repository Requirements

Your repository needs these permissions configured:

1. **Actions permissions**: Go to **Settings** → **Actions** → **General**
   - Enable "Allow all actions and reusable workflows" (or specifically allow hoverkraft-tech workflows)

2. **Packages permissions**: Go to **Settings** → **Actions** → **General**
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

## Architecture Overview

The workflow architecture follows this pattern:

```txt
Pull Request → Build Images → Tag with PR# → Push to Registry
                                    ↓
                            (On PR merge)
                                    ↓
                        Cleanup PR image tags
                                    ↓
                           Release workflow
                                    ↓
                    Build + Tag with semver → Push to Registry
```

### Key Components

1. **Image Discovery**: The `get-available-images-matrix.yml` workflow scans the `images/` directory to find all Docker images to build

2. **Matrix Builds**: Each image is built-in parallel across multiple platforms

3. **Smart Tagging**:
   - PR builds: `pr-<number>`, `pr-<number>-<sha>`
   - Releases: `v1.0.0`, `v1.0`, `v1`, `latest`

4. **Registry**: Images are pushed to GitHub Container Registry (`ghcr.io`)

## Repository Structure

Your repository will follow this structure:

```txt
your-docker-base-images/
├── .github/
│   ├── workflows/           # CI/CD workflow files
│   │   ├── __pull-request-ci.yml
│   │   ├── __main-ci.yml
│   │   ├── __shared-ci.yml
│   │   ├── __prepare-release.yml
│   │   └── __semantic-pull-request.yml
│   └── dependabot.yml       # Keep workflows updated
├── images/                  # Docker image definitions
│   ├── your-image-1/
│   │   ├── Dockerfile
│   │   └── README.md
│   └── your-image-2/
│       ├── Dockerfile
│       └── README.md
├── Dockerfile               # Linter configuration (optional)
├── Makefile                 # Development helpers (optional)
└── README.md
```

## How Reusable Workflows Work

Instead of duplicating CI/CD logic, you'll reference workflows from [hoverkraft-tech/docker-base-images](https://github.com/hoverkraft-tech/docker-base-images):

```yaml
# Your workflow
jobs:
  build:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/docker-build-images.yml@main
    with:
      # Configuration options
```

This approach:

- **Reduces maintenance**: Updates flow automatically via Dependabot
- **Ensures consistency**: Same build process across all image repositories
- **Simplifies setup**: Complex logic is handled by the reusable workflow

## What's Next

In the following pages, you'll:

1. **Set up your project structure** - Create the `images/` directory and your first Dockerfile
2. **Configure workflows** - Add the GitHub Actions workflow files
3. **Set up releases** - Configure semantic versioning and release automation

## Ready?

👉 **Next: [Project Structure →](./02-project-structure.md)**

---

💡 **Tip**: Start with a single image and add more once your CI/CD is working
