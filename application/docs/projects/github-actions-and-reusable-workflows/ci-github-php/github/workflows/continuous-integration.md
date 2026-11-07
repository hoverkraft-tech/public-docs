---
source_repo: hoverkraft-tech/ci-github-php
source_path: .github/workflows/continuous-integration.md
source_branch: main
source_run_id: 42356244066
last_synced: 2026-11-07T08:39:53.263Z
---

<!-- header:start -->

# GitHub Reusable Workflow: Continuous integration

<div align="center">
  <img src="https://opengraph.githubassets.com/269dc7c35b6772556bc3b24861469b980a12ee6cb0d1feb365738f3a1d8d0e94/hoverkraft-tech/ci-github-php" width="60px" align="center" alt="Continuous integration" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Use `continuous-integration.yml` from both your pull request and default-branch
workflows. Pin the same reviewed commit in each caller. An application can use
lint and tests without enabling Composer package publication.

```yaml
permissions: {}
jobs:
  checks:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@<commit-sha>
    permissions:
      contents: read
      id-token: write
    with:
      php-versions: '["8.2", "8.3", "8.4", "8.5"]'
```

Define `lint:ci` and `test:ci` in `composer.json`. These are explicit project commands;
they execute even when dependency installation scripts are disabled. An empty
`lint` or `test` input disables that job; `test: "false"` also disables tests. Missing named scripts fail the job. `lint` also accepts a JSON object such as
`lint: '{"command":"lint:custom"}'`, or `"false"` to skip linting.

Use `runs-on` for a JSON array of Linux runner labels, for example
`runs-on: '["self-hosted", "linux"]'`. Every job uses those labels.
Set `checks: false` to skip lint, tests, dependency review and distribution checks.

### Runtime and dependencies

With no `php-versions` input, setup reads the project's `.php-version`, then the
repository's `.php-version`, then delegates platform detection to `setup-php`.
An explicit version matrix tests all listed versions. The last entry runs lint
and package checks; only that version publishes coverage. An empty entry
in the matrix uses the default version selection.

Composer projects with or without a committed lockfile are supported. Each
project is installed independently. By default, setup installs the root manifest
and `tools/composer.json` when it exists. It does not search nested directories.
Use `composer-directories` to override discovery, for example `["."]` for the root
only or `[".", "dev-tools"]` for another tooling directory. Only Composer's download cache is shared between
runs; dependencies are installed and platform requirements checked each time.

Installation scripts and plugins are disabled by default. Use
`ignore-scripts: false` when installation hooks are required. Use
`ignore-plugins: false` for a project with explicit Composer `allow-plugins`
configuration, such as PHPStan's extension installer. These options affect
installation, not explicit lint or test commands.

For custom jobs, call `actions/setup-php` after checkout, then the individual
lint or test actions. `install-dependencies: false` prepares the runtime
without installing the project, for example before isolated package checks.

### Reports and coverage

The lint and test actions reuse `ci-github-common/actions/quality/parse-ci-reports` for
GitHub annotations and job summaries. The test action runs your Composer script unchanged. The script selects its test tool,
preparation, configuration and report formats. For PHPUnit, keep the everyday test
command and add a CI script:

```json
{
  "scripts": {
    "test": "phpunit --configuration tests/phpunit.xml",
    "test:ci": "@test --log-junit=junit.xml --coverage-cobertura=cobertura.xml"
  }
}
```

The action sets `CI=true` and adds no test-runner arguments. JUnit reports are
parsed even after the command fails. The same Composer command runs on every PHP
version; only the last version publishes coverage. The `coverage` option controls
publication, not collection. Set it to an empty string to skip coverage publication;
omit coverage arguments from your script when collection is not needed.

For Codecov, use `--coverage-clover=clover.xml` in the script and configure:

```yaml
with:
  test: '{"coverage":"codecov"}'
```

Codecov requires `id-token: write` and repository access. The action discovers
Clover reports, falling back to Cobertura. For GitHub coverage summaries, generate
Cobertura. Add generated report files to `.gitignore`. Clean any retained report
files in your project command if it reuses an existing workspace.

Preparation belongs in the Composer script, with report arguments attached only
to the test command:

```json
{
  "scripts": {
    "test:ci": [
      "@test:load-fixtures",
      "@test --log-junit=junit.xml --coverage-clover=clover.xml"
    ]
  }
}
```

Pest and Codeception projects use the same contract; define their commands and
report options in Composer. No test-runner selection is needed in the action.
Use `command` for a script name other than `test:ci`. Group custom settings in one
input, omitting fields that use defaults:

