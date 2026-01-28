---
sidebar_position: 2
---

# CI/CD & Release Management

> _Boring releases are a feature._

## Purpose

Predictable, low-stress deployments. If deployments are scary, you'll do them less often, creating a vicious cycle of risky releases.

## CI Pipeline Overview

### Pipeline Stages

```
┌──────────┐   ┌────────┐   ┌──────────┐   ┌────────┐   ┌────────┐
│  Commit  │──▶│  Lint  │──▶│   Test   │──▶│  Build │──▶│ Deploy │
└──────────┘   └────────┘   └──────────┘   └────────┘   └────────┘
     │              │             │             │            │
     └── Fast ──────┴────────── Slower ────────┴── Slowest ─┘
```

**Stage Goals:**

1. **Lint**: Catch style issues (< 1 min)
2. **Test**: Verify correctness (< 5 min)
3. **Build**: Compile and package (< 10 min)
4. **Deploy**: Release to environment (< 15 min)

**Total CI time**: < 15 minutes for fast feedback

✅ **DO**:

- Fail fast (lint before tests, tests before build)
- Run tests in parallel
- Cache dependencies
- Use incremental builds

❌ **DON'T**:

- Run full test suite on every commit (use affected tests)
- Build without testing
- Deploy without build validation

**Sources:**

