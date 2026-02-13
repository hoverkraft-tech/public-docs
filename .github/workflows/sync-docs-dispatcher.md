<!-- header:start -->

# GitHub Reusable Workflow: Push Documentation Helper

<div align="center">
  <img src="https://opengraph.githubassets.com/8eb0bf8882dd37ba8e876d020616e87e70e64f5b65190c23847731078d190ac0/hoverkraft-tech/public-docs" width="60px" align="center" alt="Push Documentation Helper" />
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

- Collects readme and docs Markdown, adds sync metadata, and uploads a short-lived artifact
- Dispatches a repository event so hoverkraft-tech/public-docs can ingest and publish updates

### Permissions

- **`contents`**: `read`

<!-- overview:end -->

## Important Note

**This is a reusable workflow** (job-level `uses:`), **not an action** (step-level `uses:`). It must be called at the job level in your workflow file.

## Quick Start

### Prerequisites

1. **GitHub App Token** configured in your repository:
   - Required scopes: `repo` (for repository_dispatch) and artifact access
   - Add `PUBLIC_DOCS_APP_ID` as a repository **variable**
   - Add `PUBLIC_DOCS_APP_PRIVATE_KEY` as a repository **secret**
   - Settings → Secrets and variables → Actions

2. **Documentation files** in your project repository:

```txt
your-project/
├── README.md                 # Automatically included
├── docs/
│   ├── getting-started.md
│   └── api.md
└── .github/workflows/*.md    # Workflow documentation (optional)
```

### Complete Integration Example

