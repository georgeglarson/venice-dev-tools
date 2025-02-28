#!/usr/bin/env node
import { Command } from 'commander';
import { VeniceAI } from './index';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as readline from 'readline';

// Get package version
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// Load config from user's home directory
const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.venice-config.json');
let config: { apiKey?: string } = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  // Config file doesn't exist yet
}

const program = new Command();

program
  .name('venice')
  .description('Venice AI CLI - Interact with Venice AI API from the command line')
  .version(version)
  .option('-d, --debug', 'Enable debug output')
  .hook('preAction', (thisCommand) => {
    // Store debug flag in a global variable
    (global as any).debug = thisCommand.opts().debug;
  });

// Configure API key
program
  .command('configure')
  .description('Configure your Venice API key')
  .action(() => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter your Venice API key: ', (apiKey) => {
      fs.writeFileSync(configPath, JSON.stringify({ apiKey }));
      console.log('API key saved successfully!');
      rl.close();
    });
  });

// Helper function for debug logging
const debugLog = (message: string, data?: any) => {
  if ((global as any).debug) {
    console.log(`Debug - ${message}:`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Create a function to get the Venice client
const getClient = () => {
  const apiKey = process.env.VENICE_API_KEY || config.apiKey;
  
  if (!apiKey) {
    console.error('Error: API key not found. Please set the VENICE_API_KEY environment variable or run "venice configure"');
    process.exit(1);
  }
  
  const client = new VeniceAI({
    apiKey,
  });
  
  // Enable debug logging in the SDK if debug flag is set
  if ((global as any).debug) {
    client.enableDebugLogging();
  }
  
  return client;
};

// List API keys
program
  .command('list-keys')
  .description('List your Venice API keys')
  .action(async () => {
    try {
      const venice = getClient();
      const response = await venice.apiKeys.list();
      
      if (response.keys.length === 0) {
        console.log('No API keys found.');
        return;
      }
      
      // Log detailed information in debug mode
      if (response.keys.length > 0) {
        debugLog('First key details', response.keys[0]);
        debugLog('Response metadata', response._metadata);
      }
      
      console.log('API Keys:');
      console.table(response.keys.map((key: any) => ({
        id: key.id,
        name: key.name || key.description,
        created: key.createdAt ? new Date(key.createdAt).toLocaleString() : 'N/A',
        expires: key.expiresAt ? new Date(key.expiresAt).toLocaleString() : 'N/A'
      })));
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Create API key
program
  .command('create-key')
  .description('Create a new Venice API key')
  .requiredOption('-n, --name <name>', 'Name for the new API key')
  .action(async (options) => {
    try {
      const venice = getClient();
      const response = await venice.apiKeys.create({
        name: options.name
      });
      
      debugLog('Create key response', response);
      console.log('API Key created successfully:');
      console.log(`ID: ${response.key.id}`);
      console.log(`Key: ${response.key.key}`);
      console.log(`Name: ${response.key.description || options.name}`);
      console.log(`Created: ${new Date(response.key.createdAt).toLocaleString()}`);
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Delete API key
program
  .command('delete-key')
  .description('Delete a Venice API key')
  .requiredOption('-i, --id <id>', 'ID of the API key to delete')
  .action(async (options) => {
    try {
      const venice = getClient();
      const response = await venice.apiKeys.delete({
        id: options.id
      });
      
      debugLog('Delete key response', response);
      if (response.success) {
        console.log(`API Key ${options.id} deleted successfully.`);
      } else {
        console.log('Failed to delete API key.');
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Get API key rate limits
program
  .command('rate-limits')
  .description('Get rate limits for your API key')
  .option('-m, --model <model>', 'Get rate limits for a specific model')
  .action(async (options) => {
    try {
      const venice = getClient();
      
      if (options.model) {
        const modelLimits = await venice.apiKeys.getModelRateLimits(options.model);
        debugLog('Model rate limits response', modelLimits);
        console.log(`Rate limits for model ${options.model}:`);
        console.log(modelLimits);
      } else {
        const response = await venice.apiKeys.rateLimits();
        debugLog('Rate limits response', response);
        console.log('Rate limits for all models:');
        console.log(response.rate_limits);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// List models
program
  .command('list-models')
  .description('List available Venice AI models')
  .action(async () => {
    try {
      const venice = getClient();
      const response = await venice.models.list();
      
      debugLog('List models response', response);
      console.log('Available Models:');
      console.table(response.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        type: model.type || 'Unknown'
      })));
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Generate chat completion
program
  .command('chat')
  .description('Generate a chat completion')
  .argument('<prompt>', 'The prompt to send to the AI')
  .option('-m, --model <model>', 'Model to use', 'llama-3.3-70b')
  .option('-w, --web-search', 'Enable web search')
  .option('-s, --system <system>', 'System message')
  .action(async (prompt, options) => {
    try {
      const venice = getClient();
      
      const messages: { role: 'system' | 'user' | 'assistant' | 'function' | 'tool'; content: string }[] = [];
      
      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }
      
      messages.push({ role: 'user', content: prompt });
      
      debugLog('Chat request', { model: options.model, messages, webSearch: options.webSearch });
      
      const response = await venice.chat.completions.create({
        model: options.model,
        messages,
        venice_parameters: options.webSearch ? {
          enable_web_search: 'on'
        } : undefined
      });
      
      debugLog('Chat response', response);
      console.log(response.choices[0].message.content);
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Generate image
program
  .command('generate-image')
  .description('Generate an image')
  .argument('<prompt>', 'The prompt to generate an image from')
  .option('-m, --model <model>', 'Model to use', 'fluently-xl')
  .option('-n, --negative <negative>', 'Negative prompt')
  .option('-s, --style <style>', 'Style preset')
  .option('-h, --height <height>', 'Image height', '1024')
  .option('-w, --width <width>', 'Image width', '1024')
  .option('-o, --output <filename>', 'Output filename', 'venice-image.png')
  .action(async (prompt, options) => {
    try {
      const venice = getClient();
      
      console.log('Generating image...');
      
      const imageParams = {
        model: options.model,
        prompt: prompt,
        negative_prompt: options.negative,
        style_preset: options.style,
        height: parseInt(options.height),
        width: parseInt(options.width)
      };
      
      debugLog('Image generation request', imageParams);
      
      const response = await venice.image.generate(imageParams);
      
      debugLog('Image generation response', response);
      
      // Download the image
      console.log('Downloading image...');
      
      const imageUrl = response.images[0].url;
      
      if (!imageUrl) {
        console.error('Error: No image URL returned from the API');
        return;
      }
      
      const file = fs.createWriteStream(options.output);
      https.get(imageUrl, function(response) {
        response.pipe(file);
        file.on('finish', () => {
          console.log(`Image saved to ${options.output}`);
        });
      }).on('error', (err) => {
        console.error('Error downloading image:', err.message);
      });
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// List image styles
program
  .command('list-styles')
  .description('List available image styles')
  .action(async () => {
    try {
      const venice = getClient();
      const response = await venice.image.styles.list();
      
      debugLog('List styles response', response);
      console.log('Available Image Styles:');
      console.table(response.styles.map((style: any) => ({
        id: style.id,
        name: style.name || style.id,
        description: style.description || 'No description'
      })));
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

program.parse(process.argv);