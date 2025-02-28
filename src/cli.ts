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
  .version(version);

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

// Create a function to get the Venice client
const getClient = () => {
  const apiKey = process.env.VENICE_API_KEY || config.apiKey;
  
  if (!apiKey) {
    console.error('Error: API key not found. Please set the VENICE_API_KEY environment variable or run "venice configure"');
    process.exit(1);
  }
  
  return new VeniceAI({
    apiKey,
  });
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
      
      console.log('API Keys:');
      console.table(response.keys.map((key: any) => ({
        id: key.id,
        name: key.name || key.description,
        created: key.createdAt ? new Date(key.createdAt).toLocaleString() : 'N/A'
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
        console.log(`Rate limits for model ${options.model}:`);
        console.log(modelLimits);
      } else {
        const response = await venice.apiKeys.rateLimits();
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
      
      const response = await venice.chat.completions.create({
        model: options.model,
        messages,
        venice_parameters: options.webSearch ? {
          enable_web_search: 'on'
        } : undefined
      });
      
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
      
      const response = await venice.image.generate({
        model: options.model,
        prompt: prompt,
        negative_prompt: options.negative,
        style_preset: options.style,
        height: parseInt(options.height),
        width: parseInt(options.width)
      });
      
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