#!/usr/bin/env node

// This is a standalone CLI entry point for the Venice AI SDK
try {
  // Try to require the CLI code from the node package
  require('../packages/node/dist/cli/index.js');
} catch (error) {
  console.error('Error loading Venice CLI:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Install with pnpm (recommended):');
  console.error('   npm install -g pnpm');
  console.error('   npm uninstall -g venice-dev-tools');
  console.error('   pnpm add -g venice-dev-tools');
  console.error('2. If you prefer npm, try reinstalling:');
  console.error('   npm uninstall -g venice-dev-tools && npm install -g venice-dev-tools');
  console.error('3. Try running the fix script:');
  console.error('   npm explore venice-dev-tools -- npm run fix-cli');
  console.error('4. Check if the CLI binary is properly linked:');
  console.error('   - On Linux/macOS: ln -s $(npm root -g)/venice-dev-tools/bin/venice-cli.js /usr/local/bin/venice');
  console.error('   - On Windows: mklink C:\\Users\\YourUsername\\AppData\\Roaming\\npm\\venice.cmd %APPDATA%\\npm\\node_modules\\venice-dev-tools\\bin\\venice-cli.js');
  process.exit(1);
}