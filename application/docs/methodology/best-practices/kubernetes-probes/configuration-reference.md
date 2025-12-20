---
sidebar_position: 2
---

# Configuration Reference

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
