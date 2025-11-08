/**
 * Streaming Chat - Real-time response streaming
 * 
 * This example demonstrates how to stream chat completions for
 * responsive, real-time applications like chatbots.
 * 
 * Streaming provides:
 * - Faster time-to-first-token
 * - Better user experience (progressive display)
 * - Lower perceived latency
 * 
 * Run with: npx tsx examples/typescript/02-streaming-chat.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { requireEnv } from './env-config';
import { isAsyncIterable, isChatCompletionResponse } from './utils';

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');

  const venice = new VeniceAI({ apiKey });

  console.log('🤖 Assistant: ');
  console.log('');

  try {
    // Create a streaming chat completion
    const stream = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'Write a short haiku about coding.' }
      ],
      stream: true  // Enable streaming mode
    });

    if (!isAsyncIterable<any>(stream)) {
      if (isChatCompletionResponse(stream)) {
        console.warn('Received a non-streaming response; falling back to full message.');
        console.log(stream.choices[0].message.content);
      } else {
        console.warn('Received unexpected response type; nothing to display.');
      }
      return;
    }

    // Process each chunk as it arrives
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        // Write without newline to show progressive output
        process.stdout.write(delta);
      }
    }

    console.log('\n');
    console.log('✅ Stream completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
