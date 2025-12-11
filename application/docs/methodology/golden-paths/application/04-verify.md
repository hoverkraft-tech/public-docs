---
sidebar_position: 4
---

# Verify

Confirm the repository works end-to-end before you ship. The checks below are platform-agnostic—run them locally or in whatever CI provider you use. They validate that the Docker targets, Helm chart, and pipelines all line up.

## What success looks like

- `ci` image builds once and runs lint/test/build using the same commands your pipeline uses.
- `prod` image serves the built app on port `8080` and exposes a health check the platform can probe.
- Helm chart renders with the right ingress host per environment and passes `helm lint`/tests.
- Pipelines publish tagged images/artifacts exactly once; deploy jobs consume those immutable tags.
- Review apps (or equivalent preview environments) spin up from the same images and clean up on PR close.

## Local smoke tests (portable)

Run these from the repository root; adjust paths if your layout differs.

```bash
# 1) Build the tooling image and run checks inside it
docker build -t your-app:ci --target ci -f docker/application/Dockerfile .
docker run --rm -v "$PWD:/workspace" -w /workspace/application your-app:ci npm test

# 2) Build the runtime image and smoke-test it
docker build -t your-app:prod --target prod -f docker/application/Dockerfile .
docker run --rm -p 8080:8080 your-app:prod &
curl -f http://localhost:8080/healthz || curl -f http://localhost:8080 || exit 1

# 3) Validate the chart against a tagged image
helm lint charts/application
helm template charts/application \
 --set image.repository=registry.example.com/your-app \
 --set image.tag=local-smoke \
 --set deploy.ingress.hosts[0].host=app.local.test
```

If you use a different package manager or runtime, swap the `npm test` command for your stack but keep it running inside the `ci` image.

## CI/CD verification checklist

- Build matrix: pipeline produces both `ci` and `prod` images from `docker/application/Dockerfile`; no duplicate rebuilds in later stages.
- Test parity: all lint/test/build steps run inside the `ci` image so dependency drift cannot happen.
- Artifact tagging: images/artifacts are tagged with commit SHA or SemVer and pushed to your registry once per commit.
- Deploy inputs: deploy jobs pull the already-built `prod` image tag and Helm values, not local state; releases promote tags, not branches.
- Preview environments: `/deploy` (or equivalent trigger) deploys a review app per PR and removes it automatically when the PR closes.

## Functional checks after deploy

- Health and routing: `GET /healthz` (or your chosen probe) returns 200; main route responds over HTTPS with correct host.
- Config and secrets: runtime configuration comes from environment/secret stores, not baked into the image; toggling env vars does not require rebuilds.
- Observability: logs stream to your collector; basic metrics or uptime checks are wired to the ingress host.
- Rollback: you can redeploy the previous immutable tag via the same pipeline without rebuilding anything.

## Promotion gates

For UAT/production, enforce at least:

- Image tag is immutable and matches the commit that passed CI.
- Helm chart values for `image.repository`, `image.tag`, and ingress host are explicit per environment.
- Manual approval or automated tests guard the promotion step; no direct `main` deployments from a developer laptop.

When these checks pass, proceed to hygiene and ongoing maintenance.
