/**
 * Create a simple test image for upscaling tests
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a small 100x100 canvas
const width = 100;
const height = 100;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill with a gradient
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, 'blue');
gradient.addColorStop(0.5, 'white');
gradient.addColorStop(1, 'red');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Add some text
ctx.font = '20px Arial';
ctx.fillStyle = 'black';
ctx.fillText('Test', 30, 50);

// Save as JPEG
const buffer = canvas.toBuffer('image/jpeg');
fs.writeFileSync(path.join(__dirname, 'test-image.jpg'), buffer);

console.log('Test image created: test-image.jpg');