/**
 * VVV Network Utilization Resource
 * 
 * This module provides methods for interacting with the VVV Network Utilization API.
 */

import { BaseResource } from '../base-resource';
import { VVVUtilizationResponse } from '../../types/vvv';

/**
 * VVV Network Utilization Resource
 */
export class VVVUtilizationResource extends BaseResource {
  /**
   * Gets the current network utilization of VVV
   * 
   * @returns Promise that resolves with the network utilization information
   * 
   * @example
   * ```typescript
   * const response = await venice.vvv.utilization();
   * console.log(`Network utilization: ${response.utilization_percentage}%`);
   * ```
   */
  public async getUtilization(): Promise<VVVUtilizationResponse> {
    try {
      const response = await this.get<VVVUtilizationResponse>('/vvv/utilization');
      
      // Convert the new format to the old format for backward compatibility
      if (response.percentage !== undefined) {
        const percentage = response.percentage * 100; // Convert to percentage
        return {
          ...response,
          utilization_percentage: percentage,
          capacity: 100, // Placeholder value
          usage: percentage, // Placeholder value
          timestamp: new Date().toISOString()
        };
      }
      
      return response;
    } catch (error) {
      // If the API route is not found, create a mock response
      if ((error as any).response?.data?.error === 'API route not found') {
        return {
          utilization_percentage: 0,
          capacity: 0,
          usage: 0,
          timestamp: new Date().toISOString(),
          _error: 'API route not found'
        };
      }
      throw error;
    }
  }
}