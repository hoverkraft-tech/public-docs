---
sidebar_position: 4
---

# Helm Chart Practices

Patterns for reliable, upgrade-friendly charts that stay in sync with built images.

## Structure and values hygiene

- Keep a single chart per deployable service; for multi-service repos, use an umbrella chart plus per-service subcharts as in the [application golden path scaffold](../golden-paths/application/02-repo-scaffold.md#helm-chart).
- Treat `values.yaml` as defaults and keep environment overlays small; prefer typed inputs with `values.schema.json` to fail fast on unknown keys.
- Version charts with the same cadence as application releases; surface the image tag (digest when possible) in values to make rollbacks deterministic.

## Templates and security

- Keep templates minimal and parameterized—avoid hard-coded hostnames, storage classes, or secret names.
- Run containers as non-root, set resource requests/limits, and enable liveness/readiness probes. Mirror the container security posture defined in your Dockerfile.
- Keep ingress, network policy, and service account definitions optional but documented with sensible defaults.

## CI/CD alignment

- Render and lint charts in CI (`helm lint`, `helm template`) before publishing. The [verification checklist](../golden-paths/application/04-verify.md#what-success-looks-like) shows the validation flow used in golden paths.
- Publish charts from CI alongside the image build that produced the referenced tag; avoid manual `helm package` from workstations.
- Document deployment workflows (e.g., Argo CD dispatch in [ci-github-publish](../../../projects/ci-github-publish/github/workflows/deploy-chart)) and link them from the chart README to avoid drift.
