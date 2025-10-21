# Hoverkraft Docusaurus Theme Migration Notes

## Overview
This document tracks the migration process to the Hoverkraft Docusaurus theme and documents issues found during the migration that should be addressed in the theme's documentation.

## Current Status: ✅ COMPLETED (with workaround)

### Critical Issue: npm Package Published Without Built Files (RESOLVED via workaround)

**Problem**: The `@hoverkraft/docusaurus-theme` package version `0.1.0` on npm was published without the compiled JavaScript files in the `lib/` directory. The package only contains TypeScript source files which cannot be directly used by Docusaurus.

**Evidence**:
- Package.json specifies `"main": "lib/index.js"` but the `lib/` directory doesn't exist in the published package
- Only contains 12 files (18KB) - primarily TypeScript source files in `src/`
- Published on: 2025-10-21T16:48:21.244Z

**Impact**: Migration is currently impossible until a properly built package is published to npm.

**Error When Attempting to Use**:
```
Error: Docusaurus was unable to resolve the "@hoverkraft/docusaurus-theme" theme. Make sure one of the following packages are installed:
- @hoverkraft/docusaurus-theme
- @hoverkraft/docusaurus-theme-docusaurus-theme
```

### Root Cause Analysis

The GitHub Actions workflow (`.github/workflows/__shared-ci.yml`) shows that the package should be built before publishing:
1. CI builds `packages/theme/lib` directory
2. Package tarball is created from the built files
3. Tarball is uploaded and published to npm

However, the version 0.1.0 release appears to have been published without the build artifacts being properly included.

## Missing Documentation Issues

Based on the migration attempt, the following should be added to the Hoverkraft theme documentation:

### 1. Prerequisites Check

**Missing**: Clear verification steps to ensure the npm package is properly installed and contains built files.

**Recommendation**: Add to installation docs:
```markdown
### Verify Installation

After installing, verify the package contains the required built files:

\`\`\`bash
# Check that lib directory exists in the installed package
ls node_modules/@hoverkraft/docusaurus-theme/lib/

# Should show index.js and other compiled files
\`\`\`

If the lib directory is missing, the package was not properly published. Please report this issue.
```

### 2. Troubleshooting Section

**Missing**: Common installation/resolution errors and their solutions.

**Recommendation**: Add troubleshooting guide:
```markdown
### Common Issues

#### Theme Resolution Error
\`\`\`
Error: Docusaurus was unable to resolve the "@hoverkraft/docusaurus-theme" theme
\`\`\`

**Causes**:
1. Package not installed: Run `npm install @hoverkraft/docusaurus-theme`
2. Package published without build artifacts: Verify lib/ directory exists
3. Node modules cache issue: Try `npm ci` or delete `node_modules` and reinstall
```

### 3. Version Compatibility Matrix

**Missing**: Clear documentation about which package versions work with which Docusaurus versions.

**Recommendation**: Add version compatibility table to README:
```markdown
## Version Compatibility

| Theme Version | Docusaurus Version | Status |
|--------------|-------------------|---------|
| 0.1.0        | 3.x              | ⚠️ Known Issue: Published without build artifacts |
| 1.0.0        | 3.x              | ✅ Expected (not yet published) |
```

### 4. Migration Checklist Enhancement

**Missing**: Pre-migration verification steps.

**Current**: Migration guide jumps directly to installation.

**Recommendation**: Add pre-migration checklist:
```markdown
## Before You Begin

- [ ] Verify you're using Docusaurus 3.x (`npm list @docusaurus/core`)
- [ ] Check latest theme version on npm (`npm view @hoverkraft/docusaurus-theme version`)
- [ ] Backup your current configuration
- [ ] Review breaking changes in the CHANGELOG
- [ ] Test in a development environment first
```

### 5. Package Publishing Documentation

**Missing**: Internal documentation for maintainers about the package publishing process.

**Recommendation**: Add to CONTRIBUTING.md or create PUBLISHING.md:
```markdown
## Publishing the Theme Package

⚠️ **Critical**: The theme MUST be built before publishing

### Pre-publish Checklist
- [ ] Run `npm run build` in packages/theme/
- [ ] Verify `packages/theme/lib/` directory exists and contains JS files
- [ ] Test package locally: `npm pack` then `npm install -g ./hoverkraft-docusaurus-theme-*.tgz`
- [ ] Verify the packed tarball contains the lib/ directory
```

## Workaround Solution Applied

Since the npm package is broken, we successfully applied the following workaround:

1. Cloned the theme repository from GitHub to `/tmp/docusaurus-theme`
2. Installed dependencies with `npm install`
3. Built the theme package locally with `npm run build` in `packages/theme/`
4. Installed the locally built theme using `npm install file:/tmp/docusaurus-theme/packages/theme`
5. Added `themes: ['@hoverkraft/docusaurus-theme']` to `docusaurus.config.ts`

**Result**: ✅ Theme successfully integrated and working!

### Visual Results

The site now displays with:
- Hoverkraft branded header with logo
- Blue gradient hero section
- Professional dark footer
- Clean documentation layout
- Consistent Hoverkraft styling throughout

## Next Steps

1. **For Theme Maintainers**:
   - Publish a corrected version (0.1.1 or 1.0.0) with properly built files
   - Add verification to CI/CD that published package contains lib/ directory
   - Update documentation with troubleshooting section

2. **For This Repository**:
   - ⚠️ Current installation uses local file reference which won't work in CI/CD
   - When proper npm package is published, update to: `npm install @hoverkraft/docusaurus-theme@latest`
   - Consider adding note in README about temporary installation method

## Completed Migration Steps

1. ✅ Attempted to install @hoverkraft/docusaurus-theme via npm (failed - package broken)
2. ✅ Documented npm package issue for theme maintainers
3. ✅ Cloned theme repository and built locally
4. ✅ Installed theme from local build
5. ✅ Added theme to docusaurus.config.ts themes array
6. ✅ Successfully built site with Hoverkraft theme
7. ✅ Verified theme works in development mode
8. ✅ Took screenshots of themed site

## References

- Theme Repository: https://github.com/hoverkraft-tech/docusaurus-theme
- Theme Documentation: https://hoverkraft-tech.github.io/docusaurus-theme/
- Migration Guide: https://hoverkraft-tech.github.io/docusaurus-theme/docs/migration
- npm Package: https://www.npmjs.com/package/@hoverkraft/docusaurus-theme
- Issue Tracking: https://github.com/hoverkraft-tech/docusaurus-theme/issues

---

*Last Updated: 2025-10-21*
*Migration Status: ✅ COMPLETED (using local build workaround)*

## Important Note for Production

The current installation uses a local file reference (`file:/tmp/docusaurus-theme/packages/theme`). This approach:
- ✅ Works locally for development and testing
- ❌ Will NOT work in CI/CD pipelines
- ❌ Will NOT work when other developers clone the repository

**Action Required**: Once @hoverkraft/docusaurus-theme@1.0.0 or a corrected 0.1.1 is published to npm with proper build artifacts, update the installation:

```bash
npm uninstall @hoverkraft/docusaurus-theme
npm install @hoverkraft/docusaurus-theme@latest
```
