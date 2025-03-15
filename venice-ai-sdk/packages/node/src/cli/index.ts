// CLI entry point
import { Command } from 'commander';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as packageJson from '../../package.json';
import { VeniceNode } from '../venice-node';
import { registerChatCommands } from './commands/chat';
import { registerModelsCommands } from './commands/models';
import { registerKeysCommands } from './commands/keys';
import { registerImagesCommands } from './commands/images';
import { registerVisionCommands } from './commands/vision';
import { registerCharactersCommands } from './commands/characters';
import { registerWeb3KeysCommands } from './commands/web3-keys';

// Create the CLI instance
const program = new Command();

// Create the Venice SDK instance with quiet mode by default
// Only enable logging if --verbose flag is passed
const isVerboseMode = process.argv.includes('--verbose');

// Create the client with quiet mode by default
const venice = new VeniceNode({
  logLevel: isVerboseMode ? undefined : 4 // LogLevel.NONE = 4 (quiet by default)
});

// Setup CLI basic info
program
  .name('venice')
  .description('Venice AI SDK Command Line Interface')
  .version(packageJson.version);

// Load API key from config file or environment variable
function loadApiKey(): string | undefined {
  // First try environment variable
  if (process.env.VENICE_API_KEY) {
    return process.env.VENICE_API_KEY;
  }

  // Then try config file in home directory
  const configPath = path.join(os.homedir(), '.venice', 'config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.apiKey;
    }
  } catch (error) {
    // Silently ignore errors reading config
  }

  return undefined;
}

// Configure API key
const apiKey = loadApiKey();
if (apiKey) {
  venice.setApiKey(apiKey);
}
// Register commands
registerChatCommands(program, venice);
registerModelsCommands(program, venice);
registerKeysCommands(program, venice);
registerImagesCommands(program, venice);
registerVisionCommands(program, venice);
registerCharactersCommands(program, venice);
registerWeb3KeysCommands(program, venice);

