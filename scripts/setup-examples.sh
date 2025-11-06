#!/bin/bash
# Quick setup script for Venice AI SDK examples

set -e

echo "🚀 Venice AI SDK - Example Setup"
echo "=================================="
echo ""

# Check if .env already exists
if [ -f "examples/.env" ]; then
    echo "⚠️  examples/.env already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

# Copy .env.example
echo "📝 Creating examples/.env from examples/.env.example..."
cp examples/.env.example examples/.env

# Prompt for API key
echo ""
echo "🔑 Enter your Venice AI API key"
echo "   (Get one at: https://venice.ai/settings/api)"
echo ""
read -p "API Key: " -r API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ No API key provided"
    exit 1
fi

# Update .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/VENICE_API_KEY=your-api-key-here/VENICE_API_KEY=$API_KEY/" examples/.env
else
    # Linux
    sed -i "s/VENICE_API_KEY=your-api-key-here/VENICE_API_KEY=$API_KEY/" examples/.env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Try your first example:"
echo "   npx tsx examples/typescript/01-hello-world.ts"
echo ""
echo "📖 Browse all examples:"
echo "   cat examples/README.md"
echo ""
