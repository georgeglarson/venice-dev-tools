/**
 * Reasoning Configuration - Thinking/reasoning models
 *
 * This example demonstrates how to configure reasoning (thinking)
 * capabilities in Venice AI's chat completions.
 *
 * Features:
 * - Using the reasoning parameter with effort and summary options
 * - Using the reasoning_effort shorthand parameter
 * - Accessing reasoning_content from responses
 * - Comparing outputs with different reasoning levels
 *
 * Prerequisites:
 * - VENICE_API_KEY environment variable set
 * - A reasoning-capable model (e.g., deepseek-r1-671b, qwen-2.5-coder)
 *
 * Run with: npx tsx examples/typescript/22-reasoning-config.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { ensureChatCompletionResponse } from './utils';
import { requireEnv } from './env-config';

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');
  const venice = new VeniceAI({ apiKey });

  // Use a reasoning-capable model
  const model = 'deepseek-r1-671b';
  const prompt = 'What is 37 * 48 + 129? Walk through your reasoning step by step.';

  console.log('🧠 Reasoning Configuration Demo\n');
  console.log(`Model: ${model}`);
  console.log(`Prompt: "${prompt}"\n`);

  // Example 1: High reasoning effort with concise summary
  console.log('🔬 Example 1: High Reasoning Effort');
  console.log('═'.repeat(50));

  try {
    const rawHighResponse = await venice.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      reasoning: {
        effort: 'high',
        summary: 'concise',
      },
    } as any);
    const highResponse = ensureChatCompletionResponse(rawHighResponse, 'High reasoning example');

    const highMessage = highResponse.choices[0].message;

    // Check for reasoning content (model's internal chain-of-thought)
    if ((highMessage as any).reasoning_content) {
      console.log('💭 Reasoning content:');
      console.log((highMessage as any).reasoning_content);
      console.log('');
    }

    const highContent = highMessage.content;
    console.log('✅ Final answer:');
    console.log(typeof highContent === 'string' ? highContent : JSON.stringify(highContent));

    // Display usage info if available
    if (highResponse.usage) {
      console.log(`\n📊 Tokens — prompt: ${highResponse.usage.prompt_tokens}, completion: ${highResponse.usage.completion_tokens}, total: ${highResponse.usage.total_tokens}`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Example 2: Low reasoning effort (faster, cheaper)
  console.log('\n\n⚡ Example 2: Low Reasoning Effort');
  console.log('═'.repeat(50));

  try {
    const rawLowResponse = await venice.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      reasoning: {
        effort: 'low',
        summary: 'concise',
      },
    } as any);
    const lowResponse = ensureChatCompletionResponse(rawLowResponse, 'Low reasoning example');

    const lowMessage = lowResponse.choices[0].message;

    if ((lowMessage as any).reasoning_content) {
      console.log('💭 Reasoning content:');
      console.log((lowMessage as any).reasoning_content);
      console.log('');
    }

    const lowContent = lowMessage.content;
    console.log('✅ Final answer:');
    console.log(typeof lowContent === 'string' ? lowContent : JSON.stringify(lowContent));

    if (lowResponse.usage) {
      console.log(`\n📊 Tokens — prompt: ${lowResponse.usage.prompt_tokens}, completion: ${lowResponse.usage.completion_tokens}, total: ${lowResponse.usage.total_tokens}`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Example 3: reasoning_effort shorthand
  console.log('\n\n🎯 Example 3: reasoning_effort Shorthand');
  console.log('═'.repeat(50));

  try {
    const rawShorthandResponse = await venice.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: 'Explain why the sky is blue in one paragraph.',
        },
      ],
      reasoning_effort: 'medium',
    } as any);
    const shorthandResponse = ensureChatCompletionResponse(rawShorthandResponse, 'Reasoning effort shorthand example');

    const shorthandMessage = shorthandResponse.choices[0].message;

    if ((shorthandMessage as any).reasoning_content) {
      console.log('💭 Reasoning content:');
      console.log((shorthandMessage as any).reasoning_content);
      console.log('');
    }

    const shorthandContent = shorthandMessage.content;
    console.log('✅ Response:');
    console.log(typeof shorthandContent === 'string' ? shorthandContent : JSON.stringify(shorthandContent));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Summary
  console.log('\n\n💡 Reasoning Configuration Tips:');
  console.log('   • reasoning.effort: "low" | "medium" | "high" — controls thinking depth');
  console.log('   • reasoning.summary: "concise" | "detailed" — controls summary verbosity');
  console.log('   • reasoning_effort: shorthand for setting effort without summary config');
  console.log('   • Higher effort = more tokens used, better for complex problems');
  console.log('   • Lower effort = faster and cheaper, fine for simple queries');
  console.log('   • reasoning_content in response contains the model\'s chain-of-thought');
  console.log('   • Not all models support reasoning — use deepseek-r1 or similar');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
