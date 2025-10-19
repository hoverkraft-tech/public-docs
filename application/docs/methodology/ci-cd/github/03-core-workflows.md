---
sidebar_position: 3
---

# Core Workflows

Wire the three workflows that orchestrate CI/CD: `__shared-ci.yml`, `pull-request-ci.yml`, and `main-ci.yml`. They mirror the landing-page reference but stay agnostic to your stack because every command ultimately runs inside the container you build—whether the codebase hosts one application or a fleet of services packaged under `application/`.

## Shared CI Workflow (`__shared-ci.yml`)

Create `.github/workflows/__shared-ci.yml` and pin each reusable workflow to the commit you validated. The blueprint below matches the Hoverkraft methodology: lint code, build container images, run static analysis and integration checks inside those images, and publish reports back to GitHub.

```yaml title=".github/workflows/__shared-ci.yml"
name: Shared – Continuous Integration

on:
  workflow_call:

permissions:
  contents: read
  statuses: write
  security-events: write
  packages: write
  issues: read
  pull-requests: read
  # Required for reusable workflows pinned by commit
  id-token: write

jobs:
  linter:
    uses: hoverkraft-tech/ci-github-common/.github/workflows/linter.yml@<commit-sha-common> # x.y.z
    permissions:
      actions: read
      contents: read
      statuses: write
      security-events: write

  build:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<commit-sha-container> # x.y.z
    permissions:
      contents: read
      packages: write
      issues: read
      pull-requests: read
      id-token: write
    with:
      oci-registry: ${{ vars.OCI_REGISTRY }}
      sign: false
      images: |
        [
          {
            "name": "ci",
            "context": ".",
            "dockerfile": "./docker/service-a/Dockerfile",
            "build-args": { "APP_PATH": "./application/service-a/" },
            "target": "ci",
            "platforms": ["linux/amd64"]
          },
          {
            "name": "service-a",
            "context": ".",
            "dockerfile": "./docker/service-a/Dockerfile",
            "build-args": { "APP_PATH": "./application/service-a/" },
            "target": "prod",
            "platforms": ["linux/amd64"]
          }
        ]
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}

  sast:
    name: Static analysis inside the service image
    needs: build
    runs-on: ubuntu-latest
    container:
      image: ${{ fromJSON(needs.build.outputs.built-images).ci.images[0] }}
      credentials:
        username: ${{ github.repository_owner }}
        password: ${{ secrets.GITHUB_TOKEN }}
      options: --user root
    defaults:
      run:
        working-directory: /usr/src/app
    steps:
      - name: Run your stack checks
        run: |
          # Example (Node.js): npm run lint -- --output-file lint-report.json --format json
          # Example (Python): poe lint --format json --output lint-report.json
          # Example (Go): golangci-lint run --out-format json --output lint-report.json
          ./scripts/run-static-analysis.sh
      - name: Normalise report paths for annotations
        run: sed -i 's@/usr/src/app/@${{ github.workspace }}/application/service-a/@g' /usr/src/app/lint-report.json
      - uses: actions/upload-artifact@<commit-sha-upload> # vX.Y.Z
        with:
          name: lint-report
          path: /usr/src/app/lint-report.json
      - name: Build application (replace with your build command)
        run: ./scripts/build.sh service-a

  report-sast:
    if: github.event_name == 'pull_request'
    needs: sast
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      checks: write
    steps:
      - uses: actions/download-artifact@<commit-sha-download> # vX.Y.Z
        with:
          name: lint-report
      - uses: ataylorme/eslint-annotate-action@<commit-sha-annotate> # x.y.z
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          report-json: lint-report.json
          markdown-report-on-step-summary: true

  tests-charts:
    name: Helm tests
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
    steps:
      - name: Test Helm chart(s)
        uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@<commit-sha-container> # x.y.z
        with:
          helm-set: |
            image.registry=${{ fromJSON(needs.build.outputs.built-images).service-a.registry }}
            image.repository=${{ fromJSON(needs.build.outputs.built-images).service-a.repository }}
            image.tag=${{ fromJSON(needs.build.outputs.built-images).service-a.tags[0] }}
            image.digest=${{ fromJSON(needs.build.outputs.built-images).service-a.digest }}
          oci-registry: ${{ vars.OCI_REGISTRY }}
          oci-registry-password: ${{ github.token }}
```

> Replace every `<commit-sha-…>` placeholder with the exact commit SHA (and optional release comment) you validated for that reusable workflow or action. Expand the `images` map (and downstream references) for each service you ship.

### How to adapt it to your stack

