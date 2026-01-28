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
```
