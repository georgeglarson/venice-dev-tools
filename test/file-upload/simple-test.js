/**
 * Simple test for the file-upload module
 * 
 * This script verifies that the module can be imported and the functions are available.
 */

// Import the module
const fileUpload = require('../../src/resources/file-upload/index.ts');

console.log('Testing file-upload module...');
console.log('=============================');

// Check if the module exports the expected functions
const expectedFunctions = [
  'processFile',
  'prepareFileForUpload',
  'resizeImageIfNeeded',
  'attachFileToMessage',
  'processFileWithClient',
  'prepareFile',
  'resizeImage',
  'attachFile'
];

let passed = 0;
let total = expectedFunctions.length;

for (const funcName of expectedFunctions) {
  if (typeof fileUpload[funcName] === 'function') {
    console.log(`✅ Function '${funcName}' is exported and is a function`);
    passed++;
  } else {
    console.log(`❌ Function '${funcName}' is not exported or is not a function`);
  }
}

console.log('\nTest Results:');
console.log(`Passed: ${passed}/${total} tests`);

if (passed === total) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}