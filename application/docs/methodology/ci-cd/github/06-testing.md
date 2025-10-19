---
sidebar_position: 6
---

# Testing Your Setup

Let's verify that everything works correctly by going through a complete development cycle.

## Test Checklist

We'll test:

- ✅ Pull request workflow
- ✅ Main branch workflow
- ✅ Review app deployment (`/deploy`)
- ✅ Release workflow (manual trigger)
- ✅ Community workflows

## Test 1: Pull Request Workflow

Let's simulate a normal development workflow:

### Step 1: Create a Feature Branch

```bash
git checkout -b test-feature
```

### Step 2: Make a Change

Edit any file in your application. For example:

```bash
echo "// CI test change" >> application/service-a/src/example.ts
```

Choose a file that exists in your stack (`application/service-a/src/App.tsx`, `application/service-b/app/main.py`, etc.).

### Step 3: Commit and Push

```bash
git add .
git commit -m "feat: add test change"
git push origin test-feature
```

### Step 4: Open a Pull Request

1. Go to your repository on GitHub
2. Click **Pull requests** → **New pull request**
3. Select your `test-feature` branch
4. Click **Create pull request**

### Step 5: Watch the Workflow

1. Go to the **Actions** tab
2. You should see "Pull request - Continuous Integration" running
3. Wait for it to complete (usually 2-5 minutes)

**Expected result:** ✅ Green checkmark indicating CI passed

### Step 6: Check the PR

Back on your PR page, you should see:

- ✅ CI checks passed
- Comment from the greeting bot (if this is your first PR)

## Test 2: Review App Deployment (`/deploy`)

### Step 1: Comment on the PR

Add a new comment on the open pull request: `/deploy`

### Step 2: Watch the Review Workflow

1. Go to **Actions**
2. Locate the workflow that handles review deployments (e.g., "Deploy review app")
3. Confirm it runs with green status

### Step 3: Verify the Review Environment

1. Collect the URL from the workflow logs or bot comment
2. Ensure the review app is running the latest changes
3. Optionally test teardown if you support `/undeploy`

## Test 3: Release Workflow

### Step 1: Merge the PR

Click **Merge pull request** → **Confirm merge**

### Step 2: Run “Release” Manually

1. Navigate to the **Actions** tab
2. Select the "Release" workflow
3. Click **Run workflow**

### Step 3: Verify Deployment

1. Monitor the workflow logs for a successful ArgoCD sync
2. Open ArgoCD and confirm the application is synced and healthy
3. Verify the Kubernetes workload uses the new image (`kubectl get deploy your-app -o yaml | grep image`)
4. Hit the production endpoint to validate the change 🎉

## Test 4: Semantic PR Validation

Let's verify the semantic PR check works:

### Step 1: Create Another Branch

```bash
git checkout main
git pull
git checkout -b another-test
```

### Step 2: Make a Change and Open PR

```bash
echo "// Semantic PR check" >> application/service-a/src/example.ts
git add .
git commit -m "some random commit"
git push origin another-test
```

Open a PR with title: `random title without prefix`

### Step 3: Check the Validation

The "Semantic Pull Request" check should **fail** ❌ because the title doesn't follow the format.

### Step 4: Fix the Title

Edit the PR title to: `feat: add another test`

The check should now **pass** ✅

## Test 4: Dependabot (Optional)

Dependabot runs automatically, but you can verify it's configured:

1. Go to **Insights** → **Dependency graph** → **Dependabot**
2. You should see it's enabled
3. Within a week, you should get PRs for dependency updates

## Common Issues and Solutions

### Issue: CI Workflow Not Running

**Check:**

- Are workflow files in `.github/workflows/`?
- Is YAML syntax valid?
- Are you pushing to the correct branch?

**Solution:**

```bash
# Verify files exist
ls -la .github/workflows/

# Validate YAML (use online validator)
cat .github/workflows/pull-request-ci.yml
```

### Issue: Build Failing

**Check:**

- Do your `package.json` scripts exist?
- Does `working-directory` match your project structure?

**Solution:**

```bash
# Test locally using the same steps as your CI job
make lint
make build
make test
make ci  # runs lint + build + test consecutively (adjust if you use different targets)

# Check workflow logs
# Go to Actions tab → Click failed workflow → Click job → Expand steps
```

### Issue: Deployment Failing

**Check:**

- Did the review or release workflow run after the trigger?
- Did the CI/CD push the expected image(s), Helm chart(s) to the registry?
- Are registry/ArgoCD secrets configured correctly?

**Solution:**

- Inspect the deployment workflow logs for authentication or image errors
- Review ArgoCD application status and event logs to confirm a sync occurred

### Issue: Tests Failing Locally Work in CI

**Check:**

- Are you using the same Node version?
- Are dependencies up to date?

**Solution:**

Run the checks from the tooling container so you match the CI image exactly. Reopen the repository in the devcontainer (Visual Studio Code → **Dev Containers: Reopen in Container**) or drop into it via your wrapper (for example `make shell`). Once you are inside the container shell:

```bash
# Verify the runtime matches CI
node --version  # Should match the version in your CI (20.x in the reference project)

# Clean install within the container (adjust for your package manager/runtime)
cd application
rm -rf node_modules package-lock.json
npm ci
npm run build
```

Prefer scripted wrappers when you need to run the commands non-interactively. Important: use the application container (built from your project Dockerfile) for installs, builds and tests. The devcontainer provides the Docker client and editor integration but is not the runtime image for the application.

Example using the repository `docker-compose.yml` and the application service (which should build from your multi-stage Dockerfile and run the appropriate `dev` stage locally):

```bash
docker compose -f docker-compose.yml run --rm app bash -lc "cd application && npm ci && npm run build"
```

If you prefer to use the devcontainer to provide the Docker CLI, open the devcontainer and run the compose command from inside it. That still runs the application commands inside the application container built from your Dockerfile.

The reference repository already declares these requirements in `application/package.json` under the `engines` field. For other runtimes, mirror the same idea (e.g., Python version with `.python-version`, Go version via toolchain configuration).

> ℹ️ **Devcontainer vs. runtime**: the devcontainer (tooling image) keeps your CLIs consistent with CI. Your services still run in their own OCI containers—use the repository `Dockerfile`, `docker-compose.yml`, or Helm chart to build and run the actual application images. Avoid shipping the devcontainer image to production.

## Verify Everything Works

You should now have:

- ✅ Pull requests trigger CI automatically
- ✅ CI runs tests, lint, and build
- ✅ Failed CI prevents merging (if branch protection is enabled)
- ✅ Review app deployment works on `/deploy`
- ✅ Release workflow promotes builds when run manually
- ✅ Semantic PR validation enforces title format
- ✅ New contributors get welcome messages
- ✅ Dependabot creates update PRs

## View Workflow History

To see all your workflow runs:

1. Go to **Actions** tab
2. See list of all workflows and their status
3. Click any workflow to see detailed logs
4. Use filters to find specific runs

## What's Next?

Your CI/CD is fully working! Let's learn some best practices to keep it that way.

👉 **Next: [Best Practices →](./07-best-practices.md)**

---

💡 **Tip**: Keep the Actions tab open while developing. It's satisfying to watch those green checkmarks! ✅
