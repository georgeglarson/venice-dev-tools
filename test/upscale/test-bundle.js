// Test using the bundle.js file directly
const fs = require('fs');
const path = require('path');

// Load the bundle.js file
const bundlePath = path.resolve(__dirname, '../../dist/bundle.js');
console.log('Bundle path:', bundlePath);
console.log('Bundle exists:', fs.existsSync(bundlePath));

// Execute the bundle.js file
try {
  const bundle = require(bundlePath);
  console.log('Bundle exports:', bundle);
  
  if (typeof bundle === 'function') {
    console.log('Bundle is a constructor');
    const instance = new bundle({ apiKey: 'test' });
    console.log('Instance:', instance);
  } else {
    console.log('Bundle is not a constructor');
  }
} catch (error) {
  console.error('Error loading bundle:', error.message);
}