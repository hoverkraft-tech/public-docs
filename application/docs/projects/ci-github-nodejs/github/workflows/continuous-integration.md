---
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: .github/workflows/continuous-integration.md
source_branch: main
source_run_id: 19798990896
last_synced: 2025-11-30T12:44:26.358Z
---

<!-- header:start -->

# GitHub Reusable Workflow: Node.js Continuous Integration

<div align="center">
  <img src="https://opengraph.githubassets.com/c4b24a64c2dd90a7b6c8c553224b44ae0e9235d524ea4bd0df4e421323d263a8/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Node.js Continuous Integration" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Workflow to performs continuous integration steps agains a Node.js project:

- CodeQL analysis
- Linting
- Build
- Test

### Permissions

- **`contents`**: `read`
- **`id-token`**: `write`
- **`packages`**: `read`
- **`pull-requests`**: `write`
- **`security-events`**: `write`

<!-- overview:end -->

<!-- usage:start -->

## Usage

````yaml
name: Node.js Continuous Integration
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@ce2467e5d41ff0abe85094dcc39c98288448065a # 0.20.4
    permissions: {}
    secrets:
      # Secrets to be used during the build step.
      # Must be a multi-line env formatted string.
      # Example:
      # ```txt
      # SECRET_EXAMPLE=$\{{ secrets.SECRET_EXAMPLE }}
      # ```
      build-secrets: ""

      # Password for container registry authentication, if required.
      # Used when the container image is hosted in a private registry.
      # See https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container#defining-credentials-for-a-container-registry.
      container-password: ""

      # GitHub token to use for authentication.
      # Defaults to `GITHUB_TOKEN` if not provided.
      github-token: ""
    with:
      # JSON array of runner(s) to use.
      # See https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job.
      #
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'

      # Build parameters. Must be a string or a JSON object.
      # For string, provide a list of commands to run during the build step, one per line.
      # For JSON object, provide the following properties:
      #
      # - `commands`: Array of commands to run during the build step.
      # - `env`: Object of environment variables to set during the build step.
      # - `artifact`: String or array of strings specifying paths to artifacts to upload after the build
      #
      # Example:
      # ```json
      # {
      # "commands": [
      # "build",
      # "generate-artifacts"
      # ],
      # "env": {
      # "CUSTOM_ENV_VAR": "value"
      # },
      # "artifact": [
      # "dist/",
      # "packages/package-a/build/"
      # ]
      # }
      # ```
      #
      # Default: `build`
      build: build

      # Optional flag to enable check steps.
      # Default: `true`
      checks: true

      # Whether to enable linting.
      # Set to `null` or empty to disable.
      # Accepts a JSON object for lint options. See [lint action](../../actions/lint/index.md).
      # It should generate lint reports in standard formats.
      #
      # Example:
      #
      # ```json:package.json
      # {
      # "lint:ci": "eslint . --output-file eslint-report.json --format json"
      # }
      # ```
      #
      # Default: `true`
      lint: "true"

      # Code QL analysis language.
      # See https://github.com/github/codeql-action.
      #
      # Default: `typescript`
      code-ql: typescript

      # Enable dependency review scan.
      # Works with public repositories and private repositories with a GitHub Advanced Security license.
      # See https://github.com/actions/dependency-review-action.
      #
      # Default: `true`
      dependency-review: true

      # Whether to enable testing.
      # Set to `null` or empty to disable.
      # Accepts a JSON object for test options. See [test action](../../actions/test/index.md).
      # If coverage is enabled, it should generate test and coverage reports in standard formats.
      #
      # Example:
      #
      # ```json:package.json
      # {
      # "test:ci": "vitest run --reporter=default --reporter=junit --outputFile=junit.xml --coverage.enabled --coverage.reporter=lcov --coverage.reporter=text"
      # }
      # ```
      #
      # Default: `true`
      test: "true"

      # Working directory where the dependencies are installed.
      # Default: `.`
      working-directory: .

      # Container configuration to run CI steps in.
      # Accepts either a string (container image name) or a JSON object with container options.
      #
      # String format (simple):
      #
      # ```yml
      # container: "node:18"
      # ```
      #
      # JSON object format (advanced):
      #
      # ```json
      # {
      # "image": "node:18",
      # "env": {
      # "NODE_ENV": "production"
      # },
      # "options": "--cpus 2",
      # "ports": [8080, 3000],
      # "volumes": ["/tmp:/tmp", "/cache:/cache"],
      # "credentials": {
      # "username": "myusername"
      # },
      # "pathMapping": {
      # "/app": "./relative/path/to/app"
      # }
      # }
      # ```
      #
      # Supported properties:
      #
      # - `image` (required)
      # - `env` (object)
      # - `options` (string)
      # - `ports` (array)
      # - `volumes` (array)
      # - `credentials` (object with `username`).
      # - `pathMapping` (object) path mapping from container paths to repository paths. Defaults is working directory is mapped with repository root.
      #
      # See https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container.
      #
      # When specified, steps will execute inside this container instead of checking out code.
      # The container should have the project code and dependencies pre-installed.
      container: ""
