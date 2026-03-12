/**
 * Comprehensive security utilities for sanitizing sensitive information.
 * Uses pattern-based detection to catch a wide variety of sensitive data.
 */

/**
 * Patterns that indicate sensitive data in field names
 */
const SENSITIVE_FIELD_PATTERNS = [
  // Authentication & Authorization
  /^(auth|authorization|bearer)$/i,
  /token$/i,
  /^.*token.*/i,
  /^api[-_]?key$/i,
  /^.*key$/i,
  /^.*secret.*/i,
  /^.*private.*/i,

  // Credentials
  /^password$/i,
  /^passwd$/i,
  /^pwd$/i,
  /^pass$/i,
  /^credentials?$/i,

  // JWT & Sessions
  /^jwt$/i,
  /^session[-_]?id$/i,
  /^access[-_]?token$/i,
  /^refresh[-_]?token$/i,
  /^id[-_]?token$/i,

  // Crypto
  /^(private|public)[-_]?key$/i,
  /^.*certificate.*/i,
  /^.*cert$/i,

  // OAuth
  /^client[-_]?secret$/i,
  /^oauth.*/i,

  // Payment
  /^cc[-_]?number$/i,
  /^card[-_]?number$/i,
  /^cvv$/i,
  /^ssn$/i,

  // Other
  /^encryption[-_]?key$/i,
  /^signing[-_]?key$/i,
];

/**
 * Header names that should always be redacted
 */
const SENSITIVE_HEADER_NAMES = [
  'authorization',
  'x-api-key',
  'api-key',
  'apikey',
  'x-auth-token',
  'x-access-token',
  'cookie',
  'set-cookie',
  'proxy-authorization',
];

/**
 * Check if a field name matches any sensitive pattern
 */
export function isSensitiveField(fieldName: string): boolean {
  const normalizedName = fieldName.toLowerCase().trim();

  // Check against known header names
  if (SENSITIVE_HEADER_NAMES.includes(normalizedName)) {
    return true;
  }

  // Check against patterns
  return SENSITIVE_FIELD_PATTERNS.some(pattern => pattern.test(fieldName));
}

/**
 * Redact a value based on its type
 */
export function redactValue(value: unknown, _fieldName?: string): string {
  if (value === null || value === undefined) {
    return '[REDACTED]';
  }

  const strValue = String(value);

  // For very short values, just redact completely
  if (strValue.length <= 4) {
    return '[REDACTED]';
  }

  // For longer values, show first/last few characters for debugging
  // but only if it's not a Bearer token format
  if (strValue.startsWith('Bearer ')) {
    return 'Bearer [REDACTED]';
  }

  // For short strings, fully redact
  if (strValue.length <= 8) {
    return '[REDACTED]';
  }

  // Show first 4 and last 4 characters for other tokens/keys
  const first = strValue.substring(0, 4);
  const last = strValue.substring(strValue.length - 4);
  const stars = '*'.repeat(Math.max(strValue.length - 8, 4));

  return `${first}${stars}${last}`;
}

/**
 * Sanitize HTTP headers by removing or redacting sensitive information
 */
export function sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveField(key)) {
      sanitized[key] = redactValue(value, key);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Recursively sanitize an object by redacting sensitive fields
 */
export function sanitizeData(data: unknown, depth: number = 0): unknown {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[MAX_DEPTH]';
  }

  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle primitive types
  if (typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, depth + 1));
  }

  // Handle objects
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (isSensitiveField(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize a complete HTTP request for logging
 */
export function sanitizeRequest(request: {
  url?: string;
  method?: string;
  headers?: Record<string, unknown>;
  body?: unknown;
}): Record<string, unknown> {
  return {
    url: request.url,
    method: request.method,
    headers: sanitizeHeaders(request.headers || {}),
    body: sanitizeData(request.body),
  };
}

/**
 * Sanitize a complete HTTP response for logging
 */
export function sanitizeResponse(response: {
  status?: number;
  statusText?: string;
  headers?: Record<string, unknown>;
  data?: unknown;
}): Record<string, unknown> {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: sanitizeHeaders(response.headers || {}),
    data: sanitizeData(response.data),
  };
}

/**
 * Create a sanitized copy of an error for logging
 */
export function sanitizeError(error: Error & { response?: Record<string, unknown>; config?: Record<string, unknown> }): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };

  if (error.response) {
    sanitized.response = sanitizeResponse(error.response as { status?: number; statusText?: string; headers?: Record<string, unknown>; data?: unknown });
  }

  if (error.config) {
    sanitized.config = sanitizeRequest(error.config as { url?: string; method?: string; headers?: Record<string, unknown>; body?: unknown });
  }

  return sanitized;
}

export default {
  isSensitiveField,
  redactValue,
  sanitizeHeaders,
  sanitizeData,
  sanitizeRequest,
  sanitizeResponse,
  sanitizeError,
};
