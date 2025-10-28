---
sidebar_position: 2
---

# Project Structure

Set up your repository structure for CI/CD following Hoverkraft conventions. The patterns work for any architecture—single app, polyglot monorepo, or service-specific directories—as long as your workflows know where to run and which commands to execute.

## Directory Layout

Example baseline (single application):

```txt
your-repo/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── __shared-ci.yml
│       ├── main-ci.yml
│       ├── pull-request-ci.yml
│       ├── greetings.yml
│       ├── semantic-pull-request.yml
│       ├── stale.yml
│       └── need-fix-to-issue.yml
├── .devcontainer/
│   ├── devcontainer.json
│   ├── docker-compose.yml      # Optional: orchestrate local services
│   └── Dockerfile              # Tooling image shared with CI
├── application/                # Primary application or service (name it however you like)
│   └── ...
├── Makefile                    # Standard developer commands (proxies to containers)
├── docker-compose.yml          # Optional: run app + dependencies locally via containers
```

**Hoverkraft standard**:

1. Put deployable code in a dedicated directory (default `application/`).
2. Provide a devcontainer so every command runs from the same containerized tooling image as CI.

For example:

- `application/web/`, `application/api/` (monorepo applications)
- `application/payments/`, `application/billing/` (microservices)
- `application/ui/`, `application/server/` (Nx/Turbo repos)

## Step 1: Create Workflows Directory

```bash
mkdir -p .github/workflows
```

## Step 2: Identify your build root(s)

```bash
mkdir -p application/src
# or, for a monorepo service
mkdir -p application/website/src

# alternative naming conventions
mkdir -p application/api/src
mkdir -p application/web-app/src
```

Whatever path you choose, keep it consistent and update workflow inputs accordingly. Document the mapping (e.g., `SERVICE_DIR=application/api`) so teammates know which directory each workflow targets.

## Step 3: Create build automation (container-first)

All local commands should run inside containers to guarantee parity with CI. Expose a thin wrapper (`Makefile`, `justfile`, `taskfile.yml`) that shells into your devcontainer image instead of calling host binaries directly.

```makefile
.PHONY: install lint test build ci shell

SERVICE ?= application
COMPOSE_FILE ?= .devcontainer/docker-compose.yml
RUN ?= docker compose -f $(COMPOSE_FILE) run --rm app

install:
  $(RUN) $(INSTALL_CMD)

lint:
  $(RUN) $(LINT_CMD)

test:
  $(RUN) $(TEST_CMD)

build:
  $(RUN) $(BUILD_CMD)

ci:
  $(MAKE) lint
  $(MAKE) test
  $(MAKE) build

shell:
  $(RUN) /bin/bash
```

If you rely on Visual Studio Code Dev Containers or GitHub Codespaces, this wrapper lets contributors execute `make lint` or `make shell` from the host terminal while still running every command inside the container defined in `.devcontainer/`. On pipelines, call the same targets directly—CI already runs inside containers.

Remember that the devcontainer image is purely for local tooling (linters, build chains, package managers). Your application still runs inside its own OCI containers built from the project `Dockerfile`/`docker-compose.yml` (or equivalent Helm chart). Keep those runtime images separate from the tooling image so you do not accidentally bake build dependencies into production artifacts.

Define the command variables in `.env`, `.tool-versions`, or another shared config kept in version control. Example mappings:

| Stack   | `INSTALL_CMD`     | `LINT_CMD`              | `TEST_CMD`      | `BUILD_CMD`      |
| ------- | ----------------- | ----------------------- | --------------- | ---------------- |
| Node.js | `npm ci`          | `npm run lint`          | `npm test`      | `npm run build`  |
| Python  | `poetry install`  | `flake8 src`            | `pytest`        | `poetry build`   |
| Go      | `go mod download` | `golangci-lint run`     | `go test ./...` | `go build ./...` |
| Java    | `mvn -B install`  | `mvn -B spotbugs:check` | `mvn -B test`   | `mvn -B package` |

Whichever task runner you prefer, ensure it launches the commands inside the same container image that the devcontainer and GitHub Actions use. This keeps local, preview, and CI environments perfectly aligned.

## Step 4: Configure build scripts or package metadata

Expose the same commands locally and in CI. Depending on your ecosystem this might be defined in `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Makefile`, or another tool. A few examples:

- **Node.js** (`package.json`):
  ```json
  {
    "scripts": {
      "lint": "npm run lint:eslint",
      "test": "npm run test:ci",
      "build": "npm run build:prod"
    }
  }
  ```
- **Python** (`pyproject.toml` with Poetry):
  ```toml
  [tool.poetry.scripts]
  lint = "invoke lint"
  test = "invoke test"
  build = "invoke build"
  ```
- **Go** (`Taskfile.yml` or Makefile):
  ```yaml
  tasks:
    lint: golangci-lint run
    test: go test ./...
    build: go build ./...
  ```

Choose the approach that matches your stack, just keep the CI entry points (`install`, `lint`, `test`, `build`) predictable—and always runnable from inside the tooling container. If you support multiple services, expose per-service targets (e.g., `make SERVICE=application/api lint`) or use matrices in the workflows.

## Key Directories Explained

| Directory                      | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `.github/workflows/`           | GitHub Actions workflow definitions           |
| `.devcontainer/`               | Dev environment container (tooling image)     |
| `application/` (or equivalent) | Primary service or package source code        |
| `docker-compose.yml`           | Local container orchestration for tooling/app |
| `Makefile` / task runner       | Container-aware build commands                |

## Multi-service or monorepo setups

- Create one shared workflow per technology stack if needed (for example, `__shared-ci-node.yml`, `__shared-ci-python.yml`).
- Pass a different `working-directory` (or other inputs) from each caller workflow (`pull-request-ci.yml`, `main-ci.yml`) depending on the service.
- Use matrix builds when several packages share the same pipeline steps.
- Keep reusable scripts (linting, build) in each package so local and CI executions stay aligned.

## What's Next?

Now that your project structure is ready, let's add the core CI/CD workflows!

👉 **Next: [Core Workflows →](./03-core-workflows.md)**
