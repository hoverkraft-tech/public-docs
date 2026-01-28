---
sidebar_position: 3
---

# CI/CD

Generic entry point for your pipeline design. Keep these invariants regardless of platform:

1. Build two images from one Dockerfile: a `ci` (tooling) image for tests/checks and a `prod` image for runtime.
2. Run lint/test/build inside the `ci` image for parity with production dependencies.
3. Publish artifacts/images deterministically (tagged by SHA/SemVer) for downstream deploys.
4. Drive deploy/release jobs from the built artifacts, not from local state.
5. Keep Helm/chart docs/tests in sync with the published images.

Provider implementations:

- **GitHub Actions (example):** see [GitHub CI/CD](./github/).
- **Other providers:** mirror the same jobs/stages (build `ci` + `prod`, run tests in `ci`, publish artifacts, deploy with Helm). Reuse your platform’s reusable pipelines/templates for parity.

The rest of this golden path (verify, operate, hygiene) assumes you’ve implemented these invariants on your chosen CI/CD platform.
