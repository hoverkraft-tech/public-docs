---
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: .github/workflows/release.md
source_branch: main
source_run_id: 27005502535
last_synced: 2026-06-05T09:06:16.828Z
---

<!-- header:start -->

# GitHub Reusable Workflow: Node.js Release

<div align="center">
  <img src="https://opengraph.githubassets.com/3b5ad6e7d32de59674fbc36faf1a23922627bbe8bc7cbf314484c8f942adb6a5/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Node.js Release" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Workflow to release Node.js packages from a package tarball produced by CI.

### Permissions

- **`contents`**: `read`
- **`id-token`**: `write`
- **`packages`**: `write`

<!-- overview:end -->

<!-- usage:start -->

## Usage

```yaml
name: Node.js Release
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  release:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/release.yml@6b74a8f070140f5c120f78026d58e4c00d1b1e37 # 0.24.2
    permissions:
      contents: read
      id-token: write
      packages: write
    secrets:
      # GitHub token to use when downloading the package tarball artifact.
      # Defaults to `GITHUB_TOKEN` if not provided.
      github-token: ""
    with:
      # JSON array of runner(s) to use.
      # See https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job.
      #
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'

      # Artifact ID of the package tarball produced by CI.
      # This input is required.
      package-tarball-artifact-id: ""

      # Registry URL used by npm publish.
      # Default: `https://registry.npmjs.org`
      registry-url: https://registry.npmjs.org

      # Package access level passed to npm publish. Leave empty to use npm defaults.
      # Default: `public`
      access: public

      # npm distribution tag for the published package. Leave empty to use npm defaults.
      # Common values:
      # - `latest` - Default tag for stable releases
      # - `next` - Prerelease or beta versions
      # - `canary` - Canary/nightly builds
      #
      # See https://docs.npmjs.com/adding-dist-tags-to-packages.
      tag: ""

      # Whether to generate npm provenance for npmjs.org publishes.
      # Default: `true`
      provenance: true

      # Whether to run npm publish without publishing the package.
      dry-run: false
```

<!-- usage:end -->

<!-- markdownlint-disable MD013 -->

<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                         | **Description**                                                                    | **Required** | **Type**    | **Default**                  |
| --------------------------------- | ---------------------------------------------------------------------------------- | ------------ | ----------- | ---------------------------- |
| **`runs-on`**                     | JSON array of runner(s) to use.                                                    | **false**    | **string**  | `["ubuntu-latest"]`          |
|                                   | See [https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job](https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job). |              |             |                              |
| **`package-tarball-artifact-id`** | Artifact ID of the package tarball produced by CI.                                 | **true**     | **string**  | -                            |
| **`registry-url`**                | Registry URL used by npm publish.                                                  | **false**    | **string**  | `https://registry.npmjs.org` |
| **`access`**                      | Package access level passed to npm publish. Leave empty to use npm defaults.       | **false**    | **string**  | `public`                     |
| **`tag`**                         | npm distribution tag for the published package. Leave empty to use npm defaults.   | **false**    | **string**  | -                            |
|                                   | Common values:                                                                     |              |             |                              |
|                                   | - `latest` - Default tag for stable releases                                       |              |             |                              |
|                                   | - `next` - Prerelease or beta versions                                             |              |             |                              |
|                                   | - `canary` - Canary/nightly builds                                                 |              |             |                              |
|                                   |                                                                                    |              |             |                              |
|                                   | See [https://docs.npmjs.com/adding-dist-tags-to-packages](https://docs.npmjs.com/adding-dist-tags-to-packages).                         |              |             |                              |
| **`provenance`**                  | Whether to generate npm provenance for npmjs.org publishes.                        | **false**    | **boolean** | `true`                       |
| **`dry-run`**                     | Whether to run npm publish without publishing the package.                         | **false**    | **boolean** | `false`                      |

<!-- inputs:end -->

<!-- markdownlint-enable MD013 -->

<!-- secrets:start -->

## Secrets

| **Secret**         | **Description**                                                    | **Required** |
| ------------------ | ------------------------------------------------------------------ | ------------ |
| **`github-token`** | GitHub token to use when downloading the package tarball artifact. | **false**    |
|                    | Defaults to `GITHUB_TOKEN` if not provided.                        |              |

<!-- secrets:end -->

<!-- outputs:start -->
<!-- outputs:end -->

<!-- examples:start -->

## Examples

### Publish Tested Tarball to npm

```yaml
name: Release

on:
  push:
    tags: ["*"]

permissions: {}

jobs:
  ci:
    uses: ./.github/workflows/__shared-ci.yml
    secrets: inherit
    permissions:
      contents: read
      id-token: write
      packages: read

  release:
    needs: ci
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/release.yml@6b74a8f070140f5c120f78026d58e4c00d1b1e37 # 0.24.2
    permissions:
      contents: read
      packages: write
      id-token: write
    with:
      package-tarball-artifact-id: ${{ needs.ci.outputs.package-tarball-artifact-id }}
```

### Dry Run

```yaml
name: Release dry run

on:
  workflow_dispatch:
    inputs:
      package-tarball-artifact-id:
        description: Package tarball artifact ID from a previous CI run
        required: true
        type: string

permissions: {}

jobs:
  dry-run:
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/release.yml@6b74a8f070140f5c120f78026d58e4c00d1b1e37 # 0.24.2
    permissions:
      contents: read
      packages: write
      id-token: write
    with:
      package-tarball-artifact-id: ${{ inputs.package-tarball-artifact-id }}
      dry-run: true
      provenance: false
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

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
