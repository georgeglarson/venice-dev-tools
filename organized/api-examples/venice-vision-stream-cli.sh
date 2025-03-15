#!/bin/bash

# This script demonstrates how to use curl to directly call the Venice AI API with Qwen Vision model
# It takes an image file as input and sends it to the API for analysis with streaming enabled

# Check if an image file was provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <image_file> [prompt]"
  echo "Example: $0 sunset.png 'Describe this image in detail'"
  exit 1
fi

# Get the image file path
IMAGE_FILE="$1"

# Get the prompt or use a default
PROMPT="${2:-Describe this image in detail}"

# Check if the image file exists
if [ ! -f "$IMAGE_FILE" ]; then
  echo "Error: Image file '$IMAGE_FILE' not found"
  exit 1
fi

# Your API key (replace with your actual key or pass as environment variable)
API_KEY="${VENICE_API_KEY:-6EX7ki7GZAtzxnn0D9kkR4KpMpJ_rL9UuSalpfvznl}"

# Convert image to base64
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_FILE")

# Create the JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "model": "qwen-2.5-vl",
  "stream": true,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "$PROMPT"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,$IMAGE_BASE64"
          }
        }
      ]
    }
  ]
}
EOF
)

# Save the request to a file for reference
echo "$JSON_PAYLOAD" > qwen_stream_request.json

# Make the API call
echo "Sending streaming request to Venice AI API..."
curl -s -X POST "https://api.venice.ai/api/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d @qwen_stream_request.json | while read -r line; do
    # Skip empty lines
    [ -z "$line" ] && continue
    
    # Remove "data: " prefix if present
    line=${line#data: }
    
    # Skip [DONE] marker
    [ "$line" = "[DONE]" ] && continue
    
    # Try to parse JSON and extract content
    if echo "$line" | jq -e . > /dev/null 2>&1; then
      content=$(echo "$line" | jq -r '.choices[0].delta.content // empty')
      if [ -n "$content" ]; then
        printf "%s" "$content"
      fi
    else
      echo "Error parsing: $line" >&2
    fi
done

echo -e "\n\nStreaming complete"