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
├──application/
  ├── docs/                   # Documentation pages
  ├── src/                    # Source files (React components, pages, etc.)
  │   ├── components/         # React components
  │   ├── css/               # CSS files
  │   └── pages/             # Additional pages
  ├── static/                # Static assets
  ├── docusaurus.config.ts   # Docusaurus configuration
  └── sidebars.ts            # Sidebar configuration
```

## 🛠️ Documentation Aggregation

This portal uses an automated system to aggregate documentation from all Hoverkraft projects while keeping the source documentation in each project repository.

### How It Works

1. **Source Documentation** remains in each project repository (atomic and versioned with code)
2. **Synchronization** happens via pull mode (scheduled) or push mode (real-time)
3. **Centralized View** presents all documentation in a unified portal
4. **Automated Sync** via GitHub Actions keeps everything up-to-date

### Key Features

- **Pull Mode**: Scheduled synchronization (daily at 6 AM UTC) via GitHub API
- **Push Mode**: Real-time updates via reusable workflow when documentation changes
- **Source Metadata**: Each document includes information about its source repository
- **Configurable**: Control which repositories and what content to include
- **Automated**: Both modes fully automated via GitHub Actions
- **Atomic**: Documentation stays with code in each project repository

### Synchronizing Documentation

```bash
# Pull documentation from project repositories
cd application && npm run pull-docs

# Generate project metadata pages
npm run generate-docs

# Or run both
npm run sync-docs
```

See [Documentation System](application/docs/documentation-system.md) for detailed information.

## 📁 Project Structure

```
├── .github/
│   ├── docs-sources.yml        # Configuration for documentation sources
│   ├── scripts/
│   │   ├── pull-docs.js        # Pull documentation from projects
│   │   └── generate-docs.js    # Generate project pages
│   └── workflows/
│       └── update-docs.yml     # Automated sync workflow
├── application/
│   ├── docs/                   # Documentation pages (aggregated + local)
│   │   ├── projects/           # Project-specific documentation (pulled)
│   │   ├── intro.md            # Introduction page
│   │   ├── documentation-system.md  # System documentation
│   │   └── projects.md         # Projects overview (generated)
│   ├── src/                    # Source files (React components, pages, etc.)
│   │   ├── components/         # React components
│   │   ├── css/               # CSS files
│   │   └── pages/             # Additional pages
│   ├── static/                # Static assets
│   ├── docusaurus.config.ts   # Docusaurus configuration
│   └── sidebars.ts            # Sidebar configuration
```

## 🔄 Adding Documentation from a Project

Choose between pull mode (scheduled) or push mode (real-time):

### Pull Mode (Scheduled)

1. **Add to configuration** in `.github/docs-sources.yml`:
   ```yaml
   - repository: your-project
     enabled: true
     docs_path: docs
     target_path: projects/your-project
     branch: main
     description: Your project description
   ```

2. **Commit and push** - documentation syncs daily at 6 AM UTC

### Push Mode (Real-time) - Recommended

1. **Add workflow to your project** (`.github/workflows/push-docs.yml`):
   ```yaml
   name: Push Documentation to Portal

   on:
     push:
       branches: [main]
       paths: ['docs/**', 'README.md']

   jobs:
     push-docs:
       uses: hoverkraft-tech/public-docs/.github/workflows/sync-docs-push.yml@main
       with:
         source_repo: 'your-project'
         target_path: 'projects/your-project'
       secrets:
         PUBLIC_DOCS_TOKEN: ${{ secrets.PUBLIC_DOCS_TOKEN }}
   ```

2. **Add secret** `PUBLIC_DOCS_TOKEN` to your repository - documentation syncs immediately on commit

See [.github/README.md](.github/README.md) for more details.

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Hoverkraft open-source ecosystem.
