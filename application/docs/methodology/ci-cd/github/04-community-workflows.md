---
sidebar_position: 4
---

# Community Workflows

Let's add workflows that help manage your project's community. These automate common tasks like welcoming contributors and managing stale issues.

## Workflows You'll Add

1. **Semantic Pull Request** - Ensures PR titles follow a standard format
2. **Greetings** - Welcomes new contributors
3. **Stale Issues** - Manages inactive issues and PRs
4. **Need Fix to Issue** - Opens/updates issues when reviewers request changes

## Step 5: Configure Dependabot

Create `.github/dependabot.yml` (not in workflows/) to keep dependencies current without flooding maintainers with single-package pull requests. Start with a generic configuration and then align the groups with the ecosystems your project actually uses:

```yaml title=".github/dependabot.yml"
version: 2

updates:
  - package-ecosystem: "npm"
    directory: "application/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 20
    versioning-strategy: increase
    groups:
      npm-framework-dependencies:
        patterns:
          - "@example-framework/*"
          - "example-framework"
      npm-ui-dependencies:
        patterns:
          - "@example-ui/*"
          - "example-ui-*"
      npm-tooling-dependencies:
        dependency-type: "development"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 20
    groups:
      github-actions-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "devcontainers"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 20
    groups:
      devcontainers-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 20
    groups:
      docker-dependencies:
        patterns:
          - "*"
```

> **Example**: the reference repository replaces the placeholder `example-*` patterns with Astro, Tailwind, React, and Fontsource package families. Mirror that approach for whatever frameworks, build tools, or SDKs your project relies on.

**What this does:**

- Groups related updates so Dependabot opens fewer, well-structured PRs
- Keeps npm packages, GitHub Actions, Dev Containers, and Docker images current
- Provides a template you can adapt to your stack while staying consistent with the example project

permissions:
issues: write
pull-requests: write

jobs:
main:
uses: hoverkraft-tech/ci-github-common/.github/workflows/stale.yml@0.26.0

````

**What this does:**
- Runs daily at midnight
- Marks issues/PRs as stale after no activity
- Closes them if they remain inactive
- Can be triggered manually from Actions tab

## Step 4: Track Requested Changes

Create `.github/workflows/need-fix-to-issue.yml`:

```yaml title=".github/workflows/need-fix-to-issue.yml"
name: Need fix to Issue

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      manual-commit-ref:
        description: "The SHA of the commit to get the diff for"
        required: true
      manual-base-ref:
        description: "Compare against a specific base commit (optional)"
        required: false

permissions:
  contents: read
  issues: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/need-fix-to-issue.yml@0.26.0
    with:
      manual-commit-ref: ${{ inputs.manual-commit-ref }}
      manual-base-ref: ${{ inputs.manual-base-ref }}
````

**What this does:**

- Runs after each push to `main` and synchronises review feedback into GitHub issues using the Hoverkraft reusable workflow
- Provides a manual trigger so maintainers can audit past commits by supplying commit SHAs
- Ensures reviewer feedback is captured and tracked centrally

## Step 5: Configure Dependabot

Create `.github/dependabot.yml` (not in workflows/):

```yaml title=".github/dependabot.yml"
version: 2

updates:
  - package-ecosystem: "npm"
    open-pull-requests-limit: 20
    directory: "application/"
    versioning-strategy: increase
    schedule:
      interval: "weekly"
    groups:
      npm-astro-dependencies:
        patterns:
          - "@astrojs/*"
          - "@astrolib/*"
          - "astro"
          - "astro-*"
      npm-tailwind-dependencies:
        patterns:
          - "@tailwindcss/*"
          - "tailwindcss"
          - "tailwind-*"
      npm-react-dependencies:
        patterns:
          - "react"
          - "react-*"
      npm-fontsource-variable-dependencies:
        patterns:
          - "@fontsource-variable/*"
      npm-development-dependencies:
        dependency-type: "development"

  - package-ecosystem: github-actions
    open-pull-requests-limit: 20
    directory: "/"
    schedule:
      interval: weekly
    groups:
      github-actions-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "devcontainers"
    open-pull-requests-limit: 20
    directory: "/"
    schedule:
      interval: weekly
    groups:
      devcontainers-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "docker"
    open-pull-requests-limit: 20
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      docker-dependencies:
        patterns:
          - "*"
```

**What this does:**

- Groups related updates so Dependabot opens fewer, well-structured PRs
- Keeps npm packages, GitHub Actions, Dev Containers, and Docker images current
- Matches the exact grouping strategy used in the reference repository

## Commit Your Changes

Add all these files:

```bash
git add .github/workflows/semantic-pull-request.yml
git add .github/workflows/greetings.yml
git add .github/workflows/stale.yml
git add .github/workflows/need-fix-to-issue.yml
git add .github/dependabot.yml
git commit -m "Add community management workflows"
git push
```

## Test the Workflows

**Semantic PR:**

- Open a PR with title "feat: test feature"
- Should pass ✅
- Change title to "random title"
- Should fail ❌

**Greetings:**

- Have a new contributor open a PR or issue
- They'll automatically get a welcome message

**Dependabot:**

- Check the "Security" tab in your repository
- Enable Dependabot alerts if not already enabled
- Expect grouped PRs that match the package families you configured (framework, UI library, tooling, etc.)

## Optional: Customize Messages

You can customize greeting messages or stale issue behavior. Check the [ci-github-common documentation](https://hoverkraft-tech.github.io/ci-github-common/) for options.

## What's Next?

You now have a welcoming, well-maintained project! Let's set up deployment.

👉 **Next: [Deployment Setup →](./05-deployment.md)**

---

💡 **Tip**: These workflows are optional but highly recommended for open-source projects with community contributors.
