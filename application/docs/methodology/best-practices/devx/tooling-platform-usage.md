---
sidebar_position: 10
---

# Tooling & Platform Usage

> _Reduce yak-shaving._

## Purpose

Make internal tools intuitive and discoverable. Developers should spend time solving business problems, not fighting infrastructure.

## Internal CLI / Platform Usage

### Build a Unified CLI

Provide a single CLI for common tasks:

```bash
# Example: hoverkraft CLI
hk auth login                    # Authenticate
hk env create my-feature         # Create ephemeral environment
hk deploy staging                # Deploy to staging
hk logs production --tail=100    # View production logs
hk db migrate                    # Run database migrations
hk secrets get database-url      # Retrieve secrets
```

✅ **DO**:

- Use consistent command structure (`hk <resource> <action>`)
- Provide `--help` for all commands
- Include examples in help text
- Auto-update CLI version
- Use colors and formatting for readability

❌ **DON'T**:

- Require memorizing complex flags
- Provide inconsistent command patterns
- Skip error messages with solutions
- Build multiple CLIs for different tools

**Sources:**

- [The CLI Book - Best Practices](https://clig.dev/)
- [Heroku CLI - Design Principles](https://devcenter.heroku.com/articles/cli-style-guide)

## Common Scripts & Automations

### Project Scripts (package.json)

Standardize scripts across projects:

```json
{
  "scripts": {
    "dev": "npm run db:start && npm run start",
    "start": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "db:start": "docker-compose up -d postgres",
    "db:migrate": "knex migrate:latest",
    "db:seed": "knex seed:run",
    "clean": "rm -rf dist node_modules"
  }
}
```

✅ **DO**:

- Use same script names across all projects
- Document scripts in README
- Make scripts idempotent (safe to run multiple times)
- Chain related commands

❌ **DON'T**:

- Use project-specific script names
- Require manual setup before scripts work
- Create scripts that modify production

**Sources:**

- [npm Scripts Best Practices](https://docs.npmjs.com/cli/v9/using-npm/scripts)

### Automation Scripts

Create helper scripts for common tasks:

```bash
#!/bin/bash
# scripts/setup-dev.sh - Set up local development environment

set -e

echo "🚀 Setting up development environment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }

# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Wait for database
until docker-compose exec -T postgres pg_isready; do
  echo "Waiting for database..."
  sleep 2
done

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

echo "✅ Setup complete! Run 'npm run dev' to start."
```

**Sources:**

- [GitHub - Scripts to Rule Them All](https://github.blog/2015-06-30-scripts-to-rule-them-all/)

## Infrastructure Abstractions

### Infrastructure as Code

Use Terraform or Pulumi for infrastructure:

```typescript
// pulumi/index.ts
import * as aws from '@pulumi/aws';

// Create S3 bucket
const bucket = new aws.s3.Bucket('app-assets', {
  acl: 'private',
  versioning: { enabled: true },
});

// Create RDS instance
const db = new aws.rds.Instance('app-db', {
  engine: 'postgres',
  engineVersion: '15',
  instanceClass: 'db.t3.micro',
  allocatedStorage: 20,
});

export const bucketName = bucket.id;
export const dbEndpoint = db.endpoint;
```

✅ **DO**:

- Version control all infrastructure
- Use modules for reusable components
- Document infrastructure decisions
- Test infrastructure changes in staging

❌ **DON'T**:

- Create resources manually in console
- Skip state management
- Use different tools for each environment

**Sources:**

- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Pulumi Documentation](https://www.pulumi.com/docs/)

## Self-Service Workflows

### Ephemeral Environments

Enable developers to create temporary environments:

```bash
# Create environment from branch
hk env create feature/new-checkout

# Output:
# ✅ Environment created: https://new-checkout-abc123.dev.example.com
# Database: postgres://ephemeral-db-abc123
# Expires: 2024-01-29 (24 hours)
```

**Benefits:**

- Test features in isolation
- Share with designers/PMs for feedback
- No conflicts with other developers

**Sources:**

- [Uffizzi - Ephemeral Environments](https://www.uffizzi.com/ephemeral-environments)

### Self-Service Deployments

Allow teams to deploy without external dependencies:

```yaml
# .github/workflows/deploy.yml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to deploy (e.g., v1.2.3)'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy:${{ inputs.environment }} -- --version=${{ inputs.version }}
```

**Sources:**

- [GitHub Actions - Manual Workflows](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow)

## Golden Paths (Opinionated Happy Paths)

### Example: Node.js API Golden Path

**1. Scaffold Project:**

```bash
npx create-hoverkraft-api my-api
cd my-api
```

**2. Generated Structure:**

```
my-api/
├── src/
│   ├── domain/        # Business logic
│   ├── infrastructure/ # Database, HTTP
│   └── interfaces/     # Controllers, validators
├── tests/
├── docker-compose.yml  # Local infrastructure
├── Dockerfile
├── .github/workflows/  # CI/CD
└── README.md
```

**3. Batteries Included:**

- TypeScript configured
- ESLint + Prettier
- Jest for testing
- Docker for local dev
- GitHub Actions for CI/CD
- OpenAPI spec generation
- Logging and metrics

**4. Developer Workflow:**

```bash
npm run dev              # Start local server + DB
npm test                 # Run tests
git push                 # Triggers CI/CD
```

✅ **DO**:

- Provide scaffolding tools
- Include working examples
- Document the golden path
- Make it easy to opt-out when needed

❌ **DON'T**:

- Force golden path without escape hatches
- Over-engineer the starter template
- Include unused dependencies

**Sources:**

- [Backstage - Software Templates](https://backstage.io/docs/features/software-templates/)
- [Yeoman - Scaffolding Tool](https://yeoman.io/)

## Troubleshooting Guides

### Common Issues & Solutions

Maintain a living troubleshooting guide:

#### Issue: "Port already in use"

**Symptoms:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### Issue: "Database connection failed"

**Symptoms:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

```bash
# Check if Docker is running
docker ps

# Start database
docker-compose up -d postgres

# Verify connection
docker-compose exec postgres pg_isready
```

#### Issue: "Tests failing in CI but passing locally"

**Symptoms:**

Tests pass on local machine but fail in GitHub Actions.

**Solution:**

```bash
# Run tests in CI mode locally
npm run test:ci

# Common causes:
# - Timezone differences
# - Missing environment variables
# - Different Node.js versions
```

**Sources:**

- [Stack Overflow Developer Survey](https://insights.stackoverflow.com/survey/)

## Developer Portal

### Internal Documentation Hub

Centralize all developer resources:

```
Developer Portal
├── Getting Started
│   ├── Setup Guide
│   ├── First Contribution
│   └── Architecture Overview
├── API Documentation
│   ├── REST API Reference
│   ├── GraphQL Schema
│   └── SDK Documentation
├── Guides
│   ├── Authentication
│   ├── Database Migrations
│   └── Deployment
├── Tools & CLIs
│   ├── Hoverkraft CLI
│   ├── Internal APIs
│   └── Development Tools
└── Runbooks
    ├── Incident Response
    ├── Deployment Procedures
    └── Troubleshooting
```

**Features:**

- Search across all docs
- Code samples with copy button
- API playground (Swagger/GraphQL Playground)
- Changelog and release notes
- Link to source code

**Sources:**

- [Spotify Backstage](https://backstage.io/)
- [Stripe Developer Documentation](https://stripe.com/docs)

## Internal Tools Catalog

Document all internal tools:

| Tool | Purpose | Getting Started |
|------|---------|-----------------|
| **Hoverkraft CLI** | Deploy, manage environments | `brew install hk-cli` |
| **Dev Portal** | Documentation hub | [portal.internal](https://portal.internal) |
| **Grafana** | Metrics and dashboards | [grafana.internal](https://grafana.internal) |
| **Sentry** | Error tracking | Auto-configured in apps |
| **DataDog** | Logs and APM | [datadog.internal](https://datadog.internal) |

✅ **DO**:

- Maintain up-to-date tool catalog
- Include links and authentication instructions
- Document when to use each tool
- Provide getting started guides

❌ **DON'T**:

- Require manual configuration for common tools
- Let tools become unknown/unused
- Duplicate functionality across tools

**Sources:**

- [Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/)

## Sources

- [The CLI Book - clig.dev](https://clig.dev/)
- [Platform Engineering - Team Topologies](https://teamtopologies.com/key-concepts)
- [Developer Portals - Gartner](https://www.gartner.com/en/documents/4010078)
