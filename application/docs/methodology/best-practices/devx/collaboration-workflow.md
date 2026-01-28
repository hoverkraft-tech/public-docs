---
sidebar_position: 11
---

# Collaboration & Workflow

> _Great DevX is also social._

## Purpose

Reduce friction between humans. Technical excellence means nothing if teams can't collaborate effectively.

## PR Expectations & Review Etiquette

### Pull Request Guidelines

✅ **Good PR Characteristics**:

- **Small**: < 400 lines changed
- **Focused**: One logical change
- **Tested**: Tests included and passing
- **Documented**: README/docs updated if needed
- **Self-explanatory**: Clear title and description

❌ **Bad PR Characteristics**:

- **Large**: > 1000 lines (split into smaller PRs)
- **Mixed**: Multiple unrelated changes
- **Untested**: No tests for new code
- **Unclear**: Vague description or title

**PR Template:**

```markdown
## What

Brief description of the change (1-2 sentences).

## Why

Why is this change needed? Link to issue/ticket.

## How

High-level approach taken.

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manually tested in local environment

## Screenshots (if UI change)

[Include screenshots/videos]

## Deployment Notes

Any special deployment steps or configuration changes?

## Checklist

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Breaking changes documented
```

**Sources:**

- [GitHub - Pull Request Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)

### Code Review Standards

**Reviewer Responsibilities:**

✅ **DO**:

- Review within 24 hours (or notify if unavailable)
- Focus on correctness, design, and maintainability
- Ask questions, don't demand changes
- Approve if acceptable, even if you'd do it differently
- Suggest improvements as "nit" (non-blocking)

❌ **DON'T**:

- Nitpick formatting (linters handle this)
- Rewrite someone's code in review
- Review your own PRs
- Approve without reading the code

**Author Responsibilities:**

✅ **DO**:

- Respond to feedback within 24 hours
- Address or discuss all comments
- Thank reviewers for their time
- Keep discussion respectful
- Request re-review after changes

❌ **DON'T**:

- Take feedback personally
- Argue over style (defer to linter/team standards)
- Merge without approval
- Ignore comments

**Review Comment Examples:**

```markdown
# Good comments

❓ Question: Why did we choose Redis over Memcached here?
💡 Suggestion: Consider extracting this into a helper function
⚠️ Concern: This might cause a race condition if two users update simultaneously
✅ Looks good! Just one nit: could we rename `data` to `userData` for clarity?

# Bad comments

❌ This is wrong. (Not helpful - explain why)
❌ We should use strategy pattern here. (Over-engineering)
❌ I would have done this differently. (Not actionable)
```

**Sources:**

