/**
 * Venice AI SDK - Image Generation Example
 * 
 * This example demonstrates how to use the Venice AI SDK to generate images
 * using various models and parameters.
 */

// Import the Venice AI SDK
const { VeniceNode } = require('@venice-ai/node');
const fs = require('fs');
const path = require('path');

// Create a new Venice client
// You can provide your API key here or set it as an environment variable: VENICE_API_KEY
const venice = new VeniceNode({
  apiKey: process.env.VENICE_API_KEY,
  // Optional configuration
  timeout: 120000, // 120 seconds (image generation can take longer)
  maxConcurrent: 3, // Maximum concurrent requests
  requestsPerMinute: 30 // Rate limit
});

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Basic image generation example
async function basicImageGenerationExample() {
  console.log('Basic Image Generation Example:');
  console.log('-----------------------------');
  
  try {
    // Generate an image
    const response = await venice.images.generate({
      model: 'stable-diffusion-3', // Specify the model to use
      prompt: 'A futuristic city with flying cars and neon lights',
      n: 1, // Number of images to generate
      size: 1024 // Image size (1024x1024 pixels)
    });
    
    console.log('Image generated successfully:');
    console.log(`URL: ${response.data[0].url}`);
    
    // Download and save the image
    const imageUrl = response.data[0].url;
    const imagePath = path.join(outputDir, 'basic-image.png');
    
    // Download logic would go here
    console.log(`Image would be saved to: ${imagePath}`);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Advanced image generation example with more options
async function advancedImageGenerationExample() {
  console.log('Advanced Image Generation Example:');
  console.log('--------------------------------');
  
  try {
    // Generate multiple images with more parameters
    const response = await venice.images.generate({
      model: 'stable-diffusion-3',
      prompt: 'A serene landscape with mountains, a lake, and a sunset',
      n: 2, // Generate 2 images
      size: 1024,
      quality: 'hd', // Higher quality
      style: 'photographic', // Photographic style
      negative_prompt: 'blurry, distorted, low quality' // Elements to avoid
    });
    
    console.log('Images generated successfully:');
    
    // Process each generated image
    for (let i = 0; i < response.data.length; i++) {
      const imageUrl = response.data[i].url;
      console.log(`Image ${i+1} URL: ${imageUrl}`);
      
      // Download and save the image
      const imagePath = path.join(outputDir, `advanced-image-${i+1}.png`);
      
      // Download logic would go here
      console.log(`Image would be saved to: ${imagePath}`);
    }
    
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Image variation example
async function imageVariationExample() {
  console.log('Image Variation Example:');
  console.log('----------------------');
  
  try {
    // In a real application, you would load an actual image file
    // For this example, we'll simulate having an image
    const imagePath = path.join(__dirname, 'sample-image.png');
    console.log(`Using sample image from: ${imagePath} (simulated)`);
    
    // Normally, you would read the file like this:
    // const imageBuffer = fs.readFileSync(imagePath);
    
    // For this example, we'll skip the actual API call
    console.log('Creating variations of the image...');
    
    // Simulate the response
    const simulatedResponse = {
      data: [
        { url: 'https://api.venice.ai/images/variations/1' },
        { url: 'https://api.venice.ai/images/variations/2' }
      ]
    };
    
    console.log('Image variations generated successfully:');
    
    // Process each variation
    for (let i = 0; i < simulatedResponse.data.length; i++) {
      const imageUrl = simulatedResponse.data[i].url;
      console.log(`Variation ${i+1} URL: ${imageUrl}`);
      
      // Download and save the image
      const imagePath = path.join(outputDir, `variation-${i+1}.png`);
      
      // Download logic would go here
      console.log(`Image would be saved to: ${imagePath}`);
    }
    
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Image upscaling example
async function imageUpscalingExample() {
  console.log('Image Upscaling Example:');
  console.log('-----------------------');
  
  try {
    // In a real application, you would load an actual image file
    // For this example, we'll simulate having an image
    const imagePath = path.join(__dirname, 'sample-small-image.png');
    console.log(`Using sample image from: ${imagePath} (simulated)`);
    
    // Normally, you would read the file like this:
    // const imageBuffer = fs.readFileSync(imagePath);
    
    // For this example, we'll skip the actual API call
    console.log('Upscaling the image...');
    
    // Simulate the response
    const simulatedResponse = {
      url: 'https://api.venice.ai/images/upscaled/1'
    };
    
    console.log('Image upscaled successfully:');
    console.log(`URL: ${simulatedResponse.url}`);
    
    // Download and save the image
    const outputPath = path.join(outputDir, 'upscaled-image.png');
    
    // Download logic would go here
    console.log(`Image would be saved to: ${outputPath}`);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
async function runExamples() {
  await basicImageGenerationExample();
  await advancedImageGenerationExample();
  await imageVariationExample();
  await imageUpscalingExample();
}

runExamples().catch(console.error);