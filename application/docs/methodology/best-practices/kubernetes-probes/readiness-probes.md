---
sidebar_position: 4
---

# Readiness Probe Best Practices

## Purpose

Readiness probes determine when a container is ready to accept traffic. Kubernetes removes unready pods from service endpoints, preventing failed requests during startup, shutdown, or temporary unavailability.

## What to Check

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

## Configuration Example

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

## Implementation Examples

### Node.js (Express with Database)

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

### Python (Flask with Redis)

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

### Go (with Database)

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

## Sources

- [Sling Academy - Kubernetes Health Checks Configuration](https://www.slingacademy.com/article/kubernetes-configuring-health-checks-in-pods/)
- [Kube by Example - Health Checks](https://kubebyexample.com/concept/health-checks)
- [CICube - Kubernetes Probes Complete Guide](https://cicube.io/blog/kubernetes-probes/)
