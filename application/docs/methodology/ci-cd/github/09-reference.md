---
sidebar_position: 9
---

# Workflow Reference

Quick reference for all Hoverkraft reusable workflows and actions.

## Hoverkraft CI/CD Repositories

### Common Workflows

**Repository:** [hoverkraft-tech/ci-github-common](https://github.com/hoverkraft-tech/ci-github-common)  
**Documentation:** [https://hoverkraft-tech.github.io/ci-github-common/](https://hoverkraft-tech.github.io/ci-github-common/)

Workflows for all project types:

| Workflow                    | Purpose                    | Usage                             |
| --------------------------- | -------------------------- | --------------------------------- |
| `semantic-pull-request.yml` | Validate PR titles         | Required for changelog automation |
| `greetings.yml`             | Welcome new contributors   | Improves community experience     |
| `stale.yml`                 | Manage inactive issues/PRs | Keeps project clean               |
| `need-fix-to-issue.yml`     | Track requested changes    | Ensures feedback isn't lost       |

**Example:**

```yaml
jobs:
  semantic:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/semantic-pull-request.yml@<latest-common-sha> # x.x.x
```

> Replace `<latest-common-sha> # x.x.x` with the current release you verified. The Node.js example below shows the expected format once you substitute a commit (e.g. `1d00c9eb280acbee5df4b4a2087f786e66b13d87 # 0.14.1`).

### Node.js Workflows

**Repository:** [hoverkraft-tech/ci-github-nodejs](https://github.com/hoverkraft-tech/ci-github-nodejs)  
**Documentation:** [https://hoverkraft-tech.github.io/ci-github-nodejs/](https://hoverkraft-tech.github.io/ci-github-nodejs/)

Complete CI pipeline for Node.js projects:

**What it does:**

- ✅ Install dependencies with caching
- ✅ Run linting
- ✅ Run type checking (TypeScript)
- ✅ Run tests with coverage
- ✅ Build application
- ✅ Upload build artifacts
- ✅ Security scanning

**Example:**

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<latest-nodejs-sha> # x.x.x
    with:
      working-directory: application
      build: |
        {
          "artifact": ["application/dist"]
        }
```

> Replace `<latest-nodejs-sha> # x.x.x` with the latest stable release you validated (for example `1d00c9eb280acbee5df4b4a2087f786e66b13d87 # 0.14.1`).

**Configuration options:**

| Option              | Description            | Default |
| ------------------- | ---------------------- | ------- |
| `working-directory` | Where your app code is | `"."`   |
| `build.artifact`    | Paths to upload        | `[]`    |
| `node-version`      | Node.js version        | `"20"`  |

### Container Workflows

**Repository:** [hoverkraft-tech/ci-github-container](https://github.com/hoverkraft-tech/ci-github-container)  
**Documentation:** [https://hoverkraft-tech.github.io/ci-github-container/](https://hoverkraft-tech.github.io/ci-github-container/)

For building and publishing container images:

**What it does:**

- ✅ Build Docker images
- ✅ Multi-platform builds (amd64, arm64)
- ✅ Image security scanning
- ✅ Push to registries (Docker Hub, GHCR)

**Example:**

```yaml
jobs:
  build:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<latest-container-sha> # x.x.x
    with:
      dockerfile: ./Dockerfile
      platforms: linux/amd64,linux/arm64
```

> Replace `<latest-container-sha> # x.x.x` with the specific release you verified. Inspect the repository for other reusable workflows (for example `prune-pull-requests-images-tags.yml`) and reference them the same way.

### Publishing Actions

**Repository:** [hoverkraft-tech/ci-github-publish](https://github.com/hoverkraft-tech/ci-github-publish)

Deploy to various platforms:

#### GitHub Pages

```yaml
- uses: hoverkraft-tech/ci-github-publish/actions/deploy/github-pages@<latest-pages-sha> # x.x.x
  with:
    build-path: application/dist
    build-artifact-name: build
```

> Replace `<latest-pages-sha> # x.x.x` with the release tag or commit SHA published for the GitHub Pages action.

### Docker Compose Action

**Repository:** [hoverkraft-tech/compose-action](https://github.com/hoverkraft-tech/compose-action)  
**Marketplace:** [Docker Compose Action](https://github.com/marketplace/actions/docker-compose-action)

Run services in CI for testing:

**Example:**

```yaml
- uses: hoverkraft-tech/compose-action@<latest-compose-sha> # x.x.x
  with:
    compose-file: docker-compose.test.yml
    up-flags: --build
    down-flags: --volumes

- name: Run tests against services
  run: npm test
```

**Use cases:**

- Test against databases
- Test with Redis/cache services
- Integration testing
- End-to-end testing with dependencies

## Common Patterns

### Standard Web App (Node.js + Kubernetes + ArgoCD)

```yaml
# __shared-ci.yml
name: Common Continuous Integration tasks
on:
  workflow_call:
permissions:
  contents: read
  security-events: write
  id-token: write
jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<latest-nodejs-sha> # x.x.x
    with:
      working-directory: application
      build: |
        {
          "artifact": ["application/dist"]
        }

  publish-image:
    needs: continuous-integration
    if: github.ref_name == github.event.repository.default_branch
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Log in to registry
        uses: docker/login-action@<latest-docker-login-sha> # v3.x.x
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<latest-container-sha> # x.x.x
        with:
          dockerfile: ./Dockerfile
          push: true
          image-name: ghcr.io/${{ github.repository }}:${{ github.sha }}

  update-manifests:
    needs: publish-image
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x
        with:
          repository: your-org/infra-manifests
          token: ${{ secrets.INFRA_REPO_TOKEN }}

      - name: Bump image tag
        run: |
          yq -i '.spec.template.spec.containers[0].image = "ghcr.io/${{ github.repository }}:${{ github.sha }}"' apps/your-app/deployment.yaml

      - name: Commit and push
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git commit -am "chore: deploy ${{ github.sha }}" || exit 0
          git push
```

> Swap `update-manifests` for a direct `argocd-sync` job if you trigger rollouts through the ArgoCD API instead of GitOps commits.

### App with Database Tests

```yaml
# __shared-ci.yml - Add this job
test-with-db:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

    - uses: hoverkraft-tech/compose-action@<latest-compose-sha> # x.x.x
      with:
        compose-file: docker-compose.test.yml

    - name: Run integration tests
      run: npm run test:integration
```

### On-Demand Deployment Workflow (Review App)

```yaml
name: Deploy review app

on:
  issue_comment:
    types: [created]

jobs:
  deploy:
    if: github.event.issue.pull_request && contains(github.event.comment.body, '/deploy')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
      deployments: write
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Deploy preview
        run: ./scripts/deploy-review.sh
```

### On-Demand Deployment Workflow (Release)

```yaml
name: Release to production

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Image tag"
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
      deployments: write
    steps:
      - uses: actions/checkout@<latest-checkout-sha> # v4.x.x

      - name: Sync ArgoCD
        run: ./scripts/release.sh ${{ inputs.version }}
```

> As with the CI examples, swap the placeholders for the exact SHAs or versions you validated before rolling these into production.

## Version Pinning

Always pin to specific versions for stability:

```yaml
# ✅ Reference implementation - commit SHA with release comment
uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<latest-nodejs-sha> # x.x.x

# ❌ Bad - uses branch (unpredictable)
uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@main
```

> Always substitute the placeholder with the commit SHA that corresponds to the release you evaluated before rolling it out to production.

## Checking for Updates

### Check Workflow Versions

1. Go to the repository (e.g., ci-github-nodejs)
2. Check the [Releases](https://github.com/hoverkraft-tech/ci-github-nodejs/releases) page
3. Note the latest version
4. Update your workflows if needed

### Dependabot Helps

Your `dependabot.yml` automatically checks for GitHub Actions updates:

```yaml
- package-ecosystem: "github-actions"
  directory: "/"
  schedule:
    interval: "weekly"
```

You'll get PRs when new versions are available.

## Real-World Examples

### Complete Example: Web App

- Node.js application (Astro)
- Full CI/CD setup
- Deploys container images to Kubernetes via ArgoCD
- All community workflows
- Dependabot configured

Explore the `.github/workflows/` directory for examples.

### Container Example

See [hoverkraft-tech/ci-github-container](https://github.com/hoverkraft-tech/ci-github-container) for self-testing workflows.

## External Documentation

### Official GitHub Actions

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

### Hoverkraft Documentation

- [Common Workflows](https://hoverkraft-tech.github.io/ci-github-common/)
- [Node.js Workflows](https://hoverkraft-tech.github.io/ci-github-nodejs/)
- [Container Workflows](https://hoverkraft-tech.github.io/ci-github-container/)
- [CI Dokumentor](https://hoverkraft-tech.github.io/ci-dokumentor/) - Auto-generates workflow documentation

### Community Resources

- [Awesome Actions](https://github.com/sdras/awesome-actions) - Curated list of actions
- [GitHub Community Forum](https://github.community/c/code-to-cloud/github-actions)
- [Hoverkraft Discussions](https://github.com/orgs/hoverkraft-tech/discussions)

## Quick Command Reference

### Local Testing

```bash
# Install dependencies
make prepare

# Run linter
make lint

# Build project
make build

# Run CI bundle (lint + build in the reference Makefile)
make ci

# Clean build artifacts
make clean
# (Replace with your own task runner or package scripts as needed.)
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/my-feature

# Commit with semantic message
git commit -m "feat: add new feature"

# Push and create PR
git push origin feat/my-feature
```

### Debugging Workflows

```bash
# View workflow files
ls -la .github/workflows/

# Validate YAML locally
yamllint .github/workflows/*.yml

# Check workflow syntax
act --list  # If you have 'act' installed
```

## Need More Help?

- Review the [Tutorial](./01-getting-started.md) from the beginning
- Check [Troubleshooting](./08-troubleshooting.md) for common issues
- Visit [Hoverkraft Discussions](https://github.com/orgs/hoverkraft-tech/discussions)
- Check individual workflow documentation linked above

---

🎉 **Congratulations!** You've completed the Hoverkraft CI/CD tutorial! Your project now has professional-grade automation.
