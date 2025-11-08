/**
 * Venice AI JavaScript Utilities
 * 
 * Shared helper functions for JavaScript examples.
 * Provides environment handling, type checking, and response validation.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from .env files.
 * Searches multiple locations in priority order.
 * 
 * @returns {void}
 */
function loadEnv() {
  const locations = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env'),
  ];

  for (const location of locations) {
    if (fs.existsSync(location)) {
      const envContent = fs.readFileSync(location, 'utf-8');
      
      envContent.split('\n').forEach(line => {
        line = line.trim();
        
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) return;
        
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // Remove surrounding quotes
          value = value.replace(/^["'](.*)["']$/, '$1');
          
          // Only set if not already defined
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      
      console.log(`📄 Loaded environment from: ${location}\n`);
      return;
    }
  }
}

/**
 * Get required environment variable or exit with helpful message.
 * 
 * @param {string} key - Environment variable name
 * @returns {string} Environment variable value
 */
function requireEnv(key) {
  const value = process.env[key];
  
  if (!value) {
    console.error(`❌ Error: ${key} environment variable is not set\n`);
    console.error('   💡 Tips:');
    console.error('      1. Create a .env file: echo \'VENICE_API_KEY=your-key\' > .env');
    console.error('      2. Or export it: export VENICE_API_KEY=\'your-key\'');
    console.error('      3. Get your key at: https://venice.ai/settings/api\n');
    process.exit(1);
  }
  
  return value;
}

/**
 * Get optional environment variable with default value.
 * 
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Environment variable value or default
 */
function getEnv(key, defaultValue) {
  return process.env[key] || defaultValue;
}

/**
 * Check if value is an async iterable (for streaming detection).
 * 
 * @param {any} value - Value to check
 * @returns {boolean} True if value is async iterable
 */
function isAsyncIterable(value) {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof value[Symbol.asyncIterator] === 'function'
  );
}

/**
 * Check if result is a non-streaming chat completion response.
 * 
 * @param {any} result - Result to check
 * @returns {boolean} True if result is a chat completion response
 */
function isChatCompletionResponse(result) {
  return (
    result != null &&
    typeof result === 'object' &&
    !isAsyncIterable(result) &&
    'choices' in result &&
    Array.isArray(result.choices) &&
    result.choices.length > 0
  );
}

/**
 * Ensure result is a chat completion response or throw helpful error.
 * 
 * @param {any} result - Result to validate
 * @param {string} context - Context for error message
 * @returns {object} Validated chat completion response
 * @throws {Error} If result is not a valid response
 */
function ensureChatCompletionResponse(result, context = 'response') {
  if (!isChatCompletionResponse(result)) {
    console.error(`⚠️  Warning: Expected non-streaming response but got async iterable or invalid ${context}`);
    console.error('   💡 Tip: Check that stream: false (or omit stream parameter)\n');
    throw new Error(`Invalid ${context}: expected chat completion response`);
  }
  
  return result;
}

/**
 * Save content to file with helpful output.
 * 
 * @param {string} filePath - Path to save file
 * @param {Buffer|string} content - Content to save
 * @returns {void}
 */
function saveFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  const fullPath = path.resolve(filePath);
  const stats = fs.statSync(filePath);
  const size = (stats.size / 1024).toFixed(2);
  
  console.log(`📁 Saved to: ${filePath}`);
  console.log(`   Path: ${fullPath}`);
  console.log(`   Size: ${size} KB\n`);
}

/**
 * Format error with user-friendly message and tips.
 * 
 * @param {Error} error - Error to format
 * @returns {void}
 */
function formatError(error) {
  console.error(`❌ Error: ${error.message}\n`);
  
  // Check if it's a Venice SDK error with additional context
  if (error.statusCode) {
    console.error(`   Status Code: ${error.statusCode}`);
  }
  
  if (error.code) {
    console.error(`   Error Code: ${error.code}`);
  }
  
  // Provide contextual tips based on error type
  const errorType = error.constructor.name;
  
  switch (errorType) {
    case 'VeniceAuthError':
      console.error('\n   💡 Tip: Check your VENICE_API_KEY is valid');
      console.error('      Get a new key at: https://venice.ai/settings/api');
      break;
      
    case 'VeniceRateLimitError':
      console.error('\n   💡 Tip: You\'re making requests too quickly');
      console.error('      Wait a moment and try again, or upgrade your plan');
      if (error.retryAfter) {
        console.error(`      Retry after: ${error.retryAfter} seconds`);
      }
      break;
      
    case 'VeniceValidationError':
      console.error('\n   💡 Tip: Check your request parameters');
      console.error('      Review the API documentation for required fields');
      break;
      
    case 'VeniceNetworkError':
      console.error('\n   💡 Tip: Check your internet connection');
      console.error('      The API might be temporarily unavailable');
      break;
      
    default:
      console.error('\n   💡 Tip: Check the error message above for details');
  }
  
  console.error('');
}

/**
 * Display usage statistics from response.
 * 
 * @param {object} response - Chat completion response
 * @returns {void}
 */
function displayUsage(response) {
  if (response.usage) {
    const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
    console.log(`📊 Usage: ${prompt_tokens} prompt + ${completion_tokens} completion = ${total_tokens} total tokens\n`);
  }
}

module.exports = {
  loadEnv,
  requireEnv,
  getEnv,
  isAsyncIterable,
  isChatCompletionResponse,
  ensureChatCompletionResponse,
  saveFile,
  formatError,
  displayUsage,
};
