---
sidebar_position: 6
---

# Testing & Quality

> _Confidence beats heroics._

## Purpose

Ship fast without fear. Tests are insurance—they let you refactor, upgrade dependencies, and deploy with confidence.

## Testing Pyramid & Expectations

Follow the testing pyramid: many fast unit tests, fewer integration tests, minimal E2E tests.

```
        /\
       /  \      E2E Tests (Slow, brittle, expensive)
      /____\     - 5-10% of tests
     /      \    Integration Tests (Medium speed)
    /        \   - 20-30% of tests
   /__________\  Unit Tests (Fast, isolated, cheap)
                 - 60-75% of tests
```

**Test Distribution:**
- **Unit Tests**: 60-75% (milliseconds per test)
- **Integration Tests**: 20-30% (seconds per test)
- **E2E Tests**: 5-10% (minutes per test)

**Sources:**

- [Martin Fowler - Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [Google Testing Blog - Test Sizes](https://testing.googleblog.com/2010/12/test-sizes.html)

## Unit / Integration / E2E Boundaries

### Unit Tests

Test a single unit (function, class) in isolation.

✅ **DO**:

- Test business logic and algorithms
- Use mocks for dependencies
- Run in milliseconds
- Aim for 80%+ code coverage

❌ **DON'T**:

- Touch databases, filesystems, or networks
- Test framework internals
- Test trivial getters/setters

**Example (TypeScript):**

```typescript
// Unit test - pure logic
describe('calculateDiscount', () => {
  it('applies 10% discount for orders over $100', () => {
    const total = calculateDiscount(150, 'PROMO10');
    expect(total).toBe(135); // 150 - 15
  });

  it('throws error for invalid promo code', () => {
    expect(() => calculateDiscount(100, 'INVALID')).toThrow();
  });
});
```

**Sources:**

- [Unit Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Integration Tests

Test interactions between components (database, API, message queue).

✅ **DO**:

- Test repository implementations
- Test API endpoints
- Use real databases (in containers)
- Clean up data after tests

❌ **DON'T**:

- Test UI flows (use E2E instead)
- Share state between tests
- Use production databases

**Example (Node.js with PostgreSQL):**

```typescript
// Integration test - database interaction
describe('UserRepository', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('saves user to database', async () => {
    const user = new User('john@example.com', 'John Doe');
    await userRepository.save(user);

    const found = await userRepository.findById(user.id);
    expect(found.email).toBe('john@example.com');
  });
});
```

**Sources:**

- [Testing with Databases - Testcontainers](https://testcontainers.com/)

### E2E Tests

Test complete user workflows through the UI or API.

✅ **DO**:

- Test critical user journeys (signup, checkout, login)
- Use production-like environments
- Run in CI and before releases
- Keep tests independent

❌ **DON'T**:

- Test every edge case
- Share test data between tests
- Run on every commit (too slow)

**Example (Playwright):**

```typescript
// E2E test - full user flow
test('user can sign up and place order', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');

  await expect(page).toHaveURL('/dashboard');
  
  await page.click('text=New Order');
  // ... complete order flow
  
  await expect(page.locator('.success-message')).toBeVisible();
});
```

**Sources:**

- [Playwright Documentation](https://playwright.dev/)

## Test Naming Conventions

Use descriptive, readable test names:

✅ **DO**:

```typescript
// Readable test names
describe('Order', () => {
  it('throws error when adding item to submitted order', () => {});
  it('calculates correct total with discount', () => {});
  it('sends confirmation email after successful payment', () => {});
});
```

❌ **DON'T**:

```typescript
// Vague test names
test('test1', () => {});
test('order test', () => {});
test('should work', () => {});
```

**Pattern**: `it('<action> <expected outcome> <context>')`

**Sources:**

- [Better Specs - Test Naming](https://www.betterspecs.org/)

## Test Data & Fixtures Strategy

### Factory Pattern

Use factories to create test data:

```typescript
// test/factories/user.factory.ts
export function createUser(overrides?: Partial<User>): User {
  return {
    id: randomUUID(),
    email: `user-${randomInt()}@example.com`,
    name: 'Test User',
    createdAt: new Date(),
    ...overrides,
  };
}

// In tests
const user = createUser({ email: 'specific@example.com' });
```

✅ **DO**:

- Use factories for complex objects
- Randomize non-critical data
- Allow overriding specific fields
- Clean up test data after tests

❌ **DON'T**:

- Hard-code test data
- Reuse data across tests
- Leave data in database after tests

**Sources:**

- [Fishery - Test Data Factory](https://github.com/thoughtbot/fishery)

## Mocks vs Fakes vs Real Services

### Mocks

Simulate behavior and verify interactions.

**Use when**: Testing that a function was called with correct arguments.

```typescript
const emailService = jest.fn();
await notifyUser(user, emailService);
expect(emailService).toHaveBeenCalledWith(user.email, expect.any(String));
```

### Fakes

In-memory implementations of interfaces.

**Use when**: Fast tests without external dependencies.

```typescript
class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
}
```

### Real Services

Actual implementations (databases, APIs).

**Use when**: Integration or E2E tests.

```typescript
// Use Testcontainers for real database
const container = await new PostgreSqlContainer().start();
const db = await connect(container.getConnectionString());
```

**Sources:**

- [Martin Fowler - Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

## Contract Testing

Test API contracts between services.

### Provider Tests (API)

```typescript
// Verify API returns expected shape
describe('GET /users/:id', () => {
  it('returns user with expected fields', async () => {
    const response = await request(app).get('/users/123');
    
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: expect.stringMatching(/^.+@.+$/),
      name: expect.any(String),
      created_at: expect.any(String),
    });
  });
});
```

### Consumer Tests (Client)

```typescript
// Verify client can handle API response
describe('UserApiClient', () => {
  it('parses user response correctly', async () => {
    mockServer.use(
      rest.get('/users/:id', (req, res, ctx) => {
        return res(ctx.json({
          id: '123',
          email: 'test@example.com',
          name: 'Test',
          created_at: '2024-01-01T00:00:00Z',
        }));
      })
    );

    const user = await client.getUser('123');
    expect(user.id).toBe('123');
  });
});
```

**Sources:**

- [Pact - Contract Testing](https://pact.io/)
- [Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract)

## Performance & Load Testing Basics

### Benchmark Critical Paths

Test performance of hot paths:

```typescript
describe('performance', () => {
  it('calculates discount in < 10ms', () => {
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      calculateDiscount(100, 'PROMO10');
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(10);
  });
});
```

### Load Testing

Use tools like k6, Artillery, or Gatling:

```javascript
// k6 load test
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50, // 50 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('https://api.example.com/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

**Sources:**

- [k6 Documentation](https://k6.io/docs/)
- [Artillery Load Testing](https://www.artillery.io/)

## Quality Gates (Coverage, Lint, CI Checks)

### CI Pipeline Checks

Enforce quality in CI:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      
      # Linting
      - run: npm run lint
      
      # Type checking
      - run: npm run type-check
      
      # Tests with coverage
      - run: npm run test:coverage
      
      # Fail if coverage < 80%
      - run: npm run check-coverage
```

### Coverage Thresholds

```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

✅ **DO**:

- Enforce minimum coverage (70-80%)
- Block PRs that reduce coverage
- Focus on critical paths (authentication, payments)
- Track coverage trends over time

❌ **DON'T**:

- Aim for 100% coverage (diminishing returns)
- Test for coverage sake (focus on valuable tests)
- Skip tests to meet deadlines

**Sources:**

- [Codecov - Code Coverage Best Practices](https://about.codecov.io/blog/code-coverage-best-practices/)

## Sources

- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Google Testing Blog](https://testing.googleblog.com/)
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
