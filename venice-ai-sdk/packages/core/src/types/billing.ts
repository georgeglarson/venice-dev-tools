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
