# AGENTS.md — agent instructions and operational contract

This file is written for automated coding agents (for example: Copilot coding agents). It provides the operational contract and guardrails for agents contributing to this repository. It is not the canonical source for engineering standards—those live in the project documentation referenced below.

## Organization-wide guidelines (required)

- Follow the prioritized shared instructions in [hoverkraft-tech/.github/AGENTS.md](https://github.com/hoverkraft-tech/.github/blob/main/AGENTS.md) before working in this repository.

## Quick Start

This project hosts the public documentation portal for Hoverkraft. The site is built with **Docusaurus** and lives under the `application/` directory. For full details, consult the main [README.md](README.md).

### Key sections to reference

- **[Overview](README.md#overview)** — Project purpose, hosting expectations, and supported content types
- **[Site Structure](README.md#site-structure)** — Folder layout for documentation, static assets, and configuration files
- **[Development Workflow](README.md#development-workflow)** — Commands for preparing dependencies, running the dev server, linting, and building
- **[Content Pipeline](README.md#content-pipeline)** — How repository metadata is ingested and published
- **[Contributing](README.md#contributing)** — Branching model, pull-request expectations, and code style references

## Agent-specific development patterns

### Critical workflow knowledge

```bash
make prepare   # Install npm dependencies
make start     # Run the Docusaurus dev server with live reload
make lint      # Execute project linters (filters optional targets)
make lint-fix  # Auto-fix lint issues and run repo-wide formatter
make build     # Build the static site into application/build
make ci        # CI entrypoint: prepare + lint-fix + build
```

- Work inside the `application/` directory for all Docusaurus-specific tasks (React components, docs, configuration).
- Generated static assets live in `application/build/`; never edit those files manually.
- When updating docs, prefer Markdown in `application/docs/` with frontmatter aligned to existing pages.
- For UI changes, ensure corresponding CSS lives under `application/src/` (`components/` or `css/`) and passes project linting.
- Run `make lint` (or `make lint-fix`) before submitting changes to keep Markdown, CSS, JSON, and TypeScript formatting consistent.
- Treat `application/docs/` as public-facing material only. Keep internal or sensitive implementation details concise within the root `README.md` instead of publishing them under `application/docs/`.
