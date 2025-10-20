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

## 🛠️ Customization

This portal is designed to dynamically build content from Hoverkraft's public repositories. The CI workflow will scan repositories and build the portal using:

- Repository topics and descriptions
- Social preview images
- Readme files and documentation
- Other useful metadata

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Hoverkraft open-source ecosystem.
