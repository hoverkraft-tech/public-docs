# Documentation Aggregation System

This directory contains the scripts and configuration for aggregating documentation from Hoverkraft projects.

## Overview

The documentation aggregation system allows this portal to pull documentation content from individual project repositories while keeping the source of truth in each project.

## Files

### Configuration

- **`docs-sources.yml`**: Configuration file defining which repositories to pull documentation from and how to organize it.

### Scripts

- **`scripts/pull-docs.js`**: Pulls documentation content from configured project repositories via GitHub API.
- **`scripts/generate-docs.js`**: Generates project listing pages and metadata from repository information.

### Workflows

- **`workflows/update-docs.yml`**: GitHub Actions workflow that runs the documentation synchronization daily and on demand.

## Quick Start

### Running Locally

1. **Set up GitHub token**:
   ```bash
   export GITHUB_TOKEN="your_github_token"
   ```

2. **Pull documentation**:
   ```bash
   cd application
   npm run pull-docs
   ```

3. **Generate project pages**:
   ```bash
   npm run generate-docs
   ```

4. **Or run both**:
   ```bash
   npm run sync-docs
   ```

### Adding a New Documentation Source

1. Edit `docs-sources.yml`:
   ```yaml
   repositories:
     - repository: my-new-project
       enabled: true
       docs_path: docs
       target_path: projects/my-new-project
       branch: main
       description: My new project documentation
   ```

2. Commit and push:
   ```bash
   git add .github/docs-sources.yml
   git commit -m "docs: add source for my-new-project"
   git push
   ```

3. The workflow will automatically sync the new documentation.

## Configuration Options

### Repository Configuration

```yaml
- repository: project-name        # Repository name in hoverkraft-tech org
  enabled: true                   # Whether to pull docs from this repo
  docs_path: docs                 # Path to docs in the repository
  target_path: projects/name      # Where to place docs in this portal
  branch: main                    # Branch to pull from
  description: Project description # Description for the index page
  files:                          # Optional: specific files to pull
    - README.md
  exclude:                        # Optional: patterns to exclude
    - "*.draft.md"
```

### Global Settings

```yaml
settings:
  default_branch: main            # Default branch if not specified
  default_docs_path: docs         # Default docs path if not specified
  include_readme: true            # Pull README.md from repo root
  add_source_metadata: true       # Add source info to frontmatter
  update_existing: true           # Update existing docs on sync
  max_file_size: 1024            # Max file size in KB
  allowed_extensions:             # File extensions to include
    - .md
    - .mdx
```

## How It Works

1. **Configuration Loading**: Reads `docs-sources.yml` to determine which repositories to process.

2. **Content Fetching**: For each enabled repository:
   - Fetches README.md from the repository root
   - Fetches documentation from the specified `docs_path`
   - Applies filters based on configuration

3. **Content Processing**:
   - Adds source metadata to frontmatter
   - Creates target directories
   - Writes files to the appropriate location

4. **Index Generation**: Creates an index file for each project's documentation.

5. **Cleanup**: Removes documentation from repositories that are no longer configured.

6. **Project Pages**: Generates overview pages with repository metadata.

## Workflow Triggers

The update-docs workflow runs:

- **Daily**: At 6 AM UTC (scheduled)
- **Manual**: Via workflow dispatch
- **On Push**: When scripts or configuration are updated

## Permissions

The workflow requires:
- `contents: write` - To commit and push changes
- `pull-requests: write` - To create PRs with updates

## Architecture Decisions

### Why Pull Mode?

**Pull mode** was chosen as the primary mechanism because:

1. **Centralized Control**: This portal controls when and what to sync
2. **Consistency**: Ensures all projects are synced at the same time
3. **Validation**: Allows validation before publishing
4. **Simplicity**: No webhooks or external triggers needed
5. **Review Process**: Changes can be reviewed via PRs before deployment

### Future: Push Mode

A push mode could be added where projects can trigger documentation updates via:
- Repository dispatch events
- Workflow calls
- Webhooks

This would provide faster updates but requires more coordination.

## Troubleshooting

### Permission Errors

Ensure the `GITHUB_TOKEN` has read access to all repositories:
```bash
# Test token access
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/hoverkraft-tech/compose-action
```

### Rate Limiting

The GitHub API has rate limits:
- Authenticated: 5,000 requests per hour
- The script is designed to minimize API calls
- Each repository typically requires 2-5 API calls

### Missing Documentation

Check:
1. Repository is enabled in config
2. `docs_path` is correct
3. Branch exists and has documentation
4. Files are within size limits
5. File extensions are allowed

### Build Failures

If documentation causes build failures:
1. Check markdown syntax
2. Verify frontmatter is valid YAML
3. Test locally: `npm run build`
4. Review Docusaurus logs

## Maintenance

### Regular Tasks

- Review and merge automated PRs
- Update configuration as projects are added/removed
- Monitor workflow execution logs
- Update scripts for new requirements

### Monitoring

Check:
- Workflow success rate
- Documentation freshness
- API rate limit usage
- Build times

## Contributing

To contribute improvements:

1. Test changes locally first
2. Update this documentation
3. Add logging for debugging
4. Consider backwards compatibility
5. Test with multiple repositories

## Related Documentation

- [Documentation System](../application/docs/documentation-system.md) - User-facing documentation
- [Docusaurus Configuration](../application/docusaurus.config.ts) - Portal configuration
- [GitHub Actions Workflow](workflows/update-docs.yml) - Automation workflow