```yaml
with:
  test: '{"coverage":"codecov","cache":".cache"}'
```

The test `cache` option can retain a directory of generated test fixtures or results. Do not
cache `vendor`; Composer installation manages dependencies.

Dependency review runs only on pull requests. PHP CodeQL analysis is not part of
the workflow because PHP is not a supported CodeQL language. Run your PHP static
analyzer through the lint script.

### Generated application files and documentation

Projects needing asset compilation or generated code keep those steps in their
Composer commands or dedicated caller jobs. PHP libraries need no generic build
step; Composer distributes committed source selected by Git export rules.

For API documentation, use `documentation.yml`, with optional `runs-on` labels
for a Linux runner supporting Docker. It uses the project's phpDocumentor
configuration when present, otherwise `src/`, and uploads a site containing
`phpdoc/`. Run it during pull request validation and restore its `artifact-id` into
`_site` for a separate deployment job using `ci-github-publish` actions. Site
publishing and project-specific documentation transformations remain in the caller.

### Package checks

Set `package: "true"` for a public Composer package at the Git repository root. The
test action snapshots the checked-out commit using `git archive`, respecting
`.gitattributes` `export-ignore` and `export-subst`. Uncommitted files and generated
build output are not included.

The test action validates `composer.json`, verifies declared PSR autoload paths,
autoload files, and binaries, installs the archive in an isolated consumer with
production dependencies, checks platform requirements, and loads the autoloader.
Installation hooks and plugins remain disabled in that consumer.

Distribution testing is disabled by default. Omit `package` or pass `"false"` to skip it.
The input is a string, so boolean values must be quoted. A JSON object enables
distribution testing with specific options; unknown options and non-string `tests` fail
configuration validation.

Use `tests` only for behavior specific to your package, such as rendering a
template or invoking a CLI:

```yaml
with:
  package: '{"tests":"my-cli --help"}'
```

Commands execute in the consumer, with `vendor/bin`
on `PATH` and `PACKAGE_NAME`, `PACKAGE_INSTALL_PATH`, and `PACKAGE_ARCHIVE_PATH`
available. The temporary consumer is removed after success or failure. Modifying
the temporary source archive fails validation. Nothing is uploaded: this tests
the files GitHub will distribute, without adding a package publication step.

Package checks run on the primary PHP version. The source test matrix remains
responsible for compatibility across every supported PHP version. Release callers should depend on successful validation with `needs`.

### Permissions

