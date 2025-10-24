# Documentation Aggregation - Usage Examples

This document provides examples of how to use the documentation aggregation system in both pull and push modes.

## Pull Mode Examples

These examples are for the `.github/docs-sources.yml` configuration file.

### Example 1: Basic Configuration

Add a simple repository with documentation in a `docs/` folder:

```yaml
repositories:
  - repository: my-project
    enabled: true
    docs_path: docs
    target_path: projects/my-project
    branch: main
    description: My awesome project
```

## Example 2: README Only

Pull only the README.md from a repository:

```yaml
repositories:
  - repository: simple-tool
    enabled: true
    files:
      - README.md
    target_path: projects/simple-tool
    branch: main
    description: A simple tool
```

## Example 3: Custom Documentation Path

If your documentation is in a non-standard location:

```yaml
repositories:
  - repository: custom-project
    enabled: true
    docs_path: documentation
    target_path: projects/custom-project
    branch: develop
    description: Project with custom docs path
```

## Example 4: With Exclusions

Exclude certain files or patterns:

```yaml
repositories:
  - repository: big-project
    enabled: true
    docs_path: docs
    target_path: projects/big-project
    exclude:
      - "*.draft.md"
      - "internal/**"
      - "wip-*.md"
    description: Big project with internal docs
```

## Example 5: Multiple Specific Files

Pull multiple specific files:

```yaml
repositories:
  - repository: api-project
    enabled: true
    files:
      - README.md
      - docs/api-reference.md
      - docs/getting-started.md
    target_path: projects/api-project
    branch: main
    description: API project with specific docs
```

## Push Mode Examples

These examples are for workflows in **project repositories** that push their documentation to public-docs.

### Example 6: Basic Push Mode

Minimal configuration for pushing documentation on every commit:

```yaml
name: Push Documentation to Portal

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
      - 'README.md'
  workflow_dispatch:

jobs:
  push-docs:
    uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-push.yml@main
    with:
      source_repo: 'my-project'
      target_path: 'projects/my-project'
    secrets:
      PUBLIC_DOCS_TOKEN: ${{ secrets.PUBLIC_DOCS_TOKEN }}
```

### Example 7: Push with Custom Docs Path

If your documentation is in a non-standard location:

```yaml
jobs:
  push-docs:
    uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-push.yml@main
    with:
      source_repo: 'my-project'
      docs_path: 'documentation'
      target_path: 'projects/my-project'
      include_readme: false
    secrets:
      PUBLIC_DOCS_TOKEN: ${{ secrets.PUBLIC_DOCS_TOKEN }}
```

### Example 8: Push from Multiple Branches

Sync documentation from both main and develop branches:

```yaml
on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'docs/**'
      - 'README.md'

jobs:
  push-docs-main:
    if: github.ref == 'refs/heads/main'
    uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-push.yml@main
    with:
      source_repo: 'my-project'
      target_path: 'projects/my-project'
      branch: 'main'
    secrets:
      PUBLIC_DOCS_TOKEN: ${{ secrets.PUBLIC_DOCS_TOKEN }}

  push-docs-dev:
    if: github.ref == 'refs/heads/develop'
    uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-push.yml@main
    with:
      source_repo: 'my-project'
      target_path: 'projects/my-project-dev'
      branch: 'develop'
    secrets:
      PUBLIC_DOCS_TOKEN: ${{ secrets.PUBLIC_DOCS_TOKEN }}
```

### Example 9: Combined Pull and Push

Use both modes for redundancy and verification:

1. **In project repository** - Add push workflow for immediate updates
2. **In public-docs** - Keep pull configuration as backup

This ensures documentation is always up-to-date with push mode, while pull mode serves as a scheduled verification.

## Testing Locally

### Testing Pull Mode

```bash
# Set your GitHub token
export GITHUB_TOKEN="your_token_here"

# Pull documentation
cd application
npm run pull-docs

# View the results
ls -la docs/projects/

# Build to test
npm run build
```

### Testing Push Mode

Push mode can only be tested by:
1. Setting up the workflow in your project repository
2. Adding the `PUBLIC_DOCS_TOKEN` secret
3. Making a commit to `docs/**` or `README.md`
4. Checking the Actions tab for workflow execution

## Troubleshooting

### Repository not found

```
❌ Failed to pull from my-project: Not Found
```

**Solution**: Check that:
1. The repository exists in the hoverkraft-tech organization
2. Your GitHub token has access to read the repository
3. The repository name is spelled correctly

### Documentation path not found

```
⚠️  Path not found: my-project/docs
```

**Solution**: Check that:
1. The `docs_path` matches the actual directory in the repository
2. The branch specified exists
3. The directory contains files (not empty)

### File size limit exceeded

```
⚠️  Skipping large-file.md (exceeds max size: 2048000 bytes)
```

**Solution**: Either:
1. Increase `max_file_size` in settings
2. Split the large file into smaller files
3. Exclude the large file and link to it in GitHub instead
