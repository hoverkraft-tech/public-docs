---
sidebar_position: 2
---

# Repository Scaffold

Lay out the repository so GitHub Actions can build images, run CI inside the tooling container, and deploy with Helm.

## Directory layout

```txt
your-app/
├── .devcontainer/              # Dev environment used locally and by CI tooling image
├── application/                # App source (example: Astro/Node; swap for your stack)
├── charts/
│   └── application/            # Helm chart for the site
├── docker/
│   └── application/
│       ├── Dockerfile          # Builds ci + prod images from the same source
│       └── conf/nginx.conf     # Runtime nginx config
├── Makefile                    # Optional convenience targets
└── README.md                   # Project overview
```

For multi-application repositories, keep the same shape but repeat `application/` and `docker/` per service, while keeping a single umbrella chart under `charts/`:

```txt
your-app/
├── .devcontainer/
├── application/
│   ├── backend/
│   └── frontend/
├── charts/
│   └── application/          # Umbrella chart templating all services
├── docker/
│   ├── backend/
│   │   ├── Dockerfile
│   │   └── conf/nginx.conf
│   └── frontend/
│       ├── Dockerfile
│       └── conf/nginx.conf
└── ...
```

Create the skeleton:

```bash
mkdir -p .devcontainer docker/application/conf charts/application application
# Multi-app example
mkdir -p docker/backend/conf docker/frontend/conf charts/application application/backend application/frontend
```

## Key files

### Dockerfile

Use one Dockerfile to produce both the tooling image (`ci`) and the runtime image (`prod`). Example below is Node-based; adapt the base image and build commands to your runtime while keeping the `ci` and `prod` targets. For multi-app repos, place one Dockerfile per service (e.g., `docker/backend/Dockerfile`, `docker/frontend/Dockerfile`) and set `APP_PATH` to the matching app folder.

```dockerfile
# docker/application/Dockerfile (high level)
FROM node:24.9-bookworm-slim AS base
# install OS deps + npm

FROM base AS build
ARG APP_PATH=
COPY $APP_PATH/package*.json /usr/src/app/
RUN npm ci --force
COPY $APP_PATH/ /usr/src/app/

FROM build AS build-app
RUN npm run build && npm prune --production

FROM nginx:1.29-alpine AS prod
COPY docker/application/conf/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-app /usr/src/app/dist/ /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK CMD curl -f http://localhost:8080 || exit 1

FROM build AS ci
CMD ["tail", "-f", "/dev/null"]
```

Requirements:

- Keep the `ci` stage named exactly `ci`; the workflow references it.
- Set `APP_PATH` to the folder that contains `package.json` (e.g., `./application/` for a single app or `./application/backend/` for a multi-app service).
- Ensure `prod` exposes port `8080` and ships the built `dist/` assets.

### Helm chart

Add `charts/application/Chart.yaml` with `version` and `appVersion` starting at `0.0.0`. The deploy workflow injects the image tag and ingress host values; keep the chart minimal and let the workflow pass `image.*` and `deploy.ingress.hosts[0].host` via `chart-values`. For multi-app repos, keep a single umbrella chart (e.g., `charts/application/`) and template one subchart or deployment per service (e.g., `services.backend.*`, `services.frontend.*` values). Each service still consumes its own image tag and ingress host values.

### Dev container (optional but recommended)

Provide a `.devcontainer` that mirrors the tooling image (Node 24 + npm). CI will run inside the `ci` image built from each service Dockerfile (e.g., `docker/backend/Dockerfile`); using the same image locally avoids drift.

### Makefile (optional)

Expose thin wrappers like `make install`, `make lint`, `make test`, `make build` that call into the devcontainer or Docker Compose stack. CI invokes npm scripts directly inside the `ci` container, so keep the scripts in `application/package.json` up to date.

### GitHub repository assets (adapt equivalents on other platforms)

- `.github/dependabot.yml`: schedule updates for app dependencies, Docker base images, and GitHub Actions; group related updates and cap concurrency to reduce noise.
- `.github/ISSUE_TEMPLATE/`: structured templates for bugs/chores/incidents with fields for environment, reproduction steps, and rollback notes.
- `.github/PULL_REQUEST_TEMPLATE.md`: checklist for tests, security scanning, and chart/image tag alignment.
- `.github/CODEOWNERS`: route reviews to the right teams for app, chart, and workflow changes.
- `.github/workflows/`: pin CI/CD, preview cleanup, and security scans to specific action SHAs/tags (avoid `@master`/`@main`).
- `.github/renovate.json` (if using Renovate instead of Dependabot): mirror the same update policy and grouping.

When the skeleton is in place, add the workflows.
