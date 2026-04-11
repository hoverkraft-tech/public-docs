---
sidebar_position: 3
---

# Multi-application

Use this guide when your repository contains multiple services (e.g., `application/backend` and `application/frontend`) with one Dockerfile per service and a single umbrella Helm chart.

Reuse the same workflow shape as the single-app guide and add one image entry per service.

## Shared CI (`__shared-ci.yml`)

A minimal example with two services:

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
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}

  continuous-integration:
    strategy:
      matrix:
        service: ["backend", "frontend"]
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
        uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@<version-sha> # x.y.z
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

> Deploy/release workflows follow the same pattern: include one image per service and set `chart-values` for the umbrella chart (e.g., `services.<name>.image.*` and per-service ingress hosts) for each environment. Keep stage names `ci`/`prod` inside each Dockerfile; only the exported image names differ per service.

## Main CI (`main-ci.yml`)

List every image name in the `clean` job so stale PR tags are pruned for all services:

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
      id-token: write
      packages: write
      pull-requests: read
    with:
      images: '["backend-ci","backend","frontend-ci","frontend"]'

  ci:
    name: Continuous Integration
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