- **Linting**: Toggle `linter-env` values to match the linters you actually execute. Use separate runs per ecosystem if required.
- **Container build**: Point `dockerfile`, `context`, `build-args`, `target`, and `platforms` at each service’s Dockerfile. Extend the `images` array to cover every deployable artifact (Web, API, worker, etc.).
- **Static analysis**: Replace `./scripts/run-static-analysis.sh` with the command(s) you need (`npm run lint`, `poetry run invoke lint`, `go test ./...`, `dotnet test`, etc.). The pattern—run inside the freshly built `ci` image and upload artifacts—remains the same.
- **Report fan-out**: Swap the annotate action if you produce SARIF, JUnit, or other formats. The goal is to comment on pull requests using the report generated in the container job, regardless of language.
- **Charts test**: If you do not ship Helm charts, repurpose this job for integration or contract tests (for example by calling `hoverkraft-tech/compose-action` to spin up databases or message brokers).

### Required repository configuration

| Type     | Name                          | Purpose                                                                    |
| -------- | ----------------------------- | -------------------------------------------------------------------------- |
| Variable | `OCI_REGISTRY`                | Registry host used by the container workflow                               |
| Variable | `CI_BOT_APP_ID`               | GitHub App ID used by deployment workflows (later step)                    |
| Variable | `REVIEW_APPS_URL` / `UAT_URL` | Environment base URLs consumed by `deploy.yml`                             |
| Secret   | `CI_BOT_APP_PRIVATE_KEY`      | GitHub App private key passed to publish workflows                         |
| Secret   | (optional) registry password  | Use when not pushing to GHCR; else `${{ secrets.GITHUB_TOKEN }}` is enough |

Add more as your services require (database passwords, third party tokens, etc.).

## Pull Request Workflow (`pull-request-ci.yml`)

Create `.github/workflows/pull-request-ci.yml` so every pull request (or merge queue run) reuses the shared pipeline for all services:

```yaml title=".github/workflows/pull-request-ci.yml"
name: Pull request – Continuous Integration

on:
  pull_request:
    branches: [main]

permissions:
  actions: read
  checks: write
  contents: read
  issues: read
  packages: write
  pull-requests: write
  security-events: write
  statuses: write
  id-token: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Continuous Integration
    uses: ./.github/workflows/__shared-ci.yml
    secrets: inherit
```

The wrapper keeps workflow logic in one place while ensuring PRs get status checks, annotations, and artifacts.

## Main Branch Workflow (`main-ci.yml`)

The default branch workflow performs three tasks: clean old images, execute the shared CI pipeline (across all services defined in `__shared-ci.yml`), and regenerate Helm documentation.

```yaml title=".github/workflows/main-ci.yml"
name: Main – Continuous Integration

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  actions: read
  checks: write
  contents: read
  issues: read
  packages: write
  pull-requests: write
  security-events: write
  statuses: write
  id-token: write

jobs:
  clean:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/prune-pull-requests-images-tags.yml@<commit-sha-container> # x.y.z
    with:
      images: '["ci","service-a"]'

  ci:
    name: Continuous Integration
    uses: ./.github/workflows/__shared-ci.yml
    secrets: inherit

  helm-docs:
    needs: ci
    runs-on: ubuntu-latest
    if: github.event_name != 'schedule'
    steps:
      - uses: actions/checkout@<commit-sha-checkout> # vX.Y.Z
      - uses: hoverkraft-tech/ci-github-container/actions/helm/generate-docs@<commit-sha-container> # x.y.z
        with:
          working-directory: ./charts
          github-app-id: ${{ vars.CI_BOT_APP_ID }}
          github-app-key: ${{ secrets.CI_BOT_APP_PRIVATE_KEY }}
```

Extend the workflow with publish jobs (for example pushing SBOMs, uploading coverage, or syncing manifests) once you validate CI.

## Secrets, Variables, and Permissions

- **Pin everything**: Dependabot can open PRs whenever new releases of the reusable workflows appear. Merge only after testing.
- **Minimal permissions**: Scope jobs to the permissions they need (see each job definition). Avoid granting `contents: write` unless a job commits back to the repository.
- **Secrets forwarding**: Using `secrets: inherit` lets the shared workflow access repository secrets. Provide only what the jobs consume (registry tokens, GitHub App key, etc.).

## Customising Beyond the Reference

- Add more jobs to `__shared-ci.yml` (for example UI tests) or split jobs into matrices when multiple services share the same build pipeline.
- If your stack cannot run inside the built container, build a dedicated `ci` target that contains the needed runtime and CLIs. Keep the production `prod` stage minimal.
- For monorepos, parameterise `images` and `helm-set` with matrices or `if` statements so each service builds independently while reusing the same workflow file.

## Next Steps

Commit the workflows and push a branch. Once they pass, continue with the community and deployment workflows to complete the Hoverkraft methodology.

👉 **Next: [Community Workflows →](./04-community-workflows.md)**
