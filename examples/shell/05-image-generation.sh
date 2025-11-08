#!/bin/bash

##############################################################################
# Image Generation - Create Images from Text Prompts
#
# Demonstrates how to generate images using the Venice AI image generation API.
# The API returns a base64-encoded image which is saved to disk.
#
# This example shows:
# - Image generation API endpoint and parameters
# - Base64 image decoding and file saving
# - Response validation and error handling
# - Customizable size, quality, and style parameters
# - Output path resolution and user feedback
#
# Prerequisites:
# - curl, jq, and base64 installed
# - VENICE_API_KEY environment variable set
#
# Run with: ./05-image-generation.sh
##############################################################################

# Source shared utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

##############################################################################
# Configuration
##############################################################################

PROMPT="${1:-A majestic mountain landscape at sunset, with snow-capped peaks glowing in golden light, painted in the style of Albert Bierstadt}"
OUTPUT_FILE="${2:-generated-image.png}"
SIZE="${3:-1024x1024}"
QUALITY="${4:-standard}"

##############################################################################
# Main
##############################################################################

main() {
  echo "🎨 Generating image with Venice AI..."
  echo ""
  echo "   📝 Prompt: $PROMPT"
  echo "   📐 Size: $SIZE"
  echo "   ✨ Quality: $QUALITY"
  echo ""
  
  # Validate API key is set
  require_env VENICE_API_KEY
  
  step "Sending image generation request..."
  
  # Create the image generation request
  local payload=$(cat <<EOF
{
  "prompt": "$PROMPT",
  "n": 1,
  "size": "$SIZE",
  "quality": "$QUALITY",
  "response_format": "b64_json"
}
EOF
)
  
  # Make the API request
  local response=$(venice_api_request "/api/v1/images/generations" "$payload")
  
  # Check for errors
  if ! check_api_error "$response"; then
    exit 1
  fi
  
  # Extract the base64 image data
  local b64_image=$(echo "$response" | jq -r '.data[0].b64_json // empty')
  
  if [ -z "$b64_image" ]; then
    error "No image data in response"
    echo "   Response structure:"
    echo "$response" | jq '.'
    exit 1
  fi
  
  step "Decoding and saving image..."
  
  # Decode base64 and save to file
  echo "$b64_image" | base64 -d > "$OUTPUT_FILE"
  
  if [ $? -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    local file_size=$(du -h "$OUTPUT_FILE" | cut -f1)
    local full_path=$(realpath "$OUTPUT_FILE")
    
    echo ""
    success "Image generated successfully!"
    echo ""
    echo "   📁 File: $OUTPUT_FILE"
    echo "   📍 Path: $full_path"
    echo "   💾 Size: $file_size"
    echo ""
    tip "Open the image with: xdg-open '$OUTPUT_FILE' (Linux) or open '$OUTPUT_FILE' (macOS)"
  else
    error "Failed to save image to $OUTPUT_FILE"
    exit 1
  fi
  
  # Display usage info if available
  local revised_prompt=$(echo "$response" | jq -r '.data[0].revised_prompt // empty')
  if [ -n "$revised_prompt" ] && [ "$revised_prompt" != "$PROMPT" ]; then
    echo ""
    echo "   🔄 Revised prompt: $revised_prompt"
  fi
}

##############################################################################
# Help Text
##############################################################################

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  echo "Usage: $0 [prompt] [output_file] [size] [quality]"
  echo ""
  echo "Arguments:"
  echo "  prompt       Text description of the image (default: mountain landscape)"
  echo "  output_file  Path to save the image (default: generated-image.png)"
  echo "  size         Image dimensions (default: 1024x1024)"
  echo "               Options: 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792"
  echo "  quality      Image quality (default: standard)"
  echo "               Options: standard, hd"
  echo ""
  echo "Examples:"
  echo "  $0"
  echo "  $0 'A cyberpunk city at night'"
  echo "  $0 'A serene forest' forest.png 1024x1024 hd"
  exit 0
fi

# Run main function
main
