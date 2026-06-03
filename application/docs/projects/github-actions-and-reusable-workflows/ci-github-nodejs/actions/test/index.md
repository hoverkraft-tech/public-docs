---
title: Test
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/test/README.md
source_branch: main
source_run_id: 26908153014
last_synced: 2026-06-03T19:40:29.656Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stc3F1YXJlIiBjb2xvcj0iYmx1ZSI+PHBvbHlsaW5lIHBvaW50cz0iOSAxMSAxMiAxNCAyMiA0Ij48L3BvbHlsaW5lPjxwYXRoIGQ9Ik0yMSAxMnY3YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmgxMSI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Test

<div align="center">
  <img src="https://opengraph.githubassets.com/60888d7d7e501fc04b346e12f24da8bece0244fba94015e80c0231f55684c0aa/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Test" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-test-blue?logo=github-actions)](https://github.com/marketplace/actions/test)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Action to test Node.js projects with support for coverage reporting and pull request annotations

Note that this action must have write permission for id-token for this to work when using Codecov coverage reporting:

```yml
permissions:
  id-token: write
```

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/test@6b74a8f070140f5c120f78026d58e4c00d1b1e37 # 0.24.2
  with:
    # Working directory where test commands are executed.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # Whether running in container mode (skips checkout and node setup)
    # Default: `false`
    container: "false"

    # npm/pnpm/Yarn script command to run for testing.
    # This should be a script defined in your `package.json`.
    # The command should generate coverage report files in a standard format (Cobertura XML, lcov, etc.).
    #
    # Vitest: `vitest run --reporter=default --reporter=junit --outputFile=junit.xml --coverage.enabled --coverage.reporter=lcov --coverage.reporter=text`
    # Jest: `jest --ci --reporters=default --reporters=jest-junit --coverage`
    #
    # Default: `test:ci`
    command: test:ci

    # Code coverage reporter to use. Supported values:
    # - `github`: Parse coverage reports via [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action, with GitHub summaries/PR comments
    # - `codecov`: Upload coverage to Codecov
    # - `""` or `null`: No coverage reporting
    #
    # Default: `github`
    coverage: github

    # Optional test and coverage report paths forwarded to the [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action.
    # Supports multiple formats (Cobertura, OpenCover, lcov, etc.).
    # Provide absolute paths or paths relative to the working directory.
    # Multiple entries can be separated by newlines, commas, or semicolons.
    # When omitted, the action falls back to `auto:test,auto:coverage` detection.
    report-file: ""

    # Optional path mapping to adjust file paths in test and coverage reports.
    # See the [parse-ci-reports documentation](https://hoverkraft-tech/ci-github-common/actions/parse-ci-reports) for details.
    path-mapping: ""

    # GitHub token for coverage PR comments.
    # Required when coverage is set to `github`.
    # Requires permissions to create and update PR comments:
    #
    # - `issues: write`
    # - `pull-requests: write`
    github-token: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                                                                                                             | **Required** | **Default** |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Working directory where test commands are executed.                                                                                                                                         | **false**    | `.`         |
|                         | Can be absolute or relative to the repository root.                                                                                                                                         |              |             |
| **`container`**         | Whether running in container mode (skips checkout and node setup)                                                                                                                           | **false**    | `false`     |
| **`command`**           | npm/pnpm/Yarn script command to run for testing.                                                                                                                                            | **false**    | `test:ci`   |
|                         | This should be a script defined in your `package.json`.                                                                                                                                     |              |             |
|                         | The command should generate coverage report files in a standard format (Cobertura XML, lcov, etc.).                                                                                         |              |             |
|                         |                                                                                                                                                                                             |              |             |
|                         | Vitest: `vitest run --reporter=default --reporter=junit --outputFile=junit.xml --coverage.enabled --coverage.reporter=lcov --coverage.reporter=text`                                        |              |             |
|                         | Jest: `jest --ci --reporters=default --reporters=jest-junit --coverage`                                                                                                                     |              |             |
| **`coverage`**          | Code coverage reporter to use. Supported values:                                                                                                                                            | **false**    | `github`    |
|                         | - `github`: Parse coverage reports via [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action, with GitHub summaries/PR comments |              |             |
|                         | - `codecov`: Upload coverage to Codecov                                                                                                                                                     |              |             |
|                         | - `""` or `null`: No coverage reporting                                                                                                                                                     |              |             |
| **`report-file`**       | Optional test and coverage report paths forwarded to the [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action.                 | **false**    | -           |
|                         | Supports multiple formats (Cobertura, OpenCover, lcov, etc.).                                                                                                                               |              |             |
|                         | Provide absolute paths or paths relative to the working directory.                                                                                                                          |              |             |
|                         | Multiple entries can be separated by newlines, commas, or semicolons.                                                                                                                       |              |             |
|                         | When omitted, the action falls back to `auto:test,auto:coverage` detection.                                                                                                                 |              |             |
| **`path-mapping`**      | Optional path mapping to adjust file paths in test and coverage reports.                                                                                                                    | **false**    | -           |
|                         | See the [parse-ci-reports documentation](https://hoverkraft-tech/ci-github-common/actions/parse-ci-reports) for details.                                                                    |              |             |
| **`github-token`**      | GitHub token for coverage PR comments.                                                                                                                                                      | **false**    | -           |
|                         | Required when coverage is set to `github`.                                                                                                                                                  |              |             |
|                         | Requires permissions to create and update PR comments:                                                                                                                                      |              |             |
|                         |                                                                                                                                                                                             |              |             |
|                         | - `issues: write`                                                                                                                                                                           |              |             |
|                         | - `pull-requests: write`                                                                                                                                                                    |              |             |

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
