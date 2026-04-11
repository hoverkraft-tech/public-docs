---
sidebar_position: 2
---

# Single application

Use this guide when your repository contains a single service with one Dockerfile, one application path, and one Helm chart.

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

## Main CI (`main-ci.yml`)

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
      images: '["ci","application"]'

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
