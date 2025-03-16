/**
 * HTTP module exports
 * 
 * This module provides HTTP client implementations and utilities for
 * communicating with the Venice AI API.
 */

// Export the main HTTP client
export { HttpClient } from './client';

// Export components
export * from './components';

// Export legacy HTTP client classes for backward compatibility
export { BaseHttpClient as LegacyBaseHttpClient } from './base/base-http-client';
export { StandardHttpClient } from './standard/standard-http-client';
export { StreamingHttpClient } from './streaming/streaming-http-client';
export { HttpClientFactory } from './factory/http-client-factory';
export { ErrorHandler } from './error/error-handler';

// Re-export the factory as the default export
import { HttpClientFactory } from './factory/http-client-factory';
export default HttpClientFactory;