# Hoverkraft Documentation Portal

Public documentation hub for Hoverkraft (aka openkraft) projects and methodologies.

---

## Overview

The portal aggregates technical guides, project overviews, and methodology notes from the Hoverkraft ecosystem. The CI pipeline ingests metadata (topics, readmes, release notes) from public repositories and renders them as curated documentation pages.

## Documentation Areas

- **Methodology** — Delivery practices, CI/CD playbooks, and platform standards (`application/docs/methodology/`)
- **Projects** — Directory of open-source projects managed by Hoverkraft (`application/docs/projects/`)
  - Project docs are stored under category folders: `application/docs/projects/<category>/<project>/`.
  - Categories follow the rules in `.github/actions/resolve-docs-target/lib/repository-categorizer.js` (via `RepositoryCategorizer`).
- **Internal notes** — Keep internal or implementation-specific documentation concise in this root readme; `application/docs/` is limited to public-facing content.

## Site Structure

The site is built with [Docusaurus](https://docusaurus.io/) and published as a static site from the `application/` workspace.

```txt
application/
├── docs/                    # Markdown sources rendered by Docusaurus
├── src/                     # React components, pages, and styling modules
│   ├── components/          # Shared UI components
│   └── pages/               # Custom pages & route overrides
├── static/                  # Static assets served verbatim (images, icons)
├── docusaurus.config.ts     # Global Docusaurus configuration
├── sidebars.ts              # Sidebar definitions per documentation section
└── build/                   # Generated static site output (do not edit)
```

Generated files in `application/build/` are artifacts only—never commit manual edits to that directory.

`application/docs/` is published publicly. Avoid adding internal runbooks or sensitive implementation notes there—document those at the repository root instead.

### Authoring notes

- Last update metadata is rendered automatically by Docusaurus (via `showLastUpdateAuthor` and `showLastUpdateTime`). Do not hardcode "**Last Updated**" or "**Maintained By**" lines inside docs; rely on Git history instead.

## Documentation generation

The documentation build pulls repository information through scheduled jobs and manual syncs.

**For more details, see the [documentation generation action](.github/actions/generate-docs/README.md).**

## Documentation Aggregation System

This portal uses an artifact-based push system with repository_dispatch to aggregate documentation from all Hoverkraft projects in real-time while keeping the source documentation atomic within each project repository.

**To configure a project to sync its documentation to this portal, see the [workflow sync documentation](./.github/workflows/sync-docs-dispatcher.md).**

## Development Workflow

```bash
make prepare   # Install npm dependencies in application/
make start     # Launch the Docusaurus dev server with live reload
make lint      # Run linters (Markdown, CSS, JS/TS, config files)
make lint-fix  # Auto-fix supported lint issues via repository formatter
make build     # Produce static site in application/build
make ci        # CI helper: prepare + lint-fix + build
```

- The dev server runs at `http://localhost:3000` and hot-reloads on content or component changes.
- To lint or format a subset of files, pass a glob to `make lint path/to/file.md`.
- Check in only Markdown, TypeScript, and asset changes—generated output is rebuilt by CI.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/<feature-name>`).
3. Run the development workflow commands relevant to your change (`make start`, `make lint`, etc.).
4. Commit using conventional messages when possible (`feat:`, `fix:`, `docs:`).
5. Open a Pull Request and ensure CI passes.

Refer to `CONTRIBUTING.md` for detailed development standards and release expectations.

## License

This project is part of the Hoverkraft open-source ecosystem and is distributed under the MIT License.
