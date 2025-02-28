/**
 * Web3 API Key Generation (POST) Resource
 * 
 * This module provides methods for interacting with the Web3 API Key Generation API.
 * It allows you to generate an API key with a Web3 wallet.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Generate an API key with a Web3 wallet
 * const response = await venice.apiKeys.web3.generateKey({
 *   wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
 *   signature: 'signed-message',
 *   name: 'My Web3 API Key'
 * });
 * 
 * console.log(response.key);
 * ```
 */

import { BaseResource } from '../../base-resource';
import { GenerateWeb3KeyPostParams, GenerateWeb3KeyPostResponse } from '../../../types/api-keys';
import { ValidationError } from '../../../errors/validation-error';

/**
 * Web3 API Key Generation (POST) Resource
 */
export class Web3ApiKeyPostResource extends BaseResource {
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
  public async generateKey(params: GenerateWeb3KeyPostParams): Promise<GenerateWeb3KeyPostResponse> {
    // Validate required parameters
    if (!params.wallet_address) {
      throw new ValidationError({
        message: 'Wallet address is required',
        field: 'wallet_address',
      });
    }

    if (!params.signature) {
      throw new ValidationError({
        message: 'Signature is required',
        field: 'signature',
      });
    }

    return this.post<GenerateWeb3KeyPostResponse>('/api_keys/generate_web3_key', params);
  }
}