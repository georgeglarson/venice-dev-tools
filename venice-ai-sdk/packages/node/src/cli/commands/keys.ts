// Keys commands implementation
import { Command } from 'commander';
import * as chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as inquirer from 'inquirer';
import { table } from 'table';
import { VeniceNode } from '../../venice-node';

/**
 * Register API key-related commands with the CLI
 */
export function registerKeysCommands(program: Command, venice: VeniceNode): void {
  const keys = program
    .command('keys')
    .description('Manage Venice AI API keys');

  // List API keys command
  keys
    .command('list')
    .description('List your API keys')
    .action(async () => {
      const spinner = ora('Fetching API keys...').start();
      
      try {
        const response = await venice.keys.list();
        spinner.stop();
        
        if (response.api_keys.length === 0) {
          console.log(chalk.yellow('No API keys found.'));
          return;
        }
        
        // Create table data
        const tableData = [
          ['ID', 'Description', 'Last 6', 'Type', 'Created', 'Expires', 'Last Used', 'Usage (VCU)'],
          ...response.api_keys.map((key: any) => [
            key.id,
            key.description || '',
            chalk.cyan(key.last6Chars),
            key.apiKeyType,
            formatDate(key.createdAt),
            formatDate(key.expiresAt),
            formatDate(key.lastUsedAt),
            key.usage?.trailingSevenDays?.vcu || 0
          ])
        ];
        
        // Configure table options
        const tableConfig = {
          columns: {},
          singleLine: true
        };
        
        // Print table with configuration
        console.log(table(tableData, tableConfig));
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });

  // Get rate limits command
  keys
    .command('rate-limits')
    .description('Get API key rate limits')
    .option('--json', 'Output response as JSON', false)
    .option('--raw', 'Output raw text without formatting', false)
    .action(async (options) => {
      const spinner = ora('Fetching rate limits...').start();
      
      try {
        const response = await venice.keys.getRateLimits();
        spinner.stop();
        
        // Check if JSON output is requested
        if (options.json) {
          console.log(JSON.stringify(response.data, null, 2));
          return;
        }
        
        // Check if raw output is requested
        if (options.raw) {
          console.log(`API Tier: ${response.data.apiTier.id}`);
          console.log(`Access Permitted: ${response.data.accessPermitted}`);
          console.log(`VCU Balance: ${response.data.balances.VCU.toFixed(4)}`);
          console.log(`USD Balance: ${response.data.balances.USD.toFixed(2)}`);
          
          // Print rate limits in raw format
          console.log('\nRate Limits:');
          response.data.rateLimits.forEach((modelLimit: any) => {
            modelLimit.rateLimits.forEach((limit: any) => {
              console.log(`${modelLimit.apiModelId} ${limit.type} ${limit.amount}`);
            });
          });
          return;
        }
        
        // Display API tier info
        console.log(`API Tier: ${chalk.green(response.data.apiTier.id)}`);
        console.log(`Access Permitted: ${response.data.accessPermitted ? chalk.green('Yes') : chalk.red('No')}`);
        
        // Display balances
        console.log('\nBalances:');
        console.log(`  VCU: ${chalk.cyan(response.data.balances.VCU.toFixed(4))}`);
        console.log(`  USD: ${chalk.yellow('$' + response.data.balances.USD.toFixed(2))}`);
        
        // Display rate limits
        console.log('\nRate Limits:');
        const rateLimitData = [
          ['Model', 'Limit Type', 'Amount'],
          ...response.data.rateLimits.flatMap((modelLimit: any) =>
            modelLimit.rateLimits.map((limit: any) => [
              chalk.green(modelLimit.apiModelId),
              limit.type,
              limit.amount.toString()
            ])
          )
        ];
        
        // Configure table options
        const tableConfig = {
          columns: {},
          singleLine: true
        };
        
        // Print table with configuration
        console.log(table(rateLimitData, tableConfig));
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });

  // Get rate limit logs command
  keys
    .command('rate-limit-logs')
    .description('Get API key rate limit logs')
    .action(async () => {
      const spinner = ora('Fetching rate limit logs...').start();
      
      try {
        // Use type assertion to tell TypeScript that the method exists
        const response = await (venice.keys as any).getRateLimitLogs();
        spinner.stop();
        
        if (response.data.length === 0) {
          console.log(chalk.yellow('No rate limit logs found.'));
          return;
        }
        
        // Create table data
        const tableData = [
          ['API Key ID', 'Model ID', 'Limit Type', 'Tier', 'Timestamp'],
          ...response.data.map((log: any) => [
            log.apiKeyId,
            chalk.green(log.modelId),
            chalk.cyan(log.rateLimitType),
            log.rateLimitTier,
            formatDate(log.timestamp)
          ])
        ];
        
        // Configure table options
        const tableConfig = {
          columns: {},
          singleLine: true
        };
        
        // Print table with configuration
        console.log(chalk.bold('Last 50 Rate Limit Exceeded Events:'));
        console.log(table(tableData, tableConfig));
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });

  // Note: The 'set-key' command is registered in the main CLI file

  // Create API key command
  keys
    .command('create')
    .description('Create a new API key')
    .option('-d, --description <description>', 'Description for the key', 'Created via CLI')
    .option('-t, --type <type>', 'API key type (ADMIN or INFERENCE)', 'INFERENCE')
    .option('-e, --expires <date>', 'Expiration date (YYYY-MM-DD)')
    .option('--vcu <limit>', 'VCU consumption limit', '0')
    .option('--usd <limit>', 'USD consumption limit', '0')
    .action(async (options) => {
      const spinner = ora('Creating API key...').start();
      
      try {
        const response = await venice.keys.create({
          name: options.description // Use name instead of description
          // Remove other properties that don't exist in the type definition
        });
        
        spinner.succeed('API key created successfully');
        
        // Display the new API key
        console.log('\nAPI Key Details:');
        console.log(`ID: ${chalk.green(response.api_key.id)}`);
        console.log(`Name: ${response.api_key.name}`);
        console.log(`Type: ${options.type}`); // Use the option directly
        console.log(`Expires: ${formatDate(response.api_key.expires_at || null)}`);
        console.log('\n' + chalk.yellow('⚠️  Important: Store this API key securely. It will not be shown again.'));
        console.log(chalk.cyan(response.api_key.key));
        
        // Prompt to set as default
        const { setAsDefault } = await inquirer.prompt([{
          type: 'confirm',
          name: 'setAsDefault',
          message: 'Do you want to set this as your default API key?',
          default: false
        }]);
        
        if (setAsDefault) {
          const configDir = path.join(os.homedir(), '.venice');
          const configPath = path.join(configDir, 'config.json');
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
          }
          
          // Save API key to config file
          if (response.api_key.key) {
            venice.saveApiKey(response.api_key.key, configPath);
          }
          console.log(chalk.green(`API key saved as default in ${configPath}`));
        }
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });

  // Delete API key command
  keys
    .command('delete')
    .description('Delete an API key')
    .argument('<id>', 'API key ID to delete')
    .action(async (id) => {
      // Confirm deletion
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete API key ${id}?`,
        default: false
      }]);
      
      if (!confirm) {
        console.log(chalk.yellow('Operation cancelled'));
        return;
      }
      
      const spinner = ora(`Deleting API key ${id}...`).start();
      
      try {
        await venice.keys.delete({ id });
        spinner.succeed('API key deleted successfully');
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });
}

/**
 * Format a date string or null value for display
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  } catch (e) {
    return sanitizeString(dateStr);
  }
}

/**
 * Sanitize a string by removing control characters
 */
function sanitizeString(str: string): string {
  if (!str) return '';
  
  // Remove all Unicode control characters and non-printable characters
  // This includes ASCII control chars (0-31, 127) and Unicode control categories
  return str
    .replace(/[\p{C}]/gu, '') // Remove all Unicode control characters
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, ''); // Remove specific problematic Unicode chars
}