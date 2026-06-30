---
sidebar_position: 2
---

# Pin workflow refs with Ratchet

Use Ratchet to turn human-readable GitHub Actions refs into full commit SHA pins,
then keep those pins current through reviewed pull requests.

## Command

From the repository root, run exactly:

```sh
ratchet upgrade .github/workflows/*.yml
```

If Ratchet is not installed locally, run exactly:

```sh
docker run --rm -v "$PWD:$PWD" -w "$PWD" ghcr.io/sethvargo/ratchet:latest upgrade .github/workflows/*.yml
```

## Why this matters

GitHub Action tags such as `@v4` and branch refs such as `@main` are mutable.
Production workflows should commit full-length SHAs instead:

```yaml
- uses: actions/checkout@v4
+ uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # ratchet:actions/checkout@v4
```

That gives you both properties you want:

- a fixed, reviewable revision in the workflow file
- a machine-managed `# ratchet:` comment that records the version constraint Ratchet should keep tracking

## Recommended workflow

When you copy a methodology snippet into a real repository:

1. Replace documentation placeholders such as `@<version-sha> # x.y.z` with one real released tag.
2. Run `ratchet upgrade .github/workflows/*.yml`.
3. Commit the rewritten SHA pins.

Example:

```yaml
uses: actions/checkout@v4
uses: hoverkraft-tech/ci-github-common/.github/workflows/semantic-pull-request.yml@v0.37.1
```

For reusable workflow snippets like:

```yaml
uses: hoverkraft-tech/ci-github-container/.github/workflows/prune-pull-requests-images-tags.yml@<version-sha> # x.y.z
```

replace the whole placeholder pair with the actual tag first, for example:

```yaml
uses: hoverkraft-tech/ci-github-common/.github/workflows/linter.yml@0.37.1
```

That rewrites the workflow to pinned SHAs and adds Ratchet-managed comments such
as `# ratchet:actions/checkout@v4` or `# ratchet:hoverkraft-tech/ci-github-common/.github/workflows/linter.yml@0.37.3`.

If you want the final checked-in comment in `# vx.y.z` form instead, start from
exact tags such as `@v7.0.0` rather than floating tags such as `@v7`, then run
exactly:

```sh
find .github/workflows -type f \( -name '*.yml' -o -name '*.yaml' \) -exec perl -0pi -e 's/# ratchet:.*@/# /g' {} +
```

That rewrites a line such as:

```yaml
uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # ratchet:actions/checkout@v7.0.0
```

to:

```yaml
uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
```

The same reformat also works for reusable workflow refs that use plain semantic
version tags such as `0.37.1`.

After the command finishes, review the rewritten `uses:` lines and commit the
Ratchet-managed form `@<full-sha> # ratchet:<owner>/<repo>@<constraint>`.

If you run the reformat command above, treat it as a readability-only
post-processing step: the next `ratchet upgrade` will reintroduce Ratchet's
constraint metadata. In that mode, use `ratchet upgrade` when you
want a future refresh, then rerun the reformat command.

## Which command to use

- Use `ratchet upgrade` to pin workflow refs and refresh them later.
- Use the reformat command above only when you explicitly prefer `# vx.y.z` comments over keeping Ratchet metadata in the file.

## Team rule

Do not commit workflow refs as `@main`, `@master`, or floating tags in production
workflows. Commit the SHA-pinned result that Ratchet generated and keep the
`# ratchet:` comment unless you explicitly choose the readability-only reformat step.

## References

- [Ratchet upgrade documentation](https://github.com/sethvargo/ratchet#upgrade)
