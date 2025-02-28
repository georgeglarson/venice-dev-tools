/**
 * API Keys Rate Limits Resource
 * 
 * This module provides methods for interacting with the API Keys Rate Limits API.
 * It allows you to retrieve rate limits for your API keys.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Get API key rate limits
 * const response = await venice.apiKeys.rateLimits();
 * 
 * console.log(response.rate_limits);
 * ```
 */

import { BaseResource } from '../base-resource';
import { GetApiKeyRateLimitsResponse } from '../../types/api-keys';
import { Logger } from '../../utils/logger';

/**
 * API Keys Rate Limits Resource
 */
export class ApiKeysRateLimitsResource extends BaseResource {
  /**
   * Gets rate limits for your API keys
   * 
   * @returns Promise that resolves with the API key rate limits
   * 
   * @example
   * ```typescript
   * const response = await venice.apiKeys.rateLimits();
   * ```
   */
  public async getRateLimits(): Promise<GetApiKeyRateLimitsResponse> {
    try {
      Logger.debug('Fetching API key rate limits');
      const response = await this.get<any>('/api_keys/rate_limits');
      
      // Handle the new response format
      if (response.data && response.data.rateLimits && Array.isArray(response.data.rateLimits)) {
        Logger.debug(`Found ${response.data.rateLimits.length} API key rate limits in new format`);
        
        // Convert the new format to the expected format
        const rate_limits = response.data.rateLimits.map((limit: any) => {
          const requestsPerMinute = limit.rateLimits.find((r: any) => r.type === 'RPM')?.amount || 0;
          const requestsPerDay = limit.rateLimits.find((r: any) => r.type === 'RPD')?.amount || 0;
          const tokensPerMinute = limit.rateLimits.find((r: any) => r.type === 'TPM')?.amount || 0;
          
          return {
            model_id: limit.apiModelId,
            model_name: limit.apiModelId, // Use ID as name if name is not available
            requests_per_minute: requestsPerMinute,
            requests_per_day: requestsPerDay,
            tokens_per_minute: tokensPerMinute
          };
        });
        
        return {
          rate_limits,
          tier: response.data.apiTier?.id || 'explorer',
          _metadata: response._metadata
        };
      }
      
      // Handle the original expected format
      if (!response.rate_limits) {
        Logger.warn('API key rate limits response missing rate_limits array', response);
        
        return {
          rate_limits: [],
          tier: (response.tier as 'explorer' | 'paid') || 'explorer',
          _metadata: response._metadata
        };
      }
      
      Logger.debug(`Found ${response.rate_limits.length} API key rate limits`);
      return response;
    } catch (error) {
      // If the endpoint is not available, return an empty response
      Logger.error('Error fetching API key rate limits', error);
      
      return {
        rate_limits: [],
        tier: 'explorer'
      };
    }
  }
  
  /**
   * Gets rate limits for a specific model
   * 
   * @param modelId - Model ID
   * @returns Promise that resolves with the rate limits for the specified model
   * 
   * @example
   * ```typescript
   * const limits = await venice.apiKeys.rateLimits.getModelRateLimits('llama-3.3-70b');
   * ```
   */
  public async getModelRateLimits(modelId: string): Promise<any> {
    try {
      Logger.debug(`Fetching rate limits for model: ${modelId}`);
      const response = await this.getRateLimits();
      
      if (!response.rate_limits || response.rate_limits.length === 0) {
        return null;
      }
      
      const modelLimits = response.rate_limits.find(limit => limit.model_id === modelId);
      
      if (!modelLimits) {
        Logger.warn(`No rate limits found for model: ${modelId}`);
        return null;
      }
      
      return modelLimits;
    } catch (error) {
      Logger.error(`Error fetching rate limits for model: ${modelId}`, error);
      
      throw error;
    }
  }
}