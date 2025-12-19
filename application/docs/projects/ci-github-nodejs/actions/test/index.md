---
title: Test
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/test/README.md
source_branch: main
source_run_id: 20373085070
last_synced: 2025-12-19T14:39:42.683Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stc3F1YXJlIiBjb2xvcj0iYmx1ZSI+PHBvbHlsaW5lIHBvaW50cz0iOSAxMSAxMiAxNCAyMiA0Ij48L3BvbHlsaW5lPjxwYXRoIGQ9Ik0yMSAxMnY3YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmgxMSI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Test

<div align="center">
  <img src="https://opengraph.githubassets.com/f0111b126f55f4b842dad3996436655d47c0b27180ea1fe2289ac79d261fad6d/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Test" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-test-blue?logo=github-actions)](https://github.com/marketplace/actions/test)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Action to test Node.js projects with support for coverage reporting and pull request annotations

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/test@009e0e9d11a45eda39342243a14a4e5c3c6eaef3 # 0.21.1
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
