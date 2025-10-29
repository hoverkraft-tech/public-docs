<!-- header:start -->

# GitHub Reusable Workflow: Push Documentation Helper

<div align="center">
  <img src="https://opengraph.githubassets.com/f2712028dc3c3df82acc9d60c6d95f346498c7f1354be8f2f6d6b408ce0a26c7/hoverkraft-tech/public-docs" width="60px" align="center" alt="Push Documentation Helper" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/public-docs)](https://github.com/hoverkraft-tech/public-docs/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/public-docs)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/public-docs?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/public-docs?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/public-docs/blob/main/CONTRIBUTING.md)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Reusable workflow that bundles project docs and triggers public portal sync

- Collects README and docs markdown, adds sync metadata, and uploads a short-lived artifact
- Dispatches a repository event so hoverkraft-tech/public-docs can ingest and publish updates

<!-- overview:end -->

## 🔄 Adding Documentation from a Project

To add documentation from a new project:

1. **Ensure documentation exists in the project repository**:

```txt
your-project/
└── docs/
    ├── getting-started.md
    ├── usage.md
    └── api.md
```

2. **Add secret to your project repository**:
   - Add `PUBLIC_DOCS_TOKEN` with `repo` scope
   - Settings → Secrets → Actions → New repository secret

3. **Documentation will sync immediately**:
   - On every commit to `docs/**` or `README.md`
   - On manual workflow dispatch
   - Auto-merged PR triggers build and deployment

<!-- usage:start -->

## Usage

```yaml
name: Push Documentation Helper
on:
  push:
    branches:
      - main
jobs:
  sync-docs-dispatcher:
    uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-dispatcher.yml@18facec04f2945f4d66d510e8a06568497b73c54 # 0.1.0
    secrets:
      # GitHub App private key to generate GitHub token in place of github-token.
      # See https://github.com/actions/create-github-app-token.
      github-app-key: ""
    with:
      # GitHub App ID to generate GitHub token in place of github-token.
      # See https://github.com/actions/create-github-app-token.
      github-app-id: ""

      # ID of the uploaded documentation artifact.
      #
      # This input is required.
      artifact-id: ""
```

<!-- usage:end -->

## Best Practices

### For Project Maintainers

1. **Keep documentation with code**: Store docs in the same repository as your code
2. **Use standard structure**: Place documentation in a `docs/` directory
3. **Write in Markdown**: Use `.md` or `.mdx` files
4. **Add frontmatter**: Include metadata like title, description, sidebar position
5. **Keep readme updated**: The README.md is automatically included

### For Documentation Portal

1. **Use descriptive paths**: Target paths should be clear and organized
2. **Monitor sync results**: Check workflow logs for any issues
3. **Maintain consistency**: Use consistent naming conventions across projects

## Troubleshooting

### Documentation not appearing

1. Verify the workflow is added to your project repository
2. Check that `PUBLIC_DOCS_TOKEN` secret is configured correctly
3. Check workflow logs in your project repository
4. Verify the receiver workflow ran successfully in public-docs
5. Ensure the documentation files are `.md` or `.mdx`
6. Verify the target path is correct

### Sync failures

1. Check that token has `repo` scope for repository_dispatch
2. Verify the branch exists in the source repository
3. Review workflow run logs in both repositories
4. Check if build validation failed in public-docs

### Build validation failures

1. Build and validation are handled by the push to main workflow
2. Check the update-docs.yml workflow for build errors
3. Ensure Markdown is valid
4. Check frontmatter syntax
5. Verify relative links point to correct locations
6. Test locally with `npm run start` before pushing

<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**           | **Description**                                                  | **Required** | **Type**   | **Default** |
| ------------------- | ---------------------------------------------------------------- | ------------ | ---------- | ----------- |
| **`github-app-id`** | GitHub App ID to generate GitHub token in place of github-token. | **false**    | **string** | -           |
|                     | See <https://github.com/actions/create-github-app-token>.        |              |            |             |
| **`artifact-id`**   | ID of the uploaded documentation artifact.                       | **true**     | **string** | -           |

<!-- inputs:end -->
<!-- secrets:start -->

## Secrets

| **Secret**           | **Description**                                                           | **Required** |
| -------------------- | ------------------------------------------------------------------------- | ------------ |
| **`github-app-key`** | GitHub App private key to generate GitHub token in place of github-token. | **false**    |
|                      | See <https://github.com/actions/create-github-app-token>.                 |              |

<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
<!-- examples:start -->
<!-- examples:end -->
<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/public-docs/blob/main/CONTRIBUTING.md) for more details.

<!-- contributing:end -->
<!-- security:start -->
<!-- security:end -->
<!-- license:start -->

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2025 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
