---
title: Package
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/package/README.md
source_branch: main
source_run_id: 22110476859
last_synced: 2026-02-17T18:32:01.456Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Package

<div align="center">
  <img src="https://opengraph.githubassets.com/033722e286fffabbe95cf6b673dff8a7a81b4b664af7c12ba8ff8c5ddd0c1fec/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Package" />
</div>

---

<!-- header:end -->

## Overview

Action to create and upload an npm package tarball from a Node.js project.

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/package@c9d9d041ba4ef35695ee469c4782fa6a8bbebbcc # 0.21.2
  with:
    # Working directory where the package is packed.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # Optional build artifact ID to download before packaging.
    build-artifact-id: ""

    # Optional version to apply with `npm version` before packaging.
    # The version is applied without creating a git tag.
    version: ""

    # Name of the uploaded package tarball artifact
    # Default: `package-tarball`
    artifact-name: package-tarball
```

## Inputs

| **Input**               | **Description**                                                  | **Required** | **Default**       |
| ----------------------- | ---------------------------------------------------------------- | ------------ | ----------------- |
| **`working-directory`** | Working directory where the package is packed.                   | **false**    | `.`               |
|                         | Can be absolute or relative to the repository root.              |              |                   |
| **`build-artifact-id`** | Optional build artifact ID to download before packaging.         | **false**    | -                 |
|                         | When provided, the artifact will be downloaded to the workspace. |              |                   |
| **`version`**           | Optional version to apply with `npm version` before packaging.   | **false**    | -                 |
|                         | The version is applied without creating a Git tag.               |              |                   |
| **`artifact-name`**     | Name of the uploaded package tarball artifact                    | **false**    | `package-tarball` |

## Outputs

| **Output**                        | **Description**                                |
| --------------------------------- | ---------------------------------------------- |
| **`package-tarball-path`**        | Absolute path to the generated package tarball |
| **`package-tarball-artifact-id`** | Artifact ID of the uploaded package tarball    |

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md) for more details.
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-package-blue?logo=github-actions)](https://github.com/marketplace/actions/package)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Action to create and upload an npm package tarball from a Node.js project

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/package@c9d9d041ba4ef35695ee469c4782fa6a8bbebbcc # 0.21.2
  with:
    # Working directory where the package is packed.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # Optional build artifact ID to download before packaging.
    # When provided, the artifact will be downloaded to the workspace.
    build-artifact-id: ""

    # Optional path to the build artifact contents relative to the workspace root.
    # Used to locate the files to be included in the package when a build artifact is downloaded.
    #
    # Default: `${{ github.workspace }}`
    build-artifact-path: ${{ github.workspace }}

    # Optional version to apply with `npm version` before packaging.
    # The version is applied without creating a Git tag.
    version: ""

    # Name of the uploaded package tarball artifact
    # Default: `package-tarball`
    artifact-name: package-tarball
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                 | **Description**                                                                             | **Required** | **Default**               |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------ | ------------------------- |
| **`working-directory`**   | Working directory where the package is packed.                                              | **false**    | `.`                       |
|                           | Can be absolute or relative to the repository root.                                         |              |                           |
| **`build-artifact-id`**   | Optional build artifact ID to download before packaging.                                    | **false**    | -                         |
|                           | When provided, the artifact will be downloaded to the workspace.                            |              |                           |
| **`build-artifact-path`** | Optional path to the build artifact contents relative to the workspace root.                | **false**    | `${{ github.workspace }}` |
|                           | Used to locate the files to be included in the package when a build artifact is downloaded. |              |                           |
| **`version`**             | Optional version to apply with `npm version` before packaging.                              | **false**    | -                         |
|                           | The version is applied without creating a Git tag.                                          |              |                           |
| **`artifact-name`**       | Name of the uploaded package tarball artifact                                               | **false**    | `package-tarball`         |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**                        | **Description**                                |
| --------------------------------- | ---------------------------------------------- |
| **`package-tarball-path`**        | Absolute path to the generated package tarball |
| **`package-tarball-artifact-id`** | Artifact ID of the uploaded package tarball    |

<!-- outputs:end -->
<!-- examples:start -->
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

Copyright © 2026 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
