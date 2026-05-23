---
sidebar_position: 3
---

# Project structure

The Hoverkraft workflows discover images dynamically from the repository layout. Keep the structure predictable and let the automation infer what to build, test, and release.

## Directory layout

Use a repository shape close to this one:

```txt
your-docker-base-images/
├── .gitignore
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── __shared-ci.yml
│       ├── greetings.yml
│       ├── main-ci.yml
│       ├── need-fix-to-issue.yml
│       ├── prepare-release.yml
│       ├── pull-request-ci.yml
│       ├── release.yml
│       ├── semantic-pull-request.yml
│       └── stale.yml
├── images/
│   └── your-first-image/
│       ├── Dockerfile
│       ├── README.md
│       ├── your-first-image.test.js
│       └── tests/
│           └── fixtures/
├── Dockerfile
├── Makefile
└── README.md
```

## The `images/` Directory

The `images/` directory is the published surface of the repository. Each first-level directory maps to one OCI image.

### Image directory requirements

Each image directory **must** contain:

- `Dockerfile` - The image build definition

Each image directory **should** contain:

- `README.md` - Public usage and behavior documentation
- `<image>.test.js` - Black-box tests executed by CI when present

### Naming convention

The directory name becomes the image name. For example:

| Directory             | Published Image                      |
| --------------------- | ------------------------------------ |
| `images/nodejs-20/`   | `ghcr.io/<owner>/<repo>/nodejs-20`   |
| `images/python-3.12/` | `ghcr.io/<owner>/<repo>/python-3.12` |
| `images/ci-tools/`    | `ghcr.io/<owner>/<repo>/ci-tools`    |

## Minimal image contract

For one image directory, keep the contract explicit:

```txt
images/my-first-image/
├── Dockerfile
├── README.md
├── my-first-image.test.js
└── tests/
    └── fixtures/
```

- `Dockerfile` defines the published image
- `README.md` explains purpose, included tools, build arguments, and usage
- `my-first-image.test.js` validates behavior from the outside, not implementation details
- `tests/` is optional and only needed when the suite requires fixtures

## Creating your first image

### Step 1: Create the image directory

```bash
mkdir -p images/my-first-image
```

### Step 2: Create a Dockerfile

Create `images/my-first-image/Dockerfile`:

```dockerfile
# Use a specific version for reproducibility
FROM alpine:3.21

# Add labels for metadata
LABEL org.opencontainers.image.source="https://github.com/<your-org>/<your-repo>"
LABEL org.opencontainers.image.description="My first custom base image"

# Install packages
RUN apk add --no-cache \
    curl \
    jq \
    git

# Add a healthcheck (recommended)
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --retries=3 \
    CMD echo "healthy" || exit 1

# Set working directory
WORKDIR /app

# Default command (optional)
CMD ["/bin/sh"]
```

### Step 3: Create a readme

Create `images/my-first-image/README.md`:

````markdown
# my-first-image

A custom base image with common tools pre-installed.

## Included Tools

- curl
- jq
- git

## Usage

To use the image, pull it from the OCI registry:

```bash
docker pull ghcr.io/<your-org>/<your-repo>/my-first-image:latest
```
````

### Step 4: Add a Black-Box Test

Create `images/my-first-image/my-first-image.test.js`:

```js
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { GenericContainer } from "testcontainers";

describe("my-first-image", () => {
  const testedImageRef = process.env.TESTED_IMAGE_REF;
  let container;

  if (!testedImageRef) {
    throw new Error("TESTED_IMAGE_REF environment variable is required");
  }

  before(async () => {
    container = await new GenericContainer(testedImageRef)
      .withCommand(["sleep", "infinity"])
      .start();
  });

  after(async () => {
    await container?.stop();
  });

  it("contains git", async () => {
    const { exitCode, output } = await container.exec(["git", "--version"]);
    assert.equal(exitCode, 0);
    assert.match(output, /git version/i);
  });
});
```

This test convention matches the shared CI workflow:

- File naming: `images/<image>/<image>.test.js`
- Runtime input: `TESTED_IMAGE_REF`
- Generated report: `images/<image>/junit.xml`

## Dockerfile best practices

Follow these guidelines for consistent, high-quality images:

### 1. Pin base image versions

```dockerfile
# Good - specific version
FROM alpine:3.21

# Avoid - floating tag
FROM alpine:latest
```

### 2. Use multi-stage builds when appropriate

```dockerfile
# Build stage
FROM golang:1.23 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

# Runtime stage
FROM alpine:3.21
COPY --from=builder /app/myapp /usr/local/bin/
CMD ["myapp"]
```

### 3. Minimize layers

