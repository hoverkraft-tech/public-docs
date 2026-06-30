---
sidebar_position: 4
---

# Single application

Use this page when your repository has one application, one Dockerfile, one runtime image, and one Helm chart.

This is the primary GitHub walkthrough for the single-application shape. Use [GitHub CI](./ci.md) and [GitHub CD](./cd.md) afterward if you want the reusable workflow contracts without the repository-specific details.

:::tip Pin copied refs with Ratchet
These workflow snippets use placeholders such as `@<version-sha>` because the
exact commit changes over time. In a real repository, replace the placeholder
with the release tag you want to track, run [Pin workflow refs with
Ratchet](../../../../best-practices/ci-cd/github-actions/pinning-with-ratchet.md),
and commit the rewritten SHA pins.
:::

## When this shape fits

- One deployable service per repository
- One Dockerfile with `ci` and `prod` targets
- One chart release consuming one runtime image
- One release tag per repository version

## Workflow map

- CI entrypoints: `pull-request-ci.yml`, `main-ci.yml`, `__shared-ci.yml`
- CD entrypoints: `prepare-release.yml`, `release.yml`, `deploy.yml`, `clean-deploy.yml`
- Runtime artifact model: one version tag, one application image, one chart release

## Continuous Integration

This single-application shape uses three workflow entrypoints for CI:

- `pull-request-ci.yml` for pull requests
- `main-ci.yml` for `main`
- `__shared-ci.yml` for the actual CI logic

Keep these examples strict. The checked-in shape should make concurrency, top-level `permissions: {}`, job-scoped permissions, and explicit secret wiring visible instead of relying on implicit defaults.

### Pull request CI

The pull request workflow stays intentionally thin and delegates all logic to the shared CI workflow:

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

The shared CI workflow builds both images first, then runs checks inside the built `ci` image, then validates the chart against the produced runtime image:

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

  build:
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
          {
            "name": "ci",
            "context": ".",
            "dockerfile": "./docker/application/Dockerfile",
            "build-args": { "APP_PATH": "./application/" },
            "target": "ci",
            "platforms": ["linux/amd64"]
          },
          {
            "name": "application",
            "context": ".",
            "dockerfile": "./docker/application/Dockerfile",
            "build-args": { "APP_PATH": "./application/" },
            "target": "prod",
            "platforms": ["linux/amd64"]
          }
        ]

  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<version-sha> # x.y.z
    needs: build
    permissions:
      contents: read
      id-token: write
      packages: read
      pull-requests: write
      security-events: write
    secrets:
      container-password: ${{ secrets.GITHUB_TOKEN }}
    with:
      working-directory: /usr/src/app
      container: |
        {
          "image": ${{ toJSON(fromJSON(needs.build.outputs.built-images).ci.images[0]) }},
          "credentials": {
            "username": ${{ toJson(github.repository_owner) }}
          },
          "pathMapping": {
            "/usr/src/app": "./application"
          }
        }
      code-ql: ""
      dependency-review: false

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
            image.registry=${{ fromJSON(needs.build.outputs.built-images).application.registry }}
            image.repository=${{ fromJSON(needs.build.outputs.built-images).application.repository }}
            image.tag=${{ fromJSON(needs.build.outputs.built-images).application.tags[0] }}
            image.digest=${{ fromJSON(needs.build.outputs.built-images).application.digest }}
```

### Mainline CI

On `main`, the repository adds preview-image cleanup and Helm doc generation after CI succeeds:

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

This single-application shape uses four workflow entrypoints for CD:

- `prepare-release.yml` to keep release metadata ready
- `release.yml` to create the immutable tag
- `deploy.yml` to update GitOps delivery state
- `clean-deploy.yml` to remove review apps when pull requests close

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

`release.yml` runs CI, creates the tag, then calls `deploy.yml` for UAT or production:

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

### Deploy contract

The deploy workflow promotes one runtime image into one chart release and writes the desired state to `argocd-app-of-apps`:

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
            "name": "application",
            "context": ".",
            "dockerfile": "./docker/application/Dockerfile",
            "build-args": { "APP_PATH": "./application/" },
            "target": "prod",
            "platforms": ["linux/amd64"]
          }
        ]
      chart-values: |
        [
          { "path": ".image", "image": "application" },
          { "path": ".application.version", "value": "{{ tag }}" },
          { "path": "deploy.ingress.hosts[0].host", "value": "{{ url }}" }
        ]
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

### Review app workflow

This single-application shape supports a complete review-app flow in CD:

1. CI publishes pull-request image tags for the branch.
2. A `/deploy` comment triggers `deploy.yml` via `issue_comment`.
3. The workflow targets the preview host derived from `REVIEW_APPS_URL`.
4. Argo CD receives the desired chart update in `argocd-app-of-apps`.
5. `clean-deploy.yml` removes the review app when the pull request closes.

The review-app trigger is part of the checked-in deploy workflow shape:

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
```

### Review app cleanup

```yaml title=".github/workflows/clean-deploy.yml"
name: Clean deploy

on: # yamllint disable-line rule:truthy
  pull_request_target:
    types: [closed]
  issue_comment:
    types: [created]

permissions: {}

jobs:
  clean-deploy:
    uses: hoverkraft-tech/ci-github-publish/.github/workflows/clean-deploy.yml@<version-sha> # x.y.z
    permissions:
      actions: read
      deployments: write
      issues: write
      pull-requests: write
    with:
      clean-deploy-parameters: |
        { "repository": "${{ github.repository_owner}}/argocd-app-of-apps" }
      github-app-client-id: ${{ vars.CI_BOT_APP_CLIENT_ID }}
    secrets:
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

Use this single-application shape when one repository version corresponds to one chart release and one deployable application image.
