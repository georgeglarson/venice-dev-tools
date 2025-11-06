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

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('🤖 Assistant: ');
  console.log('');

  try {
    // Create a streaming chat completion
    const stream = await venice.chat.stream.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'user', content: 'Write a short haiku about coding.' }
      ]
    });

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