// Add set-key command
program
  .command('set-key')
  .description('Set your Venice AI API key')
  .argument('<apiKey>', 'Your Venice API key')
  .action((apiKey, options) => {
    try {
      // Set the API key in memory
      venice.setApiKey(apiKey);
      
      // Save the API key to config file
      const configDir = path.join(os.homedir(), '.venice');
      const configPath = path.join(configDir, 'config.json');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Read existing config if it exists
      let config = {};
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (error) {
          // Ignore errors reading config
        }
      }
      
      // Update config with new API key
      config = { ...config, apiKey };
      
      // Write config file
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      console.log(chalk.green('API key saved successfully!'));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Add global options
program.option('-k, --api-key <key>', 'Venice API key', process.env.VENICE_API_KEY);
program.option('--json', 'Output response as JSON (useful for programmatic use)');
program.option('--raw', 'Output raw text without formatting (useful for piping to other commands)');
program.option('--stream', 'Stream the response when supported');
program.option('--verbose', 'Show detailed logs and output (default: quiet)');

// Add help command with extended help
program
  .command('help')
  .description('Display help information')
  .action(() => {
    console.log(chalk.bold('\nChat Commands:'));
    console.log('  Create chat completions with various models');
    console.log('  Support for streaming responses and interactive mode');
    console.log('  Character integration via --character option');
    console.log('  Web search capabilities via --web-search option');
    console.log('\nExamples:');
    console.log('  venice chat completion --prompt "Hello" --model llama-3.3-70b');
    console.log('  venice chat interactive --stream --character "assistant-name"');
    
    console.log(chalk.bold('\nMultimodal Features:'));
    console.log('  Attach files to your messages using the --attach option');
    console.log('  Supported file types: Images (PNG, JPEG, etc.), PDFs, and text files');
    console.log('\nExamples:');
    console.log('  venice chat completion --prompt "Describe this image" --attach image.jpg');
    console.log('  venice chat completion --prompt "Compare these images" --attach "image1.jpg,image2.png"');
    console.log('\nIn interactive mode:');
    console.log('  venice chat interactive');
    console.log('  venice chat interactive --stream  # Enable streaming responses');
    console.log('  > /attach document.pdf');
    
    console.log(chalk.bold('\nVision Commands:'));
    console.log('  Use vision models to analyze images without message history issues');
    console.log('  Supports both positional arguments and option flags for image paths');
    console.log('\nExamples:');
    console.log('  venice vision analyze sunset.png');
    console.log('  venice vision analyze --prompt "Describe this image" --image sunset.png');
    console.log('  venice vision interactive sunset.png');
    console.log('  venice vision i sunset.png  # Using alias');
    
    console.log(chalk.bold('\nImage Generation:'));
    console.log('  Generate images with AI models');
    console.log('  Upscale existing images');
    console.log('  List available image styles');
    console.log('\nExamples:');
    console.log('  venice images generate "A sunset over mountains"');
    console.log('  venice images generate --prompt "A sunset over mountains" --model fluently-xl');
    console.log('  venice images upscale image.jpg --scale 4');
    console.log('  venice images styles');
    
    console.log(chalk.bold('\nModels:'));
    console.log('  List available models and their capabilities');
    console.log('  Get model traits and compatibility information');
    console.log('\nExamples:');
    console.log('  venice models list');
    console.log('  venice models list --type text');
    console.log('  venice models traits  # Shows all model traits by default');
    console.log('  venice models traits --type text  # Filter to show only text model traits');
    console.log('  venice models traits --json  # Output as JSON');
    console.log('  venice models compatibility');
    
    console.log(chalk.bold('\nAPI Keys:'));
    console.log('  Manage Venice AI API keys');
    console.log('  List, create, and delete API keys');
    console.log('  Get rate limits and usage information');
    console.log('\nExamples:');
    console.log('  venice keys list');
    console.log('  venice keys create --description "My API Key" --type INFERENCE');
    console.log('  venice keys rate-limits');
    console.log('  venice keys delete <key-id>');
    
    console.log(chalk.bold('\nCharacters:'));
    console.log('  List and use characters in chat completions');
    console.log('  Characters provide specialized personalities and capabilities');
    console.log('\nExamples:');
    console.log('  venice characters list');
    console.log('  venice characters list --json');
    console.log('  venice chat completion --prompt "Hello" --character "assistant-name"');
    
    console.log(chalk.bold('\nCrypto/Web3 Features:'));
    console.log('  API key management with web3 authentication');
    console.log('  Generate tokens for wallet signing');
    console.log('  Create API keys with wallet authentication');
    console.log('\nExamples:');
    console.log('  venice web3-keys generate-token');
    console.log('  venice web3-keys create --address <wallet> --signature <sig> --token <token>');
    
    program.help();
  });

// Handle global options
program.hook('preAction', (thisCommand, actionCommand) => {
  // Get options from both the parent command and the action command
  const parentOptions = thisCommand.opts();
  const options = actionCommand.opts();
  
  // Check if API key is provided via command line
  if (parentOptions.apiKey) {
    venice.setApiKey(parentOptions.apiKey);
  } else if (options.apiKey) {
    venice.setApiKey(options.apiKey);
  }

  // Pass global output format options to the command
  if (parentOptions.json && !options.json) {
    actionCommand.setOptionValue('json', true);
  }
  
  if (parentOptions.raw && !options.raw) {
    actionCommand.setOptionValue('raw', true);
  }
  
  if (parentOptions.stream && !options.stream) {
    actionCommand.setOptionValue('stream', true);
  }
  
  if (parentOptions.verbose && !options.verbose) {
    actionCommand.setOptionValue('verbose', true);
  }
  
  // Set log level based on verbose flag
  if (parentOptions.verbose || options.verbose) {
    venice.setLogLevel(1); // LogLevel.INFO = 1
  }

  // Verify API key is set
  if (actionCommand.name() !== 'set-key' && actionCommand.name() !== 'help') {
    try {
      // This will throw an error if no API key is set
      venice.getApiKey();
    } catch (error) {
      console.error(chalk.red('Error: API key not found or invalid.'));
      console.error(chalk.yellow('Please provide an API key using one of these methods:'));
      console.error(chalk.yellow('1. Use the --api-key or -k option: venice -k YOUR_API_KEY ...'));
      console.error(chalk.yellow('2. Set the VENICE_API_KEY environment variable'));
      console.error(chalk.yellow('3. Save your API key using: venice set-key YOUR_API_KEY'));
      process.exit(1);
    }
  }
});

// Parse arguments
program.parse(process.argv);

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}