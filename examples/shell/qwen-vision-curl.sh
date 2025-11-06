#!/bin/bash

# Simple curl command for using Qwen Vision API
# This script demonstrates how to use the API with proper handling for follow-up questions

# Check if an image file was provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <image_file> [prompt]"
  echo "Example: $0 venice-ai-sdk/sunset.png 'Describe this image'"
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

# Your API key (replace with your actual key)
API_KEY="6EX7ki7GZAtzxnn0D9kkR4KpMpJ_rL9UuSalpfvznl"

# Convert image to base64
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_FILE")

# Create the JSON payload
cat > request.json << EOF
{
  "model": "qwen-2.5-vl",
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
            "url": "data:image/png;base64,$IMAGE_BASE64"
          }
        }
      ]
    }
  ]
}
EOF

# Make the API call
echo "Sending request to Qwen Vision API..."
curl -s -X POST "https://api.venice.ai/api/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d @request.json | jq .choices[0].message.content

echo -e "\nNote: For follow-up questions, you must include the image again in each new request."
echo "Example for a follow-up question:"
echo "curl -X POST \"https://api.venice.ai/api/v1/chat/completions\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer YOUR_API_KEY\" \\"
echo "  -d '{\"model\":\"qwen-2.5-vl\",\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"What colors do you see?\"},
{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:image/png;base64,IMAGE_BASE64\"}}]}]}'"