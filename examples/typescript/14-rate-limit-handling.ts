/**
 * Rate Limit Handling - Deal with API rate limits gracefully
 * 
 * This example shows strategies for handling rate limits:
 * - Built-in rate limiting
 * - Retry with exponential backoff
 * - Queue management
 * - Graceful degradation
 * 
 * Run with: npx tsx examples/typescript/14-rate-limit-handling.ts
 */

import { VeniceAI, VeniceRateLimitError } from '@venice-dev-tools/core';
import { ensureChatCompletionResponse } from './utils';
import { requireEnv } from './env-config';

function normalizeAssistantContent(content: string | { type: string }[]): string {
  if (typeof content === 'string') {
    return content;
  }

  return content
    .map((item) => {
      if (item.type === 'text' && 'text' in item) {
        return (item as { type: 'text'; text: string }).text;
      }
      if (item.type === 'image_url' && 'image_url' in item) {
        return `[Image: ${(item as { type: 'image_url'; image_url: { url: string } }).image_url.url}]`;
      }
      return '';
    })
    .join('\n')
    .trim();
}

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');

  console.log('⏱️  Rate Limit Handling Demo\n');

  // Strategy 1: Built-in rate limiting
  console.log('📊 Strategy 1: Built-in Rate Limiting');
  console.log('═'.repeat(50));
  
  const venice = new VeniceAI({
    apiKey,
    // Configure rate limits
    maxConcurrent: 2,        // Max 2 requests at once
    requestsPerMinute: 10,   // Max 10 requests per minute
    
    // Enable retry on rate limit errors
    retryPolicy: {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
    }
  });

  console.log('Config: 2 concurrent, 10/min, 3 retries');
  console.log('');

  // Make multiple requests
  console.log('📤 Sending 5 requests...\n');

  const requests = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    prompt: `Request ${i + 1}: What is ${i + 1} + ${i + 1}?`
  }));

  const startTime = Date.now();

  try {
    const results = await Promise.all(
      requests.map(async (req) => {
        const reqStart = Date.now();
        
        try {
          const rawResponse = await venice.chat.completions.create({
            model: 'llama-3.3-70b',
            messages: [{ role: 'user', content: req.prompt }],
            max_tokens: 50,
          });
          const response = ensureChatCompletionResponse(rawResponse, `Rate limit demo request ${req.id}`);

          const duration = Date.now() - reqStart;
          console.log(`✅ Request ${req.id} completed in ${duration}ms`);
          
          return {
            id: req.id,
            success: true,
            duration,
            result: normalizeAssistantContent(response.choices[0].message.content)
          };

        } catch (error: any) {
          const duration = Date.now() - reqStart;
          
          if (error instanceof VeniceRateLimitError) {
            console.log(`⚠️  Request ${req.id} rate limited (retrying after ${error.retryAfter}ms)`);
          } else {
            console.log(`❌ Request ${req.id} failed: ${error.message}`);
          }

          return {
            id: req.id,
            success: false,
            duration,
            error: error.message
          };
        }
      })
    );

    const totalTime = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    
    console.log('');
    console.log('📊 Results:');
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Successful: ${successful}/${requests.length}`);
    console.log(`   Average: ${(totalTime / requests.length).toFixed(0)}ms per request`);
    console.log('');

  } catch (error) {
    console.error('❌ Batch error:', error);
  }

  // Strategy 2: Manual retry with backoff
  console.log('\n📊 Strategy 2: Manual Retry with Exponential Backoff');
  console.log('═'.repeat(50));

  async function makeRequestWithRetry(
    prompt: string,
    maxRetries = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const rawResponse = await venice.chat.completions.create({
          model: 'llama-3.3-70b',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
        });
        const response = ensureChatCompletionResponse(rawResponse, 'Manual retry request');

        return normalizeAssistantContent(response.choices[0].message.content);

      } catch (error: any) {
        lastError = error;

        if (error instanceof VeniceRateLimitError && attempt < maxRetries) {
          const delay = error.retryAfter || (1000 * Math.pow(2, attempt));
          console.log(`⏳ Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }

  try {
    console.log('📤 Sending request with manual retry...\n');
    
    const result = await makeRequestWithRetry('What is 2 + 2?');
    console.log('✅ Success:', result);
    
  } catch (error: any) {
    console.error('❌ Failed after retries:', error.message);
  }

  console.log('\n💡 Best practices:');
  console.log('   • Use built-in rate limiting to prevent hitting limits');
  console.log('   • Implement exponential backoff for retries');
  console.log('   • Add jitter to prevent thundering herd');
  console.log('   • Monitor rate limit headers in responses');
  console.log('   • Consider request queuing for high-volume apps');
  console.log('   • Cache responses when appropriate');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
