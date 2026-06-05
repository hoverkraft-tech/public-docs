---
title: Build
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/build/README.md
source_branch: main
source_run_id: 27005502535
last_synced: 2026-06-05T09:06:16.828Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Build

<div align="center">
  <img src="https://opengraph.githubassets.com/3b5ad6e7d32de59674fbc36faf1a23922627bbe8bc7cbf314484c8f942adb6a5/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Build" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-build-blue?logo=github-actions)](https://github.com/marketplace/actions/build)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Action to build Node.js projects with support for custom commands, environment variables, and artifact handling

<!-- overview:end -->
<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/build@6b74a8f070140f5c120f78026d58e4c00d1b1e37 # 0.24.2
  with:
    # Working directory where the build commands are executed.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # List of build commands to execute, one per line.
    # These are npm/pnpm/Yarn script names (e.g., `build`, `compile`).
    #
    # This input is required.
    build-commands: ""

    # JSON object of environment variables to set during the build.
    # Example:
    #
    # ```json
    # {
    # "NODE_ENV": "production",
    # "API_URL": "https://api.example.com"
    # }
    # ```
    #
    # Default: `{}`
    build-env: "{}"

    # Multi-line string of secrets in env format (`KEY=VALUE`).
    # Example:
    # ```txt
    # SECRET_KEY=$\{{ secrets.SECRET_KEY }}
    # API_TOKEN=$\{{ secrets.API_TOKEN }}
    # ```
    build-secrets: ""

    # JSON object specifying artifact upload configuration.
    # Example:
    #
    # ```json
    # {
    # "name": "artifact-name",
    # "paths": "path1\npath2"
    # }
    # ```
    build-artifact: ""

    # Whether running in container mode (skips checkout and node setup)
    # Default: `false`
    container: "false"
````

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                                                                          | **Required** | **Default** |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Working directory where the build commands are executed.                                                                                                 | **false**    | `.`         |
|                         | Can be absolute or relative to the repository root.                                                                                                      |              |             |
| **`build-commands`**    | List of build commands to execute, one per line.                                                                                                         | **true**     | -           |
|                         | These are npm/pnpm/Yarn script names (e.g., `build`, `compile`).                                                                                         |              |             |
| **`build-env`**         | JSON object of environment variables to set during the build.                                                                                            | **false**    | `{}`        |
|                         | Example:                                                                                                                                                 |              |             |
|                         |                                                                                                                                                          |              |             |
|                         | <!-- textlint-disable --><pre lang="json">{&#13; "NODE_ENV": "production",&#13; "API_URL": "https://api.example.com"&#13;}</pre><!-- textlint-enable --> |              |             |
| **`build-secrets`**     | Multi-line string of secrets in env format (`KEY=VALUE`).                                                                                                | **false**    | -           |
|                         | Example:                                                                                                                                                 |              |             |
|                         | <!-- textlint-disable --><pre lang="txt">SECRET_KEY=$\{{ secrets.SECRET_KEY }}&#13;API_TOKEN=$\{{ secrets.API_TOKEN }}</pre><!-- textlint-enable -->     |              |             |
| **`build-artifact`**    | JSON object specifying artifact upload configuration.                                                                                                    | **false**    | -           |
|                         | Example:                                                                                                                                                 |              |             |
|                         |                                                                                                                                                          |              |             |
|                         | <!-- textlint-disable --><pre lang="json">{&#13; "name": "artifact-name",&#13; "paths": "path1\npath2"&#13;}</pre><!-- textlint-enable -->               |              |             |
| **`container`**         | Whether running in container mode (skips checkout and node setup)                                                                                        | **false**    | `false`     |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**        | **Description**                                         |
| ----------------- | ------------------------------------------------------- |
| **`artifact-id`** | ID of the uploaded artifact (if artifact was specified) |

<!-- outputs:end -->
<!-- examples:start -->
<!-- examples:end -->

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
