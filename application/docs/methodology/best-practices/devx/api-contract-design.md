---
sidebar_position: 5
---

# API & Contract Design

> _APIs are products._

## Purpose

Prevent breaking changes and consumer pain. APIs outlive their implementations—design them carefully.

## REST API Design Guidelines

### Resource Naming

✅ **DO**:

- Use nouns for resources: `/users`, `/orders`, `/products`
- Use plural names for collections: `/users` not `/user`
- Use hierarchies for relationships: `/users/:userId/orders`
- Use kebab-case for multi-word resources: `/shipping-addresses`

❌ **DON'T**:

- Use verbs in URLs: `/getUsers`, `/createOrder`
- Mix plural and singular: `/user` and `/orders`
- Nest more than 2 levels deep: `/users/:id/orders/:id/items/:id/reviews`

**Example:**

```
GET    /users                 # List users
POST   /users                 # Create user
GET    /users/:id             # Get specific user
PATCH  /users/:id             # Update user
DELETE /users/:id             # Delete user
GET    /users/:id/orders      # Get user's orders
POST   /users/:id/orders      # Create order for user
```

**Sources:**

- [RESTful API Design - Best Practices](https://restfulapi.net/resource-naming/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md)

### HTTP Methods & Status Codes

| Method | Purpose | Success Status | Common Errors |
|--------|---------|----------------|---------------|
| GET    | Retrieve resource(s) | 200 OK | 404 Not Found |
| POST   | Create resource | 201 Created | 400 Bad Request, 409 Conflict |
| PUT    | Replace resource | 200 OK | 404 Not Found |
| PATCH  | Update resource | 200 OK | 404 Not Found, 400 Bad Request |
| DELETE | Remove resource | 204 No Content | 404 Not Found |

**Sources:**

- [HTTP Status Codes - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## Versioning Strategy

### URL Versioning (Recommended)

Include version in the URL path:

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

✅ **DO**:

- Start with `/v1` from day one
- Increment major version for breaking changes
- Support at least 2 versions simultaneously
- Document deprecation timelines clearly

❌ **DON'T**:

- Use header-based versioning (harder to test/debug)
- Skip versions (`/v1` → `/v3`)
- Deploy breaking changes without a new version

**Sources:**

- [API Versioning - Stripe](https://stripe.com/blog/api-versioning)

## Backward Compatibility Rules

### Never Break Existing Clients

✅ **Safe Changes**:

- Adding new endpoints
- Adding optional fields to requests
- Adding fields to responses
- Making required fields optional
- Relaxing validation rules

❌ **Breaking Changes**:

- Removing endpoints
- Removing response fields
- Adding required request fields
- Changing field types
- Renaming fields
- Changing error codes

**Migration Path for Breaking Changes**:

1. Deploy new version (`/v2`) alongside old (`/v1`)
2. Update documentation with migration guide
3. Notify consumers with 6-month deprecation notice
4. Monitor usage metrics for v1 endpoints
5. Disable v1 after all consumers migrate

**Sources:**

- [Google API Design - Compatibility](https://cloud.google.com/apis/design/compatibility)

## Pagination, Filtering, Sorting

### Pagination (Cursor-Based)

Use cursor-based pagination for large datasets:

```
GET /users?limit=20&cursor=eyJpZCI6MTAwfQ
```

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIwfQ",
    "has_more": true
  }
}
```

✅ **DO**:

- Use cursor-based pagination for real-time data
- Include `next_cursor` and `has_more` in responses
- Set reasonable default limits (e.g., 20-100)
- Document maximum limit

❌ **DON'T**:

- Use offset-based pagination for large datasets (performance issues)
- Allow unlimited page sizes
- Return different results for the same cursor

**Sources:**

- [Pagination - Slack API](https://api.slack.com/docs/pagination)

### Filtering

Support common filters via query parameters:

```
GET /users?status=active&role=admin&created_after=2024-01-01
```

### Sorting

Allow sorting with `sort` parameter:

```
GET /users?sort=-created_at,name
```

(Prefix with `-` for descending order)

**Sources:**

- [JSON API - Filtering](https://jsonapi.org/recommendations/#filtering)

## Error Formats & Status Codes

### Consistent Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

✅ **DO**:

- Include machine-readable error codes
- Provide human-readable messages
- Add field-level validation details
- Include `request_id` for tracing

❌ **DON'T**:

- Expose stack traces in production
- Use generic messages ("An error occurred")
- Return 200 OK with error in body

**Sources:**

- [RFC 7807 - Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
- [Google JSON Style Guide](https://google.github.io/styleguide/jsoncstyleguide.xml)

## OpenAPI / Schema Conventions

### Document APIs with OpenAPI

Maintain OpenAPI 3.0 spec for all APIs:

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

✅ **DO**:

- Generate docs from OpenAPI spec (Swagger UI, Redoc)
- Validate requests/responses against schema
- Version OpenAPI specs alongside code
- Use schema validation in tests

❌ **DON'T**:

- Maintain separate documentation (gets outdated)
- Skip response examples
- Deploy without validating spec

**Sources:**

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger Editor](https://editor.swagger.io/)

## GraphQL Design Guidelines

### Schema Design

```graphql
type User {
  id: ID!
  email: String!
  name: String
  orders(first: Int, after: String): OrderConnection!
}

type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
}

type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
}
```

✅ **DO**:

- Use relay-style pagination
- Null for missing data, not errors
- Use input types for mutations
- Include payload types with errors

❌ **DON'T**:

- Return arrays directly (use connections)
- Use excessive nesting
- Expose internal IDs without namespacing

**Sources:**

- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Relay Specification](https://relay.dev/docs/guides/graphql-server-specification/)

## SDK Generation Rules

### Generate Client Libraries

Use OpenAPI or GraphQL schema to generate SDKs:

```bash
# From OpenAPI
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./clients/typescript

# From GraphQL
npm run graphql-codegen
```

✅ **DO**:

- Generate clients for major languages (TypeScript, Python, Go)
- Publish SDKs to package registries
- Version SDKs with API versions
- Include usage examples in SDK README

❌ **DON'T**:

- Manually write and maintain client code
- Ship SDKs without tests
- Break SDK APIs without major version bump

**Sources:**

- [OpenAPI Generator](https://openapi-generator.tech/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)

## Deprecation Policy

### Deprecation Process

1. **Announce**: Add deprecation notice to docs (6 months minimum)
2. **Header**: Return `Deprecation` header with sunset date
   ```
   Deprecation: true
   Sunset: Sat, 31 Dec 2024 23:59:59 GMT
   ```
3. **Monitor**: Track usage of deprecated endpoints
4. **Migrate**: Provide migration guide and sample code
5. **Remove**: Disable endpoint after sunset date

**Example Deprecation Notice:**

```markdown
## ⚠️ Deprecation Warning

`GET /v1/users` is deprecated and will be removed on December 31, 2024.

**Migration**: Use `GET /v2/users` instead.

**Breaking Changes**:
- `created` field renamed to `created_at`
- Pagination now uses cursors instead of offsets

**Migration Guide**: [See full guide](./migration-v1-to-v2.md)
```

**Sources:**

- [RFC 8594 - Sunset Header](https://tools.ietf.org/html/rfc8594)
- [Stripe API Versioning](https://stripe.com/docs/api/versioning)

## Sources

- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