- **`contents`**: `read`
- **`id-token`**: `write`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Continuous integration
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@94aa62658eecb5c1d58e96c4dc6c5f99d9e52000 # main
    permissions:
      contents: read
      id-token: write
    with:
      # JSON array of Linux runner labels. Applies to every job, including the configuration job.
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'

      # Enable lint, tests, dependency review and optional distribution checks.
      # Default: `true`
      checks: true

      # Composer project directory relative to the checkout.
      # Default: `.`
      working-directory: .

      # Optional JSON array of PHP versions to test. The last entry runs lint and package checks and publishes coverage. An empty entry uses .php-version or setup-php platform detection. Empty input runs that default once.
      php-versions: ""

      # PHP extensions forwarded to setup-php.
      # Default: `mbstring, dom, xml, xmlwriter, curl, zip, intl`
      extensions: mbstring, dom, xml, xmlwriter, curl, zip, intl

      # Optional JSON array of Composer directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery.
      composer-directories: ""

      # Disable Composer installation scripts. Explicit project commands still run.
      # Default: `true`
      ignore-scripts: true

      # Disable Composer plugins during installation. When false, Composer allow-plugins configuration still applies.
      # Default: `true`
      ignore-plugins: true

      # Composer lint script name or a JSON object with `command` (default `lint:ci`). Pass "false", "null" or an empty string to disable.
      # Default: `true`
      lint: "true"

      # Run the Composer `test:ci` script unchanged, or provide another script name.
      # Pass "false", "null" or an empty string to disable tests.
      # A JSON object groups test options: `command` (default `test:ci`),
      # `coverage` (`github`, `codecov` or empty), and `cache` (one directory relative to working-directory).
      # Configure report/coverage generation in the Composer script itself.
      # Coverage is published on the last PHP version only; the command controls collection on every version. Codecov requires id-token: write.
      # Example: `{"coverage":"codecov","cache":".cache"}`.
      #
      # Default: `true`
      test: "true"

      # Validate a public Composer source distribution from the Git repository root.
      # Pass "false" (the default) to disable, "true" for archive and autoload checks,
      # or a JSON object with `tests` for additional commands in an isolated Composer consumer.
      # Quote booleans because this input has type string. Example: `{"tests":"my-cli --help"}`.
      # vendor/bin is on PATH; PACKAGE_NAME, PACKAGE_INSTALL_PATH and PACKAGE_ARCHIVE_PATH identify the package.
      # Unknown options and non-string tests are rejected before distribution checks.
      #
      # Default: `false`
      package: "false"

      # Review dependency changes on pull requests.
      # Default: `true`
      dependency-review: true
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                  | **Description**                                                                                                                                                                                                        | **Required** | **Type**    | **Default**                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ------------------------------------------------ |
| **`runs-on`**              | JSON array of Linux runner labels. Applies to every job, including the configuration job.                                                                                                                              | **false**    | **string**  | `["ubuntu-latest"]`                              |
| **`checks`**               | Enable lint, tests, dependency review and optional distribution checks.                                                                                                                                                | **false**    | **boolean** | `true`                                           |
| **`working-directory`**    | Composer project directory relative to the checkout.                                                                                                                                                                   | **false**    | **string**  | `.`                                              |
| **`php-versions`**         | Optional JSON array of PHP versions to test. The last entry runs lint and package checks and publishes coverage. An empty entry uses .php-version or setup-php platform detection. Empty input runs that default once. | **false**    | **string**  | -                                                |
| **`extensions`**           | PHP extensions forwarded to setup-php.                                                                                                                                                                                 | **false**    | **string**  | `mbstring, dom, xml, xmlwriter, curl, zip, intl` |
| **`composer-directories`** | Optional JSON array of Composer directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery.                                          | **false**    | **string**  | -                                                |
| **`ignore-scripts`**       | Disable Composer installation scripts. Explicit project commands still run.                                                                                                                                            | **false**    | **boolean** | `true`                                           |
| **`ignore-plugins`**       | Disable Composer plugins during installation. When false, Composer allow-plugins configuration still applies.                                                                                                          | **false**    | **boolean** | `true`                                           |
| **`lint`**                 | Composer lint script name or a JSON object with `command` (default `lint:ci`). Pass "false", "null" or an empty string to disable.                                                                                     | **false**    | **string**  | `true`                                           |
| **`test`**                 | Run the Composer `test:ci` script unchanged, or provide another script name.                                                                                                                                           | **false**    | **string**  | `true`                                           |
|                            | Pass "false", "null" or an empty string to disable tests.                                                                                                                                                              |              |             |                                                  |
|                            | A JSON object groups test options: `command` (default `test:ci`),                                                                                                                                                      |              |             |                                                  |
|                            | `coverage` (`github`, `codecov` or empty), and `cache` (one directory relative to working-directory).                                                                                                                  |              |             |                                                  |
|                            | Configure report/coverage generation in the Composer script itself.                                                                                                                                                    |              |             |                                                  |
|                            | Coverage is published on the last PHP version only; the command controls collection on every version. Codecov requires id-token: write.                                                                                |              |             |                                                  |
|                            | Example: `{"coverage":"codecov","cache":".cache"}`.                                                                                                                                                                    |              |             |                                                  |
| **`package`**              | Validate a public Composer source distribution from the Git repository root.                                                                                                                                           | **false**    | **string**  | `false`                                          |
|                            | Pass "false" (the default) to disable, "true" for archive and autoload checks,                                                                                                                                         |              |             |                                                  |
|                            | or a JSON object with `tests` for additional commands in an isolated Composer consumer.                                                                                                                                |              |             |                                                  |
|                            | Quote booleans because this input has type string. Example: `{"tests":"my-cli --help"}`.                                                                                                                               |              |             |                                                  |
|                            | vendor/bin is on PATH; PACKAGE_NAME, PACKAGE_INSTALL_PATH and PACKAGE_ARCHIVE_PATH identify the package.                                                                                                               |              |             |                                                  |
|                            | Unknown options and non-string tests are rejected before distribution checks.                                                                                                                                          |              |             |                                                  |
| **`dependency-review`**    | Review dependency changes on pull requests.                                                                                                                                                                            | **false**    | **boolean** | `true`                                           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-php)](https://github.com/hoverkraft-tech/ci-github-php/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-php)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-php/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- examples:start -->
<!-- examples:end -->
<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-php/blob/main/CONTRIBUTING.md) for more details.

<!-- contributing:end -->
<!-- security:start -->
<!-- security:end -->
<!-- license:start -->

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
