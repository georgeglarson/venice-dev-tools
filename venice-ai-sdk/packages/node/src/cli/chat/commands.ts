// Chat commands registration
import { Command } from 'commander';
import { VeniceNode } from '../../venice-node';
import { handleChatCompletion } from './completion';
import { startInteractiveChat } from './interactive';
import { ChatCommandOptions } from './types';

/**
 * Register chat-related commands with the CLI
 * @param program - The Commander program instance
 * @param venice - The Venice Node client
 */
export function registerChatCommands(program: Command, venice: VeniceNode): void {
  // Create the main chat command
  const chat = program
    .command('chat')
    .description('Chat with Venice AI models');

  // Chat completion command
  chat
    .command('completion')
    .description('Create a chat completion')
    .option('-m, --model <model>', 'Model to use', 'llama-3.3-70b')
    .option('-p, --prompt <prompt>', 'Chat prompt message')
    .option('-s, --system <system>', 'System message for the chat')
    .option('-t, --temperature <temperature>', 'Temperature for sampling (0.0-2.0)', '0.7')
    .option('--max-tokens <maxTokens>', 'Maximum tokens to generate')
    .option('--stream', 'Stream the response', false)
    .option('--web-search', 'Enable web search', false)
    .option('--character <character>', 'Character slug to use')
    .option('--attach <files>', 'Attach files to the message (comma-separated paths)')
    .option('--pdf-mode <mode>', 'How to process PDF files (image, text, or both)', 'image')
    .option('--raw', 'Output raw text without formatting (useful for piping to other commands)', false)
    .option('--json', 'Output response as JSON (useful for programmatic use)', false)
    .action(async (options: ChatCommandOptions) => {
      await handleChatCompletion(venice, options);
    });

  // Interactive chat command
  chat
    .command('interactive')
    .alias('i')
    .description('Start an interactive chat session')
    .option('-m, --model <model>', 'Model to use', 'llama-3.3-70b')
    .option('-s, --system <system>', 'System message for the chat')
    .option('-t, --temperature <temperature>', 'Temperature for sampling (0.0-2.0)', '0.7')
    .option('--stream', 'Stream the response', false)
    .option('--web-search', 'Enable web search', false)
    .option('--character <character>', 'Character slug to use')
    .option('--pdf-mode <mode>', 'How to process PDF files (image, text, or both)', 'image')
    .option('--raw', 'Output raw text without formatting (ignored in interactive mode)', false)
    .option('--json', 'Output response as JSON (ignored in interactive mode)', false)
    .action(async (options: ChatCommandOptions) => {
      await startInteractiveChat(venice, options);
    });

  // Add a default action for the chat command to start interactive mode
  chat.action(async (options: ChatCommandOptions) => {
    if (options.prompt) {
      // If a prompt is provided directly to the chat command, handle it as a completion
      await handleChatCompletion(venice, options);
    } else {
      // Otherwise, start interactive mode
      await startInteractiveChat(venice, options);
    }
  });
}