/**
 * API Keys Management - Manage your API keys
 * 
 * This example demonstrates how to programmatically manage
 * Venice AI API keys.
 * 
 * Features:
 * - List all API keys
 * - Create new keys
 * - Retrieve key details
 * - Delete keys
 * 
 * Run with: npx tsx examples/typescript/13-api-keys-management.ts
 */

import { VeniceAI } from '@venice-dev-tools/core';
import { requireEnv } from './env-config';

function formatDate(value?: string | null): string {
  return value ? new Date(value).toLocaleString() : 'Unknown';
}

async function main() {
  const adminApiKey = process.env.VENICE_ADMIN_API_KEY ?? process.env.VENICE_API_KEY;
  if (!adminApiKey) {
    requireEnv('VENICE_API_KEY');
    process.exit(1);
  }

  if (!process.env.VENICE_ADMIN_API_KEY) {
    console.warn('⚠️  VENICE_ADMIN_API_KEY not set; using VENICE_API_KEY instead. Admin endpoints may fail if this key lacks permissions.');
    console.log('');
  }

  const venice = new VeniceAI({ apiKey: adminApiKey });

  console.log('🔑 API Keys Management Demo\n');

  try {
    // List all API keys
    console.log('📋 Listing all API keys...\n');
    
    const listResponse = await venice.keys.list();
    
    console.log(`✅ Found ${listResponse.data.length} API key(s)\n`);

    // Display keys
    listResponse.data.forEach((key, index) => {
      const description = key.description ?? key.name ?? '(unnamed)';
      const createdAt = key.createdAt ?? key.created_at;
      const lastUsedAt = key.lastUsedAt ?? key.last_used_at;
      const consumptionLimits = key.consumptionLimits;

      console.log(`${index + 1}. Key: ${key.id}`);
      console.log(`   Description: ${description}`);
      console.log(`   Type: ${key.apiKeyType}`);
      console.log(`   Created: ${formatDate(createdAt)}`);
      
      if (lastUsedAt) {
        console.log(`   Last used: ${formatDate(lastUsedAt)}`);
      }
      
      if (consumptionLimits) {
        console.log(`   Consumption limits: ${JSON.stringify(consumptionLimits)}`);
      }
      
      console.log('');
    });

    // Example: Retrieve specific key details
    if (listResponse.data.length > 0) {
      const firstKey = listResponse.data[0];
      
      console.log(`🔍 Retrieving details for key: ${firstKey.id}...\n`);
      
      const keyDetails = await venice.keys.retrieve(firstKey.id);
      
      console.log('Key details:');
      console.log(JSON.stringify(keyDetails, null, 2));
      console.log('');
    }

    // Example: Create a new API key (commented out for safety)
    /*
    console.log('➕ Creating a new API key...\n');
    
    const newKey = await venice.keys.create({
      name: 'Test Key',
      // scopes: ['read', 'write'], // Optional: restrict permissions
    });
    
    console.log('✅ New key created:');
    console.log(`   ID: ${newKey.id}`);
    console.log(`   Key: ${newKey.key}`); // ⚠️ Save this! It's only shown once
    console.log('');
    console.log('⚠️  Important: Save the key value now - it won\'t be shown again!');
    console.log('');
    */

    // Example: Delete a key (commented out for safety)
    /*
    if (newKey) {
      console.log(`🗑️  Deleting key: ${newKey.id}...\n`);
      
      await venice.keys.delete(newKey.id);
      
      console.log('✅ Key deleted successfully');
    }
    */

    console.log('💡 Best practices for API keys:');
    console.log('   • Rotate keys regularly');
    console.log('   • Use different keys for different environments');
    console.log('   • Never commit keys to version control');
    console.log('   • Set appropriate rate limits');
    console.log('   • Delete unused keys');

  } catch (error: any) {
    console.error('❌ Error managing API keys:', error.message);
    
    if (error.statusCode === 403) {
      console.error('   💡 Make sure your API key has admin permissions');
    }
    
    process.exit(1);
  }
}

main();
