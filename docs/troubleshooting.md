---
layout: default
title: Venice AI SDK - Troubleshooting
---

# Troubleshooting

This guide helps you troubleshoot common issues with the Venice AI SDK.

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Rate Limiting](#rate-limiting)
- [Network Errors](#network-errors)
- [Streaming Issues](#streaming-issues)
- [CLI Issues](#cli-issues)
- [Model-Specific Issues](#model-specific-issues)
- [Character Interaction Issues](#character-interaction-issues)
- [Image Generation Issues](#image-generation-issues)

## Authentication Issues

### Invalid API Key

**Symptoms:**
- Error message: "Invalid API key" or "Authentication failed"
- Status code: 401 Unauthorized

**Solutions:**
1. Verify that your API key is correct
2. Check if your API key has expired
3. Ensure you're using the correct API key for the environment (production vs. test)

```javascript
// Correct way to initialize the client
const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

// For CLI, configure your API key
venice configure
```

### Missing API Key

**Symptoms:**
- Error message: "API key is required"

**Solutions:**
1. Provide an API key when initializing the client
2. Set the VENICE_API_KEY environment variable
3. For CLI, run `venice configure` to set up your API key

## Rate Limiting

### Rate Limit Exceeded

**Symptoms:**
- Error message: "Rate limit exceeded"
- Status code: 429 Too Many Requests

**Solutions:**
1. Reduce the frequency of requests
2. Implement exponential backoff and retry logic
3. Check your current rate limits with `venice rate-limits`
4. Consider upgrading to a higher tier if you need higher limits

```javascript
// Check rate limits in responses
const response = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello' }
  ]
});

if (response._metadata?.rateLimit) {
  console.log('Remaining requests:', response._metadata.rateLimit.remaining);
  console.log('Reset time:', new Date(response._metadata.rateLimit.reset * 1000).toLocaleString());
}
```

### Handling Rate Limits

```javascript
try {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Hello' }
    ]
  });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    const resetTime = new Date(error.rateLimitInfo.reset * 1000);
    console.log(`Rate limit exceeded. Try again after: ${resetTime.toLocaleString()}`);
    
    // Implement retry logic
    setTimeout(() => {
      // Retry the request
    }, resetTime.getTime() - Date.now());
  }
}
```

## Network Errors

### Connection Timeout

**Symptoms:**
- Error message: "Request timed out" or "Connection timeout"

**Solutions:**
1. Check your internet connection
2. Increase the timeout value
3. Verify that the API endpoint is accessible

```javascript
// Increase timeout
const venice = new VeniceAI({
  apiKey: 'your-api-key',
  timeout: 60000, // 60 seconds
});
```

### CORS Issues

**Symptoms:**
- Error message: "Cross-Origin Request Blocked" (in browser environments)

**Solutions:**
1. Use a proxy server to make the requests
2. Set up proper CORS headers on your server
3. Use the Venice API Proxy for browser applications

## Streaming Issues

### Stream Not Working

**Symptoms:**
- No data received from stream
- Stream ends immediately

**Solutions:**
1. Ensure you're using the correct stream handling code
2. Check if the model supports streaming
3. Verify that you've set `stream: true` in the request

```javascript
// Correct streaming implementation
const stream = await venice.chat.completions.create({
  model: 'llama-3.3-70b',
  messages: [
    { role: 'user', content: 'Hello' }
  ],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### Stream Errors

**Symptoms:**
- Stream terminates with an error
- Incomplete responses

**Solutions:**
1. Implement error handling for streams
2. Check for network stability
3. Consider using non-streaming requests for critical operations

```javascript
try {
  const stream = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Hello' }
    ],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
} catch (error) {
  console.error('Stream error:', error.message);
  // Fall back to non-streaming request
}
```

## CLI Issues

### Command Not Found

**Symptoms:**
- Error message: "Command not found: venice"

**Solutions:**
1. Ensure the package is installed globally: `npm install -g venice-dev-tools`
2. Check your PATH environment variable
3. Try using npx: `npx venice-dev-tools <command>`

### Configuration Issues

**Symptoms:**
- Error message: "API key not configured"

**Solutions:**
1. Run `venice configure` to set up your API key
2. Check if the configuration file exists and has the correct permissions
3. Set the VENICE_API_KEY environment variable

```bash
# Configure API key
venice configure

# Or use environment variable
VENICE_API_KEY=your-api-key venice chat "Hello"
```

## Model-Specific Issues

### Model Not Found

**Symptoms:**
- Error message: "Model not found" or "Invalid model"

**Solutions:**
1. Check if the model ID is correct
2. Verify that the model is available in your account
3. Use `venice list-models` to see available models

### Model Compatibility

**Symptoms:**
- Error message: "Model does not support this feature"

**Solutions:**
1. Check the model's capabilities and limitations
2. Use a different model that supports the feature
3. Check model compatibility with `venice models compatibility`

## Character Interaction Issues

### Character Not Found

**Symptoms:**
- Error message: "Character not found" or "Invalid character slug"

**Solutions:**
1. Verify the character slug is correct
2. Check if the character is available in your account
3. Use `venice list-characters` to see available characters

### Unexpected Character Responses

**Symptoms:**
- Character responses don't match expectations
- Character seems to ignore its personality

**Solutions:**
1. Provide more context in your prompt
2. Use system messages to guide the character's behavior
3. Try a different character that better matches your needs

## Image Generation Issues

### Image Generation Failed

**Symptoms:**
- Error message: "Image generation failed"
- No image URL in the response

**Solutions:**
1. Check if your prompt follows content policy guidelines
2. Try a different model or style
3. Simplify your prompt
4. Ensure your account has image generation permissions

### Image Quality Issues

**Symptoms:**
- Generated images are low quality or don't match the prompt

**Solutions:**
1. Use a negative prompt to specify what to avoid
2. Try different style presets
3. Adjust parameters like width, height, and steps
4. Use a more powerful model

```javascript
// Improve image quality
const response = await venice.image.generate({
  model: 'fluently-xl',
  prompt: 'A detailed, high-quality portrait of a woman with blue eyes',
  negative_prompt: 'blurry, distorted, low quality, deformed features, unrealistic',
  style_preset: 'Photographic',
  height: 1024,
  width: 1024
});
```

## Getting Additional Help

If you're still experiencing issues after trying the solutions in this guide, you can:

1. Check the [GitHub repository](https://github.com/georgeglarson/venice-dev-tools) for known issues
2. Contact Venice AI support at support@venice.ai
3. Visit the [Venice AI website](https://venice.ai/contact) for more resources