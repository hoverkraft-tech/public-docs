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
2. **Pull System** automatically fetches documentation from configured repositories
3. **Centralized View** presents all documentation in a unified portal
4. **Automated Sync** via GitHub Actions keeps everything up-to-date

### Key Features

- **Pull Mode**: Automatically pulls documentation from project repositories via GitHub API
- **Source Metadata**: Each document includes information about its source repository
- **Configurable**: Control which repositories and what content to include via `.github/docs-sources.yml`
- **Automated**: Daily synchronization with manual trigger option
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

To include documentation from a new project:

1. **Add to configuration** in `.github/docs-sources.yml`:
   ```yaml
   - repository: your-project
     enabled: true
     docs_path: docs
     target_path: projects/your-project
     branch: main
     description: Your project description
   ```

2. **Commit and push** - the workflow will automatically sync the documentation

See [.github/README.md](.github/README.md) for more details.

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Hoverkraft open-source ecosystem.
