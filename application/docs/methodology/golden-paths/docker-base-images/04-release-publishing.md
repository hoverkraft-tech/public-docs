---
sidebar_position: 4
---

# Release and Publishing

This page covers setting up the release workflow for your Docker base images repository. You'll configure semantic versioning and automated release publishing.

## Release Workflow Overview

The release process follows this flow:

```txt
Main branch → Prepare Release → Create Release PR → Merge → Build Release Images
                                                              ↓
                                                    Tag with semver versions
                                                              ↓
                                                    Push to Registry
```

## Step 1: Create the Prepare Release Workflow

This workflow creates a release PR when triggered manually or on a schedule.

Create `.github/workflows/__prepare-release.yml`:

```yaml
name: Prepare release

on:
  workflow_dispatch:

permissions: {}

jobs:
  prepare-release:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/prepare-release.yml@main
    permissions:
      contents: write
      id-token: write
      pull-requests: write
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

### What This Does

When triggered:

1. Analyzes commits since the last release
2. Determines the next version based on conventional commits
3. Creates a release PR with:
   - Version bump
   - Changelog updates
   - Release notes

### Triggering Manually

1. Go to **Actions** tab in your repository
2. Select **Prepare release** workflow
3. Click **Run workflow**

## Step 2: Create the Release Workflow

This workflow builds and publishes release images when a GitHub release is created.

Create `.github/workflows/__release.yml`:

```yaml
name: Release

on:
  release:
    types:
      - published

permissions: {}

jobs:
  release:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/release.yml@main
    permissions:
      contents: read
      id-token: write
      packages: write
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Configuration Options

```yaml
jobs:
  release:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/release.yml@main
    permissions:
      contents: read
      id-token: write
      packages: write
    with:
      # Custom runners
      runs-on: '["ubuntu-latest"]'

      # OCI registry
      oci-registry: ghcr.io

      # Platforms to build
      platforms: '["linux/amd64","linux/arm64"]'

      # Mark as prerelease
      prerelease: false
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

### What This Does

When a release is published:

1. Builds all images for configured platforms
2. Tags images with semantic versions:
   - Full version: `v1.2.3`
   - Minor version: `v1.2`
   - Major version: `v1`
   - Latest: `latest` (for non-prerelease)
3. Pushes images to the registry

## Image Tag Strategy

### PR Builds

```txt
ghcr.io/<owner>/<repo>/<image>:pr-42
ghcr.io/<owner>/<repo>/<image>:pr-42-abc1234
```

### Main Branch Builds

```txt
ghcr.io/<owner>/<repo>/<image>:main
ghcr.io/<owner>/<repo>/<image>:sha-abc1234
```

### Release Builds

```txt
ghcr.io/<owner>/<repo>/<image>:v1.2.3
ghcr.io/<owner>/<repo>/<image>:v1.2
ghcr.io/<owner>/<repo>/<image>:v1
ghcr.io/<owner>/<repo>/<image>:latest
```

## Version Bumping

The version is determined automatically based on conventional commit prefixes:

| Commit Prefix      | Version Bump | Example       |
| ------------------ | ------------ | ------------- |
| `feat:`            | Minor        | 1.0.0 → 1.1.0 |
| `fix:`             | Patch        | 1.0.0 → 1.0.1 |
| `BREAKING CHANGE:` | Major        | 1.0.0 → 2.0.0 |
| `feat!:`           | Major        | 1.0.0 → 2.0.0 |

## Using GitHub App for Releases (Optional)

For more control over release automation, you can use a GitHub App instead of `GITHUB_TOKEN`:

```yaml
jobs:
  prepare-release:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/prepare-release.yml@main
    permissions:
      contents: write
      id-token: write
      pull-requests: write
    with:
      github-app-id: ${{ vars.RELEASE_APP_ID }}
    secrets:
      github-app-key: ${{ secrets.RELEASE_APP_KEY }}
```

This allows:

- Triggering workflows from release PRs
- Better audit trails
- Fine-grained permissions

## Release Process Walkthrough

### Creating a Release

1. **Prepare the release**:
   - Go to Actions → Prepare release → Run workflow
   - A PR will be created with version bump and changelog

2. **Review the release PR**:
   - Verify the version is correct
   - Review the changelog
   - Merge when ready

3. **Create the GitHub release**:
   - Go to Releases → Draft a new release
   - Choose the new version tag
   - Generate release notes
   - Publish the release

4. **Verify images**:
   - Check the Packages section
   - Verify all images have the new version tags

### Automated Release (Advanced)

You can automate step 3 by modifying the prepare-release workflow to auto-publish:

```yaml
# Note: This requires a GitHub App for proper workflow triggering
on:
  push:
    branches:
      - main
```

## Complete Release Workflow Files

Your `.github/workflows/` directory should now contain:

```txt
.github/
└── workflows/
    ├── __shared-ci.yml              # Central build logic
    ├── __pull-request-ci.yml        # PR builds
    ├── __main-ci.yml                # Main branch builds + cleanup
    ├── __semantic-pull-request.yml  # PR title validation
    ├── __prepare-release.yml        # Release preparation
    └── __release.yml                # Release publishing
```

## Verifying Your Setup

### Test the Complete Flow

1. **Create a feature PR**:

   ```bash
   git checkout -b feat/new-feature
   echo "# New feature" >> images/my-image/README.md
   git add .
   git commit -m "feat: add new feature documentation"
   git push origin feat/new-feature
   ```

2. **Verify PR build** in Actions tab

3. **Merge the PR** with a semantic title

4. **Run Prepare release** workflow

5. **Review and merge** the release PR

6. **Create a GitHub release** from the new tag

7. **Verify images** in Packages section with version tags

## Troubleshooting

### Release PR Not Created

- Check that `GITHUB_TOKEN` has write permissions
- Verify workflow has `contents: write` and `pull-requests: write` permissions
- Check workflow logs for errors

### Images Not Tagged Correctly

- Verify the release was published (not draft)
- Check that all workflows completed successfully
- Review the release workflow logs

### Version Not Incrementing

- Ensure commits follow conventional commit format
- Check that PR titles are semantic
- Review the changelog generation logs

## Summary

You now have a complete CI/CD pipeline for your Docker base images:

✅ **PR builds**: Automatic builds with PR number tags  
✅ **Main branch builds**: Builds on merge with cleanup  
✅ **Semantic versioning**: Automatic version bumping  
✅ **Multi-platform**: linux/amd64 and linux/arm64 support  
✅ **Registry publishing**: Images available on ghcr.io

## Next Steps

- Add more images to the `images/` directory
- Customize Dockerfiles for your needs
- Set up Dependabot for base image updates
- Configure branch protection rules

---

🎉 **Congratulations!** You've completed the Docker Base Images Repository tutorial.

Need help? [Hoverkraft Discussions](https://github.com/orgs/hoverkraft-tech/discussions)
