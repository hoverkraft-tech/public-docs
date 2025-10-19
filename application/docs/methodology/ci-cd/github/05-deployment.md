---
sidebar_position: 5
---

# Deployment Setup

The Hoverkraft landing-page reference uses three GitHub Actions workflows for every deployment action:

- `.github/workflows/deploy.yml` provisions review, UAT, or production environments. It can be triggered by pull-request comments or called from other workflows.
- `.github/workflows/clean-deploy.yml` removes review environments whenever a pull request closes.
- `.github/workflows/release.yml` is a manual “Release” entry point that creates a GitHub release, then reuses `deploy.yml` to promote to UAT or production.

Each workflow delegates to reusable pipelines hosted in `hoverkraft-tech/ci-github-publish` (pin to the commit SHA that corresponds to the release you validated, for example `42d50a3461a177557ca3f83b1d927d7c0783c894 # 0.11.2`). The sections below document the configuration so you can replicate it.

## Step 1: Publish container images in CI

Ensure your default-branch workflow (`main-ci.yml` in the example) builds and pushes every container image the application needs. The deployment workflows assume those images already exist.

Checklist:

- ✅ `packages: write` (or equivalent registry credentials) available to publish images.
- ✅ Deterministic tags (commit SHA, SemVer, etc.) shared across services.
- ✅ Dockerfiles and build arguments tracked in the repository, matching the `images` map used during deploy.
- ✅ Security scan reports/SBOMs produced for traceability.

## Step 2: `deploy.yml` — provisioning environments

Triggers:

- `issue_comment` (`types: [created]`) lets maintainers request deployments via comments such as `/deploy`. Comment validation happens inside the reusable workflow.
- `workflow_call` exposes a reusable interface with required inputs:
  - `tag` (string): container image tag to deploy.
  - `environment` (string): target environment (`review`, `uat`, or `production`).

Permissions mirror the example:

```yaml
permissions:
  contents: write
  issues: write
  packages: write
  pull-requests: write
  deployments: write
  actions: read
  id-token: write
```

Job definition from the example repository (single deployable `application` image by default):

```yaml
jobs:
  deploy:
    name: Deploy
    uses: hoverkraft-tech/ci-github-publish/.github/workflows/deploy-chart.yml@<commit-sha-publish>
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
    with:
      url: ${{ (inputs.environment == 'uat' && vars.UAT_URL) || (inputs.environment == 'production' && vars.PRODUCTION_URL) || vars.REVIEW_APPS_URL }}
      tag: ${{ inputs.tag }}
      environment: ${{ inputs.environment }}
      github-app-id: ${{ vars.CI_BOT_APP_ID }}
      deploy-parameters: |
        { "repository": "${{ github.repository_owner }}/argocd-app-of-apps" }
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
          { "path": "image", "image": "application" },
          { "path": "application.version", "value": "{{ tag }}" },
          { "path": "deploy.ingress.hosts[0].host", "value": "{{ url }}" }
        ]
```

What to adapt:

- Extend the `images` array for every service you build. The output name (for example `application`, `service-a`, `worker`) must match the keys you later reference in deployment workflows (`helm-set`, `chart-values`, etc.).
- Update `chart-values` paths so they align with your umbrella Helm chart.
- Define repository variables: `REVIEW_APPS_URL`, `UAT_URL`, `PRODUCTION_URL`, `CI_BOT_APP_ID`.
- Store the GitHub App private key as `CI_BOT_APP_PRIVATE_KEY` (or adjust the secret name and reference).

For multi-service repositories, add extra entries to both `images` and `chart-values`. Example:

```yaml
images: |
  [
    { "name": "application", "context": ".", "dockerfile": "./docker/application/Dockerfile", "target": "prod" },
    { "name": "service-b", "context": ".", "dockerfile": "./docker/service-b/Dockerfile", "target": "prod" }
  ]
chart-values: |
  [
    { "path": "app.image", "image": "application" },
    { "path": "serviceB.image", "image": "service-b" }
  ]
```

