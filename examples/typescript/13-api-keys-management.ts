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

async function main() {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    console.error('❌ VENICE_API_KEY not set');
    process.exit(1);
  }

  const venice = new VeniceAI({ apiKey });

  console.log('🔑 API Keys Management Demo\n');

  try {
    // List all API keys
    console.log('📋 Listing all API keys...\n');
    
    const listResponse = await venice.keys.list();
    
    console.log(`✅ Found ${listResponse.data.length} API key(s)\n`);

    // Display keys
    listResponse.data.forEach((key, index) => {
      console.log(`${index + 1}. Key: ${key.id}`);
      console.log(`   Name: ${key.name || '(unnamed)'}`);
      console.log(`   Created: ${new Date(key.created_at).toLocaleString()}`);
      console.log(`   Status: ${key.status || 'active'}`);
      
      if (key.last_used_at) {
        console.log(`   Last used: ${new Date(key.last_used_at).toLocaleString()}`);
      }
      
      if (key.rate_limit) {
        console.log(`   Rate limit: ${JSON.stringify(key.rate_limit)}`);
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
