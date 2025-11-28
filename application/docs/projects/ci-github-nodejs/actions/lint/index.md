---
title: Lint
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/lint/README.md
source_branch: main
source_run_id: 19756093619
last_synced: 2025-11-28T06:41:44.990Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stY2lyY2xlIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjIyIDQgMTIgMTQuMDEgOSAxMS4wMSI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Lint

<div align="center">
  <img src="https://opengraph.githubassets.com/c4b24a64c2dd90a7b6c8c553224b44ae0e9235d524ea4bd0df4e421323d263a8/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Lint" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-lint-blue?logo=github-actions)](https://github.com/marketplace/actions/lint)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Action to lint Node.js projects with support for pull request reporting and annotations

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/lint@ce2467e5d41ff0abe85094dcc39c98288448065a # 0.20.4
  with:
    # Working directory where lint commands are executed.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # Whether running in container mode (skips checkout and node setup)
    # Default: `false`
    container: "false"

    # npm/pnpm/Yarn script command to run for linting.
    # This should be a script defined in your `package.json`.
    # The command should generate lint report files in a standard format.
    #
    # ESLint: `eslint --format json -o eslint-report.json .`
    # Prettier: `prettier --check . | tee prettier-report.txt`
    # Astro: `astro check | tee astro-report.txt`
    #
    # Default: `lint:ci`
    command: lint:ci

    # Optional lint report path forwarded to the [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action.
    # Provide an absolute path or one relative to the working directory.
    # When omitted, the action falls back to `auto:lint` detection.
    report-file: ""

    # Optional path mapping to adjust file paths in test and coverage reports.
    # See the [parse-ci-reports documentation](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) for details.
    path-mapping: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                                                                               | **Required** | **Default** |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Working directory where lint commands are executed.                                                                                                           | **false**    | `.`         |
|                         | Can be absolute or relative to the repository root.                                                                                                           |              |             |
| **`container`**         | Whether running in container mode (skips checkout and node setup)                                                                                             | **false**    | `false`     |
| **`command`**           | npm/pnpm/Yarn script command to run for linting.                                                                                                              | **false**    | `lint:ci`   |
|                         | This should be a script defined in your `package.json`.                                                                                                       |              |             |
|                         | The command should generate lint report files in a standard format.                                                                                           |              |             |
|                         |                                                                                                                                                               |              |             |
|                         | ESLint: `eslint --format json -o eslint-report.json .`                                                                                                        |              |             |
|                         | Prettier: `prettier --check . \| tee prettier-report.txt`                                                                                                     |              |             |
|                         | Astro: `astro check \| tee astro-report.txt`                                                                                                                  |              |             |
| **`report-file`**       | Optional lint report path forwarded to the [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action. | **false**    | -           |
|                         | Provide an absolute path or one relative to the working directory.                                                                                            |              |             |
|                         | When omitted, the action falls back to `auto:lint` detection.                                                                                                 |              |             |
| **`path-mapping`**      | Optional path mapping to adjust file paths in test and coverage reports.                                                                                      | **false**    | -           |
|                         | See the [parse-ci-reports documentation](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) for details.                 |              |             |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
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
