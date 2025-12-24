---
sidebar_position: 7
---

# Common Pitfalls and How to Avoid Them

## 1. Using the Same Endpoint for Liveness and Readiness

### Problem

When liveness and readiness share logic, a temporary dependency outage (like database maintenance) can cause Kubernetes to restart healthy pods, making the outage worse.

### Solution

Separate the concerns. Liveness checks internal health; readiness checks external dependencies.

```yaml
# BAD: Same endpoint
livenessProbe:
  httpGet:
    path: /health # Checks database too
readinessProbe:
  httpGet:
    path: /health # Same as liveness

# GOOD: Separate endpoints
livenessProbe:
  httpGet:
    path: /healthz # Only checks if app is alive
readinessProbe:
  httpGet:
    path: /ready # Checks dependencies
```

## 2. Overly Aggressive Probe Timing

### Problem

Too frequent probes with low failure thresholds cause unnecessary restarts during normal load spikes or brief network hiccups.

### Solution

Use conservative timing and higher failure thresholds, especially in production.

```yaml
# BAD: Too aggressive
livenessProbe:
  periodSeconds: 5
  timeoutSeconds: 1
  failureThreshold: 1 # Restarts after single failure

# GOOD: Conservative
livenessProbe:
  periodSeconds: 20
  timeoutSeconds: 5
  failureThreshold: 3 # Allows for transient failures
```

## 3. Missing Resource Requests/Limits

### Problem

Without resource constraints, probes may fail due to CPU throttling or OOM conditions, not actual application failures.

### Solution

Always define resource requests and limits, then adjust probe timing accordingly to account for resource constraints.

```yaml
containers:
  - name: app
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      # Adjust timing based on resources
      # With limited CPU, allow more time for health checks
      timeoutSeconds: 5
      periodSeconds: 20
      failureThreshold: 3
```

**Key considerations:**

- CPU limits can cause throttling - increase `timeoutSeconds` and `periodSeconds` if experiencing throttling
- Memory pressure near limits may slow response times - adjust `timeoutSeconds` accordingly
- Monitor actual resource usage and probe success rates to fine-tune both resources and probe configuration

## 4. Not Monitoring Probe Failures

### Problem

Teams configure probes but don't monitor their effectiveness, missing opportunities to tune or identify real issues.

### Solution

Set up alerts for high restart counts and probe failure rates.

```yaml
# Example Prometheus alert
- alert: HighPodRestartRate
  expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
  annotations:
    summary: "Pod {{ $labels.pod }} is restarting frequently"
```

## 5. Expensive Health Check Operations

### Problem

Health checks that perform heavy operations (full database scans, external API calls) can timeout or add significant load.

### Solution

Keep health checks lightweight. Use connection pool pings, not full queries.

```python
# BAD: Expensive check
@app.route('/ready')
def readiness():
    result = db.execute("SELECT COUNT(*) FROM large_table")  # Expensive!
    return "READY", 200

# GOOD: Lightweight check
@app.route('/ready')
def readiness():
    db.execute("SELECT 1")  # Just test connectivity
    return "READY", 200
```

## 6. Checking Downstream Service Health in Liveness

### Problem

Making liveness probes depend on downstream services causes cascading failures.

### Solution

Only check the application's own health in liveness probes. Check dependencies in readiness probes only.

```javascript
// BAD: Liveness checks database
app.get("/healthz", async (req, res) => {
  await db.ping(); // Don't do this!
  res.send("OK");
});

// GOOD: Liveness checks only app health
app.get("/healthz", (req, res) => {
  res.send("OK"); // Simple response check
});
```

## 7. Ignoring Graceful Shutdown

### Problem

Applications don't signal unreadiness during shutdown, causing failed requests during pod termination.

### Solution

Implement graceful shutdown that fails readiness probes.

```javascript
let isShuttingDown = false;

process.on("SIGTERM", () => {
  isShuttingDown = true; // Fail readiness checks
  // Then gracefully shutdown
  server.close(() => {
    process.exit(0);
  });
});

app.get("/ready", (req, res) => {
  if (isShuttingDown) {
    return res.status(503).send("Shutting down");
  }
  res.send("READY");
});
```

## Sources

- [Kubernetes Blog - 7 Common Pitfalls](https://kubernetes.io/blog/2025/10/20/seven-kubernetes-pitfalls-and-how-to-avoid/)
- [Spacelift - 15 Common Kubernetes Pitfalls](https://spacelift.io/blog/kubernetes-challenges)
- [InfoQ - Kubernetes Production Checklist](https://www.infoq.com/articles/checklist-kubernetes-production/)
