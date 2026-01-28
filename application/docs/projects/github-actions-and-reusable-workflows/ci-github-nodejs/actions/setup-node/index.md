---
title: Setup Node
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/setup-node/README.md
source_branch: main
source_run_id: 21412740329
last_synced: 2026-01-27T20:28:59.438Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItc2V0dGluZ3MiIGNvbG9yPSJibHVlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIj48L2NpcmNsZT48cGF0aCBkPSJNMTkuNCAxNWExLjY1IDEuNjUgMCAwIDAgLjMzIDEuODJsLjA2LjA2YTIgMiAwIDAgMSAwIDIuODMgMiAyIDAgMCAxLTIuODMgMGwtLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAtMS44Mi0uMzMgMS42NSAxLjY1IDAgMCAwLTEgMS41MVYyMWEyIDIgMCAwIDEtMiAyIDIgMiAwIDAgMS0yLTJ2LS4wOUExLjY1IDEuNjUgMCAwIDAgOSAxOS40YTEuNjUgMS42NSAwIDAgMC0xLjgyLjMzbC0uMDYuMDZhMiAyIDAgMCAxLTIuODMgMCAyIDIgMCAwIDEgMC0yLjgzbC4wNi0uMDZhMS42NSAxLjY1IDAgMCAwIC4zMy0xLjgyIDEuNjUgMS42NSAwIDAgMC0xLjUxLTFIM2EyIDIgMCAwIDEtMi0yIDIgMiAwIDAgMSAyLTJoLjA5QTEuNjUgMS42NSAwIDAgMCA0LjYgOWExLjY1IDEuNjUgMCAwIDAtLjMzLTEuODJsLS4wNi0uMDZhMiAyIDAgMCAxIDAtMi44MyAyIDIgMCAwIDEgMi44MyAwbC4wNi4wNmExLjY1IDEuNjUgMCAwIDAgMS44Mi4zM0g5YTEuNjUgMS42NSAwIDAgMCAxLTEuNTFWM2EyIDIgMCAwIDEgMi0yIDIgMiAwIDAgMSAyIDJ2LjA5YTEuNjUgMS42NSAwIDAgMCAxIDEuNTEgMS42NSAxLjY1IDAgMCAwIDEuODItLjMzbC4wNi0uMDZhMiAyIDAgMCAxIDIuODMgMCAyIDIgMCAwIDEgMCAyLjgzbC0uMDYuMDZhMS42NSAxLjY1IDAgMCAwLS4zMyAxLjgyVjlhMS42NSAxLjY1IDAgMCAwIDEuNTEgMUgyMWEyIDIgMCAwIDEgMiAyIDIgMiAwIDAgMS0yIDJoLS4wOWExLjY1IDEuNjUgMCAwIDAtMS41MSAxeiI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Setup Node.js

<div align="center">
  <img src="https://opengraph.githubassets.com/69ecd249ef8a7636e193205575fa53ebb5c51b35feeb68ee25c7f4de5fb209ca/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Setup Node.js" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-setup--node.js-blue?logo=github-actions)](https://github.com/marketplace/actions/setup-node.js)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to setup Node.js and install dependencies according to the package manager used.

<!-- overview:end -->

<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/setup-node@c9d9d041ba4ef35695ee469c4782fa6a8bbebbcc # 0.21.2
  with:
    # List of dependencies for which the cache should be managed
    dependencies-cache: ""

    # Working directory where the dependencies are installed.
    # Can be absolute or relative to the repository root.
    #
    # Default: `.`
    working-directory: .

    # Optional registry to set up for auth.
    # See https://github.com/actions/setup-node?tab=readme-ov-file#usage.
    registry-url: ""
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                | **Description**                                                                                                                       | **Required** | **Default** |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`dependencies-cache`** | List of dependencies for which the cache should be managed                                                                            | **false**    | -           |
| **`working-directory`**  | Working directory where the dependencies are installed.                                                                               | **false**    | `.`         |
|                          | Can be absolute or relative to the repository root.                                                                                   |              |             |
| **`registry-url`**       | Optional registry to set up for auth.                                                                                                 | **false**    | -           |
|                          | See [https://github.com/actions/setup-node?tab=readme-ov-file#usage](https://github.com/actions/setup-node?tab=readme-ov-file#usage). |              |             |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**               | **Description**                                      |
| ------------------------ | ---------------------------------------------------- |
| **`run-script-command`** | The command to run a script in the package.json file |

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
