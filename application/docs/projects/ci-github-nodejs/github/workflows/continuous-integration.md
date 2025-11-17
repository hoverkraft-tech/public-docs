---
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: .github/workflows/continuous-integration.md
source_branch: main
source_run_id: 19438580891
last_synced: 2025-11-17T17:35:07.037Z
---

<!-- header:start -->

# GitHub Reusable Workflow: Node.js Continuous Integration

<div align="center">
  <img src="https://opengraph.githubassets.com/50237226ce5d3230f19bbf31d04efd98f21cb2150e9ae4acd09a498440ecde82/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Node.js Continuous Integration" />
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
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@32a69b7b8fd5f7ab7bf656e7e88aa90ad235cf8d # 0.18.0
    secrets:
      # Secrets to be used during the build step.
      # Must be a multi-line env formatted string.
      # Example:
      # ```txt
      # SECRET_EXAMPLE=$\{{ secrets.SECRET_EXAMPLE }}
      # ```
      build-secrets: ""
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
      # Accepts a JSON object for lint options. See [lint action](../actions/lint/index.md).
      #
      # Default: `true`
      lint: "true"

      # Code QL analysis language. See [https://github.com/github/codeql-action](https://github.com/github/codeql-action).
      # Default: `typescript`
      code-ql: typescript

      # Enable dependency review scan. See [https://github.com/actions/dependency-review-action](https://github.com/actions/dependency-review-action).
      # Default: `true`
      dependency-review: true

      # Whether to enable testing.
      # Set to `null` or empty to disable.
      # Accepts a JSON object for test options. See [test action](../actions/test/index.md).
      #
      # Default: `true`
      test: "true"

      # Working directory where the dependencies are installed.
      # Default: `.`
      working-directory: .

      # Docker container image to run CI steps in. When specified, steps will execute inside this container instead of checking out code. The container should have the project code and dependencies pre-installed.
      container: ""
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**               | **Description**                                                                                                                                                                                                                                                                  | **Required** | **Type**    | **Default**         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ------------------- |
| **`runs-on`**           | JSON array of runner(s) to use.                                                                                                                                                                                                                                                  | **false**    | **string**  | `["ubuntu-latest"]` |
|                         | See [https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job](https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job).                                                                                                                                                                                               |              |             |                     |
| **`build`**             | Build parameters. Must be a string or a JSON object.                                                                                                                                                                                                                             | **false**    | **string**  | `build`             |
|                         | For string, provide a list of commands to run during the build step, one per line.                                                                                                                                                                                               |              |             |                     |
|                         | For JSON object, provide the following properties:                                                                                                                                                                                                                               |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                  |              |             |                     |
|                         | - `commands`: Array of commands to run during the build step.                                                                                                                                                                                                                    |              |             |                     |
|                         | - `env`: Object of environment variables to set during the build step.                                                                                                                                                                                                           |              |             |                     |
|                         | - `artifact`: String or array of strings specifying paths to artifacts to upload after the build                                                                                                                                                                                 |              |             |                     |
|                         |                                                                                                                                                                                                                                                                                  |              |             |                     |
|                         | Example:                                                                                                                                                                                                                                                                         |              |             |                     |
|                         | <!-- textlint-disable --><pre lang="json">{&#13; "commands": [&#13; "build",&#13; "generate-artifacts"&#13; ],&#13; "env": {&#13; "CUSTOM_ENV_VAR": "value"&#13; },&#13; "artifact": [&#13; "dist/",&#13; "packages/package-a/build/"&#13; ]&#13;}</pre><!-- textlint-enable --> |              |             |                     |
| **`checks`**            | Optional flag to enable check steps.                                                                                                                                                                                                                                             | **false**    | **boolean** | `true`              |
| **`lint`**              | Whether to enable linting.                                                                                                                                                                                                                                                       | **false**    | **string**  | `true`              |
|                         | Set to `null` or empty to disable.                                                                                                                                                                                                                                               |              |             |                     |
|                         | Accepts a JSON object for lint options. See [lint action](../actions/lint/index.md).                                                                                                                                                                                            |              |             |                     |
| **`code-ql`**           | Code QL analysis language. See [https://github.com/github/codeql-action](https://github.com/github/codeql-action).                                                                                                                                                                                                        | **false**    | **string**  | `typescript`        |
| **`dependency-review`** | Enable dependency review scan. See [https://github.com/actions/dependency-review-action](https://github.com/actions/dependency-review-action).                                                                                                                                                                                        | **false**    | **boolean** | `true`              |
| **`test`**              | Whether to enable testing.                                                                                                                                                                                                                                                       | **false**    | **string**  | `true`              |
|                         | Set to `null` or empty to disable.                                                                                                                                                                                                                                               |              |             |                     |
|                         | Accepts a JSON object for test options. See [test action](../actions/test/index.md).                                                                                                                                                                                            |              |             |                     |
| **`working-directory`** | Working directory where the dependencies are installed.                                                                                                                                                                                                                          | **false**    | **string**  | `.`                 |
| **`container`**         | Docker container image to run CI steps in. When specified, steps will execute inside this container instead of checking out code. The container should have the project code and dependencies pre-installed.                                                                     | **false**    | **string**  | -                   |

<!-- inputs:end -->

<!-- secrets:start -->

## Secrets

| **Secret**          | **Description**                                                                                                      | **Required** |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------ |
| **`build-secrets`** | Secrets to be used during the build step.                                                                            | **false**    |
|                     | Must be a multi-line env formatted string.                                                                           |              |
|                     | Example:                                                                                                             |              |
|                     | <!-- textlint-disable --><pre lang="txt">SECRET_EXAMPLE=$\{{ secrets.SECRET_EXAMPLE }}</pre><!-- textlint-enable --> |              |

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
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@32a69b7b8fd5f7ab7bf656e7e88aa90ad235cf8d # 0.18.0
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
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@32a69b7b8fd5f7ab7bf656e7e88aa90ad235cf8d # 0.18.0
    permissions:
      id-token: write
      security-events: write
      contents: read
    with:
      container: ghcr.io/${{ github.repository }}:${{ github.sha }}
      # When using container mode, code-ql and dependency-review are typically disabled
      # as they require repository checkout
      code-ql: ""
      dependency-review: false
      # Specify which build/test commands to run (they should exist in package.json)
      build: "" # Skip build as it was done in the Docker image
      lint: true
      test: true
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
