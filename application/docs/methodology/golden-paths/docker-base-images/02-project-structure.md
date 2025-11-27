---
sidebar_position: 2
---

# Project Structure

This page covers the required repository structure for your Docker base images repository. The reusable workflows expect a specific layout to discover and build your images automatically.

## Directory Layout

Create the following structure in your repository:

```txt
your-docker-base-images/
├── .github/
│   ├── workflows/           # Workflow files (next page)
│   └── dependabot.yml       # Dependency updates
├── images/                  # Required: Docker image definitions
│   └── your-first-image/
│       ├── Dockerfile       # Required
│       └── README.md        # Recommended
└── README.md
```

## The `images/` Directory

The `images/` directory is the heart of your repository. Each subdirectory represents one Docker image that will be built and published.

### Image Directory Requirements

Each image directory **must** contain:

- `Dockerfile` - The build definition for your image

Each image directory **should** contain:

- `README.md` - Documentation for the image

### Naming Convention

The directory name becomes the image name. For example:

| Directory             | Published Image                      |
| --------------------- | ------------------------------------ |
| `images/nodejs-20/`   | `ghcr.io/<owner>/<repo>/nodejs-20`   |
| `images/python-3.12/` | `ghcr.io/<owner>/<repo>/python-3.12` |
| `images/ci-tools/`    | `ghcr.io/<owner>/<repo>/ci-tools`    |

## Creating Your First Image

### Step 1: Create the Image Directory

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

```markdown
# my-first-image

A custom base image with common tools pre-installed.

## Included Tools

- curl
- jq
- git

## Usage

To use the image, pull it from the OCI registry:

\`\`\`bash
docker pull ghcr.io/<your-org>/<your-repo>/my-first-image:latest
\`\`\`
```

## Dockerfile Best Practices

Follow these guidelines for consistent, high-quality images:

### 1. Pin Base Image Versions

```dockerfile
# Good - specific version
FROM alpine:3.21

# Avoid - floating tag
FROM alpine:latest
```

### 2. Use Multi-Stage Builds When Appropriate

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

### 3. Minimize Layers

```dockerfile
# Good - single RUN command
RUN apk add --no-cache curl jq git && \
    rm -rf /var/cache/apk/*

# Avoid - multiple RUN commands for related operations
RUN apk add curl
RUN apk add jq
RUN apk add git
```

### 4. Add Labels

```dockerfile
LABEL org.opencontainers.image.source="https://github.com/<your-org>/<your-repo>"
LABEL org.opencontainers.image.description="Description of your image"
LABEL org.opencontainers.image.licenses="MIT"
```

### 5. Include Health Checks

```dockerfile
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1
```

### 6. Run as Non-Root User

```dockerfile
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /bin/sh -D appuser

USER appuser:appuser
WORKDIR /home/appuser
```

## Dependabot Configuration

Create `.github/dependabot.yml` to keep your images updated:

```yaml
version: 2
updates:
  # Update GitHub Actions
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    groups:
      github-actions:
        patterns:
          - "*"

  # Update Docker base images
  - package-ecosystem: docker
    directory: /images/my-first-image
    schedule:
      interval: weekly
```

Add an entry for each image directory to receive base image updates.

## Example: Multiple Images

Here's an example with multiple images:

```txt
images/
├── nodejs-20/
│   ├── Dockerfile
│   └── README.md
├── python-3.12/
│   ├── Dockerfile
│   └── README.md
└── ci-tools/
    ├── Dockerfile
    ├── README.md
    └── scripts/
        └── entrypoint.sh
```

Each image is discovered automatically and built independently.

## Verification

Before proceeding, verify your structure:

```bash
# Check that images/ exists with at least one Dockerfile
ls images/*/Dockerfile
```

You should see your Dockerfile(s) listed.

## Ready?

👉 **Next: [Workflows Setup →](./03-workflows-setup.md)**

---

💡 **Tip**: Start simple. You can always add more images or complexity later.
