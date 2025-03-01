/**
 * VVV Resource
 * 
 * This module provides access to the VVV API resources.
 */

import { HttpClient } from '../../utils/http';
import { VVVCirculatingSupplyResource } from './circulating-supply';
import { VVVUtilizationResource } from './utilization';
import { VVVStakingYieldResource } from './staking-yield';
import { 
  VVVCirculatingSupplyResponse, 
  VVVUtilizationResponse, 
  VVVStakingYieldResponse 
} from '../../types/vvv';

/**
 * VVV Resource
 */
export class VVVResource {
  /**
   * VVV circulating supply resource
   */
  private circulatingSupplyResource: VVVCirculatingSupplyResource;

  /**
   * VVV utilization resource
   */
  private utilizationResource: VVVUtilizationResource;

  /**
   * VVV staking yield resource
   */
  private stakingYieldResource: VVVStakingYieldResource;

  /**
   * Creates a new VVV resource
   * 
   * @param http - HTTP client
   */
  constructor(http: HttpClient) {
    this.circulatingSupplyResource = new VVVCirculatingSupplyResource(http);
    this.utilizationResource = new VVVUtilizationResource(http);
    this.stakingYieldResource = new VVVStakingYieldResource(http);
  }

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
  public circulatingSupply(): Promise<VVVCirculatingSupplyResponse> {
    return this.circulatingSupplyResource.getCirculatingSupply();
  }

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
  public utilization(): Promise<VVVUtilizationResponse> {
    return this.utilizationResource.getUtilization();
  }

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
  public stakingYield(): Promise<VVVStakingYieldResponse> {
    return this.stakingYieldResource.getStakingYield();
  }
}