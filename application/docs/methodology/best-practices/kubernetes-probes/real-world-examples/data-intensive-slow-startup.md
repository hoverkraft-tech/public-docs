---
sidebar_position: 3
---

# Example 3: Data-Intensive Application with Slow Startup

## Application Profile

- **Technology Stack**: Java Spring Boot application
- **Dependencies**: Multiple databases, large dataset loading
- **Typical Startup Time**: 2-5 minutes (variable)
- **Normal Operation**: Fast and stable once initialized
- **Key Challenge**: Preventing Kubernetes from killing the pod during initialization

## Scenario Description

This is a data-intensive application that:

- Loads large datasets into memory during startup
- Connects to multiple databases with schema migrations
- Has unpredictable initialization times (depends on data size)
- Runs fast and stable once fully initialized
- Would fail liveness checks if they started too early

## Recommended Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: data-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: data-service
  template:
    metadata:
      labels:
        app: data-service
    spec:
      containers:
        - name: service
          image: my-data-service:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
            limits:
              memory: "4Gi"
              cpu: "2000m"
          # Startup: Allow up to 5 minutes for initialization
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            failureThreshold: 30 # 30 * 10s = 5 minutes max
            periodSeconds: 10
            timeoutSeconds: 5
          # Liveness: After startup, check every 30 seconds
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          # Readiness: Check if data is loaded and ready to serve
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
```

## Health Endpoint Implementation

### Complete Spring Boot Application

```java
@RestController
public class HealthController {

    @Autowired
    private DataLoadingService dataService;

    @Autowired
    private DatabaseConnectionPool dbPool;

    @GetMapping("/healthz")
    public ResponseEntity<String> liveness() {
        // Simple check - application is running
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/ready")
    public ResponseEntity<String> readiness() {
        // Check if data is loaded
        if (!dataService.isDataLoaded()) {
            return ResponseEntity.status(503).body("Data not loaded");
        }

        // Check database connectivity
        if (!dbPool.isHealthy()) {
            return ResponseEntity.status(503).body("Database unhealthy");
        }

        return ResponseEntity.ok("READY");
    }
}

@Service
public class DataLoadingService implements ApplicationListener<ApplicationReadyEvent> {

    private volatile boolean dataLoaded = false;
    private static final Logger logger = LoggerFactory.getLogger(DataLoadingService.class);

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        logger.info("Starting data loading...");
        try {
            loadReferenceData();
            loadCustomerData();
            buildCaches();
            dataLoaded = true;
            logger.info("Data loading completed successfully");
        } catch (Exception e) {
            logger.error("Data loading failed", e);
            // Let the pod fail readiness but stay alive for debugging
        }
    }

    private void loadReferenceData() {
        logger.info("Loading reference data...");
        // Load lookup tables, configuration, etc.
        // This might take 30-60 seconds
    }

    private void loadCustomerData() {
        logger.info("Loading customer data...");
        // Load large dataset into memory
        // This might take 1-3 minutes
    }

    private void buildCaches() {
        logger.info("Building caches...");
        // Warm up caches with frequently accessed data
        // This might take 30-90 seconds
    }

