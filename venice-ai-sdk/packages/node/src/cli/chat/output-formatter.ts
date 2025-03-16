// Output formatting utilities for chat commands
import * as chalk from 'chalk';
import { ChatJsonOutput } from './types';
import { ChatCompletionResponse } from './types';

/**
 * Format options for output
 */
export interface FormatOptions {
  raw?: boolean;
  json?: boolean;
}

/**
 * Format a chat prompt and response for display
 * @param prompt - The user prompt
 * @param response - The AI response
 * @param options - Formatting options
 */
export function formatChatResponse(
  prompt: string,
  response: string,
  options: FormatOptions = {}
): void {
  if (options.raw) {
    // Output raw text only
    console.log(response);
  } else if (!options.json) {
    // Standard formatted output
    console.log(chalk.cyan('User: ') + prompt);
    console.log(chalk.green('Venice AI: ') + response);
  }
}

/**
 * Format a chat response as JSON
 * @param output - The JSON output object
 */
export function formatJsonResponse(output: ChatJsonOutput): void {
  console.log(JSON.stringify(output, null, 2));
}

/**
 * Format web search citations for display
 * @param citations - The web search citations
 */
export function formatWebSearchCitations(
  citations: Array<{ title: string; url: string }> | undefined
): void {
  if (citations && citations.length > 0) {
    console.log('\n' + chalk.yellow('Citations:'));
    citations.forEach((citation, i) => {
      console.log(`${i + 1}. ${chalk.blue(citation.title)}: ${citation.url}`);
    });
  }
}

/**
 * Format usage statistics for display
 * @param usage - The usage statistics
 */
export function formatUsageStats(
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined
): void {
  if (usage) {
    console.log(
      '\n' +
        chalk.dim(
          `Tokens: ${usage.total_tokens} (${usage.prompt_tokens} prompt, ${usage.completion_tokens} completion)`
        )
    );
  }
}

/**
 * Format an error message for display
 * @param error - The error object
 * @param options - Formatting options
 */
export function formatErrorResponse(
  error: Error,
  options: FormatOptions = {}
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
 * Format a streaming response
 * @param content - The content chunk
 * @param options - Formatting options
 */
export function formatStreamingResponse(
  content: string,
  options: FormatOptions = {}
): void {
  if (options.raw || !options.json) {
    // For raw mode or standard mode, write to stdout
    process.stdout.write(content);
  }
}

/**
 * Format a streaming completion
 * @param options - Formatting options
 */
export function formatStreamingCompletion(options: FormatOptions = {}): void {
  // For raw mode, just add a newline
  // For standard mode, add two newlines
  process.stdout.write(options.raw ? '\n' : '\n\n');
}