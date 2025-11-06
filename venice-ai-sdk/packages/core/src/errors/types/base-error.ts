/**
 * Recovery action suggestion for errors.
 */
export interface RecoveryHint {
  action: string;
  description: string;
  code?: string;
  automated?: boolean;
}

/**
 * Base error class for Venice AI SDK errors.
 */
export class VeniceError extends Error {
  /**
   * Machine-readable error code.
   */
  public code?: string;

  /**
   * Recovery hints for fixing the error.
   */
  public recoveryHints: RecoveryHint[];

  /**
   * Additional context about the error.
   */
  public context?: Record<string, any>;

  /**
   * Create a new Venice SDK error.
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'VeniceError';
    this.code = options?.code;
    this.recoveryHints = options?.recoveryHints || [];
    this.context = options?.context;
    
    Object.setPrototypeOf(this, VeniceError.prototype);
  }

  /**
   * Get a JSON representation of the error.
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      recoveryHints: this.recoveryHints,
      context: this.context,
      stack: this.stack,
    };
  }
}

export default VeniceError;

/**
 * Interface for error options.
 */
export interface ErrorOptions {
  cause?: unknown;
  code?: string;
  recoveryHints?: RecoveryHint[];
  context?: Record<string, any>;
}