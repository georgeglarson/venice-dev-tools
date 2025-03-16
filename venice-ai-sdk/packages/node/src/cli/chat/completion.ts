// Chat completion handler
import chalk from 'chalk';
import { VeniceNode } from '../../venice-node';
import { ChatMessage, ChatCompletionRequest, ChatCompletionResponse, ChatCommandOptions, ChatJsonOutput } from './types';
import { processFileList } from './file-processor';
import { TextContent, ContentItem } from '@venice-dev-tools/core/src/types/multimodal';

// Simple spinner implementation to avoid ora dependency issues
class SimpleSpinner {
  private message: string;
  private interval: NodeJS.Timeout | null = null;
  
  constructor(message: string = '') {
    this.message = message;
  }
  
  start(): this {
    if (!this.interval) {
      console.log(`${this.message}...`);
    }
    return this;
  }
  
  stop(): this {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    return this;
  }
  
  fail(text: string): this {
    this.stop();
    console.error(chalk.red(`✖ ${text}`));
    return this;
  }
}

/**
 * Handle a chat completion request
 * @param venice - The Venice Node client
 * @param options - Command options
 */
export async function handleChatCompletion(
  venice: VeniceNode,
  options: ChatCommandOptions
): Promise<void> {
  // If no prompt is provided, start interactive mode
  if (!options.prompt) {
    // This will be handled by the interactive chat handler
    return;
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
      const processedFiles = await processFileList(fileList, { 
        pdfMode: options.pdfMode as 'text' | 'image' | 'both' 
      });
      
      // Create content array for multimodal input
      const contentArray: ContentItem[] = [
        {
          type: 'text' as const,
          text: options.prompt || 'Please analyze these files.'
        } as TextContent,
        ...processedFiles
      ];
      
      // Use content array instead of string content
      messages.push({
        role: 'user',
        content: contentArray
      });
      
      // Auto-select vision model if needed
      if (
        processedFiles.some((file) => file.type === 'image_url') &&
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
    model: options.model || 'llama-3.3-70b',
    messages: messages as any, // Type assertion to avoid TypeScript errors
    temperature: parseFloat(options.temperature || '0.7'),
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
    const spinner = new SimpleSpinner('Generating response');
    spinner.start();

    if (options.stream) {
      await handleStreamingCompletion(venice, request, options, spinner);
    } else {
      await handleStandardCompletion(venice, request, options, spinner);
    }
  } catch (error) {
    const spinner = new SimpleSpinner();
    spinner.stop();
    
    formatErrorResponse(error as Error, {
      raw: options.raw,
      json: options.json
    });
    
    process.exit(1);
  }
}

/**
 * Format an error message for display
 * @param error - The error object
 * @param options - Formatting options
 */
function formatErrorResponse(
  error: Error,
  options: { raw?: boolean; json?: boolean } = {}
): void {
  const errorMessage = error.message;
  const isAuthError = error.name === 'VeniceAuthError' || errorMessage.includes('API key');

  if (options.json) {
    // Output error as JSON
    console.error(
      JSON.stringify(
        {
          error: errorMessage,
          type: isAuthError ? 'auth_error' : 'api_error',
          status: 'error'
        },
        null,
        2
      )
    );
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
      console.error(chalk.red(`Error: ${errorMessage}`));
    }
  }
}

/**
 * Handle a streaming chat completion
 * @param venice - The Venice Node client
 * @param request - The chat completion request
 * @param options - Command options
 * @param spinner - The loading spinner
 */
async function handleStreamingCompletion(
  venice: VeniceNode,
  request: ChatCompletionRequest,
  options: ChatCommandOptions,
  spinner: SimpleSpinner
): Promise<void> {
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
    // Note: Using any type assertion because the SDK might have different method names
    // in different versions
    const streamGenerator = (venice.chat as any).createCompletionStream({
      ...request,
      stream: true
    });
    
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
      const jsonOutput: ChatJsonOutput = {
        prompt: options.prompt || '',
        response: responseText,
        model: options.model || 'llama-3.3-70b',
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
}

/**
 * Handle a standard (non-streaming) chat completion
 * @param venice - The Venice Node client
 * @param request - The chat completion request
 * @param options - Command options
 * @param spinner - The loading spinner
 */
async function handleStandardCompletion(
  venice: VeniceNode,
  request: ChatCompletionRequest,
  options: ChatCommandOptions,
  spinner: SimpleSpinner
): Promise<void> {
  const response = await venice.chat.createCompletion(request as any) as unknown as ChatCompletionResponse;
  spinner.stop();
  
  if (options.json) {
    // Output as JSON
    const jsonOutput: ChatJsonOutput = {
      prompt: options.prompt || '',
      response: typeof response.choices[0]?.message?.content === 'string' 
        ? response.choices[0]?.message?.content 
        : JSON.stringify(response.choices[0]?.message?.content),
      model: options.model || 'llama-3.3-70b',
      usage: response.usage,
      web_search_citations: (response as any).venice_parameters?.web_search_citations || []
    };
    
    console.log(JSON.stringify(jsonOutput, null, 2));
  } else if (options.raw) {
    // Output raw text only
    const content = response.choices[0]?.message?.content;
    console.log(typeof content === 'string' ? content : JSON.stringify(content));
  } else {
    // Standard formatted output
    console.log(chalk.cyan('User: ') + options.prompt);
    
    const content = response.choices[0]?.message?.content;
    console.log(chalk.green('Venice AI: ') + (typeof content === 'string' ? content : JSON.stringify(content)));
    
    // Display web search citations if available
    const citations = (response as any).venice_parameters?.web_search_citations;
    if (citations && citations.length > 0) {
      console.log('\n' + chalk.yellow('Citations:'));
      citations.forEach((citation: any, i: number) => {
        console.log(`${i + 1}. ${chalk.blue(citation.title)}: ${citation.url}`);
      });
    }

    // Display usage statistics
    if (response.usage) {
      console.log(
        '\n' +
          chalk.dim(
            `Tokens: ${response.usage.total_tokens} (${response.usage.prompt_tokens} prompt, ${response.usage.completion_tokens} completion)`
          )
      );
    }
  }
}