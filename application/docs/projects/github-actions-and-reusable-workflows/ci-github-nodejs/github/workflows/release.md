---
source_repo: hoverkraft-tech/ci-github-nodejs
source_path: .github/workflows/release.md
source_branch: main
source_run_id: 36750297797
last_synced: 2026-09-30T17:25:01.644Z
---

# Release a Node.js package

Publish a package to npm and attach the same tarball to a GitHub release:

**Plan version → Run CI → Package build output → Publish to npm → Create GitHub release**

The workflow below releases a single package from the repository root using stable versions such as `1.2.3`.
It sets the version during packaging. If your build reads the package version or you commit version changes,
use [Commit the version before building](#commit-the-version-before-building).

## Set up

1. Configure [release labels and version rules](https://github.com/hoverkraft-tech/ci-github-publish/blob/0.29.0/.github/workflows/prepare-release.md).
   These determine the version and release notes.
1. Check the package's `package.json`: set `name`, `files`, and `repository.url`, and ensure `private` is not `true`.
1. Configure [npm trusted publishing](../../actions/publish/index.md#npm-trusted-publishing) for your repository and workflow filename, `release.yml`.
   The example uses GitHub-hosted runners and `id-token: write`; no npm token is needed.
   For a new npm package, publish its first version before configuring the trusted publisher.
1. Save the workflow below as `.github/workflows/release.yml` in your project. Before running it:
   - Replace every `<sha>` with the **same `ci-github-nodejs` commit containing `actions/publish`**.
     The `ci-github-publish` actions are already pinned to `0.29.0`.
   - Set the `build`, `lint:ci`, and `test:ci` script names and the `dist/` output path to match your project.
     See [CI options](continuous-integration.md) if you need a different setup.

## Workflow

```yaml
name: Release

on:
  schedule:
    - cron: "25 8 * * 1"
  workflow_dispatch:
    inputs:
      force:
        description: Release even when no relevant changes are detected
        type: boolean
        required: false
        default: false

permissions: {}

concurrency:
  group: release-${{ github.repository }}
  cancel-in-progress: false

jobs:
  plan:
    if: github.ref_name == github.event.repository.default_branch
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    outputs:
      should-release: ${{ steps.plan.outputs.has-changes == 'true' || (github.event_name == 'workflow_dispatch' && inputs.force) }}
      tag: ${{ steps.plan.outputs.tag }}
      version: ${{ steps.version.outputs.version }}
    steps:
      - name: Plan release
        id: plan
        uses: hoverkraft-tech/ci-github-publish/actions/release/plan@a0a9d185c51c10710a5987822e78feb2b5ce1932 # 0.29.0

      - id: version
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0
        env:
          RELEASE_TAG: ${{ steps.plan.outputs.tag }}
        with:
          script: |
            // This example uses tags such as v1.2.3 or 1.2.3.
            const version = process.env.RELEASE_TAG.replace(/^v/, '');
            if (!/^\d+\.\d+\.\d+$/.test(version)) {
              return core.setFailed('Expected a stable SemVer tag; adapt the mapping for prereleases or monorepos');
            }
            core.setOutput('version', version);

  ci:
    needs: plan
    if: needs.plan.outputs.should-release == 'true'
    uses: hoverkraft-tech/ci-github-nodejs/.github/workflows/continuous-integration.yml@<sha>
    permissions:
      contents: read
      packages: read
      pull-requests: write
      id-token: write
      security-events: write
    with:
      build: '{"commands":["build"],"artifact":{"paths":["dist/"]}}'
      lint: '{"command":"lint:ci"}'
      test: '{"command":"test:ci"}'

  release:
    needs: [plan, ci]
    if: needs.plan.outputs.should-release == 'true'
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: write
      pull-requests: read
      id-token: write
    steps:
      - name: Package build output
        id: package
        uses: hoverkraft-tech/ci-github-nodejs/actions/package@<sha>
        with:
          version: ${{ needs.plan.outputs.version }}
          build-artifact-id: ${{ needs.ci.outputs.build-artifact-id }}
          # The reusable CI workflow preserves absolute paths in build artifacts.
          build-artifact-path: /

      # Add any package smoke tests before publishing.
      - name: Check package publishing
        uses: hoverkraft-tech/ci-github-nodejs/actions/publish@<sha>
        with:
          package-tarball-artifact-id: ${{ steps.package.outputs.package-tarball-artifact-id }}
          dry-run: "true"
          provenance: "false"

      # Wrap the raw .tgz in a ZIP artifact for release/create.
      - id: release-assets
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: release-assets
          path: ${{ steps.package.outputs.package-tarball-path }}
          if-no-files-found: error

      - id: publish-package
        name: Publish package
        uses: hoverkraft-tech/ci-github-nodejs/actions/publish@<sha>
        with:
          package-tarball-artifact-id: ${{ steps.package.outputs.package-tarball-artifact-id }}
          tag: latest

      - name: Create GitHub release
        uses: hoverkraft-tech/ci-github-publish/actions/release/create@a0a9d185c51c10710a5987822e78feb2b5ce1932 # 0.29.0
        with:
          tag: ${{ needs.plan.outputs.tag }}
          target-sha: ${{ github.sha }}
          release-artifact-id: ${{ steps.release-assets.outputs.artifact-id }}
          publish: "true"
```

[Package](../../actions/package/index.md) checks out the source, installs dependencies, restores the CI build output,
and creates the tarball. [Publish](../../actions/publish/index.md) publishes that tarball.
The package version is changed locally; it is not committed. GitHub's source archive therefore keeps the version from the source commit.
If `package.json` already contains the planned version, omit the Package action's `version` input.

## Run a release

In **Actions → Release → Run workflow**, select the default branch. The workflow also runs every Monday at 08:25 UTC.
Releases are serialized so two runs cannot publish the same package concurrently.

| Situation                                      | Result                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| Relevant changes since the last GitHub release | Plan the next version, run CI, and release.                                        |
| No relevant changes                            | Skip CI and publishing successfully.                                               |
| Manual run with `force` checked                | Release the planned version even without changes; CI must still pass.              |
| No previous matching GitHub release            | Plan the first GitHub release. Registry authentication must already be configured. |

The dry run checks the tarball with `npm publish --dry-run`. It does not verify registry credentials or trusted publishing access.
For a first trial without publishing, keep the dry-run step and remove the **Publish package** and **Create GitHub release** steps.

## Commit the version before building

Use this when the build embeds the version or the released source must include updated version files or a changelog:

1. Plan the version with `release/plan`, using the same no-change and `force` rules as the workflow above.
1. Update the version on a release branch, for example with `npm version 1.2.3 --no-git-tag-version`.
   Commit the package manifest, lockfile, changelog, and any generated version files through a pull request.
1. After merging, run CI and packaging **from the merged commit**. Omit the Package action's `version` input; the version is already in `package.json`.
1. Publish the tarball, then create the GitHub release with the planned `tag` and merged commit as `target-sha`.

Keep the planned tag throughout this process; do not calculate another version after merging.
If you use a second workflow for publication, read the committed version instead of calling `release/plan` again,
and skip it when that version is already released.

The Package action performs its own checkout of the workflow's source ref.
Checking out the merged commit in an earlier step does not change that ref: start the packaging workflow at the merged commit.
See the [release preparation example](https://github.com/hoverkraft-tech/ci-github-publish/blob/0.29.0/.github/workflows/release.md#example-3-validate-source-update-files-create-release-artifacts-and-release)
for automating the pull request and merge.

## Other setups

- **GitHub Packages or registry tokens:** use the [authentication examples](../../actions/publish/index.md#registry-tokens-and-github-packages).
  The `github-token` input only authenticates artifact downloads; registry credentials use `NODE_AUTH_TOKEN`.
- **Prereleases:** set `prerelease: "true"` on `release/plan` and `release/create`, and `tag: next` on both Publish steps.
  Update the version conversion to accept your full prerelease version, such as `1.2.3-rc.1`.
  The npm distribution tag (`next`) is separate from the Git release tag (`v1.2.3-rc.1`).
- **Monorepos:** scope CI and both release actions with `working-directory`.
  For Package, set `working-directory` to the dependency installation root and `package-directory` to the package's relative path.
  Convert prefixed Git tags such as `my-package/v1.2.3` to npm versions, and use a separate concurrency group and artifact name per package.
- **Drafts and signing:** create a draft with `publish: "false"`, then use `release/update` to attach assets and publish after npm publication succeeds.
  See the [draft release example](https://github.com/hoverkraft-tech/ci-github-publish/blob/0.29.0/.github/workflows/release.md#example-2-validate-source-create-release-artifacts-and-release).
  Use `release/delete` with `draft-only: "true"` to clean up a temporary draft on failure **only if the npm package has not been published**.

## Recover a failed release

Check the registry before retrying: an npm package version cannot be overwritten, and a failed run may still have published it.

| Where it failed                                   | What to do                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Before npm publication                            | Fix the failure and rerun the workflow.                                  |
| npm published, but GitHub release creation failed | Run only release creation with the original tag, source SHA, and assets. |
| npm published, but a draft was not finalized      | Keep the draft and retry `release/update`.                               |

After npm publication, do not rerun the whole release job or plan a new version to finish the same release.
Deleting a draft does not undo npm publication.

## Migrate from the reusable release workflow

Replace calls to `ci-github-nodejs/.github/workflows/release.yml` with a job that uses [the Publish action](../../actions/publish/index.md#usage):

- Move `runs-on` and permissions to the caller job.
- Move the publishing inputs to the action step, quoting `provenance` and `dry-run` as `"true"` or `"false"`.
- Move the optional `github-token` secret to the action's `github-token` input.

Use the workflow above when you also need version planning, CI, and a GitHub release.
