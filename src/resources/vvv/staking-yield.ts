/**
 * VVV Staking Yield Resource
 * 
 * This module provides methods for interacting with the VVV Staking Yield API.
 */

import { BaseResource } from '../base-resource';
import { VVVStakingYieldResponse } from '../../types/vvv';

/**
 * VVV Staking Yield Resource
 */
export class VVVStakingYieldResource extends BaseResource {
  /**
   * Gets the current staking yield of VVV
   * 
   * @returns Promise that resolves with the staking yield information
   * 
   * @example
   * ```typescript
   * const response = await venice.vvv.stakingYield();
   * console.log(`Current APY: ${response.current_apy}%`);
   * ```
   */
  public async getStakingYield(): Promise<VVVStakingYieldResponse> {
    try {
      const response = await this.get<VVVStakingYieldResponse>('/vvv/staking_yield');
      
      // Convert the new format to the old format for backward compatibility
      if (response.stakingYield !== undefined && response.totalStaked !== undefined) {
        const stakingYield = parseFloat(response.stakingYield) * 100; // Convert to percentage
        const totalStaked = parseFloat(response.totalStaked);
        
        return {
          ...response,
          current_apy: stakingYield,
          total_staked: totalStaked,
          percentage_staked: 0, // Placeholder value
          timestamp: new Date().toISOString()
        };
      }
      
      return response;
    } catch (error) {
      // If the API route is not found, create a mock response
      if ((error as any).response?.data?.error === 'API route not found') {
        return {
          current_apy: 0,
          total_staked: 0,
          percentage_staked: 0,
          timestamp: new Date().toISOString(),
          _error: 'API route not found'
        };
      }
      throw error;
    }
  }
}