---
sidebar_position: 3
---

# Dockerfile + BuildKit / Buildx

Guidance for fast, reproducible image builds with security baked in.

## Write Dockerfiles for reuse

- Use multi-stage builds with explicit `ci` and `prod` targets as shown in the [application repository scaffold](../golden-paths/application/02-repo-scaffold.md#dockerfile).
- Keep base images small and pinned; avoid `latest`. Set `USER` and use `--chown` when copying sources to prevent root-owned artifacts.
- Externalize config via `ARG`/`ENV` and prefer `COPY` over `ADD`. Keep build arguments minimal and validated in CI.

## Build with BuildKit and Buildx

- Enable BuildKit features such as `RUN --mount=type=cache` for dependency caches and `--mount=type=secret` for one-off credentials. See the cache configuration in the [docker build workflow](../../../projects/ci-github-container/github/workflows/docker-build-images#workflow-call-inputs).
- Export inline cache and provenance (`BUILDKIT_INLINE_CACHE=1`, `--provenance=true`) so downstream jobs can reuse layers and attach SBOMs, as done in the [release workflow](../../../projects/docker-base-images/github/workflows/release#usage).
- Build multi-platform images with `docker buildx build --platform linux/amd64,linux/arm64` and push by digest; avoid rebuilding the same target in multiple jobs.

## Secure the build

- Do not bake secrets into images; inject at runtime via environment or secret stores. Prefer `cosign` or similar signing after build—see the [sign-images action](../../../projects/ci-github-container/actions/docker/sign-images/).
- Run scanners (Trivy, Grype) on built images and fail on critical findings. Keep the Dockerfile linted with Hadolint rules mirrored in CI.
- Keep a single source of truth for image names and tags; the [application hygiene checklist](../golden-paths/application/05-hygiene.md#operating-principles) shows how to keep Dockerfiles, CI, and Helm values aligned.
