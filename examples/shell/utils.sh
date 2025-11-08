#!/bin/bash

##############################################################################
# Venice AI SDK - Shell Utilities
#
# Shared utilities for shell examples to reduce duplication and ensure
# consistent error handling, validation, and output formatting.
#
# Usage:
#   source "$(dirname "$0")/utils.sh"
#
##############################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

##############################################################################
# Environment & Validation Functions
##############################################################################

# Require environment variable and exit if not set
# Usage: require_env VENICE_API_KEY
require_env() {
  local var_name="$1"
  local var_value="${!var_name}"
  
  if [ -z "$var_value" ]; then
    echo "❌ Error: $var_name environment variable is not set"
    echo "   💡 Tip: Set it with: export $var_name='your-key-here'"
    exit 1
  fi
}

# Check if required commands are available
# Usage: require_commands curl jq
require_commands() {
  local missing=()
  
  for cmd in "$@"; do
    if ! command -v "$cmd" &> /dev/null; then
      missing+=("$cmd")
    fi
  done
  
  if [ ${#missing[@]} -gt 0 ]; then
    echo "❌ Error: Missing required commands: ${missing[*]}"
    echo "   💡 Tip: Install with your package manager"
    echo "      - Debian/Ubuntu: sudo apt-get install ${missing[*]}"
    echo "      - macOS: brew install ${missing[*]}"
    exit 1
  fi
}

# Validate file exists
# Usage: require_file "$IMAGE_PATH"
require_file() {
  local file_path="$1"
  
  if [ ! -f "$file_path" ]; then
    echo "❌ Error: File not found: $file_path"
    exit 1
  fi
}

##############################################################################
# Image Processing Functions
##############################################################################

# Encode image file to base64 (platform-aware)
# Usage: base64_encode "$IMAGE_PATH"
base64_encode() {
  local file_path="$1"
  
  # Detect platform and use appropriate flags
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: no -w flag
    base64 -i "$file_path"
  else
    # Linux: use -w 0 to disable wrapping
    base64 -w 0 "$file_path"
  fi
}

# Detect MIME type from file extension
# Usage: detect_mime_type "$IMAGE_PATH"
detect_mime_type() {
  local file_path="$1"
  local extension="${file_path##*.}"
  
  case "${extension,,}" in
    jpg|jpeg)
      echo "image/jpeg"
      ;;
    png)
      echo "image/png"
      ;;
    gif)
      echo "image/gif"
      ;;
    webp)
      echo "image/webp"
      ;;
    *)
      # Default to JPEG if unknown
      echo "image/jpeg"
      ;;
  esac
}

##############################################################################
# API Request Functions
##############################################################################

# Make a Venice AI API request
# Usage: venice_api_request "/v1/chat/completions" "$JSON_PAYLOAD"
venice_api_request() {
  local endpoint="$1"
  local payload="$2"
  local stream_mode="${3:-false}"
  
  require_env VENICE_API_KEY
  
  local url="https://api.venice.ai${endpoint}"
  
  if [ "$stream_mode" = "true" ]; then
    # Streaming mode: return raw response for caller to process
    curl -s -N -X POST "$url" \
      -H "Authorization: Bearer $VENICE_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$payload"
  else
    # Non-streaming mode: return JSON response
    curl -s -X POST "$url" \
      -H "Authorization: Bearer $VENICE_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$payload"
  fi
}

# Check if API response contains an error
# Usage: check_api_error "$RESPONSE"
check_api_error() {
  local response="$1"
  
  if echo "$response" | jq -e '.error' &> /dev/null; then
    local error_message=$(echo "$response" | jq -r '.error.message // .error')
    local error_type=$(echo "$response" | jq -r '.error.type // "api_error"')
    
    echo "❌ API Error [$error_type]: $error_message"
    
    case "$error_type" in
      "authentication_error"|"invalid_api_key")
        echo "   💡 Tip: Check your VENICE_API_KEY is valid"
        ;;
      "rate_limit_exceeded")
        echo "   💡 Tip: Wait a moment and try again, or upgrade your plan"
        ;;
      "invalid_request_error")
        echo "   💡 Tip: Check your request payload format"
        ;;
    esac
    
    return 1
  fi
  
  return 0
}

##############################################################################
# Output Formatting Functions
##############################################################################

# Format and display a chat completion response
# Usage: display_chat_response "$RESPONSE"
display_chat_response() {
  local response="$1"
  
  if ! check_api_error "$response"; then
    exit 1
  fi
  
  local content=$(echo "$response" | jq -r '.choices[0].message.content // empty')
  
  if [ -z "$content" ]; then
    echo "⚠️  Warning: No content in response"
    echo "   Full response: $response"
    return 1
  fi
  
  echo "✨ Response:"
  echo ""
  echo "$content"
  echo ""
  
  # Display usage info if available
  local prompt_tokens=$(echo "$response" | jq -r '.usage.prompt_tokens // empty')
  local completion_tokens=$(echo "$response" | jq -r '.usage.completion_tokens // empty')
  
  if [ -n "$prompt_tokens" ] && [ -n "$completion_tokens" ]; then
    echo "📊 Usage: $prompt_tokens prompt + $completion_tokens completion = $((prompt_tokens + completion_tokens)) total tokens"
  fi
}

# Process a streaming SSE response
# Usage: cat stream_output.txt | process_sse_stream
process_sse_stream() {
  while IFS= read -r line; do
    # Skip empty lines
    [ -z "$line" ] && continue
    
    # Remove "data: " prefix
    local data="${line#data: }"
    
    # Check for [DONE] marker
    if [ "$data" = "[DONE]" ]; then
      echo ""
      return 0
    fi
    
    # Extract and print delta content
    local delta=$(echo "$data" | jq -r '.choices[0].delta.content // empty' 2>/dev/null)
    if [ -n "$delta" ] && [ "$delta" != "null" ]; then
      printf "%s" "$delta"
    fi
  done
}

# Save JSON to file with pretty formatting
# Usage: save_json "$JSON_CONTENT" "request.json"
save_json() {
  local json_content="$1"
  local file_path="$2"
  
  echo "$json_content" | jq '.' > "$file_path" 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "📁 Saved to: $(realpath "$file_path")"
  else
    # If jq fails, save raw content
    echo "$json_content" > "$file_path"
    echo "📁 Saved to: $(realpath "$file_path")"
  fi
}

##############################################################################
# Progress Indicators
##############################################################################

# Show a step message
# Usage: step "Encoding image..."
step() {
  echo "🔧 $1"
}

# Show a success message
# Usage: success "Request completed"
success() {
  echo "✅ $1"
}

# Show an error message
# Usage: error "Failed to process"
error() {
  echo "❌ $1"
}

# Show a tip message
# Usage: tip "Try using a smaller image"
tip() {
  echo "💡 Tip: $1"
}

##############################################################################
# Initialization
##############################################################################

# Auto-check for common dependencies when sourced
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  # Script is being sourced, perform basic checks
  require_commands curl jq
fi
