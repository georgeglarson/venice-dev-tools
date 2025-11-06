#!/bin/bash
# Sync Documentation
# One command to update everything

set -e

echo "🔄 Syncing Venice AI SDK Documentation..."
echo ""

# Update API schema
echo "1️⃣  Updating API Schema..."
./scripts/update-api-schema.sh
echo ""

# Validate examples
echo "2️⃣  Validating Examples..."
./scripts/validate-examples.sh
echo ""

# Update last-updated timestamps
TIMESTAMP=$(date '+%Y-%m-%d')
echo "3️⃣  Updating timestamps..."
echo "   Documentation last synced: $TIMESTAMP"

echo ""
echo "✅ Documentation sync complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review changes: git status"
echo "   2. Commit if needed: git add . && git commit -m 'docs: sync documentation'"
echo "   3. Push to GitHub: git push"
