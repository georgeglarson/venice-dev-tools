#!/bin/bash
# Update Venice API OpenAPI Schema
# Fetches the latest schema from Venice API and saves it locally

set -e

SCHEMA_URL="https://api.venice.ai/api/openapi.json"
SCHEMA_FILE="docs/api/openapi.yaml"

echo "🔄 Fetching latest Venice API schema..."
echo "   Source: $SCHEMA_URL"
echo ""

if curl -sf "$SCHEMA_URL" -o "$SCHEMA_FILE"; then
    echo "✅ Schema updated successfully!"
    echo "   Saved to: $SCHEMA_FILE"
    echo "   Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "📊 Schema stats:"
    wc -l "$SCHEMA_FILE" | awk '{print "   Lines:", $1}'
    du -h "$SCHEMA_FILE" | awk '{print "   Size:", $1}'
else
    echo "❌ Failed to fetch schema from $SCHEMA_URL"
    echo "   Check your internet connection or API endpoint"
    exit 1
fi

echo ""
echo "💡 Tip: Commit this file if the schema changed:"
echo "   git add $SCHEMA_FILE"
echo "   git commit -m 'docs: update OpenAPI schema'"
