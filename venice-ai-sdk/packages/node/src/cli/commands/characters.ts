// Characters commands implementation
import { Command } from 'commander';
import * as chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';
import { VeniceNode } from '../../venice-node';

/**
 * Register character-related commands with the CLI
 */
export function registerCharactersCommands(program: Command, venice: VeniceNode): void {
  const characters = program
    .command('characters')
    .description('Interact with Venice AI characters');

  // List characters command
  characters
    .command('list')
    .description('List available characters')
    .option('--raw', 'Output raw text without formatting', false)
    .option('--json', 'Output response as JSON', false)
    .action(async (options) => {
      const spinner = ora('Fetching characters...').start();
      
      try {
        const response = await venice.characters.list();
        spinner.stop();
        
        if (response.data.length === 0) {
          console.log(chalk.yellow('No characters found.'));
          return;
        }
        
        // Check if raw/json output is requested
        if (options.json) {
          // Output as JSON
          console.log(JSON.stringify(response.data, null, 2));
          return;
        } else if (options.raw) {
          // Output as raw text
          response.data.forEach(character => {
            console.log(`Name: ${character.name}`);
            console.log(`Slug: ${character.slug}`);
            console.log(`Description: ${character.description || '-'}`);
            console.log(`Tags: ${character.tags.join(', ')}`);
            console.log(`Web Enabled: ${character.webEnabled ? 'Yes' : 'No'}`);
            console.log(`Adult: ${character.adult ? 'Yes' : 'No'}`);
            console.log('---');
          });
          console.log(`Total: ${response.data.length} characters`);
          return;
        }
        
        try {
          // Thoroughly sanitize data to remove control characters
          const sanitizedData = response.data.map(character => ({
            ...character,
            name: sanitizeString(character.name),
            slug: sanitizeString(character.slug),
            description: sanitizeString(character.description || '-'),
            tags: character.tags.map(tag => sanitizeString(tag))
          }));
          
          // Create table data - apply chalk AFTER all sanitization
          const tableData = [
            ['Name', 'Slug', 'Description', 'Tags', 'Web Enabled', 'Adult'],
            ...sanitizedData.map(character => [
              chalk.green(character.name),
              chalk.cyan(character.slug),
              truncateString(character.description, 50),
              truncateString(character.tags.join(', '), 30),
              character.webEnabled ? 'Yes' : 'No',
              character.adult ? chalk.yellow('Yes') : 'No'
            ])
          ];
          
          // Validate table data before printing
          // Ensure no row has undefined or null values
          const validatedTableData = tableData.map(row =>
            row.map(cell => cell === undefined || cell === null ? '' : String(cell))
          );
          
          // Configure table options
          const tableConfig = {
            columns: {},
            singleLine: true
            // Removed ansi: true as it causes issues with the table library
          };
          
          // Print table with configuration
          console.log(table(validatedTableData, tableConfig));
          console.log(`Total: ${response.data.length} characters`);
        } catch (tableError) {
          // Log the error for debugging
          console.error(`Table error: ${(tableError as Error).message}`);
          
          // Fallback to simple format if table formatting fails
          console.log(chalk.yellow('Unable to display data in table format. Showing simplified list:'));
          response.data.forEach((character, index) => {
            console.log(`\n${chalk.cyan(`Character ${index + 1}:`)}`);
            console.log(`Name: ${chalk.green(sanitizeString(character.name) || 'Unknown')}`);
            console.log(`Slug: ${sanitizeString(character.slug) || 'Unknown'}`);
            console.log(`Description: ${sanitizeString(character.description || '-')}`);
            console.log(`Tags: ${character.tags ? sanitizeString(character.tags.join(', ')) : '-'}`);
            console.log(`Web Enabled: ${character.webEnabled ? 'Yes' : 'No'}`);
            console.log(`Adult: ${character.adult ? chalk.yellow('Yes') : 'No'}`);
          });
        }
        
        // Show usage example
        console.log('\nUse characters with:');
        console.log(chalk.yellow(`venice chat completion --prompt "Hello" --character "${response.data[0]?.slug || 'character-slug'}"`));
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
      }
    });

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

/**
 * Truncate a string to a maximum length
 */
function truncateString(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}
}