// Simple test script for the Venice AI SDK
const { VeniceAI } = require('./packages/core/dist');

// Create a new Venice AI client
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key-here'
});

// Log the available endpoints
console.log('Available endpoints:', venice.getRegisteredEndpoints());

// Test that we can access the endpoints
console.log('Chat endpoint available:', !!venice.chat);
console.log('Models endpoint available:', !!venice.models);
console.log('Images endpoint available:', !!venice.images);
console.log('Keys endpoint available:', !!venice.keys);
console.log('Characters endpoint available:', !!venice.characters);

console.log('SDK initialized successfully!');