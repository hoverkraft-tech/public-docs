---
sidebar_position: 3
---

# Documentation System

This documentation portal uses an automated system to aggregate documentation from all Hoverkraft projects while keeping the source documentation in each project repository.

## Architecture

The documentation system supports **both pull and push modes** for flexibility:

1. **Source Documentation** remains in each project repository (atomic and versioned with code)
2. **Central Portal** (this repository) aggregates documentation via pull or push
3. **Automated Sync** via GitHub Actions keeps documentation up-to-date

## Synchronization Modes

### Pull Mode (Scheduled)

The system automatically pulls documentation from configured project repositories on a schedule (daily):

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

**Advantages:**
- Centralized control over sync timing
- All projects synced together
- Changes reviewed via PRs (on schedule)
- Simple configuration

**Configuration:**

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

### Push Mode (Real-time)

Project repositories can push their documentation updates in real-time using a reusable workflow:

```
┌─────────────────────────────────────────────────────────┐
│  Project Repository (e.g., compose-action)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ On commit to docs/ or README.md                    │ │
│  │ └─ Workflow triggered                              │ │
│  │    └─ Calls public-docs reusable workflow          │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────┬─────────────────────────────────────────┘
                │ Push via workflow call
                ↓
┌─────────────────────────────────────────────────────────┐
│  Documentation Portal (public-docs)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Reusable workflow syncs docs immediately          │  │
│  │ └─ Commits and pushes changes to portal          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Advantages:**
- Real-time updates when documentation changes
- No waiting for scheduled sync
- Triggered automatically on commits
- Faster feedback loop

**Setup:**

To enable push mode for a project, add this workflow to the project repository (`.github/workflows/push-docs.yml`):

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
      source_repo: 'your-repo-name'
      docs_path: 'docs'
      target_path: 'projects/your-repo-name'
      branch: 'main'
      include_readme: true
    secrets:
      PUBLIC_DOCS_TOKEN: ${{ secrets.PUBLIC_DOCS_TOKEN }}
```

**Requirements:**
- Add `PUBLIC_DOCS_TOKEN` secret to project repository with write access to public-docs
- Token must have `contents: write` permission for public-docs repository

**When to use:**
- Use **push mode** for projects with frequent documentation updates
- Use **pull mode** for projects with less frequent updates or for bulk synchronization
- You can use both modes together for maximum flexibility

## Synchronization Process

### Pull Mode Process

The documentation is pulled automatically through several mechanisms:

#### 1. Scheduled Sync (Daily)

A GitHub Actions workflow runs daily at 6 AM UTC to:
1. Pull documentation content from configured repositories
2. Generate project metadata pages
3. Create a Pull Request with changes
4. Build and deploy the updated documentation

#### 2. Manual Sync

You can trigger a manual sync:
- Via GitHub Actions workflow dispatch
- Or by running locally: `npm run sync-docs`

#### 3. On Configuration Changes

When `.github/docs-sources.yml` or the sync scripts are updated, the workflow runs automatically.

### Push Mode Process

For push mode, documentation is pushed immediately when changes occur:

1. **Developer commits** documentation changes to project repository
2. **Workflow triggers** on commits to `docs/**` or `README.md`
3. **Reusable workflow** in public-docs is called with project parameters
4. **Documentation synced** directly to public-docs repository
5. **Changes committed** and deployed automatically

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

You can add documentation using either **pull mode** (scheduled) or **push mode** (real-time):

### Option 1: Pull Mode (Scheduled)

For projects with less frequent documentation updates:

1. **Ensure documentation exists in the project repository**:
   ```
   your-project/
   └── docs/
       ├── getting-started.md
       ├── usage.md
       └── api.md
   ```

2. **Add configuration to `.github/docs-sources.yml` in public-docs**:
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

4. **Documentation will sync**:
   - Daily at 6 AM UTC (automatic)
   - On manual workflow dispatch
   - Changes reviewed via PR

### Option 2: Push Mode (Real-time) - Recommended

For projects with frequent documentation updates or when you want immediate synchronization:

1. **Ensure documentation exists in the project repository** (same as pull mode)

2. **Add workflow to your project repository** (`.github/workflows/push-docs.yml`):
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
         source_repo: 'your-project'
         docs_path: 'docs'
         target_path: 'projects/your-project'
         branch: 'main'
         include_readme: true
       secrets:
         PUBLIC_DOCS_TOKEN: ${{ secrets.PUBLIC_DOCS_TOKEN }}
   ```

3. **Add secret to your project repository**:
   - Add `PUBLIC_DOCS_TOKEN` with write access to public-docs
   - Settings → Secrets → Actions → New repository secret

4. **Documentation will sync immediately**:
   - On every commit to `docs/**` or `README.md`
   - On manual workflow dispatch
   - No PR review (direct push to main)

### Using Both Modes

You can combine both modes:
- **Push mode** for immediate updates on documentation commits
- **Pull mode** as a scheduled backup/verification sync

## Best Practices

### For Project Maintainers

1. **Keep documentation with code**: Store docs in the same repository as your code
2. **Use standard structure**: Place documentation in a `docs/` directory
3. **Write in Markdown**: Use `.md` or `.mdx` files
4. **Add frontmatter**: Include metadata like title, description, sidebar position
5. **Keep README updated**: The README.md is automatically included
6. **Choose the right mode**: 
   - Use **push mode** for projects with active documentation development
   - Use **pull mode** for stable documentation or as a backup

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

- ✅ **Push mode**: ~~Allow projects to push documentation updates via webhooks~~ **Implemented** via reusable workflow
- **Version support**: Pull documentation from specific releases/tags
- **Translation support**: Aggregate translated documentation
- **Preview deployments**: Generate preview sites for documentation PRs
- **Validation**: Check documentation quality before pulling/pushing
- **Incremental sync**: Only pull changed files
- **Webhook support**: Alternative to workflow-based push mode

## Resources

- [Configuration File](https://github.com/hoverkraft-tech/public-docs/blob/main/.github/docs-sources.yml)
- [Pull Script](https://github.com/hoverkraft-tech/public-docs/blob/main/.github/scripts/pull-docs.js)
- [Generate Script](https://github.com/hoverkraft-tech/public-docs/blob/main/.github/scripts/generate-docs.js)
- [Pull Workflow](https://github.com/hoverkraft-tech/public-docs/blob/main/.github/workflows/update-docs.yml)
- [Push Workflow (Reusable)](https://github.com/hoverkraft-tech/public-docs/blob/main/.github/workflows/sync-docs-push.yml)
- [Example Push Workflow Template](https://github.com/hoverkraft-tech/public-docs/blob/main/.github/workflows/EXAMPLE-push-docs.yml.template)
- [Docusaurus Documentation](https://docusaurus.io/)
