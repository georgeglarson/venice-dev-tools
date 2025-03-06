---
layout: default
title: Venice AI SDK - File Handling
---

# File Handling in Venice AI SDK

The Venice AI SDK provides several ways to handle files, with a strict 4.5MB post limit for all file uploads. This document explains how to work with files using both the SDK and CLI.

## File Size Limitations

All API endpoints that accept file uploads have a strict 4.5MB post limit. Ensure your files are under this limit before uploading.

## Using Files with the CLI

The Venice AI CLI provides several commands that support file handling. These commands are implemented in the codebase and demonstrated in various example files:

### Vision Chat with Images

Use the `vision-chat` command to analyze images:

```bash
# Analyze an image
venice vision-chat "What's in this image?" --image path/to/image.jpg

# Analyze an HTML document
venice vision-chat "Summarize this document" --image path/to/document.html
```

### Upscale Images

Use the `upscale-image` command to enhance image resolution:

```bash
# Upscale an image with 2x scale factor
venice upscale-image path/to/image.jpg --scale 2 --output upscaled.jpg

# Upscale an image with 4x scale factor
venice upscale-image path/to/image.jpg --scale 4 --output upscaled.jpg
```

### Generate Images

Use the `generate-image` command to create images:

```bash
# Generate an image
venice generate-image "A beautiful sunset over mountains" --output sunset.jpg

# Generate an image with specific parameters
venice generate-image "A futuristic city" --model fluently-xl --style "3D Model" --width 1024 --height 768 --output city.jpg
```
### Process Files (Universal File Upload)

Use the `process-file` command to analyze any type of file. This command automatically detects the file type and processes it accordingly:

```bash
# Process any file type with default prompts
venice process-file path/to/file.jpg
venice process-file path/to/document.html
venice process-file path/to/code.js

# Process with custom prompt
venice process-file path/to/image.jpg -p "What colors are dominant in this image?"
venice process-file path/to/document.html -p "Extract all links from this HTML document"

# Use a specific model
venice process-file path/to/file.pdf -m claude-3-opus-20240229
```

The command uses intelligent default prompts based on the file type, but you can customize the prompt with the `-p, --prompt` option.

### Chat with File Context

You can use the `vision-chat` command to chat with image and HTML document context, or use the `--attach` option with the regular `chat` command to attach any file type:

```bash
# Chat with an HTML document using vision-chat
venice vision-chat "Summarize this document" --image path/to/document.html

# Chat with an image using vision-chat
venice vision-chat "Describe what you see in detail" --image path/to/image.jpg

# Attach any file type to a regular chat conversation
venice chat "Analyze this file for me" --attach path/to/file.pdf
venice chat "What does this code do?" --attach path/to/script.js
venice chat "Extract data from this image" --attach path/to/chart.png
```

The `--attach` option leverages the universal file upload functionality to automatically detect the file type and process it accordingly.
> **Note:** The universal file upload functionality is available as a core module in the SDK (`src/resources/file-upload`), and is exposed through both the CLI commands and programmatic API.

## Using Files with the SDK

The SDK provides more flexible file handling capabilities:

### Universal File Upload

The SDK includes a universal file upload module that automatically handles different file types. This functionality is available both as a CLI command (`process-file`) and programmatically:

```javascript
const { VeniceAI } = require('venice-dev-tools');
const { processFile } = require('venice-dev-tools/src/resources/file-upload');

// Process any file type (under 4.5MB)
async function handleFile(filePath) {
  try {
    // Initialize the Venice AI client
    const venice = new VeniceAI({
      apiKey: process.env.VENICE_API_KEY,
    });
    
    // The module automatically detects the file type and processes it accordingly
    const result = await processFile(filePath, venice);
    console.log('API Response:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage
handleFile('document.html');    // Processes HTML document
handleFile('image.jpg');        // Processes image
handleFile('data.json');        // Processes text content directly
```

