/**
 * VVV API types
 * 
 * This file contains type definitions for the VVV API.
 */

/**
 * VVV Circulating Supply response
 */
export interface VVVCirculatingSupplyResponse {
  /**
   * Circulating supply of VVV tokens as a string
   */
  result?: string;

  /**
   * For backward compatibility - parsed from result
   */
  circulating_supply?: number;

  /**
   * For backward compatibility
   */
  total_supply?: number;

  /**
   * For backward compatibility
   */
  percentage_circulating?: number;

  /**
   * For backward compatibility
   */
  timestamp?: string;

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
      /**
       * Number of requests made in the current period
       */
      limit: number;

      /**
       * Number of requests remaining in the current period
       */
      remaining: number;

      /**
       * Timestamp when the rate limit will reset
       */
      reset: number;
    };
  };

  /**
   * Error message if the API route is not found
   */
  _error?: string;
}

/**
 * VVV Network Utilization response
 */
export interface VVVUtilizationResponse {
  /**
   * Current network utilization percentage
   */
  percentage?: number;

  /**
   * For backward compatibility
   */
  utilization_percentage?: number;

  /**
   * For backward compatibility
   */
  capacity?: number;

  /**
   * For backward compatibility
   */
  usage?: number;

  /**
   * For backward compatibility
   */
  timestamp?: string;

  /**
   * For backward compatibility
   */
  historical_data?: Array<{
    /**
     * Timestamp of the data point
     */
    timestamp: string;

    /**
     * Utilization percentage at this time
     */
    utilization_percentage: number;
  }>;

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
      /**
       * Number of requests made in the current period
       */
      limit: number;

      /**
       * Number of requests remaining in the current period
       */
      remaining: number;

      /**
       * Timestamp when the rate limit will reset
       */
      reset: number;
    };
  };

  /**
   * Error message if the API route is not found
   */
  _error?: string;
}

/**
 * VVV Staking Yield response
 */
export interface VVVStakingYieldResponse {
  /**
   * Total amount of VVV staked
   */
  totalStaked?: string;

  /**
   * Total emission
   */
  totalEmission?: string;

  /**
   * Staker distribution
   */
  stakerDistribution?: string;

  /**
   * Current staking yield
   */
  stakingYield?: string;

  /**
   * For backward compatibility
   */
  current_apy?: number;

  /**
   * For backward compatibility
   */
  total_staked?: number;

  /**
   * For backward compatibility
   */
  percentage_staked?: number;

  /**
   * For backward compatibility
   */
  timestamp?: string;

  /**
   * For backward compatibility
   */
  historical_data?: Array<{
    /**
     * Timestamp of the data point
     */
    timestamp: string;

    /**
     * APY at this time
     */
    apy: number;
  }>;

  /**
   * Metadata about the response
   */
  _metadata?: {
    /**
     * Rate limit information
     */
    rateLimit?: {
      /**
       * Number of requests made in the current period
       */
      limit: number;

      /**
       * Number of requests remaining in the current period
       */
      remaining: number;

      /**
       * Timestamp when the rate limit will reset
       */
      reset: number;
    };
  };

  /**
   * Error message if the API route is not found
   */
  _error?: string;
}