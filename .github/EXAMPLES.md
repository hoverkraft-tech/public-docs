# Documentation Aggregation - Usage Examples

This document provides examples of how to use the documentation aggregation system.

## Example 1: Basic Configuration

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

## Testing Locally

To test the documentation pull locally:

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