## Step 3: `clean-deploy.yml` — tearing down review apps

Trigger:

```yaml
on:
  pull_request_target:
    types: [closed]
```

Job definition:

```yaml
jobs:
  clean-deploy:
  uses: hoverkraft-tech/ci-github-publish/.github/workflows/clean-deploy.yml@<commit-sha-publish>
    with:
      clean-deploy-parameters: |
        { "repository": "${{ github.repository_owner }}/argocd-app-of-apps" }
      github-app-id: ${{ vars.CI_BOT_APP_ID }}
    secrets:
      github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

Running as `pull_request_target` grants the workflow repository-level permissions, which ensures cleanup works even when pull requests originate from forks.

## Step 4: `release.yml` — manual promotion

Trigger and permissions:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to deploy to"
        required: true
        type: choice
        options:
          - uat
          - production
permissions:
  checks: write
  packages: write
  issues: write
  pull-requests: write
  contents: write
  deployments: write
  actions: read
  id-token: write
```

Jobs:

1. `release`

- Uses `hoverkraft-tech/ci-github-publish/actions/release/create@<commit-sha-publish>`.
- Outputs `tag` (`steps.create-release.outputs.tag`).
- Sets `prerelease: true` when the selected environment is `uat`.

2. `deploy`
   - Depends on `release`.
   - Calls the local `deploy.yml` (`uses: ./.github/workflows/deploy.yml`).
   - Passes through `tag` and `environment` so the same deployment path runs as for review apps.
   - Uses `secrets: inherit` to forward the GitHub App key and other secrets.

Manual release procedure:

1. Open **Actions → • 🚀 Release → Run workflow**.
2. Choose `uat` or `production`.
3. Run the workflow. It creates the release and immediately deploys using `deploy.yml`.

## Step 5: Test the deployment flows

| Flow                  | Trigger                                               | Expected outcome                                                                       |
| --------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Review deployment     | Comment `/deploy` on an open PR (after CI finishes).  | The reusable deploy workflow updates the GitOps repository and reports back in the PR. |
| Review cleanup        | Merge or close the PR.                                | `clean-deploy.yml` removes the review environment using the reusable cleanup workflow. |
| Release to UAT        | Run **• 🚀 Release** with `environment = uat`.        | Creates a prerelease tag and deploys with UAT values/URL.                              |
| Release to production | Run **• 🚀 Release** with `environment = production`. | Creates a production release and deploys with production values/URL.                   |

If a run fails, open the job logs and inspect the reusable workflow steps (they surface detailed errors from `hoverkraft-tech/ci-github-publish`).

## Step 6: Branch protection (recommended)

1. Go to **Settings → Branches**.
2. Edit your default-branch rule.
3. Require CI status checks before merging.
4. (Optional) Require the release workflow to succeed before tags are published if you enforce gated production deploys.

## Troubleshooting

**Deploy workflow not triggered**

- Confirm `deploy.yml` exists and references the pinned reusable workflow commit.
- Check repository variables (`REVIEW_APPS_URL`, `UAT_URL`, `PRODUCTION_URL`, `CI_BOT_APP_ID`).
- Ensure comment text matches the expected command (`/deploy`) and the commenter has permission.

**Cleanup workflow skipped**

- Verify `clean-deploy.yml` still targets the reusable workflow at commit `42d50a3`.
- Re-issue the GitHub App private key if authentication fails.

**Release workflow failed**

- Inspect the `release` job for errors from `actions/release/create` (permissions, invalid tag, etc.).
- Check the downstream `deploy` job to see the same logs produced by `deploy.yml`.

## What's Next?

Continue with testing to confirm local and CI tooling stay aligned.

👉 **Next: [Testing Your Setup →](./06-testing.md)**

---

💡 **Tip**: Document the `/deploy` and manual release procedures in your repository’s CONTRIBUTING guide so contributors know how to request environments.