> **Note:** You can use this functionality directly from the command line with the `process-file` command, or you can create a custom script that imports and uses this module for more advanced use cases. See the [Testing Without the Venice Command](#testing-without-the-venice-command) section below for examples.

### Image Upscaling

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');

const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

async function upscaleImage(imagePath) {
  // Read the image file
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  // Upscale the image
  const response = await venice.image.upscale({
    image: base64Image,
    scale: 2  // or 4
  });
  
  // Save the upscaled image
  if (response.url) {
    console.log(`Upscaled image URL: ${response.url}`);
    // Download the image (implementation not shown)
  } else if (response.b64_json) {
    const imageData = Buffer.from(response.b64_json, 'base64');
    fs.writeFileSync('upscaled-image.jpg', imageData);
    console.log('Upscaled image saved to upscaled-image.jpg');
  }
}
```

### Vision Models with Images and HTML Documents

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');

const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

async function analyzeFile(filePath) {
  // Determine file type based on extension
  const fileExt = path.extname(filePath).toLowerCase();
  
  // Read the file
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  
  // Prepare content based on file type
  let content;
  if (fileExt === '.html') {
    // HTML document
    content = [
      { type: 'text', text: 'Please analyze this HTML document.' },
      { type: 'image_url', image_url: { url: `data:text/html;base64,${base64Data}` } }
    ];
  } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
    // Image file
    const mimeType = fileExt === '.png' ? 'image/png' :
                     fileExt === '.gif' ? 'image/gif' :
                     fileExt === '.webp' ? 'image/webp' : 'image/jpeg';
    
    content = [
      { type: 'text', text: 'Please analyze this image.' },
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
    ];
  } else {
    throw new Error(`Unsupported file type: ${fileExt}`);
  }
  
  // Send to API
  const response = await venice.chat.completions.create({
    model: 'qwen-2.5-vl',
    messages: [{ role: 'user', content }]
  });
  
  return response.choices[0].message.content;
}
```

## Best Practices

1. **Always check file size**: Ensure files are under the 4.5MB limit before uploading.

2. **Use appropriate file types**:
   - For images: JPG, PNG, GIF, WebP
   - For documents: HTML
   - For text: TXT, MD, JSON, etc.

3. **Consider file optimization**: Compress or resize large files before uploading.

4. **Handle errors gracefully**: Implement proper error handling for cases where file processing fails.

## Examples

For complete examples, see the following files in the SDK:

### SDK Examples

- [Unified File Upload](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/unified-file-upload.js) - Demonstrates the universal file upload module
- [Document Analysis](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/document-analysis.js) - Shows how to analyze HTML documents
- [Image Upscaling](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/image/upscale-image.js) - Demonstrates image upscaling functionality

### CLI Examples

- [Document Vision Chat](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/document-vision-chat.js) - Demonstrates using the `vision-chat` command with HTML documents
- [Advanced Image Generation](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/image/advanced-image-generation.js) - Shows various options for the `generate-image` command
- [CLI Style Examples](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/cli-style.js) - Demonstrates using the `generate-image` command with different styles
- [Process File](https://github.com/georgeglarson/venice-dev-tools/blob/main/src/resources/file-upload/index.ts) - The implementation behind the `process-file` command for universal file handling
- [Process File Example](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/process-file-example.js) - Example of using the process-file functionality programmatically
- [Run CLI Directly](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/run-cli-directly.js) - Example of running the CLI directly using Node.js
- [Use CLI Wrapper](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/use-cli-wrapper.js) - Example of using the CLI wrapper for testing

## Testing Without the Venice Command

There are several ways to test the CLI functionality without using the `venice` command:

### 1. Using the Commands Programmatically

You can import the commands directly from the CLI module and use them programmatically:

```javascript
const { commands } = require('venice-dev-tools/src/cli');

// Set your API key
process.env.VENICE_API_KEY = 'your-api-key-here';

// Process a file
async function processFile() {
  const result = await commands.processFile('path/to/file.jpg', {
    model: 'qwen-2.5-vl',
    prompt: 'Analyze this image'
  });
  console.log(result);
}

// Chat with an attached file
async function chatWithAttachedFile() {
  const result = await commands.chat('What is this file about?', {
    model: 'qwen-2.5-vl',
    attach: 'path/to/file.pdf'
  });
  console.log(result);
}
```

See [Process File Example](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/process-file-example.js) for a complete example.

### 2. Running the CLI Directly

You can run the CLI directly using Node.js:

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Path to the CLI script
const cliPath = path.resolve(__dirname, 'node_modules/venice-dev-tools/src/cli.ts');

// Set your API key
process.env.VENICE_API_KEY = 'your-api-key-here';

// Run a CLI command
function runCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['ts-node', cliPath, ...args], {
      env: process.env,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Example usage
async function main() {
  // Process a file
  await runCommand(['process-file', 'path/to/file.jpg', '-p', 'Analyze this image']);
  
  // Chat with an attached file
  await runCommand(['chat', 'What is this file about?', '--attach', 'path/to/file.pdf']);
}
```

See [Run CLI Directly](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/run-cli-directly.js) for a complete example.

### 3. Using the CLI Wrapper

The SDK includes a CLI wrapper for testing purposes. Note that this requires building the project first with `npm run build`:

```javascript
const CLIWrapper = require('venice-dev-tools/test/utils/cli-wrapper');

// Set your API key
process.env.VENICE_API_KEY = 'your-api-key-here';

// Create a CLI wrapper instance
const cli = new CLIWrapper({
  apiKey: process.env.VENICE_API_KEY
});

// Process a file
async function processFile() {
  const result = await cli.commands.processFile('path/to/file.jpg', {
    model: 'qwen-2.5-vl',
    prompt: 'Analyze this image'
  });
  console.log(result);
}

// Chat with an attached file
async function chatWithAttachedFile() {
  const result = await cli.chat.completions.create({
    model: 'qwen-2.5-vl',
    messages: [
      { role: 'user', content: 'What is this file about?' }
    ],
    attach: 'path/to/file.pdf'
  });
  console.log(result);
}
```

See [Use CLI Wrapper](https://github.com/georgeglarson/venice-dev-tools/blob/main/examples/chat/use-cli-wrapper.js) for a complete example.