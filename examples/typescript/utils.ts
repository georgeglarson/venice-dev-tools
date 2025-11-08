import { ChatCompletionResponse } from '@venice-dev-tools/core';

/**
 * Type guard to verify a value is an async iterable.
 */
export function isAsyncIterable<T = unknown>(value: unknown): value is AsyncIterable<T> {
  return typeof value === 'object' &&
    value !== null &&
    typeof (value as any)[Symbol.asyncIterator] === 'function';
}

/**
 * Type guard to check if a result is a non-streaming chat completion response.
 */
export function isChatCompletionResponse(
  result: ChatCompletionResponse | AsyncGenerator<any, void, unknown>
): result is ChatCompletionResponse {
  return typeof result === 'object' &&
    result !== null &&
    'choices' in result;
}

/**
 * Ensure a result is a non-streaming chat completion response.
 * Throws an error if a streaming iterator is returned instead.
 */
export function ensureChatCompletionResponse(
  result: ChatCompletionResponse | AsyncGenerator<any, void, unknown>,
  context: string
): ChatCompletionResponse {
  if (isChatCompletionResponse(result)) {
    return result;
  }

  throw new Error(
    `${context}: expected a non-streaming response. ` +
    'Set `stream: true` and handle the async iterator if you need streaming output.'
  );
}

