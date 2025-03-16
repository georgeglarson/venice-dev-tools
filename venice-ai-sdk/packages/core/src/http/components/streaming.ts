/**
 * HTTP streaming utilities
 * 
 * This module provides utilities for making streaming HTTP requests.
 */
import { Logger } from '../../utils/logger';
import { VeniceApiError } from '../../errors';
import { sanitizeHeaders, sanitizeData } from './sanitizer';
import { handleStreamError } from './error-handler';

/**
 * Options for streaming requests
 */
export interface StreamRequestOptions {
  /**
   * Request headers
   */
  headers?: Record<string, string>;
  
  /**
   * AbortSignal for cancelling the request
   */
  signal?: AbortSignal;
}

/**
 * Create a streaming HTTP request
 * @param baseUrl - The base URL for the API
 * @param path - The API path
 * @param body - The request body
 * @param options - Additional request options
 * @param logger - The logger instance
 * @returns A fetch response for streaming
 */
export async function createStreamRequest(
  baseUrl: string,
  path: string,
  body: any,
  options: StreamRequestOptions = {},
  logger: Logger
): Promise<Response> {
  const url = `${baseUrl}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const requestId = Math.random().toString(36).substring(2, 15);
  
  logger.debug(`Stream request ${requestId}: POST ${path}`, {
    headers: sanitizeHeaders(headers),
    body: sanitizeData(body)
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      
      logger.error(`Stream response ${requestId} error: ${response.status}`, {
        error: errorData.error,
        details: errorData.details
      });
      
      throw new VeniceApiError(errorData.error || 'Stream request failed', response.status, errorData.details);
    }

    logger.debug(`Stream response ${requestId}: ${response.status} ${response.statusText}`);
    
    return response;
  } catch (error) {
    return handleStreamError(error, logger, requestId);
  }
}

/**
 * Process a streaming response
 * @param response - The fetch response
 * @param onChunk - Callback function for each chunk
 * @param logger - The logger instance
 */
export async function processStreamResponse(
  response: Response,
  onChunk: (chunk: string) => void,
  logger: Logger
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    logger.error('Stream response has no readable body');
    throw new Error('Stream response has no readable body');
  }

  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    logger.error('Error processing stream', { error: (error as Error).message });
    throw error;
  } finally {
    reader.releaseLock();
  }
}