#!/usr/bin/env node
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to execute commands and handle errors
function runCommand(command) {
  try {
    console.log(`\n> ${command}`);
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\nError executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main setup function
async function setup() {
  console.log('\n=== Venice AI SDK Demo API Proxy Setup ===\n');
  
  // Check if Vercel CLI is installed
  try {
    execSync('npx vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI is available');
  } catch (error) {
    console.log('⚠️  Vercel CLI is not installed. Installing...');
    runCommand('npm install -g vercel');
  }
  
  // Login to Vercel if needed
  console.log('\n--- Vercel Authentication ---');
  console.log('You need to be logged in to Vercel to deploy the API proxy.');
  const loginChoice = await prompt('Do you want to log in to Vercel now? (y/n): ');
  
  if (loginChoice.toLowerCase() === 'y') {
    runCommand('npx vercel login');
  }
  
  // Get Venice API key
  console.log('\n--- Venice API Key ---');
  console.log('The API proxy needs your Venice API key to make requests to the Venice AI API.');
  console.log('This key will be stored securely as a Vercel environment variable.');
  
  const apiKey = await prompt('Enter your Venice API key: ');
  
  if (!apiKey) {
    console.error('Error: API key is required');
    rl.close();
    return;
  }
  
  // Create .env file for local development
  console.log('\n--- Creating .env file for local development ---');
  fs.writeFileSync(path.join(__dirname, '.env'), `VENICE_API_KEY=${apiKey}\n`);
  console.log('✅ Created .env file');
  
  // Link to Vercel project
  console.log('\n--- Linking to Vercel Project ---');
  console.log('Linking your codebase to a Vercel project...');
  
  runCommand('npx vercel link');
  
  // Set up Vercel environment variable
  console.log('\n--- Setting up Vercel environment variable ---');
  console.log('Adding your API key as a Vercel environment variable...');
  
  // Create a temporary file with the API key
  const envFilePath = path.join(__dirname, 'temp-api-key.txt');
  fs.writeFileSync(envFilePath, apiKey);
  
  // Add the environment variable to all environments (development, preview, production)
  console.log('Adding environment variable for development environment...');
  runCommand(`npx vercel env add VENICE_API_KEY development < ${envFilePath}`);
  
  console.log('Adding environment variable for preview environment...');
  runCommand(`npx vercel env add VENICE_API_KEY preview < ${envFilePath}`);
  
  console.log('Adding environment variable for production environment...');
  runCommand(`npx vercel env add VENICE_API_KEY production < ${envFilePath}`);
  
  // Remove the temporary file
  fs.unlinkSync(envFilePath);
  
  // Deploy to Vercel
  console.log('\n--- Deploying to Vercel ---');
  console.log('This will deploy the API proxy to Vercel.');
  const deployChoice = await prompt('Do you want to deploy now? (y/n): ');
  
  if (deployChoice.toLowerCase() === 'y') {
    const result = runCommand('npx vercel --prod');
    
    if (result) {
      console.log('\n✅ Deployment successful!');
      
      // Get the deployment URL
      console.log('\n--- Updating Frontend Configuration ---');
      console.log('Please enter the deployment URL provided by Vercel.');
      const deployUrl = await prompt('Deployment URL (e.g., https://venice-demo-proxy.vercel.app): ');
      
      if (deployUrl) {
        // Update the demo.js file with the deployment URL
        const demoJsPath = path.join(__dirname, '..', 'docs', 'assets', 'js', 'demo.js');
        
        if (fs.existsSync(demoJsPath)) {
          let demoJs = fs.readFileSync(demoJsPath, 'utf8');
          
          // Replace the API URL
          demoJs = demoJs.replace(
            /const response = await fetch\(`https:\/\/[^`]+\/api\/${endpoint}`/,
            `const response = await fetch(\`${deployUrl}/api/\${endpoint}\``
          );
          
          fs.writeFileSync(demoJsPath, demoJs);
          console.log(`✅ Updated ${demoJsPath} with your deployment URL`);
        } else {
          console.error(`Error: Could not find ${demoJsPath}`);
        }
      }
    }
  }
  
  console.log('\n=== Setup Complete ===');
  console.log('\nNext steps:');
  console.log('1. Push the changes to your GitHub repository');
  console.log('2. GitHub Actions will automatically build and deploy the site to GitHub Pages');
  console.log('3. Your live demo will be available at your GitHub Pages URL');
  
  rl.close();
}

// Run the setup
setup().catch(error => {
  console.error('Error during setup:', error);
  rl.close();
});