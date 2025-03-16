#!/usr/bin/env node

// This is a standalone CLI entry point for the Venice AI SDK
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