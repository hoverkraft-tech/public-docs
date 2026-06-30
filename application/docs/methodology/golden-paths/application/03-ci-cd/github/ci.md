---
sidebar_position: 2
---

# GitHub CI

Use this guide for the continuous integration side of the pipeline.
In the reference application shapes, CI is handled by three workflow entrypoints:

- `pull-request-ci.yml` for pull requests targeting `main`
- `main-ci.yml` for pushes to `main`
- `__shared-ci.yml` for the actual reusable CI implementation

Use [Single application](./single-app.md) for the one-image shape and [Multi-application](./multi-app.md) for the multi-service umbrella-chart shape. This page only describes the shared CI contract.

:::tip Pin copied refs with Ratchet
These workflow snippets use placeholders such as `@<version-sha>` because the
exact commit changes over time. In a real repository, replace the placeholder
with the release tag you want to track, run [Pin workflow refs with
Ratchet](../../../../best-practices/ci-cd/github-actions/pinning-with-ratchet.md),
and commit the rewritten SHA pins.

For lines shaped like `uses: repo/.github/workflows/file.yml@<version-sha> # x.y.z`,
replace the whole placeholder ref with a real release tag first, for example
`@0.37.1` or `@v7.0.0`, before running Ratchet.
:::

The core pattern is stable across both supported application shapes:

1. Run repository-wide linting first.
2. Build dedicated `ci` images before running application checks.
3. Run checks inside those built `ci` images.
4. Publish runtime images only from the trusted mainline flow.
5. Validate Helm charts against the produced images.

## Pull request CI

Pull requests stay thin and delegate everything to the shared CI workflow:

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
      issues: write
      packages: write
      pull-requests: write
      security-events: write
      statuses: write
```

Keep the pull request workflow as a thin wrapper. The deciding logic belongs in `__shared-ci.yml` so the PR and mainline paths cannot drift.

## Mainline CI

The `main` workflow adds two responsibilities on top of pull request validation:

1. Prune stale preview image tags.
2. Generate Helm docs after CI passes.

That shape is used in both application shapes:

```yaml title=".github/workflows/main-ci.yml"
name: Main - Continuous Integration

on: # yamllint disable-line rule:truthy
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions: {}

jobs:
  clean:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/prune-pull-requests-images-tags.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      packages: write
      pull-requests: read
    with:
      images: '["ci","application"]'

  ci:
    name: Continuous Integration
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      actions: read
      checks: write
      contents: read
      id-token: write
      issues: write
      packages: write
      pull-requests: write
      security-events: write
      statuses: write

  helm-docs:
    needs: ci
    if: github.event_name != 'schedule'
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@<version-sha> # x.y.z
        with:
          persist-credentials: false

      - uses: hoverkraft-tech/ci-github-container/actions/helm/generate-docs@<version-sha> # x.y.z
        with:
          working-directory: ./charts
          github-app-client-id: ${{ vars.CI_BOT_APP_CLIENT_ID }}
          github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

For multi-application repositories, the `clean` job must list every preview and runtime image name.

## Shape-specific implementations

- Use [Single application](./single-app.md) when one chart release consumes one runtime image.
- Use [Multi-application](./multi-app.md) when several services share one release and one umbrella chart.
