---
sidebar_position: 1
---

# Hoverkraft Opinionated Approach

At Hoverkraft, we believe developer experience is not a luxury—it's a competitive advantage. Our approach prioritizes pragmatism, measurability, and continuous improvement.

## 1. Developer Velocity Over Bureaucracy

Move fast without breaking things. Every process, tool, or gate should demonstrably add value. If it slows teams down without measurable benefit, remove it.

**Why it matters**: Excessive process creates learned helplessness. Developers stop suggesting improvements when every change requires committee approval.

## 2. Make the Right Thing the Easy Thing

Good practices should be the path of least resistance. Security, quality, and observability should be built into golden paths, not bolted on afterward.

**Why it matters**: When shortcuts are easier than best practices, shortcuts win. Design systems where doing the right thing is also the fastest thing.

## 3. Self-Service by Default

Developers should be able to provision environments, deploy code, access logs, and troubleshoot issues without filing tickets or waiting for other teams.

**Why it matters**: Dependencies on other teams create bottlenecks. Self-service scales; manual hand-offs don't.

## 4. Documentation as Code

Documentation lives in version control, is reviewed like code, and is automatically deployed. Stale docs are worse than no docs.

**Why it matters**: Documentation that isn't versioned, tested, and maintained becomes misleading. Treating it like code ensures it stays accurate.

## 5. Measure What Matters

Track DORA metrics (deployment frequency, lead time, MTTR, change failure rate) and DX Core 4 (feedback loops, cognitive load, flow state, fast feedback). Ignore vanity metrics.

**Why it matters**: You can't improve what you don't measure. Focus on metrics that correlate with business outcomes and developer satisfaction.

## 6. Opinionated, Not Dogmatic

Provide strong defaults and golden paths, but allow escape hatches when needed. Optimize for the 90% case; don't let edge cases dictate architecture.

**Why it matters**: Standardization enables efficiency. Flexibility prevents stagnation. Balance both.

## 7. Shift Left, Not Shift Everywhere

Find issues early (in IDE, pre-commit, CI), but don't duplicate checks. Each gate should catch unique problems.

**Why it matters**: Redundant checks slow feedback loops. Strategic placement of quality gates maximizes value with minimal friction.

## 8. Boring Technology for Infrastructure

Use proven, well-documented tools for infrastructure and platform concerns. Save innovation for product features that differentiate the business.

**Why it matters**: Exotic infrastructure increases cognitive load and limits hiring. Boring tools mean faster onboarding and better community support.

## 9. No Broken Windows

Fix small issues immediately. Broken tests, skipped checks, and "temporary" workarounds compound into technical debt that slows everyone.

**Why it matters**: Teams tolerate the quality level they see. One broken window signals that quality doesn't matter, leading to more broken windows.

## 10. Continuous Improvement is Everyone's Job

DevX is not owned by one team. Everyone contributes to documentation, proposes improvements, and participates in retrospectives.

**Why it matters**: Centralized ownership creates bottlenecks. Distributed ownership scales with the organization.

## Philosophy in Practice

When making DevX decisions, ask:

- **Does this reduce time-to-first-commit for new developers?**
- **Does this eliminate a common source of friction or cognitive load?**
- **Is this the easiest way to do the right thing?**
- **Will this scale as the team grows?**
- **Can we measure the impact of this change?**

## Antipatterns to Avoid

❌ Copying practices from other companies without understanding context  
❌ Adding process to prevent rare mistakes instead of automating detection  
❌ Building internal tools that duplicate existing open-source solutions  
❌ Requiring manual approvals for tasks that could be automated  
❌ Optimizing for governance over delivery speed  
❌ Letting perfect be the enemy of good enough

## Sources

- [Spotify Engineering Culture](https://engineering.atspotify.com/2014/03/spotify-engineering-culture-part-1/)
- [DX - Developer Experience Research](https://getdx.com/research)
- [Team Topologies - Cognitive Load](https://teamtopologies.com/key-concepts-content/what-is-cognitive-load)
- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
