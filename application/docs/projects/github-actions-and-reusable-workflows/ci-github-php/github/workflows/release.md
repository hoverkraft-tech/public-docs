---
source_repo: hoverkraft-tech/ci-github-php
source_path: .github/workflows/release.md
source_branch: main
source_run_id: 43042691904
last_synced: 2026-11-11T14:55:33.688Z
---

<!-- header:start -->

# GitHub Reusable Workflow: Release Composer Package

<div align="center">
  <img src="https://opengraph.githubassets.com/a34afe6048695ba84de01344b4411e2ff7f3d84ff89656758648d934c793f392/hoverkraft-tech/ci-github-php" width="60px" align="center" alt="Release Composer Package" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Publish a Composer library after preparation and successful validation of the same
source commit. Both Node.js and Composer callers follow prepare, validate and release.

### Release model

Composer derives library versions from Git tags. Keep `version` out of
`composer.json`. Preparation plans the tag without changing source files, creating
Git tags or dispatching another run. Validation checks that same commit. Publication
verifies the source and tag again, then creates the GitHub release. GitHub provides
source archives; Packagist discovers tags through its configured update integration.

Use `ci-github-publish` for version planning, tag verification, release notes and
publication. A Composer source release needs no package artifact, version commit,
GitHub App or `CHANGELOG.md`. Repository and tag rules still apply.

### Complete caller workflow

Pin the same reviewed PHP workflow commit throughout the caller. Validation is
independent: use your own job or the shared CI workflow. Optional distribution
checks belong to validation; publication does not build, install dependencies or
run tests. Gate validation on preparation being ready, and publication on both jobs.
Pass the prepared tag unchanged. Every stage must use the same source commit.

```yaml
name: Release
on:
  workflow_dispatch:
    inputs:
      force:
        description: Release even without relevant changes
        type: boolean
        default: false
  schedule:
    - cron: "37 7 * * 1"
permissions: {}
concurrency:
  group: composer-release
  cancel-in-progress: false
jobs:
  prepare:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/prepare-package-release.yml@<commit-sha>
    permissions:
      contents: read
      pull-requests: read
    with:
      force: ${{ github.event_name == 'workflow_dispatch' && inputs.force || false }}
      release-config: &release-config |
        tag-template: v$RESOLVED_VERSION
        tag-prefix: v
  validate:
    needs: prepare
    if: needs.prepare.outputs.status == 'ready'
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@<commit-sha>
    permissions:
      contents: read
      id-token: write
    with:
      package: "true"
  release:
    needs: [prepare, validate]
    uses: hoverkraft-tech/ci-github-php/.github/workflows/release.yml@<commit-sha>
    permissions:
      contents: write
      pull-requests: read
    with:
      tag: ${{ needs.prepare.outputs.tag }}
      release-config: *release-config
    secrets:
      changelog-summary: ${{ secrets.CHANGELOG_SUMMARY }}
```

### No changes, force, and retries

Preparation returns `no-changes` when there is nothing to release. Both validation
and publication are skipped. `ready` supplies the planned tag and allows validation;
`released` means an explicitly retried tag is already published, so no work is needed.

On a manual default-branch run, `force: true` asks the shared planner for a release
even without changes. The configured version rules determine the next version;
force preserves that planned identity. Existing tag collisions fail. Schedules
ignore force. Tags are never moved.

Rerun a failed workflow to retry publication. To recover an older version after the
default branch advances, dispatch against its existing tag. Tag retries bypass version
planning and keep the original tag; force is ignored. The shared verifier requires
that tag to exist and match this run's source commit. Draft releases can be resumed.

The caller's concurrency group serializes the complete journey. The reusable
preparation and publication workflows use separate groups; keep caller names distinct
and disable cancellation. Validation failure prevents tag or release creation.

### Release configuration and summaries

Use partial YAML or JSON `release-config`, or `.github/release-config.yml`, as
supported by `ci-github-publish`. Shared defaults are inherited, repository settings
override them, and input settings take precedence. Pass identical configuration to
preparation and publication. Composer tags must be stable `X.Y.Z` or `vX.Y.Z` versions;
match the repository's existing tag prefix.

`changelog-summary` accepts the public JSON configuration supported by
`ci-github-publish/actions/release/create`, including its summary providers.
Use the optional secret for configuration containing credentials; it takes precedence
over the input. Omit both for generated release notes without AI.

See the [ci-github-publish release guide](https://github.com/hoverkraft-tech/ci-github-publish/blob/main/.github/workflows/release.md)
for configuration and summary details. Register the repository with Packagist and
configure its GitHub integration separately.

### Prepare release labels

Keep a separate `.github/workflows/prepare-release.yml` caller for the shared
`ci-github-publish/.github/workflows/prepare-release.yml`. It applies release labels
from Conventional Commit pull request titles. Package release preparation uses
`prepare-package-release.yml` and runs on manual or scheduled release events.
The label workflow uses pull request events `opened`, `reopened`, `synchronize`,
and `edited`, with `contents: read` and `pull-requests: write` permissions.
The shared label workflow owns its concurrency group.

### Permissions

- **`contents`**: `write`
- **`pull-requests`**: `read`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Release Composer Package
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  release:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/release.yml@7b1303edc25e97da2a297dd285a54cf4b6ae76a1 # 1.1.2
    permissions:
      contents: write
      pull-requests: read
    secrets:
      # Complete optional JSON summary configuration, including provider credentials. Overrides the input.
      changelog-summary: ""
    with:
      # Composer version tag returned by prepare-package-release. Require successful validation of this source commit with needs before publication.
      # This input is required.
      tag: ""

      # Partial YAML or JSON configuration forwarded to ci-github-publish/actions/release/create. Use the same configuration as preparation.
      release-config: ""

      # Optional JSON summary configuration forwarded to ci-github-publish/actions/release/create. Supports its providers and options. Use the secret for credentials.
      changelog-summary: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**               | **Description**                                                                                                                                                | **Required** | **Type**   | **Default** |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | ----------- |
| **`tag`**               | Composer version tag returned by prepare-package-release. Require successful validation of this source commit with needs before publication.                   | **true**     | **string** | -           |
| **`release-config`**    | Partial YAML or JSON configuration forwarded to ci-github-publish/actions/release/create. Use the same configuration as preparation.                           | **false**    | **string** | -           |
| **`changelog-summary`** | Optional JSON summary configuration forwarded to ci-github-publish/actions/release/create. Supports its providers and options. Use the secret for credentials. | **false**    | **string** | -           |

<!-- inputs:end -->
<!-- secrets:start -->

## Secrets

| **Secret**              | **Description**                                                                                    | **Required** |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------ |
| **`changelog-summary`** | Complete optional JSON summary configuration, including provider credentials. Overrides the input. | **false**    |

<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
<!-- badges:start -->

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

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
