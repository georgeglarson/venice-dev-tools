import { BillingEndpoint } from './billing-endpoint';

function createMockClient(overrides: Record<string, any> = {}) {
  const mockHttp = {
    post: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    get: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    delete: vi.fn().mockResolvedValue({ data: {}, headers: {}, status: 200 }),
    getBaseUrl: vi.fn().mockReturnValue('https://api.venice.ai/api/v1'),
    ...overrides.http,
  };
  const mockStreamingHttp = {
    stream: vi.fn(),
    ...overrides.streamingHttp,
  };
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    ...overrides.logger,
  };
  return {
    getStandardHttpClient: vi.fn().mockReturnValue(mockHttp),
    getStreamingHttpClient: vi.fn().mockReturnValue(mockStreamingHttp),
    getLogger: vi.fn().mockReturnValue(mockLogger),
    emit: vi.fn().mockReturnValue(true),
    getApiKey: vi.fn().mockReturnValue('test-api-key'),
    _mockHttp: mockHttp,
    _mockStreamingHttp: mockStreamingHttp,
    _mockLogger: mockLogger,
  } as any;
}

describe('BillingEndpoint', () => {
  let endpoint: BillingEndpoint;
  let mockClient: ReturnType<typeof createMockClient>;

  const mockUsageResponse = {
    data: [
      {
        amount: 0.05,
        currency: 'USD' as const,
        inferenceDetails: {
          completionTokens: 150,
          inferenceExecutionTime: 1200,
          promptTokens: 50,
          requestId: 'req-123',
        },
        notes: 'Chat completion',
        pricePerUnitUsd: 0.001,
        sku: 'llama-3.3-70b',
        timestamp: '2024-06-01T12:00:00Z',
        units: 200,
      },
    ],
    pagination: {
      limit: 200,
      page: 1,
      total: 1,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    mockClient = createMockClient();
    endpoint = new BillingEndpoint(mockClient);
  });

  describe('getEndpointPath', () => {
    it('returns /billing/usage', () => {
      expect(endpoint.getEndpointPath()).toBe('/billing/usage');
    });
  });

  describe('getUsage', () => {
    it('calls http.get with /billing/usage when no params', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage();

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/billing/usage');
    });

    it('returns response.data', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      const result = await endpoint.getUsage();

      expect(result).toEqual(mockUsageResponse);
    });

    it('appends currency query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({ currency: 'DIEM' });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('currency=DIEM');
    });

    it('appends startDate query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({ startDate: '2024-01-01T00:00:00Z' });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('startDate=2024-01-01T00%3A00%3A00Z');
    });

    it('appends endDate query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({ endDate: '2024-12-31T23:59:59Z' });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('endDate=');
    });

    it('appends page query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({ page: 3 });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('page=3');
    });

    it('appends limit query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({ limit: 50 });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('limit=50');
    });

    it('appends sortOrder query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({ sortOrder: 'asc' });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('sortOrder=asc');
    });

    it('appends multiple query params', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({
        currency: 'USD',
        page: 2,
        limit: 100,
        sortOrder: 'desc',
      });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0] as string;
      expect(calledPath).toContain('currency=USD');
      expect(calledPath).toContain('page=2');
      expect(calledPath).toContain('limit=100');
      expect(calledPath).toContain('sortOrder=desc');
    });

    it('does not append query string for empty request', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage({});

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/billing/usage');
    });

    it('does not append query string for undefined request', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      await endpoint.getUsage(undefined);

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/billing/usage');
    });

    it('propagates http errors', async () => {
      mockClient._mockHttp.get.mockRejectedValue(new Error('Forbidden'));

      await expect(endpoint.getUsage()).rejects.toThrow('Forbidden');
    });

    it('returns pagination info', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      const result = await endpoint.getUsage();

      expect(result.pagination).toEqual({
        limit: 200,
        page: 1,
        total: 1,
        totalPages: 1,
      });
    });

    it('returns billing data entries', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: mockUsageResponse, headers: {}, status: 200 });

      const result = await endpoint.getUsage();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].sku).toBe('llama-3.3-70b');
      expect(result.data[0].amount).toBe(0.05);
    });
  });

  describe('exportCSV', () => {
    const csvData = 'timestamp,sku,amount,currency\n2024-06-01,llama-3.3-70b,0.05,USD';

    it('calls http.get with /billing/usage when no params', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV();

      expect(mockClient._mockHttp.get).toHaveBeenCalledWith('/billing/usage', {
        headers: { Accept: 'text/csv' },
      });
    });

    it('returns CSV string', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      const result = await endpoint.exportCSV();

      expect(result).toBe(csvData);
    });

    it('sends Accept text/csv header', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV();

      const callArgs = mockClient._mockHttp.get.mock.calls[0];
      expect(callArgs[1]).toEqual({ headers: { Accept: 'text/csv' } });
    });

    it('appends currency query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV({ currency: 'VCU' });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('currency=VCU');
    });

    it('appends startDate and endDate query params', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0] as string;
      expect(calledPath).toContain('startDate=');
      expect(calledPath).toContain('endDate=');
    });

    it('appends page and limit query params', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV({ page: 1, limit: 500 });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0] as string;
      expect(calledPath).toContain('page=1');
      expect(calledPath).toContain('limit=500');
    });

    it('appends sortOrder query param', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV({ sortOrder: 'asc' });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toContain('sortOrder=asc');
    });

    it('appends all query params together', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV({
        currency: 'DIEM',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        page: 2,
        limit: 100,
        sortOrder: 'desc',
      });

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0] as string;
      expect(calledPath).toContain('currency=DIEM');
      expect(calledPath).toContain('page=2');
      expect(calledPath).toContain('limit=100');
      expect(calledPath).toContain('sortOrder=desc');
    });

    it('does not append query string for empty request', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV({});

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toBe('/billing/usage');
    });

    it('does not append query string for undefined request', async () => {
      mockClient._mockHttp.get.mockResolvedValue({ data: csvData, headers: {}, status: 200 });

      await endpoint.exportCSV(undefined);

      const calledPath = mockClient._mockHttp.get.mock.calls[0][0];
      expect(calledPath).toBe('/billing/usage');
    });

    it('propagates http errors', async () => {
      mockClient._mockHttp.get.mockRejectedValue(new Error('Rate limited'));

      await expect(endpoint.exportCSV()).rejects.toThrow('Rate limited');
    });
  });
});
