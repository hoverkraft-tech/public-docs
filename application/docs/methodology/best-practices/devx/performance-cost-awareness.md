---
sidebar_position: 12
---

# Performance & Cost Awareness

> _Fast is good. Efficient is better._

## Purpose

Avoid invisible technical debt. Poor performance and runaway costs compound over time.

## Performance Budgets

### Define Budgets Upfront

Set measurable performance targets:

| Metric                  | Target          | Measurement             |
| ----------------------- | --------------- | ----------------------- |
| **Page Load (p95)**     | < 2s            | Lighthouse, WebPageTest |
| **Time to Interactive** | < 3s            | Lighthouse              |
| **API Response (p95)**  | < 200ms         | Application metrics     |
| **Database Queries**    | < 50ms          | Query monitoring        |
| **Bundle Size**         | < 200KB gzipped | Webpack Bundle Analyzer |

✅ **DO**:

- Measure against budgets in CI
- Fail builds that exceed budgets
- Track budgets in monitoring dashboards
- Review budgets quarterly

❌ **DON'T**:

- Set budgets and ignore them
- Optimize prematurely without data
- Sacrifice correctness for performance
- Ignore mobile/slow network performance

**Sources:**

- [Web Performance Budget - Addy Osmani](https://addyosmani.com/blog/performance-budgets/)
- [Performance Budget Calculator](https://www.performancebudget.io/)

### CI Performance Checks

```yaml
# .github/workflows/performance.yml
name: Performance
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://staging.example.com/
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

**Budget File:**

```json
{
  "path": "/*",
  "timings": [
    {
      "metric": "interactive",
      "budget": 3000
    },
    {
      "metric": "first-contentful-paint",
      "budget": 1000
    }
  ],
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 200
    }
  ]
}
```

**Sources:**

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Profiling & Optimization Guides

### Backend Profiling (Node.js)

**CPU Profiling:**

```bash
# Start with profiling enabled
node --prof app.js

# Generate readable output
node --prof-process isolate-0x*.log > processed.txt
```

**Memory Profiling:**

```typescript
// Take heap snapshot
import v8 from "v8";
import fs from "fs";

function takeHeapSnapshot() {
  const filename = `heap-${Date.now()}.heapsnapshot`;
  const snapshot = v8.writeHeapSnapshot(filename);
  console.log(`Heap snapshot written to ${snapshot}`);
}

// Call when memory is high
```

**Sources:**

- [Node.js Profiling Guide](https://nodejs.org/en/docs/guides/simple-profiling)
- [Clinic.js - Node.js Performance Tool](https://clinicjs.org/)

### Frontend Profiling

**React DevTools Profiler:**

```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="UserList" onRender={onRenderCallback}>
  <UserList />
</Profiler>
```

**Chrome DevTools:**

1. Open DevTools → Performance tab
2. Record interaction
3. Analyze flame graph for bottlenecks

**Sources:**

- [React Profiler API](https://react.dev/reference/react/Profiler)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

### Database Query Optimization

**Identify Slow Queries:**

```sql
-- PostgreSQL slow query log
ALTER DATABASE myapp SET log_min_duration_statement = 100; -- ms

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Common Optimizations:**

✅ **DO**:

- Add indices for frequently queried columns
- Use `EXPLAIN ANALYZE` to understand query plans
- Paginate large result sets
- Use connection pooling
- Cache expensive queries

❌ **DON'T**:

- Use `SELECT *` (select only needed columns)
- Query in loops (N+1 problem)
- Index every column (indices have write cost)

**Example N+1 Fix:**

```typescript
// ❌ Bad - N+1 queries
const users = await User.findAll();
for (const user of users) {
  const orders = await Order.findByUserId(user.id);
  user.orders = orders;
}

// ✅ Good - Single query with join
const users = await User.findAll({
  include: [Order],
});
```

**Sources:**

