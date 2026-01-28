---
sidebar_position: 2
---

# Application Repository

Create a production-ready application repository using the current Hoverkraft application pattern: containerized app (any stack) and Helm chart. The base steps are VCS/platform-agnostic. A GitHub Actions implementation is provided as an optional track; swap it for your preferred CI/CD platform while keeping the repository structure and Docker/Helm flow. The examples use a Node/Astro app, but you can swap the runtime and build commands while keeping the same structure. For multi-application repositories (for example `application/backend`, `application/frontend` or `application/microservice-*`), repeat the same pattern per service: each service gets its own app folder and Dockerfile targets, while an umbrella Helm chart wires the services together under one release.

## Tutorial Pages

1. **[Getting Started](./01-getting-started.md)** - Prerequisites and architecture
2. **[Repository Scaffold](./02-repo-scaffold.md)** - Directory layout and key files
3. **[CI/CD](./03-ci-cd/index.md)** - Generic entry point for your pipeline; see provider-specific implementations (e.g., [GitHub](./03-ci-cd/github/index.md)).
4. **[Verify & Operate](./04-verify.md)** - Dry runs, release, and deployment checks (refer to your CI/CD platform).
5. **[Hygiene & Maintenance](./05-hygiene.md)** (GitHub example) - Community workflows, Dependabot, and upkeep; adapt equivalents for your platform.

## Who This Is For

- Teams creating containerized web applications with Helm delivery
- Anyone standardizing CI/CD on Hoverkraft reusable workflows
- Operators needing a repeatable, pinned setup for previews and releases

## Time Required

- **Scaffold repository**: 20 minutes
- **Add CI/CD + secrets**: 20 minutes
- **Verify and deploy once**: 20 minutes

## What You'll Build

✅ Containerized web app with `ci` and `prod` images built from one Dockerfile  
✅ Feature-branch and main branch CI that runs inside the built `ci` image  
✅ Helm chart docs/tests kept in sync with images  
✅ Manual release workflow that tags and deploys to UAT/production  
✅ `/deploy` comment flow for review apps  
✅ Automatic cleanup of review app deployments when feature branches are merged/closed

## Next Steps

Follow the pages in order for the fastest setup, or jump to specific steps if your repository already has pieces in place.
