# Venice AI Shell Examples

Comprehensive shell script examples demonstrating the Venice AI API using `curl`, `jq`, and standard Unix tools. These examples showcase professional patterns for error handling, streaming, vision analysis, and more.

## Prerequisites

- **curl**: HTTP client for API requests
- **jq**: JSON processor for parsing responses
- **base64**: Image encoding (usually pre-installed)

### Installation

```bash
# Debian/Ubuntu
sudo apt-get install curl jq

# macOS
brew install curl jq

# Verify installation
curl --version
jq --version
```

## Quick Start

### Option 1: Automatic Setup (Recommended)

Create a `.env` file and use the setup script:

```bash
# Create .env file in the shell examples directory
echo 'VENICE_API_KEY=your-api-key-here' > .env

# Source the setup script to load variables
source ./00-setup-env.sh

# Run any example
./01-hello-world.sh
```

The setup script will:
- Search for `.env` files in multiple locations
- Load all environment variables
- Validate your API key
- Show you what's been configured

### Option 2: Manual Setup

Set your Venice AI API key as an environment variable:

```bash
export VENICE_API_KEY="your-api-key-here"
```

💡 **Tip**: Add this to your `~/.bashrc` or `~/.zshrc` for persistence.

## Shared Utilities

All examples leverage `utils.sh`, a shared utilities library that provides:

- ✅ Environment variable validation
- ✅ Command dependency checking
- ✅ API request helpers
- ✅ Error handling and parsing
- ✅ Image encoding (platform-aware)
- ✅ MIME type detection
- ✅ SSE stream processing
- ✅ Pretty output formatting

This demonstrates how to build reusable, maintainable shell utilities for API integration.

## Examples

### 00 - Environment Setup
**Load API configuration from .env**

Automatically scans for and loads `.env` files. Must be **sourced**, not executed.

```bash
# First time setup
echo 'VENICE_API_KEY=your-key' > .env
source ./00-setup-env.sh

# After that, just source it
source ./00-setup-env.sh
```

**What you'll learn:**
- Sourcing vs executing scripts
- Multi-location .env file discovery
- Environment variable export patterns
- Input validation and sanitization

**Where it searches:**
1. `examples/shell/.env` (local)
2. Project root `../../.env` 
3. Home directory `~/.venice-ai.env`

---

### 01 - Hello World
**Basic chat completion**

The simplest possible example - send a message, get a response.

```bash
./01-hello-world.sh
```

**What you'll learn:**
- API authentication
- Basic JSON payload structure
- Response parsing with `jq`
- Error handling

---

### 02 - Streaming Chat
**Real-time token streaming**

Stream chat responses as they're generated using Server-Sent Events (SSE).

```bash
./02-streaming-chat.sh
```

**What you'll learn:**
- Enabling streaming mode
- Processing SSE line by line
- Extracting delta content
- Progressive output without buffering

---

### 03 - Error Handling
**Robust error management**

Comprehensive demonstration of error detection, parsing, and user-friendly messaging.

```bash
./03-error-handling.sh
```

**What you'll learn:**
- Authentication errors
- Rate limit handling
- Invalid request detection
- Network error recovery
- Actionable error tips

---

### 05 - Image Generation
**Create images from text**

Generate images from text prompts and save them as PNG files.

```bash
# Default prompt
./05-image-generation.sh

# Custom prompt
./05-image-generation.sh "A cyberpunk city at night" output.png

# Custom size and quality
./05-image-generation.sh "A serene forest" forest.png 1024x1024 hd
```

**What you'll learn:**
- Image generation endpoint
- Base64 decoding
- File output handling
- Size and quality parameters

---

### 09 - Models List
**Query available models**

Retrieve and filter the list of available AI models.

```bash
# List all models
./09-models-list.sh

# Filter by name
./09-models-list.sh "llama"

# Show detailed info
./09-models-list.sh "" --details
```

**What you'll learn:**
- GET requests with authentication
- JSON array parsing
- Filtering with `jq`
- Formatted output display

---

### 11 - Vision Multimodal
**Image analysis and understanding**

Analyze images with AI vision models, including support for follow-up questions and streaming.

```bash
# Basic usage
./11-vision-multimodal.sh photo.jpg

# Custom prompt
./11-vision-multimodal.sh photo.jpg "What colors do you see?"

# Streaming mode
STREAMING_MODE=true ./11-vision-multimodal.sh photo.jpg
```

**What you'll learn:**
- Multimodal message structure
- Image encoding and MIME detection
- Conversation context management
- Interactive follow-up questions
- Streaming vision responses

