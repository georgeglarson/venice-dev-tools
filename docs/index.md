---
layout: default
title: Venice Dev Tools Documentation | Official SDK for Venice AI API
description: "Comprehensive documentation for Venice Dev Tools, the official SDK for interacting with Venice AI API. Features include chat completions, image generation, PDF processing, and more."
keywords: "Venice Dev Tools, Venice AI SDK, AI API, LLM API, chat completion API, image generation, PDF processing"
---

# Venice Dev Tools Documentation

Welcome to the Venice Dev Tools documentation. This SDK provides a simple, intuitive interface for interacting with the Venice AI API.

<div class="project-links">
  <a href="https://github.com/georgeglarson/venice-dev-tools" class="project-button">GitHub Repository</a>
  <a href="https://venice.ai/?ref=VB8W1j" class="project-button">Venice AI Platform</a>
</div>

## Getting Started

The Venice Dev Tools allows you to interact with the Venice AI API, which provides access to powerful AI models for text generation, image creation, and more.

### Installation

Install the Venice Dev Tools SDK using npm:

```bash
# Install the complete SDK (includes all packages)
npm install venice-dev-tools

# Or install individual packages
# Node.js only
npm install @venice-dev-tools/node

# Browser only
npm install @venice-dev-tools/web

# Core functionality only
npm install @venice-dev-tools/core
```

Or install globally to use the CLI:

```bash
npm install -g @venice-dev-tools/node
```

### Authentication

