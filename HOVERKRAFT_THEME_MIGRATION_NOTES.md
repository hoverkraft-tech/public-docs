# Hoverkraft Docusaurus Theme Migration Notes

## Overview
This document tracks the migration process to the Hoverkraft Docusaurus theme and documents issues found during the migration that should be addressed in the theme's documentation.

## Current Status: BLOCKED

### Critical Issue: npm Package Published Without Built Files

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

## Next Steps

1. **For Theme Maintainers**:
   - Publish a corrected version (0.1.1 or 1.0.0) with properly built files
   - Add verification to CI/CD that published package contains lib/ directory
   - Update documentation with troubleshooting section

2. **For This Migration**:
   - Wait for corrected package release
   - Or: Use direct Git dependency as temporary workaround (if theme supports it)
   - Update this document when migration is unblocked

## Attempted Migration Steps

1. ✅ Installed @hoverkraft/docusaurus-theme via npm
2. ✅ Added theme to docusaurus.config.ts themes array
3. ❌ Build failed due to missing lib/ directory in package
4. ✅ Documented issue for theme maintainers
5. ⏸️ Waiting for corrected package release

## References

- Theme Repository: https://github.com/hoverkraft-tech/docusaurus-theme
- Theme Documentation: https://hoverkraft-tech.github.io/docusaurus-theme/
- Migration Guide: https://hoverkraft-tech.github.io/docusaurus-theme/docs/migration
- npm Package: https://www.npmjs.com/package/@hoverkraft/docusaurus-theme
- Issue Tracking: https://github.com/hoverkraft-tech/docusaurus-theme/issues

---

*Last Updated: 2025-10-21*
*Migration Status: BLOCKED - Awaiting corrected npm package*
