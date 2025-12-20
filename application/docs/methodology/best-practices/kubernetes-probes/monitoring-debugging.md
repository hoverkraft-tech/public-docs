---
sidebar_position: 8
---

# Monitoring and Debugging

## Key Metrics to Track

Monitor these metrics to ensure your probes are working effectively:

### 1. Pod Restart Count

High restart counts indicate probe misconfiguration or real application issues.

```bash
kubectl get pods -o wide
kubectl describe pod <pod-name>
```

Look for the `Restart Count` field and investigate any pods with frequent restarts.

### 2. Probe Success Rate

Track the percentage of successful probes using Prometheus metrics:

- `prober_probe_total` - Total number of probes
- `prober_probe_duration_seconds` - Probe execution time

Set alerts for probe success rates below acceptable thresholds (e.g., < 95%).

### 3. Time to Ready

Monitor how long it takes pods to become ready after deployment. This helps understand:

- Deployment impact on service availability
- Whether startup probes need adjustment
- If initialization is getting slower over time

### 4. Service Endpoint Changes

Frequent additions/removals of pods from service endpoints indicate readiness probe flapping. This can cause:

- Inconsistent request routing
- Connection draining issues
- Increased latency

## Debugging Failed Probes

When probes fail, use these debugging techniques:

### Check Pod Events

```bash
# View recent events for a pod
kubectl describe pod <pod-name>

# Look for probe failure messages in the Events section
# Example: "Liveness probe failed: HTTP probe failed with statuscode: 503"
```

### View Container Logs

```bash
# Get logs from the container
kubectl logs <pod-name> -c <container-name>

# Follow logs in real-time
kubectl logs <pod-name> -c <container-name> -f

# Get logs from previous container instance (after restart)
kubectl logs <pod-name> -c <container-name> --previous
```

### Execute Probe Manually

Test the exact probe configuration manually:

```bash
# For HTTP probes
kubectl exec <pod-name> -- curl -v http://localhost:8080/healthz

# With custom headers
kubectl exec <pod-name> -- curl -H "Custom-Header: Value" http://localhost:8080/health

# For exec probes
kubectl exec <pod-name> -- /bin/sh -c "command from probe"

# For TCP probes
kubectl exec <pod-name> -- nc -zv localhost 8080
```

### Check Resource Constraints

Probe failures can be caused by resource throttling:

```bash
# Check resource usage
kubectl top pod <pod-name>

# View resource requests and limits
kubectl describe pod <pod-name> | grep -A 5 "Requests:"
```

### Enable Debug Logging

Add temporary debug logging to health endpoints:

```javascript
app.get("/healthz", (req, res) => {
  console.log(`Health check at ${new Date().toISOString()}`);
  // Add resource metrics
  console.log(`Memory: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
  res.send("OK");
});
```

## Common Probe Failure Patterns

### Pattern: Flapping Probes

**Symptoms**: Pods alternate between ready and not ready  
**Causes**:

- Probe checks unreliable dependency
- Timing too aggressive for actual response time
- Resource contention

**Solution**: Increase `successThreshold` and `failureThreshold`

### Pattern: Startup Timeout

**Symptoms**: Pods restart during initialization  
**Causes**:

- Application takes longer to start than `initialDelaySeconds`
- Missing startup probe

**Solution**: Add startup probe or increase `initialDelaySeconds`

### Pattern: Load-Induced Failures

**Symptoms**: Probes fail only under high load  
**Causes**:

- Probe timeout too short
- Health endpoint performs expensive operations
- Resource limits too low

**Solution**: Optimize health endpoint, increase resources, adjust timeouts

## Monitoring Best Practices

1. **Set Up Alerting**

   ```yaml
   # Prometheus alert for high restart rate
   - alert: HighPodRestartRate
     expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
     for: 5m
     annotations:
       summary: "Pod {{ $labels.pod }} restarting frequently"

   # Alert for probe failures
   - alert: ProbeFailureRate
     expr: rate(prober_probe_failures_total[5m]) > 0.05
     annotations:
       summary: "High probe failure rate for {{ $labels.pod }}"
   ```

2. **Dashboard Key Metrics**
   - Pod restart counts over time
   - Probe success/failure rates
   - Time to ready after deployment
   - Resource usage correlation with probe failures

3. **Log Probe Results**
   Keep probe endpoint logs structured and searchable:

   ```json
   {
     "timestamp": "2025-12-20T18:00:00Z",
     "probe": "readiness",
     "status": "success",
     "duration_ms": 45,
     "checks": {
       "database": "ok",
       "redis": "ok"
     }
   }
   ```

## Troubleshooting Checklist

When investigating probe issues:

- [ ] Check pod events for probe failure messages
- [ ] Review container logs for errors around probe failures
- [ ] Execute probe manually to verify behavior
- [ ] Check resource usage (CPU, memory)
- [ ] Verify network connectivity to dependencies
- [ ] Review probe timing parameters
- [ ] Check if failures correlate with deployments or load
- [ ] Verify health endpoint implementation
- [ ] Test under load conditions
- [ ] Review recent configuration changes

## Sources

- [4sysops - Kubernetes Health Checks Debugging](https://4sysops.com/archives/kubernetes-health-checks-with-liveness-readiness-and-startup-probes/)
- [LabEx - Kubernetes Health Monitoring](https://labex.io/tutorials/kubernetes-how-to-implement-kubernetes-health-monitoring-probes-392602)
