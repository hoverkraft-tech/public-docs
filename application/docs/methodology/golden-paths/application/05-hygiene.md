---
sidebar_position: 5
---

# Hygiene & Maintenance

Keep the repository healthy after the first deploy. The practices below are platform-agnostic—swap in your scheduler (cron, CI, GitOps) and security stack as needed.

## Operating principles

- Single source of truth: Dockerfile, Helm chart, and pipeline definitions live in-repo and stay in sync.
- Immutable artifacts: deploy only tagged images built by CI; never rebuild on deploy.
- Small, frequent changes: automate dependency bumps and base image refreshes; release often to reduce drift.
- Fast feedback: keep lint/test/security checks quick so developers run them locally and in CI.

## Recurring tasks

Weekly (or faster):

- Dependency updates (app + tooling): run your updater (e.g., Dependabot/Renovate) against application, CI, and chart packages; merge with green CI.
- Vulnerability scans: scan the `ci` and `prod` images plus package lockfiles; patch high/critical findings immediately.
- CI health: prune failing/slow jobs, update cache keys, and verify tests still run inside the `ci` image.

Monthly:

- Base image refresh: rebuild `ci`/`prod` targets on the latest distro/runtime patch levels; cut a release using the refreshed tags.
- Chart lint/docs: run `helm lint` and `helm template` with current values for each environment; regenerate any chart docs you publish.
- Access review: confirm secret scopes, registry permissions, and deploy keys remain least-privilege.

Quarterly:

- Disaster/rollback drills: redeploy the previous immutable tag through the same pipeline; confirm it rolls back cleanly.
- Config review: ensure environment variables and secrets are injected at deploy time—not baked into images—and are documented per environment.

## Automate the boring parts

- Dependency bots: enable automated PRs for app dependencies, Docker base images, and GitHub Actions/CI templates (or your platform’s equivalents).
- Security scanning: run SCA + container scans on PRs and main; fail on high/critical issues or add an explicit waiver process.
- Formatting and linting: enforce via CI and pre-commit hooks that run inside the `ci` image to avoid toolchain drift.
- Preview cleanup: ensure review/preview environments delete on PR close to reduce spend.

## Checklists before merging

- CI green using the `ci` image; no skipped tests without an issue link.
- Image tags are immutable and pushed once; manifests use pinned base images (no `latest`).
- Helm values reference the built tag and the correct ingress host per environment.
- Security gates pass (SCA, container scan, secret scan); no untracked waivers.
- Docs updated when behavior, endpoints, or operational runbooks change.

## Periodic scripts (portable examples)

Run from the repository root; replace tools with your stack equivalents.

```bash
# Refresh and scan the tooling image
docker build -t your-app:ci --target ci -f docker/application/Dockerfile .
docker scan your-app:ci || true  # swap with your scanner

# Lint chart with pinned image tag
helm lint charts/application
helm template charts/application \
 --set image.repository=registry.example.com/your-app \
 --set image.tag=$(git rev-parse --short HEAD) \
 --set deploy.ingress.hosts[0].host=uat.example.com >/tmp/chart.yaml
```

Adapt the commands to your runtime (Python, Go, Java) but keep the pattern: build once, test inside the `ci` image, and lint the chart with explicit image tags.

## Runbook hygiene

- Keep a `docs/` or `runbooks/` section that covers deploy, rollback, on-call checks, and common failures.
- Track SLOs/alerts near the service docs so ops and dev share the same expectations.
- Note required secrets and where they are sourced; rotate on a schedule and after personnel changes.

Stay disciplined: small, automated maintenance keeps the golden path reliable long after launch.
