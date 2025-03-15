---
layout: default
title: Troubleshooting - Venice Dev Tools
---

# Troubleshooting

This guide helps you resolve common issues you might encounter when using the Venice Dev Tools SDK.

## Authentication Issues

### Invalid API Key

**Symptom:** You receive an `AuthError` with a message like "Invalid API key provided."

**Solution:**

1. Verify that you're using a valid API key:

   ```javascript
   const venice = new VeniceNode({
     apiKey: 'your-api-key', // Check this value
   });
   ```

2. Ensure your API key is active by checking its status in the Venice AI dashboard.

3. Try regenerating your API key from the [Venice AI website](https://venice.ai/settings/api).

4. For CLI usage, reconfigure your API key:

   ```bash
   venice configure
   ```

### API Key Not Found

**Symptom:** You receive an error like "API key not found" when using the CLI.

**Solution:**

1. Configure your API key:

   ```bash
   venice configure
   ```

2. Check if the API key is properly stored:

   ```bash
   venice configure --show
   ```

3. If using environment variables, ensure `VENICE_API_KEY` is set:

   ```bash
   export VENICE_API_KEY=your-api-key
   ```

## Rate Limiting

### Rate Limit Exceeded

**Symptom:** You receive a `RateLimitError` with a message like "Rate limit exceeded."

**Solution:**

1. Check your current rate limits:

   ```javascript
   const rateLimits = await venice.keys.rateLimits();
   console.log(rateLimits);
   ```

2. Implement retry logic with exponential backoff:

   ```javascript
   async function retryWithBackoff(fn, maxRetries = 3) {
     let retries = 0;
     let delay = 1000; // Start with 1 second delay
     
     while (retries < maxRetries) {
       try {
         return await fn();
       } catch (error) {
         if (error instanceof RateLimitError) {
           retries++;
           if (retries >= maxRetries) throw error;
           
           console.log(`Rate limited. Retrying in ${delay}ms...`);
           await new Promise(resolve => setTimeout(resolve, delay));
           delay *= 2; // Exponential backoff
         } else {
           throw error;
         }
       }
     }
   }
   ```

3. Consider upgrading your plan for higher rate limits.

## Network Issues

### Connection Errors

**Symptom:** You receive a `NetworkError` with messages like "Connection refused" or "Network error."

**Solution:**

1. Check your internet connection.

2. Verify that you can access the Venice AI API:

   ```bash
   curl -I https://api.venice.ai/v1/health
   ```

3. If you're behind a proxy or firewall, ensure it allows connections to the Venice AI API.

4. Implement retry logic for transient network issues:

   ```javascript
   async function retryNetworkErrors(fn, maxRetries = 3) {
     let retries = 0;
     
     while (retries < maxRetries) {
       try {
         return await fn();
       } catch (error) {
         if (error instanceof NetworkError) {
           retries++;
           if (retries >= maxRetries) throw error;
           
           const delay = 1000 * retries; // Increasing delay
           console.log(`Network error. Retrying in ${delay}ms...`);
           await new Promise(resolve => setTimeout(resolve, delay));
         } else {
           throw error;
         }
       }
     }
   }
   ```

### Timeout Errors

**Symptom:** You receive a `TimeoutError` with a message like "Request timed out."

**Solution:**

1. Increase the timeout in your SDK configuration:

   ```javascript
   const venice = new VeniceNode({
     apiKey: 'your-api-key',
     timeout: 120000 // 120 seconds
   });
   ```

2. For large requests or complex prompts, consider breaking them into smaller chunks.

## Model-Specific Issues

### Model Not Found

**Symptom:** You receive a `ValidationError` with a message like "Model not found."

**Solution:**

1. Check the available models:

   ```javascript
   const models = await venice.models.list();
   console.log(models.map(model => model.id));
   ```

2. Ensure you're using a valid model ID:

   ```javascript
   const response = await venice.chat.createCompletion({
     model: 'llama-3.3-70b', // Check this value
     messages: [{ role: 'user', content: 'Hello' }]
   });
   ```

### Content Filtering

**Symptom:** You receive a response that indicates content was filtered or rejected.

**Solution:**

1. Review your prompt for potentially problematic content.

2. Rephrase your prompt to avoid triggering content filters.

3. If you believe this is a false positive, contact Venice AI support.

## Streaming Issues

### Stream Disconnections

**Symptom:** Your stream disconnects unexpectedly during a streaming response.

**Solution:**

1. Implement error handling for stream disconnections:

   ```javascript
   try {
     const stream = await venice.chat.createCompletionStream({
       model: 'llama-3.3-70b',
       messages: [{ role: 'user', content: 'Write a long story' }]
     });
     
     let fullResponse = '';
     
     for await (const chunk of stream) {
       try {
         const content = chunk.choices[0]?.delta?.content || '';
         fullResponse += content;
         process.stdout.write(content);
       } catch (error) {
         console.error('Error processing chunk:', error);
       }
     }
   } catch (error) {
     if (error instanceof StreamError) {
       console.error('Stream error:', error.message);
     } else {
       console.error('Unexpected error:', error);
     }
   }
   ```

2. Consider implementing reconnection logic for long-running streams.

## CLI Issues

### Command Not Found

**Symptom:** You receive a "command not found" error when trying to use the CLI.

**Solution:**

1. Ensure the package is installed globally:

   ```bash
   npm install -g venice-dev-tools
   ```

2. Check if the package is in your PATH:

   ```bash
   which venice
   ```

3. If needed, add the npm global bin directory to your PATH.

### CLI Permissions

**Symptom:** You receive a permission error when running CLI commands.

**Solution:**

1. On Unix-like systems, ensure the CLI has execute permissions:

   ```bash
   chmod +x $(which venice)
   ```

2. On Windows, check your execution policy if using PowerShell:

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

## PDF Processing Issues

### PDF Processing Fails

**Symptom:** PDF processing fails with errors.

**Solution:**

1. Check if the PDF is valid and not corrupted:

   ```javascript
   // Check file size before processing
   const stats = fs.statSync('document.pdf');
   console.log(`File size: ${stats.size} bytes`);
   
   // Try with a different PDF if possible
   ```

2. Try processing specific pages instead of the entire document:

   ```javascript
   const result = await venice.pdf.process({
     pdf: base64Pdf,
     mode: 'text',
     pages: '1-5' // Process only the first 5 pages
   });
   ```

3. If the PDF is large, try processing it in chunks.

## Vision/Multimodal Issues

### Image Processing Fails

**Symptom:** Vision model fails to process images.

**Solution:**

1. Check if you're using a vision-capable model:

   ```javascript
   // Use a model with vision capabilities
   const response = await venice.chat.createCompletion({
     model: 'claude-3-opus', // Must support vision
     messages: [
       {
         role: 'user',
         content: [
           { type: 'text', text: 'What's in this image?' },
           { type: 'image', image: base64Image }
         ]
       }
     ]
   });
   ```

2. Verify the image format and size:

   ```javascript
   // Check image details
   const imageBuffer = fs.readFileSync('image.jpg');
   console.log(`Image size: ${imageBuffer.length} bytes`);
   
   // Resize or compress the image if needed
   ```

3. Ensure the base64 encoding is correct:

   ```javascript
   const base64Image = imageBuffer.toString('base64');
   // Verify the base64 string starts correctly
   console.log(base64Image.substring(0, 50) + '...');
   ```

## Debugging

### Enable Debug Logging

To get more information about what's happening:

```javascript
const venice = new VeniceNode({
  apiKey: 'your-api-key',
  logLevel: 'debug' // Set to 'debug' for maximum information
});
```

### Check SDK Version

Ensure you're using the latest version:

```bash
npm list venice-dev-tools
npm list -g venice-dev-tools # For global installation
```

Update if needed:

```bash
npm update venice-dev-tools
npm update -g venice-dev-tools # For global installation
```

### Inspect Request/Response

For detailed debugging, you can inspect the raw request and response:

```javascript
const venice = new VeniceNode({
  apiKey: 'your-api-key',
  logLevel: 'debug',
  logger: {
    debug: (message, data) => {
      if (data?.request) {
        console.log('Request:', JSON.stringify(data.request, null, 2));
      }
      if (data?.response) {
        console.log('Response:', JSON.stringify(data.response, null, 2));
      }
      console.debug(message);
    },
    info: console.info,
    warn: console.warn,
    error: console.error
  }
});
```

## Getting Help

If you're still experiencing issues:

1. Check the [GitHub repository](https://github.com/georgeglarson/venice-dev-tools) for known issues.

2. Search for similar issues in the repository's Issues section.

3. Contact Venice AI support with details about your problem, including:
   - SDK version
   - Error messages
   - Code sample that reproduces the issue
   - Environment details (Node.js version, OS)