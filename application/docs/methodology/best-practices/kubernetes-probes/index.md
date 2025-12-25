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

## Guide Structure

This guide is organized into the following sections:

- **[Hoverkraft Approach](./hoverkraft-approach.md)** - Our core principles for probe configuration
- **[Configuration Reference](./configuration-reference.md)** - Probe parameters, types, and mechanisms
- **[Liveness Probes](./liveness-probes.md)** - Best practices for detecting unrecoverable states
- **[Readiness Probes](./readiness-probes.md)** - Best practices for traffic readiness
- **[Startup Probes](./startup-probes.md)** - Best practices for slow-starting containers
- **[Real-World Examples](./real-world-examples/)** - Complete implementation scenarios
- **[Common Pitfalls](./common-pitfalls.md)** - Mistakes to avoid and solutions
- **[Monitoring & Debugging](./monitoring-debugging.md)** - Observability and troubleshooting
- **[Resources](./resources.md)** - Additional references and links

---
