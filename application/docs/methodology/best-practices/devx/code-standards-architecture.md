---
sidebar_position: 4
---

# Code Standards & Architecture

> _Make the right thing the easy thing._

## Purpose

Consistency, readability, and long-term maintainability. Code is read 10x more than it's written—optimize for readers.

## Project Structure Conventions

Use a consistent, predictable structure across all projects:

### Backend (Node.js/TypeScript Example)

```
src/
├── domain/           # Business logic (framework-agnostic)
│   ├── entities/     # Core domain models
│   ├── use-cases/    # Application business rules
│   └── repositories/ # Interfaces for data access
├── infrastructure/   # External concerns (frameworks, databases)
│   ├── database/     # Database implementations
│   ├── http/         # Web framework (Express, Fastify)
│   └── messaging/    # Message queues, event buses
├── interfaces/       # Adapters between domain and infrastructure
│   ├── controllers/  # HTTP controllers
│   ├── presenters/   # Response formatting
│   └── validators/   # Input validation
└── shared/           # Utilities and cross-cutting concerns
    ├── errors/       # Custom error types
    ├── logger/       # Logging utilities
    └── types/        # Shared TypeScript types
```

**Sources:**

- [Node.js Best Practices - Project Structure](https://github.com/goldbergyoni/nodebestpractices#1-project-structure-practices)

### Frontend (React Example)

```
src/
├── components/       # Reusable UI components
│   ├── common/       # Shared across features
│   └── feature/      # Feature-specific components
├── pages/            # Route-level components
├── hooks/            # Custom React hooks
├── services/         # API clients, external integrations
├── state/            # State management (Redux, Zustand)
├── utils/            # Pure functions, helpers
├── types/            # TypeScript type definitions
└── styles/           # Global styles, theme
```

**Sources:**

- [React Documentation - File Structure](https://react.dev/learn/thinking-in-react)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)

## Clean Architecture Boundaries

### Dependency Rule

Dependencies point inward. Domain logic never depends on infrastructure.

```
┌─────────────────────────────────────┐
│  Frameworks & Drivers (Database,   │
│  Web, External APIs)                │
│  ┌───────────────────────────────┐  │
│  │  Interface Adapters           │  │
│  │  (Controllers, Presenters)    │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Use Cases              │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  Entities        │  │  │  │
│  │  │  │  (Domain Logic)  │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

✅ **DO**:

- Domain entities contain business rules
- Use cases orchestrate domain logic
- Controllers map HTTP to use case calls
- Infrastructure implements repository interfaces

❌ **DON'T**:

- Put SQL queries in controllers
- Import framework code into domain entities
- Let domain logic depend on databases

**Sources:**

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Domain Modeling Guidelines

### Use Rich Domain Models

Encapsulate behavior with data:

✅ **DO**:

```typescript
class Order {
  constructor(
    private items: OrderItem[],
    private status: OrderStatus,
  ) {}

  addItem(item: OrderItem): void {
    if (this.status !== OrderStatus.Draft) {
      throw new Error("Cannot add items to non-draft order");
    }
    this.items.push(item);
  }

  total(): Money {
    return this.items.reduce((sum, item) => sum.add(item.price), Money.zero());
  }
}
```

❌ **DON'T**:

```typescript
// Anemic domain model (just data, no behavior)
interface Order {
  items: OrderItem[];
  status: string;
}

// Business logic scattered in services
function addItemToOrder(order: Order, item: OrderItem) {
  if (order.status !== "draft") {
    throw new Error("Cannot add items");
  }
  order.items.push(item);
}
```

**Sources:**

- [Martin Fowler - Anemic Domain Model](https://martinfowler.com/bliki/AnemicDomainModel.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)

## Error Handling Patterns

### Use Custom Error Types

Create semantic error classes:

```typescript
// Base application error
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Domain-specific errors
class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, "NOT_FOUND", 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}
```

### Centralized Error Handling

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Log unexpected errors
  logger.error("Unexpected error", { err, req });

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
});
```

**Sources:**

- [Node.js Best Practices - Error Handling](https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices)

## Logging & Observability Patterns

### Structured Logging

Always use JSON logs with context:

```typescript
logger.info("User authenticated", {
  userId: user.id,
  email: user.email,
  requestId: req.id,
  duration: Date.now() - startTime,
});
```

✅ **DO**:

- Include `requestId` in all logs
- Log at appropriate levels (ERROR, WARN, INFO, DEBUG)
- Add contextual fields (userId, orderId, etc.)
- Use consistent field names across services

❌ **DON'T**:

- Log sensitive data (passwords, tokens, PII)
- Use string interpolation instead of structured fields
- Log at inappropriate levels (DEBUG in production)

**Sources:**

- [The Twelve-Factor App - Logs](https://12factor.net/logs)
- [Structured Logging - Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)

### Distributed Tracing

Add trace IDs to correlate logs across services:

```typescript
import { trace } from "@opentelemetry/api";

const span = trace.getActiveSpan();
logger.info("Processing payment", {
  traceId: span?.spanContext().traceId,
  orderId,
  amount,
});
```

**Sources:**

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)

## Dependency Rules

### Allowed Dependencies

```
Domain Layer:      ✅ Nothing (pure business logic)
Use Case Layer:    ✅ Domain entities
Interface Layer:   ✅ Use cases, domain entities
Infrastructure:    ✅ Everything (implementation details)
```

### Dependency Injection

Use dependency injection to invert control:

```typescript
class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private paymentGateway: PaymentGateway,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const order = new Order(input.items);
    await this.paymentGateway.charge(order.total());
    return this.orderRepository.save(order);
  }
}
```

**Sources:**

- [Dependency Injection - Martin Fowler](https://martinfowler.com/articles/injection.html)

## Naming Conventions

### Files

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_TIMEOUT.ts`)
- **Tests**: Same as source + `.test` or `.spec` (`UserProfile.test.tsx`)

### Variables & Functions

```typescript
// Variables: camelCase, descriptive
const userProfile = fetchUserProfile(userId);
const isAuthenticated = checkAuth();

// Functions: verbs, camelCase
function calculateTotal(items: Item[]): number {}
async function fetchUser(id: string): Promise<User> {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://api.example.com";

// Classes: PascalCase, nouns
class UserService {}
class PaymentGateway {}
```

### API Endpoints

- Use nouns, not verbs: `/users` not `/getUsers`
- Use plural for collections: `/orders` not `/order`
- Use kebab-case: `/user-profiles` not `/user_profiles`

```
GET    /users           # List users
POST   /users           # Create user
GET    /users/:id       # Get user
PUT    /users/:id       # Update user
DELETE /users/:id       # Delete user
GET    /users/:id/orders # Nested resources
```

**Sources:**

- [RESTful API Design - Microsoft](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

## Linting, Formatting, Static Analysis

### Automated Enforcement

Use tools to enforce standards automatically:

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "type-check": "tsc --noEmit",
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

✅ **DO**:

- Run linters in CI (fail builds on violations)
- Use pre-commit hooks for instant feedback
- Autoformat on save in IDE
- Share IDE settings (`.vscode/settings.json`)

❌ **DON'T**:

- Argue about formatting in code reviews
- Allow manual formatting
- Skip linting "just this once"

**Sources:**

- [ESLint Documentation](https://eslint.org/)
- [Prettier - Opinionated Code Formatter](https://prettier.io/)

## Sources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring - Martin Fowler](https://refactoring.com/)
