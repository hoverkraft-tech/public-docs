---
sidebar_position: 9
---

# Additional Resources

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

## Official Documentation

- [Kubernetes - Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes - Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Kubernetes - Container Probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes)

## Industry Best Practices

- [Google Cloud - Kubernetes Best Practices: Health Checks](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes)
- [Datree - Readiness and Liveness Probes Best Practices](https://www.datree.io/resources/kubernetes-readiness-and-liveness-probes-best-practices)
- [InfoQ - Kubernetes Production Checklist for SREs](https://www.infoq.com/articles/checklist-kubernetes-production/)
- [Kubernetes Blog - 7 Common Pitfalls](https://kubernetes.io/blog/2025/10/20/seven-kubernetes-pitfalls-and-how-to-avoid/)

## Deep Dives

- [CICube - Complete Guide to Container Health Checks](https://cicube.io/blog/kubernetes-probes/)
- [Baeldung - Understanding Liveness and Readiness Probes](https://www.baeldung.com/ops/kubernetes-livenessprobe-readinessprobe)
- [Kube by Example - Health Checks](https://kubebyexample.com/concept/health-checks)
- [Hostman - Kubernetes Probes Explained](https://hostman.com/tutorials/liveness-readiness-and-startup-probes-in-kubernetes/)
- [Spacelift - 15 Common Kubernetes Pitfalls](https://spacelift.io/blog/kubernetes-challenges)

## Implementation Examples

- [GitHub - Kubernetes Probes Demo (Python, Go, Node.js)](https://github.com/artisantek/kubernetes-probes-demo)
- [IBM Developer - Health Checks in Node.js](https://developer.ibm.com/tutorials/health-checking-kubernetes-nodejs-application)
- [Go Healthcheck Library](https://pkg.go.dev/github.com/GlobalWebIndex/healthcheck)
- [Sling Academy - Health Checks Configuration](https://www.slingacademy.com/article/kubernetes-configuring-health-checks-in-pods/)

## Debugging and Troubleshooting

- [4sysops - Kubernetes Health Checks Debugging](https://4sysops.com/archives/kubernetes-health-checks-with-liveness-readiness-and-startup-probes/)
- [LabEx - Kubernetes Health Monitoring](https://labex.io/tutorials/kubernetes-how-to-implement-kubernetes-health-monitoring-probes-392602)
- [Decisive DevOps - Check The Pulse of Your Pods](https://decisivedevops.com/kubernetes-probes-check-the-pulse-of-your-pods/)

## Related Topics

### Health Check Libraries

- **Node.js**: [lightship](https://github.com/gajus/lightship), [terminus](https://github.com/godaddy/terminus)
- **Go**: [health](https://github.com/alexliesenfeld/health), [healthcheck](https://github.com/GlobalWebIndex/healthcheck)
- **Python**: [py-healthcheck](https://github.com/ateliedocodigo/py-healthcheck)
- **Java/Spring**: [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)

### Observability

- [Prometheus Metrics for Kubernetes](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards for Kubernetes](https://grafana.com/grafana/dashboards/?search=kubernetes)
- [Kubernetes Events Monitoring](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/)

### GitOps and Configuration Management

- [ArgoCD - Declarative GitOps for Kubernetes](https://argo-cd.readthedocs.io/)
- [Flux - GitOps for Kubernetes](https://fluxcd.io/)
- [Kustomize - Kubernetes Configuration Management](https://kustomize.io/)
