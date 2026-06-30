---
sidebar_position: 5
---

# Release and publishing

The current release model is image-centric, not repository-centric. You prepare release pull requests for image directories, then manually dispatch the release workflow to create and publish releases only for images that changed.

:::tip Pin copied refs with Ratchet
These workflow snippets use placeholders such as `@<docker-base-images-sha>`
because the exact commit changes over time. In a real repository, replace the
placeholder with the release tag you want to track, run [Pin workflow refs with
Ratchet](../../best-practices/ci-cd/github-actions/pinning-with-ratchet.md), and
commit the rewritten SHA pins.
:::

## Release workflow overview

The release process follows this flow:

```txt
main
  -> prepare-release.yml
  -> release PRs for image directories
  -> merge release PRs
  -> release.yml
  -> create image-specific GitHub releases
  -> build and publish OCI image tags for changed images only
```

## The important behavioral differences

Compared with older repository setups, the current production pattern differs in a few important ways:

- `release.yml` is triggered manually with `workflow_dispatch`, not from `release.published`
- Release detection is based on the latest tag for each image directory
- Git tags are image-prefixed, for example `nodejs-20-1.4.0`
- Release tags are planned before images are built, but GitHub releases are created only after publishing succeeds
- Only changed images are rebuilt, pushed and released

## Step 1: Create the prepare release workflow

This workflow prepares release pull requests for all image directories. It should stay thin and simply call the reusable `prepare-release.yml` workflow.

Create `.github/workflows/prepare-release.yml`:

```yaml
name: Prepare release

on:
  workflow_dispatch:

permissions: {}

jobs:
  prepare-release:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/prepare-release.yml@<docker-base-images-sha> # x.y.z
    permissions:
      contents: write
      pull-requests: write
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

### What this does

When triggered:

1. Discovers image directories from `images/`
2. Opens release pull requests for image directories through `ci-github-publish`
3. Prepares changelog and version updates at the image level instead of for the whole repository

### Triggering manually

1. Go to **Actions** tab in your repository
2. Select **Prepare release** workflow
3. Click **Run workflow**

## Step 2: Create the release workflow

This workflow both creates image releases and publishes OCI tags. It does not wait for a separate GitHub `release.published` event.

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  workflow_dispatch:

permissions: {}

jobs:
  release:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/release.yml@<docker-base-images-sha> # x.y.z
    permissions:
      contents: write
      id-token: write
      issues: read
      packages: write
      pull-requests: write
    with:
      oci-registry: ${{ vars.OCI_REGISTRY }}
      platforms: '["linux/amd64"]'
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
```

### Configuration Options

```yaml
jobs:
  release:
    uses: hoverkraft-tech/docker-base-images/.github/workflows/release.yml@<docker-base-images-sha> # x.y.z
    permissions:
      contents: write
      id-token: write
      issues: read
      packages: write
      pull-requests: write
    with:
      runs-on: '["ubuntu-latest"]'
      oci-registry: ghcr.io
      oci-registry-username: ${{ github.repository_owner }}
      platforms: '["linux/amd64","linux/arm64"]'
      prerelease: false
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
```

### Release publishing behavior

When `release.yml` runs, it:

1. Discovers all images in `images/`
2. Looks up the latest image-specific Git tag for each image
3. Groups images by tag SHA and checks which ones changed
4. Plans the image release tag before building
5. Builds and pushes OCI image tags to the configured registry
6. Creates GitHub releases only after image publishing succeeds

If no image changed since its latest tag, the workflow exits without publishing anything.

### Authentication choice

For GitHub Container Registry under the same repository owner, `GITHUB_TOKEN` is the preferred default:

- It already exists in every workflow run
- The reusable release workflow accepts it for both GitHub API calls and registry login
- It avoids long-lived package tokens that must be rotated manually

Use a separate registry credential only when you publish to a non-GitHub registry, need cross-owner package access, or hit a permission model that the built-in token cannot satisfy.

## Git tags versus OCI tags

The workflow uses two levels of tagging:

### GitHub release tags

These tags are image-specific so release detection can work independently for each image.

```txt
composer-1.2.3
nodejs-20-2.0.0
infra-tools-0.9.1
```

### OCI image tags

The workflow strips the image prefix before building the OCI tag for the corresponding image path.

