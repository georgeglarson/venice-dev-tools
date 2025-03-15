#!/usr/bin/env node

// Simple test script for the Venice AI SDK
const { VeniceNode } = require('./packages/node/dist/index.js');

// Get API key from environment variable or use a default for testing
const apiKey = process.env.VENICE_API_KEY || 'YOUR_API_KEY_HERE';

// Create a new client with the API key
const venice = new VeniceNode({
  apiKey
});

// Test the API key by listing models
console.log('Testing API key...');
venice.models.list({ type: 'text' })
  .then(response => {
    console.log('API key is valid!');
    console.log('Models:', JSON.stringify(response, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });