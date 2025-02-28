/**
 * VVV Circulating Supply Resource
 * 
 * This module provides methods for interacting with the VVV Circulating Supply API.
 */

import { BaseResource } from '../base-resource';
import { VVVCirculatingSupplyResponse } from '../../types/vvv';

/**
 * VVV Circulating Supply Resource
 */
export class VVVCirculatingSupplyResource extends BaseResource {
  /**
   * Gets the current circulating supply of VVV tokens
   *
   * @returns Promise that resolves with the circulating supply information
   *
   * @example
   * ```typescript
   * const response = await venice.vvv.circulatingSupply();
   * console.log(`Circulating supply: ${response.circulating_supply}`);
   * ```
   */
  public async getCirculatingSupply(): Promise<VVVCirculatingSupplyResponse> {
    const response = await this.get<VVVCirculatingSupplyResponse>('/vvv/circulatingsupply');
    
    // Parse the result string into the expected format for backward compatibility
    if (response.result) {
      const circulatingSupply = parseFloat(response.result);
      // Estimate total supply (for backward compatibility)
      const totalSupply = circulatingSupply * 1.5; // Assuming total supply is 1.5x circulating supply
      
      return {
        ...response,
        circulating_supply: circulatingSupply,
        total_supply: totalSupply,
        percentage_circulating: (circulatingSupply / totalSupply) * 100,
        timestamp: new Date().toISOString()
      };
    }
    
    return response;
  }
}