For a full example of integrating this workflow into your CI pipeline, see the [Examples](#examples) section below.

### Key Integration Points

1. **Workflow vs Action**: This is a **reusable workflow** - use `uses:` at the **job level**, not as a step
2. **Version pinning**: Always pin to a specific commit SHA for security
3. **Conditional execution**: Skip on scheduled runs with `if: github.event_name != 'schedule'`
4. **Main branch only**: Typically only sync from main/default branch
5. **After CI**: Add as a job that runs after your primary CI job completes
6. **Prepare first**: Use the prepare-docs action before calling this workflow

<!-- usage:start -->

## Usage

```yaml
name: Push Documentation Helper
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  sync-docs-dispatcher:
    uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-dispatcher.yml@c40c17f7d6a8090950b3ef4bfc70502707a6bb9f # 0.3.0
    permissions: {}
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

## Implementation Guide

### GitHub App Token Setup

The workflow requires a GitHub App token with specific permissions:

1. **Create or use existing GitHub App**:
   - Navigate to GitHub Settings → Developer settings → GitHub Apps
   - Ensure the app has `contents: read/write` and `repository_dispatch: write` permissions

2. **Configure repository secrets and variables**:
   - Add `PUBLIC_DOCS_APP_ID` as a **repository variable** (not secret)
   - Add `PUBLIC_DOCS_APP_PRIVATE_KEY` as a **repository secret**
   - Settings → Secrets and variables → Actions

3. **Required scopes**:
   - `repo` scope for repository_dispatch events
   - Artifact access to upload documentation bundles

### Version Pinning Strategy

**Always pin to a specific commit SHA** for security and reproducibility:

```yaml
# ✅ GOOD: Pinned to commit SHA with version comment
uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-dispatcher.yml@18facec04f2945f4d66d510e8a06568497b73c54 # 0.1.0

# ❌ BAD: Using branch or tag directly (security risk)
uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-dispatcher.yml@main
uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-dispatcher.yml@v0.1.0
```

**To update to a new version**:

1. Check the [releases page](https://github.com/hoverkraft-tech/public-docs/releases)
2. Find the commit SHA for the desired version tag
3. Update both the SHA and the version comment

### YAML Formatting for Linters

For repositories with strict yamllint rules (e.g., line length limits):

```yaml
# Single line format (preferred for yamllint compatibility)
uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-dispatcher.yml@18facec04f2945f4d66d510e8a06568497b73c54 # 0.1.0

# If line is too long, yamllint may still complain - consider:
# 1. Disabling line-length for specific lines
# 2. Using shorter variable names
# 3. Keeping version comment concise
```

### Path Pattern Recommendations

When using the prepare-docs action, use **specific glob patterns** for Markdown files only:

```yaml
# ✅ GOOD: Specific patterns for documentation files
paths: |
  README.md
  docs/**/*.md
  .github/workflows/*.md
  actions/**/README.md

# ❌ BAD: Too broad, includes non-documentation files
paths: |
  docs/
  .github/workflows/
  actions/
```

**Best practices**:

- Always include file extensions (`.md`, `.mdx`)
- Use `**/*.md` for recursive matching in directories
- Explicitly list root-level files like `README.md`
- Avoid matching entire directories without file patterns

### Workflow Architecture

The sync-docs system uses a two-workflow architecture:

```txt
┌─────────────────────────────────────────────────┐
│  Your Project Repository                        │
│  ┌───────────────────────────────────────────┐  │
│  │ Step 1: Prepare Documentation             │  │
│  │ - Collect Markdown files                  │  │
│  │ - Add source metadata                     │  │
│  │ - Upload as artifact                      │  │
│  └─────────────┬─────────────────────────────┘  │
│                │                                 │
│  ┌─────────────▼─────────────────────────────┐  │
│  │ Step 2: Dispatch (this workflow)          │  │
│  │ - Send repository_dispatch event          │  │
│  │ - Reference uploaded artifact             │  │
│  └───────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────┘
                  │ repository_dispatch
                  ▼
┌─────────────────────────────────────────────────┐
│  hoverkraft-tech/public-docs                    │
│  ┌───────────────────────────────────────────┐  │
│  │ Step 3: Receiver Workflow                 │  │
│  │ - Download artifact from source repo      │  │
│  │ - Extract and inject docs                 │  │
│  │ - Create and auto-merge PR                │  │
│  │ - Trigger build and deployment            │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Best Practices

### Documentation Content

1. **Keep documentation with code**: Store docs in the same repository as your code
2. **Use standard structure**: Place documentation in a `docs/` directory
3. **Write in Markdown**: Use `.md` or `.mdx` files for compatibility
4. **Add frontmatter**: Include metadata like title, description, sidebar position
5. **Keep readme updated**: The README.md is automatically included in sync
6. **Use descriptive paths**: Organize documentation with clear directory structure
7. **Monitor sync results**: Check workflow logs for any issues after changes
8. **Maintain consistency**: Use consistent naming conventions across projects

## Troubleshooting

### Documentation not appearing

1. **Verify workflow integration**:
   - Check the workflow file exists in `.github/workflows/` directory
   - Ensure `uses:` is at the job level, not step level
   - Confirm the job runs after CI completes successfully

2. **Verify token configuration**:
   - Check `PUBLIC_DOCS_APP_ID` is set as a repository variable
   - Check `PUBLIC_DOCS_APP_PRIVATE_KEY` is set as a repository secret
   - Verify the GitHub App has `repo` and `repository_dispatch` permissions

3. **Check workflow execution**:
   - Navigate to Actions tab in your project repository
   - Verify the sync-docs job ran successfully
   - Review workflow logs for any error messages

4. **Verify dispatch event**:
   - Check [public-docs workflow runs](https://github.com/hoverkraft-tech/public-docs/actions/workflows/sync-docs-receiver.yml)
   - Look for a run triggered by your repository_dispatch event
   - Review receiver workflow logs for processing status

5. **Validate artifact**:
   - Ensure artifact was uploaded successfully in your workflow run
   - Check that artifact-id matches between prepare and dispatcher jobs
   - Verify artifact contains expected documentation files

### Sync failures

1. **Token permission issues**:
   - Verify GitHub App has `contents: write` permission for public-docs
   - Check App installation includes hoverkraft-tech/public-docs repository
   - Ensure token has `repository_dispatch` write access

2. **Artifact access issues**:
   - Confirm artifact retention period hasn't expired (default: 90 days)
   - Verify artifact-id is correct and matches uploaded artifact
   - Check artifact size isn't exceeding GitHub limits

3. **Workflow validation**:
   - Review dispatcher workflow logs in source repository
   - Review receiver workflow logs in public-docs repository
   - Look for repository_dispatch event delivery confirmation

### Build validation failures

1. **Check public-docs build logs**:
   - Navigate to [public-docs Actions](https://github.com/hoverkraft-tech/public-docs/actions)
   - Find the build triggered by the sync PR merge
   - Review build errors and validation issues

2. **Common build issues**:
   - Invalid Markdown syntax or frontmatter
   - Broken relative links between documentation files
   - Missing or incorrect image references
   - Docusaurus configuration conflicts

3. **Local validation**:
   - Clone public-docs repository
   - Place your docs in the expected location
   - Run `npm run start` to test locally
   - Fix any errors before syncing again

### Verification Steps

After setting up sync-docs:

1. **Test the integration**:
   - Make a minor change to README.md or a doc file
   - Commit to main branch
   - Watch the workflow run in Actions tab

2. **Verify dispatch**:
   - Check workflow summary shows "Documentation Dispatch Summary"
   - Confirm artifact ID and repository information is correct

3. **Confirm sync completion**:
   - Wait for public-docs receiver workflow to complete
   - Check for auto-merged PR in public-docs
   - Verify documentation appears at <https://docs.hoverkraft.tech>

4. **Monitor build and deployment**:
   - Check public-docs main CI workflow after PR merge
   - Verify deployment to GitHub Pages succeeds
   - Visit documentation portal to see live changes

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

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
