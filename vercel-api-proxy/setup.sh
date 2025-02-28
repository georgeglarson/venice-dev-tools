#!/bin/bash

# Venice AI SDK Demo API Proxy Setup Script

echo "=== Venice AI SDK Demo API Proxy Setup ==="
echo "This script will help you set up and deploy the API proxy to Vercel."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Run the setup script
node setup.js

# Exit with the same status as the setup script
exit $?