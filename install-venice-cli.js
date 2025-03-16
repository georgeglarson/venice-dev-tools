#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find the global node_modules directory
let npmRoot;
try {
  npmRoot = execSync('npm root -g').toString().trim();
  console.log(`Found npm global directory: ${npmRoot}`);
} catch (error) {
  console.error('Failed to find npm global directory:', error.message);
  process.exit(1);
}

// Path to the venice-dev-tools package
const packagePath = path.join(npmRoot, 'venice-dev-tools');
if (!fs.existsSync(packagePath)) {
  console.error(`Venice Dev Tools package not found at ${packagePath}`);
  console.error('Please install it first: npm install -g venice-dev-tools');
  process.exit(1);
}

// Create the bin directory if it doesn't exist
const binDir = path.join(packagePath, 'bin');
if (!fs.existsSync(binDir)) {
  console.log(`Creating bin directory: ${binDir}`);
  fs.mkdirSync(binDir, { recursive: true });
}

// Create the CLI script
const cliScript = `#!/usr/bin/env node

// This is the CLI entry point for the Venice AI SDK
try {
  // Try to require the CLI code from the node package
  require('../packages/node/dist/cli/index.js');
} catch (error) {
  console.error('Error loading Venice CLI:', error.message);
  console.error('\\nTroubleshooting:');
  console.error('1. Make sure you have installed the package correctly: npm install -g venice-dev-tools');
  console.error('2. Try reinstalling: npm uninstall -g venice-dev-tools && npm install -g venice-dev-tools');
  console.error('3. Check if the CLI binary is properly linked:');
  console.error('   - On Linux/macOS: ln -s $(npm root -g)/venice-dev-tools/bin/venice-cli.js /usr/local/bin/venice');
  console.error('   - On Windows: mklink C:\\\\Users\\\\YourUsername\\\\AppData\\\\Roaming\\\\npm\\\\venice.cmd %APPDATA%\\\\npm\\\\node_modules\\\\venice-dev-tools\\\\bin\\\\venice-cli.js');
  process.exit(1);
}`;

const cliScriptPath = path.join(binDir, 'venice-cli.js');
console.log(`Creating CLI script: ${cliScriptPath}`);
fs.writeFileSync(cliScriptPath, cliScript);

// Make the script executable
try {
  fs.chmodSync(cliScriptPath, '755');
  console.log('Made CLI script executable');
} catch (error) {
  console.error('Failed to make CLI script executable:', error.message);
}

// Create a symlink to the CLI script
const isWindows = process.platform === 'win32';
if (isWindows) {
  // Windows symlink
  const npmPath = process.env.APPDATA + '\\npm';
  const targetPath = npmPath + '\\venice.cmd';
  
  console.log(`Creating Windows command file: ${targetPath}`);
  
  // Create a .cmd file that calls the CLI script
  const cmdContent = `@echo off\r\nnode "${cliScriptPath}" %*`;
  fs.writeFileSync(targetPath, cmdContent);
  
  console.log(`Created Windows command file: ${targetPath}`);
} else {
  // Unix symlink
  const binPath = '/usr/local/bin/venice';
  
  console.log(`Creating symlink from ${cliScriptPath} to ${binPath}`);
  
  try {
    // Remove existing symlink if it exists
    if (fs.existsSync(binPath)) {
      fs.unlinkSync(binPath);
    }
    
    // Create the symlink
    fs.symlinkSync(cliScriptPath, binPath);
    console.log(`Created symlink: ${binPath}`);
  } catch (error) {
    console.error(`Failed to create symlink. Try running with sudo: sudo node ${__filename}`);
    console.error(`Or manually create the symlink: sudo ln -s ${cliScriptPath} ${binPath}`);
  }
}

console.log('\nInstallation complete!');
console.log('Try running: venice --help');