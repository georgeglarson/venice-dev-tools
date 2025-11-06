/**
 * Hello World - Your first Venice AI API call
 * 
 * This example shows the absolute minimum needed to use the SDK.
 * Perfect for beginners to get started quickly.
 * 
 * Prerequisites:
 * - Node.js 18+ installed
 * - VENICE_API_KEY environment variable set
 * 
 * Run with: npx tsx examples/typescript/01-hello-world.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';

async function main() {
  // Check for API key
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: VENICE_API_KEY environment variable not set');
    console.error('📝 Get your API key at: https://venice.ai/settings/api');
    console.error('💡 Set it with: export VENICE_API_KEY="your-api-key-here"');
    process.exit(1);
  }

  // Initialize the Venice AI client
  const venice = new VeniceAI({ apiKey });

  console.log('🤖 Sending your first message to Venice AI...\n');

  // Create a simple chat completion
  const response = await venice.chat.createCompletion({
    model: 'llama-3.3-70b',
    messages: [
      { role: 'user', content: 'Say hello and introduce yourself in one sentence!' }
    ]
  });

  // Print the response
  console.log('✨ Response:');
  console.log(response.choices[0].message.content);
  console.log('\n✅ Success! You just made your first Venice AI API call.');
}

// Run the example
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