- [Use The Index, Luke - SQL Indexing](https://use-the-index-luke.com/)
- [PostgreSQL Performance Optimization](https://wiki.postgresql.org/wiki/Performance_Optimization)

## Cost Visibility & Responsibility Model

### Tag Resources by Team/Project

```typescript
// Terraform example
resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"

  tags = {
    Team        = "backend"
    Project     = "api-gateway"
    Environment = "production"
    CostCenter  = "engineering"
  }
}
```

### Cost Allocation Dashboard

Track costs by:

- **Team**: Which team owns the resource?
- **Project**: Which project is it for?
- **Environment**: dev, staging, production

**Example Dashboard Queries:**

```sql
-- Monthly cost by team
SELECT
  tag_team,
  SUM(cost) as total_cost
FROM aws_costs
WHERE month = '2024-01'
GROUP BY tag_team
ORDER BY total_cost DESC;
```

**Sources:**

- [AWS Cost Allocation Tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)
- [FinOps Foundation](https://www.finops.org/)

### Cost Anomaly Alerts

Set up alerts for unusual spending:

```yaml
# Alert if daily cost increases > 20%
alert: HighCostIncrease
expr: (daily_cost - daily_cost offset 1d) / daily_cost offset 1d > 0.2
for: 1h
annotations:
  summary: "AWS costs increased by {{ $value }}%"
```

**Sources:**

- [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/)

## Infrastructure Cost Best Practices

### Right-Size Resources

✅ **DO**:

- Use auto-scaling instead of over-provisioning
- Choose appropriate instance types
- Use spot instances for non-critical workloads
- Enable cost optimization recommendations

❌ **DON'T**:

- Run large instances 24/7 for dev environments
- Keep unused resources running
- Ignore right-sizing recommendations

**Cost Optimization Checklist:**

- [ ] Delete unused resources (old snapshots, volumes)
- [ ] Stop dev/staging environments outside business hours
- [ ] Use reserved instances for predictable workloads
- [ ] Enable S3 lifecycle policies for old data
- [ ] Review and remove unused security groups/load balancers

**Sources:**

- [AWS Cost Optimization Best Practices](https://aws.amazon.com/pricing/cost-optimization/)

### Caching Strategies

Reduce compute costs with caching:

**Cache Layers:**

```
┌─────────────┐
│   Browser   │ ← Cache-Control headers
└─────────────┘
       ↓
┌─────────────┐
│     CDN     │ ← Static assets
└─────────────┘
       ↓
┌─────────────┐
│ Application │ ← Redis/Memcached
└─────────────┘
       ↓
┌─────────────┐
│  Database   │ ← Query results
└─────────────┘
```

**Example (Redis Caching):**

```typescript
async function getUser(id: string): Promise<User> {
  const cacheKey = `user:${id}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const user = await db.users.findById(id);

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}
```

**Sources:**

- [Caching Best Practices - AWS](https://aws.amazon.com/caching/best-practices/)

## Scaling Strategies

### Horizontal vs. Vertical Scaling

| Strategy       | When to Use                       | Pros                              | Cons                                         |
| -------------- | --------------------------------- | --------------------------------- | -------------------------------------------- |
| **Horizontal** | Stateless apps, high availability | Better redundancy, easier scaling | More complex, eventual consistency           |
| **Vertical**   | Stateful apps, databases          | Simple, strong consistency        | Limited by hardware, single point of failure |

**Horizontal Scaling Example:**

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

**Sources:**

- [Google SRE - Capacity Planning](https://sre.google/sre-book/capacity-planning/)

### Load Testing

Validate scaling before production traffic:

```javascript
// k6 load test
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp up
    { duration: "5m", target: 100 }, // Steady state
    { duration: "2m", target: 200 }, // Spike
    { duration: "5m", target: 200 }, // High load
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // 95% under 200ms
    http_req_failed: ["rate<0.01"], // < 1% errors
  },
};

export default function () {
  const res = http.get("https://api.example.com/users");

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time OK": (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

**Sources:**

- [k6 Load Testing](https://k6.io/docs/)
- [Gatling Load Testing](https://gatling.io/)

### Database Scaling

**Read Replicas:**

```typescript
// Configure read replicas
const db = {
  write: createConnection("postgres://primary"),
  read: createConnection("postgres://replica"),
};

// Use replica for reads
async function getUsers() {
  return db.read.query("SELECT * FROM users");
}

// Use primary for writes
async function createUser(data: User) {
  return db.write.query("INSERT INTO users ...", data);
}
```

**Sharding (when needed):**

```typescript
// Shard by user ID
function getShard(userId: string): Database {
  const shardNumber = hashUserId(userId) % NUM_SHARDS;
  return shards[shardNumber];
}

async function getUser(userId: string) {
  const shard = getShard(userId);
  return shard.query("SELECT * FROM users WHERE id = $1", [userId]);
}
```

**Sources:**

- [Database Scaling Strategies](https://aws.amazon.com/blogs/database/scaling-your-amazon-rds-instance-vertically-and-horizontally/)

## Cost-Performance Trade-offs

### Example Decisions

| Scenario     | Cheap           | Balanced               | Performance     |
| ------------ | --------------- | ---------------------- | --------------- |
| **Database** | Single instance | Primary + replica      | Sharded cluster |
| **Caching**  | None            | Redis single node      | Redis cluster   |
| **Compute**  | t3.micro        | t3.medium              | c6i.xlarge      |
| **Storage**  | S3 Standard     | S3 Intelligent-Tiering | S3 + CloudFront |

**Decision Framework:**

1. **Start simple**: Use balanced option
2. **Measure**: Track performance and costs
3. **Optimize**: Upgrade only when needed
4. **Iterate**: Continuously evaluate trade-offs

**Sources:**

- [AWS Cost Optimization - Right Sizing](https://aws.amazon.com/aws-cost-management/aws-cost-optimization/)

## Sources

- [High Performance Browser Networking - Ilya Grigorik](https://hpbn.co/)
- [Web Performance in Action - Jeremy Wagner](https://www.manning.com/books/web-performance-in-action)
- [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
- [FinOps Foundation](https://www.finops.org/)
