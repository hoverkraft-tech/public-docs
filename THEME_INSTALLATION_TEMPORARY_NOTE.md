# ⚠️ Temporary Theme Installation Note

## Current Status

This repository currently uses the Hoverkraft Docusaurus theme via a **temporary local file installation** due to an issue with the published npm package.

## The Issue

The `@hoverkraft/docusaurus-theme@0.1.0` package on npm was published without the required compiled JavaScript files. This makes the package unusable in its current state.

## Current Workaround

The theme is installed using:
```json
"@hoverkraft/docusaurus-theme": "file:../../../../../../tmp/docusaurus-theme/packages/theme"
```

**This means:**
- ❌ CI/CD builds will fail (the `/tmp/docusaurus-theme` path doesn't exist in CI)
- ❌ Other developers cannot simply `npm install` and run the project
- ✅ The theme works locally for the original developer who built it

## How to Set Up Locally (Until Package is Fixed)

If you need to run this project locally:

1. **Clone the theme repository:**
   ```bash
   cd /tmp
   git clone https://github.com/hoverkraft-tech/docusaurus-theme.git
   ```

2. **Install theme dependencies:**
   ```bash
   cd /tmp/docusaurus-theme
   npm install
   ```

3. **Build the theme:**
   ```bash
   cd /tmp/docusaurus-theme/packages/theme
   npm run build
   ```

4. **Install project dependencies:**
   ```bash
   cd /path/to/public-docs/application
   npm install
   ```

5. **Run the project:**
   ```bash
   npm run start  # or npm run build
   ```

## Permanent Solution

Once the theme maintainers publish a corrected version:

1. **Update package.json:**
   ```json
   "@hoverkraft/docusaurus-theme": "^1.0.0"
   ```

2. **Reinstall:**
   ```bash
   npm install
   ```

3. **Verify it works:**
   ```bash
   npm run build
   ```

4. **Delete this note file**

## For CI/CD

Until the package is fixed, CI/CD builds will need to:
1. Clone the theme repo
2. Build it
3. Then build this project

Alternatively, temporarily comment out the theme in `docusaurus.config.ts`:
```typescript
// themes: ['@hoverkraft/docusaurus-theme'],  // Commented until npm package is fixed
```

## Timeline

- **Issue Discovered:** October 21, 2025
- **Theme Repository:** https://github.com/hoverkraft-tech/docusaurus-theme
- **Expected Fix:** When maintainers publish version 1.0.0 or corrected 0.1.1

---

**This is a temporary situation.** The Hoverkraft theme is excellent and works perfectly when properly installed. This note will be removed once the npm package issue is resolved.
