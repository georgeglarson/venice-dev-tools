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
export function sanitizeHeaders(headers: any): any {
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
export function sanitizeData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    
    // Redact API keys
    if (sanitized.apiKey) {
      sanitized.apiKey = '[REDACTED]';
    }
    
    if (sanitized.api_key) {
      sanitized.api_key = '[REDACTED]';
    }
    
    // Redact passwords
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    
    // Redact tokens
    if (sanitized.token) {
      sanitized.token = '[REDACTED]';
    }
    
    // Redact secrets
    if (sanitized.secret) {
      sanitized.secret = '[REDACTED]';
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