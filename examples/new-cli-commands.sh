#!/bin/bash
# Example script demonstrating the new CLI commands added to the Venice AI SDK
#
# This script shows how to use the Characters API and VVV API CLI commands.
#
# To run this example:
# chmod +x examples/new-cli-commands.sh
# ./examples/new-cli-commands.sh

# Set your API key (or it will use the one from your config)
# export VENICE_API_KEY="your-api-key-here"

echo "Venice AI SDK - New CLI Commands Demo"
echo "===================================="
echo

# Characters API
echo "=== Characters API ==="
echo
echo "Listing all characters:"
venice list-characters

echo
echo "Listing characters with limit option (showing only 5):"
venice list-characters --limit 5

echo

# VVV API
echo "=== VVV API ==="
echo
echo "Getting VVV circulating supply:"
venice vvv-supply

echo
echo "Getting VVV network utilization:"
venice vvv-utilization

echo
echo "Getting VVV staking yield:"
venice vvv-yield

echo
echo "Getting VVV circulating supply (raw JSON output):"
venice vvv-supply --raw

echo
echo "Demo completed successfully!"