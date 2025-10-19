---
sidebar_position: 4
---

# Community Workflows

Optional workflows help you keep community interactions organised without touching application code. Add the ones that match your team's needs and pin every reusable workflow to a tested commit.

## Semantic Pull Request Titles

Create `.github/workflows/semantic-pull-request.yml` to enforce Conventional Commit titles:

```yaml title=".github/workflows/semantic-pull-request.yml"
name: Semantic Pull Request

on:
  pull_request_target:
    types: [opened, edited, synchronize]

permissions:
  pull-requests: write

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/semantic-pull-request.yml@<commit-sha-common>
```

- The reusable workflow comments on pull requests that fail the title check.
- Replace `<commit-sha-common>` with the commit you validated (for example the tag SHA for release `0.26.0`).

## Greet New Contributors

Create `.github/workflows/greetings.yml` to welcome first-time contributors:

```yaml title=".github/workflows/greetings.yml"
name: Greetings

on:
  pull_request_target:
    types: [opened]
  issues:
    types: [opened]

permissions:
  issues: write
  pull-requests: write

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/greetings.yml@<commit-sha-common>
    with:
      issue-message: "Thanks for opening your first issue!"
      pr-message: "Thanks for contributing! A maintainer will review your pull request soon."
```

Adjust the messages to match your tone of voice.

## Triage Stale Issues and Pull Requests

Create `.github/workflows/stale.yml` to mark inactive threads:

```yaml title=".github/workflows/stale.yml"
name: Stale issues and PRs

on:
  schedule:
    - cron: "0 1 * * *" # Daily at 01:00 UTC
  workflow_dispatch:

permissions:
  issues: write
  pull-requests: write

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/stale.yml@<commit-sha-common>
    with:
      days-before-stale: 30
      days-before-close: 7
      stale-issue-message: |
        This issue has been automatically marked as stale because it has not had
        recent activity. Please update if this is still relevant.
      stale-pr-message: |
        This pull request has been automatically marked as stale. Remove the
        stale label or push new commits to keep it open.
```

Tune timings, labels, and messages to your process.

## Track Requested Changes

Convert "changes requested" reviews into actionable issues with `.github/workflows/need-fix-to-issue.yml`:

```yaml title=".github/workflows/need-fix-to-issue.yml"
name: Need fix to issue

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      manual-commit-ref:
        description: "SHA to inspect when running manually"
        required: true
      manual-base-ref:
        description: "Optional base commit"
        required: false

permissions:
  contents: read
  issues: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  main:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/need-fix-to-issue.yml@<commit-sha-common>
    with:
      manual-commit-ref: ${{ inputs.manual-commit-ref }}
      manual-base-ref: ${{ inputs.manual-base-ref }}
```

- Automatically opens or updates issues when reviews request changes.
- Manual trigger allows auditing past commits.

## Keep Dependencies Current (Dependabot)

Create `.github/dependabot.yml` to group updates by ecosystem. Start with placeholders and replace the patterns with the package families you actually use:

```yaml title=".github/dependabot.yml"
version: 2

updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 20
    groups:
      gha-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "devcontainers"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 20
    groups:
      devcontainer-dependencies:
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

  - package-ecosystem: "npm"
    directory: "application/service-a/"
    schedule:
      interval: "weekly"
    versioning-strategy: increase
    groups:
      app-framework:
        patterns:
          - "@your-framework/*"
          - "your-framework"
      app-tooling:
        dependency-type: "development"

  - package-ecosystem: "pip"
    directory: "application/service-b/"
    schedule:
      interval: "weekly"
    groups:
      python-runtime:
        patterns:
          - "your-python-framework"
          - "your-analytics-library"
      python-tooling:
        dependency-type: "development"
```

- Duplicate the last two blocks for every package manager your services rely on (Gradle, Cargo, Go modules, etc.).
- Dependabot groups updates so you handle one PR per package family instead of dozens.

## Commit and Test

```bash
git add .github/workflows/semantic-pull-request.yml
git add .github/workflows/greetings.yml
git add .github/workflows/stale.yml
git add .github/workflows/need-fix-to-issue.yml
git add .github/dependabot.yml
git commit -m "Add community management workflows"
git push
```

After merging, validate that:

- The semantic PR workflow blocks non-conforming titles.
- First-time contributors receive greeting comments.
- Stale issues gain labels or close according to your configuration.
- Dependabot PRs show grouped updates that match your ecosystems.

👉 **Next: [Deployment Setup →](./05-deployment.md)**

---

💡 **Tip**: Review these workflows quarterly—adjust timing, labels, and grouping as your community scales.
