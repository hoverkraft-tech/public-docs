---
sidebar_position: 5
---

# Kubernetes Probes Best Practices

This guide provides Hoverkraft's opinionated approach to configuring Kubernetes liveness, readiness, and startup probes for production workloads.

## What Are Kubernetes Probes?

Kubernetes probes are health check mechanisms that allow the orchestrator to monitor the state of containers and make intelligent decisions about pod lifecycle management. There are three types of probes:

- **Liveness Probe**: Determines if a container is running. If the liveness probe fails, Kubernetes restarts the container.
- **Readiness Probe**: Determines if a container is ready to accept traffic. If the readiness probe fails, Kubernetes removes the pod from service endpoints.
- **Startup Probe**: Determines if a container application has started. When configured, it disables liveness and readiness checks until it succeeds, protecting slow-starting containers from premature termination.

**Sources:**

- [Kubernetes Official Documentation - Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Blog - 7 Common Kubernetes Pitfalls](https://kubernetes.io/blog/2025/10/20/seven-kubernetes-pitfalls-and-how-to-avoid/)

## Why Properly Configured Probes Matter

Misconfigured or missing probes are among the most common causes of production instability in Kubernetes environments. They can lead to:

- **Cascading failures**: Overly aggressive liveness probes restart healthy pods under load, causing more load on remaining pods
- **Service degradation**: Missing or incorrect readiness probes route traffic to unready pods, causing failed requests
- **Delayed incident response**: Inadequate health checks mask underlying issues, making troubleshooting difficult
- **Resource waste**: Improper startup probe configuration causes pods to restart during initialization, wasting compute resources

Well-configured probes enable:

- **Self-healing systems**: Automatic recovery from deadlocks, memory leaks, and application crashes
- **Zero-downtime deployments**: Traffic is only routed to ready pods during rolling updates
- **Improved observability**: Probe metrics provide clear signals about application health

**Sources:**

- [Google Cloud - Kubernetes Best Practices: Setting Up Health Checks](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes)
- [InfoQ - Checklist for Kubernetes in Production: Best Practices for SREs](https://www.infoq.com/articles/checklist-kubernetes-production/)
- [CICube - Kubernetes Probes Complete Guide](https://cicube.io/blog/kubernetes-probes/)

## Hoverkraft Opinionated Approach

At Hoverkraft, we follow these core principles for probe configuration:

1. **Application-Specific Tuning**: Never use generic probe configurations. Each application has unique startup times, performance characteristics, and dependency patterns.

2. **Separate Concerns**: Use different endpoints and logic for liveness vs. readiness checks. Liveness should verify the container process is alive; readiness should verify the application can serve traffic.

3. **Conservative Defaults**: Start with generous timeouts and intervals, then tighten based on observed metrics. Premature restarts are worse than delayed detection.

4. **Dependency Awareness**: Readiness probes should check critical dependencies; liveness probes should NOT (to avoid cascading failures when external services are down).

5. **Monitoring and Iteration**: Treat probe configuration as living infrastructure. Monitor probe success rates, restart counts, and adjust based on production behavior.

6. **GitOps Enforcement**: All probe configurations must be version-controlled, reviewed via pull requests, and tested in non-production environments before production deployment.

**Sources:**

- [Datree - Best Practices for Kubernetes Readiness and Liveness Probes](https://www.datree.io/resources/kubernetes-readiness-and-liveness-probes-best-practices)
- [InfoQ - Checklist for Kubernetes in Production](https://www.infoq.com/articles/checklist-kubernetes-production/)

## Probe Configuration Parameters

All probe types support these configuration parameters:

| Parameter             | Description                                        | Default | Recommendation                                                         |
| --------------------- | -------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `initialDelaySeconds` | Wait time before first probe after container start | 0       | Set based on typical startup time; use startup probe for slow starters |
| `periodSeconds`       | How often to perform the probe                     | 10      | 10-30s for most apps; 5-10s for critical services                      |
| `timeoutSeconds`      | Probe timeout before considering it failed         | 1       | 2-5s minimum; increase for high-latency environments                   |
| `successThreshold`    | Minimum consecutive successes to mark as healthy   | 1       | Keep at 1 for liveness; 1-3 for readiness                              |
| `failureThreshold`    | Consecutive failures before marking as unhealthy   | 3       | 3-5 for most apps; higher for flaky health checks                      |

**Source:**

- [Kubernetes Official Documentation - Configure Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

## Probe Types and Mechanisms

Kubernetes supports three probe mechanisms:

### HTTP GET Probe

Performs an HTTP GET request against a container port and path. Status codes 200-399 indicate success.

```yaml
httpGet:
  path: /health
  port: 8080
  httpHeaders:
    - name: Custom-Header
      value: Awesome
```

**Best for**: Web applications, REST APIs, services with HTTP endpoints

### TCP Socket Probe

Attempts to open a TCP connection to the container on a specified port. Success means the port is open.

```yaml
tcpSocket:
  port: 8080
```

**Best for**: Databases, caches, gRPC services without HTTP health endpoints

### Exec Probe

Executes a command inside the container. Exit code 0 indicates success.

```yaml
exec:
  command:
    - cat
    - /tmp/healthy
```

**Best for**: Legacy applications, custom health logic, file-based health indicators

**Source:**

- [Kubernetes Official Documentation - Probe Handlers](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-http-request)

## Liveness Probe Best Practices

### Purpose

Liveness probes detect when a container is in an unrecoverable state (deadlocked, out of memory, crashed) and needs to be restarted.

### What to Check

✅ **DO**:

- Check if the application process is running and responsive
- Verify core application logic can execute (e.g., HTTP server can handle requests)
- Keep the check lightweight and fast (< 1 second execution time)
- Return success even if downstream dependencies are unavailable
- Use a dedicated health endpoint that doesn't require authentication

❌ **DON'T**:

- Check database connectivity or external service availability (this belongs in readiness)
- Perform expensive operations like database queries or complex computations
- Make the liveness check depend on the readiness of other pods
- Use liveness probes during slow initialization (use startup probes instead)
- Check conditions that might fail temporarily under heavy load

### Configuration Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: app
      image: my-app:1.0.0
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
        initialDelaySeconds: 15
        periodSeconds: 20
        timeoutSeconds: 5
        failureThreshold: 3
```

### Implementation Examples

**Node.js (Express)**:

```javascript
const express = require("express");
const app = express();

app.get("/healthz", (req, res) => {
  // Simple liveness check - just verify the server is responsive
  res.status(200).send("OK");
});

app.listen(8080);
```

**Python (Flask)**:

```python
from flask import Flask
app = Flask(__name__)

@app.route('/healthz')
def liveness():
    # Simple check - server is running and can handle requests
    return "OK", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

**Go**:

```go
package main

import (
    "net/http"
)

func livenessHandler(w http.ResponseWriter, r *http.Request) {
    // Simple check - application is alive and can respond
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("OK"))
}

func main() {
    http.HandleFunc("/healthz", livenessHandler)
    http.ListenAndServe(":8080", nil)
}
```

**Sources:**

- [IBM Developer - Health Checks for Node.js Applications](https://developer.ibm.com/tutorials/health-checking-kubernetes-nodejs-application)
- [Baeldung - Understanding Liveness and Readiness Probes](https://www.baeldung.com/ops/kubernetes-livenessprobe-readinessprobe)
- [GitHub - Kubernetes Probes Demo Examples](https://github.com/artisantek/kubernetes-probes-demo)

## Readiness Probe Best Practices

### Purpose

Readiness probes determine when a container is ready to accept traffic. Kubernetes removes unready pods from service endpoints, preventing failed requests during startup, shutdown, or temporary unavailability.

### What to Check

✅ **DO**:

- Verify all critical dependencies are available (database, cache, message queue)
- Check that configuration is loaded and validated
- Ensure required data or state is initialized
- Verify sufficient resources are available (database connections, file descriptors)
- Return failure (503) during graceful shutdown to drain connections
- Keep checks reasonably fast (< 5 seconds)

❌ **DON'T**:

- Check non-critical or optional dependencies
- Make the check so strict that minor issues cause service disruption
- Use the same endpoint/logic as liveness probe
- Include expensive operations that could timeout under load
- Check conditions that might create circular dependencies between services

### Configuration Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: app
      image: my-app:1.0.0
      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 10
        timeoutSeconds: 5
        failureThreshold: 3
        successThreshold: 1
```

### Implementation Examples

**Node.js (Express with Database)**:

```javascript
const express = require("express");
const app = express();
const db = require("./database");

app.get("/ready", async (req, res) => {
  try {
    // Check database connectivity
    await db.ping();

    // Check if configuration is loaded
    if (!process.env.REQUIRED_CONFIG) {
      return res.status(503).send("Configuration not loaded");
    }

    res.status(200).send("READY");
  } catch (error) {
    res.status(503).send("NOT READY");
  }
});

app.listen(8080);
```

**Python (Flask with Redis)**:

```python
from flask import Flask
import redis
import os

app = Flask(__name__)
redis_client = redis.Redis(host=os.getenv('REDIS_HOST', 'localhost'))

@app.route('/ready')
def readiness():
    try:
        # Check Redis connectivity
        redis_client.ping()

        # Check critical configuration
        if not os.getenv('API_KEY'):
            return "Missing configuration", 503

        return "READY", 200
    except Exception as e:
        return f"NOT READY: {str(e)}", 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

**Go (with Database)**:

```go
package main

import (
    "database/sql"
    "net/http"
    "os"
    _ "github.com/lib/pq"
)

var db *sql.DB

func readinessHandler(w http.ResponseWriter, r *http.Request) {
    // Check database connectivity
    if err := db.Ping(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        w.Write([]byte("Database unavailable"))
        return
    }

    // Check configuration
    if os.Getenv("REQUIRED_CONFIG") == "" {
        w.WriteHeader(http.StatusServiceUnavailable)
        w.Write([]byte("Configuration missing"))
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("READY"))
}

func main() {
    db, _ = sql.Open("postgres", os.Getenv("DATABASE_URL"))
    http.HandleFunc("/ready", readinessHandler)
    http.ListenAndServe(":8080", nil)
}
```

**Sources:**

- [Sling Academy - Kubernetes Health Checks Configuration](https://www.slingacademy.com/article/kubernetes-configuring-health-checks-in-pods/)
- [Kube by Example - Health Checks](https://kubebyexample.com/concept/health-checks)
- [CICube - Kubernetes Probes Complete Guide](https://cicube.io/blog/kubernetes-probes/)

## Startup Probe Best Practices

### Purpose

Startup probes provide extra time for slow-starting containers to initialize before liveness and readiness probes begin. This prevents Kubernetes from killing containers that take a long time to start.

### When to Use

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

### Configuration Example

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

### Implementation Pattern

Startup probes typically use the same endpoint as liveness probes. The key is configuring the timing parameters to allow for extended initialization:

**Node.js (with initialization tracking)**:

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

**Sources:**

- [Kubernetes Official Documentation - Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes)
- [Hostman - Kubernetes Probes Explained](https://hostman.com/tutorials/liveness-readiness-and-startup-probes-in-kubernetes/)

## Real-World Application Examples

### Example 1: REST API with Database

**Application Profile**:

- Node.js/Express API
- PostgreSQL database dependency
- Redis cache dependency
- Typical startup: 5-10 seconds
- Average request latency: 50ms

**Recommended Configuration**:

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

**Health Endpoint Implementation**:

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

### Example 2: Background Job Processor

**Application Profile**:

- Python worker processing messages from RabbitMQ
- No HTTP traffic (not a web service)
- Startup time: 2-3 seconds
- Processes jobs continuously

**Recommended Configuration**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: job-processor
spec:
  replicas: 2
  selector:
    matchLabels:
      app: job-processor
  template:
    metadata:
      labels:
        app: job-processor
    spec:
      containers:
        - name: worker
          image: my-worker:1.0.0
          ports:
            - containerPort: 8080 # Health check server
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          # Liveness: Check if worker is processing
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          # Readiness: Check RabbitMQ connectivity
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 15
            timeoutSeconds: 5
            failureThreshold: 3
```

**Health Server Implementation**:

```python
from flask import Flask
import pika
import os
import threading
import time

app = Flask(__name__)

# Worker state tracking
last_processed_time = time.time()
rabbitmq_connected = False

def message_worker():
    """Background worker that processes messages"""
    global last_processed_time, rabbitmq_connected

    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(os.getenv('RABBITMQ_HOST'))
        )
        channel = connection.channel()
        rabbitmq_connected = True

        def callback(ch, method, properties, body):
            global last_processed_time
            # Process message
            process_job(body)
            last_processed_time = time.time()
            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_consume(queue='jobs', on_message_callback=callback)
        channel.start_consuming()
    except Exception as e:
        rabbitmq_connected = False
        print(f"Worker error: {e}")

@app.route('/healthz')
def liveness():
    # Check if worker has processed messages recently (not stuck)
    if time.time() - last_processed_time > 300:  # 5 minutes
        return "Worker appears stuck", 503
    return "OK", 200

@app.route('/ready')
def readiness():
    # Check RabbitMQ connectivity
    if not rabbitmq_connected:
        return "RabbitMQ not connected", 503
    return "READY", 200

if __name__ == '__main__':
    # Start worker in background thread
    worker_thread = threading.Thread(target=message_worker, daemon=True)
    worker_thread.start()

    # Start health check server
    app.run(host='0.0.0.0', port=8080)
```

### Example 3: Data-Intensive Application with Slow Startup

**Application Profile**:

- Java Spring Boot application
- Loads large dataset into memory on startup
- Connects to multiple databases
- Startup time: 2-5 minutes (variable)
- Normal operation: fast and stable

**Recommended Configuration**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: data-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: data-service
  template:
    metadata:
      labels:
        app: data-service
    spec:
      containers:
        - name: service
          image: my-data-service:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
            limits:
              memory: "4Gi"
              cpu: "2000m"
          # Startup: Allow up to 5 minutes for initialization
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            failureThreshold: 30 # 30 * 10s = 5 minutes max
            periodSeconds: 10
            timeoutSeconds: 5
          # Liveness: After startup, check every 30 seconds
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          # Readiness: Check if data is loaded and ready to serve
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
```

**Java/Spring Boot Implementation**:

```java
@RestController
public class HealthController {

    @Autowired
    private DataLoadingService dataService;

    @Autowired
    private DatabaseConnectionPool dbPool;

    @GetMapping("/healthz")
    public ResponseEntity<String> liveness() {
        // Simple check - application is running
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/ready")
    public ResponseEntity<String> readiness() {
        // Check if data is loaded
        if (!dataService.isDataLoaded()) {
            return ResponseEntity.status(503).body("Data not loaded");
        }

        // Check database connectivity
        if (!dbPool.isHealthy()) {
            return ResponseEntity.status(503).body("Database unhealthy");
        }

        return ResponseEntity.ok("READY");
    }
}
```

**Sources:**

- [Datree - Kubernetes Best Practices](https://www.datree.io/resources/kubernetes-readiness-and-liveness-probes-best-practices)
- [Google Cloud - Health Checks Best Practices](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes)

## Common Pitfalls and How to Avoid Them

### 1. Using the Same Endpoint for Liveness and Readiness

**Problem**: When liveness and readiness share logic, a temporary dependency outage (like database maintenance) can cause Kubernetes to restart healthy pods, making the outage worse.

**Solution**: Separate the concerns. Liveness checks internal health; readiness checks external dependencies.

```yaml
# BAD: Same endpoint
livenessProbe:
  httpGet:
    path: /health  # Checks database too
readinessProbe:
  httpGet:
    path: /health  # Same as liveness

# GOOD: Separate endpoints
livenessProbe:
  httpGet:
    path: /healthz  # Only checks if app is alive
readinessProbe:
  httpGet:
    path: /ready    # Checks dependencies
```

### 2. Overly Aggressive Probe Timing

**Problem**: Too frequent probes with low failure thresholds cause unnecessary restarts during normal load spikes or brief network hiccups.

**Solution**: Use conservative timing and higher failure thresholds, especially in production.

```yaml
# BAD: Too aggressive
livenessProbe:
  periodSeconds: 5
  timeoutSeconds: 1
  failureThreshold: 1  # Restarts after single failure

# GOOD: Conservative
livenessProbe:
  periodSeconds: 20
  timeoutSeconds: 5
  failureThreshold: 3  # Allows for transient failures
```

### 3. Missing Resource Requests/Limits

**Problem**: Without resource constraints, probes may fail due to CPU throttling or OOM conditions, not actual application failures.

**Solution**: Always define resource requests and limits alongside probes.

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
      # probe configuration
```

### 4. Not Monitoring Probe Failures

**Problem**: Teams configure probes but don't monitor their effectiveness, missing opportunities to tune or identify real issues.

**Solution**: Set up alerts for high restart counts and probe failure rates.

```yaml
# Example Prometheus alert
- alert: HighPodRestartRate
  expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
  annotations:
    summary: "Pod {{ $labels.pod }} is restarting frequently"
```

### 5. Expensive Health Check Operations

**Problem**: Health checks that perform heavy operations (full database scans, external API calls) can timeout or add significant load.

**Solution**: Keep health checks lightweight. Use connection pool pings, not full queries.

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

**Sources:**

- [Kubernetes Blog - 7 Common Pitfalls](https://kubernetes.io/blog/2025/10/20/seven-kubernetes-pitfalls-and-how-to-avoid/)
- [Spacelift - 15 Common Kubernetes Pitfalls](https://spacelift.io/blog/kubernetes-challenges)
- [InfoQ - Kubernetes Production Checklist](https://www.infoq.com/articles/checklist-kubernetes-production/)

## Monitoring and Observability

### Key Metrics to Track

Monitor these metrics to ensure your probes are working effectively:

1. **Pod Restart Count**: High restart counts indicate probe misconfiguration or real application issues

   ```bash
   kubectl get pods -o wide
   kubectl describe pod <pod-name>
   ```

2. **Probe Success Rate**: Track the percentage of successful probes
   - Use Prometheus metrics: `prober_probe_total`, `prober_probe_duration_seconds`

3. **Time to Ready**: How long it takes pods to become ready after deployment
   - Important for understanding deployment impact

4. **Service Endpoint Changes**: Frequent additions/removals indicate readiness probe flapping

### Debugging Failed Probes

When probes fail, use these debugging techniques:

```bash
# Check pod events
kubectl describe pod <pod-name>

# View container logs
kubectl logs <pod-name> -c <container-name>

# Execute the probe manually
kubectl exec <pod-name> -- curl http://localhost:8080/healthz

# For exec probes, run the command directly
kubectl exec <pod-name> -- /bin/sh -c "command from probe"
```

**Sources:**

- [4sysops - Kubernetes Health Checks Debugging](https://4sysops.com/archives/kubernetes-health-checks-with-liveness-readiness-and-startup-probes/)
- [LabEx - Kubernetes Health Monitoring](https://labex.io/tutorials/kubernetes-how-to-implement-kubernetes-health-monitoring-probes-392602)

## Summary Checklist

Use this checklist when configuring probes for any application:

- [ ] Resource requests and limits are defined
- [ ] Liveness probe is configured and checks only internal application health
- [ ] Readiness probe is configured and checks critical dependencies
- [ ] Startup probe is used for slow-starting applications (> 30s startup time)
- [ ] Probe endpoints are implemented separately (/healthz vs /ready)
- [ ] Timing parameters are tuned based on application characteristics
- [ ] Health checks are lightweight (< 5 seconds execution time)
- [ ] Probe failures and pod restarts are monitored
- [ ] Configuration is version-controlled and reviewed via GitOps
- [ ] Probes have been tested in non-production environments
- [ ] Documentation explains what each probe checks and why

## Additional Resources

### Official Documentation

- [Kubernetes - Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes - Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)

### Industry Best Practices

- [Google Cloud - Kubernetes Best Practices: Health Checks](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes)
- [Datree - Readiness and Liveness Probes Best Practices](https://www.datree.io/resources/kubernetes-readiness-and-liveness-probes-best-practices)
- [InfoQ - Kubernetes Production Checklist for SREs](https://www.infoq.com/articles/checklist-kubernetes-production/)

### Deep Dives

- [CICube - Complete Guide to Container Health Checks](https://cicube.io/blog/kubernetes-probes/)
- [Baeldung - Understanding Liveness and Readiness Probes](https://www.baeldung.com/ops/kubernetes-livenessprobe-readinessprobe)
- [Kube by Example - Health Checks](https://kubebyexample.com/concept/health-checks)

### Implementation Examples

- [GitHub - Kubernetes Probes Demo (Python, Go, Node.js)](https://github.com/artisantek/kubernetes-probes-demo)
- [IBM Developer - Health Checks in Node.js](https://developer.ibm.com/tutorials/health-checking-kubernetes-nodejs-application)
- [Go Healthcheck Library](https://pkg.go.dev/github.com/GlobalWebIndex/healthcheck)

---

**Last Updated**: 2025-12-20  
**Maintained By**: Hoverkraft Platform Team
