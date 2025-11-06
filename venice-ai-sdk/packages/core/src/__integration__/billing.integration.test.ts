import { describe, it, expect, beforeAll } from 'vitest';
import { VeniceAI } from '../venice-ai';
import { getTestConfig, checkTestEnvironment } from './test-config';

describe('Billing Integration Tests', () => {
  let venice: VeniceAI;
  let hasAdminPermissions = false;

  beforeAll(async () => {
    // Check environment first
    const env = checkTestEnvironment(true); // require admin key
    if (env.skipTests) {
      throw new Error(env.skipReason);
    }

    const config = getTestConfig();
    venice = new VeniceAI({
      apiKey: config.adminApiKey!,
      logLevel: config.logLevel
    });

    // Test if admin key has proper permissions
    try {
      await venice.billing.getUsage({ limit: 1 });
      hasAdminPermissions = true;
    } catch (error: any) {
      console.log('Admin API key does not have sufficient permissions for billing. Tests will be skipped.');
      console.log('Error:', error.message);
      hasAdminPermissions = false;
    }
  });

  it('should get billing usage with default parameters', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const response = await venice.billing.getUsage();

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.pagination).toBeDefined();
    
    // Validate pagination structure
    expect(response.pagination).toHaveProperty('limit');
    expect(response.pagination).toHaveProperty('page');
    expect(response.pagination).toHaveProperty('total');
    expect(response.pagination).toHaveProperty('totalPages');
    
    // Validate billing entry structure if data exists
    if (response.data.length > 0) {
      response.data.forEach((entry: any) => {
        expect(entry).toHaveProperty('amount');
        expect(entry).toHaveProperty('currency');
        expect(entry).toHaveProperty('sku');
        expect(entry).toHaveProperty('timestamp');
        expect(entry).toHaveProperty('units');
        expect(entry).toHaveProperty('pricePerUnitUsd');
        expect(entry).toHaveProperty('notes');
      });
    }
  }, 30000);

  it('should get billing usage with currency filter', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const response = await venice.billing.getUsage({
      currency: 'USD'
    });

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    
    // All entries should have the specified currency
    if (response.data.length > 0) {
      response.data.forEach((entry: any) => {
        expect(entry.currency).toBe('USD');
      });
    }
  }, 30000);

  it('should get billing usage with date range filter', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const response = await venice.billing.getUsage({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    
    // All entries should be within the date range
    if (response.data.length > 0) {
      const endTime = endDate.getTime();
      const toleranceMs = 5 * 60 * 1000; // allow slight clock drift from server

      response.data.forEach((entry: any) => {
        const entryDate = new Date(entry.timestamp);
        expect(entryDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(entryDate.getTime()).toBeLessThanOrEqual(endTime + toleranceMs);
      });
    }
  }, 30000);

  it('should get billing usage with pagination', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const response = await venice.billing.getUsage({
      page: 1,
      limit: 10
    });

    expect(response).toBeDefined();
    expect(response.pagination).toBeDefined();
    expect(response.pagination.page).toBe(1);
    expect(response.pagination.limit).toBe(10);
    expect(response.data.length).toBeLessThanOrEqual(10);
  }, 30000);

  it('should get billing usage with sort order', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    // Test ascending order
    const ascResponse = await venice.billing.getUsage({
      sortOrder: 'asc',
      limit: 10
    });

    // Test descending order
    const descResponse = await venice.billing.getUsage({
      sortOrder: 'desc',
      limit: 10
    });

    expect(ascResponse).toBeDefined();
    expect(descResponse).toBeDefined();
    
    // Verify sort order if data exists
    if (ascResponse.data.length > 1 && descResponse.data.length > 1) {
      // Ascending should have earlier dates first
      const ascDates = ascResponse.data.map((entry: any) => new Date(entry.timestamp));
      const descDates = descResponse.data.map((entry: any) => new Date(entry.timestamp));
      
      for (let i = 1; i < ascDates.length; i++) {
        expect(ascDates[i].getTime()).toBeGreaterThanOrEqual(ascDates[i - 1].getTime());
      }
      
      for (let i = 1; i < descDates.length; i++) {
        expect(descDates[i].getTime()).toBeLessThanOrEqual(descDates[i - 1].getTime());
      }
    }
  }, 30000);

  it('should get billing usage with multiple filters', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const response = await venice.billing.getUsage({
      currency: 'USD',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      page: 1,
      limit: 20,
      sortOrder: 'desc'
    });

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(response.pagination.page).toBe(1);
    expect(response.pagination.limit).toBe(20);
    
    // Validate all filters are applied
    if (response.data.length > 0) {
      response.data.forEach((entry: any) => {
        expect(entry.currency).toBe('USD');
        
        const entryDate = new Date(entry.timestamp);
        expect(entryDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(entryDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    }
  }, 30000);

  it('should export billing usage as CSV', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const csvData = await venice.billing.exportCSV();

    expect(csvData).toBeDefined();
    expect(typeof csvData).toBe('string');
    expect(csvData.length).toBeGreaterThan(0);
    
    // Basic CSV validation
    const lines = csvData.split('\n');
    expect(lines.length).toBeGreaterThan(0);
    
    // Should have a header row
    const header = lines[0];
    expect(header).toContain('amount');
    expect(header).toContain('currency');
    expect(header).toContain('sku');
    expect(header).toContain('timestamp');
  }, 30000);

  it('should export billing usage as CSV with filters', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const csvData = await venice.billing.exportCSV({
      currency: 'USD',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    expect(csvData).toBeDefined();
    expect(typeof csvData).toBe('string');
    expect(csvData.length).toBeGreaterThan(0);
  }, 30000);

  it('should handle billing usage with different currencies', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const currencies = ['USD', 'VCU', 'DIEM'];
    
    for (const currency of currencies) {
      const response = await venice.billing.getUsage({
        currency: currency as any,
        limit: 5
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      
      // All entries should have the specified currency
      if (response.data.length > 0) {
        response.data.forEach((entry: any) => {
          expect(entry.currency).toBe(currency);
        });
      }
    }
  }, 30000);

  it('should validate billing data structure', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    const response = await venice.billing.getUsage({
      limit: 1
    });

    expect(response).toBeDefined();
    
    if (response.data.length > 0) {
      const entry = response.data[0];
      
      // Validate required fields
      expect(entry).toHaveProperty('amount');
      expect(entry).toHaveProperty('currency');
      expect(entry).toHaveProperty('sku');
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('units');
      expect(entry).toHaveProperty('pricePerUnitUsd');
      expect(entry).toHaveProperty('notes');
      
      // Validate data types
      expect(typeof entry.amount).toBe('number');
      expect(typeof entry.currency).toBe('string');
      expect(typeof entry.sku).toBe('string');
      expect(typeof entry.timestamp).toBe('string');
      expect(typeof entry.units).toBe('number');
      expect(typeof entry.pricePerUnitUsd).toBe('number');
      expect(typeof entry.notes).toBe('string');
      
      // Validate timestamp format
      expect(() => new Date(entry.timestamp)).not.toThrow();
      
      // Validate inference details if present
      if (entry.inferenceDetails) {
        expect(entry.inferenceDetails).toHaveProperty('completionTokens');
        expect(entry.inferenceDetails).toHaveProperty('inferenceExecutionTime');
        expect(entry.inferenceDetails).toHaveProperty('promptTokens');
        expect(entry.inferenceDetails).toHaveProperty('requestId');
      }
    }
  }, 30000);

  it('should handle empty billing data gracefully', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    // Use a far future date range to get empty results
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 31);

    const response = await venice.billing.getUsage({
      startDate: futureDate.toISOString(),
      endDate: futureDate2.toISOString()
    });

    expect(response).toBeDefined();
    expect(response.data).toEqual([]);
    expect(response.pagination).toBeDefined();
    expect(response.pagination.total).toBe(0);
    expect(response.pagination.totalPages).toBe(0);
  }, 30000);

  it('should handle invalid parameters gracefully', async () => {
    if (!hasAdminPermissions) {
      console.log('Skipping test: Admin permissions not available');
      return;
    }

    // Test invalid currency
    await expect(
      venice.billing.getUsage({ currency: 'INVALID' as any })
    ).rejects.toThrow();

    // Test invalid date format
    await expect(
      venice.billing.getUsage({ startDate: 'invalid-date' })
    ).rejects.toThrow();

    // Test invalid pagination
    await expect(
      venice.billing.getUsage({ page: -1 })
    ).rejects.toThrow();

    await expect(
      venice.billing.getUsage({ limit: 1000 }) // Exceeds max limit
    ).rejects.toThrow();
  }, 30000);
});
