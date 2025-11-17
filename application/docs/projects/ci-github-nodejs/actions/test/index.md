---
title: Test
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/test/README.md
source_branch: main
source_run_id: 19438580891
last_synced: 2025-11-17T17:35:07.037Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stc3F1YXJlIiBjb2xvcj0iYmx1ZSI+PHBvbHlsaW5lIHBvaW50cz0iOSAxMSAxMiAxNCAyMiA0Ij48L3BvbHlsaW5lPjxwYXRoIGQ9Ik0yMSAxMnY3YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmgxMSI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Test

<div align="center">
  <img src="https://opengraph.githubassets.com/50237226ce5d3230f19bbf31d04efd98f21cb2150e9ae4acd09a498440ecde82/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Test" />
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
- uses: hoverkraft-tech/ci-github-nodejs/actions/test@32a69b7b8fd5f7ab7bf656e7e88aa90ad235cf8d # 0.18.0
  with:
    # Working directory where test commands are executed.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # Whether running in container mode (skips checkout and node setup)
    # Default: `false`
    container: "false"

    # Code coverage reporter to use. Supported values:
    # - "github": Use ReportGenerator for PR comments with coverage reports
    # - "codecov": Upload coverage to Codecov
    # - "": No coverage reporting
    #
    # Default: `github`
    coverage: github

    # Path to coverage files for reporting.
    # Supports multiple formats (Cobertura, OpenCover, lcov, etc.).
    # Can be a single file or multiple files separated by semicolons.
    # If not specified, auto-detection will be attempted for common paths:
    # - coverage/cobertura-coverage.xml, coverage/coverage.xml
    # - coverage/lcov.info
    # - coverage/clover.xml
    coverage-files: ""

    # GitHub token for coverage PR comments.
    # Required when coverage is set to "github".
    github-token: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                       | **Required** | **Default** |
| ----------------------- | --------------------------------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Working directory where test commands are executed.                   | **false**    | `.`         |
|                         | Can be absolute or relative to the repository root.                   |              |             |
| **`container`**         | Whether running in container mode (skips checkout and node setup)     | **false**    | `false`     |
| **`coverage`**          | Code coverage reporter to use. Supported values:                      | **false**    | `github`    |
|                         | - "GitHub": Use ReportGenerator for PR comments with coverage reports |              |             |
|                         | - "Codecov": Upload coverage to Codecov                               |              |             |
|                         | - "": No coverage reporting                                           |              |             |
| **`coverage-files`**    | Path to coverage files for reporting.                                 | **false**    | -           |
|                         | Supports multiple formats (Cobertura, OpenCover, lcov, etc.).         |              |             |
|                         | Can be a single file or multiple files separated by semicolons.       |              |             |
|                         | If not specified, auto-detection will be attempted for common paths:  |              |             |
|                         | - coverage/cobertura-coverage.xml, coverage/coverage.xml              |              |             |
|                         | - coverage/lcov.info                                                  |              |             |
|                         | - coverage/clover.xml                                                 |              |             |
| **`github-token`**      | GitHub token for coverage PR comments.                                | **false**    | -           |
|                         | Required when coverage is set to "GitHub".                            |              |             |

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