---

## Legacy Examples

These examples are preserved for reference but superseded by newer implementations:

- `qwen-vision-curl-example.sh` → Use `11-vision-multimodal.sh`
- `qwen-vision-curl.sh` → Use `11-vision-multimodal.sh`
- `venice-vision-stream-cli.sh` → Use `STREAMING_MODE=true 11-vision-multimodal.sh`

## Architecture Patterns

### Shared Utilities Pattern

Instead of duplicating code across examples, we use a shared `utils.sh` library:

```bash
# In your script
source "$(dirname "$0")/utils.sh"

# Use utility functions
require_env VENICE_API_KEY
require_commands curl jq
response=$(venice_api_request "/api/v1/chat/completions" "$payload")
check_api_error "$response"
```

**Benefits:**
- 🔄 DRY (Don't Repeat Yourself)
- 🛡️ Consistent error handling
- 🧪 Easier testing and maintenance
- 📦 Platform-aware implementations (macOS vs Linux)

### Error Handling Pattern

All examples follow a consistent error handling pattern:

1. **Validate prerequisites** (API key, commands, files)
2. **Make API request** with proper authentication
3. **Check for errors** before processing response
4. **Provide actionable tips** for common issues
5. **Exit with appropriate codes** for automation

### Output Formatting Pattern

Consistent emoji-based visual indicators:

- 🤖 Starting/AI action
- ✨ Response/output
- ✅ Success
- ❌ Error
- 💡 Tips/suggestions
- 🔧 Progress steps
- 📁 File paths
- 📊 Statistics

## Shell Scripting Best Practices Demonstrated

1. **Platform Awareness**: `base64_encode()` detects macOS vs Linux
2. **Dependency Checking**: Auto-verify `curl`, `jq` availability
3. **Environment Variables**: Never hardcode API keys
4. **Error Codes**: Proper exit codes for CI/CD integration
5. **JSON Handling**: Safe parsing with `jq`
6. **Heredocs**: Clean multi-line string construction
7. **Function Composition**: Reusable, testable functions
8. **Help Text**: `--help` flag for all examples
9. **Defensive Programming**: File existence checks, empty string guards

## Extending the Examples

Want to add your own example? Follow this template:

```bash
#!/bin/bash

##############################################################################
# Example Name - Brief Description
#
# Detailed explanation of what this demonstrates and why it's useful.
#
# This example shows:
# - Feature 1
# - Feature 2
#
# Prerequisites:
# - Required tools
# - Environment variables
#
# Run with: ./your-example.sh
##############################################################################

# Source shared utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

##############################################################################
# Main
##############################################################################

main() {
  echo "🤖 Your example starting..."
  
  # Validate
  require_env VENICE_API_KEY
  
  # Work
  local payload='{"model":"llama-3.3-70b","messages":[...]}'
  local response=$(venice_api_request "/api/v1/chat/completions" "$payload")
  
  # Handle
  if check_api_error "$response"; then
    display_chat_response "$response"
  fi
}

main
```

## Going Further

The shell examples demonstrate patterns applicable to any language:

- **Go**: Use `net/http`, `encoding/json`, similar error handling
- **Rust**: Leverage `reqwest`, `serde_json`, strong typing
- **Python**: Apply `requests`, `json`, async patterns
- **Ruby**: Utilize `net/http`, `json`, metaprogramming

The core concepts transfer directly:
- Environment-based configuration
- Shared utility libraries
- Comprehensive error handling
- Progressive streaming
- User-friendly output

## Troubleshooting

### "command not found: jq"
Install `jq` using your package manager (see Prerequisites section).

### "VENICE_API_KEY environment variable is not set"
```bash
export VENICE_API_KEY="your-api-key-here"
```

### "base64: invalid option -- w"
You're on macOS. The `utils.sh` handles this automatically - make sure you're sourcing it.

### Permission denied
Make scripts executable:
```bash
chmod +x *.sh
```

## Contributing

When adding new shell examples:

1. Follow the established template structure
2. Use shared utilities from `utils.sh`
3. Include comprehensive header documentation
4. Add helpful error messages and tips
5. Test on both Linux and macOS if possible
6. Update this README with your example

## Resources

- [Venice AI API Documentation](https://docs.venice.ai)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [curl Documentation](https://curl.se/docs/)
- [Bash Best Practices](https://google.github.io/styleguide/shellguide.html)

---

*The shell deserves first-class treatment. Happy scripting! 🐚*
