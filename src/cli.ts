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
    webSearch?: boolean | string;
    system?: string;
    raw?: boolean;
    image?: string;
    stream?: boolean;
    noSystemPrompt?: boolean;
    character?: string;
    functions?: string;
    functionsFile?: string;
    forceFunctionCall?: boolean;
    modelFeatures?: string;
  } = {}) => {
    try {
      const venice = getClient();
      
      const messages: { role: 'system' | 'user' | 'assistant' | 'function' | 'tool'; content: string | any[] }[] = [];
      
      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }
      
      // Handle complex message content (for vision models)
      if (options.image) {
        const content = [];
        content.push({ type: 'text', text: prompt });
        
        // Handle image input (base64, URL, or file path)
        if (options.image.startsWith('data:') || options.image.match(/^[A-Za-z0-9+/=]+$/)) {
          content.push({
            type: 'image_url',
            image_url: { url: options.image }
          });
        } else if (options.image.startsWith('http')) {
          content.push({
            type: 'image_url',
            image_url: { url: options.image }
          });
        } else {
          const imageBuffer = fs.readFileSync(options.image);
          const base64Image = imageBuffer.toString('base64');
          const mimeType = options.image.endsWith('.png') ? 'image/png' :
                          options.image.endsWith('.jpg') || options.image.endsWith('.jpeg') ? 'image/jpeg' :
                          'application/octet-stream';
          
          content.push({
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}` }
          });
        }
        
        messages.push({ role: 'user', content });
      } else {
        messages.push({ role: 'user', content: prompt });
      }
      
      // Handle functions if provided
      let functions;
      if (options.functionsFile) {
        const functionsContent = fs.readFileSync(options.functionsFile, 'utf8');
        functions = JSON.parse(functionsContent);
      } else if (options.functions) {
        functions = JSON.parse(options.functions);
      }
      
      // Prepare venice_parameters
      const veniceParameters: any = {};
      
      // Web search options
      if (options.webSearch === 'on' || options.webSearch === true) {
        veniceParameters.enable_web_search = 'on';
      } else if (options.webSearch === 'off') {
        veniceParameters.enable_web_search = 'off';
      } else if (options.webSearch === 'auto') {
        veniceParameters.enable_web_search = 'auto';
      }
      
      // System prompt control
      if (options.noSystemPrompt) {
        veniceParameters.include_venice_system_prompt = false;
      }
      
      // Character interaction
      if (options.character) {
        veniceParameters.character_slug = options.character;
      }
      
      // Determine model
      let model = options.model || 'llama-3.3-70b';
      
      // Handle character in model parameter (character:slug format)
      if (model && model.startsWith('character:')) {
        veniceParameters.character_slug = model.replace('character:', '');
        model = 'default'; // Use default model when specifying character
      }
      
      // Handle model feature suffix
      if (options.modelFeatures) {
        model = `${model}:${options.modelFeatures}`;
      }
      
      // Create request parameters
      const requestParams: any = {
        model,
        messages,
        stream: options.stream,
      };
      
      // Add functions if provided
      if (functions) {
        requestParams.functions = functions;
        if (options.forceFunctionCall) {
          requestParams.function_call = 'auto';
        }
      }
      
      // Add venice_parameters if any are set
      if (Object.keys(veniceParameters).length > 0) {
        requestParams.venice_parameters = veniceParameters;
      }
      
      if ((global as any).debug) {
        debugLog('Chat request', requestParams);
      }
      
      // Handle streaming
      if (options.stream) {
        return { stream: true, requestParams };
      }
      
      const response = await venice.chat.completions.create(requestParams);
      
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
  },

  // List characters command implementation
  listCharacters: async (options: { limit?: number; raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.characters.list();
      
      if ((global as any).debug) {
        debugLog('List characters response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      // Get characters from the data array
      const characters = response.data || [];
      
      if (characters.length === 0) {
        return {
          characters: [],
          total: 0,
          filtered: 0
        };
      }
      
      // Map and potentially limit the characters
      let mappedCharacters = characters.map((character: any) => ({
        name: character.name || 'Unnamed',
        slug: character.slug || 'N/A',
        description: character.description || 'No description',
        model: character.modelId || 'N/A'
      }));
      
      // Apply limit if specified
      if (options.limit && options.limit > 0 && options.limit < mappedCharacters.length) {
        mappedCharacters = mappedCharacters.slice(0, options.limit);
      }
      
      return {
        characters: mappedCharacters,
        total: characters.length,
        filtered: mappedCharacters.length
      };
    } catch (error) {
      throw new Error(`List characters error: ${(error as Error).message}`);
    }
  },

  // Get VVV circulating supply command implementation
  vvvCirculatingSupply: async (options: { raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.vvv.circulatingSupply();
      
      if ((global as any).debug) {
        debugLog('VVV circulating supply response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      // Handle both new and old response formats
      if (response.result) {
        // New format
        const circulatingSupply = parseFloat(response.result);
        return {
          circulating_supply: circulatingSupply,
          result: response.result,
          timestamp: new Date().toLocaleString()
        };
      } else if (response.circulating_supply) {
        // Old format
        return {
          circulating_supply: response.circulating_supply,
          total_supply: response.total_supply,
          percentage_circulating: response.percentage_circulating ||
            (response.circulating_supply / response.total_supply! * 100).toFixed(2) + '%',
          timestamp: response.timestamp ? new Date(response.timestamp).toLocaleString() : new Date().toLocaleString()
        };
      }
      
      // Fallback
      return response;
    } catch (error) {
      throw new Error(`VVV circulating supply error: ${(error as Error).message}`);
    }
  },

  // Get VVV network utilization command implementation
  vvvUtilization: async (options: { raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.vvv.utilization();
      
      if ((global as any).debug) {
        debugLog('VVV utilization response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      // Handle the new API response format
      if (response.percentage !== undefined) {
        return {
          utilization_percentage: (response.percentage * 100).toFixed(4) + '%',
          timestamp: new Date().toLocaleString()
        };
      }
      // Handle the old API response format
      else if (response.utilization_percentage !== undefined) {
        return {
          utilization_percentage: response.utilization_percentage + '%',
          capacity: response.capacity,
          usage: response.usage,
          timestamp: response.timestamp ? new Date(response.timestamp).toLocaleString() : new Date().toLocaleString(),
          historical_data: response.historical_data
        };
      }
      
      // Fallback
      return response;
    } catch (error) {
      throw new Error(`VVV utilization error: ${(error as Error).message}`);
    }
  },

  // Get VVV staking yield command implementation
  vvvStakingYield: async (options: { raw?: boolean } = {}) => {
    try {
      const venice = getClient();
      const response = await venice.vvv.stakingYield();
      
      if ((global as any).debug) {
        debugLog('VVV staking yield response', response);
      }
      
      // Return raw response if requested
      if (options.raw) {
        return response;
      }
      
      // Handle the new API response format
      if (response.stakingYield !== undefined && response.totalStaked !== undefined) {
        return {
          current_apy: (parseFloat(response.stakingYield) * 100).toFixed(4) + '%',
          total_staked: parseFloat(response.totalStaked),
          total_emission: response.totalEmission,
          staker_distribution: response.stakerDistribution,
          timestamp: new Date().toLocaleString()
        };
      }
      // Handle the old API response format
      else if (response.current_apy !== undefined && response.total_staked !== undefined) {
        return {
          current_apy: response.current_apy + '%',
          total_staked: response.total_staked,
          percentage_staked: response.percentage_staked ? response.percentage_staked + '%' : 'N/A',
          timestamp: response.timestamp ? new Date(response.timestamp).toLocaleString() : new Date().toLocaleString(),
          historical_data: response.historical_data
        };
      }
      
      // Fallback
      return response;
    } catch (error) {
      throw new Error(`VVV staking yield error: ${(error as Error).message}`);
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
  .option('-t, --type <type>', 'Model type (all, text, code, image)', 'all')
  .option('-l, --limit <number>', 'Limit the number of models displayed')
  .action(async (options) => {
    try {
      const venice = getClient();
      const response = await venice.models.list();
      
      debugLog('List models response', response);
      
      // Filter models by type if specified
      let filteredModels = response.data;
      if (options.type && options.type !== 'all') {
        filteredModels = response.data.filter((model: any) =>
          model.type && model.type.toLowerCase() === options.type.toLowerCase()
        );
      }
      
      // Apply limit if specified
      let displayModels = [...filteredModels];
      if (options.limit && !isNaN(parseInt(options.limit))) {
        const limit = parseInt(options.limit);
        displayModels = displayModels.slice(0, limit);
      }
      
      if ((global as any).raw || options.raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('Available Models:');
        console.log(`Total models: ${response.data.length}`);
        
        if (filteredModels.length !== response.data.length) {
          console.log(`Filtered to ${filteredModels.length} ${options.type} models`);
        }
        
        if (displayModels.length !== filteredModels.length) {
          console.log(`Showing ${displayModels.length} of ${filteredModels.length} models`);
        }
        
        console.table(displayModels.map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          type: model.type || 'Unknown'
        })));
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// List model traits
program
  .command('list-model-traits')
  .description('List model traits')
  .option('-t, --type <type>', 'Model type (text, image)', 'text')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (options) => {
    try {
      const venice = getClient();
      const response = await venice.models.traits();
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(response, null, 2));
      } else {
        console.log('Model Traits:');
        console.log(`Type: ${options.type}`);
        console.log(`Total traits: ${response.traits.length}`);
        console.table(response.traits);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// List model compatibility
program
  .command('list-model-compatibility')
  .description('List model compatibility mappings')
  .option('-t, --type <type>', 'Model type (text, image)', 'text')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (options) => {
    try {
      const venice = getClient();
      const response = await venice.models.compatibility();
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(response, null, 2));
      } else {
        console.log('Model Compatibility Mappings:');
        console.log(`Type: ${options.type}`);
        console.log(`Total mappings: ${Object.keys(response.mappings).length}`);
        console.table(Object.entries(response.mappings).map(([key, value]) => ({
          'External Model': key,
          'Venice Model': value
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
  .option('-m, --model <model>', 'Model to use (or character:slug for character chat)', 'llama-3.3-70b')
  .option('-w, --web-search <mode>', 'Web search mode (on, off, auto)', 'off')
  .option('-s, --system <system>', 'System message')
  .option('-i, --image <path>', 'Path to image file, URL, or base64 data (for vision models)')
  .option('-f, --functions <json>', 'JSON string of function definitions')
  .option('-F, --functions-file <path>', 'Path to JSON file with function definitions')
  .option('--force-function-call', 'Force the model to call a function')
  .option('--stream', 'Stream the response')
  .option('--no-system-prompt', 'Remove Venice system prompt')
  .option('--character <slug>', 'Character slug to use')
  .option('--model-features <features>', 'Model feature suffix (e.g., "enable_web_search=on")')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      const venice = getClient();
      
      if (options.stream) {
        // Handle streaming
        console.log('Streaming response:');
        
        const messages: { role: 'system' | 'user' | 'assistant' | 'function' | 'tool'; content: string }[] = [];
        
        if (options.system) {
          messages.push({ role: 'system', content: options.system });
        }
        
        messages.push({ role: 'user', content: prompt });
        
        // Prepare venice_parameters
        const veniceParameters: any = {};
        
        // Web search options
        if (options.webSearch === 'on') {
          veniceParameters.enable_web_search = 'on';
        } else if (options.webSearch === 'auto') {
          veniceParameters.enable_web_search = 'auto';
        }
        
        // System prompt control
        if (options.noSystemPrompt === false) {
          veniceParameters.include_venice_system_prompt = false;
        }
        
        // Character interaction
        if (options.character) {
          veniceParameters.character_slug = options.character;
        }
        
        // Determine model
        let model = options.model || 'llama-3.3-70b';
        
        // Handle character in model parameter (character:slug format)
        if (model.startsWith('character:')) {
          veniceParameters.character_slug = model.replace('character:', '');
          model = 'default'; // Use default model when specifying character
        }
        
        // Create stream
        const stream = await venice.chat.completions.createStream({
          model,
          messages,
          stream: true,
          venice_parameters: Object.keys(veniceParameters).length > 0 ? veniceParameters : undefined
        });
        
        // Process stream
        for await (const chunk of stream) {
          process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }
        console.log(); // Add newline at end
      } else {
        // Non-streaming request
        const result = await commands.chat(prompt, {
          model: options.model,
          webSearch: options.webSearch,
          system: options.system,
          image: options.image,
          functions: options.functions,
          functionsFile: options.functionsFile,
          forceFunctionCall: options.forceFunctionCall,
          noSystemPrompt: !options.systemPrompt,
          character: options.character,
          modelFeatures: options.modelFeatures,
          raw: options.raw || (global as any).raw
        });
        
        if ((global as any).raw || options.raw) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(result);
        }
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Vision chat command
program
  .command('vision-chat')
  .description('Generate a chat completion with image input')
  .argument('<prompt>', 'The text prompt to send to the AI')
  .requiredOption('-i, --image <path>', 'Path to image file, URL, or base64 data')
  .option('-m, --model <model>', 'Model to use', 'qwen-2.5-vl')
  .option('-w, --web-search', 'Enable web search')
  .option('-s, --system <system>', 'System message')
  .option('--character <slug>', 'Character slug to use')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      // Use the existing chat command with image parameter
      const result = await commands.chat(prompt, {
        model: options.model,
        webSearch: options.webSearch ? 'on' : undefined,
        system: options.system,
        image: options.image,
        character: options.character,
        raw: options.raw || (global as any).raw
      });
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Function calling command
program
  .command('function-chat')
  .description('Generate a chat completion with function calling')
  .argument('<prompt>', 'The prompt to send to the AI')
  .option('-m, --model <model>', 'Model to use', 'mistral-codestral-22b')
  .option('-f, --functions <json>', 'JSON string of function definitions')
  .option('-F, --functions-file <path>', 'Path to JSON file with function definitions')
  .option('--force-function-call', 'Force the model to call a function')
  .option('--character <slug>', 'Character slug to use')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (prompt, options) => {
    try {
      // Use the existing chat command with function parameters
      const result = await commands.chat(prompt, {
        model: options.model,
        functions: options.functions,
        functionsFile: options.functionsFile,
        forceFunctionCall: options.forceFunctionCall,
        character: options.character,
        raw: true // Always get raw response to check for function calls
      });
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        // Check if result is a ChatCompletionResponse
        if (result && typeof result === 'object' && 'choices' in result &&
            result.choices && result.choices.length > 0) {
          const choice = result.choices[0];
          if (choice.message && 'function_call' in choice.message && choice.message.function_call) {
            console.log('Function Call:');
            console.log(`Name: ${choice.message.function_call.name}`);
            console.log(`Arguments: ${choice.message.function_call.arguments}`);
          } else if (choice.message && choice.message.content) {
            console.log(choice.message.content);
          } else {
            console.log('No content or function call in response');
          }
        } else {
          // Fallback for other response types
          console.log(result);
        }
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });

// Upscale image command
program
  .command('upscale-image')
  .description('Upscale an image')
  .argument('<image>', 'Path to the image file')
  .option('-s, --scale <factor>', 'Scale factor (2 or 4)', '2')
  .option('-o, --output <filename>', 'Output filename', 'upscaled-image.png')
  .option('-r, --raw', 'Output raw JSON response')
  .action(async (image, options) => {
    try {
      console.log('Upscaling image...');
      
      // Read image file
      const imageBuffer = fs.readFileSync(image);
      const base64Image = imageBuffer.toString('base64');
      
      const venice = getClient();
      const response = await venice.image.upscale({
        model: 'upscale-model',
        image: base64Image,
        scale: parseInt(options.scale) || 2
      });
      
      if ((global as any).raw || options.raw) {
        console.log(JSON.stringify(response, null, 2));
        return;
      }
      
      // Save image if output path is provided
      if (response.url) {
        console.log('Downloading upscaled image...');
        
        const file = fs.createWriteStream(options.output);
        https.get(response.url, function(response) {
          response.pipe(file);
          file.on('finish', () => {
            console.log(`Image upscaled and saved to ${options.output}`);
          });
        }).on('error', (err) => {
          console.error('Error downloading image:', err.message);
        });
      } else if (response.b64_json) {
        // Handle base64 response
        const imageData = response.b64_json.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(options.output, Buffer.from(imageData, 'base64'));
        console.log(`Image upscaled and saved to ${options.output}`);
      } else {
        console.error('Error: No image data returned from the API');
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

// List characters
program
  .command('list-characters')
  .description('List available characters')
  .option('-l, --limit <number>', 'Limit the number of characters displayed')
  .action(async (options) => {
    try {
      const venice = getClient();
      
      // Fetch characters
      const response = await venice.characters.list();
      
      // Log response in debug mode
      if ((global as any).debug) {
        debugLog('List characters response', response);
      }
      
      // Handle raw output mode
      if ((global as any).raw) {
        console.log(JSON.stringify(response, null, 2));
        return;
      }
      
      // Pretty output for human consumption
      console.log('Available Characters:');
      
      // Get characters from the data array
      const characters = response.data || [];
      
      if (characters.length === 0) {
        console.log('No characters available.');
        return;
      }
      
      // Display total count
      console.log(`Total characters: ${characters.length}`);
      
      // Apply limit if specified
      let displayCharacters = [...characters];
      if (options.limit && !isNaN(parseInt(options.limit))) {
        const limit = parseInt(options.limit);
        displayCharacters = displayCharacters.slice(0, limit);
        console.log(`Showing ${displayCharacters.length} of ${characters.length} characters`);
      }
      
      // Format characters for display
      const formattedCharacters = displayCharacters.map(character => ({
        name: character.name || 'Unnamed',
        slug: character.slug || 'N/A',
        description: (character.description || 'No description').substring(0, 40) + '...',
        model: character.modelId || 'N/A'
      }));
      
      // Display characters in a table format
      console.table(formattedCharacters);
      
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
  });
// Get VVV circulating supply
program
  .command('vvv-supply')
  .description('Get VVV circulating supply information')
  .action(async () => {
    try {
      const venice = getClient();
      const response = await venice.vvv.circulatingSupply();
      
      debugLog('VVV circulating supply response', response);
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('VVV Circulating Supply:');
        
        // Handle both new and old response formats
        if (response.result) {
          // New format
          const circulatingSupply = parseFloat(response.result);
          console.log(`Circulating Supply: ${circulatingSupply.toLocaleString()}`);
          console.log(`Raw Result: ${response.result}`);
          console.log(`Timestamp: ${new Date().toLocaleString()}`);
        } else if (response.circulating_supply) {
          // Old format
          console.log(`Circulating Supply: ${response.circulating_supply.toLocaleString()}`);
          
          if (response.total_supply) {
            console.log(`Total Supply: ${response.total_supply.toLocaleString()}`);
            
            const percentCirculating = response.percentage_circulating ||
              ((response.circulating_supply / response.total_supply) * 100).toFixed(2);
            
            console.log(`Percentage Circulating: ${percentCirculating}%`);
          }
          
          if (response.timestamp) {
            console.log(`Timestamp: ${new Date(response.timestamp).toLocaleString()}`);
          } else {
            console.log(`Timestamp: ${new Date().toLocaleString()}`);
          }
        } else {
          // Fallback
          console.log(response);
        }
      }
    } catch (error) {
      if ((error as any).response?.data?.error === 'API route not found') {
        console.error('Error: VVV API endpoints require admin privileges or are not available in this API version.');
        console.error('Please contact Venice AI support for access to these endpoints.');
      } else {
        console.error('Error:', (error as Error).message);
      }
    }
  });

// Get VVV network utilization
program
  .command('vvv-utilization')
  .description('Get VVV network utilization information')
  .action(async () => {
    try {
      const venice = getClient();
      const response = await venice.vvv.utilization();
      
      debugLog('VVV utilization response', response);
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('VVV Network Utilization:');
        
        // Check if there's an error
        if (response._error) {
          console.error(`Error: ${response._error}`);
          return;
        }
        
        // Handle the new API response format
        if (response.percentage !== undefined) {
          console.log(`Utilization: ${(response.percentage * 100).toFixed(4)}%`);
          console.log(`Timestamp: ${new Date().toLocaleString()}`);
        }
        // Handle the old API response format
        else if (response.utilization_percentage !== undefined) {
          console.log(`Utilization: ${response.utilization_percentage}%`);
          
          if (response.capacity !== undefined) {
            console.log(`Capacity: ${response.capacity.toLocaleString()}`);
          }
          
          if (response.usage !== undefined) {
            console.log(`Usage: ${response.usage.toLocaleString()}`);
          }
          
          if (response.timestamp) {
            console.log(`Timestamp: ${new Date(response.timestamp).toLocaleString()}`);
          } else {
            console.log(`Timestamp: ${new Date().toLocaleString()}`);
          }
        } else {
          console.log('No utilization data available');
        }
        
        if (response.historical_data && response.historical_data.length > 0) {
          console.log('\nHistorical Data:');
          console.table(response.historical_data.map(data => ({
            timestamp: new Date(data.timestamp).toLocaleString(),
            utilization: data.utilization_percentage + '%'
          })));
        }
      }
    } catch (error) {
      if ((error as any).response?.data?.error === 'API route not found') {
        console.error('Error: VVV API endpoints require admin privileges or are not available in this API version.');
        console.error('Please contact Venice AI support for access to these endpoints.');
      } else {
        console.error('Error:', (error as Error).message);
      }
    }
  });

// Get VVV staking yield
program
  .command('vvv-yield')
  .description('Get VVV staking yield information')
  .action(async () => {
    try {
      const venice = getClient();
      const response = await venice.vvv.stakingYield();
      
      debugLog('VVV staking yield response', response);
      
      if ((global as any).raw) {
        // Output raw JSON for scripting
        console.log(JSON.stringify(response, null, 2));
      } else {
        // Pretty output for human consumption
        console.log('VVV Staking Yield:');
        
        // Check if there's an error
        if (response._error) {
          console.error(`Error: ${response._error}`);
          return;
        }
        
        // Handle the new API response format
        if (response.stakingYield !== undefined && response.totalStaked !== undefined) {
          console.log(`Current APY: ${(parseFloat(response.stakingYield) * 100).toFixed(4)}%`);
          console.log(`Total Staked: ${parseFloat(response.totalStaked).toLocaleString()}`);
          
          if (response.totalEmission) {
            console.log(`Total Emission: ${response.totalEmission}`);
          }
          
          if (response.stakerDistribution) {
            console.log(`Staker Distribution: ${response.stakerDistribution}`);
          }
          
          console.log(`Timestamp: ${new Date().toLocaleString()}`);
        }
        // Handle the old API response format
        else if (response.current_apy !== undefined && response.total_staked !== undefined) {
          console.log(`Current APY: ${response.current_apy}%`);
          console.log(`Total Staked: ${response.total_staked.toLocaleString()}`);
          
          if (response.percentage_staked !== undefined) {
            console.log(`Percentage Staked: ${response.percentage_staked}%`);
          }
          
          if (response.timestamp) {
            console.log(`Timestamp: ${new Date(response.timestamp).toLocaleString()}`);
          } else {
            console.log(`Timestamp: ${new Date().toLocaleString()}`);
          }
        } else {
          console.log('No staking yield data available');
        }
        
        if (response.historical_data && response.historical_data.length > 0) {
          console.log('\nHistorical Data:');
          console.table(response.historical_data.map(data => ({
            timestamp: new Date(data.timestamp).toLocaleString(),
            apy: data.apy + '%'
          })));
        }
      }
    } catch (error) {
      if ((error as any).response?.data?.error === 'API route not found') {
        console.error('Error: VVV API endpoints require admin privileges or are not available in this API version.');
        console.error('Please contact Venice AI support for access to these endpoints.');
      } else {
        console.error('Error:', (error as Error).message);
      }
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