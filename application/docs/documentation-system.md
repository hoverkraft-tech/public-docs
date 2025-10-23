---
sidebar_position: 3
---

# Documentation System

This documentation portal uses an automated system to aggregate documentation from all Hoverkraft projects while keeping the source documentation in each project repository.

## Architecture

The documentation system follows a **pull-based architecture**:

1. **Source Documentation** remains in each project repository (atomic and versioned with code)
2. **Central Portal** (this repository) pulls and aggregates documentation periodically
3. **Automated Sync** via GitHub Actions keeps documentation up-to-date

## How It Works

### Pull Mode (Default)

The system automatically pulls documentation from configured project repositories:

```
┌─────────────────────────────────────────────────────────┐
│  Project Repositories                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ project-a    │  │ project-b    │  │ project-c    │ │
│  │ └─ docs/     │  │ └─ docs/     │  │ └─ docs/     │ │
│  │    └─ *.md   │  │    └─ *.md   │  │    └─ *.md   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└───────────────┬─────────────────────────────────────────┘
                │ Pull via GitHub API
                ↓
┌─────────────────────────────────────────────────────────┐
│  Documentation Portal (public-docs)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ docs/projects/                                    │  │
│  │  ├─ project-a/  (aggregated docs)                │  │
│  │  ├─ project-b/  (aggregated docs)                │  │
│  │  └─ project-c/  (aggregated docs)                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Configuration

Documentation sources are configured in `.github/docs-sources.yml`:

```yaml
repositories:
  - repository: compose-action
    enabled: true
    docs_path: docs
    target_path: projects/compose-action
    branch: main
    description: GitHub Action for docker-compose operations
    
settings:
  default_branch: main
  include_readme: true
  add_source_metadata: true
  update_existing: true
```

### Source Metadata

Each pulled document includes metadata about its source:

```markdown
---
source_repo: compose-action
source_path: docs/usage.md
source_branch: main
last_synced: 2024-01-15T10:30:00.000Z
---

# Usage Guide
...
```

## Synchronization Process

The documentation is synchronized automatically through several mechanisms:

### 1. Scheduled Sync (Daily)

A GitHub Actions workflow runs daily at 6 AM UTC to:
1. Pull documentation content from configured repositories
2. Generate project metadata pages
3. Create a Pull Request with changes
4. Build and deploy the updated documentation

### 2. Manual Sync

You can trigger a manual sync:
- Via GitHub Actions workflow dispatch
- Or by running locally: `npm run sync-docs`

### 3. On Configuration Changes

When `.github/docs-sources.yml` or the sync scripts are updated, the workflow runs automatically.

## Scripts

### `pull-docs.js`

Pulls documentation content from project repositories:

```bash
npm run pull-docs
```

Features:
- Fetches documentation from GitHub API
- Respects configuration in `docs-sources.yml`
- Adds source metadata to documents
- Handles directories recursively
- Creates index files for each project

### `generate-docs.js`

Generates project metadata pages:

```bash
npm run generate-docs
```

Features:
- Scans all repositories in the organization
- Categorizes projects by type
- Generates the projects overview page
- Updates homepage with featured projects

### `sync-docs` (Combined)

Runs both operations in sequence:

```bash
npm run sync-docs
```

## Adding Documentation from a New Project

To add documentation from a new project:

1. **Ensure documentation exists in the project repository**:
   ```
   your-project/
   └── docs/
       ├── getting-started.md
       ├── usage.md
       └── api.md
   ```

2. **Add configuration to `.github/docs-sources.yml`**:
   ```yaml
   - repository: your-project
     enabled: true
     docs_path: docs
     target_path: projects/your-project
     branch: main
     description: Your project description
   ```

3. **Commit and push the configuration**:
   ```bash
   git add .github/docs-sources.yml
   git commit -m "docs: add documentation source for your-project"
   git push
   ```

4. **The workflow will automatically**:
   - Pull your documentation
   - Create project pages
   - Deploy the updated portal

## Best Practices

### For Project Maintainers

1. **Keep documentation with code**: Store docs in the same repository as your code
2. **Use standard structure**: Place documentation in a `docs/` directory
3. **Write in Markdown**: Use `.md` or `.mdx` files
4. **Add frontmatter**: Include metadata like title, description, sidebar position
5. **Keep README updated**: The README.md is automatically included

### For Documentation Portal

1. **Configure selectively**: Only pull documentation that adds value
2. **Use descriptive paths**: Target paths should be clear and organized
3. **Set reasonable limits**: Configure max file sizes appropriately
4. **Monitor sync results**: Check workflow logs for any issues
5. **Review PRs**: Automated PRs should be reviewed before merging

## Troubleshooting

### Documentation not appearing

1. Check if the repository is enabled in `docs-sources.yml`
2. Verify the `docs_path` matches your repository structure
3. Check workflow logs for errors
4. Ensure the documentation files are `.md` or `.mdx`

### Sync failures

1. Check GitHub API rate limits
2. Verify GITHUB_TOKEN has necessary permissions
3. Check if the branch exists in the source repository
4. Review file sizes (default limit: 1MB)

### Formatting issues

1. Ensure markdown is valid
2. Check frontmatter syntax
3. Verify relative links point to correct locations
4. Test locally with `npm run start`

## Future Enhancements

Potential improvements to the documentation system:

- **Push mode**: Allow projects to push documentation updates via webhooks
- **Version support**: Pull documentation from specific releases/tags
- **Translation support**: Aggregate translated documentation
- **Preview deployments**: Generate preview sites for documentation PRs
- **Validation**: Check documentation quality before pulling
- **Incremental sync**: Only pull changed files

## Resources

- [Configuration File](.github/docs-sources.yml)
- [Pull Script](.github/scripts/pull-docs.js)
- [Generate Script](.github/scripts/generate-docs.js)
- [Workflow](.github/workflows/update-docs.yml)
- [Docusaurus Documentation](https://docusaurus.io/)
