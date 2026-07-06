---
sidebar_position: 5
---

# Multi-application

Use this page when your repository has several deployable services, one Dockerfile per service, and an umbrella chart that releases them together.

This is the primary GitHub walkthrough for the multi-application shape. Use [GitHub CI](./ci.md) and [GitHub CD](./cd.md) afterward if you want the reusable workflow contracts without the repository-specific details.

:::tip Pin copied refs with Ratchet
These workflow snippets use placeholders such as `@<version-sha>` because the
exact commit changes over time. In a real repository, replace the placeholder
with the release tag you want to track, run [Pin workflow refs with
Ratchet](../../../../best-practices/ci-cd/github-actions/pinning-with-ratchet.md),
and commit the rewritten SHA pins.
:::

## When this shape fits

- Several deployable services share one repository
- Each service has its own Dockerfile and `ci` container
- One umbrella chart wires the services together
- A single tag promotes the coordinated release through environments

## Workflow map

- CI entrypoints: `pull-request-ci.yml`, `main-ci.yml`, `__shared-ci.yml`
- CD entrypoints: `prepare-release.yml`, `release.yml`, `deploy.yml`
- Runtime artifact model: one version tag, several service images, one umbrella-chart release

## Continuous Integration

This multi-application shape uses the same three workflow entrypoints as the single-app pattern:

- `pull-request-ci.yml` for pull requests
- `main-ci.yml` for `main`
- `__shared-ci.yml` for the real CI implementation

Keep these examples strict. The checked-in shape should make concurrency, top-level `permissions: {}`, job-scoped permissions, and explicit secret wiring visible instead of relying on implicit defaults.

### Pull request CI

The pull request workflow remains a thin wrapper around the shared CI workflow:

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

### Shared CI

The shared workflow first builds one `ci` image per service, then runs CI per service in a matrix, then rebuilds the runtime images and validates the umbrella chart:

The examples below use `api`, `web`, and `worker` as neutral service names.

```yaml title=".github/workflows/__shared-ci.yml"
name: Shared Continuous Integration

on:
  workflow_call:

permissions: {}

jobs:
  linter:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/linter.yml@<version-sha> # x.y.z
    permissions:
      actions: read
      contents: read
      issues: write
      packages: read
      pull-requests: write
      security-events: write
      statuses: write
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}

  build-ci:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      id-token: write
      issues: read
      packages: write
      pull-requests: read
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
    with:
      oci-registry: ${{ vars.OCI_REGISTRY }}
      sign: false
      images: |
        [
          { "name": "api-ci", "context": ".", "dockerfile": "./docker/api/Dockerfile", "target": "ci", "platforms": ["linux/amd64"] },
          { "name": "web-ci", "context": ".", "dockerfile": "./docker/web/Dockerfile", "target": "ci", "platforms": ["linux/amd64"] },
          { "name": "worker-ci", "context": ".", "dockerfile": "./docker/worker/Dockerfile", "target": "ci", "platforms": ["linux/amd64"] }
        ]

  continuous-integration:
    name: Continuous Integration - ${{ matrix.application }}
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<version-sha> # x.y.z
    needs: build-ci
    permissions:
      contents: read
      id-token: write
      packages: read
      pull-requests: write
      security-events: write
    secrets:
      container-password: ${{ secrets.GITHUB_TOKEN }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - application: api
            image: api-ci
            path: ./applications/api
          - application: web
            image: web-ci
            path: ./applications/web
          - application: worker
            image: worker-ci
            path: ./applications/worker
    with:
      working-directory: /usr/src/app
      container: |
        {
          "image": ${{ toJSON(fromJSON(needs.build-ci.outputs.built-images)[matrix.image].images[0]) }},
          "credentials": {
            "username": ${{ toJson(github.repository_owner) }}
          },
          "pathMapping": {
            "/usr/src/app": "${{ matrix.path }}"
          }
        }

  build:
    needs: continuous-integration
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      id-token: write
      issues: read
      packages: write
      pull-requests: read
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
    with:
      oci-registry: ${{ vars.OCI_REGISTRY }}
      sign: false
      images: |
        [
          { "name": "api", "context": ".", "dockerfile": "./docker/api/Dockerfile", "target": "prod", "platforms": ["linux/amd64"] },
          { "name": "web", "context": ".", "dockerfile": "./docker/web/Dockerfile", "target": "prod", "platforms": ["linux/amd64"] },
          { "name": "worker", "context": ".", "dockerfile": "./docker/worker/Dockerfile", "target": "prod", "platforms": ["linux/amd64"] }
        ]

  tests-charts:
    name: Tests - Charts
    runs-on: ubuntu-latest
    needs: build
    permissions:
      contents: read
      packages: read
    steps:
      - uses: actions/checkout@<version-sha> # x.y.z
        with:
          persist-credentials: false

      - name: Test helm charts
        uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@<version-sha> # x.y.z
        with:
          oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
          helm-set: |
            api.image=${{ fromJSON(needs.build.outputs.built-images).api.images[0] }}
            web.image=${{ fromJSON(needs.build.outputs.built-images).web.images[0] }}
            worker.image=${{ fromJSON(needs.build.outputs.built-images).worker.images[0] }}
            global.imagePullSecrets[0].name=regcred
```

