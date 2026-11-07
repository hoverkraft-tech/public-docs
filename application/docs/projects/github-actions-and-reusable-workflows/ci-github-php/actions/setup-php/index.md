---
title: Setup Php
source_repo: hoverkraft-tech/ci-github-php
source_path: actions/setup-php/README.md
source_branch: main
source_run_id: 42413332279
last_synced: 2026-11-07T20:57:29.249Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Setup PHP

<div align="center">
  <img src="https://opengraph.githubassets.com/7952085af0a270f3e7c5ffa94dd3d14b478b2cf4dece0a52f44539818a8d0288/hoverkraft-tech/ci-github-php" width="60px" align="center" alt="Setup PHP" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Set up PHP and Composer, cache downloads and install project dependencies with or without lockfiles.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/setup-php@83f80d1716625b68a933473a27c1dc25443768ff # 1.0.0
  with:
    # Project directory relative to the checkout.
    # Default: `.`
    working-directory: .

    # Explicit PHP version. Empty reads the project or repository .php-version, then setup-php platform detection.
    php-version: ""

    # PHP extensions forwarded to shivammathur/setup-php.
    # Default: `mbstring, dom, xml, xmlwriter, curl, zip, intl`
    extensions: mbstring, dom, xml, xmlwriter, curl, zip, intl

    # Coverage driver: none, pcov or xdebug.
    # Default: `pcov`
    coverage: pcov

    # JSON array of Composer project directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery.
    composer-directories: ""

    # Install project dependencies. Disable for jobs that only create an archive or install a separate consumer.
    # Default: `true`
    install-dependencies: "true"

    # Disable Composer installation scripts. Explicit Composer scripts run by later actions are unaffected.
    # Default: `true`
    ignore-scripts: "true"

    # Disable Composer plugins during installation. Set false when needed; composer.json allow-plugins still controls which plugins may run.
    # Default: `true`
    ignore-plugins: "true"
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                  | **Description**                                                                                                                                                              | **Required** | **Default**                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------ |
| **`working-directory`**    | Project directory relative to the checkout.                                                                                                                                  | **false**    | `.`                                              |
| **`php-version`**          | Explicit PHP version. Empty reads the project or repository .php-version, then setup-php platform detection.                                                                 | **false**    | -                                                |
| **`extensions`**           | PHP extensions forwarded to shivammathur/setup-php.                                                                                                                          | **false**    | `mbstring, dom, xml, xmlwriter, curl, zip, intl` |
| **`coverage`**             | Coverage driver: none, pcov or xdebug.                                                                                                                                       | **false**    | `pcov`                                           |
| **`composer-directories`** | JSON array of Composer project directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery. | **false**    | -                                                |
| **`install-dependencies`** | Install project dependencies. Disable for jobs that only create an archive or install a separate consumer.                                                                   | **false**    | `true`                                           |
| **`ignore-scripts`**       | Disable Composer installation scripts. Explicit Composer scripts run by later actions are unaffected.                                                                        | **false**    | `true`                                           |
| **`ignore-plugins`**       | Disable Composer plugins during installation. Set false when needed; composer.json allow-plugins still controls which plugins may run.                                       | **false**    | `true`                                           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**        | **Description**                        |
| ----------------- | -------------------------------------- |
| **`php-version`** | Installed PHP major and minor version. |

<!-- outputs:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-setup--php-blue?logo=github-actions)](https://github.com/marketplace/actions/setup-php)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-php)](https://github.com/hoverkraft-tech/ci-github-php/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-php)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-php/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- examples:start -->
<!-- examples:end -->
<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-php/blob/main/CONTRIBUTING.md) for more details.

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
