---
sidebar_position: 8
---

# Troubleshooting

Running into issues? This guide will help you diagnose and fix common problems.

## Workflow Not Running

### Symptoms

- Workflow doesn't appear in Actions tab
- No checks on pull requests
- Push to main doesn't trigger anything

### Diagnosis

**Step 1: Check file location**

```bash
ls -la .github/workflows/
```

Workflows must be in `.github/workflows/` directory (note the `.` at the start).

**Step 2: Verify YAML syntax**

Use [YAML Lint](http://www.yamllint.com/) to check for syntax errors.

Common YAML mistakes:

```yaml
# ❌ Wrong indentation
jobs:
ci:
  runs-on: ubuntu-latest

# ✅ Correct
jobs:
  ci:
    runs-on: ubuntu-latest
```

**Step 3: Check workflow triggers**

```yaml
# Only runs on push to main
on:
  push:
    branches: [main]
# Does NOT run on:
# - Pull requests
# - Pushes to other branches
# - Tags
```

### Solutions

**Solution 1: Move files to correct location**

```bash
mkdir -p .github/workflows
mv workflows/*.yml .github/workflows/
```

**Solution 2: Fix YAML syntax**

- Use 2 spaces for indentation (not tabs)
- Check quotes and brackets match
- Validate with online YAML validator

**Solution 3: Check you're pushing to the right branch**

```bash
git branch  # Should show * main or your PR branch
git push origin main  # Push to main
```

## Build Failures

### Symptoms

- Red X on CI checks
- "Process completed with exit code 1"
- Tests or builds fail in CI but work locally

### Diagnosis

**Step 1: Read the logs**

1. Go to **Actions** tab
2. Click the failed workflow run
3. Click the failed job
4. Expand the failed step
5. Read the error message

**Step 2: Check common issues**

**Missing build/test commands (example for Node.js):**

```json
// package.json must have:
{
  "scripts": {
    "build": "...",
    "test": "...",
    "lint": "..."
  }
}
```

For other ecosystems, make sure equivalent commands exist (e.g., `poetry run pytest`, `go test ./...`, `mvn verify`).

**Wrong working directory:**

```yaml
# If your app is in ./app not ./application
with:
  working-directory: app # Update this
```

**Wrong artifact path:**

```yaml
# If build outputs to ./build not ./dist
with:
  build: |
    {
      "artifact": ["application/build"]  # Update this
    }
```

### Solutions

**Solution 1: Test locally**

```bash
# Run the same commands CI runs
make prepare
make lint
make build
make test
make ci
```

If these fail locally, fix your code. If they pass locally but fail in CI, continue...

**Solution 2: Check runtime / toolchain version**

Ensure your local environment matches the version CI uses:

```bash
node --version                # Reference repo uses Node.js 20.x
python --version              # For Python projects
go version                    # For Go projects
```

Declare the requirement in your project configuration (`package.json` engines, `.python-version`, `go.mod`, etc.) so contributors use the same versions.

**Solution 3: Clean dependencies (run inside the application container)**

Open the repository in the devcontainer or enter it via your wrapper (`make shell`). The devcontainer is a tooling image (Docker CLI, DIND helpers and editor extensions) and should not be used as the application runtime. Use it to run the application container which executes the install/build/test steps. Example (uses repository `docker-compose.yml` and the `app` service):

```bash
# Run build/test inside the application container so it matches CI
docker compose -f docker-compose.yml run --rm app bash -lc "cd application && rm -rf node_modules package-lock.json && npm ci && npm run build"
```

**Solution 4: Check environment variables**

If your app needs environment variables:

```yaml
# In workflow file
env:
  NODE_ENV: production
  API_URL: ${{ secrets.API_URL }}
```

## Deployment Failures

### Symptoms

- CI passes but deployment fails
- "Artifact not found" error
- Site shows 404 after deployment

### Diagnosis

**Step 1: Check if CI created artifact**

1. Go to failed deployment workflow
2. Look at the `ci` job
3. Scroll to bottom
4. Should see "Uploading artifact"

**Step 2: Verify build output exists**

```bash
# Run build locally
make build

# Check output directory
ls -la application/dist  # or application/build
```

**Step 3: Check deployment platform settings**

- Kubernetes/ArgoCD: Ensure the ArgoCD application watches the branch or manifests you update and that the cluster is reachable
- Container registry: Confirm repository permissions, tokens, and visibility (private/public) allow pushes from CI
- Optional targets (S3, CloudFront, etc.): Verify buckets/distributions exist and credentials are valid
- Workflow triggers: For review apps, confirm the comment text matches `/deploy` and that the commenter has permission; for releases, verify the workflow_dispatch inputs reference a valid image tag

### Solutions

**Solution 1: Fix artifact or image or helm chart tag mismatch**

If you rely on build artifacts:

```yaml
build: |
  {
    "artifact": ["application/dist"]
  }
```

Ensure the same artifact name is used in any `actions/download-artifact@<latest-download-artifact-sha> # v4.x.x` step.

If you deploy containers, double-check that the image tag you push (for example `${{ github.sha }}`) matches the value ArgoCD expects in your manifests or image updater configuration.

**Solution 2: Confirm platform-specific manifests**

- Kubernetes: validate that Deployment/StatefulSet manifests reference the pushed image tag and that ConfigMaps/Secrets exist
- Helm/Kustomize: run a local `helm template` or `kustomize build` to ensure manifests render correctly before ArgoCD applies them
- Other targets (S3, CloudFront, etc.): make sure required config files (`staticwebapp.config.json`, `app.yaml`, etc.) are present in the artifact

**Solution 3: Review permissions and secrets**

```yaml
publish-image:
  permissions:
    contents: read
    packages: write
```

Add any extra scopes required by cloud providers (e.g., `id-token: write` for OIDC federation). Reissue tokens if they expired or lost scopes.

**Solution 4: Validate ArgoCD connectivity**

- Test the ArgoCD credentials locally (`argocd app sync --dry-run`)
- Check the ArgoCD UI for sync or health errors
- Confirm network policies or firewalls allow the cluster to pull images from your registry
- For comment-driven workflows, verify GitHub delivered the `issue_comment` event by checking the workflow run history

## Semantic PR Check Failing

### Symptoms

- "Semantic Pull Request" check fails
- PR title appears correct but still fails

### Diagnosis

Check if title follows format:

```
type: description

Where type is one of:
- feat, fix, docs, style, refactor
- perf, test, build, ci, chore, revert
```

### Solutions

**Common mistakes:**

```
❌ "Added new feature"
✅ "feat: add new feature"

❌ "Fix: bug in login"  (capital F)
✅ "fix: bug in login"

❌ "feature: add login"  (should be "feat")
✅ "feat: add login"

❌ "fix bug in login"  (missing colon)
✅ "fix: bug in login"
```

**Scopes are optional:**

```
✅ "feat: add login"
✅ "feat(auth): add login"  (both valid)
```

## Performance Issues

### Symptoms

- Workflows take too long
- Hitting GitHub Actions minutes limit
- Slow feedback on PRs

### Diagnosis

Check workflow duration:

1. Go to **Actions** tab
2. Note how long workflows take
3. Click into a workflow
4. Check which step is slowest

### Solutions

**Solution 1: Parallel jobs already enabled**

The Hoverkraft workflows already run tests, linting, and building in parallel. You're already optimized!

**Solution 2: Reduce test time**

```bash
# Run fewer tests in CI
npm test -- --maxWorkers=2
```

**Solution 3: Cache is working**

Hoverkraft workflows auto-cache. Verify:

1. Click into workflow
2. Look for "Cache restored" messages
3. Second runs should be faster

**Solution 4: Skip redundant work**

Already handled by:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## Permission Errors

### Symptoms

- "Resource not accessible by integration"
- "Insufficient permissions"

### Solutions

**Solution 1: Check workflow permissions**

```yaml
permissions:
  contents: read # Add needed permissions
  security-events: write
  id-token: write
```

**Solution 2: Check repository settings**

1. Go to **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Save

**Solution 3: Check branch protection**

Required checks must match workflow names exactly.

## Dependabot Issues

### Symptoms

- No Dependabot PRs
- Dependabot PRs failing CI

### Solutions

**Solution 1: Enable Dependabot**

1. Go to **Settings** → **Code security and analysis**
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"

**Solution 2: Check dependabot.yml**

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/application" # Must match your structure
    schedule:
      interval: "weekly"
```

**Solution 3: Dependabot PR failures**

Dependabot PRs must pass CI like any other PR. If they fail:

1. Check the error logs
2. Usually it's a breaking change
3. Review the update before merging

## Getting More Help

### Check the Logs

Always start here:

1. **Actions** tab
2. Click failed workflow
3. Read the error message
4. Check the full logs

### Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Hoverkraft CI/CD Common](https://hoverkraft-tech.github.io/ci-github-common/)
- [Hoverkraft CI/CD Node.js](https://hoverkraft-tech.github.io/ci-github-nodejs/)

### Ask for Help

- [Hoverkraft Discussions](https://github.com/orgs/hoverkraft-tech/discussions)
- GitHub Issues in the relevant repository
- Stack Overflow (tag: GitHub Actions)

### Debug Mode

Enable debug logs:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add `ACTIONS_STEP_DEBUG` = `true`
3. Add `ACTIONS_RUNNER_DEBUG` = `true`
4. Re-run failed workflow
5. Much more detailed logs!

## What's Next?

You now have a complete CI/CD setup and know how to fix common issues! For reference, check out the workflow documentation.

👉 **Next: [Workflow Reference →](./09-reference.md)**

---

💡 **Tip**: Most issues are simple fixes. Read the error message carefully – it usually tells you exactly what's wrong!
