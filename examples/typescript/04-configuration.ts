/**
 * Configuration - Advanced SDK configuration
 * 
 * This example shows how to configure the Venice AI SDK for
 * production use with custom timeouts, rate limits, and logging.
 * 
 * Configuration options:
 * - API credentials and base URL
 * - Timeouts and retry behavior
 * - Rate limiting
 * - Logging levels
 * - Custom headers
 * 
 * Run with: npx tsx examples/typescript/04-configuration.ts
 */

import { VeniceAI, LogLevel } from '@venice-dev-tools/core';

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  console.log('⚙️  Configuring Venice AI SDK...\n');

  // Create a client with custom configuration
  const venice = new VeniceAI({
    // Authentication
    apiKey: apiKey,
    
    // Base URL (usually default is fine)
    // baseUrl: 'https://api.venice.ai/api/v1',
    
    // Request timeout (30 seconds)
    timeout: 30000,
    
    // Rate limiting (prevent hitting API limits)
    maxConcurrent: 5,          // Max 5 concurrent requests
    requestsPerMinute: 60,     // Max 60 requests per minute
    
    // Retry policy for transient failures
    retryPolicy: {
      maxRetries: 3,           // Retry up to 3 times
      initialDelayMs: 100,     // Start with 100ms delay
      maxDelayMs: 10000,       // Cap at 10 seconds
      backoffMultiplier: 2,    // Double delay each retry
      jitter: true,            // Add randomness to prevent thundering herd
    },
    
    // Logging (useful for debugging)
    logLevel: LogLevel.INFO,   // Options: DEBUG, INFO, WARN, ERROR, NONE
    
    // Custom headers (if needed)
    headers: {
      'X-Custom-Header': 'my-app-v1.0',
    },
  });

  console.log('✅ Client configured with:');
  console.log('   • Timeout: 30 seconds');
  console.log('   • Rate limit: 60 requests/minute, 5 concurrent');
  console.log('   • Retry: 3 attempts with exponential backoff');
  console.log('   • Log level: INFO');
  console.log('');

  // Make a test request
  console.log('🧪 Testing configuration...\n');

  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Say "Configuration works!" and nothing else.' }
    ]
  });

  console.log('✨ Response:', response.choices[0].message.content);
  console.log('');
  console.log('✅ Configuration test successful!');
  console.log('');
  
  // Demonstrate updating API key at runtime
  console.log('💡 Tip: You can update configuration at runtime:');
  console.log('   venice.setApiKey("new-api-key")');
  console.log('   venice.setTimeout(60000)');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
