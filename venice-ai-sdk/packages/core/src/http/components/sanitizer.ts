/**
 * HTTP request/response sanitization utilities
 * 
 * This module provides utilities for sanitizing sensitive information
 * from HTTP headers and request/response data before logging.
 */

/**
 * Sanitize headers for logging by removing sensitive information
 * @param headers - The headers to sanitize
 * @returns The sanitized headers
 */
export function sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  if (!headers) return headers;
  
  const sanitized = { ...headers };
  
  // Redact Authorization header (case-insensitive)
  if (sanitized.Authorization) {
    sanitized.Authorization = 'Bearer [REDACTED]';
  }
  
  if (sanitized.authorization) {
    sanitized.authorization = 'Bearer [REDACTED]';
  }
  
  // Handle headers object with different casing
  Object.keys(sanitized).forEach(key => {
    if (key.toLowerCase() === 'authorization') {
      sanitized[key] = 'Bearer [REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Sanitize request/response data for logging by removing sensitive information
 * @param data - The data to sanitize
 * @returns The sanitized data
 */
export function sanitizeData(data: unknown): unknown {
  if (!data) return data;
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = { ...(data as Record<string, unknown>) };

    // List of field names whose values must be redacted
    const sensitiveFields = [
      'apiKey',
      'api_key',
      'password',
      'token',
      'secret',
      'accessToken',
      'access_token',
      'refreshToken',
      'refresh_token',
      'apiSecret',
      'api_secret',
      'client_secret',
      'clientSecret',
      'private_key',
      'privateKey',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Handle nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }
  
  // Return non-object data as is
  return data;
}