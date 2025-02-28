---
layout: default
title: Venice AI SDK - Command Line Interface
---

# Command Line Interface (CLI)

The Venice AI SDK includes a powerful command-line interface that allows you to interact with the Venice AI API directly from your terminal. This makes it easy to test API functionality, automate tasks, and integrate Venice AI capabilities into your scripts and workflows.

## Installation

Install the Venice AI SDK globally to use the CLI:

```bash
# Install globally
npm install -g venice-dev-tools
```

## Configuration

Before using the CLI, you need to configure your API key:

```bash
# Configure your API key
venice configure
```

This will prompt you to enter your Venice AI API key, which will be stored securely in your home directory.

Alternatively, you can set the API key as an environment variable:

```bash
# Set API key as environment variable
export VENICE_API_KEY=your-api-key
```

## Available Commands

| Command | Description |
|---------|-------------|
| `venice configure` | Configure your Venice API key |
| `venice chat <prompt>` | Generate a chat completion |
| `venice generate-image <prompt>` | Generate an image |
| `venice list-models` | List available models |
| `venice list-styles` | List available image styles |
| `venice list-keys` | List your API keys |
| `venice create-key` | Create a new API key |
| `venice delete-key` | Delete an API key |
| `venice rate-limits` | Get rate limits for your API key |

## Chat Completions

Generate text responses using the chat command:

```bash
# Basic chat completion
venice chat "Tell me about AI"

# Chat with web search enabled
venice chat "What are the latest developments in AI?" --web-search

# Specify a different model
venice chat "Explain quantum computing" --model llama-3.3-8b

# Add a system message
venice chat "Write a poem about the ocean" --system "You are a poetic assistant"
```

## Image Generation

Generate images using the generate-image command:

```bash
# Basic image generation
venice generate-image "A beautiful sunset over mountains"

# Specify image parameters
venice generate-image "A futuristic city" --model fluently-xl --style "3D Model" --width 1024 --height 768

# Add a negative prompt
venice generate-image "A cat wearing sunglasses" --negative "blurry, distorted, low quality"

# Save the image to a file
venice generate-image "A serene lake" --output lake.png
```

## Managing API Keys

List, create, and delete API keys:

```bash
# List all your API keys
venice list-keys

# Create a new API key
venice create-key --name "My CLI Key"

# Delete an API key
venice delete-key --id "key-id"
```

## Viewing Models and Styles

Get information about available models and image styles:

```bash
# List all available models
venice list-models

# List all available image styles
venice list-styles
```

## Rate Limits

Check your API key's rate limits:

```bash
# Get rate limits for all models
venice rate-limits

# Get rate limits for a specific model
venice rate-limits --model llama-3.3-70b
```

## Advanced Usage

### Debug Mode

Enable debug mode to see detailed request and response information:

```bash
# Enable debug mode for any command
venice list-keys --debug
venice chat "Hello" --debug
```

### Raw JSON Output

Get raw JSON output for scripting and automation:

```bash
# Get raw JSON output
venice list-styles --raw
venice list-models --raw > models.json
venice chat "Hello" --raw | jq .choices[0].message.content
```

### Help

Get help for any command:

```bash
# Get general help
venice --help

# Get help for a specific command
venice chat --help
venice generate-image --help
```

## Programmatic CLI Usage

You can also use the CLI commands programmatically in your JavaScript code:

```javascript
import { VeniceAI } from 'venice-dev-tools';

const venice = new VeniceAI({ apiKey: 'your-api-key' });

// Use CLI-style commands in your code
async function main() {
  try {
    // Chat with web search
    const response = await venice.cli('chat "Tell me about AI" --web-search');
    console.log(response);
    
    // Generate an image
    const image = await venice.cli('generate-image "A beautiful sunset" --style Photographic --output sunset.png');
    console.log(`Image saved to: ${image.savedTo}`);
    
    // List models with options
    const models = await venice.cli('list-models', {
      limit: 5,
      raw: true
    });
    console.log(`Found ${models.data.length} models`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Examples

Here are some real-world examples of using the Venice AI CLI:

### Creating a Simple Chat Bot

```bash
#!/bin/bash
# Simple chat bot using Venice AI CLI

echo "Venice AI Chat Bot"
echo "Type 'exit' to quit"

while true; do
  echo -n "> "
  read prompt
  
  if [ "$prompt" = "exit" ]; then
    break
  fi
  
  venice chat "$prompt"
  echo ""
done
```

### Batch Image Generation

```bash
#!/bin/bash
# Generate multiple images from a list of prompts

prompts_file="prompts.txt"
output_dir="generated_images"

mkdir -p "$output_dir"

while IFS= read -r prompt; do
  # Create a filename from the prompt
  filename=$(echo "$prompt" | tr ' ' '_' | tr -cd '[:alnum:]_-' | tr '[:upper:]' '[:lower:]').png
  
  echo "Generating image for: $prompt"
  venice generate-image "$prompt" --output "$output_dir/$filename"
  
  # Wait a bit between requests to avoid rate limiting
  sleep 2
done < "$prompts_file"

echo "All images generated in $output_dir"
```

### Automated API Key Rotation

```bash
#!/bin/bash
# Rotate API keys automatically

# Get current date for naming
current_date=$(date +"%Y-%m-%d")

# Create a new key
echo "Creating new API key..."
new_key_json=$(venice create-key --name "Auto-generated $current_date" --raw)

# Extract the key ID and value using jq (you need to install jq)
new_key_id=$(echo $new_key_json | jq -r '.key.id')
new_key_value=$(echo $new_key_json | jq -r '.key.key')

# Save the new key to a file
echo "Saving new key to keys.txt..."
echo "$current_date: $new_key_value" >> keys.txt

# Update the environment variable or configuration
echo "Updating configuration..."
venice configure <<< "$new_key_value"

echo "API key rotation complete. New key ID: $new_key_id"
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Make sure your API key is correctly configured:
   ```bash
   venice configure
   ```

2. Check that your API key is valid by listing your keys:
   ```bash
   venice list-keys
   ```

3. Try setting the API key as an environment variable:
   ```bash
   export VENICE_API_KEY=your-api-key
   ```

### Rate Limiting

If you encounter rate limit errors:

1. Check your current rate limits:
   ```bash
   venice rate-limits
   ```

2. Add delays between requests in scripts
3. Consider upgrading to a higher tier if you need more requests

### Command Not Found

If you get a "command not found" error:

1. Make sure the package is installed globally:
   ```bash
   npm install -g venice-dev-tools
   ```

2. Check that the global npm bin directory is in your PATH
3. Try using npx:
   ```bash
   npx venice-dev-tools chat "Hello"