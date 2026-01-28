# Onboarding terraform-modules Repository to Documentation Portal

This document provides the setup instructions for integrating the terraform-modules repository with the Hoverkraft documentation portal.

## Overview

The terraform-modules repository needs to sync its documentation to this portal. This document outlines the steps required to enable automatic documentation synchronization.

## Prerequisites

Before setting up documentation sync, ensure the following are configured in the terraform-modules repository:

1. **GitHub App Credentials** (if not already configured):
   - Repository **variable**: `PUBLIC_DOCS_APP_ID`
   - Repository **secret**: `PUBLIC_DOCS_APP_PRIVATE_KEY`
   - These credentials enable the repository to dispatch events to the public-docs portal

2. **Repository topics** (already configured):
   - The terraform-modules repository already has the appropriate topics (`terraform`, `infrastructure-as-code`, etc.)
   - These topics categorize it under "Infrastructure & DevOps" in the documentation portal

## Implementation Steps

### Step 1: Add CI Workflow

Add a new workflow file to the terraform-modules repository at `.github/workflows/main-ci.yml`:

**Option A: Simple approach** (recommended for terraform-modules)

Use the template workflow provided in this repository: `.github/templates/terraform-modules-ci-workflow.yml`

This workflow:
- Collects the main README.md and all module READMEs
- Uploads them as an artifact
- Triggers the documentation sync to this portal

### Step 2: Verify Repository Settings

Ensure the following settings are configured in the terraform-modules repository:

1. Navigate to Settings → Secrets and variables → Actions
2. Verify these exist:
   - **Variable**: `PUBLIC_DOCS_APP_ID` with the GitHub App ID value
   - **Secret**: `PUBLIC_DOCS_APP_PRIVATE_KEY` with the private key value

### Step 3: Test the Integration

1. Create a test branch in terraform-modules
2. Add the CI workflow file
3. Merge to main branch
4. Check the Actions tab to verify:
   - The `prepare-docs` job runs successfully
   - The `sync-docs` job dispatches to public-docs
5. Verify in public-docs repository:
   - Check the Actions tab for a "Sync Documentation Receiver" workflow run
   - Verify a PR was created with the documentation
   - Check that the PR merges successfully

### Step 4: Verify Documentation Portal

Once the sync completes:

1. Visit https://docs.hoverkraft.cloud/docs/projects/
2. Find "Infrastructure & DevOps" section
3. Locate "terraform-modules" card
4. Verify it now has a "Documentation" link
5. Click the documentation link to view the synced content

## Documentation Structure

The terraform-modules documentation will be organized as follows in the portal:

```
application/docs/projects/infrastructure-devops/terraform-modules/
├── index.md                    # Main README
├── aws/
│   ├── s3-bucket/
│   │   └── index.md           # Module-specific README
│   └── eks-cluster/
│       └── index.md
├── ovh/
│   └── kube-managed/
│       └── index.md
└── github/
    └── repository/
        └── index.md
```

## Troubleshooting

### Sync Not Triggering

If documentation doesn't sync after pushing to main:

1. Check workflow logs in terraform-modules Actions tab
2. Verify artifact was created successfully
3. Check that `sync-docs` job ran
4. Verify credentials are correct in repository settings

### Documentation Not Appearing

If the sync runs but docs don't appear:

1. Check public-docs Actions tab for receiver workflow
2. Review logs for any errors
3. Verify the PR was created and merged
4. Check for build errors in public-docs CI

### Permission Errors

If you encounter permission errors:

1. Verify GitHub App has correct permissions:
   - Repository: contents (read/write)
   - Repository: repository_dispatch (write)
2. Ensure App is installed on both repositories
3. Check that secrets and variables are set correctly

## Maintenance

### Updating Documentation

Documentation syncs automatically on every push to the main branch. To update:

1. Edit README files in terraform-modules
2. Commit and push to main
3. Wait for CI to complete
4. Documentation portal updates automatically

### Workflow Updates

If the sync workflow needs updates:

1. Update `.github/workflows/main-ci.yml` in terraform-modules
2. Test on a feature branch first
3. Merge to main once verified

## Additional Resources

- [Sync Documentation Dispatcher Workflow](..workflows/sync-docs-dispatcher.md)
- [Documentation Generation Action](../actions/generate-docs/README.md)
- [Repository Categorizer](../actions/resolve-docs-target/lib/repository-categorizer.js)

## Support

For issues or questions:

1. Open an issue in the public-docs repository
2. Tag with `documentation` label
3. Provide workflow run links for troubleshooting
