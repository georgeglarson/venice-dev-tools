/**
 * Types for Venice.ai Billing API
 */

/**
 * Currency types supported by Venice
 */
export type Currency = 'USD' | 'VCU' | 'DIEM';

/**
 * Sort order for billing records
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Request parameters for getting billing usage
 */
export interface GetBillingUsageRequest {
  /**
   * Filter by currency
   */
  currency?: Currency;

  /**
   * Start date for filtering records (ISO 8601)
   */
  startDate?: string;

  /**
   * End date for filtering records (ISO 8601)
   */
  endDate?: string;

  /**
   * Page number for pagination
   * @default 1
   */
  page?: number;

  /**
   * Number of items per page
   * @default 200
   * @max 500
   */
  limit?: number;

  /**
   * Sort order for createdAt field
   * @default "desc"
   */
  sortOrder?: SortOrder;
}

/**
 * Inference details for a billing entry
 */
export interface InferenceDetails {
  /**
   * Number of tokens used in the completion
   */
  completionTokens: number | null;

  /**
   * Time taken for inference execution in milliseconds
   */
  inferenceExecutionTime: number | null;

  /**
   * Number of tokens requested in the prompt
   */
  promptTokens: number | null;

  /**
   * Unique identifier for the inference request
   */
  requestId: string | null;
}

/**
 * Single billing usage entry
 */
export interface BillingUsageEntry {
  /**
   * The total amount charged
   */
  amount: number;

  /**
   * The currency charged
   */
  currency: Currency;

  /**
   * Details about the related inference request, if applicable
   */
  inferenceDetails: InferenceDetails | null;

  /**
   * Notes about the billing usage entry
   */
  notes: string;

  /**
   * The price per unit in USD
   */
  pricePerUnitUsd: number;

  /**
   * The product associated with the billing usage entry (SKU)
   */
  sku: string;

  /**
   * The timestamp the billing usage entry was created
   */
  timestamp: string;

  /**
   * The number of units consumed
   */
  units: number;
}

/**
 * Pagination information
 */
export interface Pagination {
  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Current page number
   */
  page: number;

  /**
   * Total number of items
   */
  total: number;

  /**
   * Total number of pages
   */
  totalPages: number;
}

/**
 * Response from getting billing usage
 */
export interface GetBillingUsageResponse {
  /**
   * Array of billing usage entries
   */
  data: BillingUsageEntry[];

  /**
   * Pagination information
   */
  pagination: Pagination;

  /**
   * Optional warning message
   */
  warningMessage?: string;
}

/**
 * Balance information
 */
export interface BillingBalanceResponse {
  /** Whether user can make API requests */
  canConsume: boolean;
  /** Currency used for consumption */
  consumptionCurrency: 'USD' | 'VCU' | 'DIEM' | null;
  /** Balance amounts */
  balances: {
    /** Remaining DIEM balance (null if not staking) */
    diem: number | null;
    /** Remaining USD balance (null if not available) */
    usd: number | null;
  };
  /** Total DIEM allocation for current epoch */
  diemEpochAllocation: number;
}

/**
 * Usage analytics request parameters
 */
export interface GetBillingUsageAnalyticsRequest {
  /** Lookback period (e.g. "7d", "30d", max "90d") */
  lookback?: string;
  /** Start date (YYYY-MM-DD) */
  startDate?: string;
  /** End date (YYYY-MM-DD) */
  endDate?: string;
}

/**
 * Model usage breakdown entry
 */
export interface UsageByModel {
  modelName: string;
  unitType: string;
  modelType: string | null;
  totalUsd: number;
  totalDiem: number;
  totalUnits: number;
  breakdown?: Array<{
    type: string;
    usd: number;
    diem: number;
    units: number;
  }>;
}

/**
 * Key usage breakdown entry
 */
export interface UsageByKey {
  apiKeyId: string | null;
  description: string;
  totalUsd: number;
  totalDiem: number;
  totalUnits: number;
}

/**
 * Usage analytics response
 */
export interface GetBillingUsageAnalyticsResponse {
  lookback: string;
  byDate: Array<{ date: string; USD: number; DIEM: number }>;
  byModel: UsageByModel[];
  byModelDaily: Array<Record<string, number>>;
  topModels: string[];
  byKey: UsageByKey[];
  byKeyDaily: Array<Record<string, number>>;
  topKeyNames: string[];
}
