---
layout: default
title: Venice AI SDK - CLI Documentation
---

# Command Line Interface (CLI)

The Venice AI SDK includes a powerful command-line interface that allows you to interact with the Venice AI API directly from your terminal. This makes it easy to test API functionality, automate tasks, and integrate with other command-line tools.

## Installation

To use the CLI, you need to install the Venice AI SDK globally:

```bash
npm install -g venice-dev-tools
```

After installation, you can access the CLI using the `venice` command.

## Configuration

Before using the CLI, you need to configure your API key:

```bash
venice configure
```

This command will prompt you to enter your Venice AI API key, which will be securely stored in your user configuration.

## Available Commands

### Chat Completions

Generate text responses from the Venice AI models:

```bash
venice chat "Tell me about artificial intelligence"
```

#### Options:

- `--model <model>` - Specify the model to use (default: llama-3.3-70b)
- `--web-search` - Enable web search for up-to-date information
- `--stream` - Stream the response as it's generated
- `--raw` - Output the raw JSON response

### Image Generation

Create images using Venice AI's image generation models:

```bash
venice generate-image "A beautiful sunset over mountains"
```

#### Options:

- `--model <model>` - Specify the model to use (default: fluently-xl)
- `--style <style>` - Specify the style preset (e.g., "Photographic", "3D Model", "Digital Art")
- `--width <width>` - Specify the width of the generated image
- `--height <height>` - Specify the height of the generated image
- `--output <filename>` - Save the image to a file
- `--raw` - Output the raw JSON response

### Image Upscaling

Enhance the resolution of existing images:

```bash
venice upscale-image path/to/image.jpg
```

#### Options:

- `--output <filename>` - Save the upscaled image to a file
- `--raw` - Output the raw JSON response

### List Models

List available models and their capabilities:

```bash
venice list-models
```

#### Options:

- `--raw` - Output the raw JSON response

### List Image Styles

List available image generation styles:

```bash
venice list-styles
```

#### Options:

- `--raw` - Output the raw JSON response

### API Key Management

Manage your Venice AI API keys:

```bash
venice list-keys
venice create-key --name "My New Key"
venice delete-key <key-id>
venice rate-limits
```

## Advanced Usage

### Piping and Redirection

The CLI supports standard Unix-style piping and redirection:

```bash
# Save chat response to a file
venice chat "Write a poem about the ocean" > ocean-poem.txt

# Use the output of one command as input to another
echo "Explain quantum computing" | venice chat

# Process JSON output with jq
venice list-models --raw | jq '.data[0].id'
```

### Scripting

You can easily use the CLI in shell scripts:

```bash
#!/bin/bash

# Generate an image and save it
venice generate-image "A futuristic cityscape" --output city.png

# Generate a description of the image
venice chat "Describe this futuristic cityscape in detail" > description.txt

# Combine the image and description
echo "Image and description generated successfully!"
```

### Environment Variables

You can use environment variables instead of the configuration file:

```bash
VENICE_API_KEY=your-api-key venice chat "Hello, world!"
```

## Examples

### Generate a chat completion with web search

```bash
venice chat "What's happening in the world today?" --web-search
```

### Generate an image with specific parameters

```bash
venice generate-image "A futuristic city" --model fluently-xl --style "3D Model" --width 1024 --height 768 --output future-city.png
```

### List all available models and filter by type

```bash
venice list-models --raw | jq '.data[] | select(.type=="chat")'
```

## Troubleshooting

### API Key Issues

If you encounter authentication errors, ensure your API key is correctly configured:

```bash
venice configure
```

### Rate Limiting

If you hit rate limits, you can check your current usage:

```bash
venice rate-limits
```

### Verbose Mode

For more detailed output to help diagnose issues:

```bash
venice chat "Hello" --verbose
```

## Further Resources

- [Venice AI API Documentation](https://docs.venice.ai)
- [SDK Documentation](/venice-dev-tools/)
- [GitHub Repository](https://github.com/georgeglarson/venice-dev-tools)