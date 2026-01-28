---
sidebar_position: 2
---

# Foundations & Principles

> _Set the north star before the how._

## Purpose

Align everyone on why things exist and how decisions are made. Without shared principles, teams optimize locally and create inconsistent systems.

## DevX Vision & Goals

### Vision Statement

**"Developers focus on solving business problems, not fighting tooling."**

Every developer should:
- Ship their first PR on day one
- Deploy to production confidently within their first week
- Understand system architecture within their first month
- Propose and implement improvements without permission

### What "Good" Looks Like

✅ **DO**:

- Onboarding takes < 1 day from laptop to first commit
- Local development matches production behavior
- CI feedback arrives in < 10 minutes
- Developers can deploy, rollback, and debug independently
- Documentation is discoverable, accurate, and actionable

❌ **DON'T**:

- Require tribal knowledge to contribute
- Force developers to wait for other teams to unblock them
- Accept "works on my machine" as an answer
- Let outdated documentation exist without fixing it
- Tolerate flaky tests or unreliable CI

**Sources:**

- [DX Core 4 Framework](https://getdx.com/research/dora-dx-core-4-and-developer-experience)
- [DORA State of DevOps Report](https://dora.dev/research/)

## Engineering Principles

### SOLID Principles

Apply SOLID to design maintainable, extensible systems:

- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Clients shouldn't depend on methods they don't use
- **Dependency Inversion**: Depend on abstractions, not concretions

**Sources:**

- [Uncle Bob Martin - SOLID Principles](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)

### KISS (Keep It Simple, Stupid)

Complexity is the enemy of reliability. Choose simple solutions over clever ones.

✅ **DO**: Use standard library functions, proven patterns, and boring solutions  
❌ **DON'T**: Over-engineer, prematurely optimize, or use exotic patterns

**Sources:**

- [KISS Principle - Wikipedia](https://en.wikipedia.org/wiki/KISS_principle)

### YAGNI (You Aren't Gonna Need It)

Don't build features for hypothetical future needs. Ship the simplest thing that works.

✅ **DO**: Build for current requirements with extensibility in mind  
❌ **DON'T**: Add configuration, abstraction, or features "just in case"

**Sources:**

- [Martin Fowler - YAGNI](https://martinfowler.com/bliki/Yagni.html)

### Clean Architecture

Separate business logic from infrastructure concerns. Core domain logic should be independent of frameworks, databases, and external systems.

**Layers:**
1. **Entities**: Core business rules
2. **Use Cases**: Application business rules
3. **Interface Adapters**: Controllers, presenters, gateways
4. **Frameworks & Drivers**: External tools and frameworks

**Sources:**

- [Robert C. Martin - Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microsoft - Clean Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)

## Trade-off Philosophy

### Speed vs. Safety

**Default**: Optimize for speed with safety guardrails (automated tests, canary deployments, feature flags).

- **When to prioritize speed**: New features, internal tools, non-critical paths
- **When to prioritize safety**: Payment processing, authentication, data deletion

**Sources:**

- [Google SRE - Error Budgets](https://sre.google/sre-book/embracing-risk/)

### Build vs. Buy

**Default**: Buy/use open source unless the problem is core to your competitive advantage.

- **Build**: Unique business logic, differentiating features
- **Buy**: Authentication, logging, monitoring, CI/CD, databases

**Sources:**

- [Thoughtworks - Build vs Buy](https://www.thoughtworks.com/insights/blog/infrastructure/build-or-buy-decision-making-guide)

### Consistency vs. Flexibility

**Default**: Provide opinionated golden paths for the 90% case. Allow escape hatches for edge cases.

- **Enforce**: Security, compliance, observability
- **Recommend**: Frameworks, languages, deployment patterns

## Definition of "Production-Ready"

Code is production-ready when:

✅ **Functional Requirements**:
- Feature works as specified
- Edge cases are handled
- Error messages are actionable

✅ **Quality Requirements**:
- Tests exist (unit, integration, E2E as appropriate)
- Linting passes
- Code review approved
- No known security vulnerabilities

✅ **Operational Requirements**:
- Logging includes request IDs and context
- Metrics track key operations
- Alerts exist for failure modes
- Runbook documents troubleshooting steps
- Rollback procedure is tested

✅ **Documentation Requirements**:
- API contracts documented (OpenAPI, GraphQL schema)
- README updated with new behavior
- Architecture Decision Records (ADR) for significant changes

**Sources:**

- [Production Readiness Checklist - Google SRE](https://sre.google/sre-book/evolving-sre-engagement-model/)
- [The Twelve-Factor App](https://12factor.net/)

## RFC Process & Decision Records

### When to Write an RFC

Write a Request for Comments (RFC) for:
- Architecture changes affecting multiple teams
- New infrastructure or tooling standards
- Breaking API changes
- Security or compliance policy changes

**Don't write an RFC for**:
- Small bug fixes
- Refactoring within a single service
- Changes that are easily reversible

### RFC Template

```markdown
# RFC-XXX: [Title]

## Status
[Proposed | Accepted | Rejected | Superseded]

## Context
Why is this change needed? What problem does it solve?

## Decision
What are we doing? Be specific.

## Consequences
- Positive: What improves?
- Negative: What gets harder?
- Neutral: What changes without clear good/bad impact?

## Alternatives Considered
What other options were evaluated and why were they rejected?

## References
Links to related RFCs, documentation, or external resources.
```

### Architecture Decision Records (ADR)

Use ADRs to document significant decisions. Keep them in the repository (`docs/adr/`).

**Format**: Follow [MADR template](https://adr.github.io/madr/)

**Sources:**

- [ADR GitHub Organization](https://adr.github.io/)
- [Thoughtworks Technology Radar - ADRs](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records)

## Sources

- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
- [Philosophy of Software Design - John Ousterhout](https://web.stanford.edu/~ouster/cgi-bin/book.php)
- [Staff Engineer - Will Larson](https://staffeng.com/book)
