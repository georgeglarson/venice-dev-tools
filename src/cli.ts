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

// Command implementations for programmatic usage
export const commands = {
  // Chat command implementation
  chat: async (prompt: string, options: {
    model?: string;
    webSearch?: boolean;
    system?: string;
    raw?: boolean;
  } = {}) => {
    try {
      const venice = getClient();
      
      const messages: { role: 'system' | 'user' | 'assistant' | 'function' | 'tool'; content: string }[] = [];
      
      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }
      
      messages.push({ role: 'user', content: prompt });
      
      if ((global as any).debug) {
        debugLog('Chat request', { model: options.model, messages, webSearch: options.webSearch });
      }
      
      const response = await venice.chat.completions.create({
        model: options.model || 'llama-3.3-70b',
        messages,
        venice_parameters: options.webSearch ? {
          enable_web_search: 'on'
        } : undefined
      });
      
      if ((global as any).debug) {
        debugLog('Chat response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`Chat error: ${(error as Error).message}`);
    }
  },
  
  // List keys command implementation
  listKeys: async (options: { limit?: number; raw?: boolean; type?: string } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.apiKeys.list();
      
      if (response.keys.length === 0) {
        return { keys: [], total: 0 };
      }
      
      if ((global as any).debug) {
        debugLog('First key details', response.keys[0]);
        debugLog('Response metadata', response._metadata);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      // Map and potentially filter the keys
      let keys = response.keys.map((key: any) => ({
        id: key.id,
        name: key.name || key.description,
        created: key.createdAt ? new Date(key.createdAt) : null,
        expires: key.expiresAt ? new Date(key.expiresAt) : null,
        type: key.apiKeyType,
        lastUsed: key.lastUsedAt ? new Date(key.lastUsedAt) : null,
        usage: key.usage
      }));
      
      // Filter by type if specified
      if (options.type) {
        keys = keys.filter(key =>
          key.type.toLowerCase() === options.type!.toLowerCase()
        );
      }
      
      // Apply limit if specified
      if (options.limit && options.limit > 0 && options.limit < keys.length) {
        keys = keys.slice(0, options.limit);
      }
      
      return {
        keys,
        total: response.keys.length,
        filtered: keys.length
      };
    } catch (error) {
      throw new Error(`List keys error: ${(error as Error).message}`);
    }
  },
  
  // Create key command implementation
  createKey: async (name: string, options: { raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.apiKeys.create({
        name
      });
      
      if ((global as any).debug) {
        debugLog('Create key response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      return {
        id: response.key.id,
        key: response.key.key,
        name: response.key.description || name,
        created: new Date(response.key.createdAt),
        expires: response.key.expiresAt ? new Date(response.key.expiresAt) : null
      };
    } catch (error) {
      throw new Error(`Create key error: ${(error as Error).message}`);
    }
  },
  
  // Delete key command implementation
  deleteKey: async (id: string, options: { raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.apiKeys.delete({
        id
      });
      
      if ((global as any).debug) {
        debugLog('Delete key response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      return { success: response.success };
    } catch (error) {
      throw new Error(`Delete key error: ${(error as Error).message}`);
    }
  },
  
  // List models command implementation
  listModels: async (options: { limit?: number; raw?: boolean; type?: string } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.models.list();
      
      if ((global as any).debug) {
        debugLog('List models response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      // Map and potentially filter the models
      let models = response.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        type: model.type || 'Unknown'
      }));
      
      // Filter by type if specified
      if (options.type) {
        models = models.filter(model =>
          model.type.toLowerCase() === options.type!.toLowerCase()
        );
      }
      
      // Apply limit if specified
      if (options.limit && options.limit > 0 && options.limit < models.length) {
        models = models.slice(0, options.limit);
      }
      
      return {
        models,
        total: response.data.length,
        filtered: models.length
      };
    } catch (error) {
      throw new Error(`List models error: ${(error as Error).message}`);
    }
  },
  
  // Generate image command implementation
  generateImage: async (prompt: string, options: {
    model?: string;
    negative?: string;
    style?: string;
    height?: number;
    width?: number;
    outputPath?: string;
    raw?: boolean;
  } = {}) => {
    try {
      const venice = getClient();
      
      const imageParams = {
        model: options.model || 'fluently-xl',
        prompt: prompt,
        negative_prompt: options.negative,
        style_preset: options.style,
        height: options.height || 1024,
        width: options.width || 1024
      };
      
      if ((global as any).debug) {
        debugLog('Image generation request', imageParams);
      }
      
      const response = await venice.image.generate(imageParams);
      
      if ((global as any).debug) {
        debugLog('Image generation response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      const result = { url: response.images[0].url };
      
      // If outputPath is provided, download the image
      if (options.outputPath && response.images[0].url) {
        await new Promise<void>((resolve, reject) => {
          const file = fs.createWriteStream(options.outputPath!);
          https.get(response.images[0].url!, function(response) {
            response.pipe(file);
            file.on('finish', () => {
              resolve();
            });
          }).on('error', (err) => {
            reject(new Error(`Error downloading image: ${err.message}`));
          });
        });
        
        return { ...result, savedTo: options.outputPath };
      }
      
      return result;
    } catch (error) {
      throw new Error(`Generate image error: ${(error as Error).message}`);
    }
  },
  
  // List styles command implementation
  listStyles: async (options: { limit?: number; raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.image.styles.list();
      
      if ((global as any).debug) {
        debugLog('List styles response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      // Map and potentially limit the styles
      let styles = response.styles.map((style: any) => ({
        id: style.id,
        name: style.name || style.id,
        description: style.description || 'No description'
      }));
      
      // Apply limit if specified
      if (options.limit && options.limit > 0 && options.limit < styles.length) {
        styles = styles.slice(0, options.limit);
      }
      
      return {
        styles,
        total: response.styles.length
      };
    } catch (error) {
      throw new Error(`List styles error: ${(error as Error).message}`);
    }
  },
  
  // Configure API key
  configure: (apiKey: string) => {
    try {
      fs.writeFileSync(configPath, JSON.stringify({ apiKey }));
      return { success: true };
    } catch (error) {
      throw new Error(`Configure error: ${(error as Error).message}`);
    }
  },
  
  // Enable debug mode
  enableDebug: () => {
    (global as any).debug = true;
    return { debug: true };
  },
  
  // Disable debug mode
  disableDebug: () => {
    (global as any).debug = false;
    return { debug: false };
  },
  
  // Get rate limits command implementation
  rateLimits: async (options: { model?: string; raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      
      if (options.model) {
        const modelLimits = await venice.apiKeys.getModelRateLimits(options.model);
        
        if ((global as any).debug) {
          debugLog('Model rate limits response', modelLimits);
        }
        
        // Return raw response if requested
        if (options.raw) {
          return modelLimits;
        }
        
        return {
          model: options.model,
          limits: modelLimits
        };
      } else {
        const response = await venice.apiKeys.rateLimits();
        
        if ((global as any).debug) {
          debugLog('Rate limits response', response);
        }
        
        // Return raw response if requested
        if (options.raw) {
          return response;
        }
        
        return {
          limits: response.rate_limits
        };
      }
    } catch (error) {
      throw new Error(`Rate limits error: ${(error as Error).message}`);
    }
  }
};

// Setup CLI commands
const program = new Command();

program
  .name('venice')
  .description('Venice AI CLI - Interact with Venice AI API from the command line')
  .version(version)
  .option('-d, --debug', 'Enable debug output')
  .option('-r, --raw', 'Output raw JSON data (useful for scripting)')
  .hook('preAction', (thisCommand) => {
    // Store flags in global variables
    (global as any).debug = thisCommand.opts().debug;
    (global as any).raw = thisCommand.opts().raw;
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
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('API Keys:');
        console.log(`Total keys: ${response.keys.length}`);
        console.table(response.keys.map((key: any) => ({
          id: key.id,
          name: key.name || key.description,
          created: key.createdAt ? new Date(key.createdAt).toLocaleString() : 'N/A',
          expires: key.expiresAt ? new Date(key.expiresAt).toLocaleString() : 'N/A'
        })));
      }
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
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('API Key created successfully:');
        console.log(`ID: ${response.key.id}`);
        console.log(`Key: ${response.key.key}`);
        console.log(`Name: ${response.key.description || options.name}`);
        console.log(`Created: ${new Date(response.key.createdAt).toLocaleString()}`);
      }
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
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        if (response.success) {
          console.log(`API Key ${options.id} deleted successfully.`);
        } else {
          console.log('Failed to delete API key.');
        }
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
        
        if ((global as any).raw) {
          // Output raw JSON for scripting
          console.log(JSON.stringify(modelLimits, null, 2));
        } else {
          // Pretty output for human consumption
          console.log(`Rate limits for model ${options.model}:`);
          console.log(modelLimits);
        }
      } else {
        const response = await venice.apiKeys.rateLimits();
        debugLog('Rate limits response', response);
        
        if ((global as any).raw) {
          // Output raw JSON for scripting
          console.log(JSON.stringify(response, null, 2));
        } else {
          // Pretty output for human consumption
          console.log('Rate limits for all models:');
          console.log(response.rate_limits);
        }
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
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('Available Models:');
        console.log(`Total models: ${response.data.length}`);
        console.table(response.data.map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          type: model.type || 'Unknown'
        })));
      }
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
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log(response.choices[0].message.content);
      }
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
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
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
      }
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
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('Available Image Styles:');
        console.log(`Total styles: ${response.styles.length}`);
        console.table(response.styles.map((style: any) => ({
          id: style.id,
          name: style.name || style.id,
          description: style.description || 'No description'
        })));
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Function to run the CLI
export const runCli = () => {
  program.parse(process.argv);
};

// Only run the CLI when this file is executed directly
if (require.main === module) {
  runCli();
}