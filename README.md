# Hoverkraft Documentation Portal

Public documentation portal for Hoverkraft open-source projects (aka openkraft).

This repository contains the source code for the Hoverkraft documentation site built with [Docusaurus](https://docusaurus.io/).

## 🚀 Quick Start

### Prerequisites

- Node.js 20.0 or higher
- npm

### Installation

```bash
make prepare
```

### Development

Start the development server:

```bash
make start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
make build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## 📁 Project Structure

```
├── .github/
│   ├── scripts/
│   │   └── generate-docs.js     # Generate project pages
│   └── workflows/
│       ├── update-docs.yml      # Generate metadata workflow
│       ├── sync-docs-push.yml   # Reusable push workflow
│       └── EXAMPLE-push-docs.yml.template  # Template for projects
├── application/
│   ├── docs/                    # Documentation pages (pushed + local)
│   │   ├── projects/            # Project-specific documentation (pushed)
│   │   ├── intro.md             # Introduction page
│   │   └── projects.md          # Projects overview (generated)
│   ├── src/                     # Source files (React components, pages, etc.)
│   │   ├── components/          # React components
│   │   ├── css/                # CSS files
│   │   └── pages/              # Additional pages
│   ├── static/                 # Static assets
│   ├── docusaurus.config.ts    # Docusaurus configuration
│   └── sidebars.ts             # Sidebar configuration
```

## 🛠️ Documentation Aggregation

This portal uses an automated push-based system to aggregate documentation from all Hoverkraft projects in real-time while keeping the source documentation in each project repository.

### Key Features

- **Push Mode**: Real-time updates via reusable workflow when documentation changes
- **Source Metadata**: Each document includes information about its source repository
- **Automated**: Fully automated via GitHub Actions
- **Atomic**: Documentation stays with code in each project repository
- **Immediate**: No waiting for scheduled syncs

### Architecture

The documentation system uses **push mode** for real-time documentation synchronization:

1. **Source Documentation** remains in each project repository (atomic and versioned with code)
2. **Central Portal** (this repository) receives documentation via push from project repositories
3. **Automated Sync** via GitHub Actions keeps documentation up-to-date in real-time

## How It Works

Project repositories can push their documentation updates in real-time using a reusable workflow:

1. **Source Documentation** remains in each project repository (atomic and versioned with code)
2. **Synchronization** happens via push mode in real-time when documentation changes
3. **Centralized View** presents all documentation in a unified portal
4. **Automated Sync** via GitHub Actions keeps everything up-to-date

```
┌─────────────────────────────────────────────────────────┐
│  Project Repository (e.g., compose-action)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ On commit to docs/ or README.md                    │ │
│  │ └─ Workflow triggered                              │ │
│  │    └─ Calls public-docs reusable workflow          │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────┬─────────────────────────────────────────┘
                │ Push via workflow call
                ↓
┌─────────────────────────────────────────────────────────┐
│  Documentation Portal (public-docs)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Reusable workflow syncs docs immediately          │  │
│  │ └─ Commits and pushes changes to portal          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Generating Project Metadata

```bash
# Generate project metadata pages
cd application && npm run generate-docs
```

## 🔄 Adding Documentation from a Project

To add real-time documentation synchronization:

See [./.github/workflows/sync-docs-push.md](./.github/workflows/sync-docs-push.md) for more details.

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/public-docs/blob/main/CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2025 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).
