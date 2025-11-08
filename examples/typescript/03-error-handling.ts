/**
 * Error Handling - Robust error management
 * 
 * This example shows how to handle different error types
 * and implement recovery strategies for production applications.
 * 
 * Venice AI SDK provides specific error types for different failures:
 * - VeniceAuthError: API key issues
 * - VeniceRateLimitError: Rate limit exceeded
 * - VeniceValidationError: Invalid parameters
 * - VeniceApiError: General API errors
 * - VeniceNetworkError: Network/connection issues
 * 
 * Run with: npx tsx examples/typescript/03-error-handling.ts
 */

import { 
  VeniceAI, 
  VeniceAuthError,
  VeniceRateLimitError,
  VeniceValidationError,
  VeniceApiError,
  VeniceNetworkError
} from '@venice-dev-tools/core';
import { ensureChatCompletionResponse } from './utils';

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ 
    apiKey,
    // Enable retry logic for transient failures
    retryPolicy: {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
      backoffMultiplier: 2
    }
  });

  console.log('📝 Testing error handling...\n');

  try {
    // Make a request (this might fail for demonstration)
    const result = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'Hello!' }
      ]
    });
    const response = ensureChatCompletionResponse(result, 'Error handling example');
    console.log('✅ Response:', response.choices[0].message.content);

  } catch (error: unknown) {
    // Handle specific error types
    if (error instanceof VeniceAuthError) {
      console.error('🔐 Authentication failed!');
      console.error('   Check your API key at: https://venice.ai/settings/api');
      console.error('   Current key starts with:', apiKey.substring(0, 7) + '...');
      
    } else if (error instanceof VeniceRateLimitError) {
      console.error('⏱️  Rate limit exceeded!');
      console.error(`   Retry after: ${error.retryAfter}ms`);
      console.error('   💡 Tip: Reduce requestsPerMinute in config or wait before retrying');
      
    } else if (error instanceof VeniceValidationError) {
      console.error('❌ Invalid request parameters:');
      console.error('   Details:', error.details ?? error.context ?? 'No additional details provided');
      console.error('   💡 Fix the parameters and try again');
      
    } else if (error instanceof VeniceNetworkError) {
      console.error('🌐 Network error occurred:');
      console.error('   ', error.message);
      console.error('   💡 Check your internet connection and try again');
      
    } else if (error instanceof VeniceApiError) {
      console.error(`🔴 API error (${error.status}):`, error.message);
      if (error.details) {
        console.error('   Details:', error.details);
      }
      
    } else {
      console.error('❓ Unexpected error:', error);
    }
    
    process.exit(1);
  }
}

main();
