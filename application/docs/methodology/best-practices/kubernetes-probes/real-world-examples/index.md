---
sidebar_position: 6
---

# Real-World Application Examples

This section provides complete, production-ready examples for different application scenarios. Each example includes:

- **Application Profile** - Technology stack and characteristics
- **Recommended Configuration** - Complete Kubernetes YAML with probe definitions
- **Health Endpoint Implementation** - Full code examples in relevant language

## Available Examples

### [Example 1: REST API with Database](./rest-api-database.md)

A typical web service scenario with external dependencies:

- **Technology**: Node.js/Express API
- **Dependencies**: PostgreSQL database, Redis cache
- **Startup Time**: 5-10 seconds
- **Key Learning**: Separating liveness (app health) from readiness (dependency health)

### [Example 2: Background Job Processor](./background-job-processor.md)

A non-HTTP worker processing messages from a queue:

- **Technology**: Python worker
- **Dependencies**: RabbitMQ message queue
- **Startup Time**: 2-3 seconds
- **Key Learning**: Health checks for non-web workloads, detecting stuck workers

### [Example 3: Data-Intensive Application](./data-intensive-slow-startup.md)

An application with variable, long initialization times:

- **Technology**: Java Spring Boot
- **Dependencies**: Multiple databases, large dataset loading
- **Startup Time**: 2-5 minutes (variable)
- **Key Learning**: Using startup probes to prevent premature restarts

## Selecting the Right Example

Choose the example that most closely matches your application:

- **Web API or microservice?** → See Example 1
- **Background worker or queue processor?** → See Example 2
- **Long initialization or data loading?** → See Example 3

## General Patterns

All examples demonstrate:

✅ Separation of liveness and readiness concerns  
✅ Appropriate probe timing based on application characteristics  
✅ Resource requests and limits defined  
✅ Lightweight health check implementations  
✅ Production-ready configurations

## Next Steps

After reviewing these examples:

1. Identify which pattern matches your application
2. Adapt the configuration to your specific needs
3. Test in non-production environment first
4. Monitor probe metrics after deployment
5. Iterate based on observed behavior

For guidance on avoiding common mistakes, see [Common Pitfalls](../common-pitfalls.md).
