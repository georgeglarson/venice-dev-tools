// Web3 API keys commands implementation
import { Command } from 'commander';
import * as chalk from 'chalk';
import ora from 'ora';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { VeniceNode } from '../../venice-node';

/**
 * Register web3 API key-related commands with the CLI
 */
export function registerWeb3KeysCommands(program: Command, venice: VeniceNode): void {
  const web3Keys = program
    .command('web3-keys')
    .description('Manage Venice AI API keys with web3 authentication');

  // Generate token command
  web3Keys
    .command('generate-token')
    .description('Generate a token for web3 authentication')
    .option('--raw', 'Output raw text without formatting')
    .option('--json', 'Output response as JSON')
    .option('--verbose', 'Show detailed logs and output (default: quiet)')
    .action(async (options) => {
      // Default to raw output unless verbose is specified
      const isQuiet = !options.verbose && !options.raw && !options.json;
      if (isQuiet) {
        options.raw = true;
      }
      
      // Only show spinner if verbose mode
      const spinner = options.verbose ? ora('Generating web3 token...').start() : null;
      
      try {
        // Call the API to generate a web3 token
        const response = await venice.keys.generateWeb3Token();
        if (spinner) spinner.stop();
        
        if (options.json) {
          // JSON output
          console.log(JSON.stringify({ token: response.token }, null, 2));
        } else if (options.raw) {
          // Raw output (just the token)
          console.log(response.token);
        } else {
          // Formatted output
          console.log(chalk.green('Web3 Token:'));
          console.log(chalk.cyan(`Token: ${response.token}`));
          console.log(chalk.yellow('Use this token to sign with your wallet.'));
          console.log(chalk.yellow('Sign this token with your wallet and use the signature to create an API key.'));
        }
      } catch (error) {
        if (spinner) {
          spinner.fail(`Error: ${(error as Error).message}`);
        } else {
          console.error(`Error: ${(error as Error).message}`);
        }
      }
    });

  // Create API key with web3 command
  web3Keys
    .command('create')
    .description('Create API key with web3 authentication')
    .requiredOption('-a, --address <address>', 'Wallet address')
    .requiredOption('-s, --signature <signature>', 'Signature')
    .requiredOption('-t, --token <token>', 'Token')
    .option('-d, --description <description>', 'API key description', 'Web3 API Key')
    .option('--type <type>', 'API key type (ADMIN or INFERENCE)', 'INFERENCE')
    .option('-e, --expires <date>', 'Expiration date (YYYY-MM-DD)')
    .option('--vcu-limit <limit>', 'VCU consumption limit')
    .option('--usd-limit <limit>', 'USD consumption limit')
    .option('--raw', 'Output raw text without formatting')
    .option('--json', 'Output response as JSON')
    .option('--verbose', 'Show detailed logs and output (default: quiet)')
    .action(async (options) => {
      // Default to raw output unless verbose is specified
      const isQuiet = !options.verbose && !options.raw && !options.json;
      if (isQuiet) {
        options.raw = true;
      }
      
      // Only show spinner if verbose mode
      const spinner = options.verbose ? ora('Creating API key with web3 authentication...').start() : null;
      
      try {
        // Create the request payload
        const request = {
          address: options.address,
          signature: options.signature,
          token: options.token,
          description: options.description,
          apiKeyType: options.type as 'ADMIN' | 'INFERENCE',
          expiresAt: options.expires,
          consumptionLimit: {
            vcu: options.vcuLimit ? parseFloat(options.vcuLimit) : null,
            usd: options.usdLimit ? parseFloat(options.usdLimit) : null
          }
        };
        
        // Call the API to create an API key with web3 authentication
        const response = await venice.keys.createWithWeb3(request);
        if (spinner) spinner.succeed('API key created successfully');
        
        if (options.json) {
          // JSON output
          console.log(JSON.stringify(response, null, 2));
        } else if (options.raw) {
          // Raw output (just the API key)
          console.log(response.api_key.key);
        } else {
          // Display the new API key with formatting
          console.log('\nAPI Key Details:');
          console.log(`ID: ${chalk.green(response.api_key.id)}`);
          console.log(`Description: ${response.api_key.name}`);
          console.log(`Type: ${options.type}`);
          console.log(`Expires: ${response.api_key.expires_at || 'Never'}`);
          console.log('\n' + chalk.yellow('⚠️  Important: Store this API key securely. It will not be shown again.'));
          console.log(chalk.cyan(response.api_key.key));
          
          // Only show interactive prompt in verbose mode
          if (options.verbose) {
            // Prompt to set as default (only in interactive mode)
            const { setAsDefault } = await inquirer.prompt([{
              type: 'confirm',
              name: 'setAsDefault',
              message: 'Do you want to set this as your default API key?',
              default: false
            }]);
            
            if (setAsDefault && response.api_key.key) {
              const configDir = path.join(os.homedir(), '.venice');
              const configPath = path.join(configDir, 'config.json');
              
              // Create directory if it doesn't exist
              if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
              }
              
              // Save API key to config file
              venice.saveApiKey(response.api_key.key, configPath);
              console.log(chalk.green(`API key saved as default in ${configPath}`));
            }
          }
        }
      } catch (error) {
        if (spinner) {
          spinner.fail(`Error: ${(error as Error).message}`);
        } else {
          console.error(`Error: ${(error as Error).message}`);
        }
      }
    });
}