- [Conventional Comments](https://conventionalcomments.org/)
- [Code Review Etiquette - LinkedIn](https://engineering.linkedin.com/blog/2021/code-review-etiquette)

## Communication Norms

### Async-First Communication

✅ **Use Async (Slack, Issues, Docs) for**:

- Questions that can wait hours
- Status updates
- Sharing information
- Non-urgent decisions
- Documentation

❌ **Use Sync (Meetings, Calls) for**:

- Incidents or outages
- Complex discussions requiring back-and-forth
- Conflict resolution
- Brainstorming sessions

**Slack Guidelines:**

```markdown
# Good Slack message

Hey team! 👋 I'm working on the authentication refactor and noticed
we're using two different JWT libraries. Should we standardize on one?

Context:

- `jsonwebtoken` in auth-service
- `jose` in api-gateway

Suggestion: Migrate to `jose` (more actively maintained)

Thoughts? No rush, respond when you can.

# Bad Slack message

hey
(waits 2 hours)
u there?
(waits 1 hour)
i have a question
```

**Sources:**

- [Remote Work Communication - GitLab](https://about.gitlab.com/company/culture/all-remote/asynchronous/)

### Documentation Over Tribal Knowledge

✅ **DO**:

- Document decisions in ADRs
- Update readme when behavior changes
- Write runbooks for operational tasks
- Record meeting notes in shared docs
- Link to documentation in code comments

❌ **DON'T**:

- Keep critical knowledge in Slack threads
- Rely on "just ask Alice" for information
- Let onboarding be word-of-mouth
- Answer same question multiple times (document once)

**Sources:**

- [Write the Docs - Documentation Guide](https://www.writethedocs.org/guide/)

## Incident Communication Flow

### Incident Severity Levels

| Severity  | Definition               | Response Time     | Examples                                 |
| --------- | ------------------------ | ----------------- | ---------------------------------------- |
| **SEV-1** | Critical customer impact | < 5 min           | Payment processing down, complete outage |
| **SEV-2** | Major degradation        | < 15 min          | Slow response times, partial outage      |
| **SEV-3** | Minor impact             | < 1 hour          | Non-critical feature broken              |
| **SEV-4** | Cosmetic issue           | Next business day | UI glitch, typo                          |

### Incident Communication Template

**Initial Alert (within 5 minutes):**

```markdown
🚨 INCIDENT: Payment Processing Down (SEV-1)

Status: Investigating
Impact: Users cannot complete purchases
Started: 2024-01-28 10:30 UTC
Commander: @alice
Link: [Incident Doc](https://docs.internal/incident-123)

Next update in 15 minutes.
```

**Status Update (every 15-30 minutes):**

```markdown
📊 UPDATE: Payment Processing Down (SEV-1)

Status: Identified - database connection pool exhausted
Impact: Users cannot complete purchases (~5,000 affected)
Actions:

- Increased connection pool size
- Restarting affected services
- Monitoring recovery

Next update in 15 minutes.
```

**Resolution:**

```markdown
✅ RESOLVED: Payment Processing Down (SEV-1)

Status: Resolved
Duration: 45 minutes (10:30 - 11:15 UTC)
Impact: 5,000 users affected, ~$10K revenue delayed
Root Cause: Database connection pool exhausted under load
Fix: Increased pool size from 10 to 50 connections

Post-mortem: [Link to doc]
```

**Sources:**

- [Incident.io - Incident Communication](https://incident.io/guide/incident-communication)
- [PagerDuty - Incident Response](https://response.pagerduty.com/)

## Ownership & Escalation Paths

### RACI Matrix

Define roles for key processes:

| Task                    | Responsible | Accountable        | Consulted    | Informed     |
| ----------------------- | ----------- | ------------------ | ------------ | ------------ |
| **Feature Development** | Engineer    | Team Lead          | Designer, PM | Stakeholders |
| **Code Review**         | Reviewer    | Author             | Tech Lead    | Team         |
| **Deployment**          | Engineer    | Team Lead          | DevOps       | Stakeholders |
| **Incident Response**   | On-call     | Incident Commander | Team         | Leadership   |

**Sources:**

- [RACI Matrix - Wikipedia](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix)

### Escalation Path

```
Level 1: Team Lead (< 30 min)
   ↓
Level 2: Engineering Manager (< 1 hour)
   ↓
Level 3: Director of Engineering (< 2 hours)
   ↓
Level 4: CTO (critical incidents)
```

**When to Escalate:**

- Issue not resolved within expected time
- Impact severity increases
- Multiple teams needed
- Executive decision required

**Sources:**

- [Incident Escalation - Atlassian](https://www.atlassian.com/incident-management/on-call/escalation-policy)

## Cross-Team Collaboration Rules

### API Contract Reviews

Before changing public APIs:

1. **Announce**: Post in #api-changes channel
2. **Review**: Get feedback from consuming teams
3. **Document**: Update API docs and changelog
4. **Deprecate**: Give 6-month notice for breaking changes
5. **Migrate**: Provide migration guide and sample code

**Sources:**

- [API Governance - Postman](https://www.postman.com/api-platform/api-governance/)

### Shared Component Ownership

**For shared libraries/services:**

✅ **DO**:

- Have a primary owner team
- Accept contributions from any team
- Require approval from owner team
- Maintain backward compatibility
- Publish release notes

❌ **DON'T**:

- Block contributions from other teams
- Make breaking changes without notice
- Skip documentation for public APIs

**Sources:**

- [Inner Source - Open Source Practices Internally](https://innersourcecommons.org/)

## Meeting Etiquette

### Effective Meetings

✅ **DO**:

- Have a clear agenda (sent 24h in advance)
- Start and end on time
- Take notes (designate a note-taker)
- Document decisions and action items
- Share recording for those who couldn't attend

❌ **DON'T**:

- Schedule meetings without agenda
- Discuss in meeting what could be async
- Fail to send follow-up notes
- Require attendance without clear purpose

**Meeting Template:**

```markdown
# Team Sync - 2024-01-28

## Agenda

- [ ] Deploy readiness for v2.0 (10 min)
- [ ] Database migration strategy (15 min)
- [ ] Q&A (5 min)

## Notes

- [Take notes here]

## Decisions

- [Document decisions]

## Action Items

- [ ] @alice - Complete migration script by Friday
- [ ] @bob - Review deployment checklist
```

**Sources:**

- [Atlassian - Meeting Best Practices](https://www.atlassian.com/work-management/project-collaboration/team-meetings)

## Pair Programming & Mob Programming

### When to Pair

✅ **Good for Pairing**:

- Onboarding new team members
- Complex or critical code
- Knowledge sharing
- Debugging difficult issues

❌ **Not Good for Pairing**:

- Simple, repetitive tasks
- Solo research/exploration
- When one person is teaching only

**Pairing Best Practices:**

- Switch driver/navigator every 25 minutes
- Take breaks every hour
- Both people actively engaged
- Respect different working styles

**Sources:**

- [Pair Programming Guide - Martin Fowler](https://martinfowler.com/articles/on-pair-programming.html)

## Sources

- [Google Engineering Practices](https://google.github.io/eng-practices/)
- [GitLab Team Handbook](https://about.gitlab.com/handbook/)
- [Atlassian Team Playbook](https://www.atlassian.com/team-playbook)
