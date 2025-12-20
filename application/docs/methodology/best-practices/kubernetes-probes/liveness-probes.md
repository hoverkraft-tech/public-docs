---
sidebar_position: 3
---

# Liveness Probe Best Practices

## Purpose

Liveness probes detect when a container is in an unrecoverable state (deadlocked, out of memory, crashed) and needs to be restarted.

## What to Check

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
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
        initialDelaySeconds: 15
        periodSeconds: 20
        timeoutSeconds: 5
        failureThreshold: 3
```

## Implementation Examples

### Node.js (Express)

```javascript
const express = require("express");
const app = express();

app.get("/healthz", (req, res) => {
  // Simple liveness check - just verify the server is responsive
  res.status(200).send("OK");
});

app.listen(8080);
```

### Python (Flask)

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

### Go

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

## Sources

- [IBM Developer - Health Checks for Node.js Applications](https://developer.ibm.com/tutorials/health-checking-kubernetes-nodejs-application)
- [Baeldung - Understanding Liveness and Readiness Probes](https://www.baeldung.com/ops/kubernetes-livenessprobe-readinessprobe)
- [GitHub - Kubernetes Probes Demo Examples](https://github.com/artisantek/kubernetes-probes-demo)
