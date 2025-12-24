---
sidebar_position: 2
---

# Configuration Reference

For complete details on probe configuration parameters and mechanisms, refer to the official Kubernetes documentation:

- [Kubernetes Official Documentation - Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

## Quick Reference

### Key Configuration Parameters

| Parameter             | Default | Typical Values          | Purpose                                    |
| --------------------- | ------- | ----------------------- | ------------------------------------------ |
| `initialDelaySeconds` | 0       | 10-30s (or use startup) | Wait before first probe                    |
| `periodSeconds`       | 10      | 10-30s                  | How often to probe                         |
| `timeoutSeconds`      | 1       | 2-5s                    | Probe timeout                              |
| `successThreshold`    | 1       | 1 (liveness), 1-3 (readiness) | Successes needed to mark healthy    |
| `failureThreshold`    | 3       | 3-5                     | Failures before marking unhealthy          |

### Probe Mechanisms

Kubernetes supports three probe mechanisms:

**HTTP GET Probe** - For web applications and REST APIs
```yaml
httpGet:
  path: /health
  port: 8080
```

**TCP Socket Probe** - For databases, caches, gRPC services
```yaml
tcpSocket:
  port: 8080
```

**Exec Probe** - For custom health logic or legacy applications
```yaml
exec:
  command:
    - cat
    - /tmp/healthy
```

## Recommendations

- **Liveness**: Use simple, lightweight checks (no external dependencies)
- **Readiness**: Check critical dependencies (database, cache, etc.)
- **Startup**: Use for slow-starting apps (> 30s initialization)
- Always set `timeoutSeconds` ≥ 2 to avoid false positives
- Monitor probe success rates and adjust based on production behavior

**For comprehensive documentation**, see the [official Kubernetes probe configuration guide](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).
