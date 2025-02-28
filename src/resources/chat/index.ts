/**
 * Chat Resource
 * 
 * This module provides access to the Chat API resources.
 */

import { HttpClient } from '../../utils/http';
import { ChatCompletionsResource } from './completions';

/**
 * Chat Resource
 */
export class ChatResource {
  /**
   * Chat completions resource
   */
  public completions: ChatCompletionsResource;

  /**
   * Creates a new chat resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    this.completions = new ChatCompletionsResource(http);
  }
}