- [Continuous Delivery - Jez Humble](https://continuousdelivery.com/)
- [Google SRE - Continuous Integration](https://sre.google/workbook/deploying-cloud-native-applications/)

## Branching & Merge Strategy

### Trunk-Based Development (Recommended)

- **Main branch**: Always deployable
- **Feature branches**: Short-lived (< 2 days)
- **No long-lived branches**: Merge daily

```
main     ──●────●────●────●────●──▶
             \  /    /    /
feature1      ●─────┘    /
feature2           ●────┘
```

✅ **DO**:

- Merge to main multiple times per day
- Use feature flags for incomplete features
- Keep branches small (< 400 lines)
- Delete branches after merge

❌ **DON'T**:

- Create long-lived feature branches
- Use Git Flow (too complex for fast delivery)
- Merge without CI passing
- Keep stale branches

**Sources:**

- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

## Release Flow (PR → Main → Prod)

### Deployment Pipeline

```
PR Created
    ↓
CI Runs (lint, test, build)
    ↓
Code Review
    ↓
Merge to Main
    ↓
Deploy to Staging (auto)
    ↓
Smoke Tests (auto)
    ↓
Deploy to Production (auto or manual)
    ↓
Canary Release (10% traffic)
    ↓
Full Rollout (100% traffic)
```

### Automated Deployments

For a concrete workflow example, see the Golden Path CI/CD implementation:
[GitHub CI/CD](../../../golden-paths/application/ci-cd/github/).

**Sources:**

- [Continuous Deployment - Martin Fowler](https://martinfowler.com/bliki/ContinuousDelivery.html)

## Feature Flags Strategy

### Progressive Rollout

Use feature flags for gradual rollouts:

```typescript
// Feature flag provider
const featureFlags = {
  newCheckout: {
    enabled: true,
    rollout: 0.1, // 10% of users
  },
};

// In application code
if (isFeatureEnabled('newCheckout', user.id)) {
  return <NewCheckoutFlow />;
} else {
  return <OldCheckoutFlow />;
}
```

✅ **DO**:

- Use flags for risky features
- Roll out to internal users first (0%)
- Increase gradually (1% → 10% → 50% → 100%)
- Remove flags after full rollout
- Track flag usage in analytics

❌ **DON'T**:

- Ship incomplete features without flags
- Leave flags in code forever
- Use flags for A/B testing (use proper A/B tools)

**Sources:**

- [LaunchDarkly - Feature Flag Best Practices](https://launchdarkly.com/blog/feature-flag-best-practices/)
- [Martin Fowler - Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)

## Rollback & Hotfix Procedures

### Rollback Strategy

Fast rollback is more important than perfect rollbacks.

**Option 1: Revert Commit**

```bash
# Revert the problematic commit
git revert <commit-sha>
git push origin main
# CI automatically deploys the revert
```

**Option 2: Redeploy Previous Version**

```bash
# Deploy previous known-good version
npm run deploy:production -- --version=v1.2.3
```

**Option 3: Feature Flag Kill Switch**

```typescript
// Disable feature immediately
featureFlags.set("newCheckout", { enabled: false });
```

### Hotfix Process

For critical production bugs:

1. **Create hotfix branch** from main
2. **Fix and test** the issue
3. **Fast-track review** (1 approver, not 2)
4. **Deploy directly** to production
5. **Merge back** to main

```bash
git checkout -b hotfix/critical-bug main
# Fix the bug
git commit -m "fix: critical payment processing bug"
git push
# Create PR, get approval, deploy
```

**Sources:**

- [Incident Management - Atlassian](https://www.atlassian.com/incident-management/incident-response/deploy-fixes)

## Semantic Versioning Rules

Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (v1.0.0 → v2.0.0)
- **MINOR**: New features, backward-compatible (v1.0.0 → v1.1.0)
- **PATCH**: bugfixes, backward-compatible (v1.0.0 → v1.0.1)

### Conventional Commits

Use conventional commit messages to automate versioning:

```
feat: add user profile endpoint      → MINOR bump
fix: resolve null pointer exception  → PATCH bump
feat!: remove deprecated API         → MAJOR bump
```

**Automated Versioning:**

```yaml
# .github/workflows/release.yml
- name: Semantic Release
  uses: cycjimmy/semantic-release-action@v4
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Sources:**

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Environment Promotion Rules

### Environment Progression

```
Developer Laptop
    ↓
CI (ephemeral)
    ↓
Staging (mirrors production)
    ↓
Production (canary → full rollout)
```

✅ **DO**:

- Keep staging identical to production
- Test in staging before production
- Use production-like data volumes in staging
- Run smoke tests after each deployment

❌ **DON'T**:

- Skip staging deployments
- Use different infrastructure in staging
- Deploy untested code to production
- Share databases across environments

**Sources:**

- [The Twelve-Factor App - Dev/Prod Parity](https://12factor.net/dev-prod-parity)

## Deployment Checklists

### Pre-Deployment Checklist

Before deploying to production:

- [ ] All CI checks pass
- [ ] Code reviewed and approved
- [ ] Database migrations tested in staging
- [ ] Feature flags configured
- [ ] Monitoring and alerts enabled
- [ ] Rollback plan documented
- [ ] On-call engineer notified
- [ ] Stakeholders informed (if breaking changes)

### Post-Deployment Checklist

After deploying to production:

- [ ] Smoke tests pass
- [ ] Error rates normal
- [ ] Response times acceptable
- [ ] Key metrics unchanged (conversion, signups)
- [ ] Canary metrics healthy
- [ ] Logs show no anomalies
- [ ] Update status page (if applicable)

**Sources:**

- [Deployment Checklist - Atlassian](https://www.atlassian.com/software/jira/ops/devops/deployment-checklist)

## Zero-Downtime Deployments

### Blue-Green Deployment

Run two identical production environments:

```
┌─────────┐       ┌─────────┐
│  Blue   │◀─────▶│  Green  │
│ (Live)  │       │(Standby)│
└─────────┘       └─────────┘
     │                 │
     └────── LB ───────┘
```

1. Deploy to Green (standby)
2. Test Green environment
3. Switch traffic to Green
4. Blue becomes standby

**Sources:**

- [Martin Fowler - Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)

### Canary Deployment

Gradually shift traffic to new version:

```
V1: ███████████ 90%
V2: ██ 10%

→ (15 min later)

V1: ██████ 50%
V2: ██████ 50%

→ (15 min later)

V1: 0%
V2: ███████████ 100%
```

**Sources:**

- [Google SRE - Canary Deployments](https://sre.google/workbook/canarying-releases/)

## Sources

- [Accelerate - Nicole Forsgren](https://itrevolution.com/product/accelerate/)
- [Release It! - Michael Nygard](https://pragprog.com/titles/mnee2/release-it-second-edition/)
- [Site Reliability Engineering - Google](https://sre.google/books/)

```

```
