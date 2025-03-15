/**
 * @module api/endpoints/chat
 * @description Chat completion API endpoints for the Venice AI SDK.
 *
 * This module provides endpoints for both standard and streaming chat completions.
 * - {@link ChatEndpoint} - For standard (non-streaming) chat completions
 * - {@link ChatStreamEndpoint} - For streaming chat completions
 *
 * @example
 * ```typescript
 * // Standard chat completion
 * const response = await venice.chat.createCompletion({
 *   model: 'llama-3.3-70b',
 *   messages: [
 *     { role: 'user', content: 'Hello, how are you?' }
 *   ]
 * });
 *
 * // Streaming chat completion
 * const stream = venice.chatStream.streamCompletion({
 *   model: 'llama-3.3-70b',
 *   messages: [
 *     { role: 'user', content: 'Tell me a story.' }
 *   ]
 * });
 *
 * for await (const chunk of stream) {
 *   console.log(chunk.choices[0]?.delta?.content || '');
 * }
 * ```
 */

import { ChatEndpoint } from './standard/chat-endpoint';
import { ChatStreamEndpoint } from './stream/chat-stream-endpoint';

// Re-export the endpoints
export { ChatEndpoint, ChatStreamEndpoint };

// For backward compatibility, export ChatEndpoint as default
export default ChatEndpoint;
