/**
 * Simple test to verify that we can import and use the Venice AI SDK
 */

const { createClient } = require('./utils/test-utils');

// Create a client instance using the test utilities
const client = createClient();

console.log('Client created successfully:', client instanceof Object);

// Test that we can access the client's properties
console.log('Client has image API:', client.image instanceof Object);
console.log('Client has chat API:', client.chat instanceof Object);
console.log('Client has models API:', client.models instanceof Object);

console.log('Simple test completed successfully');