```txt
ghcr.io/<owner>/<repo>/composer:1.2.3
ghcr.io/<owner>/<repo>/nodejs-20:2.0.0
ghcr.io/<owner>/<repo>/infra-tools:0.9.1
```

## Version bumping

Versioning still follows conventional commits, but at release preparation time and per image release.

| Commit Prefix      | Version Bump | Example          |
| ------------------ | ------------ | ---------------- |
| `feat:`            | Minor        | `1.0.0 -> 1.1.0` |
| `fix:`             | Patch        | `1.0.0 -> 1.0.1` |
| `feat!:`           | Major        | `1.0.0 -> 2.0.0` |
| `BREAKING CHANGE:` | Major        | `1.0.0 -> 2.0.0` |

## Recommended operational flow

Use this exact sequence in production:

1. Merge regular feature and fix pull requests into `main`
2. Run `prepare-release.yml`
3. Review the generated release pull request content
4. Merge the release pull request
5. Run `release.yml`
6. Verify the GitHub releases and OCI image tags

## Prereleases

If you need prereleases, dispatch `release.yml` with `prerelease: true`. Keep that explicit instead of overloading branch names or event triggers.

## Why manual dispatch is preferred

Manual dispatch is deliberate:

- It gives maintainers an explicit release cut point
- It avoids accidental publishes from unrelated GitHub release events
- It matches the current Hoverkraft reusable workflow contract

## Release process walkthrough

### Creating a Release

1. **Prepare the release**:
   - Go to Actions -> Prepare release -> Run workflow
   - Release pull requests will be created for the eligible image directories

2. **Review the release PR**:
   - Verify which image directories are included
   - Review the version bump and release notes
   - Merge when ready

3. **Run the release workflow**:
   - Go to Actions -> Release
   - Run the workflow manually
   - Set `prerelease: true` only when appropriate

4. **Verify publication**:
   - Check GitHub Releases for image-prefixed tags
   - Check the OCI registry for the corresponding image tags

## Complete release workflow files

Your `.github/workflows/` directory should now contain:

```txt
.github/
└── workflows/
    ├── __shared-ci.yml
    ├── main-ci.yml
    ├── need-fix-to-issue.yml
    ├── prepare-release.yml
    ├── pull-request-ci.yml
    ├── release.yml
    ├── semantic-pull-request.yml
    ├── greetings.yml
    └── stale.yml
```

## Verifying your setup

### Test the complete flow

1. **Create a feature PR**:

   ```bash
   git checkout -b feat/new-feature
   echo "# New feature" >> images/my-image/README.md
   git add .
   git commit -m "feat: add new feature documentation"
   git push origin feat/new-feature
   ```

2. **Verify PR build** in the Actions tab

3. **Merge the PR** with a semantic title

4. **Run Prepare release** workflow

5. **Review and merge** the generated release PR

6. **Run Release** workflow manually

7. **Verify** the new image-specific GitHub releases and OCI tags

## Troubleshooting

### Release PR Not Created

- Check that workflow permissions allow `contents: write` and `pull-requests: write`
- Verify the reusable workflow SHA still exists and is accessible
- Check workflow logs for errors

### Images Not Tagged Correctly

- Verify `release.yml` was actually dispatched after the release PR merge
- Check that `vars.OCI_REGISTRY` is configured and the workflow has `packages: write`
- If your registry cannot be reached with `GITHUB_TOKEN`, switch `oci-registry-password` to a dedicated registry credential
- Review the release workflow logs for the `prepare-images-to-release` and `release-images` jobs

### Version Not Incrementing

- Ensure commits follow conventional commit format
- Check that PR titles are semantic
- Review the release preparation logs for the affected image directory

### Nothing Was Published

- The workflow may have correctly detected that no image changed since its latest image-specific tag
- Check whether the relevant files were changed under `images/<image>/`
- Check whether shared files modified by the image build are included in change detection expectations

## Summary

You now have a complete CI/CD pipeline for your Docker base images:

- **PR builds**: automatic builds with preview tags
- **Main branch builds**: builds on merge with cleanup
- **Image-scoped releases**: only changed images are released
- **Manual release control**: explicit dispatch instead of event drift
- **Registry publishing**: images published to your configured OCI registry

## Next steps

- Add more images to the `images/` directory
- Customize Dockerfiles for your needs
- Set up Dependabot for base image updates
- Configure branch protection rules

Need help? [Hoverkraft Discussions](https://github.com/orgs/hoverkraft-tech/discussions)
