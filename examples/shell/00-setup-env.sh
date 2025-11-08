#!/bin/bash

##############################################################################
# Environment Setup - Load API Configuration
#
# Scans for .env files and loads Venice AI API configuration into your
# current shell session. This makes it easy to run examples without manually
# exporting environment variables.
#
# This script should be **sourced**, not executed directly:
#   source ./00-setup-env.sh
#   # or
#   . ./00-setup-env.sh
#
# It will search for .env files in:
# 1. Current directory (examples/shell/.env)
# 2. Project root (../../.env)
# 3. User home directory (~/.venice-ai.env)
#
# What it does:
# - Locates .env file with VENICE_API_KEY
# - Exports variables to current shell
# - Validates the API key is set
# - Provides helpful guidance if not found
#
# Prerequisites:
# - A .env file with VENICE_API_KEY=your-key-here
#
# Run with: source ./00-setup-env.sh
##############################################################################

##############################################################################
# Helper Functions
##############################################################################

load_env_file() {
  local env_file="$1"
  
  if [ ! -f "$env_file" ]; then
    return 1
  fi
  
  echo "📄 Found .env file: $env_file"
  
  # Load variables from .env file (ignore comments and empty lines)
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    
    # Skip lines without '='
    [[ ! "$line" =~ = ]] && continue
    
    # Extract key and value
    local key="${line%%=*}"
    local value="${line#*=}"
    
    # Trim whitespace
    key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    # Remove surrounding quotes if present
    value=$(echo "$value" | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
    
    # Export the variable
    if [ -n "$key" ]; then
      export "$key=$value"
      echo "   ✓ Exported: $key"
    fi
  done < "$env_file"
  
  return 0
}

##############################################################################
# Main
##############################################################################

main() {
  echo "🔧 Venice AI Environment Setup"
  echo ""
  
  # Determine script directory
  local script_dir
  if [ -n "${BASH_SOURCE[0]}" ]; then
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  else
    script_dir="$(pwd)"
  fi
  
  # Search paths for .env files (in order of priority)
  local env_paths=(
    "$script_dir/.env"
    "$script_dir/../.env"
    "$script_dir/../../.env"
    "$HOME/.venice-ai.env"
  )
  
  local found=false
  
  for env_path in "${env_paths[@]}"; do
    if load_env_file "$env_path"; then
      found=true
      break
    fi
  done
  
  echo ""
  
  if [ "$found" = false ]; then
    echo "⚠️  No .env file found"
    echo ""
    echo "   Searched locations:"
    for env_path in "${env_paths[@]}"; do
      echo "   • $env_path"
    done
    echo ""
    echo "💡 Create a .env file with:"
    echo "   echo 'VENICE_API_KEY=your-api-key-here' > $script_dir/.env"
    echo ""
    echo "   Or export directly:"
    echo "   export VENICE_API_KEY='your-api-key-here'"
    echo ""
    return 1
  fi
  
  # Validate VENICE_API_KEY is set
  if [ -z "$VENICE_API_KEY" ]; then
    echo "❌ VENICE_API_KEY not found in .env file"
    echo ""
    echo "💡 Add to your .env file:"
    echo "   VENICE_API_KEY=your-api-key-here"
    echo ""
    return 1
  fi
  
  # Show partial key for confirmation (first 7 chars)
  local partial_key="${VENICE_API_KEY:0:7}..."
  echo "✅ Environment configured successfully!"
  echo ""
  echo "   🔑 API Key: $partial_key"
  echo ""
  echo "💡 You can now run examples:"
  echo "   ./01-hello-world.sh"
  echo "   ./02-streaming-chat.sh"
  echo "   ./11-vision-multimodal.sh image.jpg"
  echo ""
  
  return 0
}

##############################################################################
# Execution Check
##############################################################################

# Detect if script is being sourced or executed
if [ -n "${BASH_SOURCE[0]}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  echo "❌ Error: This script must be sourced, not executed directly"
  echo ""
  echo "   ✓ Correct:   source ./00-setup-env.sh"
  echo "   ✓ Correct:   . ./00-setup-env.sh"
  echo "   ✗ Incorrect: ./00-setup-env.sh"
  echo ""
  exit 1
fi

# Run main function
main
