---
sidebar_position: 1
---

# Example 1: REST API with Database

## Application Profile

- **Technology Stack**: Node.js/Express API
- **Dependencies**: PostgreSQL database, Redis cache
- **Typical Startup Time**: 5-10 seconds
- **Average Request Latency**: 50ms
- **Traffic Pattern**: HTTP requests, external client traffic

## Scenario Description

This is a typical microservice API that:

- Serves HTTP requests from external clients
- Requires database connectivity to function
- Uses Redis for caching to improve performance
- Needs to participate in load balancing
- Should be removed from service during maintenance or dependency outages

## Recommended Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      containers:
        - name: api
          image: my-api:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          # Liveness: Simple check that app is responsive
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
            timeoutSeconds: 5
            failureThreshold: 3
          # Readiness: Check database and cache connectivity
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
```

## Health Endpoint Implementation

### Complete Application Code

```javascript
const express = require("express");
const { Pool } = require("pg");
const redis = require("redis");

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

// Liveness: Just check if server responds
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Readiness: Check critical dependencies
app.get("/ready", async (req, res) => {
  try {
    // Check database
    await pool.query("SELECT 1");

    // Check Redis
    await redisClient.ping();

    res.status(200).send("READY");
  } catch (error) {
    console.error("Readiness check failed:", error);
    res.status(503).send("NOT READY");
  }
});

app.listen(8080);
```

## Configuration Rationale

### Liveness Probe

- **Path**: `/healthz` - Simple endpoint that only checks if Express is running
- **Initial Delay**: 15 seconds - Allows Express to start and bind to port
- **Period**: 20 seconds - Conservative interval to avoid false positives under load
- **Failure Threshold**: 3 - Allows for transient issues before restarting

**Why**: Liveness only checks if the application process is alive. Database issues don't mean the app is deadlocked.

### Readiness Probe

- **Path**: `/ready` - Checks database and Redis connectivity
- **Initial Delay**: 10 seconds - Shorter than liveness since dependencies should be up
- **Period**: 10 seconds - More frequent to quickly detect dependency failures
- **Failure Threshold**: 3 - Removes from service after 30 seconds of dependency issues

**Why**: Readiness determines if the pod can serve traffic. If database is down, pod should be removed from load balancer.

## Key Learnings

### 1. Separation of Concerns

The liveness check (`/healthz`) is intentionally simple and doesn't check dependencies. This prevents cascading failures:

- If the database goes down for maintenance, liveness passes
- Readiness fails, removing the pod from the load balancer
- The pod stays alive and will automatically rejoin when the database recovers

### 2. Lightweight Checks

Both health endpoints execute quickly:

- Liveness: Immediate response
- Readiness: `SELECT 1` is a minimal database query
- Redis ping is extremely fast

This prevents probe timeouts under normal load.

### 3. Resource Boundaries

Resource requests and limits are defined to ensure:

- Probe failures aren't caused by CPU throttling
- Memory pressure doesn't cause false liveness failures
- Kubernetes can schedule pods appropriately

## Common Variations

### Add Authentication Service Check

If your API depends on an authentication service:

```javascript
app.get("/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    await redisClient.ping();

    // Check auth service
    const authResponse = await fetch(`${process.env.AUTH_URL}/health`);
    if (!authResponse.ok) throw new Error("Auth service unavailable");

    res.status(200).send("READY");
  } catch (error) {
    console.error("Readiness check failed:", error);
    res.status(503).send("NOT READY");
  }
});
```

### Graceful Shutdown

Handle SIGTERM to fail readiness during shutdown:

```javascript
let isShuttingDown = false;

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, starting graceful shutdown");
  isShuttingDown = true;

  // Give time for load balancer to remove pod
  setTimeout(() => {
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  }, 5000);
});

app.get("/ready", async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).send("SHUTTING DOWN");
  }
  // ... rest of checks
});
```

## Testing

### Local Testing

```bash
# Start the application
npm start

# Test liveness endpoint
curl http://localhost:8080/healthz

# Test readiness endpoint
curl http://localhost:8080/ready

# Test with dependencies down
docker-compose stop postgres redis
curl http://localhost:8080/ready  # Should return 503
```

### Kubernetes Testing

```bash
# Deploy the application
kubectl apply -f deployment.yaml

# Watch pod status
kubectl get pods -w

# Check probe status
kubectl describe pod <pod-name> | grep -A 10 "Liveness\|Readiness"

# View probe-related events
kubectl get events --field-selector involvedObject.name=<pod-name>
```

## Troubleshooting

### Pod Keeps Restarting

**Symptom**: High restart count on pods

**Likely Causes**:

1. Liveness probe timing too aggressive for actual startup time
2. Application crashes during initialization
3. Resource constraints causing OOM

**Solutions**:

- Increase `initialDelaySeconds` temporarily to observe behavior
- Check logs: `kubectl logs <pod-name> --previous`
- Review resource usage: `kubectl top pod <pod-name>`

### Pods Not Receiving Traffic

**Symptom**: Pods are running but not in service endpoints

**Likely Causes**:

1. Readiness probe failing (dependencies unavailable)
2. Readiness probe timing too strict
3. Database connection pool exhausted

**Solutions**:

- Check readiness status: `kubectl describe pod <pod-name>`
- Test readiness endpoint manually: `kubectl exec <pod-name> -- curl localhost:8080/ready`
- Review application logs for dependency errors

## Sources

- [Google Cloud - Health Checks Best Practices](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes)
- [Datree - Kubernetes Best Practices](https://www.datree.io/resources/kubernetes-readiness-and-liveness-probes-best-practices)
