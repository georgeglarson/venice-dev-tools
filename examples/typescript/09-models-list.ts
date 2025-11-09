/**
 * Models List - Discover available AI models
 * 
 * This example shows how to list and inspect available models
 * from Venice AI.
 * 
 * Use this to:
 * - Discover available models
 * - Check model capabilities
 * - Find the right model for your task
 * 
 * Run with: npx tsx examples/typescript/09-models-list.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { requireEnv } from './env-config';

async function main() {
  const apiKey = requireEnv('VENICE_API_KEY');

  const venice = new VeniceAI({ apiKey });

  console.log('🤖 Fetching available models...\n');

  try {
    // List all available models
    const response = await venice.models.list();

    console.log('✅ Models retrieved successfully!\n');
    console.log(`📊 Total models: ${response.data.length}\n`);

    // Group models by type/capability
    const modelsByType: Record<string, any[]> = {};
    
    response.data.forEach((model) => {
      // Try to categorize by model id
      let category = 'Other';
      
      if (model.id.includes('gpt') || model.id.includes('llama') || model.id.includes('claude')) {
        category = 'Chat/Completion';
      } else if (model.id.includes('dall-e') || model.id.includes('image')) {
        category = 'Image Generation';
      } else if (model.id.includes('whisper')) {
        category = 'Audio';
      } else if (model.id.includes('embedding')) {
        category = 'Embeddings';
      } else if (model.id.includes('tts')) {
        category = 'Text-to-Speech';
      }
      
      if (!modelsByType[category]) {
        modelsByType[category] = [];
      }
      modelsByType[category].push(model);
    });

    // Display models by category
    Object.entries(modelsByType).forEach(([category, models]) => {
      console.log(`\n📁 ${category} Models (${models.length}):`);
      console.log('─'.repeat(60));
      
      models.forEach((model) => {
        console.log(`\n  🔹 ${model.id}`);
        if (model.owned_by) {
          console.log(`     Owner: ${model.owned_by}`);
        }
        if (model.created) {
          const date = new Date(model.created * 1000);
          console.log(`     Created: ${date.toLocaleDateString()}`);
        }
      });
    });

    console.log('\n\n💡 Tips:');
    console.log('   • Use chat models for conversations and text generation');
    console.log('   • Use embedding models for semantic search');
    console.log('   • Use image models for image generation');
    console.log('   • Check model pricing and rate limits in Venice AI docs');
    console.log('');

    // Example: Get specific model details
    if (response.data.length > 0) {
      const exampleModel = response.data.find(m => m.id.includes('llama')) || response.data[0];
      
      console.log('📋 Example model details:');
      console.log(JSON.stringify(exampleModel, null, 2));
    }

  } catch (error: any) {
    console.error('❌ Error fetching models:', error.message);
    process.exit(1);
  }
}

main();
