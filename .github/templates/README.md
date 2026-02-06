# Workflow Templates

This directory contains reusable workflow templates and onboarding documentation for integrating repositories with the Hoverkraft documentation portal.

## Available Templates

### terraform-modules-ci-workflow.yml

CI workflow template for the terraform-modules repository that:
- Collects documentation files (README.md and module READMEs)
- Uploads them as an artifact
- Triggers documentation sync to the public-docs portal

**Usage:**
1. Copy this file to `terraform-modules/.github/workflows/main-ci.yml`
2. Configure required secrets and variables (see onboarding guide)
3. Push to main branch to trigger documentation sync

### TERRAFORM-MODULES-ONBOARDING.md

Complete onboarding guide for integrating terraform-modules with the documentation portal. Includes:
- Prerequisites and setup requirements
- Step-by-step implementation instructions
- Documentation structure overview
- Troubleshooting guide
- Maintenance procedures

## Creating New Templates

When creating templates for other repositories:

1. Base them on existing successful integrations (e.g., ci-github-nodejs)
2. Include proper permissions and security practices
3. Pin all action versions to specific SHAs
4. Document prerequisites clearly
5. Provide troubleshooting guidance

## Documentation Portal Architecture

The documentation portal uses a push-based sync system:

1. **Source Repository** (e.g., terraform-modules):
   - Prepares documentation artifact
   - Dispatches sync event to public-docs

2. **Public Docs Portal** (this repository):
   - Receives dispatch event
   - Downloads artifact
   - Categorizes content
   - Injects into documentation tree
   - Creates and merges PR
   - Deploys updates

For more details, see [Sync Documentation Dispatcher](../workflows/sync-docs-dispatcher.md).
