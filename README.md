# Hoverkraft Documentation Portal

Public documentation hub for Hoverkraft (aka openkraft) projects and methodologies.

---

## Overview

The portal aggregates technical guides, project overviews, and methodology notes from the Hoverkraft ecosystem. The CI pipeline ingests metadata (topics, readmes, release notes) from public repositories and renders them as curated documentation pages.

## Documentation Areas

- **Methodology** — Delivery practices, CI/CD playbooks, and platform standards (`application/docs/methodology/`)
- **Projects** — Directory of open-source projects managed by Hoverkraft (`application/docs/projects/`)
- **Internal notes** — Keep internal or implementation-specific documentation concise in this root readme; `application/docs/` is limited to public-facing content.

## Site Structure

The site is built with [Docusaurus](https://docusaurus.io/) and published as a static site from the `application/` workspace.

```
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

## Documentation generation

The documentation build pulls repository information through scheduled jobs and manual syncs.

**For more details, see the [documentation generation action](.github/actions/generate-docs/README.md).**

## 🛠️ Documentation Aggregation System

This portal uses an artifact-based push system with repository_dispatch to aggregate documentation from all Hoverkraft projects in real-time while keeping the source documentation atomic within each project repository.

**To configure a project to sync its documentation to this portal, see the [workflow sync documentation](./.github/workflows/sync-docs-dispatcher.md).**

### Architecture

The documentation system uses a **two-workflow architecture**:

1. **Source Documentation** remains in each project repository (atomic and versioned with code)
2. **Dispatcher Workflow** (in project repos) prepares and sends documentation via repository_dispatch
3. **Receiver Workflow** (in public-docs) receives, injects, builds, and publishes documentation
4. **Automated Sync** happens in real-time when documentation changes

### How It Works

#### Workflow 1: Dispatcher (in Project Repositories)

The reusable dispatcher workflow (`sync-docs-dispatcher.yml`) that projects call:

```txt
┌─────────────────────────────────────────────────────────┐
│  Project Repository (e.g., compose-action)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 1. On commit to docs/ or README.md                 │ │
│  │ 2. Collects documentation files                    │ │
│  │ 3. Adds source metadata frontmatter                │ │
│  │ 4. Uploads documentation as artifact               │ │
│  │ 5. Sends repository_dispatch event with metadata   │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────┬─────────────────────────────────────────┘
                │ repository_dispatch event (with artifact ref)
                ↓
┌─────────────────────────────────────────────────────────┐
│  Documentation Portal (public-docs)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 6. Downloads artifact from source repository     │  │
│  │ 7. Validates and injects into docs/               │  │
│  │ 8. Creates and auto-merges PR                     │  │
│  │ 9. Push to main triggers build & deploy workflow  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Workflow 2: Receiver (in Public-Docs)

The receiver workflow (`sync-docs-receiver.yml`) in public-docs:

- Listens for `repository_dispatch` events with type `sync-documentation`
- Downloads the documentation artifact from the source repository
- Extracts and injects documentation into the appropriate location
- Creates and auto-merges a pull request with the changes
- The push to main workflow handles building and deployment

**Advantages:**

- Real-time updates when documentation changes
- No size limitations (artifacts can handle large documentation bundles)
- Build validation handled by push to main workflow
- No direct write access to public-docs needed for project repos
- Token only needs `repo` scope for repository_dispatch and artifact access
- Clean separation of concerns (sync vs build/deploy)
- Supports image-heavy documentation without payload size constraints

### Source Metadata

Each pushed document includes metadata about its source:

```markdown
---
source_repo: compose-action
source_path: docs/usage.md
source_branch: main
last_synced: 2024-01-15T10:30:00.000Z
---
```

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
