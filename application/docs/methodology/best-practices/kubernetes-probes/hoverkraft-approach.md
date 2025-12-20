---
sidebar_position: 1
---

# Hoverkraft Opinionated Approach

At Hoverkraft, we follow these core principles for probe configuration:

## 1. Application-Specific Tuning

Never use generic probe configurations. Each application has unique startup times, performance characteristics, and dependency patterns.

**Why it matters**: A payment processing service needs different probe configurations than a log aggregator. One-size-fits-all approaches lead to either premature restarts or delayed failure detection.

## 2. Separate Concerns

Use different endpoints and logic for liveness vs. readiness checks. Liveness should verify the container process is alive; readiness should verify the application can serve traffic.

**Why it matters**: When a database goes down for maintenance, readiness should fail (remove from load balancer), but liveness should pass (don't restart the healthy application).

## 3. Conservative Defaults

Start with generous timeouts and intervals, then tighten based on observed metrics. Premature restarts are worse than delayed detection.

**Why it matters**: An aggressive probe configuration can create cascading failures during load spikes, taking down more pods than the original issue affected.

## 4. Dependency Awareness

Readiness probes should check critical dependencies; liveness probes should NOT (to avoid cascading failures when external services are down).

**Why it matters**: If your liveness probe checks the database, a database outage will cause Kubernetes to restart all application pods, making recovery impossible.

## 5. Monitoring and Iteration

Treat probe configuration as living infrastructure. Monitor probe success rates, restart counts, and adjust based on production behavior.

**Why it matters**: Production conditions differ from development. What works in staging may need tuning once real traffic patterns emerge.

## 6. GitOps Enforcement

All probe configurations must be version-controlled, reviewed via pull requests, and tested in non-production environments before production deployment.

**Why it matters**: Probe changes can have significant impact on availability. They should receive the same rigor as application code changes.

## Configuration Philosophy

When configuring probes, always ask:

- **Liveness**: "Is this container in an unrecoverable state that requires a restart?"
- **Readiness**: "Can this container safely handle production traffic right now?"
- **Startup**: "Does this application need extra time to initialize before normal health checks begin?"

## Anti-Patterns to Avoid

❌ Copying probe configurations from examples without understanding your app  
❌ Using the same health check for liveness and readiness  
❌ Checking external dependencies in liveness probes  
❌ Setting aggressive timeouts without load testing  
❌ Deploying probe changes without monitoring their impact

## Sources

- [Datree - Best Practices for Kubernetes Readiness and Liveness Probes](https://www.datree.io/resources/kubernetes-readiness-and-liveness-probes-best-practices)
- [InfoQ - Checklist for Kubernetes in Production](https://www.infoq.com/articles/checklist-kubernetes-production/)
