/**
 * Web3 API Key Generation (GET) Resource
 * 
 * This module provides methods for interacting with the Web3 API Key Generation API.
 * It allows you to get a message to sign for generating an API key with a Web3 wallet.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Get a message to sign
 * const response = await venice.apiKeys.web3.getMessage({
 *   wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
 * });
 * 
 * console.log(response.message);
 * ```
 */

import { BaseResource } from '../../base-resource';
import { GenerateWeb3KeyGetParams, GenerateWeb3KeyGetResponse } from '../../../types/api-keys';
import { ValidationError } from '../../../errors/validation-error';

/**
 * Web3 API Key Generation (GET) Resource
 */
export class Web3ApiKeyGetResource extends BaseResource {
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
  public async getMessage(params: GenerateWeb3KeyGetParams): Promise<GenerateWeb3KeyGetResponse> {
    // Validate required parameters
    if (!params.wallet_address) {
      throw new ValidationError({
        message: 'Wallet address is required',
        field: 'wallet_address',
      });
    }

    return this.get<GenerateWeb3KeyGetResponse>('/api_keys/generate_web3_key', {
      wallet_address: params.wallet_address,
    });
  }
}