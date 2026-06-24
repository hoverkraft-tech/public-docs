---
sidebar_position: 3
---

# CI/CD

Treat continuous integration and continuous deployment as separate contracts.
The reference application shapes use the same split:

- **Continuous Integration** proves every change in a reproducible containerized environment.
- **Continuous Deployment** promotes immutable artifacts through release and GitOps deployment workflows.

## Continuous Integration invariants

1. Build dedicated `ci` images alongside runtime images from the same Dockerfiles.
2. Run lint, test, and build inside the built `ci` images for environment parity.
3. Rebuild and publish runtime images deterministically on `main` after CI passes.
4. Validate Helm charts against the exact images produced by the pipeline.
5. Keep chart documentation generation tied to the same pipeline that publishes artifacts.

## Continuous Deployment invariants

1. Prepare release metadata continuously on pull requests and on `main`.
2. Create immutable tags before promoting anything to an environment.
3. Deploy by updating delivery state from built artifacts, not by rebuilding in deploy jobs.
4. Promote the same tagged images from preview or UAT to production.
5. Clean up temporary deployments when the branch lifecycle ends.

Provider implementations:

- **GitHub Actions overview:** see [GitHub Actions](./github/index.md).
- **GitHub Actions CI:** see [GitHub CI](./github/ci.md).
- **GitHub Actions CD:** see [GitHub CD](./github/cd.md).
- **Other providers:** preserve the same split even if the workflow syntax changes.

The rest of this golden path assumes you have both contracts in place, even if your CI/CD platform is not GitHub Actions.