````

<!-- usage:end -->

<!-- markdownlint-disable MD013 -->

<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**               | **Description**                                                                                                                                                                                                                                                                                                                                                                                     | **Required** | **Type**    | **Default**         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ------------------- |
| **`runs-on`**           | JSON array of runner(s) to use.                                                                                                                                                                                                                                                                                                                                                                     | **false**    | **string**  | `["ubuntu-latest"]` |
|                         | See [https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job](https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job).                                                                                                                                                                                                                                                                                                                  |              |             |                     |
| **`build`**             | Build parameters. Must be a string or a JSON object.                                                                                                                                                                                                                                                                                                                                                | **false**    | **string**  | `build`             |
|                         | For string, provide a list of commands to run during the build step, one per line.                                                                                                                                                                                                                                                                                                                  |              |             |                     |
|                         | For JSON object, provide the following properties:                                                                                                                                                                                                                                                                                                                                                  |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | - `commands`: Array of commands to run during the build step.                                                                                                                                                                                                                                                                                                                                       |              |             |                     |
|                         | - `env`: Object of environment variables to set during the build step.                                                                                                                                                                                                                                                                                                                              |              |             |                     |
|                         | - `artifact`: String or array of strings specifying paths to artifacts to upload after the build                                                                                                                                                                                                                                                                                                    |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | Example:                                                                                                                                                                                                                                                                                                                                                                                            |              |             |                     |
|                         | <!-- textlint-disable --><pre lang="json">{&#13; "commands": [&#13; "build",&#13; "generate-artifacts"&#13; ],&#13; "env": {&#13; "CUSTOM_ENV_VAR": "value"&#13; },&#13; "artifact": [&#13; "dist/",&#13; "packages/package-a/build/"&#13; ]&#13;}</pre><!-- textlint-enable -->                                                                                                                    |              |             |                     |
| **`checks`**            | Optional flag to enable check steps.                                                                                                                                                                                                                                                                                                                                                                | **false**    | **boolean** | `true`              |
| **`lint`**              | Whether to enable linting.                                                                                                                                                                                                                                                                                                                                                                          | **false**    | **string**  | `true`              |
|                         | Set to `null` or empty to disable.                                                                                                                                                                                                                                                                                                                                                                  |              |             |                     |
|                         | Accepts a JSON object for lint options. See [lint action](../../actions/lint/index.md).                                                                                                                                                                                                                                                                                                            |              |             |                     |
|                         | It should generate lint reports in standard formats.                                                                                                                                                                                                                                                                                                                                                |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | Example:                                                                                                                                                                                                                                                                                                                                                                                            |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | <!-- textlint-disable --><pre lang="json:package.json">{&#13; "lint:ci": "eslint . --output-file eslint-report.json --format json"&#13;}</pre><!-- textlint-enable -->                                                                                                                                                                                                                              |              |             |                     |
| **`code-ql`**           | Code QL analysis language.                                                                                                                                                                                                                                                                                                                                                                          | **false**    | **string**  | `typescript`        |
|                         | See [https://github.com/github/codeql-action](https://github.com/github/codeql-action).                                                                                                                                                                                                                                                                                                                                                      |              |             |                     |
| **`dependency-review`** | Enable dependency review scan.                                                                                                                                                                                                                                                                                                                                                                      | **false**    | **boolean** | `true`              |
|                         | Works with public repositories and private repositories with a GitHub Advanced Security license.                                                                                                                                                                                                                                                                                                    |              |             |                     |
|                         | See [https://github.com/actions/dependency-review-action](https://github.com/actions/dependency-review-action).                                                                                                                                                                                                                                                                                                                                          |              |             |                     |
| **`test`**              | Whether to enable testing.                                                                                                                                                                                                                                                                                                                                                                          | **false**    | **string**  | `true`              |
|                         | Set to `null` or empty to disable.                                                                                                                                                                                                                                                                                                                                                                  |              |             |                     |
|                         | Accepts a JSON object for test options. See [test action](../../actions/test/index.md).                                                                                                                                                                                                                                                                                                            |              |             |                     |
|                         | If coverage is enabled, it should generate test and coverage reports in standard formats.                                                                                                                                                                                                                                                                                                           |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | Example:                                                                                                                                                                                                                                                                                                                                                                                            |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | <!-- textlint-disable --><pre lang="json:package.json">{&#13; "test:ci": "vitest run --reporter=default --reporter=junit --outputFile=junit.xml --coverage.enabled --coverage.reporter=lcov --coverage.reporter=text"&#13;}</pre><!-- textlint-enable -->                                                                                                                                           |              |             |                     |
| **`working-directory`** | Working directory where the dependencies are installed.                                                                                                                                                                                                                                                                                                                                             | **false**    | **string**  | `.`                 |
| **`container`**         | Container configuration to run CI steps in.                                                                                                                                                                                                                                                                                                                                                         | **false**    | **string**  | -                   |
|                         | Accepts either a string (container image name) or a JSON object with container options.                                                                                                                                                                                                                                                                                                             |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | String format (simple):                                                                                                                                                                                                                                                                                                                                                                             |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | <!-- textlint-disable --><pre lang="yml">container: "node:18"</pre><!-- textlint-enable -->                                                                                                                                                                                                                                                                                                         |              |             |                     |
|                         | JSON object format (advanced):                                                                                                                                                                                                                                                                                                                                                                      |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | <!-- textlint-disable --><pre lang="json">{&#13; "image": "node:18",&#13; "env": {&#13; "NODE_ENV": "production"&#13; },&#13; "options": "--cpus 2",&#13; "ports": [8080, 3000],&#13; "volumes": ["/tmp:/tmp", "/cache:/cache"],&#13; "credentials": {&#13; "username": "myusername"&#13; },&#13; "pathMapping": {&#13; "/app": "./relative/path/to/app"&#13; }&#13;}</pre><!-- textlint-enable --> |              |             |                     |
|                         | Supported properties:                                                                                                                                                                                                                                                                                                                                                                               |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | - `image` (required)                                                                                                                                                                                                                                                                                                                                                                                |              |             |                     |
|                         | - `env` (object)                                                                                                                                                                                                                                                                                                                                                                                    |              |             |                     |
|                         | - `options` (string)                                                                                                                                                                                                                                                                                                                                                                                |              |             |                     |
|                         | - `ports` (array)                                                                                                                                                                                                                                                                                                                                                                                   |              |             |                     |
|                         | - `volumes` (array)                                                                                                                                                                                                                                                                                                                                                                                 |              |             |                     |
|                         | - `credentials` (object with `username`).                                                                                                                                                                                                                                                                                                                                                           |              |             |                     |
|                         | - `pathMapping` (object) path mapping from container paths to repository paths. Defaults is working directory is mapped with repository root.                                                                                                                                                                                                                                                       |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | See [https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container).                                                                                                                                                                                                                                                                                |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                                                                                                                                     |              |             |                     |
|                         | When specified, steps will execute inside this container instead of checking out code.                                                                                                                                                                                                                                                                                                              |              |             |                     |
|                         | The container should have the project code and dependencies pre-installed.                                                                                                                                                                                                                                                                                                                          |              |             |                     |

<!-- inputs:end -->

<!-- markdownlint-enable MD013 -->

### Container Configuration

The `container` input accepts either:

**Simple string format** (image name only):

```yaml
container: "node:18"
```

**Advanced JSON format** (with container options):

```yaml
container: |
  {
    "image": "node:18",
    "env": {
      "NODE_ENV": "production"
    },
    "options": "--cpus 2",
    "ports": [8080, 3000],
    "volumes": ["/tmp:/tmp", "/cache:/cache"],
    "credentials": {
      "username": "myusername"
    }
  }
```

**Supported properties:**

- `image` (string, required) - Container image name
- `env` (object) - Environment variables
- `options` (string) - Additional Docker options
- `ports` (array) - Port mappings
- `volumes` (array) - Volume mounts
- `credentials` (object) - Registry credentials with `username` property

#### Container Registry Credentials

For private container images, specify the username in the container input's `credentials.username` property and pass the password via the `container-password` secret:

```yaml
jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@main
    secrets:
      container-password: ${{ secrets.REGISTRY_PASSWORD }}
    with:
      container: |
        {
          "image": "ghcr.io/myorg/my-private-image:latest",
          "credentials": {
            "username": "myusername"
          }
        }
```

See [GitHub's container specification](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container) for more details.

When specified, steps will execute inside this container instead of checking out code. The container should have the project code and dependencies pre-installed.

<!-- secrets:start -->

## Secrets

| **Secret**               | **Description**                                                                                                                                                    | **Required** |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| **`build-secrets`**      | Secrets to be used during the build step.                                                                                                                          | **false**    |
|                          | Must be a multi-line env formatted string.                                                                                                                         |              |
|                          | Example:                                                                                                                                                           |              |
|                          | <!-- textlint-disable --><pre lang="txt">SECRET_EXAMPLE=$\{{ secrets.SECRET_EXAMPLE }}</pre><!-- textlint-enable -->                                               |              |
| **`container-password`** | Password for container registry authentication, if required.                                                                                                       | **false**    |
|                          | Used when the container image is hosted in a private registry.                                                                                                     |              |
|                          | See [https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container#defining-credentials-for-a-container-registry](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container#defining-credentials-for-a-container-registry). |              |
| **`github-token`**       | GitHub token to use for authentication.                                                                                                                            | **false**    |
|                          | Defaults to `GITHUB_TOKEN` if not provided.                                                                                                                        |              |

<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**              | **Description**                                           |
| ----------------------- | --------------------------------------------------------- |
| **`build-artifact-id`** | ID of the build artifact) uploaded during the build step. |

<!-- outputs:end -->

<!-- examples:start -->

## Examples

### Continuous Integration, build and publish

```yaml
name: Continuous Integration - Build and Publish

name: Nodejs Continuous Integration

on:
  push:
    branches: [main]

jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@ce2467e5d41ff0abe85094dcc39c98288448065a # 0.20.4
    permissions:
      id-token: write
      security-events: write
      contents: read
    with:
      build: |
        {
          "commands": ["build"],
          "artifact": "dist"
        }

  publish:
    needs: continuous-integration
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4.2.2

      - name: Setup NodeJS
        uses: hoverkraft-tech/ci-github-nodejs/actions/setup-node@0.2.2

      - name: Download build artifact
        uses: actions/download-artifact@v2
        with:
          artifact-ids: ${{ needs.continuous-integration.outputs.build-artifact-id }}
          path: /

      - name: Publish
        run: |
          npm publish dist
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Continuous Integration in a Docker container

This example runs CI checks inside a pre-built Docker container that contains the project code and dependencies. This ensures the same environment that will be deployed to production is tested.

```yaml
name: Continuous Integration - Container Mode

on:
  push:
    branches: [main]

jobs:
  # Build the Docker image with project code and dependencies
  build-image:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4.2.2

      - name: Build Docker image
        run: |
          docker build -t my-app:${{ github.sha }} .

      - name: Push to registry
        run: |
          docker tag my-app:${{ github.sha }} ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}

  # Run CI checks inside the Docker container
  continuous-integration:
    needs: build-image
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@ce2467e5d41ff0abe85094dcc39c98288448065a # 0.20.4
    permissions:
      id-token: write
      security-events: write
      contents: read
    with:
      container: ghcr.io/${{ github.repository }}:${{ github.sha }}
      # Specify which build/test commands to run (they should exist in package.json)
      build: "" # Skip build as it was done in the Docker image
```

### Continuous Integration with custom container path mapping

This example shows how to use custom path mappings when running CI steps inside a container.

It is useful when the project code is not located in the root folder of the repository.

```yaml
name: Continuous Integration - Custom Container Path Mapping
on:
  push:
    branches: [main]
jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@ce2467e5d41ff0abe85094dcc39c98288448065a # 0.20.4
    permissions:
      id-token: write
      security-events: write
      contents: read
    with:
      container: |
        {
          "image": "ghcr.io/myorg/node-image:18-alpine",
          "pathMapping": {
            "/app": "./relative/path/to/app"
          }
        }
```

### Continuous Integration with Advanced Container Options

This example shows how to use advanced container options like environment variables, ports, volumes, credentials, and additional Docker options.

```yaml
name: Continuous Integration - Advanced Container Options

on:
  push:
    branches: [main]

jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@ce2467e5d41ff0abe85094dcc39c98288448065a # 0.20.4
    permissions:
      id-token: write
      security-events: write
      contents: read
    secrets:
      container-password: ${{ secrets.REGISTRY_PASSWORD }}
    with:
      container: |
        {
          "image": "ghcr.io/myorg/node-image:18-alpine",
          "env": {
            "NODE_ENV": "production",
            "CI": "true"
          },
          "options": "--cpus 2 --memory 4g",
          "ports": [3000, 8080],
          "volumes": ["/tmp:/tmp", "/cache:/workspace/cache"],
          "credentials": {
            "username": "myusername"
          }          
        }
```

<!-- examples:end -->

<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md) for more details.

<!-- contributing:end -->

<!-- security:start -->
<!-- security:end -->

<!-- license:start -->

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2025 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->

<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