### Mainline CI

On `main`, the cleanup list must include every preview and runtime image name:

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
      images: '["api-ci","web-ci","worker-ci","api","web","worker"]'

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

## Continuous Deployment

This multi-application shape keeps the same CD workflow family:

- `prepare-release.yml`
- `release.yml`
- `deploy.yml`

Unlike the single-application shape, it does not currently define a dedicated `clean-deploy.yml` workflow.

Its `deploy.yml` already accepts `REVIEW_APPS_URL`, so the deploy contract is compatible with review environments, but the checked-in repository does not yet document the full `/deploy` plus cleanup lifecycle as a first-class workflow.

### Release preparation

```yaml title=".github/workflows/prepare-release.yml"
name: Prepare release

on: # yamllint disable-line rule:truthy
  push:
    branches: [main]
  pull_request:
    types: [opened, reopened, synchronize]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions: {}

jobs:
  release:
    uses: hoverkraft-tech/ci-github-publish/.github/workflows/prepare-release.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      pull-requests: write
    with:
      github-app-id: ${{ vars.CI_BOT_APP_ID }}
    secrets:
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

### Release and deploy

The release workflow still coordinates a single tag for the whole repository, then deploys all services together:

```yaml title=".github/workflows/release.yml"
name: Release

on: # yamllint disable-line rule:truthy
  workflow_dispatch:
    inputs:
      environment:
        description: Environment to deploy to
        required: true
        type: choice
        options:
          - uat
          - production

permissions: {}

concurrency:
  group: release-${{ github.repository }}-${{ github.ref_name }}
  cancel-in-progress: false

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

  release:
    needs: [ci]
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
    outputs:
      tag: ${{ steps.create-release.outputs.tag }}
    steps:
      - id: create-release
        uses: hoverkraft-tech/ci-github-publish/actions/release/create@<version-sha> # x.y.z
        with:
          github-token: ${{ github.token }}
          prerelease: ${{ inputs.environment == 'uat' }}

  deploy:
    name: Deploy
    needs: [release]
    uses: ./.github/workflows/deploy.yml
    permissions:
      actions: read
      contents: read
      deployments: write
      id-token: write
      issues: write
      packages: write
      pull-requests: write
    with:
      tag: ${{ needs.release.outputs.tag }}
      environment: ${{ inputs.environment }}
    secrets:
      CI_BOT_APP_PRIVATE_KEY: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

At the moment, the checked-in `release.yml` has the CI prerequisite commented out. Keep that in mind if you use this shape as the template: the intended end state is still to gate promotion on CI.

### Deploy contract

The deploy workflow promotes all runtime images together and rewrites the umbrella chart values in one GitOps transaction:

```yaml title=".github/workflows/deploy.yml"
name: Deploy

on: # yamllint disable-line rule:truthy
  issue_comment:
    types: [created]
  workflow_call:
    inputs:
      tag:
        required: true
        type: string
      environment:
        required: true
        type: string
    secrets:
      CI_BOT_APP_PRIVATE_KEY:
        required: true

permissions: {}

jobs:
  deploy:
    name: Deploy
    uses: hoverkraft-tech/ci-github-publish/.github/workflows/deploy-chart.yml@<version-sha> # x.y.z
    permissions:
      actions: read
      contents: read
      deployments: write
      id-token: write
      issues: write
      packages: write
      pull-requests: write
    with:
      url: ${{ (inputs.environment == 'uat' && vars.UAT_URL) || (inputs.environment == 'production' && vars.PRODUCTION_URL) || vars.REVIEW_APPS_URL }}
      tag: ${{ inputs.tag }}
      environment: ${{ inputs.environment }}
      github-app-client-id: ${{ vars.CI_BOT_APP_CLIENT_ID }}
      deploy-parameters: |
        { "repository": "${{ github.repository_owner}}/argocd-app-of-apps" }
      images: |
        [
          {
            "name": "api",
            "context": ".",
            "dockerfile": "./docker/api/Dockerfile",
            "target": "prod",
            "platforms": ["linux/amd64"]
          },
          {
            "name": "web",
            "context": ".",
            "dockerfile": "./docker/web/Dockerfile",
            "target": "prod",
            "platforms": ["linux/amd64"]
          },
          {
            "name": "worker",
            "context": ".",
            "dockerfile": "./docker/worker/Dockerfile",
            "target": "prod",
            "platforms": ["linux/amd64"]
          }
        ]
      chart-values: |
        [
          { "path": ".api.image", "image": "api" },
          { "path": ".web.image", "image": "web" },
          { "path": ".worker.image", "image": "worker" }
        ]
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

Use this multi-application shape when several services share one version, one chart release, and one promotion flow across environments.
