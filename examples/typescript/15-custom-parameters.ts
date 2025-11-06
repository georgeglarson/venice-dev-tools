/**
 * Custom Parameters - Use Venice-specific features
 * 
 * This example demonstrates Venice AI's custom parameters
 * for enhanced functionality.
 * 
 * Features:
 * - Web search integration
 * - Character personas
 * - Custom system prompts
 * - Temperature and creativity controls
 * 
 * Run with: npx tsx examples/typescript/15-custom-parameters.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('🎛️  Custom Parameters Demo\n');

  // Example 1: Web Search Integration
  console.log('🌐 Example 1: Web Search Integration');
  console.log('═'.repeat(50));

  try {
    const webSearchResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { 
          role: 'user', 
          content: 'What are the latest developments in AI in 2025?' 
        }
      ],
      venice_parameters: {
        enable_web_search: 'on',  // 'on', 'off', or 'auto'
      }
    });

    console.log('✅ Response with web search:');
    console.log(webSearchResponse.choices[0].message.content);
    console.log('');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Example 2: Character Personas
  console.log('\n👤 Example 2: Character Personas');
  console.log('═'.repeat(50));

  try {
    const characterResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { 
          role: 'user', 
          content: 'Tell me about the history of Venice' 
        }
      ],
      venice_parameters: {
        character_slug: 'historian',  // Use a character persona
        include_venice_system_prompt: true,
      }
    });

    console.log('✅ Response with character persona:');
    console.log(characterResponse.choices[0].message.content);
    console.log('');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Example 3: Creativity Controls
  console.log('\n🎨 Example 3: Creativity Controls');
  console.log('═'.repeat(50));

  const prompt = 'Write a creative tagline for a coffee shop';

  console.log(`Prompt: "${prompt}"\n`);

  // Low creativity (temperature = 0.3)
  const conservativeResponse = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 50,
  });

  console.log('📊 Conservative (temperature=0.3):');
  console.log(conservativeResponse.choices[0].message.content);
  console.log('');

  // High creativity (temperature = 1.5)
  const creativeResponse = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.5,
    max_tokens: 50,
  });

  console.log('🎭 Creative (temperature=1.5):');
  console.log(creativeResponse.choices[0].message.content);
  console.log('');

  // Example 4: Response Format Control
  console.log('\n📋 Example 4: Response Format Control');
  console.log('═'.repeat(50));

  const formatResponse = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      { 
        role: 'user', 
        content: 'List 3 benefits of TypeScript in JSON format with keys: id, benefit, description' 
      }
    ],
    temperature: 0.7,
    // response_format: { type: 'json_object' }, // If supported
  });

  console.log('✅ Structured response:');
  console.log(formatResponse.choices[0].message.content);
  console.log('');

  // Summary
  console.log('\n💡 Available Parameters:');
  console.log('   Common parameters:');
  console.log('   • temperature: 0.0-2.0 (creativity level)');
  console.log('   • max_tokens: response length limit');
  console.log('   • top_p: nucleus sampling (0.0-1.0)');
  console.log('   • frequency_penalty: reduce repetition');
  console.log('   • presence_penalty: encourage topic diversity');
  console.log('');
  console.log('   Venice-specific:');
  console.log('   • enable_web_search: real-time web results');
  console.log('   • character_slug: use character personas');
  console.log('   • include_venice_system_prompt: use Venice defaults');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
