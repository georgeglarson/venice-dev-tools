#!/bin/bash

# This script fixes the venice CLI installation without requiring sudo
# Run with: bash fix-venice-cli-simple.sh

echo "Venice CLI Installation Fix (No Sudo)"
echo "=================================="
echo

# Find npm global directory
NPM_PREFIX=$(npm config get prefix)
echo "NPM prefix: $NPM_PREFIX"

# Find the venice-dev-tools package
PACKAGE_DIR=$(npm root -g)/venice-dev-tools
if [ ! -d "$PACKAGE_DIR" ]; then
  echo "Error: venice-dev-tools package not found in global node_modules."
  echo "Please install it first: npm install -g venice-dev-tools"
  exit 1
fi
echo "Package directory: $PACKAGE_DIR"

# Create bin directory if it doesn't exist
if [ ! -d "$PACKAGE_DIR/bin" ]; then
  echo "Creating bin directory..."
  mkdir -p "$PACKAGE_DIR/bin"
fi

# Create the CLI script
echo "Creating CLI script..."
cat > "$PACKAGE_DIR/bin/venice-cli.js" << 'EOF'
#!/usr/bin/env node

// This is the CLI entry point for the Venice AI SDK
try {
  // Try to require the CLI code from the node package
  require('../packages/node/dist/cli/index.js');
} catch (error) {
  console.error('Error loading Venice CLI:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Make sure you have installed the package correctly: npm install -g venice-dev-tools');
  console.error('2. Try reinstalling: npm uninstall -g venice-dev-tools && npm install -g venice-dev-tools');
  console.error('3. Check if the CLI binary is properly linked:');
  console.error('   - On Linux/macOS: ln -s $(npm root -g)/venice-dev-tools/bin/venice-cli.js ~/bin/venice');
  console.error('   - On Windows: mklink C:\\Users\\YourUsername\\AppData\\Roaming\\npm\\venice.cmd %APPDATA%\\npm\\node_modules\\venice-dev-tools\\bin\\venice-cli.js');
  process.exit(1);
}
EOF

# Make the script executable
chmod +x "$PACKAGE_DIR/bin/venice-cli.js"
echo "Made CLI script executable"

# Create user bin directory if it doesn't exist
USER_BIN_DIR="$HOME/bin"
if [ ! -d "$USER_BIN_DIR" ]; then
  echo "Creating user bin directory: $USER_BIN_DIR"
  mkdir -p "$USER_BIN_DIR"
  
  # Add to PATH if not already there
  if [[ ":$PATH:" != *":$USER_BIN_DIR:"* ]]; then
    echo "Adding $USER_BIN_DIR to PATH in ~/.bashrc"
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    echo "You'll need to restart your terminal or run 'source ~/.bashrc' for the PATH change to take effect"
  fi
fi

# Create symlink to the CLI script
echo "Creating symlink in $USER_BIN_DIR..."
if [ -f "$USER_BIN_DIR/venice" ]; then
  echo "Removing existing symlink..."
  rm "$USER_BIN_DIR/venice"
fi
ln -s "$PACKAGE_DIR/bin/venice-cli.js" "$USER_BIN_DIR/venice"
echo "Created symlink: $USER_BIN_DIR/venice"

echo
echo "Installation complete!"
echo "If you've just added ~/bin to your PATH, you'll need to restart your terminal or run 'source ~/.bashrc'"
echo "Then try running: venice --help"