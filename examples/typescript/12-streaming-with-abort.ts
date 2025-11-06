/**
 * Streaming with Abort - Cancel streaming requests
 * 
 * This example shows how to abort streaming requests,
 * useful for implementing stop buttons in UIs.
 * 
 * Features:
 * - AbortController for cancellation
 * - Timeout handling
 * - Graceful cleanup
 * 
 * Run with: npx tsx examples/typescript/12-streaming-with-abort.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';

async function streamWithTimeout(timeoutMs: number = 3000) {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log(`⏱️  Starting stream with ${timeoutMs}ms timeout...\n`);
  console.log('🤖 Assistant: ');

  try {
    // Create abort controller
    const abortController = new AbortController();

    // Set timeout to abort the stream
    const timeoutId = setTimeout(() => {
      console.log('\n\n⚠️  Timeout reached - aborting stream...');
      abortController.abort();
    }, timeoutMs);

    // Start streaming
    const stream = await venice.chat.stream.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { 
          role: 'user', 
          content: 'Write a long story about a space adventure. Make it at least 500 words.' 
        }
      ],
      // Note: AbortSignal support would be added to SDK
      // signal: abortController.signal,
    });

    let chunkCount = 0;
    let totalContent = '';

    // Process stream
    for await (const chunk of stream) {
      // Check if aborted
      if (abortController.signal.aborted) {
        console.log('\n🛑 Stream aborted by user');
        break;
      }

      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        process.stdout.write(delta);
        totalContent += delta;
        chunkCount++;
      }
    }

    // Clean up
    clearTimeout(timeoutId);

    console.log('\n\n✅ Stream completed!');
    console.log(`📊 Chunks received: ${chunkCount}`);
    console.log(`📏 Total characters: ${totalContent.length}`);

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('\n🛑 Stream was aborted');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }
}

async function manualAbort() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('\n\n📖 Example: Manual abort with user input');
  console.log('════════════════════════════════════════\n');
  console.log('Press Ctrl+C to abort the stream\n');

  const abortController = new AbortController();

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 User requested abort...');
    abortController.abort();
    process.exit(0);
  });

  try {
    console.log('🤖 Assistant: ');

    const stream = await venice.chat.stream.createCompletion({
      model: 'llama-3.3-70b',
      messages: [
        { 
          role: 'user', 
          content: 'Tell me a very long story about artificial intelligence.' 
        }
      ],
    });

    for await (const chunk of stream) {
      if (abortController.signal.aborted) {
        break;
      }

      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        process.stdout.write(delta);
      }

      // Simulate slow processing to make abort easier to test
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n\n✅ Stream completed!');

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('\n🛑 Stream aborted successfully');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }
}

async function main() {
  console.log('🚀 Streaming with Abort Control\n');
  console.log('Example 1: Automatic timeout');
  console.log('═'.repeat(50));

  // Demo 1: Timeout abort
  await streamWithTimeout(3000);

  // Demo 2: Manual abort
  await manualAbort();
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
