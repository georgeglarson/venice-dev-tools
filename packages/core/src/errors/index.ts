export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(
    public retryAfter: number,
    message: string = 'Rate limit exceeded'
  ) {
    super(429, 'rate_limit_exceeded', message);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends APIError {
  constructor(
    public field: string,
    message: string = 'Validation error'
  ) {
    super(400, 'validation_error', message);
    this.name = 'ValidationError';
  }
}