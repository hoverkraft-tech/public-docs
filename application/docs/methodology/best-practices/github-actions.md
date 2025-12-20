---
sidebar_position: 2
---

# GitHub Actions & Workflow Practices

Opinionated guardrails for reliable, secure, and maintainable workflows across Hoverkraft projects.

## Design for reuse and clarity

- Prefer reusable workflows (`workflow_call`) for common flows (lint, build, release); see the [`ci-github-*` workflow catalog](../../../projects/ci-github-common/) and the [application golden path](../golden-paths/application/ci-cd/github/index.md#shared-ci-__shared-ciyml).
- Keep jobs single-responsibility (lint, test, package, deploy) and gate merges on the smallest necessary set of required checks.
- Use matrices for platform/runtime coverage and [`needs`] to make dependencies explicit.

## Security by default

- Pin actions by commit SHA and scope the `permissions` block to the minimum needed per job.
- Prefer OIDC + short-lived cloud credentials over long-lived secrets; avoid passing tokens into containers unless required.
- Run `npm ci`/`pip install --no-cache-dir` inside build steps instead of reusing host caches that may contain untrusted files.

## Performance and determinism

- Cache dependencies and build outputs via `actions/cache` with explicit keys; reuse the cache hints from the [Docker build workflows](../../../projects/ci-github-container/github/workflows/docker-build-images#workflow-call-inputs) when building images.
- Avoid duplicated work: promote artifacts between jobs (e.g., build once, test with the artifact) and use concurrency controls (`concurrency` group with `cancel-in-progress: true`) for branches.
- Keep workflow inputs typed and validated; prefer small composite actions for repeated snippets instead of inlining large bash blocks.

## Observability and recovery

- Always upload failing logs, test reports, and artifacts needed for triage. The [release workflows](../golden-paths/docker-base-images/04-release-publishing.md#release-workflow-overview) show the pattern for publishing SBOMs and provenance alongside images.
- Emit clear step names and link back to the documentation page for the workflow being used so contributors know the source of truth.
