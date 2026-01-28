---
sidebar_position: 8
---

# Observability & Operations

> _If it's not observable, it's broken._

## Purpose

Reduce MTTR (Mean Time To Recovery) and on-call pain. You can't fix what you can't see.

## Logging Standards

### Log Levels

Use appropriate log levels:

| Level | When to Use | Examples |
|-------|-------------|----------|
| **ERROR** | Action failed, requires intervention | Payment processing failed, database unavailable |
| **WARN** | Potential issue, doesn't block operation | Deprecated API used, retry limit approaching |
| **INFO** | Significant events | User logged in, order created, deployment started |
| **DEBUG** | Detailed diagnostic info | Variable values, function entry/exit |

✅ **DO**:

- Log errors with stack traces
- Log warnings for deprecated features
- Log info for business events
- Use debug for troubleshooting only (disabled in prod)

❌ **DON'T**:

- Log sensitive data (passwords, tokens, PII)
- Log at DEBUG level in production (performance impact)
- Use ERROR for validation failures (use WARN)

**Sources:**

- [The Twelve-Factor App - Logs](https://12factor.net/logs)
- [Syslog Severity Levels](https://en.wikipedia.org/wiki/Syslog#Severity_level)

### Structured Logging

Always use structured JSON logs:

```typescript
// ✅ Good - structured
logger.info('User authenticated', {
  userId: user.id,
  email: user.email,
  requestId: req.id,
  duration: Date.now() - startTime,
  ipAddress: req.ip,
});

// ❌ Bad - unstructured string
logger.info(`User ${user.email} authenticated in ${duration}ms`);
```

**Required Fields:**

- `timestamp`: ISO 8601 format
- `level`: ERROR, WARN, INFO, DEBUG
- `message`: Human-readable description
- `requestId`: Trace requests across services
- `service`: Service name
- `environment`: dev, staging, production

**Example Log Entry:**

```json
{
  "timestamp": "2024-01-28T10:35:19.563Z",
  "level": "INFO",
  "message": "User authenticated",
  "service": "auth-service",
  "environment": "production",
  "requestId": "req_abc123",
  "userId": "user_456",
  "email": "user@example.com",
  "duration": 142,
  "ipAddress": "192.168.1.1"
}
```

**Sources:**

- [Structured Logging - Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)

### Correlation IDs

Use request IDs to trace requests across services:

```typescript
// Generate ID at API gateway
const requestId = req.headers['x-request-id'] || generateId();

// Pass to downstream services
await fetch('https://api.internal/users', {
  headers: { 'x-request-id': requestId },
});

// Include in all logs
logger.info('Fetching user', { requestId, userId });
```

**Sources:**

- [Correlation IDs - Microservices Pattern](https://microservices.io/patterns/observability/correlation-id.html)

## Metrics & SLIs / SLOs

### Key Metrics (RED Method)

Track these for every service:

- **Rate**: Requests per second
- **Errors**: Error rate (%)
- **Duration**: Request latency (p50, p95, p99)

```typescript
// Increment counters
metrics.increment('api.requests', { endpoint: '/users', method: 'GET' });
metrics.increment('api.errors', { endpoint: '/users', statusCode: 500 });

// Record duration
const start = Date.now();
// ... handle request
metrics.timing('api.duration', Date.now() - start, { endpoint: '/users' });
```

**Sources:**

- [RED Method - Tom Wilkie](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)
- [Google SRE - Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

### Service Level Indicators (SLIs)

Measure what users care about:

| SLI | Target | Measurement |
|-----|--------|-------------|
| **Availability** | 99.9% | % of successful requests |
| **Latency** | p95 < 200ms | 95th percentile response time |
| **Error Rate** | < 0.1% | % of failed requests |
| **Throughput** | 1000 req/s | Requests handled per second |

### Service Level Objectives (SLOs)

Set realistic targets:

```yaml
# SLO definitions
slos:
  - name: API Availability
    target: 99.9%
    window: 30 days
    
  - name: API Latency
    target: p95 < 200ms
    window: 7 days
    
  - name: Error Rate
    target: < 0.1%
    window: 1 day
```

**Sources:**

- [Google SRE - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [Atlassian SLO Guide](https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli)

## Tracing Guidelines

### Distributed Tracing

Use OpenTelemetry for tracing across services:

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('user-service');

async function createUser(data: UserInput) {
  const span = tracer.startSpan('createUser');
  
  try {
    span.setAttribute('user.email', data.email);
    
    // Validate
    const validationSpan = tracer.startSpan('validateUser', { parent: span });
    await validateUser(data);
    validationSpan.end();
    
    // Save
    const saveSpan = tracer.startSpan('saveUser', { parent: span });
    const user = await userRepository.save(data);
    saveSpan.end();
    
    span.setStatus({ code: SpanStatusCode.OK });
    return user;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
```

**Sources:**

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Distributed Tracing](https://www.jaegertracing.io/)

## Alerting Philosophy

### What to Alert On

✅ **DO alert on**:

- SLO violations (availability < 99.9%)
- User-facing errors (payment failures, login issues)
- Critical resource exhaustion (disk > 90%, memory > 85%)
- Security events (repeated auth failures)

❌ **DON'T alert on**:

- Individual request failures (use error budgets)
- Non-critical warnings
- Metrics that don't require action
- Events that self-heal (transient network errors)

**Sources:**

- [Google SRE - Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [My Philosophy on Alerting - Rob Ewaschuk](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/edit)

### Alert Criteria

Every alert must be:

- **Actionable**: On-call can fix it
- **Urgent**: Requires immediate attention
- **User-impacting**: Affects customers
- **Novel**: Not redundant with other alerts

**Bad Alert Example:**

```
Alert: CPU usage > 70%
Problem: Not actionable, not urgent, may not impact users
```

**Good Alert Example:**

```
Alert: API error rate > 1% for 5 minutes
Action: Check logs, rollback recent deployment
Impact: Users experiencing failed requests
```

**Sources:**

- [Alerting Best Practices - Prometheus](https://prometheus.io/docs/practices/alerting/)

## Runbooks & Incident Playbooks

### Runbook Template

Every alert should link to a runbook:

```markdown
# Runbook: High API Error Rate

## Symptoms
- API error rate > 1%
- Users reporting failed requests
- Alert: "API Error Rate High"

## Impact
- Customers cannot complete orders
- Revenue impact: High

## Diagnosis
1. Check recent deployments (last 30 min)
2. Review error logs: `kubectl logs -l app=api --tail=100`
3. Check database status: `SELECT pg_is_in_recovery()`
4. Check external dependencies (payment gateway, auth service)

## Resolution Steps
1. If recent deployment: Rollback with `npm run deploy:rollback`
2. If database issue: Check connection pool, increase connections
3. If external dependency: Enable circuit breaker, use fallback

## Prevention
- Add retry logic for transient errors
- Implement circuit breakers for external dependencies
- Increase test coverage for error scenarios

## Escalation
- Slack: #engineering-alerts
- On-call: PagerDuty
- Leadership: If impact > 10 minutes
```

**Sources:**

- [PagerDuty Runbook Template](https://response.pagerduty.com/oncall/runbooks/)

## Post-Mortem Process (Blameless)

### When to Write a Post-Mortem

Write post-mortems for:
- User-impacting outages
- Data loss or corruption
- Security incidents
- Near-misses with valuable lessons

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date**: 2024-01-28  
**Duration**: 45 minutes  
**Impact**: 15% of users unable to log in  
**Severity**: SEV-2

## Summary
Brief description of what happened and impact.

## Timeline (UTC)
- 10:00 - Deployment started
- 10:15 - Error rate increased to 5%
- 10:18 - Alert triggered
- 10:20 - On-call engineer acknowledged
- 10:25 - Root cause identified (bad database migration)
- 10:30 - Rollback initiated
- 10:45 - Service fully restored

## Root Cause
Database migration introduced schema change incompatible with application code.

## Impact
- 15% of users (5,000) unable to log in
- Revenue loss: ~$1,000 (estimated)

## What Went Well
- Alert triggered quickly (3 minutes)
- Rollback process worked smoothly
- Communication was clear and timely

## What Went Wrong
- Migration not tested in staging
- No backward compatibility check
- Deployment happened during peak hours

## Action Items
- [ ] Add migration testing to CI pipeline (Owner: @alice, Due: Feb 5)
- [ ] Implement schema compatibility checks (Owner: @bob, Due: Feb 10)
- [ ] Update deployment schedule to off-peak hours (Owner: @charlie, Due: Feb 1)

## Lessons Learned
Always test migrations in staging with production-like data before deploying.
```

**Sources:**

- [Google SRE - Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- [Atlassian Incident Postmortems](https://www.atlassian.com/incident-management/postmortem)

## On-Call Expectations

### Responsibilities

- **Respond**: Acknowledge alerts within 5 minutes
- **Diagnose**: Identify root cause within 15 minutes
- **Resolve**: Fix or escalate within 30 minutes
- **Document**: Update runbook after incident
- **Communicate**: Keep stakeholders informed

### Healthy On-Call Practices

✅ **DO**:

- Rotate on-call weekly
- Compensate with time off or pay
- Provide laptops and VPN access
- Write runbooks for common issues
- Automate common fixes

❌ **DON'T**:

- Page for non-urgent issues
- Expect instant response outside business hours
- Leave on-call without proper handoff
- Ignore feedback about alert fatigue

**Sources:**

- [Google SRE - On-Call](https://sre.google/sre-book/being-on-call/)
- [PagerDuty On-Call Guide](https://www.pagerduty.com/resources/learn/what-is-on-call/)

## Sources

- [Site Reliability Engineering - Google](https://sre.google/books/)
- [The Observability Engineering Book - Honeycomb](https://www.honeycomb.io/observability-engineering-oreilly-book-2022)
- [Effective Monitoring and Alerting - Slawek Ligus](https://www.oreilly.com/library/view/effective-monitoring-and/9781449333515/)
