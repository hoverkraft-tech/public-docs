---
sidebar_position: 3
---

# Developer Onboarding

> _From zero to first PR, fast._

## Purpose

Minimize time-to-first-commit. Every hour a new developer spends setting up their environment or searching for tribal knowledge is wasted value.

**Golden Metric**: Can a new developer be productive in < 1 day?

## Local Environment Setup

### Automated Setup Script

Provide a single command to install all dependencies:

```bash
./scripts/setup.sh
```

✅ **DO**:

- Detect OS (macOS, Linux, Windows/WSL) and install appropriate tools
- Check for required versions and upgrade if needed
- Install language runtimes, package managers, and build tools
- Set up pre-commit hooks automatically
- Validate setup with health checks
- Print clear error messages with fix instructions

❌ **DON'T**:

- Assume tools are already installed
- Require manual configuration of environment variables
- Skip version checks (old tools cause obscure errors)
- Leave broken or incomplete setup states

**Example (Node.js):**

```bash
#!/bin/bash
set -e

echo "🚀 Setting up development environment..."

# Check Node.js version
required_node_version="20"
current_node_version=$(node -v | cut -d. -f1 | sed 's/v//')

if [ "$current_node_version" -lt "$required_node_version" ]; then
  echo "❌ Node.js $required_node_version+ required. Found: $(node -v)"
  echo "Install via: https://nodejs.org/"
  exit 1
fi

# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Run health check
npm run health-check

echo "✅ Setup complete! Run 'npm start' to begin."
```

**Sources:**

- [GitHub - Setup Scripts Best Practices](https://github.com/github/scripts-to-rule-them-all)

### Secrets Management

Never commit secrets. Use a secure method to distribute credentials:

✅ **DO**:

- Use a secret manager (1Password, AWS Secrets Manager, Vault)
- Provide a `.env.example` template
- Document how to obtain each secret
- Use different secrets for dev, staging, production

❌ **DON'T**:

- Email secrets or share via Slack
- Commit `.env` files
- Use production secrets in development
- Leave secrets undocumented

**Example `.env.example`:**

```bash
# Database (obtain from team lead or secret manager)
DATABASE_URL=postgresql://localhost:5432/myapp_dev

# API Keys (get from https://platform.example.com/api-keys)
EXTERNAL_API_KEY=your_key_here

# Optional: Feature flags
FEATURE_X_ENABLED=true
```

**Sources:**

- [OWASP - Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## Repo Overview & Mental Model

### Architecture Diagram

Include a visual overview in `README.md` or `docs/architecture.md`:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │─────▶│  API Gateway │─────▶│   Backend   │
│  (React)    │      │   (Node.js)  │      │  (Go/Python)│
└─────────────┘      └──────────────┘      └─────────────┘
                             │                      │
                             ▼                      ▼
                     ┌──────────────┐      ┌─────────────┐
                     │  Auth Service│      │  Database   │
                     └──────────────┘      │ (Postgres)  │
                                            └─────────────┘
```

### Key Concepts

Document the 3-5 most important concepts new developers must understand:

1. **Request Flow**: How does a user request flow through the system?
2. **Data Model**: What are the core entities and relationships?
3. **Authentication**: How do we identify and authorize users?
4. **Deployment**: How does code get from laptop to production?

**Sources:**

- [C4 Model - Software Architecture Diagrams](https://c4model.com/)

## First Task / Hello World Guide

Provide a guided first contribution that touches all parts of the stack:

### Example: Add a "Health Status" Endpoint

**Goal**: Add a new API endpoint and display the result in the UI.

1. **Backend** (5 min):
   ```bash
   # Add endpoint in src/routes/health.ts
   app.get('/api/health', (req, res) => {
     res.json({ status: 'healthy', timestamp: new Date() });
   });
   ```

2. **Frontend** (5 min):
   ```jsx
   // Add component in src/components/HealthStatus.tsx
   export function HealthStatus() {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       fetch('/api/health')
         .then(res => res.json())
         .then(setData);
     }, []);
     
     return <div>Status: {data?.status}</div>;
   }
   ```

3. **Test** (5 min):
   ```bash
   npm test -- health.test.ts
   ```

4. **Deploy** (5 min):
   ```bash
   git checkout -b feature/health-endpoint
   git add .
   git commit -m "feat: add health status endpoint"
   git push
   # Open PR via link in terminal output
   ```

**Expected Outcome**: PR is reviewed and merged within 1 hour.

## Common Pitfalls & "Things We Wish We Knew"

Maintain a living document of gotchas:

### Example Pitfalls

❌ **Pitfall**: Forgetting to run migrations after pulling latest code  
✅ **Solution**: Run `npm run migrate` after every `git pull`

❌ **Pitfall**: Tests pass locally but fail in CI  
✅ **Solution**: Run `npm run test:ci` before pushing (includes linting, type checks)

❌ **Pitfall**: Dependency installation hangs  
✅ **Solution**: Clear cache with `npm cache clean --force`

❌ **Pitfall**: Docker containers don't restart after OS reboot  
✅ **Solution**: Add `restart: unless-stopped` to `docker-compose.yml`

**Sources:**

- [Awesome Guidelines - Things I Wish I Knew](https://github.com/Kristories/awesome-guidelines)

## Access Management & Permissions

Document how to request access to:

- **GitHub Organization**: Request invite from team lead
- **AWS Console**: Submit access request via internal portal
- **Datadog/Monitoring**: Auto-granted after joining GitHub org
- **Production Database**: Read-only access only; write access requires approval
- **Secret Manager**: Request access via Slack #devops channel

### Permission Matrix

| Resource          | New Dev | Senior Dev | Team Lead |
|-------------------|---------|------------|-----------|
| GitHub Repo       | Read    | Write      | Admin     |
| Dev Environment   | Admin   | Admin      | Admin     |
| Staging           | Read    | Write      | Admin     |
| Production        | None    | Read       | Write     |

**Sources:**

- [NIST - Role-Based Access Control](https://csrc.nist.gov/projects/role-based-access-control)

## Glossary

Define critical terms to establish shared language:

| Term | Definition |
|------|------------|
| **ADR** | Architecture Decision Record - Documents significant technical decisions |
| **Golden Path** | Opinionated, recommended way to accomplish a common task |
| **Runbook** | Step-by-step guide for operational tasks (deployments, debugging) |
| **SLI/SLO** | Service Level Indicator/Objective - Measurable reliability targets |
| **Blast Radius** | Impact scope of a potential failure or change |

**Sources:**

- [The Phoenix Project - DevOps Glossary](https://itrevolution.com/articles/the-phoenix-project/)
- [Google SRE - Glossary](https://sre.google/sre-book/glossary/)

## Sources

- [Stripe - Developer Onboarding](https://stripe.com/blog/developer-onboarding)
- [Atlassian - New Developer Onboarding](https://www.atlassian.com/blog/inside-atlassian/onboarding-developers-new-role)
