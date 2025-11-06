#!/bin/bash

# Venice AI SDK - Publish Script
# This script publishes the core package to npm

set -e

echo "🚀 Venice AI SDK - Publishing to npm"
echo "===================================="
echo ""

# Navigate to core package
cd "$(dirname "$0")/venice-ai-sdk/packages/core"

# Show current version
VERSION=$(node -p "require('./package.json').version")
echo "📦 Package: @venice-dev-tools/core"
echo "🏷️  Version: $VERSION"
echo ""

# Verify build exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not found. Run 'npm run build' first."
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "❌ Tests failed. Fix errors before publishing."
    exit 1
fi

echo ""
echo "📋 Dry-run publish..."
npm publish --dry-run > /dev/null 2>&1
echo "✅ Dry-run successful"
echo ""

# Prompt for OTP
echo "🔐 This package requires 2FA authentication."
echo ""
read -p "Enter your npm OTP code (6 digits from authenticator): " OTP

if [ -z "$OTP" ]; then
    echo "❌ No OTP provided. Aborting."
    exit 1
fi

echo ""
echo "📤 Publishing to npm registry..."
echo ""

# Publish with OTP
npm publish --access public --otp="$OTP"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Package published to npm"
    echo ""
    echo "Users can now install with:"
    echo "  npm install @venice-dev-tools/core@$VERSION"
    echo ""
    echo "View on npm:"
    echo "  https://www.npmjs.com/package/@venice-dev-tools/core"
    echo ""
else
    echo ""
    echo "❌ Publish failed. Check the error above."
    echo ""
    echo "Common issues:"
    echo "  - OTP code expired (try again with new code)"
    echo "  - Not logged in (run: npm login)"
    echo "  - Version already exists (bump version number)"
    exit 1
fi
