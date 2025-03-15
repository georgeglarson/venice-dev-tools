// Models commands implementation
import { Command } from 'commander';
import * as chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';
import { VeniceNode } from '../../venice-node';
import { Model } from '@venice-dev-tools/core';

/**
 * Register model-related commands with the CLI
 */
export function registerModelsCommands(program: Command, venice: VeniceNode): void {
  const models = program
    .command('models')
    .description('Interact with Venice AI models');

  // List models command
  models
    .command('list')
    .description('List available models')
    .option('-t, --type <type>', 'Filter by model type (text, image, code, all)', 'all')
    .action(async (options) => {
      const spinner = ora('Fetching models...').start();
      
      try {
        const response = await venice.models.list({
          type: options.type as 'text' | 'image' | 'all' | 'code'
        });
        spinner.stop();
        
        if (response.data.length === 0) {
          console.log(chalk.yellow(`No ${options.type} models found.`));
          return;
        }
        
        // Check if raw/json output is requested (these options can be set globally)
        if (options.json || options.raw) {
          // Output raw JSON
          console.log(JSON.stringify(response.data, null, 2));
          console.log(`\nTotal: ${response.data.length} models`);
          return;
        }
        
        // Create table data
        const tableData = [
          ['Model ID', 'Type', 'Context', 'Capabilities', 'Beta'],
          ...response.data.map((model: Model) => [
            chalk.green(model.id),
            model.type,
            model.model_spec.availableContextTokens?.toLocaleString() || '-',
            formatCapabilities(model.model_spec.capabilities),
            model.model_spec.beta ? chalk.yellow('Yes') : 'No'
          ])
        ];
        
        // Configure table options
        const tableConfig = {
          columns: {},
          singleLine: true
        };
        
        // Print table with configuration
        console.log(table(tableData, tableConfig));
        console.log(`Total: ${response.data.length} models`);
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });

  // Get model traits command
  models
    .command('traits')
    .description('List model traits (default traits for specific use cases)')
    .option('-t, --type <type>', 'Filter by model type (text, image)', 'all')
    .option('--raw', 'Output raw text without formatting', false)
    .option('--json', 'Output response as JSON', false)
    .action(async (options) => {
      // By default, fetch all traits (both text and image)
      const fetchAllTypes = options.type === 'all' || !options.type;
      
      // Start with text traits
      const spinner = ora('Fetching model traits...').start();
      
      try {
        // Fetch text traits
        const textResponse = await venice.models.getTraits('text');
        
        // Fetch image traits if requested
        let imageResponse;
        if (fetchAllTypes || options.type === 'image') {
          spinner.text = 'Fetching image model traits...';
          imageResponse = await venice.models.getTraits('image');
        }
        
        spinner.stop();
        
        // Combine the results if fetching all types
        let combinedData = {};
        if (fetchAllTypes && imageResponse) {
          combinedData = {
            ...textResponse.data,
            ...imageResponse.data
          };
        } else if (options.type === 'image' && imageResponse) {
          combinedData = imageResponse.data;
        } else {
          combinedData = textResponse.data;
        }
        
        // Check if raw/json output is requested
        if (options.json) {
          // Output as JSON
          console.log(JSON.stringify(combinedData, null, 2));
          return;
        } else if (options.raw) {
          // Output as raw text
          Object.entries(combinedData).forEach(([trait, modelId]) => {
            console.log(`${trait}: ${modelId}`);
          });
          return;
        }
        
        // Create table data for standard output
        const tableData = [
          ['Trait', 'Model ID'],
          ...Object.entries(combinedData).map(([trait, modelId]) => [
            chalk.cyan(trait),
            chalk.green(modelId)
          ])
        ];
        
        // Configure table options
        const tableConfig = {
          columns: {},
          singleLine: true
        };
        
        // Print table with configuration
        console.log(table(tableData, tableConfig));
        
        // Add note about trait types
        console.log('\nNote: These are default model traits for specific use cases.');
        console.log('By default, all traits are shown. Use --type=text or --type=image to filter.');
        console.log('For a complete list of all models, use: venice models list');
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });

  // Get model compatibility command
  models
    .command('compatibility')
    .description('List model compatibility mapping')
    .option('-t, --type <type>', 'Filter by model type (text, image)', 'text')
    .option('--raw', 'Output raw text without formatting', false)
    .option('--json', 'Output response as JSON', false)
    .action(async (options) => {
      const spinner = ora('Fetching model compatibility...').start();
      
      try {
        const response = await venice.models.getCompatibilityMapping(options.type as 'text' | 'image');
        spinner.stop();
        
        // Check if raw/json output is requested
        if (options.json) {
          // Output as JSON
          console.log(JSON.stringify(response.data, null, 2));
          return;
        } else if (options.raw) {
          // Output as raw text
          Object.entries(response.data).forEach(([externalModel, veniceModel]) => {
            console.log(`${externalModel}: ${veniceModel}`);
          });
          return;
        }
        
        // Create table data for standard output
        const tableData = [
          ['External Model', 'Venice Model'],
          ...Object.entries(response.data).map(([externalModel, veniceModel]) => [
            chalk.yellow(externalModel),
            chalk.green(veniceModel)
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
}

/**
 * Format model capabilities for display
 */
function formatCapabilities(capabilities?: {
  supportsFunctionCalling?: boolean;
  supportsResponseSchema?: boolean;
  supportsWebSearch?: boolean;
  supportsReasoning?: boolean;
}): string {
  if (!capabilities) return '';
  
  const caps = [];
  if (capabilities.supportsFunctionCalling) caps.push('Function Calling');
  if (capabilities.supportsResponseSchema) caps.push('Response Schema');
  if (capabilities.supportsWebSearch) caps.push('Web Search');
  if (capabilities.supportsReasoning) caps.push('Reasoning');
  
  return sanitizeString(caps.join(', '));
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