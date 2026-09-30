---
title: Publish
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: actions/publish/README.md
source_branch: main
source_run_id: 36750297797
last_synced: 2026-09-30T17:25:01.644Z
---

<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItdXBsb2FkLWNsb3VkIiBjb2xvcj0iYmx1ZSI+PHBvbHlsaW5lIHBvaW50cz0iMTYgMTYgMTIgMTIgOCAxNiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMjEiPjwvbGluZT48cGF0aCBkPSJNMjAuMzkgMTguMzlBNSA1IDAgMCAwIDE4IDloLTEuMjZBOCA4IDAgMSAwIDMgMTYuMyI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE2IDE2IDEyIDEyIDggMTYiPjwvcG9seWxpbmU+PC9zdmc+) GitHub Action: Publish

<div align="center">
  <img src="https://opengraph.githubassets.com/01b6876d553477da7ccf8846b86b4310a0920f2c2ea5ba05db96c1f79b911084/hoverkraft-tech/ci-github-nodejs" width="60px" align="center" alt="Publish" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Publish a CI-produced Node.js package tarball to an npm-compatible registry

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/publish@df348077afa4e79725151d50606e9dc63f86dcb6 # 0.24.4
  with:
    # Artifact ID of one package tarball uploaded by the package action
    # This input is required.
    package-tarball-artifact-id: ""

    # Registry URL used by npm publish
    # Default: `https://registry.npmjs.org`
    registry-url: https://registry.npmjs.org

    # Package access: public, restricted, or empty to use npm defaults
    # Default: `public`
    access: public

    # npm distribution tag, such as latest, next, or canary; empty uses npm defaults
    tag: ""

    # Whether to request provenance for npmjs.org publishes (true or false)
    # Default: `true`
    provenance: "true"

    # Validate publishing without uploading the package (true or false)
    # Default: `false`
    dry-run: "false"

    # GitHub token for downloading the artifact; registry authentication uses NODE_AUTH_TOKEN or OIDC
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                         | **Description**                                                                                 | **Required** | **Default**                  |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ | ---------------------------- |
| **`package-tarball-artifact-id`** | Artifact ID of one package tarball uploaded by the package action                               | **true**     | -                            |
| **`registry-url`**                | Registry URL used by npm publish                                                                | **false**    | `https://registry.npmjs.org` |
| **`access`**                      | Package access: public, restricted, or empty to use npm defaults                                | **false**    | `public`                     |
| **`tag`**                         | npm distribution tag, such as latest, next, or canary; empty uses npm defaults                  | **false**    | -                            |
| **`provenance`**                  | Whether to request provenance for npmjs.org publishes (true or false)                           | **false**    | `true`                       |
| **`dry-run`**                     | Validate publishing without uploading the package (true or false)                               | **false**    | `false`                      |
| **`github-token`**                | GitHub token for downloading the artifact; registry authentication uses NODE_AUTH_TOKEN or OIDC | **false**    | `${{ github.token }}`        |

<!-- inputs:end -->
<!-- examples:start -->

## Examples

## Authentication

### npm trusted publishing

Configure an [npm trusted publisher](https://docs.npmjs.com/trusted-publishers/) for your repository and the caller workflow filename.

Use a GitHub-hosted runner and grant the publishing job `id-token: write`.

The action uses the current Node.js LTS runtime; trusted publishing requires Node.js 22.14.0 or newer and npm 11.5.1 or newer.

No npm token is needed. The npm package must already exist before configuring its trusted publisher.

For public packages, ensure `package.json` has a `repository.url` matching the GitHub repository for provenance.

### Registry tokens and GitHub Packages

Provide registry credentials as `NODE_AUTH_TOKEN` on the action step.

For npm token authentication, use an npm publishing token stored in a repository or environment secret.

For GitHub Packages, use a scoped package name, set the registry URL, and grant the job `packages: write`:

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/publish@df348077afa4e79725151d50606e9dc63f86dcb6 # 0.24.4
  with:
    package-tarball-artifact-id: ${{ needs.package.outputs.package-tarball-artifact-id }}
    registry-url: https://npm.pkg.github.com
    provenance: "false"
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The `github-token` input only authenticates artifact downloads; it is not an npm publishing credential.

## Dry runs and prereleases

A dry run downloads the same tarball and executes `npm publish --dry-run` without publishing:

```yaml
- uses: hoverkraft-tech/ci-github-nodejs/actions/publish@df348077afa4e79725151d50606e9dc63f86dcb6 # 0.24.4
  with:
    package-tarball-artifact-id: ${{ needs.package.outputs.package-tarball-artifact-id }}
    dry-run: "true"
    provenance: "false"
    tag: next
```

Dry runs do not verify registry authorization or reserve the package version.

Use `tag: next` for a prerelease tarball such as `1.2.0-rc.1`; the distribution tag does not change the version inside it.

Publish only after the checks for that exact artifact succeed. Re-running a successful publish for the same package version fails because npm versions are immutable.

<!-- examples:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-publish-blue?logo=github-actions)](https://github.com/marketplace/actions/publish)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-nodejs)](https://github.com/hoverkraft-tech/ci-github-nodejs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-nodejs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-nodejs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-nodejs/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
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
