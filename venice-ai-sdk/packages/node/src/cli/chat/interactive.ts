// Interactive chat handler
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as path from 'path';
import { VeniceNode } from '../../venice-node';
import { ChatMessage, ChatCommandOptions } from './types';
import { processFile } from './file-processor';
import { ContentItem, TextContent } from '@venice-dev-tools/core/src/types/multimodal';

/**
 * Start an interactive chat session
 * @param venice - The Venice Node client
 * @param options - Command options
 */
export async function startInteractiveChat(
  venice: VeniceNode,
  options: ChatCommandOptions
): Promise<void> {
  console.log(chalk.bold('Venice AI Interactive Chat'));
  console.log(chalk.dim(`Model: ${options.model || 'llama-3.3-70b'}`));
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
      await handleFileAttachment(userInput, messages, options, venice);
      continue; // Skip to next iteration
    }

    // Add user message (for regular text messages)
    messages.push({
      role: 'user',
      content: userInput
    });
    
    // Create a new message array for the API
    const apiMessages = prepareApiMessages(messages, userInput);
    
    // Send the message to the API
    await sendMessageToApi(venice, apiMessages, options);
  }
}

/**
 * Handle file attachment command
 * @param userInput - The user input containing the file path
 * @param messages - The chat message history
 * @param options - Command options
 * @param venice - The Venice Node client
 */
async function handleFileAttachment(
  userInput: string,
  messages: ChatMessage[],
  options: ChatCommandOptions,
  venice: VeniceNode
): Promise<void> {
  const filePath = userInput.substring(8).trim();
  
  try {
    const processedFile = await processFile(filePath, { 
      pdfMode: options.pdfMode as 'text' | 'image' | 'both' 
    });
    
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
        type: 'text' as const,
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
  } catch (error) {
    console.error(chalk.red(`Error attaching file: ${(error as Error).message}`));
  }
}

/**
 * Prepare messages for the API
 * @param messages - The chat message history
 * @param currentInput - The current user input
 * @returns Messages formatted for the API
 */
function prepareApiMessages(
  messages: ChatMessage[],
  currentInput: string
): ChatMessage[] {
  // Create a new message array for the API
  const apiMessages: ChatMessage[] = [];
  
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
  
  // Find the last file attachment message to extract the image
  const fileMessage = messages.find(msg =>
    msg.role === 'user' &&
    typeof msg.content !== 'string' &&
    Array.isArray(msg.content)
  );
  
  // If we have a file message with an image, create a new multimodal message
  if (fileMessage && fileMessage.content && Array.isArray(fileMessage.content)) {
    // Find the image content item
    const imageItem = fileMessage.content.find(item =>
      item.type === 'image_url' && 'image_url' in item
    );
    
    if (imageItem) {
      // Create a new multimodal message with both the image and the current text
      apiMessages.push({
        role: 'user',
        content: [
          {
            type: 'text' as const,
            text: currentInput
          } as TextContent,
          imageItem
        ]
      });
    } else {
      // No image found, just add the text
      apiMessages.push({
        role: 'user',
        content: currentInput
      });
    }
  } else {
    // No file message, just add the text
    apiMessages.push({
      role: 'user',
      content: currentInput
    });
  }
  
  return apiMessages;
}

/**
 * Send a message to the API and handle the response
 * @param venice - The Venice Node client
 * @param apiMessages - The messages to send
 * @param options - Command options
 */
async function sendMessageToApi(
  venice: VeniceNode,
  apiMessages: ChatMessage[],
  options: ChatCommandOptions
): Promise<void> {
  // Create the request
  const request = {
    model: options.model || 'llama-3.3-70b',
    messages: apiMessages as any, // Type assertion to avoid TypeScript errors
    temperature: parseFloat(options.temperature || '0.7'),
    venice_parameters: {}
  };
  
  // Set web search if enabled
  if (options.webSearch) {
    request.venice_parameters.enable_web_search = 'auto';
  }

  // Set character if provided
  if (options.character) {
    request.venice_parameters.character_slug = options.character;
  }

  try {
    // Check if streaming is enabled
    if (options.stream) {
      await handleStreamingResponse(venice, request);
    } else {
      await handleStandardResponse(venice, request);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${(error as Error).message}\n`));
  }
}

/**
 * Handle a streaming response
 * @param venice - The Venice Node client
 * @param request - The request object
 */
async function handleStreamingResponse(
  venice: VeniceNode,
  request: any
): Promise<void> {
  console.log(chalk.green('Venice AI: '));
  
  // Prepare for streaming
  let responseText = '';
  
  try {
    // Get the stream generator
    const streamGenerator = (venice.chat as any).createCompletionStream({
      ...request,
      stream: true
    });
    
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
    const messages = request.messages || [];
    messages.push({
      role: 'assistant',
      content: responseText
    });
    
  } catch (error) {
    console.error(chalk.red(`Error during streaming: ${(error as Error).message}\n`));
  }
}

/**
 * Handle a standard (non-streaming) response
 * @param venice - The Venice Node client
 * @param request - The request object
 */
async function handleStandardResponse(
  venice: VeniceNode,
  request: any
): Promise<void> {
  // Show a simple loading indicator
  console.log(chalk.dim('Thinking...'));

  const response = await venice.chat.createCompletion(request);

  // Get assistant response
  const assistantResponse = response.choices[0]?.message;
  if (assistantResponse && assistantResponse.content) {
    // For display purposes, convert content to string if it's not already
    const displayContent = typeof assistantResponse.content === 'string'
      ? assistantResponse.content
      : JSON.stringify(assistantResponse.content);
      
    console.log(chalk.green('Venice AI: ') + displayContent + '\n');

    // Add assistant message to history
    const messages = request.messages || [];
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