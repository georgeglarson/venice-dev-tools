// Chat commands implementation
import { Command } from 'commander';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import * as path from 'path';
import ora from 'ora';
import { VeniceNode } from '../../venice-node';
import type { ChatCompletionRequest as BaseChatCompletionRequest, ChatCompletionResponse as BaseChatCompletionResponse } from '@venice-dev-tools/core';
import type { ContentItem, TextContent } from '@venice-dev-tools/core/src/types/multimodal';
import { processFile } from '../../utils';

// Define ChatMessage interface locally to avoid import issues
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentItem[];
}

// Extend the ChatCompletionRequest interface to include venice_parameters
interface ChatCompletionRequest extends BaseChatCompletionRequest {
  venice_parameters?: {
    enable_web_search?: 'auto' | 'on' | 'off';
    character_slug?: string;
    include_venice_system_prompt?: boolean;
  };
}

// Extend the ChatCompletionResponse interface to include venice_parameters
interface ChatCompletionResponse extends BaseChatCompletionResponse {
  venice_parameters?: {
    web_search_citations?: Array<{
      title: string;
      url: string;
    }>;
  };
}

/**
 * Register chat-related commands with the CLI
 */
export function registerChatCommands(program: Command, venice: VeniceNode): void {
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
    .action(async (options) => {
      // If no prompt is provided, start interactive mode
      if (!options.prompt) {
        return startInteractiveChat(venice, options);
      }

      const messages: ChatMessage[] = [];
      
      // Add system message if provided
      if (options.system) {
        messages.push({
          role: 'system',
          content: options.system
        });
      }
      
      // Handle file attachments
      if (options.attach) {
        const fileList = options.attach.split(',').map((f: string) => f.trim());
        
        try {
          // Process all files
          const processedFiles = await Promise.all(fileList.map(async (filePath: string) => {
            try {
              return await processFile(filePath, { pdfMode: options.pdfMode });
            } catch (error) {
              console.error(chalk.red(`Error processing file ${filePath}: ${(error as Error).message}`));
              throw error;
            }
          }));
          
          // Create content array for multimodal input
          const contentArray = [
            {
              type: 'text',
              text: options.prompt || 'Please analyze these files.'
            },
            ...processedFiles
          ];
          
          // Use content array instead of string content
          messages.push({
            role: 'user',
            content: contentArray
          });
          
          // Auto-select vision model if needed
          if (
            processedFiles.some((file: ContentItem) => file.type === 'image_url') &&
            options.model === 'llama-3.3-70b' // default model
          ) {
            // Use the default vision model
            options.model = 'qwen-2.5-vl';
            console.log(chalk.yellow(`Using vision model: ${options.model} for image analysis`));
          }
        } catch (error) {
          console.error(chalk.red(`Error processing files: ${(error as Error).message}`));
          process.exit(1);
        }
      } else {
        // Regular text-only message
        messages.push({
          role: 'user',
          content: options.prompt
        });
      }

      // Create request payload
      const request: ChatCompletionRequest = {
        model: options.model,
        messages: messages as any, // Type assertion to avoid TypeScript errors
        temperature: parseFloat(options.temperature),
        venice_parameters: {}
      };

      // Set max tokens if provided
      if (options.maxTokens) {
        request.max_tokens = parseInt(options.maxTokens, 10);
      }

      // Set web search if enabled
      if (options.webSearch) {
        request.venice_parameters!.enable_web_search = 'auto';
      }

      // Set character if provided
      if (options.character) {
        request.venice_parameters!.character_slug = options.character;
      }

      // Check if both raw and json options are provided
      if (options.raw && options.json) {
        console.error(chalk.red('Error: Cannot use both --raw and --json options together'));
        process.exit(1);
      }

      try {
        const spinner = ora('Generating response...').start();

        if (options.stream) {
          spinner.stop();
          
          // Prepare for streaming
          let responseText = '';
          
          // Execute the stream using the async generator pattern
          try {
            // Set up for different output formats
            if (!options.raw && !options.json) {
              if (options.attach) {
                // For multimodal content, show the prompt and file info
                console.log(chalk.cyan('User: ') + options.prompt);
                console.log(chalk.cyan('Files: ') + options.attach);
              } else {
                // For text-only content, just show the prompt
                console.log(chalk.cyan('User: ') + options.prompt);
              }
              console.log(chalk.green('Venice AI: '));
            }
            
            // Get the stream generator
            const streamGenerator = venice.chat.streamCompletion({
              ...request,
              stream: true
            } as any);
            
            // Process the stream
            for await (const chunk of streamGenerator) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                // Handle content based on output format
                if (options.raw || !options.json) {
                  // For raw mode or standard mode, write to stdout
                  process.stdout.write(content);
                }
                
                // Always collect the content for potential JSON output
                responseText += content;
              }
            }
            
            // Handle completion based on output format
            if (options.json) {
              // For JSON mode, output the collected response
              const jsonOutput: {
                prompt: string;
                response: string;
                model: string;
                stream: boolean;
                files?: string[];
              } = {
                prompt: options.prompt,
                response: responseText,
                model: options.model,
                stream: true
              };
              
              // Add file information if files were attached
              if (options.attach) {
                jsonOutput.files = options.attach.split(',').map((f: string) => f.trim());
              }
              
              console.log(JSON.stringify(jsonOutput, null, 2));
            } else {
              // For raw mode, just add a newline
              // For standard mode, add two newlines
              process.stdout.write(options.raw ? '\n' : '\n\n');
            }
          } catch (error) {
            throw error;
          }
        } else {
          const response = await venice.chat.createCompletion(request as any) as unknown as ChatCompletionResponse;
          spinner.stop();
          
          if (options.json) {
            // Output as JSON
            console.log(JSON.stringify({
              prompt: options.prompt,
              response: response.choices[0]?.message?.content,
              model: options.model,
              usage: response.usage,
              web_search_citations: (response as any).venice_parameters?.web_search_citations || []
            }, null, 2));
          } else if (options.raw) {
            // Output raw text only
            console.log(response.choices[0]?.message?.content);
          } else {
            // Standard formatted output
            console.log(chalk.cyan('User: ') + options.prompt);
            console.log(chalk.green('Venice AI: ') + response.choices[0]?.message?.content);
            
            // Display web search citations if available
            if ((response as any).venice_parameters?.web_search_citations?.length) {
              console.log('\n' + chalk.yellow('Citations:'));
              (response as any).venice_parameters.web_search_citations.forEach((citation: any, i: number) => {
                console.log(`${i + 1}. ${chalk.blue(citation.title)}: ${citation.url}`);
              });
            }

            // Display usage statistics
            console.log('\n' + chalk.dim(`Tokens: ${response.usage.total_tokens} (${response.usage.prompt_tokens} prompt, ${response.usage.completion_tokens} completion)`));
          }
        }
      } catch (error) {
        const spinner = ora();
        spinner.stop();
        
        const errorMessage = (error as Error).message;
        const isAuthError = (error as Error).name === 'VeniceAuthError' ||
                           errorMessage.includes('API key');
        
        if (options.json) {
          // Output error as JSON
          console.error(JSON.stringify({
            error: errorMessage,
            type: isAuthError ? 'auth_error' : 'api_error',
            status: 'error'
          }, null, 2));
        } else if (options.raw) {
          // Output raw error message
          console.error(errorMessage);
        } else {
          // Standard formatted error
          if (isAuthError) {
            console.error(chalk.red('Error: API key not found or invalid.'));
            console.error(chalk.yellow('Please provide an API key using one of these methods:'));
            console.error(chalk.yellow('1. Use the --api-key or -k option: venice -k YOUR_API_KEY ...'));
            console.error(chalk.yellow('2. Set the VENICE_API_KEY environment variable'));
            console.error(chalk.yellow('3. Save your API key using: venice set-key YOUR_API_KEY'));
          } else {
            ora().fail(`Error: ${errorMessage}`);
          }
        }
        process.exit(1);
      }
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
    .action(async (options) => {
      await startInteractiveChat(venice, options);
    });
}

