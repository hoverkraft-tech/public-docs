---
sidebar_position: 2
---

# Example 2: Background Job Processor

## Application Profile

- **Technology Stack**: Python worker with Flask health server
- **Dependencies**: RabbitMQ message queue
- **Typical Startup Time**: 2-3 seconds
- **Traffic Pattern**: No HTTP traffic (consumes messages from queue)
- **Health Check**: Separate HTTP server for probes only

## Scenario Description

This is a background worker that:

- Processes messages from a RabbitMQ queue
- Does not serve HTTP traffic from clients
- Runs a separate lightweight HTTP server just for health checks
- Needs to detect when the worker becomes stuck
- Should be restarted if it can't connect to RabbitMQ

## Recommended Configuration

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

## Health Server Implementation

### Complete Application Code

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
            print(f"Processing job: {body.decode()}")
            # Simulate work
            time.sleep(2)
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

## Configuration Rationale

### Liveness Probe

- **Path**: `/healthz` - Checks if worker is actively processing messages
- **Initial Delay**: 10 seconds - Time for worker thread to start
- **Period**: 30 seconds - Longer interval since worker may be idle
- **Failure Threshold**: 3 - 90 seconds before declaring stuck

**Why**: Detects if the worker thread has become stuck or deadlocked. If no messages have been processed in 5 minutes AND the probe fails 3 times, the pod is restarted.

### Readiness Probe

- **Path**: `/ready` - Checks RabbitMQ connectivity
- **Initial Delay**: 5 seconds - Minimal delay for health server to start
- **Period**: 15 seconds - Moderate frequency
- **Failure Threshold**: 3 - 45 seconds before removing from service

**Why**: While background workers don't receive traffic, readiness affects deployment strategies. An unready worker won't count towards the deployment's ready replicas.

## Key Learnings

### 1. Health Checks for Non-Web Workloads

Even though this worker doesn't serve HTTP traffic, health checks are still critical:

- **Liveness**: Detects stuck workers that are consuming resources but not processing jobs
- **Readiness**: Signals when the worker can't connect to the queue

The health check server is a minimal Flask app that runs alongside the worker thread.

### 2. Detecting Stuck Workers

The liveness check tracks `last_processed_time`:

- Updates every time a message is successfully processed
- If the timestamp is too old (5 minutes), liveness fails
- This catches workers that are alive but not functioning

**Important**: The 5-minute threshold should be longer than your longest expected job processing time.

### 3. Graceful Degradation

When RabbitMQ is down:

- Readiness fails immediately
- Liveness passes (the worker thread is alive, just can't connect)
- The pod stays running and will automatically reconnect when RabbitMQ recovers

## Common Variations

### Multiple Queue Workers

If processing from multiple queues:

```python
def create_worker(queue_name):
    """Create a worker for a specific queue"""
    global last_processed_time, rabbitmq_connected

    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(os.getenv('RABBITMQ_HOST'))
        )
        channel = connection.channel()
        rabbitmq_connected = True

        def callback(ch, method, properties, body):
            global last_processed_time
            print(f"Processing from {queue_name}: {body.decode()}")
            # Process message based on queue
            process_message(queue_name, body)
            last_processed_time = time.time()
            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_consume(queue=queue_name, on_message_callback=callback)
        channel.start_consuming()
    except Exception as e:
        rabbitmq_connected = False
        print(f"Worker error on {queue_name}: {e}")

# Start multiple workers
for queue in ['high-priority', 'normal', 'low-priority']:
    thread = threading.Thread(target=create_worker, args=(queue,), daemon=True)
    thread.start()
```

### Add Job Metrics

Track more detailed metrics:

```python
from prometheus_client import Counter, Gauge, generate_latest

jobs_processed = Counter('jobs_processed_total', 'Total jobs processed')
jobs_failed = Counter('jobs_failed_total', 'Total jobs failed')
queue_connected = Gauge('queue_connected', 'Whether connected to queue')

def callback(ch, method, properties, body):
    global last_processed_time
    try:
        # Process message
        process_job(body)
        jobs_processed.inc()
        last_processed_time = time.time()
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        jobs_failed.inc()
        print(f"Job failed: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

@app.route('/metrics')
def metrics():
    return generate_latest()

@app.route('/ready')
def readiness():
    if rabbitmq_connected:
        queue_connected.set(1)
        return "READY", 200
    else:
        queue_connected.set(0)
        return "RabbitMQ not connected", 503
```

## Testing

### Local Testing

```bash
# Start RabbitMQ
docker run -d -p 5672:5672 rabbitmq:3

# Set environment variables
export RABBITMQ_HOST=localhost

# Start the worker
python worker.py

# In another terminal, test health endpoints
curl http://localhost:8080/healthz
curl http://localhost:8080/ready

# Publish a test message
python -c "
import pika
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='jobs')
channel.basic_publish(exchange='', routing_key='jobs', body='test job')
connection.close()
"

# Stop RabbitMQ and check readiness
docker stop <container-id>
curl http://localhost:8080/ready  # Should return 503
```

### Kubernetes Testing

```bash
# Deploy the worker
kubectl apply -f deployment.yaml

# Check worker logs
kubectl logs -f <pod-name>

# Publish messages via RabbitMQ service
kubectl exec -it <rabbitmq-pod> -- rabbitmqadmin publish routing_key=jobs payload="test job"

# Monitor probe status
kubectl describe pod <pod-name> | grep -A 10 "Liveness\|Readiness"

# Check if worker is processing
kubectl logs <pod-name> | grep "Processing"
```

## Troubleshooting

### Worker Not Processing Messages

**Symptom**: Pod is running but not processing messages from queue

**Likely Causes**:

1. Queue doesn't exist or wrong queue name
2. RabbitMQ connection credentials incorrect
3. Worker thread crashed but Flask server still running

**Solutions**:

- Check worker logs: `kubectl logs <pod-name>`
- Verify queue exists: `kubectl exec <rabbitmq-pod> -- rabbitmqctl list_queues`
- Check connection in readiness endpoint: `kubectl exec <pod-name> -- curl localhost:8080/ready`

### Frequent Restarts Due to Liveness

**Symptom**: Pods restart frequently even though RabbitMQ is healthy

**Likely Causes**:

1. `last_processed_time` threshold too aggressive
2. Queue is empty (no messages to process)
3. Jobs take longer than 5 minutes

**Solutions**:

- Adjust the 5-minute threshold to match your longest job
- Consider removing time-based liveness check if queue can be idle
- Add separate "heartbeat" mechanism independent of job processing
- Investigate and fix the root cause of memory leaks (use profiling tools)
- Set appropriate memory limits and monitor OOM events
- Use your observability stack (Prometheus, Grafana) to detect memory growth trends

## Sources

- [CICube - Kubernetes Probes Complete Guide](https://cicube.io/blog/kubernetes-probes/)
- [Sling Academy - Health Checks Configuration](https://www.slingacademy.com/article/kubernetes-configuring-health-checks-in-pods/)
