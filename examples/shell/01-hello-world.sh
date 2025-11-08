#!/bin/bash

##############################################################################
# Hello World - Basic Chat Completion
#
# The simplest possible example of using the Venice AI API with curl.
# Demonstrates how to send a chat message and receive a response.
#
# This example shows:
# - API key authentication via environment variable
# - Basic JSON payload structure for chat completions
# - Response parsing with jq
# - Error handling and helpful messages
#
# Prerequisites:
# - curl and jq installed
# - VENICE_API_KEY environment variable set
#
# Run with: ./01-hello-world.sh
##############################################################################

# Source shared utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

##############################################################################
# Main
##############################################################################

main() {
  echo "🤖 Sending a simple chat message to Venice AI..."
  echo ""
  
  # Validate API key is set
  require_env VENICE_API_KEY
  
  # Create the chat completion request
  local payload=$(cat <<EOF
{
  "model": "llama-3.3-70b",
  "messages": [
    {
      "role": "user",
      "content": "Write a haiku about coding in the shell"
    }
  ],
  "max_tokens": 100,
  "temperature": 0.7
}
EOF
)
  
  # Make the API request
  local response=$(venice_api_request "/api/v1/chat/completions" "$payload")
  
  # Display the response
  display_chat_response "$response"
  
  success "Request completed successfully!"
  echo ""
  tip "Try changing the prompt or model in the script to experiment"
}

# Run main function
main