    public boolean isDataLoaded() {
        return dataLoaded;
    }
}
```

## Configuration Rationale

### Startup Probe

- **Path**: `/healthz` - Same as liveness (checks if Spring Boot is responding)
- **Failure Threshold**: 30 - With 10s period = 5 minutes maximum startup time
- **Period**: 10 seconds - Checks every 10 seconds during startup
- **Purpose**: Prevents liveness probe from killing pod during initialization

**Why**: During the startup phase, Kubernetes only runs the startup probe. Liveness and readiness probes are disabled until the startup probe succeeds. This gives the application up to 5 minutes to initialize without being killed.

### Liveness Probe

- **Path**: `/healthz` - Simple Spring Boot health check
- **Period**: 30 seconds - Conservative once running normally
- **Disabled Until**: Startup probe succeeds

**Why**: After startup completes, liveness checks if the JVM/Spring Boot is still responsive. Conservative timing prevents false positives.

### Readiness Probe

- **Path**: `/ready` - Checks if data is loaded and databases are healthy
- **Period**: 10 seconds - More frequent to quickly detect issues
- **Disabled Until**: Startup probe succeeds

**Why**: Readiness determines if the pod can serve traffic. Even after startup succeeds, the pod might not be ready if data reloading or database maintenance is happening.

## Key Learnings

### 1. Startup Probe is Essential

Without a startup probe, you would need to set `initialDelaySeconds: 300` on the liveness probe. This has problems:

- After the first successful liveness check, if the app crashes and restarts, it still waits 5 minutes before checking again
- With startup probe, subsequent restarts are checked every 10 seconds after the first startup succeeds

### 2. Probe Lifecycle

The probe execution sequence:

1. **Pod starts** → Only startup probe runs (every 10s)
2. **Startup probe succeeds** (app responds to `/healthz`) → Startup probe stops forever
3. **Liveness and readiness probes begin** → Run independently with their own schedules
4. **If pod restarts** → Sequence repeats from step 1

### 3. Separating Initialization from Readiness

The application can be in three states:

- **Initializing**: Startup probe running, others disabled
- **Alive but not ready**: Liveness passes, readiness fails (data loading)
- **Fully ready**: All probes pass

This prevents the pod from receiving traffic during data loading even after Spring Boot is up.

## Common Variations

### Progress-Based Startup

Instead of time-based startup probe, track initialization progress:

```java
@Service
public class DataLoadingService {

    private int initializationProgress = 0; // 0-100

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        try {
            initializationProgress = 10;
            loadReferenceData();

            initializationProgress = 40;
            loadCustomerData();

            initializationProgress = 70;
            buildCaches();

            initializationProgress = 100;
        } catch (Exception e) {
            logger.error("Initialization failed at {}%", initializationProgress, e);
        }
    }

    public int getInitializationProgress() {
        return initializationProgress;
    }
}

@GetMapping("/healthz")
public ResponseEntity<Map<String, Object>> liveness() {
    Map<String, Object> status = new HashMap<>();
    status.put("status", "OK");
    status.put("initProgress", dataService.getInitializationProgress());
    return ResponseEntity.ok(status);
}
```

### Database Migration Integration

If using Flyway or Liquibase for migrations:

```java
@Service
public class DatabaseMigrationService implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private Flyway flyway;

    private volatile boolean migrationComplete = false;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        logger.info("Running database migrations...");
        try {
            flyway.migrate();
            migrationComplete = true;
            logger.info("Migrations completed");
        } catch (Exception e) {
            logger.error("Migration failed", e);
            throw new RuntimeException("Database migration failed", e);
        }
    }

    public boolean isMigrationComplete() {
        return migrationComplete;
    }
}

@GetMapping("/ready")
public ResponseEntity<String> readiness() {
    // Check migrations completed
    if (!migrationService.isMigrationComplete()) {
        return ResponseEntity.status(503).body("Migrations in progress");
    }

    // Check data loaded
    if (!dataService.isDataLoaded()) {
        return ResponseEntity.status(503).body("Data not loaded");
    }

    return ResponseEntity.ok("READY");
}
```

### External Warmup Trigger

For very large datasets, trigger warmup externally:

```java
@Service
public class DataLoadingService {

    private volatile boolean dataLoaded = false;
    private final AtomicBoolean warmupInProgress = new AtomicBoolean(false);

    // Don't auto-load on startup
    // @Override
    // public void onApplicationEvent(ApplicationReadyEvent event) { }

    @PostMapping("/admin/warmup")
    public ResponseEntity<String> triggerWarmup() {
        if (warmupInProgress.compareAndSet(false, true)) {
            CompletableFuture.runAsync(() -> {
                try {
                    loadData();
                    dataLoaded = true;
                } finally {
                    warmupInProgress.set(false);
                }
            });
            return ResponseEntity.accepted().body("Warmup started");
        }
        return ResponseEntity.status(409).body("Warmup already in progress");
    }

    @GetMapping("/admin/warmup/status")
    public ResponseEntity<Map<String, Object>> warmupStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("loaded", dataLoaded);
        status.put("inProgress", warmupInProgress.get());
        return ResponseEntity.ok(status);
    }
}
```

## Testing

### Local Testing

```bash
# Build and run
mvn spring-boot:run

