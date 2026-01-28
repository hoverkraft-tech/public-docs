---
sidebar_position: 9
---

# Security & Compliance

> _Secure by default, not by heroism._

## Purpose

Avoid accidental vulnerabilities. Security should be built into processes, not bolted on afterward.

## Secrets Management

### Never Commit Secrets

✅ **DO**:

- Use secret managers (AWS Secrets Manager, 1Password, Vault)
- Store secrets outside version control
- Rotate secrets regularly
- Use different secrets per environment
- Audit secret access

❌ **DON'T**:

- Commit `.env` files
- Hardcode API keys or passwords
- Share secrets via Slack or email
- Use production secrets in development
- Log secrets (even accidentally)

**Example (Node.js with AWS Secrets Manager):**

```typescript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return response.SecretString!;
}

const dbPassword = await getSecret("prod/database/password");
```

**Sources:**

- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)

### Git Secrets Scanning

Prevent accidental commits:

```bash
# Install git-secrets
brew install git-secrets

# Initialize in repo
git secrets --install
git secrets --register-aws

# Scan history
git secrets --scan-history
```

Use GitHub secret scanning:

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push]

jobs:
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: trufflesecurity/trufflehog@main
```

**Sources:**

- [git-secrets - AWS Labs](https://github.com/awslabs/git-secrets)
- [TruffleHog - Secret Scanner](https://github.com/trufflesecurity/trufflehog)

## Authentication & Authorization Patterns

### Use Industry-Standard Protocols

✅ **DO**:

- Use OAuth 2.0 / OpenID Connect for authentication
- Use JWT for stateless auth (with short expiration)
- Implement refresh tokens
- Hash passwords with bcrypt or Argon2
- Enforce MFA for admin accounts

❌ **DON'T**:

- Roll your own authentication
- Store passwords in plaintext
- Use MD5 or SHA-1 for passwords
- Set JWT expiration > 1 hour
- Use session IDs in URLs

**Example (JWT Authentication):**

```typescript
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

async function login(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" },
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "30d" },
  );

  return { token, refreshToken };
}
```

**Sources:**

- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OAuth 2.0 - RFC 6749](https://tools.ietf.org/html/rfc6749)

### Authorization (RBAC)

Implement Role-Based Access Control:

```typescript
enum Role {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}

const permissions = {
  [Role.Admin]: ["read", "write", "delete"],
  [Role.Editor]: ["read", "write"],
  [Role.Viewer]: ["read"],
};

function authorize(user: User, action: string) {
  const userPermissions = permissions[user.role];

  if (!userPermissions.includes(action)) {
    throw new ForbiddenError("Insufficient permissions");
  }
}

// Usage in route handler
app.delete("/users/:id", async (req, res) => {
  authorize(req.user, "delete");
  await deleteUser(req.params.id);
  res.status(204).send();
});
```

**Sources:**

- [NIST - Role-Based Access Control](https://csrc.nist.gov/projects/role-based-access-control)

## Data Classification Rules

### Classification Levels

| Level            | Examples                  | Requirements                                                   |
| ---------------- | ------------------------- | -------------------------------------------------------------- |
| **Public**       | Marketing content, docs   | No restrictions                                                |
| **Internal**     | Code, designs, metrics    | Require authentication                                         |
| **Confidential** | Customer data, financials | Encrypt at rest, audit access                                  |
| **Restricted**   | PII, PHI, payment data    | Encrypt in transit & at rest, limited access, audit all access |

### Handling Sensitive Data

✅ **DO**:

- Encrypt PII at rest and in transit
- Minimize data collection (only what's needed)
- Anonymize data in non-prod environments
- Log access to sensitive data
- Implement data retention policies

❌ **DON'T**:

- Store credit card numbers (use tokenization)
- Log PII or sensitive data
- Use production data in development
- Grant broad access to sensitive data

**Example (Encryption at Rest):**

```typescript
import crypto from "crypto";

const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