```dockerfile
# Good - single RUN command
RUN apk add --no-cache curl jq git && \
    rm -rf /var/cache/apk/*

# Avoid - multiple RUN commands for related operations
RUN apk add curl
RUN apk add jq
RUN apk add git
```

### 4. Add OCI labels

```dockerfile
LABEL org.opencontainers.image.source="https://github.com/<your-org>/<your-repo>"
LABEL org.opencontainers.image.description="Description of your image"
LABEL org.opencontainers.image.licenses="MIT"
```

### 5. Include health checks when they add value

```dockerfile
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1
```

### 6. Run as a non-root user when possible

```dockerfile
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /bin/sh -D appuser

USER appuser:appuser
WORKDIR /home/appuser
```

### 7. Keep release scope local to the image directory

The release workflow decides whether an image should be published by comparing files under that image directory, plus any shared files that affect the build. Keep image-specific behavior inside `images/<image>/` whenever possible so release detection stays accurate.

## Root-level support files

### `.gitignore`

Tests executed by CI and local runners generate JUnit reports inside each image directory. Ignore them:

```gitignore
images/*/junit.xml
```

### Root `Dockerfile`

The production pattern keeps a root `Dockerfile` that builds a repository-specific Super Linter image. That makes local linting and CI linting reproducible.

Use the current slim Super Linter image and configure it for local execution:

```dockerfile
FROM ghcr.io/super-linter/super-linter:slim-v8.0.0

LABEL org.opencontainers.image.description="Repository linter image used for local and CI linting"

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 CMD ["/bin/sh","-c","test -d /github/home"]
ARG UID=1000
ARG GID=1000
RUN chown -R ${UID}:${GID} /github/home
USER ${UID}:${GID}

ENV RUN_LOCAL=true
ENV USE_FIND_ALGORITHM=true
ENV LOG_LEVEL=WARN
ENV LOG_FILE="/github/home/logs"
```

### `Makefile`

The root `Makefile` should provide the developer entrypoints for:

- `make lint`
- `make lint-fix`
- `make build <image-name>`
- `make test <image-name>`
- `make test-all`
- `make ci`

For image tests, prefer the published runner used by CI:

```makefile
TESTCONTAINERS_RUNNER_IMAGE=ghcr.io/hoverkraft-tech/docker-base-images/testcontainers-node:latest
```

Then run tests by mounting the Docker socket, the repository and the image directory into that runner, while passing `TESTED_IMAGE_REF` to the suite.

Two approaches remain valid:

- Build `images/testcontainers-node` locally before each test run
- Pull `$(TESTCONTAINERS_RUNNER_IMAGE)` directly, as the production wrapper pattern does

Pick one approach and keep it consistent in the `Makefile` and readme.

## Dependabot configuration

Use repository-wide Dependabot rules rather than one entry per image. This matches the production implementation better and avoids manual maintenance when new images are added.

Create `.github/dependabot.yml`:

```yaml
---
version: 2
updates:
  - package-ecosystem: docker
    open-pull-requests-limit: 20
    directory: "/"
    schedule:
      interval: weekly
      day: friday
      time: "04:00"
    groups:
      docker-dependencies:
        patterns:
          - "*"

  - package-ecosystem: docker
    open-pull-requests-limit: 20
    directories:
      - "/images/*/*"
    schedule:
      interval: weekly
      day: friday
      time: "04:00"

  # Keep this block only if the repository owns a local testcontainers-node package.
  - package-ecosystem: npm
    open-pull-requests-limit: 20
    directory: "/images/testcontainers-node"
    schedule:
      interval: weekly
      day: friday
      time: "04:00"
    groups:
      npm-dependencies:
        patterns:
          - "*"

  - package-ecosystem: github-actions
    open-pull-requests-limit: 20
    directories:
      - "/"
      - "/actions/**/*"
    schedule:
      interval: weekly
      day: friday
      time: "04:00"
    groups:
      github-actions-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "devcontainers"
    open-pull-requests-limit: 20
    directory: "/"
    schedule:
      interval: weekly
      day: friday
      time: "04:00"
```

When you add a new image, verify that its Dockerfile still falls under the existing `/images/*/*` rule. If your layout changes, update Dependabot in the same pull request.

## Local verification

Before wiring workflows, make sure the repository contract is valid locally:

```bash
ls images/*/Dockerfile
make build my-first-image
make test my-first-image
```

If the image has no `.test.js` file yet, `make test <image>` should skip cleanly.

## Ready?

Continue with **[Workflows Setup](./03-workflows-setup.md)**.

The repository layout is the control plane for the rest of the automation. Keep it stable and boring.
