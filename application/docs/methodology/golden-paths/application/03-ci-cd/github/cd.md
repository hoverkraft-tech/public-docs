---
sidebar_position: 3
---

# GitHub CD

Use this guide for the continuous deployment side of the pipeline.
In the reference application shapes, CD is handled by four workflow entrypoints:

- `prepare-release.yml` to keep release metadata ready
- `release.yml` to create the immutable tag to promote
- `deploy.yml` to push environment changes through GitOps
- `clean-deploy.yml` to remove preview environments when they are no longer needed

Use [Single application](./single-app.md) for the one-image shape and [Multi-application](./multi-app.md) for the multi-service umbrella-chart shape. This page only describes the shared CD contract.

The contract is the same in both repository shapes:

1. Prepare release metadata continuously.
2. Create the tag once per promotion event.
3. Reuse the same tagged images for every environment.
4. Update delivery state in the GitOps repository instead of rebuilding images.
5. Clean up temporary environments automatically.

## Review app workflow

Review apps are part of the CD contract when you expose preview environments for pull requests.
The reference flow is:

1. Pull request CI builds previewable images and publishes pull-request tags.
2. A `/deploy` comment on the pull request triggers `deploy.yml` through `issue_comment`.
3. The deploy workflow resolves the preview host from `REVIEW_APPS_URL` and writes the desired state to the GitOps repository.
4. The preview environment stays tied to the pull request lifecycle.
5. `clean-deploy.yml` removes the preview deployment when the pull request closes.

The generic deploy entrypoint already exposes the hook that makes this possible:

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
```

Use `REVIEW_APPS_URL` for preview environments and reserve `UAT_URL` and `PRODUCTION_URL` for promoted environments.

## Release preparation

Both reference application shapes run release preparation on pull requests and on `main`:

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
```

Keep this workflow separate from deployment. Its job is to calculate and surface release intent early, not to publish or promote anything.

## Release and promotion

Promotion is a manual `workflow_dispatch` that chooses the target environment and then runs release plus deploy in sequence:

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

jobs:
  ci:
    name: Continuous Integration
    uses: ./.github/workflows/__shared-ci.yml

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
          prerelease: ${{ inputs.environment == 'uat' }}

  deploy:
    name: Deploy
    needs: [release]
    uses: ./.github/workflows/deploy.yml
    with:
      tag: ${{ needs.release.outputs.tag }}
      environment: ${{ inputs.environment }}
    secrets:
      CI_BOT_APP_PRIVATE_KEY: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

The intended end state is to enforce the CI prerequisite in `release.yml` before promotion.
If a repository still has that prerequisite commented out while its release workflow is being aligned, treat that as temporary drift from the contract rather than the model to copy.

## Preview environments and cleanup

Some repositories also include `clean-deploy.yml` to remove preview environments when a pull request closes:

```yaml title=".github/workflows/clean-deploy.yml"
name: Clean deploy

on: # yamllint disable-line rule:truthy
  pull_request:
    types: [closed]

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

## Shape-specific implementations

- Use [Single application](./single-app.md) when one application release maps to one chart release and one runtime image.
- Use [Multi-application](./multi-app.md) when several services move through environments as one coordinated release.
