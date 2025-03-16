---
layout: default
title: Venice Dev Tools CLI Reference | Command Line Interface Guide
description: "Complete reference for the Venice Dev Tools CLI. Learn how to use the command line interface for chat completions, image generation, PDF processing, and more."
keywords: "Venice Dev Tools CLI, Venice AI command line, chat CLI, image generation CLI, PDF processing CLI"
---

# Venice Dev Tools CLI Reference

The Venice Dev Tools CLI provides a convenient command-line interface for interacting with the Venice AI API. This allows you to quickly generate text, create images, and manage your API keys directly from your terminal.

## Installation

Install the CLI globally using npm:

```bash
npm install -g venice-dev-tools
```

## Configuration

Before using the CLI, you need to configure your API key:

```bash
venice configure
```

This will prompt you to enter your Venice AI API key, which will be securely stored for future use.

## Available Commands

### Chat

Generate text responses using Venice AI models:

```bash
venice chat "Tell me about artificial intelligence"
```

Options:
- `--model <model>`: Specify the model to use (default: llama-3.3-70b)
- `--system <message>`: Set a system message
- `--stream`: Enable streaming mode for real-time responses
- `--web-search`: Enable web search capability
- `--attach <files>`: Attach files to the message (comma-separated paths)
- `--pdf-mode <mode>`: How to process PDF files (image, text, or both) (default: image)

### Image Generation

Create images with various models and styles:

```bash
venice image "A serene mountain landscape at sunset"
```

Options:
- `--model <model>`: Specify the image model to use
- `--style <style>`: Set the image style
- `--width <width>`: Set the image width
- `--height <height>`: Set the image height
- `--output <path>`: Save the image to a specific path

### Models

List available models and their capabilities:

```bash
venice models list
```

### API Keys

Manage your Venice AI API keys:

```bash
venice keys list
venice keys create
venice keys delete <key-id>
venice keys rate-limits
```

### Characters

List and interact with pre-defined AI characters:

```bash
venice characters list
venice chat --character "Scientist" "Explain quantum physics"
```

## Advanced Usage

### Streaming Responses

Enable streaming for real-time responses:

```bash
venice chat --stream "Write a short story about a robot"
```

### Web Search

Enable web search capability for more up-to-date information:

```bash
venice chat --web-search "What are the latest developments in AI?"
```

### PDF Processing

Process PDF documents with different modes:

```bash
# Process PDF as binary data (default mode)
venice chat --attach document.pdf "Summarize this document"

# Process PDF as text
venice chat --attach document.pdf --pdf-mode text "Summarize this document"

# Process PDF as both text and binary data
venice chat --attach document.pdf --pdf-mode both "Summarize this document"
```

For proper PDF-to-image conversion, you'll need to convert the PDF first:

```bash
# Using ImageMagick (if installed)
convert -density 150 document.pdf -quality 90 document.png

# Then use the converted image
venice chat --attach document.png "Analyze this image"
```

You can also attach multiple files to provide both text and image context:

```bash
# Attach both a text file and an image file
venice chat --attach "document.txt,image.png" "Analyze these files"
```

### Piping and Redirection

The CLI supports standard input/output redirection:

```bash
echo "Explain the concept of recursion" | venice chat
venice chat "Write a poem about the ocean" > ocean-poem.txt
```

## Examples

### Basic Chat Example

```bash
venice chat "What is the capital of France?"
```

### Character Interaction Example

```bash
venice chat --character "Historian" "Describe the Renaissance period"
```

### Image Generation Example

```bash
venice image "A futuristic city with flying cars" --style "digital-art" --output city.png
```

### Streaming Chat Example

```bash
venice chat --stream "Write a step-by-step guide to baking bread"
```

## Troubleshooting

If you encounter any issues with the CLI, try the following:

1. Ensure you have the latest version installed:
   ```bash
   npm update -g venice-dev-tools
   ```

2. Verify your API key configuration:
   ```bash
   venice configure --show
   ```

3. Check your network connection and the Venice AI service status.

4. For more detailed error information, use the debug flag:
   ```bash
   venice chat --debug "Your prompt here"
   ```

## Getting Help

For additional help with any command, use the `--help` flag:

```bash
venice --help
venice chat --help
venice image --help