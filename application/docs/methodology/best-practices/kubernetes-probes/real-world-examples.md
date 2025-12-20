---
sidebar_position: 6
---

# Real-World Application Examples

This section provides complete, production-ready examples for different application scenarios.

## Example 1: REST API with Database

### Application Profile

- Node.js/Express API
- PostgreSQL database dependency
- Redis cache dependency
- Typical startup: 5-10 seconds
- Average request latency: 50ms

### Recommended Configuration

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

### Health Endpoint Implementation

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

## Example 2: Background Job Processor

### Application Profile

- Python worker processing messages from RabbitMQ
- No HTTP traffic (not a web service)
- Startup time: 2-3 seconds
- Processes jobs continuously

### Recommended Configuration

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

### Health Server Implementation

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

## Example 3: Data-Intensive Application with Slow Startup

### Application Profile

- Java Spring Boot application
- Loads large dataset into memory on startup
- Connects to multiple databases
- Startup time: 2-5 minutes (variable)
- Normal operation: fast and stable

### Recommended Configuration

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

### Java/Spring Boot Implementation

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

## Sources

- [Datree - Kubernetes Best Practices](https://www.datree.io/resources/kubernetes-readiness-and-liveness-probes-best-practices)
- [Google Cloud - Health Checks Best Practices](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes)
