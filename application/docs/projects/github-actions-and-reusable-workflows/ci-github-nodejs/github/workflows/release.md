---
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: .github/workflows/release.md
source_branch: main
source_run_id: 26052500755
last_synced: 2026-05-18T18:35:30.944Z
---

<!-- header:start -->

# GitHub Reusable Workflow: Node.js Release

<div align="center">
  <img src="https://opengraph.githubassets.com/2c1962a2ad1825873a40535c101ae27231c1531f2a43494247013447176c1536/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Node.js Release" />
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
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/release.yml@a10d5e32daef8e060c49fe617833fb0d53476f22 # 0.24.0
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
      # If omitted for a pushed Git tag, the workflow tries to reuse the Git tag
      # as the npm dist-tag unless it looks like a version tag such as `v1.2.3`.
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
|                                   | If omitted for a pushed Git tag, the workflow tries to reuse the Git tag           |              |             |                              |
|                                   | as the npm dist-tag unless it looks like a version tag such as `v1.2.3`.           |              |             |                              |
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
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/release.yml@a10d5e32daef8e060c49fe617833fb0d53476f22 # 0.24.0
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
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/release.yml@a10d5e32daef8e060c49fe617833fb0d53476f22 # 0.24.0
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
