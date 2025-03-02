#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  echo "Please create a .env file with your Venice API key:"
  echo "VENICE_API_KEY=your_api_key_here"
  exit 1
fi

# Check if API key is set
if [ -z "$VENICE_API_KEY" ]; then
  echo "Error: VENICE_API_KEY is not set in .env file"
  exit 1
fi

echo "Using Venice API key from .env file"

# Run the supported scale values test
echo "Running test for supported scale values (2 and 4)..."
node test-upscale-supported.js

# Uncomment any of the following lines to run additional tests
# echo -e "\nRunning basic upscale test..."
# node test-upscale.js

# echo -e "\nRunning detailed upscale test..."
# node test-upscale-detailed.js

# echo -e "\nRunning multipart upscale test..."
# node test-upscale-multipart.js

# echo -e "\nRunning different sizes test..."
# node test-upscale-sizes.js

# echo -e "\nRunning validation test..."
# node test-upscale-validation.js

# echo -e "\nRunning aspect ratios test..."
# node test-upscale-aspect-ratios.js

# echo -e "\nRunning performance test..."
# node test-upscale-performance.js