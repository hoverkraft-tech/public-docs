---
sidebar_position: 4
---

# Workflows setup

This page wires the repository to the Hoverkraft reusable workflows using the current production-grade wrapper pattern. The important rule is simple: keep your repository workflows thin, pin released SHAs, and centralize shared CI logic in one internal wrapper.

## Workflow overview

You'll create these workflow files:

| Workflow                    | Purpose                                                 | Trigger                                  |
| --------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| `__shared-ci.yml`           | Internal repository contract for CI                     | `workflow_call`                          |
| `pull-request-ci.yml`       | PR validation and preview image builds                  | `pull_request`                           |
| `main-ci.yml`               | Main branch CI and PR tag cleanup                       | `push` on `main`                         |
| `semantic-pull-request.yml` | Conventional commit title validation                    | `pull_request_target`                    |
| `stale.yml`                 | Housekeeping for inactive issues and pull requests      | `schedule`                               |
| `need-fix-to-issue.yml`     | Turn follow-up work into issues                         | `push` on `main` and `workflow_dispatch` |
| `greetings.yml`             | Standard greeting messages for issues and pull requests | `issues` and `pull_request_target`       |

`prepare-release.yml` and `release.yml` are covered on the next page because they deserve separate operational guidance.

## Step 1: Create the shared CI workflow

This is the only internal workflow you need for CI. It pins the reusable `continuous-integration.yml` workflow and injects repository-specific configuration.

Create `.github/workflows/__shared-ci.yml`:

```yaml
name: Shared - Continuous Integration for common tasks

on:
  workflow_call:
    outputs:
      built-images:
        description: "The name of built images"
        value: ${{ jobs.continuous-integration.outputs.built-images }}
    secrets:
      oci-registry-password:
        description: "Password or GitHub token (packages:read and packages:write scopes) used to log against the OCI registry."
        required: true

permissions: {}

jobs:
  continuous-integration:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/continuous-integration.yml@<docker-base-images-sha> # x.y.z
    permissions:
      actions: read
      contents: read
      id-token: write
      issues: write
      packages: write
      pull-requests: write
      security-events: write
      statuses: write
    with:
      oci-registry-username: ${{ github.repository_owner }}
      oci-registry: ${{ vars.OCI_REGISTRY }}
      platforms: '["linux/amd64"]'
    secrets:
      oci-registry-password: ${{ secrets.oci-registry-password }}
```

### Why this is the right anchor

- It is the only place where you pin the Hoverkraft CI workflow SHA
- It keeps registry setup out of every public workflow
- It exposes `built-images` if you later want repository-specific follow-up jobs

### Recommended inputs

- `oci-registry`: set from `vars.OCI_REGISTRY` even when the value is `ghcr.io`
- `platforms`: start with one platform unless you already need multi-architecture builds
- `test-image-tag`: keep the default `latest`, or pin the shared `testcontainers-node` runner tag if you need repeatable historical runs
- `oci-registry-password`: pass `GITHUB_TOKEN` for same-owner GHCR, or a dedicated registry credential when the built-in token is not enough

## Step 2: Create the pull request CI workflow

This workflow is a thin public entrypoint that delegates everything to `__shared-ci.yml`.

Create `.github/workflows/pull-request-ci.yml`:

```yaml
name: Pull request - Continuous Integration

on:
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
      contents: read
      id-token: write
      issues: write
      packages: write
      pull-requests: write
      security-events: write
      statuses: write
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
```

On pull requests, the reusable CI workflow will:

- Lint the repository
- Build the images affected by the current diff
- Push preview tags to the configured registry
- Run `.test.js` suites for built images when present
- Publish test reports and build summaries back to the pull request when supported

## Step 3: Create the main CI workflow

`main-ci.yml` reuses the same shared workflow, then prunes preview tags created for merged pull requests.

Create `.github/workflows/main-ci.yml`:

```yaml
name: Main - Continuous Integration

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions: {}

jobs:
  # jscpd:ignore-start
  ci:
    name: Continuous Integration
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      actions: read
      contents: read
      id-token: write
      issues: write
      packages: write
      pull-requests: write
      security-events: write
      statuses: write
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
  # jscpd:ignore-end

  clean:
    permissions:
      contents: read
      packages: write
      pull-requests: read
    needs: ci
    uses: hoverkraft-tech/docker-base-images/.github/workflows/prune-pull-requests-images-tags.yml@<docker-base-images-sha> # x.y.z
```

## Step 4: Create the semantic PR workflow

Use the `pull_request_target` trigger and the current `ci-github-common` workflow contract. This matches the production repository and gives the workflow enough permission to update the pull request when needed.