/**
 * Start an interactive chat session
 */
async function startInteractiveChat(venice: VeniceNode, options: any): Promise<void> {
  console.log(chalk.bold('Venice AI Interactive Chat'));
  console.log(chalk.dim(`Model: ${options.model}`));
  console.log(chalk.dim(`Mode: ${options.stream ? 'Streaming' : 'Standard'}`));
  console.log(chalk.dim('Type "exit" or Ctrl+C to end the session'));
  console.log(chalk.dim('Type "/attach [filepath]" to include a file\n'));

  // Notify if raw or json options are provided
  if (options.raw || options.json) {
    console.log(chalk.yellow('Note: --raw and --json options are ignored in interactive mode\n'));
  }

  const messages: ChatMessage[] = [];

  // Add system message if provided
  if (options.system) {
    messages.push({
      role: 'system',
      content: options.system
    });
    console.log(chalk.yellow('System: ') + options.system + '\n');
  }

  // Interactive chat loop
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
      // Handle case where stdin is not a TTY (e.g., piped input)
      console.log(chalk.dim('Ending chat session (non-interactive input)'));
      break;
    }

    // Exit condition
    if (!userInput || userInput.toLowerCase() === 'exit') {
      console.log(chalk.dim('Ending chat session'));
      break;
    }

    // Check for attach command
    if (userInput.startsWith('/attach ')) {
      const filePath = userInput.substring(8).trim();
      
      try {
        const processedFile = await processFile(filePath, { pdfMode: options.pdfMode });
        
        // Prompt for a message to accompany the file
        const messageResponse = await inquirer.prompt([{
          type: 'input',
          name: 'message',
          message: chalk.cyan('Enter a message to accompany the file:'),
          default: 'Please analyze this file.'
        }]);
        
        // Create content array
        const contentArray: ContentItem[] = [
          {
            type: 'text',
            text: messageResponse.message
          } as TextContent
        ];
        
        // Add the processed file(s) to the content array
        if (Array.isArray(processedFile)) {
          contentArray.push(...processedFile);
        } else {
          contentArray.push(processedFile);
        }
        
        // Add to messages
        messages.push({
          role: 'user',
          content: contentArray
        });
        
        // Auto-select vision model if needed
        const hasImage = Array.isArray(processedFile)
          ? processedFile.some(item => item.type === 'image_url')
          : processedFile.type === 'image_url';
          
        if (hasImage && options.model === 'llama-3.3-70b') {
          options.model = 'qwen-2.5-vl';
          console.log(chalk.yellow(`Switched to vision model: ${options.model}`));
        }
        
        console.log(chalk.green(`File attached: ${path.basename(filePath)}`));
        continue; // Skip to next iteration
      } catch (error) {
        console.error(chalk.red(`Error attaching file: ${(error as Error).message}`));
        continue; // Skip to next iteration
      }
    }

    // Add user message (for regular text messages)
    messages.push({
      role: 'user',
      content: userInput
    });

    // Let's try a completely different approach
    // Instead of trying to reuse the file message, let's create a new multimodal message
    // that combines the image and the current text input
    
    console.log(chalk.dim(`Debug: Message history has ${messages.length} messages`));
    
    // Find the last file attachment message to extract the image
    const fileMessage = messages.find(msg =>
      msg.role === 'user' &&
      typeof msg.content !== 'string' &&
      Array.isArray(msg.content)
    );
    
    // Create a new message array for the API
    const apiMessages = [];
    
    // Add system message if present
    const systemMessage = messages.find(msg => msg.role === 'system');
    if (systemMessage) {
      apiMessages.push({
        role: 'system',
        content: typeof systemMessage.content === 'string'
          ? systemMessage.content
          : JSON.stringify(systemMessage.content)
      });
    }
    
    // If we have a file message with an image, create a new multimodal message
    if (fileMessage && fileMessage.content && Array.isArray(fileMessage.content)) {
      // Find the image content item
      const imageItem = fileMessage.content.find(item =>
        item.type === 'image_url' && item.image_url && item.image_url.url
      );
      
      if (imageItem) {
        // Create a new multimodal message with both the image and the current text
        apiMessages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: userInput
            },
            imageItem
          ]
        });
        
        console.log(chalk.dim(`Debug: Created new multimodal message with image and text: "${userInput}"`));
      } else {
        // No image found, just add the text
        apiMessages.push({
          role: 'user',
          content: userInput
        });
      }
    } else {
      // No file message, just add the text
      apiMessages.push({
        role: 'user',
        content: userInput
      });
    }
    
    // Create the request with the new message array
    const request: ChatCompletionRequest = {
      model: options.model,
      messages: apiMessages as any, // Type assertion to avoid TypeScript errors
      temperature: parseFloat(options.temperature),
      venice_parameters: {}
    };
    
    console.log(chalk.dim(`Debug: Sending ${apiMessages.length} messages to API`));
    console.log(chalk.dim(`Debug: Using model: ${options.model}`));

    // Set web search if enabled
    if (options.webSearch) {
      request.venice_parameters!.enable_web_search = 'auto';
    }

    // Set character if provided
    if (options.character) {
      request.venice_parameters!.character_slug = options.character;
    }

    try {
      // Check if streaming is enabled
      if (options.stream) {
        console.log(chalk.green('Venice AI: '));
        
        // Prepare for streaming
        let responseText = '';
        
        try {
          // Get the stream generator
          const streamGenerator = venice.chat.streamCompletion({
            ...request,
            stream: true
          } as any);
          
          // Process the stream
          for await (const chunk of streamGenerator) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              // Write to stdout
              process.stdout.write(content);
              
              // Collect the content
              responseText += content;
            }
          }
          
          // Add a newline after streaming
          process.stdout.write('\n\n');
          
          // Add assistant message to history
          messages.push({
            role: 'assistant',
            content: responseText
          });
          
        } catch (error) {
          console.error(chalk.red(`Error during streaming: ${(error as Error).message}\n`));
        }
      } else {
        // Non-streaming mode
        const spinner = ora('Thinking...').start();
  
        const response = await venice.chat.createCompletion(request as any) as unknown as ChatCompletionResponse;
        spinner.stop();
  
        // Get assistant response
        const assistantResponse = response.choices[0]?.message;
        if (assistantResponse && assistantResponse.content) {
          // For display purposes, convert content to string if it's not already
          const displayContent = typeof assistantResponse.content === 'string'
            ? assistantResponse.content
            : JSON.stringify(assistantResponse.content);
            
          console.log(chalk.green('Venice AI: ') + displayContent + '\n');
  
          // Add assistant message to history - always use string content for assistant responses
          // This ensures compatibility with future messages
          messages.push({
            role: 'assistant',
            content: typeof assistantResponse.content === 'string'
              ? assistantResponse.content
              : JSON.stringify(assistantResponse.content)
          });
  
          // Display web search citations if available
          if ((response as any).venice_parameters?.web_search_citations?.length) {
            console.log(chalk.yellow('Citations:'));
            (response as any).venice_parameters.web_search_citations.forEach((citation: any, i: number) => {
              console.log(`${i + 1}. ${chalk.blue(citation.title)}: ${citation.url}`);
            });
            console.log('');
          }
        } else {
          console.log(chalk.red('No response generated.\n'));
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}\n`));
    }
  }
}