# Monitor startup logs
# Watch for "Data loading completed successfully"

# Test health during startup
watch -n 1 curl -s http://localhost:8080/healthz

# Test readiness
curl http://localhost:8080/ready

# Time the initialization
time until curl -s http://localhost:8080/ready | grep -q READY; do sleep 1; done
```

### Kubernetes Testing

```bash
# Deploy
kubectl apply -f deployment.yaml

# Watch the pod lifecycle
kubectl get pods -w

# Monitor startup probe specifically
kubectl describe pod <pod-name> | grep -A 5 "Startup:"

# Check initialization logs
kubectl logs -f <pod-name>

# Time how long until ready
kubectl wait --for=condition=Ready pod/<pod-name> --timeout=10m
```

## Troubleshooting

### Pod Keeps Restarting During Startup

**Symptom**: Pod restarts before data loading completes

**Likely Causes**:

1. Startup probe `failureThreshold` too low for actual initialization time
2. Out of memory during data loading
3. Database connection timeout during migrations

**Solutions**:

- Increase `failureThreshold`: `30 * 10s = 5min` → `60 * 10s = 10min`
- Check memory: `kubectl top pod <pod-name>`
- Review OOM events: `kubectl describe pod <pod-name> | grep -i oom`

### Very Slow Rollout During Deployments

**Symptom**: Deployments take 10+ minutes to complete

**Cause**: Each new pod takes 5 minutes to start, and RollingUpdate waits for readiness

**Solutions**:

Optimize the rollout strategy:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1 # Create 1 extra pod during update
      maxUnavailable: 0 # Keep all old pods until new ones are ready
  minReadySeconds: 10 # Wait 10s after ready before considering pod available
```

Or use Blue-Green deployments for faster cutover.

### Memory Usage Grows Over Time

**Symptom**: Pod works fine initially but OOM kills after hours/days

**Solutions**:

Add memory leak detection to liveness:

```java
@GetMapping("/healthz")
public ResponseEntity<Map<String, Object>> liveness() {
    Runtime runtime = Runtime.getRuntime();
    long usedMemory = runtime.totalMemory() - runtime.freeMemory();
    long maxMemory = runtime.maxMemory();
    double memoryPercent = (usedMemory * 100.0) / maxMemory;

    Map<String, Object> status = new HashMap<>();
    status.put("status", "OK");
    status.put("memoryPercent", memoryPercent);

    // Fail liveness if memory is critically high
    if (memoryPercent > 95) {
        status.put("status", "CRITICAL_MEMORY");
        return ResponseEntity.status(503).body(status);
    }

    return ResponseEntity.ok(status);
}
```

## Performance Optimization

### Parallel Data Loading

Speed up initialization by loading in parallel:

```java
@Override
public void onApplicationEvent(ApplicationReadyEvent event) {
    logger.info("Starting parallel data loading...");

    CompletableFuture<Void> refData = CompletableFuture.runAsync(this::loadReferenceData);
    CompletableFuture<Void> custData = CompletableFuture.runAsync(this::loadCustomerData);

    try {
        // Wait for both to complete
        CompletableFuture.allOf(refData, custData).get();

        // Then build caches that depend on both
        buildCaches();

        dataLoaded = true;
        logger.info("Parallel data loading completed");
    } catch (Exception e) {
        logger.error("Data loading failed", e);
        throw new RuntimeException(e);
    }
}
```

### Lazy Loading Strategy

Instead of loading everything upfront:

```java
@Service
public class LazyDataService {

    private final ConcurrentHashMap<String, Object> cache = new ConcurrentHashMap<>();
    private volatile boolean coreDataLoaded = false;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Only load critical core data
        loadCoreData();
        coreDataLoaded = true;
        // Other data loaded on-demand
    }

    public Object getData(String key) {
        return cache.computeIfAbsent(key, this::loadDataForKey);
    }

    public boolean isReady() {
        return coreDataLoaded;
    }
}
```

## Sources

- [Kubernetes Official Documentation - Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes)
- [Hostman - Kubernetes Probes Explained](https://hostman.com/tutorials/liveness-readiness-and-startup-probes-in-kubernetes/)
- [Spring Boot Actuator Health Endpoints](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health)
