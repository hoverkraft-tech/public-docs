---
sidebar_position: 1
---

# GitHub CI/CD

This is the GitHub Actions implementation of the pipeline. If you use another CI/CD platform, mirror the same structure: build `ci` and runtime images, run tests inside the `ci` image, and drive deploy/release jobs with the built artifacts. The defaults below use the Node.js reusable workflow; if you ship another stack, swap `hoverkraft-tech/ci-github-nodejs` for the appropriate reusable workflow while keeping the same calling pattern—or translate the jobs into your platform's templates. Replace `<version-sha>` / `x.y.z` with your pinned commit and released version. For multi-application repositories (e.g., `application/backend`, `application/frontend`), keep one Dockerfile per service and pass a separate `APP_PATH`/image entry per service while reusing the same workflow shape.

## Prerequisites

- Create a GitHub App for your organization with permissions to read/write contents, deployments, issues, pull requests, and `id-token` usage (for OIDC).
- Store the app ID in variable `CI_BOT_APP_ID` and the private key in secret `CI_BOT_APP_PRIVATE_KEY`; install the app on the repository so workflows can authenticate.
- Pin every reusable workflow and action to a released commit SHA (never `@main`). Use the latest release SHA from the repositories’ Releases page or `git ls-remote https://github.com/repo/action.git refs/tags/<version>` and record the exact commit in your workflows, annotating the `uses:` line with the human version (e.g., `@<sha> # v0.30.3`).

## Shared CI (`__shared-ci.yml`)

```yaml title=".github/workflows/__shared-ci.yml"
name: Shared - Continuous Integration for common tasks

on:
  workflow_call:

permissions: {}

jobs:
  linter:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/linter.yml@<version-sha> # x.y.z
    permissions:
      actions: read
      contents: read
      statuses: write
      security-events: write

  build:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      packages: write
      issues: read
      pull-requests: read
      id-token: write
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
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}

  continuous-integration:
    # Swap this workflow for your stack if not Node.js
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<version-sha> # x.y.z
    needs: build
    permissions:
      contents: read
      id-token: write
      pull-requests: write
      security-events: write
      packages: read
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
    secrets:
      container-password: ${{ secrets.GITHUB_TOKEN }}

  tests-charts:
    name: Tests - Charts
    runs-on: ubuntu-latest
    needs: build
    permissions:
      contents: read
      packages: read
    steps:
      - name: Test helm charts
        uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@<version-sha> # x.y.z
        with:
          helm-set: |
            image.registry=${{ fromJSON(needs.build.outputs.built-images).application.registry }}
            image.repository=${{ fromJSON(needs.build.outputs.built-images).application.repository }}
            image.tag=${{ fromJSON(needs.build.outputs.built-images).application.tags[0] }}
            image.digest=${{ fromJSON(needs.build.outputs.built-images).application.digest }}
          oci-registry: ${{ vars.OCI_REGISTRY }}
          oci-registry-password: ${{ github.token }}
```

> Keep the image names (`ci`, `application`) and the `APP_PATH` consistent with your Dockerfile.

## Multi-application repositories

For repositories with multiple services (e.g., `application/backend` and `application/frontend`) and a single umbrella chart, reuse the same workflow shape and add one image entry per service. A minimal example with two services:

