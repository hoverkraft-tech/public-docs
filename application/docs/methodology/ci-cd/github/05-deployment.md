---
sidebar_position: 5
---

# Deployment Setup

Let's configure the two deployment entry points used today:

1. Review environments handled by `.github/workflows/deploy.yml` (provision) and `.github/workflows/clean-deploy.yml` (tear down)
2. Manual releases handled by `.github/workflows/release.yml`

The main CI pipeline is still responsible for building and publishing container images; deployments happen only when an operator asks for them.

## Step 1: Publish an Image During CI

Ensure `main-ci.yml` pushes the full set of container images your application needs whenever the default branch succeeds. Many Hoverkraft projects publish multiple images (for example, API + worker + web) or per-architecture variants. Drive the matrix from the workflow inputs or a manifest file so CI builds each image deterministically. Double-check:

- ✅ Registry credentials and permissions are available (`packages: write`)
- ✅ Image tags are deterministic (SHA or SemVer) across every image
- ✅ Security scan artifacts are uploaded for traceability
- ✅ Every image definition (Dockerfile, build args) is recorded in version control

This step makes all runtime artifacts available so review apps and releases can consume them later.

## Step 2: Understand the Review App Workflows (`deploy.yml` and `clean-deploy.yml`)

Hoverkraft ships two complementary workflows for review environments. Both assume your deployment artifacts are defined through an umbrella Helm chart that aggregates every service in the stack, even when the code lives in a single monorepo.

- `deploy.yml` provisions a review environment when maintainers comment `/deploy` on a pull request. It validates the commenter, bails out if the comment is not `/deploy`, and then calls the reusable deployment logic that targets your Kubernetes namespace (or equivalent platform). The job pulls every container image produced by the PR CI run (web, API, workers, per-architecture variants) and renders the umbrella Helm chart describing the full stack before invoking the deployment script.
- `clean-deploy.yml` tears down the review environment either when the PR closes/merges or when someone comments `/undeploy`. The workflow mirrors the same validation logic, then invokes the cleanup script to remove the namespace/resources so clusters stay tidy.

Key bits from `deploy.yml` worth adapting to your project:

```yaml
name: Deploy review app

on:
  issue_comment:
    types: [created]

permissions:
  contents: read
  packages: read
  deployments: write

jobs:
  deploy:
    if: github.event.issue.pull_request && contains(github.event.comment.body, '/deploy')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Prepare image tag
        id: image
        run: echo "tag=ghcr.io/${{ github.repository }}:${{ github.event.issue.number }}-${{ github.run_id }}" >> "$GITHUB_OUTPUT"

      - name: Deploy review environment
        run: ./scripts/deploy-review.sh "${{ steps.image.outputs.tag }}"
```

> Replace the final step with your actual deployment command or reusable workflow. The important parts are the `/deploy` comment gate and the limited permissions.

`clean-deploy.yml` follows the same structure but reacts to `/undeploy` and `pull_request` close events:

```yaml
on:
  issue_comment:
    types: [created]
  pull_request:
    types: [closed]

jobs:
  cleanup:
    if: >-
      (github.event.issue.pull_request && contains(github.event.comment.body, '/undeploy')) ||
      github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<latest-checkout-sha>
      - name: Destroy review environment
        run: ./scripts/destroy-review.sh "${{ github.event.issue.number || github.event.pull_request.number }}"
```

> Adapt the destroy script to your platform (delete namespace, remove ingress, clean storage). Keeping the destroy logic in a dedicated workflow ensures review environments never linger after merges.

### Tips

- Validate comment authorship before deploying (e.g., allow maintainers only)
- Post a follow-up comment with the review URL using the GitHub API
- Add a companion `/destroy` command if you support manual cleanup

## Step 3: Configure the Release Workflow (`release.yml`)

Production deployments stay behind a manual approval. `release.yml` exposes a `workflow_dispatch` entry point so operators can choose when to promote. During that run, the workflow renders the umbrella Helm chart (for example `charts/umbrella/Chart.yaml`) that wires every container in the stack together—even for monorepos or microservice deployments—so ArgoCD can apply a fully consistent manifest.

```yaml
name: Release to production

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Image tag or git ref to deploy"
        required: true

permissions:
  contents: read
  packages: read
  deployments: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Render umbrella chart with promoted images
        run: |
          helm dependency update charts/umbrella
          helm template charts/umbrella \
            --values envs/production/values.yaml \
            --set images.api.tag=${{ inputs.version }} \
            --set images.web.tag=${{ inputs.version }} \
            --set images.worker.tag=${{ inputs.version }} \
            > manifests.yaml

      - name: Sync ArgoCD
        env:
          ARGOCD_SERVER: ${{ secrets.ARGOCD_SERVER }}
          ARGOCD_AUTH_TOKEN: ${{ secrets.ARGOCD_AUTH_TOKEN }}
        run: ./scripts/release.sh manifests.yaml
```

> The release script typically updates manifests (GitOps commit) or calls `argocd app sync`. Keep the secret handling inside the script or use a reusable workflow if you have one. Adjust the `helm template` command (or your preferred renderer) so it references every container image and architecture variant your chart manages.

## Step 4: Test Each Trigger

1. **Review App**
   - Open a pull request
   - Comment `/deploy`
   - Watch the `deploy-review` workflow to ensure it provisions the environment
   - Verify the temporary URL loads the expected version

2. **Release**
   - Run the “Release to production” workflow from the **Actions** tab

- Provide the tag (or manifest file) produced by `publish-image` so the workflow can set every service image version
- Confirm ArgoCD syncs and each deployment/statefulset in the stack now references the promoted image tags from the umbrella chart

## Step 5: Branch Protection (Recommended)

Even with manual deployments, enforce CI success before merges:

1. Go to **Settings** → **Branches**
2. Edit the `main` branch rule
3. Require status checks (`Pull request - Continuous Integration`, `Internal - Main - Continuous Integration`)
4. Optionally require review-app or release workflows if they run frequently
5. Save changes

## Troubleshooting Deployment

**"Review app workflow never runs"**

- Confirm the workflow file lives under `.github/workflows/`
- Ensure the comment text is exactly `/deploy` (case sensitive by default)
- Check that the commenter has permission; add `if` conditions to allow only maintainers

**"Release workflow cannot authenticate"**

- Verify ArgoCD secrets (`ARGOCD_SERVER`, `ARGOCD_AUTH_TOKEN`) or other cloud credentials
- Regenerate tokens if they expired or lost scopes

**"Deployment uses the wrong image"**

- Make sure you pass the same tag from `publish-image`
- For review apps, namespace the tag by PR number to avoid collisions
- For releases, store promoted tags in a manifest repository or annotate the release for traceability

**"Environment stays stale"**

- Check ArgoCD application health and sync status
- Ensure cleanup workflows run when PRs close or releases finish

## What's Next?

Review how these triggers behave end-to-end.

👉 **Next: [Testing Your Setup →](./06-testing.md)**

---

💡 **Tip**: Document the `/deploy` and release procedures in your CONTRIBUTING guide so contributors know how to request environments.
