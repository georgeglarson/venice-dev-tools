// images.ts
import { Command } from 'commander';
import * as chalk from 'chalk';
import ora from 'ora';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { VeniceNode } from '../../venice-node';
import { GenerateImageRequest, ListImageStylesResponse } from '@venice-dev-tools/core';

/**
 * Resolve an available image generation model
 */
async function resolveImageModel(venice: VeniceNode, preferredModel?: string): Promise<string> {
  try {
    const models = await venice.models.list({ type: 'image' });
    if (!models.data.length) {
      throw new Error('No image-capable models currently available from the API.');
    }

    if (preferredModel) {
      const preferred = models.data.find((model) => model.id === preferredModel);
      if (preferred) {
        return preferred.id;
      }
    }

    // Fall back to the first available model
    return models.data[0].id;
  } catch (error: any) {
    throw new Error(`Unable to determine an image model: ${error.message}`);
  }
}

/**
 * Register image-related commands with the CLI
 */
export function registerImagesCommands(program: Command, venice: VeniceNode): void {
  const images = program
    .command('images')
    .description('Interact with Venice AI image generation capabilities');

  // Generate image command
  images
    .command('generate [prompt]')
    .description('Generate an image with AI')
    .option('-m, --model <model>', 'Model to use (auto-selects if not specified)')
    .option('-p, --prompt <prompt>', 'Image generation prompt (alternative to positional argument)')
    .option('-n, --negative-prompt <prompt>', 'Negative prompt')
    .option('-s, --style <style>', 'Style preset to apply')
    .option('-w, --width <width>', 'Image width', '1024')
    .option('-h, --height <height>', 'Image height', '1024')
    .option('-c, --cfg-scale <scale>', 'CFG scale (1-20)', '7.5')
    .option('--steps <steps>', 'Number of inference steps (1-50)', '20')
    .option('--seed <seed>', 'Random seed (optional)')
    .option('-o, --output <path>', 'Output file path')
    .option('--format <format>', 'Image format (png or webp)', 'png')
    .action(async (promptArg, options) => {
      // Use positional argument if provided, otherwise use --prompt option
      let promptToUse = promptArg || options.prompt;
      
      // Prompt for a prompt if not provided
      if (!promptToUse) {
        const answers = await inquirer.prompt([{
          type: 'input',
          name: 'prompt',
          message: 'Enter an image generation prompt:',
          validate: (input) => input.length > 0 ? true : 'Prompt cannot be empty'
        }]);
        promptToUse = answers.prompt;
      }
      
      // Store the prompt in options for consistent usage in the rest of the function
      options.prompt = promptToUse;

      // Resolve the model to use
      let modelToUse: string;
      try {
        modelToUse = await resolveImageModel(venice, options.model);
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        console.log(chalk.yellow('\nNote: Image models may not be available at this time.'));
        console.log(chalk.yellow('Check https://venice.ai/models for current availability.'));
        process.exit(1);
      }

      // Create request
      const request: GenerateImageRequest = {
        model: modelToUse,
        prompt: options.prompt,
        size: parseInt(options.width, 10), // Using size instead of width/height
        negative_prompt: options.negativePrompt,
        style: options.style,
        // Add other parameters as needed
      };

      // Start generation
      const spinner = ora(`Generating image with ${modelToUse}...`).start();

      try {
        // Generate the image
        const response = await venice.images.generate(request);
        spinner.succeed('Image generated successfully');

        // Determine output path
        let outputPath = options.output;
        if (!outputPath) {
          // Create default filename if none provided
          const timestamp = Date.now();
          const ext = options.format || 'png';
          outputPath = path.join(process.cwd(), `venice-image-${timestamp}.${ext}`);
        }

        // Save the image
        if (response.data && response.data.url) {
          const filePath = venice.saveImageToFile(response.data.url, outputPath);
          console.log(`\nImage saved to: ${chalk.cyan(filePath)}`);
          
          // Display generation info
          console.log('\nGeneration Info:');
          console.log(`Model: ${chalk.green(response.data.model)}`);
          
          // Display prompt info
          console.log('\nPrompt:');
          console.log(chalk.white(response.data.prompt));

          if (response.data.negative_prompt) {
            console.log('\nNegative Prompt:');
            console.log(chalk.gray(response.data.negative_prompt));
          }
        } else {
          console.error(chalk.red('No image was returned in the response'));
        }
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // Upscale image command
  images
    .command('upscale')
    .description('Upscale an existing image')
    .argument('<image>', 'Path to the image file to upscale')
    .option('-s, --scale <factor>', 'Scale factor (2 or 4)', '2')
    .option('-o, --output <path>', 'Output file path')
    .action(async (imagePath, options) => {
      // Validate image path
      if (!fs.existsSync(imagePath)) {
        console.error(chalk.red(`Error: Image file not found at ${imagePath}`));
        process.exit(1);
      }

      // Determine output path
      let outputPath = options.output;
      if (!outputPath) {
        const parsedPath = path.parse(imagePath);
        outputPath = path.join(
          parsedPath.dir, 
          `${parsedPath.name}-upscaled${parsedPath.ext}`
        );
      }

      // Load the image file
      const imageBuffer = venice.readImageFile(imagePath);
      const scaleValue = parseInt(options.scale, 10);
      
      // Validate scale is either 2 or 4
      if (scaleValue !== 2 && scaleValue !== 4) {
        console.error(chalk.red(`Error: Scale factor must be either 2 or 4, got ${scaleValue}`));
        process.exit(1);
      }
      
      // Start upscaling
      const spinner = ora('Upscaling image...').start();

      try {
        // Upscale the image - use base64 string instead of buffer
        const base64Image = imageBuffer.toString('base64');
        
        // Upscale the image
        const blob = await venice.images.upscale({
          image: `data:image/png;base64,${base64Image}`,
          scale: scaleValue as 2 | 4
        });

        // Convert blob to buffer for Node.js
        const blobArrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(blobArrayBuffer);
        
        // Create the directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write the upscaled image
        fs.writeFileSync(outputPath, buffer);
        spinner.succeed('Image upscaled successfully');
        console.log(`\nUpscaled image saved to: ${chalk.cyan(outputPath)}`);
        console.log(`Scale factor: ${chalk.yellow(scaleValue)}x`);
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // List image styles command
  images
    .command('styles')
    .description('List available image styles')
    .action(async () => {
      const spinner = ora('Fetching available styles...').start();
      
      try {
        const response = await venice.images.listStyles();
        spinner.stop();
        
        if (response.styles.length === 0) {
          console.log(chalk.yellow('No image styles found.'));
          return;
        }
        
        console.log(chalk.bold('\nAvailable Image Styles:'));
        
        // Create a formatted list of styles
        response.styles.forEach((style, index) => {
          console.log(`${chalk.cyan(String(index + 1).padStart(2, ' '))}. ${chalk.green(style.name)}`);
        });
        
        console.log(`\nTotal: ${response.styles.length} styles\n`);
        console.log(`Use styles with: ${chalk.yellow('venice images generate --style "Style Name"')}`);
      } catch (error) {
        spinner.fail(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    });
}