#!/bin/bash

# Run all tests in the test directory

echo "Running all tests..."

# Get the absolute path to the test directory
TEST_DIR="$(cd "$(dirname "$0")" && pwd)"

# Run the upscale tests
echo "Running upscale tests..."
cd "$TEST_DIR/upscale"
if [ -f "./run-tests.sh" ]; then
  ./run-tests.sh
else
  echo "Warning: upscale test script not found"
fi

# Run other tests
echo "Running other tests..."
cd "$TEST_DIR"
if [ -f "./test-improvements.js" ]; then
  node test-improvements.js
else
  echo "Warning: test-improvements.js not found"
fi

echo "All tests completed."