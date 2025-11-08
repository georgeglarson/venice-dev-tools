#!/bin/bash

##############################################################################
# Models List - Query Available AI Models
#
# Demonstrates how to retrieve the list of available models from the Venice AI
# API. This is useful for discovering which models you have access to and their
# capabilities.
#
# This example shows:
# - Fetching available models from the API
# - Parsing and displaying model information
# - Filtering and formatting model details
# - Understanding model capabilities and ownership
#
# Prerequisites:
# - curl and jq installed
# - VENICE_API_KEY environment variable set
#
# Run with: ./09-models-list.sh
##############################################################################

# Source shared utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

##############################################################################
# Configuration
##############################################################################

FILTER="${1:-}"
SHOW_DETAILS="${2:-false}"

##############################################################################
# Main
##############################################################################

main() {
  echo "🤖 Fetching available models from Venice AI..."
  echo ""
  
  # Validate API key is set
  require_env VENICE_API_KEY
  
  # Make the API request
  local response=$(curl -s -X GET "https://api.venice.ai/api/v1/models" \
    -H "Authorization: Bearer $VENICE_API_KEY" \
    -H "Content-Type: application/json")
  
  # Check for errors
  if ! check_api_error "$response"; then
    exit 1
  fi
  
  # Extract model data
  local models=$(echo "$response" | jq -r '.data')
  
  if [ -z "$models" ] || [ "$models" = "null" ]; then
    error "No models found in response"
    exit 1
  fi
  
  # Count total models
  local total=$(echo "$models" | jq 'length')
  
  if [ -n "$FILTER" ]; then
    echo "📋 Models matching '$FILTER': "
    echo ""
    
    # Filter and display matching models
    echo "$models" | jq -r --arg filter "$FILTER" '
      .[] | select(.id | contains($filter)) | 
      "   • \(.id)" + 
      (if .owned_by and .owned_by != "" then " (by \(.owned_by))" else "" end)
    '
    
    local filtered_count=$(echo "$models" | jq --arg filter "$FILTER" '[.[] | select(.id | contains($filter))] | length')
    echo ""
    echo "   Found $filtered_count of $total total models"
  else
    echo "📋 Available Models ($total total):"
    echo ""
    
    if [ "$SHOW_DETAILS" = "true" ] || [ "$SHOW_DETAILS" = "--details" ]; then
      # Show detailed information
      echo "$models" | jq -r '.[] | 
        "   ┌─ \(.id)",
        "   │  Owner: \(.owned_by // "N/A")",
        "   │  Created: \(.created // "N/A" | tostring)",
        "   │  Object: \(.object // "N/A")",
        "   └─"
      '
    else
      # Simple list
      echo "$models" | jq -r '.[] | "   • \(.id)"'
    fi
  fi
  
  echo ""
  success "Retrieved models successfully!"
  echo ""
  tip "Filter models with: $0 'llama'"
  tip "Show details with: $0 '' --details"
}

##############################################################################
# Help Text
##############################################################################

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  echo "Usage: $0 [filter] [--details]"
  echo ""
  echo "Arguments:"
  echo "  filter    Optional: Filter models by name (substring match)"
  echo "  --details Show detailed model information"
  echo ""
  echo "Examples:"
  echo "  $0                  # List all models"
  echo "  $0 'llama'          # List models containing 'llama'"
  echo "  $0 '' --details     # Show detailed info for all models"
  echo "  $0 'gpt' --details  # Show details for GPT models"
  exit 0
fi

# Run main function
main
