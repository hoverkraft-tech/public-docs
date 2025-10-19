---
sidebar_position: 7
---

# Best Practices

Follow these guidelines to keep your CI/CD pipeline secure, fast, and maintainable.

## Security Best Practices

### 1. Always Pin Workflow Versions

✅ **Do this:**

```yaml
uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@4f29319e02dd65152386c436e8c3136f380a0e71 # 0.28.0
```

❌ **Not this:**

```yaml
uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@main
```

**Why?** Pinning to a specific version prevents unexpected breaking changes. The workflow you tested will always run the same way.

**When to update:** Check for new tagged releases (Dependabot will open PRs for you) and bump the SHA after verifying the changelog.

### 2. Use Minimal Permissions

Each workflow should only have the permissions it needs:

```yaml
permissions:
  contents: read # Read code only
  security-events: write # Only if you need security scanning
  id-token: write # Only if you need authentication
```

**Why?** Limits damage if a workflow is compromised.

### 3. Store Secrets Securely

Never hardcode sensitive data:

```yaml
# ❌ Bad
env:
  API_KEY: "sk-1234567890abcdef"

# ✅ Good
env:
  API_KEY: ${{ secrets.API_KEY }}
```

**How to add secrets:**

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add name and value
4. Use in workflows with `${{ secrets.SECRET_NAME }}`

### 4. Use Deployment Environments

For production deployments, use environments for extra protection:

```yaml
environment:
  name: production
  url: https://your-app.com
```

**Benefits:**

- Require manual approval before deployment
- Limit who can deploy
- Track deployment history

## Performance Best Practices

### 1. Cancel Redundant Runs

Already in your workflows:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**What this does:** If you push new changes while CI is running, it cancels the old run. Saves time and GitHub Actions minutes.

### 2. Leverage Caching

The Hoverkraft workflows automatically cache dependencies. You don't need to do anything!

**What's cached:**

- Package managers (npm/pnpm/Yarn, pip, poetry, go modules, etc.)
- Docker layers (containers)
- Build artifacts (between jobs)

### 3. Run Jobs in Parallel

For multiple independent tasks, run them in parallel:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    # ... test steps

  lint:
    runs-on: ubuntu-latest
    # ... lint steps

  # These run simultaneously
```

The Hoverkraft workflows handle this automatically.

## Maintainability Best Practices

### 1. Keep Workflows Simple

Complex logic belongs in scripts, not YAML:

```yaml
# ❌ Complex
- run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      if [ "${{ github.event_name }}" == "push" ]; then
        # 50 lines of bash...
      fi
    fi

# ✅ Simple
- run: ./scripts/deploy.sh
  if: github.ref == 'refs/heads/main'
```

### 2. Document Custom Workflows

Add comments for non-obvious parts:

```yaml
jobs:
  deploy:
    # Wait for manual approval in production
    environment: production
    steps:
      - name: Deploy to S3
        # Using custom script because we need special S3 bucket policy
        run: ./scripts/custom-deploy.sh
```

### 3. Reuse Workflows

Don't copypaste workflow logic. Use the shared workflow pattern we set up:

```yaml
# This in multiple workflows
jobs:
  ci:
    uses: ./.github/workflows/__shared-ci.yml
```

### 4. Keep Dependencies Updated

Dependabot helps, but also:

- Review updates weekly
- Test before merging
- Read changelogs for breaking changes

### 5. Monitor Workflow Performance

Check regularly:

- How long workflows take
- Which steps are slow
- GitHub Actions usage (free tier: 2000 minutes/month)

Go to **Actions** → Click any workflow → See duration

## Development Workflow Best Practices

### 1. Test Locally First

Before pushing, run the same checks locally and run them inside the application container so they match CI.

```bash
make lint
make build
make ci
# or the equivalent commands for your stack (poetry run, go test, mvn verify, etc.)
```

Catches issues before CI runs (faster feedback). Note: the devcontainer is tooling-only (provides the Docker CLI, DIND helpers and editor extensions); it should not be used as the application runtime image. Use it only to launch the application container or run the compose commands above.

### 2. Use Semantic Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` bugfix
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Test changes

**Benefits:**

- Auto-generate changelogs
- Trigger semantic versioning
- Clear Git history

### 3. Keep PRs Small

Small PRs are:

- Easier to review
- Faster to test
- Less likely to have conflicts
- Easier to revert if needed

**Rule of thumb:** < 400 lines changed

### 4. Write Good PR Descriptions

Include:

- What changed and why
- How to test
- Screenshots for UI changes
- Related issues

### 5. Review CI Logs

When CI fails:

1. Click on the failed check
2. Expand the failed step
3. Read the error message
4. Fix locally and push again

Don't just re-run – fix the actual issue.

## Monitoring and Alerts

### Set Up Notifications

Get notified about workflow failures:

1. Go to your GitHub profile → **Settings**
2. Click **Notifications**
3. Enable **Actions** notifications
4. Choose email or web notifications

### Use Status Badges

Add a status badge to your readme:

```markdown
![CI](https://github.com/username/repo/workflows/Pull%20request%20-%20Continuous%20Integration/badge.svg)
```

Shows build status to everyone visiting your repository.

## Regular Maintenance Tasks

### Weekly

- ✅ Review and merge Dependabot PRs
- ✅ Check workflow run times
- ✅ Review failed workflow runs

### Monthly

- ✅ Update pinned workflow versions
- ✅ Review and close stale issues
- ✅ Check GitHub Actions usage

### Quarterly

- ✅ Review and update documentation
- ✅ Evaluate new workflow features
- ✅ Clean up unused workflows

## Common Mistakes to Avoid

### 1. ❌ Committing Secrets

Never commit API keys, passwords, or tokens. Use GitHub Secrets.

### 2. ❌ Ignoring Dependabot

Outdated dependencies = security vulnerabilities. Review updates regularly.

### 3. ❌ Not Testing CI Changes

Always test workflow changes in a branch first, not on main.

### 4. ❌ Too Many Workflows

Start simple. Add complexity only when needed.

### 5. ❌ Ignoring Failed Checks

A red X means something's wrong. Fix it before merging.

## What's Next?

You now know how to maintain a healthy CI/CD pipeline! Let's cover troubleshooting for when things go wrong.

👉 **Next: [Troubleshooting →](./08-troubleshooting.md)**

---

💡 **Tip**: Bookmark this page! Come back to it when making CI/CD changes.