```yaml
jobs:
  build:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<version-sha>
    permissions:
      contents: read
      packages: write
      id-token: write
    with:
      oci-registry: ${{ vars.OCI_REGISTRY }}
      sign: false
      images: |
        [
          {"name": "backend-ci", "context": ".", "dockerfile": "./docker/backend/Dockerfile", "build-args": {"APP_PATH": "./application/backend/"}, "target": "ci", "platforms": ["linux/amd64"]},
          {"name": "backend", "context": ".", "dockerfile": "./docker/backend/Dockerfile", "build-args": {"APP_PATH": "./application/backend/"}, "target": "prod", "platforms": ["linux/amd64"]},
          {"name": "frontend-ci", "context": ".", "dockerfile": "./docker/frontend/Dockerfile", "build-args": {"APP_PATH": "./application/frontend/"}, "target": "ci", "platforms": ["linux/amd64"]},
          {"name": "frontend", "context": ".", "dockerfile": "./docker/frontend/Dockerfile", "build-args": {"APP_PATH": "./application/frontend/"}, "target": "prod", "platforms": ["linux/amd64"]}
        ]

  continuous-integration:
    strategy:
      matrix:
        service: ["backend", "frontend"]
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<version-sha>
    needs: build
    permissions:
      contents: read
      id-token: write
      pull-requests: write
      security-events: write
      packages: read
    with:
      working-directory: /usr/src/app
      container: |
        {
          "image": ${{ toJSON(fromJSON(needs.build.outputs.built-images)[format('{0}-ci', matrix.service)].images[0]) }},
          "credentials": { "username": ${{ toJson(github.repository_owner) }} },
          "pathMapping": { "/usr/src/app": format("./application/{0}", matrix.service) }
        }
      code-ql: ""
      dependency-review: false
    secrets:
      container-password: ${{ secrets.GITHUB_TOKEN }}

  tests-charts:
    runs-on: ubuntu-latest
    needs: build
    permissions:
      contents: read
      packages: read
    steps:
      - name: Test helm chart
        uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@<version-sha>
        with:
          chart-path: ./charts/application
          helm-set: |
            services.backend.image.registry=${{ fromJSON(needs.build.outputs.built-images).backend.registry }}
            services.backend.image.repository=${{ fromJSON(needs.build.outputs.built-images).backend.repository }}
            services.backend.image.tag=${{ fromJSON(needs.build.outputs.built-images).backend.tags[0] }}
            services.backend.image.digest=${{ fromJSON(needs.build.outputs.built-images).backend.digest }}
            services.frontend.image.registry=${{ fromJSON(needs.build.outputs.built-images).frontend.registry }}
            services.frontend.image.repository=${{ fromJSON(needs.build.outputs.built-images).frontend.repository }}
            services.frontend.image.tag=${{ fromJSON(needs.build.outputs.built-images).frontend.tags[0] }}
            services.frontend.image.digest=${{ fromJSON(needs.build.outputs.built-images).frontend.digest }}
          oci-registry: ${{ vars.OCI_REGISTRY }}
          oci-registry-password: ${{ github.token }}
```

Deploy/release workflows follow the same pattern: include one image per service and set `chart-values` for the umbrella chart (e.g., `services.<name>.image.*` and per-service ingress hosts) for each environment. Keep stage names `ci`/`prod` inside each Dockerfile; only the exported image names differ per service.

## Pull requests (`pull-request-ci.yml`)

```yaml title=".github/workflows/pull-request-ci.yml"
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
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      actions: read
      checks: write
      contents: read
      id-token: write
      issues: read
      packages: write
      pull-requests: write
      security-events: write
      statuses: write
    secrets: inherit
```

## Main branch (`main-ci.yml`)

```yaml title=".github/workflows/main-ci.yml"
name: Main - Continuous Integration

on:
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
      id-token: write
      packages: write
      pull-requests: read
    with:
      images: '["ci","application"]'

  ci:
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      actions: read
      checks: write
      contents: read
      id-token: write
      issues: read
      packages: write
      pull-requests: write
      security-events: write
      statuses: write
    secrets: inherit

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
          github-app-id: ${{ vars.CI_BOT_APP_ID }}
          github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

## Release and deployment

Add three workflows to mirror the release process:

- `prepare-release.yml`: creates release PRs
- `release.yml`: manual dispatch, creates tag and triggers deploy
- `deploy.yml`: reusable deploy called by release or `/deploy`
- `clean-deploy.yml`: removes review app deployments when PRs close

```yaml title=".github/workflows/prepare-release.yml"
name: "Prepare release"

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, reopened, synchronize]

permissions: {}

