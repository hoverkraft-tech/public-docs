#!/usr/bin/env bash
#
# Manual Documentation Import Script for terraform-modules
#
# This script manually imports documentation from terraform-modules repository
# into the public-docs portal. This is a one-time bootstrap script.
#
# For automated syncing, follow the onboarding guide in:
# .github/templates/TERRAFORM-MODULES-ONBOARDING.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
SOURCE_REPO="https://github.com/hoverkraft-tech/terraform-modules.git"
TEMP_DIR="/tmp/terraform-modules-import-$$"
DOCS_TARGET="$REPO_ROOT/application/docs/projects/infrastructure-devops/terraform-modules"
STATIC_TARGET="$REPO_ROOT/application/static/img/projects/infrastructure-devops/terraform-modules"

echo "🚀 Starting manual documentation import for terraform-modules"
echo "=================================================="

# Clean up on exit
cleanup() {
  if [ -d "$TEMP_DIR" ]; then
    echo "🧹 Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

# Clone repository
echo "📥 Cloning terraform-modules repository..."
git clone --depth=1 "$SOURCE_REPO" "$TEMP_DIR"

# Create target directories
echo "📁 Creating target directories..."
mkdir -p "$DOCS_TARGET"
# Note: STATIC_TARGET reserved for future use when importing images/assets
# mkdir -p "$STATIC_TARGET"

# Process main README
echo "📄 Processing main README..."
if [ -f "$TEMP_DIR/README.md" ]; then
  # Add frontmatter
  cat > "$DOCS_TARGET/index.md" <<'EOF'
---
title: Terraform Modules
source_repo: hoverkraft-tech/terraform-modules
source_path: README.md
source_branch: main
manually_imported: true
---

EOF
  # Append README content
  cat "$TEMP_DIR/README.md" >> "$DOCS_TARGET/index.md"
  echo "✅ Main README imported"
else
  echo "⚠️  README.md not found in source repository"
fi

echo ""
echo "✅ Documentation import completed!"
echo "=================================================="
echo ""
echo "📊 Summary:"
echo "  - Main README: imported to $DOCS_TARGET/index.md"
echo ""
echo "📝 Next steps:"
echo "  1. Review imported documentation in: $DOCS_TARGET"
echo "  2. Run: make lint-fix (to format the files)"
echo "  3. Run: make build (to verify build succeeds)"
echo "  4. Commit the changes"
echo "  5. Set up automated sync using: .github/templates/TERRAFORM-MODULES-ONBOARDING.md"
echo ""
echo "⚠️  Note: This is a manual one-time import."
echo "    For ongoing updates, configure automated sync in terraform-modules repository."
