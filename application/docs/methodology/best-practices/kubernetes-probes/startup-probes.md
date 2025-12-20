---
sidebar_position: 5
---

# Startup Probe Best Practices

## Purpose

Startup probes provide extra time for slow-starting containers to initialize before liveness and readiness probes begin. This prevents Kubernetes from killing containers that take a long time to start.

## When to Use

✅ **DO use startup probes when**:

- Application initialization takes more than 30 seconds
- Application performs data migration or schema updates on startup
- Application loads large datasets into memory on start
- Application has unpredictable startup times
- You want to avoid setting high `initialDelaySeconds` on liveness probes

❌ **DON'T use startup probes when**:

- Application starts quickly (< 10 seconds)
- You can achieve the same with reasonable `initialDelaySeconds` on liveness probe
- The overhead of an additional probe type adds unnecessary complexity

## Configuration Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: slow-starter
spec:
  containers:
    - name: app
      image: my-app:1.0.0
      startupProbe:
        httpGet:
          path: /healthz
          port: 8080
        failureThreshold: 30 # 30 failures * 10 seconds = 5 minutes max startup time
        periodSeconds: 10
        timeoutSeconds: 5
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
        periodSeconds: 20
        timeoutSeconds: 5
        failureThreshold: 3
      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        periodSeconds: 10
        timeoutSeconds: 5
        failureThreshold: 3
```

## Implementation Pattern

Startup probes typically use the same endpoint as liveness probes. The key is configuring the timing parameters to allow for extended initialization:

### Node.js (with initialization tracking)

```javascript
const express = require("express");
const app = express();

let isInitialized = false;

async function initializeApp() {
  // Perform expensive initialization
  await loadConfiguration();
  await connectToDatabase();
  await warmUpCaches();
  isInitialized = true;
}

app.get("/healthz", (req, res) => {
  if (!isInitialized) {
    // During startup, health check fails until initialization completes
    return res.status(503).send("Initializing");
  }
  res.status(200).send("OK");
});

app.listen(8080, () => {
  initializeApp().catch((err) => {
    console.error("Initialization failed:", err);
    process.exit(1);
  });
});
```

## Key Considerations

### Timing Calculations

Calculate your `failureThreshold` based on maximum expected startup time:

```
Max Startup Time = failureThreshold × periodSeconds
```

Example: For a 5-minute maximum startup:

```yaml
failureThreshold: 30 # 30 checks
periodSeconds: 10 # Every 10 seconds
# = 300 seconds (5 minutes) maximum
```

### Interaction with Other Probes

- While startup probe is running, liveness and readiness probes are **disabled**
- Once startup probe succeeds, it's disabled and liveness/readiness probes begin
- If startup probe fails after all retries, the container is restarted

## Sources

- [Kubernetes Official Documentation - Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes)
- [Hostman - Kubernetes Probes Explained](https://hostman.com/tutorials/liveness-readiness-and-startup-probes-in-kubernetes/)
