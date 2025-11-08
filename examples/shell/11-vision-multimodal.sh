#!/bin/bash

##############################################################################
# Vision Multimodal - Image Analysis and Understanding
#
# Demonstrates comprehensive vision capabilities using the Venice AI multimodal
# API. Supports both single-shot image analysis and interactive follow-up
# questions, with both streaming and non-streaming modes.
#
# This example shows:
# - Image encoding and MIME type detection
# - Multimodal message structure (text + image)
# - Single-shot and conversational image analysis
# - Streaming and non-streaming response modes
# - Interactive follow-up question flow
# - Proper conversation context management
#
# Prerequisites:
# - curl, jq, and base64 installed
# - VENICE_API_KEY environment variable set
# - An image file to analyze
#
# Run with: ./11-vision-multimodal.sh <image_file> [prompt]
##############################################################################

# Source shared utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

##############################################################################
# Configuration
##############################################################################

STREAMING_MODE="${STREAMING_MODE:-false}"
MODEL="qwen-2.5-vl"

##############################################################################
# Functions
##############################################################################

create_vision_payload() {
  local image_base64="$1"
  local mime_type="$2"
  local prompt="$3"
  local include_history="${4:-false}"
  
  if [ "$include_history" = "true" ] && [ -n "$CONVERSATION_HISTORY" ]; then
    # Include previous conversation context
    cat <<EOF
{
  "model": "$MODEL",
  "messages": $CONVERSATION_HISTORY,
  "stream": $STREAMING_MODE
}
EOF
  else
    # First message with image
    cat <<EOF
{
  "model": "$MODEL",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "$prompt"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:$mime_type;base64,$image_base64"
          }
        }
      ]
    }
  ],
  "stream": $STREAMING_MODE
}
EOF
  fi
}

add_followup_question() {
  local question="$1"
  local image_base64="$2"
  local mime_type="$3"
  
  # Create new message with question and image
  local new_message=$(cat <<EOF
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "$question"
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "data:$mime_type;base64,$image_base64"
      }
    }
  ]
}
EOF
)
  
  # Add to conversation history
  CONVERSATION_HISTORY=$(echo "$CONVERSATION_HISTORY" | jq --argjson msg "$new_message" '. += [$msg]')
}

add_assistant_response() {
  local content="$1"
  
  # Escape content for JSON
  local escaped_content=$(echo "$content" | jq -R -s '.')
  
  # Create assistant message
  local assistant_message=$(cat <<EOF
{
  "role": "assistant",
  "content": $escaped_content
}
EOF
)
  
  # Add to conversation history
  CONVERSATION_HISTORY=$(echo "$CONVERSATION_HISTORY" | jq --argjson msg "$assistant_message" '. += [$msg]')
}

##############################################################################
# Main
##############################################################################

main() {
  # Parse arguments
  if [ $# -lt 1 ]; then
    echo "Usage: $0 <image_file> [prompt]"
    echo ""
    echo "Arguments:"
    echo "  image_file  Path to image file (jpg, png, gif, webp)"
    echo "  prompt      Optional description prompt (default: 'Describe this image in detail')"
    echo ""
    echo "Environment variables:"
    echo "  STREAMING_MODE  Set to 'true' for streaming responses (default: false)"
    echo ""
    echo "Examples:"
    echo "  $0 photo.jpg"
    echo "  $0 photo.jpg 'What objects do you see?'"
    echo "  STREAMING_MODE=true $0 photo.jpg"
    exit 1
  fi
  
  local image_file="$1"
  local initial_prompt="${2:-Describe this image in detail}"
  
  # Validate file exists
  require_file "$image_file"
  
  echo "🔍 Analyzing image with Venice AI Vision..."
  echo ""
  echo "   📷 Image: $image_file"
  echo "   🤖 Model: $MODEL"
  echo "   📡 Mode: $([ "$STREAMING_MODE" = "true" ] && echo "Streaming" || echo "Non-streaming")"
  echo ""
  
  # Validate API key
  require_env VENICE_API_KEY
  
  step "Encoding image..."
  
  # Encode image and detect MIME type
  local image_base64=$(base64_encode "$image_file")
  local mime_type=$(detect_mime_type "$image_file")
  
  echo "   ✓ MIME type: $mime_type"
  echo ""
  
  # Initialize conversation history
  CONVERSATION_HISTORY='[]'
  
  # Create initial message and add to history
  local initial_message=$(cat <<EOF
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "$initial_prompt"
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "data:$mime_type;base64,$image_base64"
      }
    }
  ]
}
EOF
)
  
  CONVERSATION_HISTORY=$(echo "$CONVERSATION_HISTORY" | jq --argjson msg "$initial_message" '. += [$msg]')
  
  echo "📝 Prompt: $initial_prompt"
  echo ""
  
  step "Requesting vision analysis..."
  echo ""
  
  # Create and send initial request
  local payload=$(create_vision_payload "$image_base64" "$mime_type" "$initial_prompt" "true")
  
  if [ "$STREAMING_MODE" = "true" ]; then
    echo "✨ Response:"
    echo ""
    local response_content=$(venice_api_request "/api/v1/chat/completions" "$payload" "true" | tee /dev/stderr | process_sse_stream)
    echo ""
  else
    local response=$(venice_api_request "/api/v1/chat/completions" "$payload")
    
    if ! check_api_error "$response"; then
      exit 1
    fi
    
    local response_content=$(echo "$response" | jq -r '.choices[0].message.content')
    
    echo "✨ Response:"
    echo ""
    echo "$response_content"
    echo ""
  fi
  
  # Add assistant response to history
  add_assistant_response "$response_content"
  
  success "Analysis completed!"
  echo ""
  
  # Interactive follow-up questions
  echo "💬 Ask follow-up questions (or press Enter to exit)"
  echo ""
  
  while true; do
    echo -n "   ❓ Your question: "
    read -r followup_question
    
    # Exit if empty
    [ -z "$followup_question" ] && break
    
    echo ""
    step "Processing follow-up question..."
    echo ""
    
    # Add follow-up to conversation
    add_followup_question "$followup_question" "$image_base64" "$mime_type"
    
    # Create request with full conversation history
    payload=$(cat <<EOF
{
  "model": "$MODEL",
  "messages": $CONVERSATION_HISTORY,
  "stream": $STREAMING_MODE
}
EOF
)
    
    if [ "$STREAMING_MODE" = "true" ]; then
      echo "✨ Response:"
      echo ""
      response_content=$(venice_api_request "/api/v1/chat/completions" "$payload" "true" | process_sse_stream)
      echo ""
    else
      response=$(venice_api_request "/api/v1/chat/completions" "$payload")
      
      if ! check_api_error "$response"; then
        echo ""
        continue
      fi
      
      response_content=$(echo "$response" | jq -r '.choices[0].message.content')
      
      echo "✨ Response:"
      echo ""
      echo "$response_content"
      echo ""
    fi
    
    # Add assistant response to history
    add_assistant_response "$response_content"
    
    echo ""
  done
  
  echo ""
  success "Vision conversation ended"
  echo ""
  tip "The model maintains context across questions about the same image"
  tip "Set STREAMING_MODE=true for real-time streaming responses"
}

# Run main function
main "$@"