function decrypt(encryptedText: string): string {
  const buffer = Buffer.from(encryptedText, "base64");

  const iv = buffer.slice(0, 16);
  const authTag = buffer.slice(16, 32);
  const encrypted = buffer.slice(32);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted) + decipher.final("utf8");
}
```

**Sources:**

- [OWASP - Data Classification](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology#Step_2:_Determining_Impact_Factors)

## OWASP Best Practices

### OWASP Top 10 (2021)

| Risk                          | Mitigation                                                 |
| ----------------------------- | ---------------------------------------------------------- |
| **Broken Access Control**     | Implement RBAC, validate permissions server-side           |
| **Cryptographic Failures**    | Use TLS, encrypt sensitive data, avoid weak algorithms     |
| **Injection**                 | Use parameterized queries, input validation                |
| **Insecure Design**           | Security requirements in design phase, threat modeling     |
| **Security Misconfiguration** | Secure defaults, disable unused features, update regularly |
| **Vulnerable Components**     | Scan dependencies, keep libraries updated                  |
| **Authentication Failures**   | MFA, secure session management, rate limiting              |
| **Software/Data Integrity**   | Code signing, SRI for CDN assets, verify updates           |
| **Logging Failures**          | Log security events, monitor for anomalies                 |
| **SSRF**                      | Validate URLs, use allowlists, network segmentation        |

**Sources:**

- [OWASP Top 10 - 2021](https://owasp.org/Top10/)

### SQL Injection Prevention

✅ **DO - Use Parameterized Queries:**

```typescript
// Safe - parameterized query
const users = await db.query("SELECT * FROM users WHERE email = $1", [email]);
```

❌ **DON'T - String Concatenation:**

```typescript
// Vulnerable to SQL injection
const users = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Sources:**

- [OWASP - SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

### XSS Prevention

✅ **DO - Escape Output:**

```typescript
import escapeHtml from "escape-html";

// Safe - escaped output
res.send(`<div>Welcome, ${escapeHtml(user.name)}</div>`);
```

❌ **DON'T - Unescaped User Input:**

```typescript
// Vulnerable to XSS
res.send(`<div>Welcome, ${user.name}</div>`);
```

**Use Content Security Policy:**

```typescript
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  );
  next();
});
```

**Sources:**

- [OWASP - XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## Dependency Vulnerability Handling

### Automated Scanning

```yaml
# .github/workflows/security.yml
name: Dependency Scan
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm audit --audit-level=moderate
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

✅ **DO**:

- Run `npm audit` or `yarn audit` in CI
- Use tools like Snyk, Dependabot, or Renovate
- Review and fix high/critical vulnerabilities within 7 days
- Update dependencies regularly

❌ **DON'T**:

- Ignore vulnerability warnings
- Use deprecated packages
- Pin dependencies without updates
- Skip security patches

**Sources:**

- [Snyk - Dependency Scanning](https://snyk.io/)
- [Dependabot - GitHub](https://docs.github.com/en/code-security/dependabot)

## Secure Coding Guidelines

### Input Validation

Always validate and sanitize input:

```typescript
import Joi from "joi";

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().integer().min(0).max(120),
});

function validateUser(data: unknown) {
  const { error, value } = userSchema.validate(data);

  if (error) {
    throw new ValidationError(error.message);
  }

  return value;
}
```

**Sources:**

- [OWASP - Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

### Rate Limiting

Prevent abuse with rate limiting:

```typescript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
});

app.post("/login", loginLimiter, async (req, res) => {
  // Handle login
});
```

**Sources:**

- [OWASP - Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)

## Audit & Compliance Basics

### GDPR Compliance

Key requirements:

- **Right to Access**: Users can request their data
- **Right to Erasure**: Users can delete their data
- **Data Portability**: Export data in machine-readable format
- **Consent**: Explicit consent for data collection
- **Breach Notification**: Report breaches within 72 hours

**Implementation Example:**

```typescript
// Export user data
app.get("/users/:id/export", async (req, res) => {
  authorize(req.user, "read");

  const userData = await exportUserData(req.params.id);
  res.json(userData);
});

// Delete user data
app.delete("/users/:id", async (req, res) => {
  authorize(req.user, "delete");

  await anonymizeUserData(req.params.id);
  res.status(204).send();
});
```

**Sources:**

- [GDPR Official Text](https://gdpr-info.eu/)
- [OWASP - GDPR Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GDPR_Cheat_Sheet.html)

### Audit Logging

Log security-relevant events:

```typescript
function auditLog(event: string, user: User, details: object) {
  logger.info("Security audit event", {
    event,
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

// Usage
auditLog("user.login", user, { ipAddress: req.ip });
auditLog("user.password_changed", user, {});
auditLog("admin.user_deleted", admin, { deletedUserId: userId });
```

**Sources:**

- [NIST - Audit and Accountability](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=AU-1)

## Sources

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Google Security Best Practices](https://cloud.google.com/security/best-practices)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
