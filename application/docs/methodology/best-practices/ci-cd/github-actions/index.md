---
sidebar_position: 1
---

# GitHub Actions & Workflow Practices

> _Every workflow is production code._

## Purpose

GitHub Actions workflows must be predictable, reusable, and secure by default. They
often receive privileged repository tokens, secrets, deployment credentials, and
artifact publishing rights, so they deserve the same review discipline as
application code.

Use this guide when creating or reviewing workflows in Hoverkraft repositories.

## Workflow Design Defaults

✅ **DO**:

- Give each workflow a clear name and a focused responsibility.
- Use explicit triggers for the smallest useful scope, such as target branches,
  paths, or manual `workflow_dispatch` inputs.
- Add `concurrency` for workflows that deploy, publish artifacts, or mutate shared
  infrastructure.
- Split large workflows into clear jobs such as lint, test, build, scan, package,
  and deploy.
- Prefer reusable workflows with `workflow_call` for repeated organization
  patterns.
- Pass data between jobs through documented outputs and artifacts.

❌ **DON'T**:

- Mix unrelated release, deployment, and maintenance tasks in one workflow.
- Trigger expensive jobs on every repository event without path or branch filters.
- Let deployment workflows run concurrently against the same environment.
- Duplicate complex CI logic across many repositories when a reusable workflow can
  own it.

## Token Permissions & Secrets

Start from least privilege and grant write access only where a job proves it needs
it.

```yaml
permissions:
  contents: read

jobs:
  publish:
    permissions:
      contents: read
      packages: write
```

✅ **DO**:

- Set `permissions` explicitly at the workflow level.
- Override permissions at the job level for publishing, commenting, deployments, or
  release creation.
- Use GitHub secrets or environment secrets for sensitive values.
- Prefer environment protection rules for production secrets and deployments.
- Use OpenID Connect for cloud credentials instead of long-lived access keys.
- Rotate exposed secrets and delete logs if a secret is printed unredacted.

❌ **DON'T**:

- Rely on broad default `GITHUB_TOKEN` permissions.
- Store credentials directly in workflow files, scripts, artifacts, or caches.
- Store structured blobs as a single secret when separate values can be masked more
  reliably.
- Reuse production secrets in pull request validation jobs.

## Action & Dependency Supply Chain

Treat Actions dependencies as executable third-party code. A compromised action can
read the repository checkout, inspect runner files, access available secrets, and
use granted token permissions.

✅ **DO**:

- Pin third-party actions and reusable workflows to full-length commit SHAs.
- Keep a readable version comment next to pinned SHAs when useful for maintenance.
- Review the source, ownership, release history, and permissions of new actions.
- Keep Actions dependencies up to date through reviewed pull requests.
- Enable Dependabot updates for GitHub Actions dependencies.
- Use dependency review, code scanning, secret scanning, and Scorecards where
  available.
- Verify CI dependency updates before they run in privileged workflows.

❌ **DON'T**:

- Use mutable references such as `@main`, `@latest`, or unreviewed moving tags for
  third-party actions.
- Add an action only because it is convenient; prefer simple shell commands or
  trusted maintained actions when the risk is lower.
- Let dependency update automation merge without CI, review, and policy checks.
- Ignore transitive tooling installed by setup scripts, package managers, or
  downloaded binaries.

## Pull Request & Untrusted Input Safety

Pull requests, issue titles, branch names, commit messages, and many GitHub context
values are user-controlled input. Never place them directly inside shell scripts.

✅ **DO**:

- Prefer actions that receive untrusted values through `with` inputs.
- If inline shell is necessary, pass expressions through environment variables and
  quote shell variables.
- Be especially careful with `pull_request_target`; use it only when the workflow
  does not execute untrusted code from the pull request.
- Keep PR validation jobs read-only unless a write permission is absolutely
  required.
- Require code owner review for workflow changes under `.github/workflows/`.

❌ **DON'T**:

- Interpolate pull request titles, branch names, or issue bodies directly into
  `run` scripts.
- Checkout and execute untrusted pull request code in privileged workflows.
- Give forked pull request jobs access to deployment secrets.

## Runners & Execution Environment

Runner choice defines the trust boundary for a workflow.

✅ **DO**:

- Use GitHub-hosted runners for public repositories unless a specific requirement
  justifies self-hosting.
- Treat self-hosted runners as production infrastructure: patch them, isolate them,
  restrict network access, and monitor them.
- Use runner groups and environment rules to separate sensitive workloads.
- Clean workspaces and avoid sharing mutable state across unrelated jobs.
- Review runner image software bills of materials when build provenance matters.

❌ **DON'T**:

- Run untrusted public pull request code on persistent self-hosted runners.
- Mount sensitive host paths, Docker sockets, or broad credentials into jobs
  without a documented need.
- Assume caches or artifacts are trustworthy without validating their producer.

## Performance & Reliability

Fast feedback keeps teams shipping safely. Optimize workflows without weakening
security controls.

✅ **DO**:

- Run lint and fast tests before slower build, package, or deployment stages.
- Use matrix jobs for supported language versions, operating systems, or platforms.
- Cache package manager data with keys based on lockfiles.
- Upload build artifacts once and reuse them in later jobs or deployment stages.
- Use `needs` to make dependencies between jobs explicit.
- Set timeouts for long-running jobs and steps.

❌ **DON'T**:

- Cache secrets, credentials, generated tokens, or unreviewed executable content.
- Rebuild the same artifact separately for test and deployment when provenance
  matters.
- Hide flaky tests behind retries without tracking and fixing the failure mode.

## Review Checklist

Before merging a workflow change:

- [ ] Triggers are scoped to the intended branches, paths, and events.
- [ ] `GITHUB_TOKEN` permissions are explicitly least-privilege.
- [ ] Secrets are scoped to the jobs and environments that need them.
- [ ] Third-party actions are pinned, reviewed, and maintained.
- [ ] Untrusted inputs are not interpolated directly into shell scripts.
- [ ] `pull_request_target` is avoided or justified with safe checkout behavior.
- [ ] Deployment jobs use environment protections and concurrency.
- [ ] Caches cannot persist secrets or unreviewed executable artifacts.
- [ ] Workflow changes have code owner review where configured.

## Sources

- [GitHub Actions CI/CD best practices - GitHub Awesome Copilot](https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md)
- [GitHub Docs - Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [CNCF - Securing GitHub Actions CI dependencies recipe card](https://www.cncf.io/blog/2026/05/04/securing-github-actions-ci-dependencies-recipe-card/)
