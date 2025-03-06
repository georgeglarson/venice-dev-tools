---
layout: default
title: Venice AI SDK - Image API Reference
---

# Image API Reference

The Image API allows you to generate and manipulate images using Venice AI's powerful image models.

## Table of Contents

- [Generate Images](#generate-images)
- [Upscale Images](#upscale-images)
- [List Image Styles](#list-image-styles)
- [Inpainting](#inpainting)

## Generate Images

Generate images from text prompts using various models and styles.

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | No | The model to use for image generation. Default is 'fluently-xl'. |
| prompt | string | Yes | The text prompt to generate an image from. |
| negative_prompt | string | No | Text to exclude from the image generation. |
| style_preset | string | No | Style preset to apply to the generated image. |
| width | number | No | Width of the generated image. Default is 1024. |
| height | number | No | Height of the generated image. Default is 1024. |
| safe_mode | boolean | No | Whether to enable safe mode. Default is false. |

### Response

| Field | Type | Description |
|-------|------|-------------|
| images | array | Array of generated images. |
| images[].url | string | URL to the generated image. |
| images[].b64_json | string | Base64-encoded image data (if requested). |

### Example

```javascript
const { VeniceAI } = require('venice-dev-tools');

const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

async function generateImage() {
  const response = await venice.image.generate({
    model: 'fluently-xl',
    prompt: 'A beautiful sunset over a mountain range',
    negative_prompt: 'blurry, distorted, low quality',
    style_preset: '3D Model',
    height: 1024,
    width: 1024
  });
  
  console.log(response.images[0].url);
  
  // Download the image
  const imageUrl = response.images[0].url;
  const https = require('https');
  const fs = require('fs');
  const file = fs.createWriteStream('sunset.png');
  
  https.get(imageUrl, function(response) {
    response.pipe(file);
    file.on('finish', () => {
      console.log('Image saved to sunset.png');
    });
  }).on('error', (err) => {
    console.error('Error downloading image:', err.message);
  });
}

generateImage();
```

## Upscale Images

Enhance the resolution of existing images using AI upscaling.

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image | string or Buffer | Yes | The image to upscale, either as a base64-encoded string or a Buffer. |
| scale | number | No | The scale factor to upscale by. Must be either 2 or 4. Default is 2. |
| model | string | No | The model to use for upscaling. |
| return_binary | boolean | No | Whether to return binary data instead of a URL. Default is false. |

### Response

| Field | Type | Description |
|-------|------|-------------|
| url | string | URL to the upscaled image (if return_binary is false). |
| b64_json | string | Base64-encoded image data (if requested). |
| binary | Buffer | Binary image data (if return_binary is true). |

### Example

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');

const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

async function upscaleImage() {
  // Read an image file
  const imageBuffer = fs.readFileSync('image.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await venice.image.upscale({
    image: base64Image,
    scale: 2
  });
  
  // If the response contains a URL
  if (response.url) {
    console.log(`Upscaled image URL: ${response.url}`);
    
    // Download the image
    const https = require('https');
    const file = fs.createWriteStream('upscaled-image.jpg');
    
    https.get(response.url, function(response) {
      response.pipe(file);
      file.on('finish', () => {
        console.log('Upscaled image saved to upscaled-image.jpg');
      });
    }).on('error', (err) => {
      console.error('Error downloading image:', err.message);
    });
  }
  
  // If the response contains base64 data
  if (response.b64_json) {
    const imageData = Buffer.from(response.b64_json, 'base64');
    fs.writeFileSync('upscaled-image.jpg', imageData);
    console.log('Upscaled image saved to upscaled-image.jpg');
  }
}

upscaleImage();
```

### Important Notes

- The API has a strict 4.5MB post limit for file uploads. Ensure your image is under this limit.
- Only scale factors of 2 and 4 are supported.
- The upscaled image will maintain the same aspect ratio as the original.

## List Image Styles

Retrieve a list of available style presets for image generation.

### Response

| Field | Type | Description |
|-------|------|-------------|
| styles | array | Array of available style presets. |
| styles[].id | string | Unique identifier for the style. |
| styles[].name | string | Human-readable name of the style. |
| styles[].description | string | Description of the style. |

### Example

```javascript
const { VeniceAI } = require('venice-dev-tools');

const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

async function listStyles() {
  const response = await venice.image.styles.list();
  
  console.log(`Available styles: ${response.styles.length}`);
  
  // Print all available styles
  response.styles.forEach(style => {
    console.log(`- ${style.name}: ${style.description || 'No description'}`);
  });
}

listStyles();
```

## Inpainting

Modify specific parts of an image using a mask.

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | No | The model to use for inpainting. Default is 'fluently-xl'. |
| prompt | string | Yes | The text prompt to guide the inpainting. |
| negative_prompt | string | No | Text to exclude from the inpainting. |
| image | string or Buffer | Yes | The base image to modify, either as a base64-encoded string or a Buffer. |
| mask | string or Buffer | Yes | The mask defining the areas to modify, either as a base64-encoded string or a Buffer. |
| width | number | No | Width of the output image. Default is the original image width. |
| height | number | No | Height of the output image. Default is the original image height. |
| safe_mode | boolean | No | Whether to enable safe mode. Default is false. |

### Response

Same as [Generate Images](#generate-images).

### Example

```javascript
const { VeniceAI } = require('venice-dev-tools');
const fs = require('fs');

const venice = new VeniceAI({
  apiKey: 'your-api-key',
});

async function inpaintImage() {
  // Read an image file
  const imageBuffer = fs.readFileSync('image.jpg');
  const base64Image = imageBuffer.toString('base64');
  
  // Read a mask file
  const maskBuffer = fs.readFileSync('mask.png');
  const base64Mask = maskBuffer.toString('base64');
  
  const response = await venice.image.generate({
    model: 'fluently-xl',
    prompt: 'A beautiful sunset',
    image: base64Image,
    mask: base64Mask
  });
  
  console.log(`Inpainted image URL: ${response.images[0].url}`);
  
  // Download the image
  const https = require('https');
  const file = fs.createWriteStream('inpainted-image.jpg');
  
  https.get(response.images[0].url, function(response) {
    response.pipe(file);
    file.on('finish', () => {
      console.log('Inpainted image saved to inpainted-image.jpg');
    });
  }).on('error', (err) => {
    console.error('Error downloading image:', err.message);
  });
}

inpaintImage();
```

## CLI Usage

The Venice AI SDK also provides a command-line interface for image operations.

### Generate Image

```bash
venice generate-image "A beautiful sunset over mountains" --model fluently-xl --style "3D Model" --width 1024 --height 768 --output sunset.png
```

### Upscale Image

```bash
venice upscale-image path/to/image.jpg --scale 2 --output upscaled-image.jpg
```

### Inpaint Image

```bash
venice inpaint-image path/to/image.jpg "A beautiful sunset" --mask path/to/mask.png --output inpainted-image.jpg
```

### List Styles

```bash
venice list-styles
```

## File Size Limitations

All API endpoints that accept file uploads have a strict 4.5MB post limit. Ensure your images are under this limit before uploading.