---
sidebar_position: 1
---

# Getting Started with GitHub Actions CI/CD

Set up CI/CD for your project using GitHub Actions and Hoverkraft reusable workflows. The pattern works for single applications, monorepos, and containerized services alike—adjust the working directory and build steps to match your stack.

## What You'll Build

✅ Automated testing on pull requests  
✅ Automated builds on commits  
✅ On-demand deployments (review apps via `/deploy` comments, production via manual release workflow)  
✅ Community automation (semantic PR titles, greetings, stale issues)  
✅ Security scanning via the shared CI workflow

## Prerequisites

- GitHub repository (public or private) containing your application code
- Deterministic build/test commands (Makefile targets, package scripts, or similar)
- Ability to configure workflow inputs for your stack (working directory, runtime version, artifacts)
- Basic Git/GitHub knowledge
- ~30-60 minutes

## CI/CD Overview

**Continuous Integration (CI)**: Automatically builds, lints, and checks code on every change  
**Continuous Deployment (CD)**: Deploys once you trigger it—either `/deploy` for review apps or a manual release workflow after CI succeeds

## Hoverkraft Approach

Pre-built, reusable workflows that:

- Centralise CI logic in `__shared-ci.yml` so every workflow reuses the same jobs
- Enforce best practices (version pinning, minimal permissions)
- Stay updated through Dependabot (actions, runtimes, base images)

## Tutorial Steps

1. **Project Structure** - Repository layout
2. **Core Workflows** - Essential CI/CD
3. **Community Workflows** - Optional automation
4. **Deployment** - On-demand deployment flows
5. **Testing** - Verification
6. **Best Practices** - Tips and guidelines

Follow steps in order for best results.

## Ready?

👉 **Next: [Project Structure →](./02-project-structure.md)**

---

💡 **Tip**: Implement gradually - start with core workflows, test, then expand
