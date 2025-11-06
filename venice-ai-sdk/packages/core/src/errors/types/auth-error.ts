import { VeniceApiError } from './api-error';
import { RecoveryHint } from './base-error';

/**
 * Error for authentication issues.
 */
export class VeniceAuthError extends VeniceApiError {
  /**
   * Create a new authentication error.
   * @param message - The error message.
   */
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'VeniceAuthError';
    this.code = 'AUTH_ERROR';
    
    this.recoveryHints = [
      {
        action: 'check_api_key',
        description: 'Verify your API key is set correctly',
        code: 'const client = new VeniceClient({ apiKey: process.env.VENICE_API_KEY });',
        automated: false,
      },
      {
        action: 'get_new_key',
        description: 'Generate a new API key at https://venice.ai/api',
        automated: false,
      },
      {
        action: 'check_env_vars',
        description: 'Ensure VENICE_API_KEY environment variable is set',
        code: 'echo $VENICE_API_KEY',
        automated: false,
      },
    ];
    
    Object.setPrototypeOf(this, VeniceAuthError.prototype);
  }
}

export default VeniceAuthError;