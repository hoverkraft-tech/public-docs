---
sidebar_position: 3
---

# Core Workflows

Add essential workflows for CI/CD automation. These three workflows form the foundation of your pipeline.

## Workflow Structure

1. **Shared CI Workflow** (`__shared-ci.yml`) - Reusable CI logic
2. **Pull Request Workflow** (`pull-request-ci.yml`) - PR validation
3. **Main Branch Workflow** (`main-ci.yml`) - Main branch CI + deployment

## Choosing Your CI Workflow

Select the appropriate Hoverkraft workflow (or your own reusable workflow) for each technology stack:

| Stack                          | Workflow                                | Repository                                                                                    |
| ------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| JavaScript/TypeScript runtimes | `ci-github-nodejs`                      | [hoverkraft-tech/ci-github-nodejs](https://github.com/hoverkraft-tech/ci-github-nodejs)       |
| Container images               | `ci-github-container`                   | [hoverkraft-tech/ci-github-container](https://github.com/hoverkraft-tech/ci-github-container) |
| Generic / mixed                | `ci-github-common` (or custom workflow) | [hoverkraft-tech/ci-github-common](https://github.com/hoverkraft-tech/ci-github-common)       |

## Step 1: Shared CI Workflow

Create `.github/workflows/__shared-ci.yml`. The snippet below matches the Node.js workflow used in the reference repository—swap the `uses` line if you target another runtime.

```yaml title=".github/workflows/__shared-ci.yml"
name: Common Continuous Integration tasks

on:
  workflow_call:

permissions:
  contents: read
  security-events: write
  # FIXME: This is a workaround for having workflow ref. See https://github.com/orgs/community/discussions/38659
  id-token: write

jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@1d00c9eb280acbee5df4b4a2087f786e66b13d87 # 0.14.1
    with:
      working-directory: application
      build: |
        {
          "artifact": ["application/dist"]
        }
```

**Configuration:**

- `working-directory`: Point to your service path (`application`, `apps/web`, `services/api`, etc.)
- `artifact`: Build output paths to save for deployment (or leave empty)
- `uses`: Reference the reusable workflow that matches your stack and pin it to a tested tag or commit

**What it does:** Runs install, lint, test, build, and security scans defined by the reusable workflow you call.

The reference implementation pins the workflow to the commit that produced release `0.14.1`, ensuring reproducible runs. Update the reference after validating a newer release.

### Other stack examples

```yaml title="Container build"
jobs:
  build-image:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/build-push.yml@<version>
    with:
      dockerfile: ./Dockerfile
      push: false
```

```yaml title="Custom reusable workflow"
jobs:
  checks:
    uses: ./.github/workflows/ci-python.yml
    with:
      working-directory: services/api
      command: make test
```

Define `ci-python.yml` (or any name you choose) in your repository with `on: workflow_call`. This keeps language-specific logic under your control while matching the pattern.

## Step 2: Pull Request Workflow

Create `.github/workflows/pull-request-ci.yml`:

```yaml title=".github/workflows/pull-request-ci.yml"
name: Pull request - Continuous Integration

on:
  merge_group:
  pull_request:
    branches: [main]

permissions:
  contents: read
  security-events: write
  # FIXME: This is a workaround for having workflow ref. See https://github.com/orgs/community/discussions/38659
  id-token: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    uses: ./.github/workflows/__shared-ci.yml
    secrets: inherit
```

**What it does:**

- Validates pull requests before merging
- Runs on PR events and merge queue
- Cancels redundant runs for efficiency

## Step 3: Main Branch Workflow

Create `.github/workflows/main-ci.yml`:

```yaml title=".github/workflows/main-ci.yml"
name: Internal - Main - Continuous Integration

on:
  push:
    branches: [main]
    tags: ["*"]

permissions:
  contents: read
  id-token: write
  pages: write
  security-events: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    uses: ./.github/workflows/__shared-ci.yml
    secrets: inherit
    permissions:
      contents: read
      security-events: write
      # FIXME: This is a workaround for having workflow ref. See https://github.com/orgs/community/discussions/38659
      id-token: write

  publish-image:
    if: github.ref_name == github.event.repository.default_branch
    name: Build and publish container
    needs: ci
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Log in to registry
        uses: docker/login-action@<latest-docker-login-sha> # v3.x.x
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<latest-container-sha> # x.x.x
        with:
          dockerfile: ./Dockerfile
          push: true
          image-name: ghcr.io/${{ github.repository }}:${{ github.sha }}
```

> Replace every `<latest-…-sha> # …` placeholder with the specific release you validated before enabling the workflow in production.

**What it does:**

- Runs after CI completes successfully on the default branch
- Builds and pushes a fresh container image ready for downstream deployments
- Keeps permissions scoped to reading contents and writing packages

**Customization:**

- Adjust registry, image tags, or build arguments to match your platform (ECR, GCR, ACR, etc.)
- Leave deployments gated: follow up with the review-app and release workflows below instead of auto-syncing the cluster
- Extend the workflow with additional publishing steps (Helm charts, SBOM uploads) after the CI job completes

## Permissions

Workflows use minimal required permissions:

| Permission               | Purpose                                                 |
| ------------------------ | ------------------------------------------------------- |
| `contents: read`         | Read repository code                                    |
| `security-events: write` | Upload security scan results from the reusable workflow |
| `id-token: write`        | Required for calling reusable workflows securely        |
| `packages: write`        | Push container images or other packages to registries   |

## Deployment Triggers

Keep production changes intentional by separating deployment triggers from the main CI pipeline.

### Review App Workflow (`deploy-review.yml`)

```yaml
name: Deploy review app

on:
  issue_comment:
    types: [created]

jobs:
  deploy:
    if: github.event.issue.pull_request && contains(github.event.comment.body, '/deploy')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
      deployments: write
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Deploy preview
        run: ./scripts/deploy-review.sh
```

> Replace the job body with whatever reusable workflow spins up your review environment. The key is the `/deploy` comment gate and the limited permissions needed to bootstrap temporary infrastructure.

### Release Workflow (`release.yml`)

```yaml
name: Release to production

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Semantic version or tag"
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
      deployments: write
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Trigger ArgoCD sync
        run: ./scripts/release.sh ${{ inputs.version }}
```

> The manual trigger ensures production deployments happen only when an operator explicitly runs the workflow. Swap in your own reusable release job or ArgoCD automation.

## Quick Start

1. **Commit workflows:**

   ```bash
   git add .github/workflows/
   git commit -m "Add core CI/CD workflows"
   git push
   ```

2. **Check Actions tab** on GitHub to see workflows running

## Troubleshooting

| Issue                | Solution                                                        |
| -------------------- | --------------------------------------------------------------- |
| Workflow not running | Verify files in `.github/workflows/` and check YAML syntax      |
| Build failing        | Confirm build commands exist and `working-directory` is correct |
| Wrong artifact path  | Update `artifact` array to match your build output              |

## What's Next?

Add optional community management workflows.

👉 **Next: [Community Workflows →](./04-community-workflows.md)**
