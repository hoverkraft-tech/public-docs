---
sidebar_position: 1
---

# CI/CD

This guide provides Hoverkraft's opinionated approach to continuous integration and delivery: fast feedback, predictable releases, and safe deployments.

## What is CI/CD?

Continuous Integration (CI) keeps mainline code healthy by running automated checks on every change. Continuous Delivery (CD) ensures every build is deployable, and Continuous Deployment goes one step further by releasing automatically.

**Sources:**

- [Google SRE - Continuous Integration](https://sre.google/workbook/deploying-cloud-native-applications/)
- [Continuous Delivery - Jez Humble](https://continuousdelivery.com/)
- [Martin Fowler - Continuous Delivery](https://martinfowler.com/bliki/ContinuousDelivery.html)

## Why CI/CD Matters

Poor CI/CD leads to:

- **Slow feedback**: Bugs discovered late in the cycle
- **Risky releases**: Large, brittle deployments
- **Context switching**: Waiting on manual checks and approvals
- **Operational strain**: Unreliable rollbacks and firefighting

Great CI/CD enables:

- **Fast feedback loops**: Developers learn quickly if changes are safe
- **Small, frequent releases**: Lower risk and easier recovery
- **Consistent quality**: Automated checks as default
- **Operational resilience**: Safe rollouts with observability

**Sources:**

- [Accelerate - Nicole Forsgren](https://itrevolution.com/product/accelerate/)
- [Google SRE - Canary Deployments](https://sre.google/workbook/canarying-releases/)

## Guide Structure

This guide is organized into core areas of CI/CD practice:

- **[GitHub Actions & Workflow Practices](./github-actions/)** - Platform patterns and reusable workflow guidance
- **[CI/CD & Release Management](./cicd-release-management.md)** - Pipeline design, releases, and deployment strategy

## Need the concrete workflow files?

The pages in this section explain the principles and guardrails.
If you need the actual Hoverkraft workflow shape for an application repository, use the golden-path GitHub Actions guides:

- **[GitHub Actions overview](../../golden-paths/application/03-ci-cd/github/index.md)** - entrypoint for the application CI/CD shape
- **[GitHub CI](../../golden-paths/application/03-ci-cd/github/ci.md)** - shared CI contract
- **[GitHub CD](../../golden-paths/application/03-ci-cd/github/cd.md)** - shared CD contract
- **[Multi-application](../../golden-paths/application/03-ci-cd/github/multi-app.md)** - concrete shape for repositories with several services and one umbrella chart

---
