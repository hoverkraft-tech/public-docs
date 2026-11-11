---
title: Get Php Versions
source_repo: hoverkraft-tech/ci-github-php
source_path: actions/get-php-versions/README.md
source_branch: main
source_run_id: 43042691904
last_synced: 2026-11-11T14:55:33.688Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItbGlzdCIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSI4IiB5MT0iNiIgeDI9IjIxIiB5Mj0iNiI+PC9saW5lPjxsaW5lIHgxPSI4IiB5MT0iMTIiIHgyPSIyMSIgeTI9IjEyIj48L2xpbmU+PGxpbmUgeDE9IjgiIHkxPSIxOCIgeDI9IjIxIiB5Mj0iMTgiPjwvbGluZT48bGluZSB4MT0iMyIgeTE9IjYiIHgyPSIzLjAxIiB5Mj0iNiI+PC9saW5lPjxsaW5lIHgxPSIzIiB5MT0iMTIiIHgyPSIzLjAxIiB5Mj0iMTIiPjwvbGluZT48bGluZSB4MT0iMyIgeTE9IjE4IiB4Mj0iMy4wMSIgeTI9IjE4Ij48L2xpbmU+PC9zdmc+) GitHub Action: Get PHP versions

<div align="center">
  <img src="https://opengraph.githubassets.com/3d2511885985a0290215e9a9dd16896d3d1b2f7768fb4052866074e0b169a61d/hoverkraft-tech/ci-github-php" width="60px" align="center" alt="Get PHP versions" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Discover stable PHP releases matching composer.json require.php using Composer constraints. Runs in Docker on Linux without changing the runner's PHP installation.

### PHP version selection

Declare supported PHP versions in `composer.json`:

```json
{
  "require": {
    "php": "^8.2"
  }
}
```

The CI workflow discovers stable releases allowed by that constraint and tests
the newest matching patch of each minor. Its highest version runs lint and package
checks and publishes coverage. A new stable minor is included when the constraint
already allows it. Explicitly restricted ranges require a deliberate Composer change
before CI adds another minor. End-of-life versions remain tested when still allowed.

Discovery uses PHP.net release metadata and Composer's constraint parser. It handles
patch bounds and disjoint ranges without approximating them as npm SemVer.
Prereleases are excluded. A missing or invalid `require.php`, an unavailable release
catalog, or a constraint with no matching stable release causes an error. Dependency
installation still validates the project and tooling against the selected runtime.

The discovery action builds and runs its Docker image on Linux runners with Docker,
using the runner's UID/GID and a read-only checkout mount.
CI and local builds use the same container runtime and locked dependencies. Discovery
does not change PHP on the runner. The setup action then installs the selected PHP
version when the job needs it.

### Overrides

`php-versions` overrides the CI matrix. Its last entry is primary. Automatic matrix
discovery uses `require.php` even when a `.php-version` file exists.

The setup action selects its runtime in this order:

1. Its explicit `php-version` input.
1. The project `.php-version`, then the repository `.php-version`.
1. Composer platform overrides, as supported by `shivammathur/setup-php`.
1. The highest stable PHP release allowed by `require.php`.

Version files are optional. Ordinary consumers need only their Composer constraint.
The standalone `get-php-versions` action exposes both the full matrix and its highest
version for custom jobs; discovery does not install project dependencies or run hooks.

### Local Docker builds

Local builds read the resolver revision from the existing `ci-github-php` workflow
pins in the checkout. Dependency updates to those workflow pins also update local
builds. No separate resolver revision needs configuration. Its Docker entry point
reads the project through a read-only mount and requires no PHP on the host.

```sh
set -eu
workflow_ref=$(grep -hE '^[[:space:]]*(-[[:space:]]*)?uses:' .github/workflows/*.y*ml |
  grep -oE 'hoverkraft-tech/ci-github-php/[^@[:space:]]+@[a-f0-9]{40}' |
  cut -d@ -f2 | sort -u)
if [ "${#workflow_ref}" -ne 40 ]; then
  echo 'Expected one consistent ci-github-php commit pin in .github/workflows.' >&2
  exit 1
fi
docker build --tag php-version-resolver \
  "https://github.com/hoverkraft-tech/ci-github-php.git#${workflow_ref}:actions/get-php-versions"
PHP_VERSION=$(docker run --rm --volume "$PWD:/project:ro" php-version-resolver)
docker build --build-arg "VERSION=$PHP_VERSION" .
```

Automatic selection requires workflow files with one consistent commit pin for
`ci-github-php`. Missing or conflicting pins stop the build before fetching the
resolver. Explicit `PHP_VERSION` overrides in the consumer Makefiles skip discovery.

Docker caches the resolver image's dependencies. Each invocation consults the release
catalog, so newly available compatible releases need no Makefile version edit. The
resolver prints the highest matching patch by default. Pass `/project` as its only
argument to print the complete JSON result instead.

Local Makefiles can keep a `PHP_VERSION` override for explicit compatibility testing.
When no override is supplied, use the resolver for the build and a stable local
development image name for subsequent commands.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/get-php-versions@7b1303edc25e97da2a297dd285a54cf4b6ae76a1 # 1.1.2
  with:
    # Project directory relative to the checkout.
    # Default: `.`
    working-directory: .
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                             | **Required** | **Default** |
| ----------------------- | ------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Project directory relative to the checkout. | **false**    | `.`         |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**         | **Description**                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`php-versions`** | JSON array of matching releases, with the newest compatible patch per minor, sorted ascending. Includes end-of-life versions allowed by require.php; excludes prereleases. |
| **`php-version`**  | Highest stable PHP release matching require.php.                                                                                                                           |

<!-- outputs:end -->
<!-- examples:start -->
<!-- examples:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-get--php--versions-blue?logo=github-actions)](https://github.com/marketplace/actions/get-php-versions)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-php)](https://github.com/hoverkraft-tech/ci-github-php/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-php)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-php/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
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
