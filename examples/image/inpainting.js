/**
 * Image Inpainting Example
 *
 * This example demonstrates how to use the Venice AI API to inpaint an image,
 * which means modifying specific areas of an image with AI-generated content
 * by targeting specific objects and adding new elements.
 *
 * To run this example:
 * 1. Set your API key in the VENICE_API_KEY environment variable
 * 2. Have a source image ready for inpainting
 * 3. Run: node examples/image/inpainting.js
 */

const { VeniceAI } = require('../../dist');
const fs = require('fs');
const path = require('path');

// Initialize the client with your API key
const venice = new VeniceAI({
  apiKey: process.env.VENICE_API_KEY || 'your-api-key',
});

// Enable debug logging to see detailed information
venice.enableDebugLogging();

async function inpaintImage() {
  try {
    // Path to source image (use your own image path)
    const sourceImagePath = process.argv[2] || path.join(__dirname, '../../test-upscale/test-image.jpg');
    
    // Check if source image exists
    if (!fs.existsSync(sourceImagePath)) {
      console.error(`Error: Source image not found at ${sourceImagePath}`);
      console.log('Usage: node inpainting.js [source-image]');
      return;
    }
    
    console.log(`Using source image: ${sourceImagePath}`);
    
    // Output path for the inpainted image
    const outputPath = 'inpainted-image.png';
    
    // What to add to the image
    const prompt = "put a clown hat on the person";
    
    // What to target in the image (optional)
    const objectTarget = "the top of the head";
    
    // Negative prompt to avoid certain elements
    const negativePrompt = "blurry, distorted, low quality";
    
    console.log('Inpainting image...');
    console.log(`Prompt: "${prompt}"`);
    
    // Method 1: Basic inpainting (without targeting specific objects)
    console.log('\nMethod 1: Basic inpainting');
    
    const basicCommand = `inpaint-image "${sourceImagePath}" "${prompt}" -o ${outputPath} -n "${negativePrompt}"`;
    
    const basicResult = await venice.cli(basicCommand);
    
    console.log('Basic inpainting result:', basicResult);
    console.log(`Image saved to: ${outputPath}`);
    
    // Method 2: Advanced inpainting (targeting specific objects)
    console.log('\nMethod 2: Advanced inpainting with object targeting');
    
    const advancedCommand = `inpaint-image "${sourceImagePath}" "${prompt}" -o advanced-${outputPath} -n "${negativePrompt}" --object-target "${objectTarget}"`;
    
    const advancedResult = await venice.cli(advancedCommand);
    
    console.log('Advanced inpainting result:', advancedResult);
    console.log(`Image saved to: advanced-${outputPath}`);
    
    // Method 3: Using the programmatic interface (basic inpainting)
    console.log('\nMethod 3: Using programmatic interface (basic inpainting)');
    
    // Read source image
    const sourceImageBuffer = fs.readFileSync(sourceImagePath);
    const base64SourceImage = sourceImageBuffer.toString('base64');
    
    // Prepare parameters for the API call - basic inpainting
    const basicParams = {
      model: 'flux-dev',
      prompt: prompt,
      negative_prompt: negativePrompt,
      width: 1024,
      height: 1024,
      steps: 30,
      safe_mode: false,
      hide_watermark: true,
      cfg_scale: 7.0,
      inpaint: {
        strength: 50,
        source_image_base64: base64SourceImage
      }
    };
    
    // Make the API call
    const basicResponse = await venice.image.generate(basicParams);
    
    console.log('Basic API Response:', basicResponse);
    
    if (basicResponse.images && basicResponse.images[0] && basicResponse.images[0].url) {
      console.log(`Basic Image URL: ${basicResponse.images[0].url}`);
    }
    
    // Method 4: Using the programmatic interface (advanced inpainting with object targeting)
    console.log('\nMethod 4: Using programmatic interface (advanced inpainting)');
    
    // Prepare parameters for the API call - advanced inpainting
    const advancedParams = {
      model: 'flux-dev',
      prompt: prompt,
      negative_prompt: negativePrompt,
      width: 1024,
      height: 1024,
      steps: 30,
      safe_mode: false,
      hide_watermark: true,
      cfg_scale: 7.0,
      inpaint: {
        strength: 50,
        mask: {
          object_target: objectTarget,
          inferred_object: prompt
        },
        source_image_base64: base64SourceImage
      }
    };
    
    // Make the API call
    const advancedResponse = await venice.image.generate(advancedParams);
    
    console.log('Advanced API Response:', advancedResponse);
    
    if (advancedResponse.images && advancedResponse.images[0] && advancedResponse.images[0].url) {
      console.log(`Advanced Image URL: ${advancedResponse.images[0].url}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
inpaintImage();