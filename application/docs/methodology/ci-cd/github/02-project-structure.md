---
sidebar_position: 2
---

# Project Structure

Set up a container-first repository skeleton before wiring GitHub Actions. The pattern applies to single applications, monorepos, and collections of microservices—you can adjust directory names, but the responsibilities remain the same.

## Baseline Layout

```
your-repo/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── __shared-ci.yml
│       ├── pull-request-ci.yml
│       ├── main-ci.yml
│       ├── deploy.yml
│       ├── clean-deploy.yml
│       └── release.yml
├── .devcontainer/
│   └── devcontainer.json
├── application/
│   ├── service-a/
│   │   ├── src/
│   │   └── package.json | pyproject.toml | go.mod | pom.xml
│   └── service-b/
│       ├── src/
│       └── ...
├── docker/
│   ├── service-a/Dockerfile
│   └── service-b/Dockerfile
├── charts/
│   ├── service-a/
│   └── service-b/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.deploy.yml
└── Makefile | Taskfile.yml | Justfile
```

## Essentials by Directory

| Path                    | Responsibility                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `.github/`              | Automation entrypoints (workflows, Dependabot policies, issue templates)                       |
| `.devcontainer/`        | Tooling image definition (editors, Docker CLI, language runtimes needed for local work)        |
| `application/`          | Deployable code plus package metadata, lint/test scripts, configuration per service or package |
| `docker/`               | Multi-stage Dockerfiles and supporting runtime configuration (nginx configs, entrypoints)      |
| `charts/`               | Helm chart(s), `values.yaml`, chart schema, chart tests, CI metadata (`ct.yaml`)               |
| `docker-compose*.yml`   | Local orchestration for dev, deploy previews, CI support containers                            |
| `Makefile` (or similar) | Thin wrapper that shells into the application container so local commands mirror CI            |

The combination delivers consistent DevX: developers use `make` (or your preferred runner) to reach the same container images CI uses, while Helm metadata keeps deployment manifests reproducible.

## Development Experience (DevX)

- **Devcontainer as tooling**: Provide only the editor helpers and Docker client. Do **not** run the application inside the devcontainer. CI and developers both build the dedicated application container stages declared in `docker/<service>/Dockerfile` (`base`, `build`, `ci`, `dev`, `prod`).
- **Wrapper commands**: Expose `make prepare`, `make lint`, `make build`, `make ci`, `make helm` (or equivalents). Each target shells into the application container via `docker compose` so every command runs with the same OS, Node/Python/Java version, and toolchain.
- **Pre-commit hooks**: Mirror CI checks locally (YAML linting, Helm linting, kubeconform, spelling, etc.) and keep the config in `.pre-commit-config.yaml` so contributors can run `pre-commit run --all-files` when needed.
- **Runtime pins**: Record languages in `.tool-versions`, `.nvmrc`, `.python-version`, `go.mod`, or `package.json#engines`. Dependabot can auto-bump them later, but everyone starts from a known baseline.

## Application Directory Checklist

Inside `application/` (and any nested service directories) ensure you have:

- Package metadata with deterministic scripts (`check`, `lint`, `test`, `build`, `fix`). Whether you use `npm`, `pnpm`, `poetry`, `tox`, `go`, `cargo`, `mvn`, or `gradle`, expose the same entry points so local runs and CI stay aligned.
- Code quality config alongside the code: ESLint/Prettier, Ruff/Black, ktlint, Checkstyle, scalafmt—whatever matches each service’s stack. Keep these configs next to the code so Docker builds can copy them with the source tree.
- Strict compiler/tooling options (`tsconfig.json`, `.flake8`, `.golangci.yml`, `sonar-project.properties`, etc.) to catch issues early.
- Optional integration helpers (path aliases, shared libraries under `src/` or `pkg/`)—workflows do not inspect them, but keeping them colocateed simplifies builds.

## Deployment Assets

- **Docker**: Author one multi-stage Dockerfile per deployable component (for example `docker/service-a/Dockerfile`). Each file should expose repeatable targets:
  - `base`: Installs system dependencies and globally needed CLIs.
  - `build`: Installs application dependencies (e.g., `npm ci`, `poetry install --no-root`, `go mod download`, `mvn dependency:go-offline`).
  - `build-app`: Produces the production artifact and prunes dev-only dependencies.
  - `prod`: Base image for runtime (nginx/distroless/JRE/alpine/etc.), copies the artifact, defines health probes.
  - `ci` and `dev`: Long-running targets used during lint/test (CI) or local development shells.
- **Helm**: Keep a chart per deployable component under `charts/<name>` with `Chart.yaml`, `values.yaml`, templates, and docs. Use `ct.yaml` and `charts/lintconf.yaml` so `ct lint` and `helm kubeconform` can run automatically.
- **Registry metadata**: Declare registry coordinates (`image.registry`, `image.repository`) in `values.yaml`. CI updates only the tag/digest.

## Automation Configuration

- **Dependabot**: Enable updates for GitHub Actions, container base images, and your language package manager so pinned SHAs stay fresh.
- **Issue workflows**: Add greeting, semantic PR, stale triage, and need-fix workflows under `.github/workflows/`—they enforce the contribution workflow without touching application code.
- **Secrets & variables**: Plan ahead for `vars.OCI_REGISTRY`, `vars.CI_BOT_APP_ID`, URL variables (`REVIEW_APPS_URL`, etc.), and secrets like `CI_BOT_APP_PRIVATE_KEY`. The core workflows expect these names.

## Bootstrap Checklist

1. Scaffold directories shown above (rename `application/` if necessary) and commit the empty tree with placeholder `.gitkeep` files where required.
2. Author your multi-stage Dockerfile under `docker/<service>/Dockerfile`, ensuring targets for `dev`, `ci`, and `prod` exist.
3. Configure the application package scripts and lint/test/format config so `make check` (or equivalent) can target each service. For multi-service repos, add parameters (for example `SERVICE=service-a make ci`) or expose dedicated targets.
4. Provision Helm chart(s) and supporting files (`ct.yaml`, `chart-schema.yaml`, `lintconf.yaml`) to unlock automated linting and kubeconform checks.
5. Add `.pre-commit-config.yaml`, `.tool-versions`, `.env`, and devcontainer metadata to freeze the toolchain for contributors.
6. Drop in skeleton workflows under `.github/workflows/` (we will populate them in the next chapter) and add a `dependabot.yml` to keep them current.

Once the structure is in place, wiring the reusable workflows becomes a matter of filling in the inputs and secrets—they assume this layout.

👉 **Next: [Core Workflows →](./03-core-workflows.md)**
