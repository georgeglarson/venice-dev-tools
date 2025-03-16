#!/bin/bash

# This script fixes the venice CLI installation
# Run with: bash fix-venice-cli.sh

echo "Venice CLI Installation Fix"
echo "=========================="
echo
echo "NOTE: For best results, we recommend using pnpm instead of npm:"
echo "  npm install -g pnpm"
echo "  npm uninstall -g venice-dev-tools"
echo "  pnpm add -g venice-dev-tools"
echo "  pnpm approve-builds -g"
echo
echo "Continuing with fix script..."
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
  console.error('   - On Linux/macOS: ln -s $(npm root -g)/venice-dev-tools/bin/venice-cli.js /usr/local/bin/venice');
  console.error('   - On Windows: mklink C:\\Users\\YourUsername\\AppData\\Roaming\\npm\\venice.cmd %APPDATA%\\npm\\node_modules\\venice-dev-tools\\bin\\venice-cli.js');
  process.exit(1);
}
EOF

# Make the script executable
chmod +x "$PACKAGE_DIR/bin/venice-cli.js"
echo "Made CLI script executable"

# Install dependencies for the node package
NODE_PACKAGE_DIR="$PACKAGE_DIR/packages/node"
if [ -d "$NODE_PACKAGE_DIR" ]; then
  echo "Installing dependencies for the node package..."
  cd "$NODE_PACKAGE_DIR" && npm install --no-save
  echo "Successfully installed node package dependencies"
else
  echo "Warning: Node package directory not found: $NODE_PACKAGE_DIR"
fi

# Install dependencies in the main package
echo "Installing dependencies in the main package..."
cd "$PACKAGE_DIR" && npm install --no-save
echo "Successfully installed main package dependencies"

# Create symlink to the CLI script
BIN_DIR="/usr/local/bin"
if [ -d "$BIN_DIR" ]; then
  echo "Creating symlink in $BIN_DIR..."
  if [ -f "$BIN_DIR/venice" ]; then
    echo "Removing existing symlink..."
    sudo rm "$BIN_DIR/venice"
  fi
  sudo ln -s "$PACKAGE_DIR/bin/venice-cli.js" "$BIN_DIR/venice"
  echo "Created symlink: $BIN_DIR/venice"
else
  echo "Warning: $BIN_DIR directory not found."
  echo "You may need to manually create a symlink:"
  echo "sudo ln -s $PACKAGE_DIR/bin/venice-cli.js /usr/local/bin/venice"
fi

echo
echo "Installation complete!"
echo "Try running: venice --help"