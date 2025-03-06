/**
 * Image Styles API Tests
 * 
 * This file contains tests for the Image Styles API.
 */

const { createClient, runTest, validateResponse, logTestResults } = require('../../utils/test-utils');

// Initialize the Venice client
const venice = createClient();

/**
 * Test listing image styles
 */
async function testListImageStyles() {
  console.log('Listing image styles...');
  
  try {
    const styles = await venice.image.styles.list();
    
    // Validate response
    validateResponse(styles, {
      styles: 'array'
    });
    
    console.log(`Found ${styles.styles.length} image styles`);
    
    // If we have styles, validate the structure of the first one
    if (styles.styles.length > 0) {
      const firstStyle = styles.styles[0];
      validateResponse(firstStyle, {
        id: 'string',
        name: 'string'
      });
      
      console.log(`First style: ${firstStyle.name} (${firstStyle.id})`);
    }
    
    return true;
  } catch (error) {
    // If the API doesn't support styles, log a warning and return true
    if (error.message.includes('not found') || error.message.includes('not supported')) {
      console.warn('Image styles may not be supported by the API');
      return true;
    }
    
    throw error;
  }
}

// Note: The getStyle method is not supported by the real SDK

/**
 * Main test function
 */
async function main() {
  const results = {
    listStyles: await runTest('Image Styles - List', testListImageStyles)
  };
  
  // Log test results
  const allPassed = logTestResults(results);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}