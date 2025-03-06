#!/bin/bash

# Setup script for creating a virtual environment and installing the Venice command
# This allows testing the CLI commands directly using the 'venice' command

# Create a virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate the virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Build the Venice package
echo "Building the Venice package..."
npm run build

# Install the package in development mode
echo "Installing the package in development mode..."
npm link

# Verify the installation
echo "Verifying the installation..."
which venice
venice --version

echo ""
echo "Setup complete! You can now use the 'venice' command directly."
echo ""
echo "To test the process-file command:"
echo "venice process-file test/sample.pdf"
echo ""
echo "To test the chat command with --attach option:"
echo "venice chat \"Analyze this file for me\" --attach test/sample.pdf"
echo ""
echo "Remember to set your API key:"
echo "export VENICE_API_KEY=your-api-key-here"
echo ""
echo "To deactivate the virtual environment when done:"
echo "deactivate"