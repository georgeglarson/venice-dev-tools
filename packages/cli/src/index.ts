import { Command } from 'commander';
import { VeniceSDK } from '@venice-sdk/core';
import { NodeHttpAdapter } from '@venice-sdk/node';

/**
 * Create CLI interface
 */
export function createCLI(): Command {
  const program = new Command();

  // Initialize SDK
  const sdk = VeniceSDK.create(
    {
      apiKey: process.env.VENICE_API_KEY || '',
      baseUrl: process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1'
    },
    new NodeHttpAdapter()
  );

  // Chat command
  program
    .command('chat')
    .description('Generate chat completions')
    .argument('<prompt>', 'The prompt to send to the AI')
    .option('-m, --model <model>', 'Model to use', 'llama-3.3-70b')
    .option('-t, --temperature <temperature>', 'Sampling temperature', parseFloat, 1.0)
    .option('-n, --number <number>', 'Number of completions to generate', parseInt, 1)
    .action(async (prompt, options) => {
      try {
        const response = await sdk.chat.createCompletion({
          model: options.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature,
          n: options.number
        });

        response.choices.forEach((choice, index) => {
          console.log(`\nCompletion ${index + 1}:`);
          console.log(choice.message.content);
        });
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    });

  // Image command
  program
    .command('image')
    .description('Generate images from text prompts')
    .argument('<prompt>', 'The prompt to generate images from')
    .option('-n, --number <number>', 'Number of images to generate', parseInt, 1)
    .option('-s, --size <size>', 'Image size', '1024x1024')
    .action(async (prompt, options) => {
      try {
        const response = await sdk.image.generate({
          prompt,
          n: options.number,
          size: options.size
        });

        response.data.forEach((image, index) => {
          console.log(`\nImage ${index + 1}:`);
          console.log(image.url || 'Base64 image data available');
        });
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    });

  // Models command
  program
    .command('models')
    .description('List available models')
    .action(async () => {
      try {
        const response = await sdk.models.list();
        console.log('\nAvailable Models:');
        response.data.forEach(model => {
          console.log(`\n${model.name} (${model.id})`);
          console.log(`  Status: ${model.status}`);
          console.log(`  Capabilities: ${Object.entries(model.capabilities)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(', ')}`);
        });
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    });

  return program;
}

// Main CLI execution
if (require.main === module) {
  const program = createCLI();
  program.parse(process.argv);
}