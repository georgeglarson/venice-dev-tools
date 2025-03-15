// Vision commands implementation
import { Command } from 'commander';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import * as path from 'path';
import ora from 'ora';
import { VeniceNode } from '../../venice-node';
import { processFile } from '../../utils';

/**
 * Register vision-related commands with the CLI
 */
export function registerVisionCommands(program: Command, venice: VeniceNode): void {
  const vision = program
    .command('vision')
    .description('Use vision models to analyze images');

  // Analyze image command
  vision
    .command('analyze [imagePath]')
    .description('Analyze an image with a vision model')
    .option('-m, --model <model>', 'Vision model to use', 'qwen-2.5-vl')
    .option('-p, --prompt <prompt>', 'Prompt to describe what to analyze')
    .option('-i, --image <image>', 'Path to the image file (alternative to positional argument)')
    .option('--raw', 'Output raw text without formatting', false)
    .option('--json', 'Output response as JSON', false)
    .action(async (imagePath, options) => {
      // Use positional argument if provided, otherwise use --image option
      const imageToAnalyze = imagePath || options.image;
      
      // Validate required parameters
      if (!imageToAnalyze) {
        console.error(chalk.red('Error: Image path is required (provide as argument or with --image flag)'));
        process.exit(1);
      }
      
      // Store the image path in options for consistent usage in the rest of the function
      options.image = imageToAnalyze;

      if (!options.prompt) {
        // If no prompt is provided, use a default one
        options.prompt = 'Describe this image in detail.';
      }

      try {
        // Process the image file
        const processedFile = processFile(options.image);
        
        // Create the request payload
        const request = {
          model: options.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: options.prompt
                },
                processedFile
              ]
            }
          ]
        };

        // Start the spinner
        const spinner = ora('Analyzing image...').start();

        // Send the request
        const response = await venice.chat.createCompletion(request as any);
        spinner.stop();

        // Handle the response
        if (options.json) {
          // Output as JSON
          console.log(JSON.stringify({
            prompt: options.prompt,
            image: path.basename(options.image),
            response: response.choices[0]?.message?.content,
            model: options.model,
            usage: response.usage
          }, null, 2));
        } else if (options.raw) {
          // Output raw text only
          console.log(response.choices[0]?.message?.content);
        } else {
          // Standard formatted output
          console.log(chalk.cyan('Prompt: ') + options.prompt);
          console.log(chalk.cyan('Image: ') + path.basename(options.image));
          console.log(chalk.green('Analysis: ') + response.choices[0]?.message?.content);
          
          // Display usage statistics
          console.log('\n' + chalk.dim(`Tokens: ${response.usage.total_tokens} (${response.usage.prompt_tokens} prompt, ${response.usage.completion_tokens} completion)`));
        }
      } catch (error) {
        const spinner = ora();
        spinner.stop();
        
        const errorMessage = (error as Error).message;
        console.error(chalk.red(`Error: ${errorMessage}`));
        process.exit(1);
      }
    });

  // Interactive vision command
  vision
    .command('interactive [imagePath]')
    .alias('i')
    .description('Start an interactive vision session with an image')
    .option('-m, --model <model>', 'Vision model to use', 'qwen-2.5-vl')
    .option('-i, --image <image>', 'Path to the image file (alternative to positional argument)')
    .action(async (imagePath, options) => {
      // Use positional argument if provided, otherwise use --image option
      const imageToAnalyze = imagePath || options.image;
      
      // Validate required parameters
      if (!imageToAnalyze) {
        console.error(chalk.red('Error: Image path is required (provide as argument or with --image flag)'));
        process.exit(1);
      }
      
      // Store the image path in options for consistent usage in the rest of the function
      options.image = imageToAnalyze;

      try {
        // Process the image file
        const processedFile = processFile(options.image);
        
        console.log(chalk.bold('Venice AI Interactive Vision Session'));
        console.log(chalk.dim(`Model: ${options.model}`));
        console.log(chalk.dim(`Image: ${path.basename(options.image)}`));
        console.log(chalk.dim('Type "exit" or Ctrl+C to end the session\n'));

        // Interactive loop
        while (true) {
          let userInput;
          
          try {
            const response = await inquirer.prompt([
              {
                type: 'input',
                name: 'userInput',
                message: chalk.cyan('You:'),
                prefix: ''
              }
            ]);
            userInput = response.userInput;
          } catch (error) {
            console.log(chalk.dim('Ending vision session (non-interactive input)'));
            break;
          }

          // Exit condition
          if (!userInput || userInput.toLowerCase() === 'exit') {
            console.log(chalk.dim('Ending vision session'));
            break;
          }

          // Create the request payload for each interaction
          // This avoids issues with message history
          const request = {
            model: options.model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: userInput
                  },
                  processedFile
                ]
              }
            ]
          };

          // Send the request
          const spinner = ora('Thinking...').start();
          
          try {
            const response = await venice.chat.createCompletion(request as any);
            spinner.stop();

            // Display the response
            const assistantResponse = response.choices[0]?.message;
            if (assistantResponse && assistantResponse.content) {
              console.log(chalk.green('Venice AI: ') + assistantResponse.content + '\n');
            } else {
              console.log(chalk.red('No response generated.\n'));
            }
          } catch (error) {
            spinner.stop();
            console.error(chalk.red(`Error: ${(error as Error).message}\n`));
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });
}