The Venice Dev Tools requires an API key for authentication. You can obtain an API key from the [Venice AI website](https://venice.ai/settings/api?ref=VB8W1j).

```javascript
const venice = new VeniceNode({
  apiKey: 'your-api-key',
});
```

For CLI usage, configure your API key:

```bash
venice configure
```

### Basic Usage

Here's a simple example to get you started:

```javascript
import { VeniceNode } from '@venice-dev-tools/node';

// Initialize the client
const venice = new VeniceNode({
  apiKey: 'your-api-key',
});

// Generate a chat completion
async function generateChatCompletion() {
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Tell me about AI' }
    ]
  });
  
  console.log(response.choices[0].message.content);
}

generateChatCompletion();
```

## Documentation Sections

<div class="doc-sections">
  <div class="doc-section">
    <h3><a href="/venice-dev-tools/documentation/api-reference/">API Reference</a></h3>
    <p>Detailed documentation for all API resources and endpoints.</p>
    <ul>
      <li><a href="/venice-dev-tools/documentation/api-reference/#chat">Chat API</a></li>
      <li><a href="/venice-dev-tools/documentation/api-reference/#image">Image API</a></li>
      <li><a href="/venice-dev-tools/documentation/api-reference/#models">Models API</a></li>
      <li><a href="/venice-dev-tools/documentation/api-reference/#api-keys">API Keys</a></li>
      <li><a href="/venice-dev-tools/documentation/api-reference/#characters">Characters</a></li>
      <li><a href="/venice-dev-tools/documentation/api-reference/#vvv-token">VVV Token</a></li>
    </ul>
  </div>
  
  <div class="doc-section">
    <h3><a href="/venice-dev-tools/cli">CLI Reference</a></h3>
    <p>Documentation for the command-line interface.</p>
    <ul>
      <li>Installation and Configuration</li>
      <li>Available Commands</li>
      <li>Advanced Usage</li>
      <li>Examples</li>
    </ul>
  </div>
  
  <div class="doc-section">
    <h3><a href="/venice-dev-tools/documentation/advanced/">Advanced Topics</a></h3>
    <p>Advanced usage and concepts.</p>
    <ul>
      <li><a href="/venice-dev-tools/documentation/advanced/#streaming-implementation">Streaming</a></li>
      <li><a href="/venice-dev-tools/documentation/advanced/#error-handling">Error Handling</a></li>
      <li><a href="/venice-dev-tools/documentation/advanced/#rate-limiting">Rate Limiting</a></li>
      <li><a href="/venice-dev-tools/documentation/advanced/#debug-logging">Debug Logging</a></li>
      <li><a href="/venice-dev-tools/documentation/advanced/#function-calling">Function Calling</a></li>
      <li><a href="/venice-dev-tools/documentation/advanced/#vision-models">Vision Models</a></li>
      <li><a href="/venice-dev-tools/documentation/advanced/#pdf-processing">PDF Processing</a></li>
    </ul>
  </div>
  
  <div class="doc-section">
    <h3><a href="/venice-dev-tools/documentation/examples/">Examples</a></h3>
    <p>Code examples for common use cases.</p>
    <ul>
      <li><a href="/venice-dev-tools/documentation/examples/#basic-chat">Basic Chat</a></li>
      <li><a href="/venice-dev-tools/documentation/examples/#streaming-chat">Streaming Chat</a></li>
      <li><a href="/venice-dev-tools/documentation/examples/#generate-image">Generate Image</a></li>
      <li><a href="/venice-dev-tools/documentation/examples/#character-interaction">Character Interaction</a></li>
      <li><a href="/venice-dev-tools/documentation/examples/#function-calling">Function Calling</a></li>
      <li><a href="/venice-dev-tools/documentation/examples/#pdf-processing">PDF Processing</a></li>
      <li><a href="/venice-dev-tools/documentation/examples/#vision-multimodal">Vision & Multimodal</a></li>
    </ul>
  </div>
</div>

## Special Features

<div class="feature-sections">
  <div class="feature-section">
    <h3><a href="/venice-dev-tools/character-interaction">Character Interaction</a></h3>
    <p>Learn how to interact with AI characters - predefined personalities that can enhance your conversational experiences.</p>
  </div>
  
  <div class="feature-section">
    <h3><a href="/venice-dev-tools/demo">Code Examples</a></h3>
    <p>Explore practical code examples for using the Venice Dev Tools SDK.</p>
  </div>
  
  <div class="feature-section">
    <h3><a href="/venice-dev-tools/documentation/troubleshooting">Troubleshooting</a></h3>
    <p>Common issues and solutions to help you resolve problems with the SDK.</p>
  </div>
</div>

## Command Line Interface

<div class="cli-highlight">
  <h3>Try our CLI for quick access to Venice AI capabilities</h3>
  <pre><code>npm install -g venice-dev-tools
venice chat "Tell me about AI"</code></pre>
  <a href="/venice-dev-tools/cli" class="cli-button">View CLI Documentation</a>
  <a href="/venice-dev-tools/demo" class="cli-button">Explore Code Examples</a>
</div>

## Features

- **Chat Completions**: Generate text responses with streaming support and web search
- **Image Generation**: Create images with various models and styles
- **Image Upscaling**: Enhance image resolution
- **Models Management**: List models, traits, and compatibility mappings
- **Character Management**: List and interact with pre-defined AI characters
- **API Key Management**: Create, list, delete, and check rate limits for API keys
- **VVV Token Information**: Get circulating supply, network utilization, and staking yield
- **Web3 Integration**: Generate API keys using Web3 wallets
- **Command Line Interface**: Interact with the API directly from your terminal
- **Error Handling**: Comprehensive error handling with specific error classes
- **Rate Limiting**: Automatic rate limit tracking and handling
- **Debug Logging**: Robust logging system with multiple log levels and runtime configuration
- **PDF Processing**: Process PDF documents in different modes (binary data, text extraction, or both) with support for external PDF-to-image conversion
- **Vision/Multimodal**: Send both text and images to vision-capable models

## Privacy-First Approach

[Venice AI](https://venice.ai/sign-up?ref=VB8W1j) offers unparalleled privacy advantages over other AI providers:

- **No Data Storage**: Your prompts, responses, and generated content are never saved on any Venice infrastructure
- **Local Storage Only**: Your conversation history lives in your local browser - clear your browser data, and those conversations are gone forever
- **Decentralized Processing**: Your requests are processed on decentralized GPUs without any identifying information
- **Transient Processing**: Once a prompt is processed, it is purged from the GPU - nothing persists
- **SSL Encryption**: All communication is secured using SSL encryption throughout the entire journey

As Venice states: **"You don't have to protect what you do not have."**