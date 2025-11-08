#!/bin/bash

##############################################################################
# Streaming Chat - Real-time Token Streaming
#
# Demonstrates how to stream chat completions in real-time using Server-Sent
# Events (SSE). Tokens appear progressively as they're generated, providing
# a more interactive experience for longer responses.
#
# This example shows:
# - Enabling streaming mode with "stream": true
# - Processing Server-Sent Events (SSE) line by line
# - Extracting delta content from streaming chunks
# - Handling the [DONE] termination marker
# - Real-time output without buffering
#
# Prerequisites:
# - curl and jq installed
# - VENICE_API_KEY environment variable set
#
# Run with: ./02-streaming-chat.sh
##############################################################################

# Source shared utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

##############################################################################
# Main
##############################################################################

main() {
  echo "🤖 Streaming a chat response in real-time..."
  echo ""
  
  # Validate API key is set
  require_env VENICE_API_KEY
  
  # Create the streaming chat completion request
  local payload=$(cat <<EOF
{
  "model": "llama-3.3-70b",
  "messages": [
    {
      "role": "user",
      "content": "Explain what makes shell scripting powerful in exactly three compelling points."
    }
  ],
  "stream": true,
  "max_tokens": 200,
  "temperature": 0.7
}
EOF
)
  
  echo "✨ Response:"
  echo ""
  
  # Make the streaming API request and process SSE
  venice_api_request "/api/v1/chat/completions" "$payload" "true" | process_sse_stream
  
  echo ""
  success "Streaming completed!"
  echo ""
  tip "Notice how the text appeared progressively, not all at once"
}

# Run main function
main
