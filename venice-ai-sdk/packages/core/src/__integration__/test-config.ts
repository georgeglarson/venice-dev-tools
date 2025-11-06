/**
 * Test configuration helper for integration tests
 * Provides consistent environment variable handling and test setup
 */

export interface TestConfig {
  apiKey?: string;
  adminApiKey?: string;
  baseUrl?: string;
  logLevel?: number;
  timeout?: number;
}

export interface TestEnvironment {
  hasApiKey: boolean;
  hasAdminApiKey: boolean;
  skipTests: boolean;
  skipReason?: string;
}

/**
 * Get test configuration from environment variables
 */
export function getTestConfig(): TestConfig {
  return {
    apiKey: process.env.VENICE_API_KEY,
    adminApiKey: process.env.VENICE_ADMIN_API_KEY,
    baseUrl: process.env.VENICE_BASE_URL,
    logLevel: parseInt(process.env.VENICE_LOG_LEVEL || '4', 10),
    timeout: parseInt(process.env.VENICE_TIMEOUT || '30000', 10),
  };
}

/**
 * Check if required environment variables are available for tests
 */
export function checkTestEnvironment(requireAdminKey = false): TestEnvironment {
  const config = getTestConfig();
  
  if (requireAdminKey && !config.adminApiKey) {
    return {
      hasApiKey: !!config.apiKey,
      hasAdminApiKey: false,
      skipTests: true,
      skipReason: 'VENICE_ADMIN_API_KEY environment variable is required for these tests'
    };
  }
  
  if (!requireAdminKey && !config.apiKey) {
    return {
      hasApiKey: false,
      hasAdminApiKey: !!config.adminApiKey,
      skipTests: true,
      skipReason: 'VENICE_API_KEY environment variable is required for these tests'
    };
  }
  
  return {
    hasApiKey: !!config.apiKey,
    hasAdminApiKey: !!config.adminApiKey,
    skipTests: false
  };
}

/**
 * Create a test description that skips tests if environment is not ready
 */
export function describeWithEnvironmentCheck(
  testName: string,
  testFn: () => void,
  requireAdminKey = false
) {
  const env = checkTestEnvironment(requireAdminKey);
  
  if (env.skipTests) {
    // Return a describe block that skips all tests
    return describe(testName, () => {
      it.skip(`should skip tests - ${env.skipReason}`, () => {
        // This test will be skipped
      });
    });
  }
  
  return describe(testName, testFn);
}

/**
 * Validate environment variables and throw if missing
 * Use this for tests that should fail rather than skip
 */
export function validateTestEnvironment(requireAdminKey = false): void {
  const env = checkTestEnvironment(requireAdminKey);
  
  if (env.skipTests) {
    throw new Error(env.skipReason || 'Test environment is not properly configured');
  }
}