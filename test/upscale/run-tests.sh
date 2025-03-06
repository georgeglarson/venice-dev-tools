#!/bin/bash
# Upscale Tests Runner
#
# This script runs all the upscale-related tests.
#
# Usage:
#   VENICE_API_KEY=your-api-key ./run-tests.sh

# Get the absolute path to the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables from .env file if present
if [ -f "$TEST_DIR/.env" ]; then
  export $(grep -v '^#' "$TEST_DIR/.env" | xargs)
  echo "Loaded environment variables from $TEST_DIR/.env"
fi

# Check if API key is set
if [ -z "$VENICE_API_KEY" ]; then
  echo "Error: VENICE_API_KEY environment variable is not set"
  echo "Please set it before running the tests:"
  echo "VENICE_API_KEY=your_api_key_here ./run-tests.sh"
  exit 1
fi

echo "=== Running Upscale Tests ==="

# Make the script executable
chmod +x "$SCRIPT_DIR/run-tests.sh"

# Run the basic upscale test
echo -e "\nRunning basic upscale test..."
cd "$SCRIPT_DIR"
node test-upscale.js
BASIC_TEST_RESULT=$?

# Run the supported scale values test
echo -e "\nRunning test for supported scale values..."
cd "$SCRIPT_DIR"
node test-upscale-supported.js
SUPPORTED_TEST_RESULT=$?

# Uncomment any of the following lines to run additional tests
# echo -e "\nRunning detailed upscale test..."
# node "$SCRIPT_DIR/test-upscale-detailed.js"
# DETAILED_TEST_RESULT=$?

# echo -e "\nRunning multipart upscale test..."
# node "$SCRIPT_DIR/test-upscale-multipart.js"
# MULTIPART_TEST_RESULT=$?

# echo -e "\nRunning different sizes test..."
# node "$SCRIPT_DIR/test-upscale-sizes.js"
# SIZES_TEST_RESULT=$?

# echo -e "\nRunning validation test..."
# node "$SCRIPT_DIR/test-upscale-validation.js"
# VALIDATION_TEST_RESULT=$?

# echo -e "\nRunning aspect ratios test..."
# node "$SCRIPT_DIR/test-upscale-aspect-ratios.js"
# ASPECT_TEST_RESULT=$?

# echo -e "\nRunning performance test..."
# node "$SCRIPT_DIR/test-upscale-performance.js"
# PERFORMANCE_TEST_RESULT=$?

# Summary
echo -e "\n=== Test Summary ==="
echo "Basic Upscale Test: $([ $BASIC_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
echo "Supported Scale Values Test: $([ $SUPPORTED_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"

# Uncomment if running additional tests
# echo "Detailed Upscale Test: $([ $DETAILED_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
# echo "Multipart Upscale Test: $([ $MULTIPART_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
# echo "Different Sizes Test: $([ $SIZES_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
# echo "Validation Test: $([ $VALIDATION_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
# echo "Aspect Ratios Test: $([ $ASPECT_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"
# echo "Performance Test: $([ $PERFORMANCE_TEST_RESULT -eq 0 ] && echo '✅ Passed' || echo '❌ Failed')"

# Overall result
if [ $BASIC_TEST_RESULT -eq 0 ] && [ $SUPPORTED_TEST_RESULT -eq 0 ]; then
  echo -e "\n✅ All tests passed!"
  exit 0
else
  echo -e "\n❌ Some tests failed!"
  exit 1
fi