jobs:
  release:
    uses: hoverkraft-tech/ci-github-publish/.github/workflows/prepare-release.yml@<version-sha> # x.y.z
    permissions:
      contents: read
      id-token: write
      pull-requests: write
    with:
      github-app-id: ${{ vars.CI_BOT_APP_ID }}
    secrets:
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

```yaml title=".github/workflows/release.yml"
name: "• 🚀 Release"

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to deploy to"
        required: true
        type: choice
        options: [uat, production]

permissions: {}

jobs:
  ci:
    uses: ./.github/workflows/__shared-ci.yml
    permissions:
      actions: read
      checks: write
      contents: read
      id-token: write
      issues: read
      packages: write
      pull-requests: write
      security-events: write
      statuses: write

  release:
    needs: [ci]
    runs-on: ubuntu-latest
    permissions:
      contents: write
    outputs:
      tag: ${{ steps.create-release.outputs.tag }}
    steps:
      - id: create-release
        uses: hoverkraft-tech/ci-github-publish/actions/release/create@<version-sha> # x.y.z
        with:
          prerelease: ${{ inputs.environment == 'uat' }}

  deploy:
    needs: [release]
    uses: ./.github/workflows/deploy.yml
    permissions:
      actions: read
      contents: write
      deployments: write
      id-token: write
      issues: write
      packages: write
      pull-requests: write
    with:
      tag: ${{ needs.release.outputs.tag }}
      environment: ${{ inputs.environment }}
    secrets: inherit
```

```yaml title=".github/workflows/deploy.yml"
name: Deploy

on:
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

permissions: {}

jobs:
  deploy:
    uses: hoverkraft-tech/ci-github-publish/.github/workflows/deploy-chart.yml@<version-sha> # x.y.z
    permissions:
      actions: read
      contents: write
      deployments: write
      id-token: write
      issues: write
      packages: write
      pull-requests: write
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
    with:
      url: ${{ (inputs.environment == 'uat' && vars.UAT_URL) || (inputs.environment == 'production' && vars.PRODUCTION_URL) || vars.REVIEW_APPS_URL }}
      tag: ${{ inputs.tag }}
      environment: ${{ inputs.environment }}
      github-app-id: ${{ vars.CI_BOT_APP_ID }}
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
```

```yaml title=".github/workflows/clean-deploy.yml"
name: "Clean deploy"

on:
  pull_request_target:
    types: [closed]

permissions: {}

jobs:
  clean-deploy:
    uses: hoverkraft-tech/ci-github-publish/.github/workflows/clean-deploy.yml@<version-sha> # x.y.z
    permissions:
      actions: read
      contents: write
      deployments: write
      id-token: write
      issues: write
      packages: write
      pull-requests: write
    with:
      clean-deploy-parameters: |
        { "repository": "${{ github.repository_owner}}/argocd-app-of-apps" }
      github-app-id: ${{ vars.CI_BOT_APP_ID }}
    secrets:
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

## Optional community workflows

Add the following if you want the same hygiene baseline:

- `semantic-pull-request.yml` (title enforcement)
- `greetings.yml` (welcome messages)
- `stale.yml` (auto-mark stale issues)
- `need-fix-to-issue.yml` (link fixes to issues)

## Pin Workflow Versions

For production use, pin workflow versions to specific commits:

```yaml
uses: hoverkraft-tech/ci-github-publish/.github/workflows/clean-deploy.yml@<version-sha> # x.y.z
```

To find the latest release SHA:

1. Go to actions / workflows releases:

- [hoverkraft-tech/ci-github-common](https://github.com/hoverkraft-tech/ci-github-common/releases)
- [hoverkraft-tech/ci-github-container](https://github.com/hoverkraft-tech/ci-github-container/releases)
- [hoverkraft-tech/ci-github-nodejs](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
- [hoverkraft-tech/ci-github-publish](https://github.com/hoverkraft-tech/ci-github-publish/releases)

2. Find the commit SHA for the version you want
3. Replace `@<version-sha> # x.y.z`
