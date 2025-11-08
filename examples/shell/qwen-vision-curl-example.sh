#!/bin/bash

##############################################################################
# LEGACY: Qwen Vision Example
#
# ⚠️  This is a legacy example. For new projects, use:
#    ./11-vision-multimodal.sh
#
# This script demonstrates how to use curl to call the Qwen Vision API
# with proper handling for follow-up messages.
##############################################################################

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

# Your API key (must be set as environment variable)
if [ -z "$VENICE_API_KEY" ]; then
  echo "Error: VENICE_API_KEY environment variable not set"
  echo "Get your API key at: https://venice.ai/settings/api"
  echo ""
  echo "Set it with: export VENICE_API_KEY=\"your-api-key-here\""
  exit 1
fi
API_KEY="$VENICE_API_KEY"

# Convert image to base64
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_FILE")

# Determine MIME type based on file extension
if [[ "$IMAGE_FILE" == *.png ]]; then
  MIME_TYPE="image/png"
elif [[ "$IMAGE_FILE" == *.jpg || "$IMAGE_FILE" == *.jpeg ]]; then
  MIME_TYPE="image/jpeg"
else
  MIME_TYPE="image/jpeg"  # Default to JPEG
fi

# Create the JSON payload
JSON_PAYLOAD=$(cat <<EOF
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
            "url": "data:$MIME_TYPE;base64,$IMAGE_BASE64"
          }
        }
      ]
    }
  ]
}
EOF
)

# Save the request to a file for reference
echo "$JSON_PAYLOAD" > qwen_request.json

# Make the API call
echo "Sending request to Qwen Vision API..."
RESPONSE=$(curl -s -X POST "https://api.venice.ai/api/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d @qwen_request.json)

# Check for errors
if echo "$RESPONSE" | grep -q "error"; then
  echo "Error response:"
  echo "$RESPONSE" | jq .
  exit 1
fi

# Display the response
echo "Response:"
CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content')
echo "$CONTENT"

# Ask if the user wants to ask a follow-up question
echo -e "\nWould you like to ask a follow-up question? (y/n)"
read -r ANSWER

if [[ "$ANSWER" == "y" || "$ANSWER" == "Y" ]]; then
  echo "Enter your follow-up question:"
  read -r FOLLOWUP_PROMPT
  
  echo "Sending follow-up request..."
  
  # IMPORTANT: For follow-up questions, we must include the image again
  # The API requires that any image must be in the last message
  FOLLOWUP_PAYLOAD=$(cat <<EOF
{
  "model": "qwen-2.5-vl",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "$FOLLOWUP_PROMPT"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:$MIME_TYPE;base64,$IMAGE_BASE64"
          }
        }
      ]
    }
  ]
}
EOF
)

  # Save the follow-up request to a file for reference
  echo "$FOLLOWUP_PAYLOAD" > qwen_followup_request.json

  # Make the follow-up API call
  FOLLOWUP_RESPONSE=$(curl -s -X POST "https://api.venice.ai/api/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d @qwen_followup_request.json)

  # Check for errors
  if echo "$FOLLOWUP_RESPONSE" | grep -q "error"; then
    echo "Error response:"
    echo "$FOLLOWUP_RESPONSE" | jq .
    exit 1
  fi

  # Display the follow-up response
  echo "Follow-up response:"
  FOLLOWUP_CONTENT=$(echo "$FOLLOWUP_RESPONSE" | jq -r '.choices[0].message.content')
  echo "$FOLLOWUP_CONTENT"
fi

echo -e "\nNote: The Qwen Vision API has a limitation where 'Only one image URL is allowed and it must be in the last message.'"
echo "This means that for follow-up questions, you must include the image again in each new request."