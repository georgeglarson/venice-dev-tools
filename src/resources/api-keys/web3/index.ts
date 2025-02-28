/**
 * Web3 API Key Generation Resource
 * 
 * This module provides access to the Web3 API Key Generation API resources.
 */

import { HttpClient } from '../../../utils/http';
import { Web3ApiKeyGetResource } from './get';
import { Web3ApiKeyPostResource } from './post';
import { 
  GenerateWeb3KeyGetParams, 
  GenerateWeb3KeyGetResponse,
  GenerateWeb3KeyPostParams,
  GenerateWeb3KeyPostResponse
} from '../../../types/api-keys';

/**
 * Web3 API Key Generation Resource
 */
export class Web3ApiKeyResource {
  /**
   * Web3 API key GET resource
   */
  private getResource: Web3ApiKeyGetResource;

  /**
   * Web3 API key POST resource
   */
  private postResource: Web3ApiKeyPostResource;

  /**
   * Creates a new Web3 API key resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    this.getResource = new Web3ApiKeyGetResource(http);
    this.postResource = new Web3ApiKeyPostResource(http);
  }

  /**
   * Gets a message to sign for generating an API key with a Web3 wallet
   * 
   * @param params - Parameters for getting a message to sign
   * @returns Promise that resolves with the message to sign
   * 
   * @example
   * ```typescript
   * const response = await venice.apiKeys.web3.getMessage({
   *   wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
   * });
   * ```
   */
  public getMessage(params: GenerateWeb3KeyGetParams): Promise<GenerateWeb3KeyGetResponse> {
    return this.getResource.getMessage(params);
  }

  /**
   * Generates an API key with a Web3 wallet
   * 
   * @param params - Parameters for generating an API key
   * @returns Promise that resolves with the generated API key
   * 
   * @example
   * ```typescript
   * const response = await venice.apiKeys.web3.generateKey({
   *   wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
   *   signature: 'signed-message',
   *   name: 'My Web3 API Key'
   * });
   * ```
   */
  public generateKey(params: GenerateWeb3KeyPostParams): Promise<GenerateWeb3KeyPostResponse> {
    return this.postResource.generateKey(params);
  }
}