Create `.github/workflows/semantic-pull-request.yml`:

```yaml
name: Pull Request - Semantic Lint

on:
  pull_request_target:
    types:
      - opened
      - edited
      - synchronize

permissions: {}

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/semantic-pull-request.yml@<ci-github-common-sha> # x.y.z
    permissions:
      contents: write
      pull-requests: write
```

### Valid PR title prefixes

PR titles must start with one of these prefixes:

- `feat:` - New features
- `fix:` - bugfixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test changes
- `build:` - Build tool changes
- `ci:` - CI configuration changes
- `chore:` - Maintenance tasks
- `revert:` - Reverts

Example: `feat: add nodejs-22 base image`

## Step 5: Add repository hygiene workflows

These workflows are not required to build images, but they are part of the production implementation and keep repository operations tidy.

### `stale.yml`

```yaml
---
name: Mark stale issues and pull requests

on: # yamllint disable-line rule:truthy
  schedule:
    - cron: "30 1 * * *"

permissions: {}

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/stale.yml@<ci-github-common-sha> # x.y.z
    permissions:
      issues: write
      pull-requests: write
```

### `need-fix-to-issue.yml`

The current production pattern no longer triggers this from a label event. It runs on `main` or by manual dispatch so the diff can be analyzed after merge.

```yaml
---
name: Need fix to Issue

on: # yamllint disable-line rule:truthy
  push:
    branches:
      - main
  workflow_dispatch:
    # checkov:skip=CKV_GHA_7: required
    inputs:
      manual-commit-ref:
        description: "The SHA of the commit to get the diff for"
        required: true
      manual-base-ref:
        description: |
          By default, the commit entered above is compared to the one directly before it;
          to go back further, enter an earlier SHA here
        required: false

permissions: {}

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/need-fix-to-issue.yml@<ci-github-common-sha> # x.y.z
    permissions:
      contents: read
      issues: write
    with:
      manual-commit-ref: ${{ inputs.manual-commit-ref }}
      manual-base-ref: ${{ inputs.manual-base-ref }}
```

### `greetings.yml`

```yaml
name: Greetings

on:
  issues:
    types: [opened]
  pull_request_target:
    branches: [main]

permissions: {}

jobs:
  greetings:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/greetings.yml@<ci-github-common-sha> # x.y.z
    permissions:
      contents: read
      issues: write
      pull-requests: write
```

## Pin Workflow Versions

Every external workflow must be pinned to a released commit SHA:

```yaml
uses: hoverkraft-tech/docker-base-images/.github/workflows/continuous-integration.yml@<docker-base-images-sha> # x.y.z
uses: hoverkraft-tech/ci-github-common/.github/workflows/semantic-pull-request.yml@<ci-github-common-sha> # x.y.z
```

Do not leave `@main` in documentation examples or production workflows.

## Workflow Summary

Your `.github/workflows/` directory should now look like this:

```txt
.github/
└── workflows/
    ├── __shared-ci.yml
    ├── greetings.yml
    ├── main-ci.yml
    ├── need-fix-to-issue.yml
    ├── prepare-release.yml
    ├── pull-request-ci.yml
    ├── release.yml
    ├── semantic-pull-request.yml
    └── stale.yml
```

The release workflows are created on the next page, but they should be present before the repository is considered production-ready.

## Verification

Create a small pull request that changes one Dockerfile or image readme, then verify:

- `pull-request-ci.yml` runs and pushes preview tags
- `semantic-pull-request.yml` validates the PR title
- `main-ci.yml` runs after merge
- The cleanup job removes stale pull-request preview tags

## Troubleshooting

### Workflow Not Running

- Check that Actions are enabled in repository settings
- Verify workflow file syntax with a YAML linter
- Ensure files are in `.github/workflows/`

### Permission Denied

- Verify `Read and write permissions` is enabled in `Settings -> Actions -> General`
- Check the `permissions` block in both your wrapper and the reusable workflow call

### Images Not Found

- Ensure `images/` exists
- Verify each image has a `Dockerfile`
- Check that directory names don't contain invalid characters

### Preview Images Cannot Be Pushed

- Verify `vars.OCI_REGISTRY` points to the intended registry host
- Verify the job has `packages: write` and that `GITHUB_TOKEN` can publish to your target registry
- If that still fails, switch `oci-registry-password` to a dedicated registry credential
- Check the `packages: write` and `id-token: write` permissions in both the wrapper and reusable workflow call

## Ready?

Continue with **[Release and Publishing](./04-release-publishing.md)**.

Keep the repository workflows boring. If you need custom logic, add it around the shared wrapper instead of forking the reusable workflows immediately.
