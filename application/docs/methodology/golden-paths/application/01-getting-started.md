---
sidebar_position: 1
---

# Getting Started

Spin up a new application repository that matches the current Hoverkraft application stack. Examples show a Node/Astro app, but the pattern works for any containerized application—swap the build commands and Dockerfile base image for your stack. CI/CD and VCS tooling are platform-agnostic: use the same repository layout, Dockerfile targets, and Helm flow, and plug in your preferred CI provider and VCS host.

## What You'll Build

- Containerized Astro/Node application with separate `ci` (tooling) and `prod` images
- GitHub Actions that run CI inside the `ci` image for perfect parity
- Helm chart docs/tests tied to the images built-in CI
- Manual release workflow that tags and deploys to UAT/production
- `/deploy` comment hook for review apps and automatic cleanup on PR close

## Prerequisites

- Source repository (any VCS host)
- Docker + Docker Compose available locally, or Visual Studio Code Dev Containers/Codespaces
- Container base image for your stack (examples use Node 24; pick what matches your runtime)
- Helm 3 for local chart checks (optional, CI covers it)
  -### CI/CD settings (configure on your platform)

Provide these as pipeline variables/secrets on your CI/CD platform (names can stay the same across providers):

| Name              | Type     | Purpose                                                                 |
| ----------------- | -------- | ----------------------------------------------------------------------- |
| `OCI_REGISTRY`    | Variable | Target registry (example: `ghcr.io`) used by build and deploy workflows |
| `REVIEW_APPS_URL` | Variable | Base URL for review apps (used in deploy workflow)                      |
| `UAT_URL`         | Variable | UAT hostname for the chart ingress                                      |
| `PRODUCTION_URL`  | Variable | Production hostname for the chart ingress                               |

## Architecture Overview

```txt
Pull request → Build ci+app images → Run CI inside ci image → Helm chart tests
         ↓
      Merge to main → Prune PR tags → CI → Helm docs
         ↓
Manual release (env choice) → Tag → Deploy via Helm/Argo
         ↓
/deploy comment → Review app deploy → Cleaned on PR close
```

Ready? Move on to scaffolding the repository.
