/**
 * Advanced Image Generation Example
 * 
 * This example demonstrates how to use the Venice AI API to generate images
 * with advanced parameters and different models.
 * 
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Run: node examples/image/advanced-image-generation.js
 */

const { VeniceAI } = require('../../dist');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

// Helper function to download an image
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', () => {
        console.log(`Image saved to ${outputPath}`);
        resolve(outputPath);
      });
    }).on('error', (err) => {
      reject(new Error(`Error downloading image: ${err.message}`));
    });
  });
}

async function generateImages() {
  try {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    console.log('Generating images with different models and parameters...');
    
    // Example 1: Basic image generation with fluently-xl
    try {
      console.log('\n1. Basic image generation with fluently-xl');
      const basicResult = await venice.cli('generate-image "a beautiful sunset over mountains" -o output/basic.png');
      console.log(`Image URL: ${basicResult.images[0].url}`);
    } catch (error) {
      console.log('Error with basic image generation:', error.message);
    }
    
    // Example 2: Using stable-diffusion-3.5 with negative prompt
    try {
      console.log('\n2. Using stable-diffusion-3.5 with negative prompt');
      const sdResult = await venice.cli(
        'generate-image "a futuristic cityscape with flying cars" ' +
        '-m stable-diffusion-3.5 ' +
        '-n "blurry, low quality, distorted" ' +
        '-o output/sd-cityscape.png'
      );
      console.log(`Image URL: ${sdResult.images[0].url}`);
    } catch (error) {
      console.log('Error with stable-diffusion-3.5 image generation:', error.message);
      console.log('Note: Some models may not be available in all environments.');
    }
    
    // Example 3: Using flux model with custom dimensions
    try {
      console.log('\n3. Using flux model with custom dimensions');
      const fluxResult = await venice.cli(
        'generate-image "a photorealistic portrait of a cyberpunk character" ' +
        '-m flux ' +
        '-h 768 -w 512 ' +
        '-o output/flux-portrait.png'
      );
      console.log(`Image URL: ${fluxResult.images[0].url}`);
    } catch (error) {
      console.log('Error with flux model image generation:', error.message);
      console.log('Note: Some models may not be available in all environments.');
    }
    
    // Example 4: Using advanced parameters (steps, cfg-scale, seed)
    try {
      console.log('\n4. Using advanced parameters (steps, cfg-scale, seed)');
      const advancedResult = await venice.cli(
        'generate-image "a magical forest with glowing mushrooms and fairies" ' +
        '--steps 50 ' +
        '--cfg-scale 9.0 ' +
        '--seed 42 ' + // Fixed seed for reproducibility
        '-o output/advanced-forest.png'
      );
      console.log(`Image URL: ${advancedResult.images[0].url}`);
    } catch (error) {
      console.log('Error with advanced parameters image generation:', error.message);
    }
    
    // Example 5: Using programmatic interface
    try {
      console.log('\n5. Using programmatic interface');
      const programmaticResult = await venice.image.generate({
        model: 'fluently-xl',
        prompt: 'an astronaut riding a horse on mars, digital art',
        negative_prompt: 'low quality, blurry',
        height: 1024,
        width: 1024,
        steps: 30,
        cfg_scale: 7.5,
        hide_watermark: true,
        safe_mode: true
      });
      
      // Download the image
      if (programmaticResult.images && programmaticResult.images[0].url) {
        await downloadImage(
          programmaticResult.images[0].url,
          path.join(outputDir, 'programmatic-astronaut.png')
        );
      }
    } catch (error) {
      console.log('Error with programmatic image generation:', error.message);
      console.log('Note: Direct API calls may require specific permissions or may not be available in all environments.');
    }
    
    console.log('\nAll images generated successfully!');
    console.log(`Check the ${outputDir} directory to view the generated images.`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
generateImages();