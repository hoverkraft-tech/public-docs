---
title: Build
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/build/README.md
source_branch: main
source_run_id: 20158497419
last_synced: 2025-12-12T06:40:55.801Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Build

<div align="center">
  <img src="https://opengraph.githubassets.com/8991905cd66969d6b61877b1a600c63e34df89082ea150a46b2096c3f9d58176/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Build" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-build-blue?logo=github-actions)](https://github.com/marketplace/actions/build)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Action to build Node.js projects with support for custom commands, environment variables, and artifact handling

<!-- overview:end -->
<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/build@25ef8d971c0a866fb9e5d90130c7aaa084619df6 # 0.21.0
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
| **`build-env`**         | JSON object of environment variables to set during the build.                                                                                            | **false**    | `\{}`       |
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

Copyright © 2025 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->

<!--
// jscpd:ignore-end
-->
