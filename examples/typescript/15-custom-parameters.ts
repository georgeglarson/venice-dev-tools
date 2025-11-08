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
import { ensureChatCompletionResponse } from './utils';
import { requireEnv } from './env-config';

function toText(content: string | { type: string }[]): string {
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

  const venice = new VeniceAI({ apiKey });

  console.log('🎛️  Custom Parameters Demo\n');

  // Example 1: Web Search Integration
  console.log('🌐 Example 1: Web Search Integration');
  console.log('═'.repeat(50));

  try {
    const rawWebSearchResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { 
          role: 'user', 
          content: 'What are the latest developments in AI in 2025?' 
        }
      ],
      venice_parameters: {
        enable_web_search: 'on',  // 'on', 'off', or 'auto'
      } as any
    });
    const webSearchResponse = ensureChatCompletionResponse(rawWebSearchResponse, 'Web search example');

    console.log('✅ Response with web search:');
    console.log(toText(webSearchResponse.choices[0].message.content));
    console.log('');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Example 2: Character Personas
  console.log('\n👤 Example 2: Character Personas');
  console.log('═'.repeat(50));

  try {
    let characterSlug = 'historian';
    try {
      const characters = await venice.characters.list();
      if (characters.data.length) {
        characterSlug = characters.data[0].slug;
      } else {
        console.warn('⚠️  No characters returned by API; falling back to default slug "historian".');
      }
    } catch (characterError) {
      console.warn('⚠️  Unable to fetch characters list; continuing with "historian" slug.');
    }

    const rawCharacterResponse = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { 
          role: 'user', 
          content: 'Tell me about the history of Venice' 
        }
      ],
      venice_parameters: {
        character_slug: characterSlug,  // Use a character persona
        include_venice_system_prompt: true,
      } as any
    });
    const characterResponse = ensureChatCompletionResponse(rawCharacterResponse, 'Character persona example');

    console.log('✅ Response with character persona:');
    console.log(toText(characterResponse.choices[0].message.content));
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
  const rawConservativeResponse = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 50,
  });
  const conservativeResponse = ensureChatCompletionResponse(rawConservativeResponse, 'Conservative creativity example');

  console.log('📊 Conservative (temperature=0.3):');
  console.log(toText(conservativeResponse.choices[0].message.content));
  console.log('');

  // High creativity (temperature = 1.5)
  const rawCreativeResponse = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.5,
    max_tokens: 50,
  });
  const creativeResponse = ensureChatCompletionResponse(rawCreativeResponse, 'Creative creativity example');

  console.log('🎭 Creative (temperature=1.5):');
  console.log(toText(creativeResponse.choices[0].message.content));
  console.log('');

  // Example 4: Response Format Control
  console.log('\n📋 Example 4: Response Format Control');
  console.log('═'.repeat(50));

  const rawFormatResponse = await venice.chat.completions.create({
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
  const formatResponse = ensureChatCompletionResponse(rawFormatResponse, 'Response format example');

  console.log('✅ Structured response:');
  console.log(toText(formatResponse.choices[0].message.content));
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
