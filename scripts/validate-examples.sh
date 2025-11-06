#!/bin/bash
# Validate All Examples
# Tests that TypeScript, JavaScript, and Shell examples are valid

set -e

ERRORS=0

echo "🧪 Validating Examples..."
echo ""

# Check TypeScript examples can compile
echo "📘 TypeScript Examples:"
if command -v tsc &> /dev/null; then
    for file in examples/typescript/*.ts; do
        if [ -f "$file" ]; then
            echo -n "   Checking $(basename $file)... "
            if tsc --noEmit --skipLibCheck "$file" 2>/dev/null; then
                echo "✅"
            else
                echo "❌"
                ((ERRORS++))
            fi
        fi
    done
else
    echo "   ⚠️  TypeScript not installed, skipping"
fi

echo ""

# Check JavaScript examples for syntax errors
echo "📗 JavaScript Examples:"
if command -v node &> /dev/null; then
    for file in examples/javascript/*.js; do
        if [ -f "$file" ]; then
            echo -n "   Checking $(basename $file)... "
            if node --check "$file" 2>/dev/null; then
                echo "✅"
            else
                echo "❌"
                ((ERRORS++))
            fi
        fi
    done
else
    echo "   ⚠️  Node.js not installed, skipping"
fi

echo ""

# Check Shell examples for syntax errors
echo "📕 Shell Examples:"
if command -v bash &> /dev/null; then
    for file in examples/shell/*.sh; do
        if [ -f "$file" ]; then
            echo -n "   Checking $(basename $file)... "
            if bash -n "$file" 2>/dev/null; then
                echo "✅"
            else
                echo "❌"
                ((ERRORS++))
            fi
        fi
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo "✅ All examples valid!"
    exit 0
else
    echo "❌ Found $ERRORS errors"
    echo "   Fix the issues above before committing"
    exit 1
fi
