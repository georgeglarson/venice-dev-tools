#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Make the CLI script executable
try {
  const cliPath = path.join(__dirname, 'venice-cli.js');
  fs.chmodSync(cliPath, '755');
  console.log(`Made CLI executable: ${cliPath}`);
} catch (error) {
  console.error('Failed to make CLI executable:', error.message);
}

// Create a symlink to the CLI script
try {
  const isWindows = process.platform === 'win32';
  const cliPath = path.join(__dirname, 'venice-cli.js');
  
  if (isWindows) {
    // Windows symlink
    const npmPath = process.env.APPDATA + '\\npm';
    const targetPath = npmPath + '\\venice.cmd';
    
    console.log(`Creating symlink from ${cliPath} to ${targetPath}`);
    
    // Create a .cmd file that calls the CLI script
    const cmdContent = `@echo off\r\nnode "${cliPath}" %*`;
    fs.writeFileSync(targetPath, cmdContent);
    
    console.log(`Created Windows command file: ${targetPath}`);
  } else {
    // Unix symlink
    const binPath = '/usr/local/bin/venice';
    
    console.log(`Creating symlink from ${cliPath} to ${binPath}`);
    
    try {
      // Remove existing symlink if it exists
      if (fs.existsSync(binPath)) {
        fs.unlinkSync(binPath);
      }
      
      // Create the symlink
      fs.symlinkSync(cliPath, binPath);
      console.log(`Created symlink: ${binPath}`);
    } catch (error) {
      console.error(`Failed to create symlink. Try running with sudo: sudo node ${__filename}`);
      console.error(`Or manually create the symlink: sudo ln -s ${cliPath} ${binPath}`);
    }
  }
} catch (error) {
  console.error('Failed to create symlink:', error.message);
  console.error('\nTry manually creating the symlink:');
  console.error(`- On Linux/macOS: sudo ln -s ${path.join(__dirname, 'venice-cli.js')} /usr/local/bin/venice`);
  console.error(`- On Windows: mklink C:\\Users\\YourUsername\\AppData\\Roaming\\npm\\venice.cmd ${path.join(__dirname, 'venice-cli.js')}`);
}