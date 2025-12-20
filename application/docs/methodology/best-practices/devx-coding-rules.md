---
sidebar_position: 1
---

# DevX Coding Rules

Shared commit, branch, and pull request habits keep Hoverkraft repositories releasable and automation-friendly.

## Conventional commits as the contract

- Use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `build:`, `ci:`).
- Enforce the convention at PR time with the [`semantic-pull-request` workflow](../../../projects/ci-github-common/github/workflows/semantic-pull-request) or the workflow validation steps from the [Docker base images golden path](../golden-paths/docker-base-images/03-workflows-setup.md#workflow-overview).
- Keep PR titles aligned with the conventional prefix to feed release automation and change logs.

## Atomic, reviewable changes

- Prefer **one change per pull request**: new feature, bug fix, refactor, or documentation update—avoid mixing concerns.
- Keep PRs small and scoped so automated checks (lint, tests, previews) finish quickly and reviewers can focus on signal.
- Update or add tests alongside code changes; if a behavior changes, document it in the PR body.

## Semantic-release friendly history

- Semantic version bumps flow from commit intent (`feat` → minor, `fix` → patch, `!` or `BREAKING CHANGE` → major). See the release walkthrough in the [Docker base images golden path](../golden-paths/docker-base-images/04-release-publishing.md#release-workflow-overview).
- Tag releases from CI, not locally. Let automation publish release notes to keep provenance and SBOMs consistent.
- Avoid squashing after approval if it would merge unrelated scopes—prefer merge strategies that preserve the meaningful prefixes used by release automation.
