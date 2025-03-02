// Test importing the module
try {
  const VeniceAI = require('../../dist');
  console.log('Successfully imported VeniceAI:', VeniceAI);
} catch (error) {
  console.error('Error importing VeniceAI:', error.message);
}

try {
  const VeniceAI = require('../..');
  console.log('Successfully imported VeniceAI from root:', VeniceAI);
} catch (error) {
  console.error('Error importing VeniceAI from root:', error.message);
}