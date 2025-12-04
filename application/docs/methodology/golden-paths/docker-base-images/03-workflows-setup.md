---
sidebar_position: 3
---

# Workflows Setup

This page covers setting up the GitHub Actions workflows for your Docker base images repository. You'll configure workflows that use reusable components from [hoverkraft-tech/docker-base-images](https://github.com/hoverkraft-tech/docker-base-images).

## Workflow Overview

You'll create these workflow files:

| Workflow                    | Purpose                               | Trigger                   |
| --------------------------- | ------------------------------------- | ------------------------- |
| `__shared-ci.yml`           | Central CI logic (lint, build images) | Called by other workflows |
| `pull-request-ci.yml`       | PR validation and preview builds      | Pull requests             |
| `main-ci.yml`               | Main branch builds and cleanup        | Push to main              |
| `semantic-pull-request.yml` | PR title validation                   | Pull requests             |
| `stale.yml`                 | Mark stale issues and PRs             | Scheduled                 |
| `need-fix-to-issue.yml`     | Convert PRs with need-fix to issues   | Pull requests             |

## Step 1: Create the Shared CI Workflow

This workflow centralizes the build logic and is called by both PR and main workflows.

Create `.github/workflows/__shared-ci.yml`:

```yaml
name: Shared CI

on:
  workflow_call:

permissions: {}

jobs:
  build:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/docker-build-images.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      id-token: write
      packages: write
```

### Configuration Options

The `docker-build-images.yml` workflow accepts these inputs:

```yaml
jobs:
  build:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/docker-build-images.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      id-token: write
      packages: write
    with:
      # Custom runners (optional)
      runs-on: '["ubuntu-latest"]'

      # OCI registry (default: ghcr.io)
      oci-registry: ghcr.io

      # Platforms to build for
      platforms: '["linux/amd64","linux/arm64"]'

      # Specific images to build (optional - builds all if not specified)
      # images: '["my-image-1", "my-image-2"]'
```

## Step 2: Create the Pull Request CI Workflow

This workflow runs on every pull request to validate changes and build preview images.

Create `.github/workflows/pull-request-ci.yml`:

```yaml
name: Pull request CI

on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions: {}

jobs:
  call-shared-ci:
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      contents: read
      id-token: write
      packages: write
```

### What This Does

When a PR is opened or updated:

1. Discovers all images in the `images/` directory
2. Builds each image for all configured platforms
3. Tags images with:
   - `pr-<number>` (e.g., `pr-42`)
   - `pr-<number>-<sha>` (e.g., `pr-42-abc1234`)
4. Pushes images to the registry

## Step 3: Create the Main CI Workflow

This workflow runs when changes are merged to main. It rebuilds images and cleans up PR tags.

Create `.github/workflows/main-ci.yml`:

```yaml
name: Main CI

on:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions: {}

jobs:
  call-shared-ci:
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      contents: read
      id-token: write
      packages: write

  prune-pr-images:
    needs: call-shared-ci
    uses: hoverkraft-tech/docker-base-images/.github/workflows/prune-pull-requests-images-tags.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      id-token: write
      packages: write
      pull-requests: read
```

### Main Branch Workflow

When code is pushed to main:

1. Rebuilds all affected images
2. Tags images with the commit SHA
3. Cleans up image tags from merged PRs

## Step 4: Create the Semantic PR Workflow

This workflow ensures PR titles follow conventional commit format for proper release notes.

Create `.github/workflows/semantic-pull-request.yml`:

```yaml
name: Semantic pull request

on:
  pull_request:
    types:
      - opened
      - edited
      - synchronize

permissions: {}

jobs:
  semantic-pull-request:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/semantic-pull-request.yml@<version-sha> # x.y.z
    permissions:
      pull-requests: read
```

### Valid PR Title Prefixes

PR titles must start with one of these prefixes:

- `feat:` - New features
- `fix:` - bugfixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test changes
- `build:` - build tool changes
- `ci:` - CI configuration changes
- `chore:` - Maintenance tasks
- `revert:` - Reverts

Example: `feat: add nodejs-22 base image`

## Step 5: Create the Stale Workflow

This workflow automatically marks inactive issues and pull requests as stale.

Create `.github/workflows/stale.yml`:

```yaml
name: Stale

on:
  schedule:
    - cron: "0 0 * * *" # Daily at midnight
  workflow_dispatch:

permissions: {}

jobs:
  stale:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/stale.yml@<version-sha> # x.y.z
    permissions:
      issues: write
      pull-requests: write
```

### Configuration

The stale workflow automatically:

- Marks issues/PRs as stale after a period of inactivity
- Closes stale items after an additional grace period
- Can be customized with labels and time periods

## Step 6: Create the Need-Fix-to-Issue Workflow

This workflow converts pull requests marked with a "need-fix" label into issues for tracking.

Create `.github/workflows/need-fix-to-issue.yml`:

```yaml
name: Need fix to issue

on:
  pull_request:
    types:
      - labeled

permissions: {}

jobs:
  need-fix-to-issue:
    if: github.event.label.name == 'need-fix'
    uses: hoverkraft-tech/ci-github-common/.github/workflows/need-fix-to-issue.yml@<version-sha> # x.y.z
    permissions:
      issues: write
      pull-requests: write
      contents: read
```

### How It Works

When a PR is labeled with `need-fix`:

1. Creates an issue with the PR details
2. Links the issue to the original PR
3. Helps track work that needs attention

## Step 7: Pin Workflow Versions

For production use, pin workflow versions to specific commits:

```yaml
# Use the format @<version-sha> # x.y.z instead of @main
uses: hoverkraft-tech/docker-base-images/.github/workflows/docker-build-images.yml@<version-sha> # x.y.z
```

To find the latest release SHA:

1. Go to [hoverkraft-tech/docker-base-images releases](https://github.com/hoverkraft-tech/docker-base-images/releases)
2. Find the commit SHA for the version you want
3. Replace `@main` with `@<sha>  # x.y.z`

## Complete Workflow Files

Here's a summary of what you should have:

```txt
.github/
└── workflows/
    ├── __shared-ci.yml           # Central build logic
    ├── pull-request-ci.yml       # PR builds
    ├── main-ci.yml               # Main branch builds + cleanup
    ├── semantic-pull-request.yml # PR title validation
    ├── stale.yml                 # Mark stale issues and PRs
    └── need-fix-to-issue.yml     # Convert PRs with need-fix to issues
```

## Testing Your Setup

1. **Create a test PR**:

   ```bash
   git checkout -b feat/test-ci
   # Make a small change to a Dockerfile
   git commit -m "test: verify CI workflow"
   git push origin feat/test-ci
   ```

2. **Open a PR** with a semantic title like `feat: test CI workflow`

3. **Check the Actions tab** to see the workflows running

4. **Verify image was pushed** in the Packages section of your repository

## Troubleshooting

### Workflow Not Running

- Check that Actions are enabled in repository settings
- Verify workflow file syntax with a YAML linter
- Ensure file is in `.github/workflows/` directory

### Permission Denied

- Verify "Read and write permissions" is enabled in Settings → Actions → General
- Check that the workflow has the correct `permissions` block

### Images Not Found

- Ensure `images/` directory exists
- Verify each image has a `Dockerfile`
- Check that directory names don't contain invalid characters

## Ready?

👉 **Next: [Release and Publishing →](./04-release-publishing.md)**

---

💡 **Tip**: Test with a simple Dockerfile first. Once CI is working, add more complex images.
