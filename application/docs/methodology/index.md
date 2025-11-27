---
sidebar_position: 1
---

# Hoverkraft Methodology

Welcome to the Hoverkraft methodology documentation. This section provides comprehensive guides on best practices, standards, and recommended approaches for building and maintaining software projects using the Hoverkraft ecosystem.

## What is the Hoverkraft Methodology?

The Hoverkraft methodology is a collection of proven practices, tools, and workflows designed to help teams build high-quality software efficiently. It emphasizes:

- **Modularity**: Reusable components and workflows
- **Consistency**: Standardized approaches across projects
- **Automation**: Minimize manual tasks through CI/CD
- **Quality**: Built-in checks and best practices
- **Security**: Security-first approach in all aspects
- **Community**: Open-source collaboration and transparency

## Documentation Sections

### CI/CD

Learn how to implement continuous integration and continuous deployment using modern DevOps practices:

- **[GitHub Actions](./ci-cd/github/)**: Step-by-step tutorial for structuring CI/CD pipelines with GitHub Actions, including comprehensive guides from getting started to deployment and troubleshooting.

### Golden Paths

What is a Golden Path?

A golden path is an opinionated sequence for setting up a new repository with the correct structure, workflows, and configurations to follow Hoverkraft best practices from the start. Instead of starting from scratch, you can leverage our reusable components to:

- **Get up and running quickly**: Pre-built workflows handle CI/CD, releases, and maintenance
- **Follow best practices**: Consistent structure and patterns across all your projects
- **Stay updated**: Dependabot keeps workflows and dependencies current
- **Focus on your code**: Infrastructure and automation are already handled

Step-by-step golden paths for creating new repositories using Hoverkraft's reusable workflows:

- **[Golden Paths Overview](./golden-paths/)**: Opinionated journeys for bootstrapping new projects
- **[Docker Base Images Golden Path](./golden-paths/docker-base-images/)**: Create your own Docker base images repository with automated builds and semantic versioning

## Key Principles

### 1. Infrastructure as Code

All infrastructure and deployment configurations should be version-controlled and reproducible.

### 2. Automated Testing

Every project should have automated tests that run on every change, ensuring quality and preventing regressions.

### 3. Continuous Integration

All code changes should be integrated frequently and validated automatically through CI pipelines.

### 4. Continuous Deployment

Successful builds on the main branch should be automatically deployed to appropriate environments.

### 5. Security by Default

Security scanning and best practices should be built into every workflow, not added as an afterthought.

### 6. Documentation

All projects should have clear, up-to-date documentation that includes setup instructions, architecture decisions, and contribution guidelines.

## Getting Started

1. **Choose Your Technology Stack**: Browse the CI/CD section for guides specific to your project type
2. **Review Examples**: Check out real-world implementations in Hoverkraft repositories
3. **Adapt and Implement**: Customize the templates and workflows for your specific needs
4. **Iterate and Improve**: Continuously refine your processes based on team feedback

## Contributing

The Hoverkraft methodology is continuously evolving based on community feedback and industry best practices. If you have suggestions or improvements:

1. Open a discussion in the [Hoverkraft discussions](https://github.com/orgs/hoverkraft-tech/discussions)
2. Submit a pull request to the documentation repository
3. Share your experience and learnings with the community

## Support

For questions or support:

- Visit [GitHub Discussions](https://github.com/orgs/hoverkraft-tech/discussions)
- Review project-specific documentation in individual repositories
- Check the [Projects page](../projects/) for relevant repositories
