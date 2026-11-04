---
title: Create
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/package/create/README.md
source_branch: main
source_run_id: 41855375389
last_synced: 2026-11-04T15:22:12.806Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Package

<div align="center">
  <img src="https://opengraph.githubassets.com/3fb447d0403952a43eebe2b03f436945955c160699ea2bb62cb2abc5229c52cb/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Package" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-package-blue?logo=github-actions)](https://github.com/marketplace/actions/package)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!--
// jscpd:ignore-start
-->
<!-- overview:start -->

## Overview

Create and upload a package tarball from prepared files, optionally restored from a build artifact.
Check out the project, configure Node.js and its package manager, and prepare dependencies, versions and build output before calling this action.
Uses the project's npm, pnpm or Yarn Classic configuration to select its native pack command.
Packaging never installs dependencies, changes versions or runs lifecycle scripts.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/package/create@97f64bc080b78daca8fb3ece49de448aaac83429 # 1.1.0
  with:
    # Prepared project directory containing the package manager configuration.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # Optional prepared package directory to pack.
    # Can be absolute or relative to `working-directory`.
    # Useful for monorepos with package manager configuration at the root.
    package-directory: ""

    # Optional build artifact ID to download before packaging.
    # When provided, the artifact will be downloaded to the workspace.
    build-artifact-id: ""

    # Optional path to the build artifact contents relative to the workspace root.
    # Used to locate the files to be included in the package when a build artifact is downloaded.
    #
    # Default: `${{ github.workspace }}`
    build-artifact-path: ${{ github.workspace }}

    # Name of the uploaded package tarball artifact
    artifact-name: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                 | **Description**                                                                             | **Required** | **Default**               |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------ | ------------------------- |
| **`working-directory`**   | Prepared project directory containing the package manager configuration.                    | **false**    | `.`                       |
|                           | Can be absolute or relative to the repository root.                                         |              |                           |
| **`package-directory`**   | Optional prepared package directory to pack.                                                | **false**    | -                         |
|                           | Can be absolute or relative to `working-directory`.                                         |              |                           |
|                           | Useful for monorepos with package manager configuration at the root.                        |              |                           |
| **`build-artifact-id`**   | Optional build artifact ID to download before packaging.                                    | **false**    | -                         |
|                           | When provided, the artifact will be downloaded to the workspace.                            |              |                           |
| **`build-artifact-path`** | Optional path to the build artifact contents relative to the workspace root.                | **false**    | `${{ github.workspace }}` |
|                           | Used to locate the files to be included in the package when a build artifact is downloaded. |              |                           |
| **`artifact-name`**       | Name of the uploaded package tarball artifact                                               | **false**    | -                         |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**                        | **Description**                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------- |
| **`package-tarball-path`**        | Absolute path to the generated package tarball                                    |
| **`package-tarball-artifact-id`** | Artifact ID of the uploaded package tarball (download with skip-decompress: true) |

<!-- outputs:end -->
<!-- examples:start -->

## Examples

Replace `<sha>` with a supported commit containing these action paths.

Use the [Publish action](../publish/index.md) to publish the resulting tarball.

See the [release guide](../../../github/workflows/release.md) for version planning and GitHub release orchestration.

```yaml
jobs:
  package:
    runs-on: ubuntu-latest
    outputs:
      package-tarball-artifact-id: ${{ steps.package.outputs.package-tarball-artifact-id }}
    steps:
      - id: package
        uses: hoverkraft-tech/ci-github-nodejs/actions/package/create@97f64bc080b78daca8fb3ece49de448aaac83429 # 1.1.0

  consume:
    needs: package
    runs-on: ubuntu-latest
    steps:
      - name: Download package tarball by artifact ID
        uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
        with:
          artifact-ids: ${{ needs.package.outputs.package-tarball-artifact-id }}
          skip-decompress: true
```

<!-- examples:end -->
<!--
// jscpd:ignore-end
-->

<!--
// jscpd:ignore-start
-->
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

<!--
// jscpd:ignore-end
-->
