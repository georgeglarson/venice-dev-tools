import { ApiEndpoint } from '../../registry/endpoint';
import type {
  GetBillingUsageRequest,
  GetBillingUsageResponse,
} from '../../../types/billing';
import type { VeniceClient } from '../../../client';

/**
 * Endpoint for accessing billing and usage data
 */
export class BillingEndpoint extends ApiEndpoint {
  constructor(client: VeniceClient) {
    super(client);
  }

  /**
   * Get the endpoint path
   */
  getEndpointPath(): string {
    return '/billing/usage';
  }

  /**
   * Get paginated billing usage data
   * 
   * NOTE: This is a beta endpoint and may be subject to change.
   * 
   * @param request - Optional query parameters for filtering
   * @returns Promise resolving to billing usage data
   * 
   * @example
   * ```typescript
   * // Get recent billing usage
   * const usage = await venice.billing.getUsage();
   * 
   * console.log(`Total records: ${usage.pagination.total}`);
   * usage.data.forEach(entry => {
   *   console.log(`${entry.sku}: ${entry.amount} ${entry.currency}`);
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Filter by date range and currency
   * const usage = await venice.billing.getUsage({
   *   currency: 'DIEM',
   *   startDate: '2024-01-01T00:00:00Z',
   *   endDate: '2024-12-31T23:59:59Z',
   *   limit: 100,
   *   page: 1
   * });
   * ```
   */
  public async getUsage(
    request?: GetBillingUsageRequest
  ): Promise<GetBillingUsageResponse> {
    const params = new URLSearchParams();

    if (request?.currency) {
      params.append('currency', request.currency);
    }
    if (request?.startDate) {
      params.append('startDate', request.startDate);
    }
    if (request?.endDate) {
      params.append('endDate', request.endDate);
    }
    if (request?.page) {
      params.append('page', request.page.toString());
    }
    if (request?.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request?.sortOrder) {
      params.append('sortOrder', request.sortOrder);
    }

    const path = params.toString()
      ? `${this.getEndpointPath()}?${params.toString()}`
      : this.getEndpointPath();

    const response = await this.http.get<GetBillingUsageResponse>(path);

    return response.data;
  }

  /**
   * Export billing usage data as CSV
   * 
   * @param request - Optional query parameters for filtering
   * @returns Promise resolving to CSV data as string
   * 
   * @example
   * ```typescript
   * const csv = await venice.billing.exportCSV({
   *   startDate: '2024-01-01T00:00:00Z',
   *   endDate: '2024-12-31T23:59:59Z'
   * });
   * 
   * // Save to file
   * const fs = require('fs');
   * fs.writeFileSync('billing_export.csv', csv);
   * ```
   */
  public async exportCSV(request?: GetBillingUsageRequest): Promise<string> {
    const params = new URLSearchParams();

    if (request?.currency) {
      params.append('currency', request.currency);
    }
    if (request?.startDate) {
      params.append('startDate', request.startDate);
    }
    if (request?.endDate) {
      params.append('endDate', request.endDate);
    }
    if (request?.page) {
      params.append('page', request.page.toString());
    }
    if (request?.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request?.sortOrder) {
      params.append('sortOrder', request.sortOrder);
    }

    const path = params.toString()
      ? `${this.getEndpointPath()}?${params.toString()}`
      : this.getEndpointPath();

    const response = await this.http.get<string>(path, {
      headers: {
        Accept: 'text/csv',
      },
    });

    return response.data;
  }
}
