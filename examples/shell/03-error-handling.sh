#!/bin/bash

##############################################################################
# Error Handling - Robust API Error Management
#
# Demonstrates comprehensive error handling patterns for Venice AI API calls.
# Shows how to detect, parse, and respond to different types of API errors
# with helpful user guidance.
#
# This example shows:
# - Authentication errors (invalid/missing API key)
# - Rate limit errors
# - Invalid request errors
# - Network/connectivity errors
# - Graceful error messages with actionable tips
# - HTTP status code checking
#
# Prerequisites:
# - curl and jq installed
# - VENICE_API_KEY environment variable set (or intentionally unset to test)
#
# Run with: ./03-error-handling.sh
##############################################################################

# Source shared utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

##############################################################################
# Demo Functions
##############################################################################

demo_auth_error() {
  echo "📋 Test 1: Authentication Error (invalid API key)"
  echo "   Simulating an invalid API key..."
  echo ""
  
  local payload=$(cat <<EOF
{
  "model": "llama-3.3-70b",
  "messages": [{"role": "user", "content": "Hello"}]
}
EOF
)
  
  local response=$(curl -s -X POST "https://api.venice.ai/api/v1/chat/completions" \
    -H "Authorization: Bearer invalid-key-12345" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  if ! check_api_error "$response"; then
    echo ""
  fi
  
  echo "──────────────────────────────────────────────────────────────"
  echo ""
}

demo_invalid_request() {
  echo "📋 Test 2: Invalid Request Error (missing required field)"
  echo "   Sending a request without required 'messages' field..."
  echo ""
  
  require_env VENICE_API_KEY
  
  local payload=$(cat <<EOF
{
  "model": "llama-3.3-70b"
}
EOF
)
  
  local response=$(venice_api_request "/api/v1/chat/completions" "$payload")
  
  if ! check_api_error "$response"; then
    echo ""
  fi
  
  echo "──────────────────────────────────────────────────────────────"
  echo ""
}

demo_network_error() {
  echo "📋 Test 3: Network Error (invalid endpoint)"
  echo "   Attempting to connect to a non-existent endpoint..."
  echo ""
  
  local response=$(curl -s --max-time 5 -X POST "https://api.venice.ai/api/v1/nonexistent" \
    -H "Authorization: Bearer $VENICE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"test": true}')
  
  if [ -z "$response" ]; then
    echo "❌ Network Error: No response received (timeout or connection failed)"
    echo "   💡 Tip: Check your internet connection and the API endpoint URL"
  else
    check_api_error "$response" || true
  fi
  
  echo ""
  echo "──────────────────────────────────────────────────────────────"
  echo ""
}

demo_successful_request() {
  echo "📋 Test 4: Successful Request (for comparison)"
  echo "   Making a valid request with proper error handling..."
  echo ""
  
  require_env VENICE_API_KEY
  
  local payload=$(cat <<EOF
{
  "model": "llama-3.3-70b",
  "messages": [
    {
      "role": "user",
      "content": "Say 'Hello, Shell!' and nothing else."
    }
  ],
  "max_tokens": 20
}
EOF
)
  
  local response=$(venice_api_request "/api/v1/chat/completions" "$payload")
  
  if check_api_error "$response"; then
    local content=$(echo "$response" | jq -r '.choices[0].message.content')
    echo "✨ Response: $content"
    success "Request succeeded!"
  fi
  
  echo ""
  echo "──────────────────────────────────────────────────────────────"
  echo ""
}

##############################################################################
# Main
##############################################################################

main() {
  echo "🔍 Error Handling Demonstration"
  echo ""
  echo "This example demonstrates various error scenarios and how to"
  echo "handle them gracefully with helpful user guidance."
  echo ""
  echo "══════════════════════════════════════════════════════════════"
  echo ""
  
  demo_auth_error
  demo_invalid_request
  demo_network_error
  demo_successful_request
  
  echo "🎓 Summary:"
  echo ""
  echo "   Key error handling principles:"
  echo "   • Always validate API responses before using them"
  echo "   • Check for error fields in JSON responses"
  echo "   • Provide actionable tips for common errors"
  echo "   • Handle network failures gracefully"
  echo "   • Use appropriate exit codes for automation"
  echo ""
  tip "The check_api_error function in utils.sh handles most of this automatically"
}

# Run main function (but don't exit on errors in this demo)
main
