/**
 * Script to create a test PDF file for the PDF processing examples
 */
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Create a document
const doc = new PDFDocument();

// Pipe its output to a file
doc.pipe(fs.createWriteStream('./examples/test-document.pdf'));

// Add the title
doc.fontSize(20).text('Venice AI SDK - PDF Processing Test Document', {
  align: 'center'
});

doc.moveDown();

// Add the introduction
doc.fontSize(12).text(
  'This is a sample document to test the PDF processing capabilities of the Venice AI SDK.',
  { align: 'left' }
);

doc.moveDown();

// Add the description of PDF processing modes
doc.fontSize(14).text('The Venice AI SDK v2.1 introduces enhanced PDF processing with three modes:');
doc.moveDown(0.5);
doc.fontSize(12).text('1. Image mode: Send the PDF as an image (default behavior)');
doc.text('2. Text mode: Extract text from the PDF and send as text');
doc.text('3. Both mode: Extract both text and images, sending multiple content items');

doc.moveDown();

// Add the benefits section
doc.fontSize(14).text('Benefits of different modes:');
doc.moveDown(0.5);
doc.fontSize(12).text('- Image mode is best for PDFs with complex layouts, charts, or diagrams');
doc.text('- Text mode is best for text-heavy documents like research papers or articles');
doc.text('- Both mode provides the most comprehensive analysis but uses more tokens');

doc.moveDown();

// Add code examples
doc.fontSize(14).text('Example usage in code:');
doc.moveDown(0.5);
doc.fontSize(10).text(
  '// Process a PDF file with different modes\n' +
  'const imageContent = await venice.utils.processFile(pdfPath);\n' +
  'const textContent = await venice.utils.processFile(pdfPath, { pdfMode: \'text\' });\n' +
  'const bothContent = await venice.utils.processFile(pdfPath, { pdfMode: \'both\' });',
  { align: 'left' }
);

doc.moveDown();

// Add CLI examples
doc.fontSize(14).text('Example usage in CLI:');
doc.moveDown(0.5);
doc.fontSize(10).text(
  '# Process PDF as text\n' +
  'venice chat completion --model llama-3.3-70b --attach document.pdf --pdf-mode text',
  { align: 'left' }
);

doc.moveDown();

// Add conclusion
doc.fontSize(12).text(
  'This document can be used to test the different PDF processing modes and compare their results.',
  { align: 'left' }
);

// Add a simple chart to test image mode
doc.moveDown(2);
doc.fontSize(14).text('Sample Chart (to test image mode):', { align: 'center' });
doc.moveDown();

// Draw a simple bar chart
const chartWidth = 400;
const chartHeight = 200;
const margin = 50;
const x = (doc.page.width - chartWidth) / 2;
const y = doc.y;

// Draw chart background
doc.rect(x, y, chartWidth, chartHeight).stroke();

// Draw bars
const barWidth = 80;
const barSpacing = 40;
const barValues = [150, 100, 180, 80];
const barLabels = ['Image', 'Text', 'Both', 'Default'];
const maxValue = Math.max(...barValues);

barValues.forEach((value, i) => {
  const barHeight = (value / maxValue) * (chartHeight - margin);
  const barX = x + margin + i * (barWidth + barSpacing);
  const barY = y + chartHeight - barHeight;
  
  // Draw bar
  doc.rect(barX, barY, barWidth, barHeight)
    .fillAndStroke(i === 2 ? '#a0c8e0' : '#e0a0a0', '#000000');
  
  // Add label
  doc.fontSize(10).text(barLabels[i], barX, y + chartHeight + 5, {
    width: barWidth,
    align: 'center'
  });
  
  // Add value
  doc.fontSize(10).text(value.toString(), barX, barY - 15, {
    width: barWidth,
    align: 'center'
  });
});

// Finalize the PDF and end the stream
doc.end();

console.log('Test PDF created at: ./examples/test-document.pdf');