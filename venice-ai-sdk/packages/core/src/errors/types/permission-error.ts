import { VeniceApiError } from './api-error';

/**
 * Error thrown when an operation requires different permissions.
 * Provides guidance on which API key type is needed.
 */
export class VenicePermissionError extends VeniceApiError {
  /**
   * The type of API key currently being used.
   */
  readonly currentKeyType?: 'INFERENCE' | 'ADMIN' | 'UNKNOWN';

  /**
   * The type of API key required for this operation.
   */
  readonly requiredKeyType: 'INFERENCE' | 'ADMIN';

  /**
   * Create a new permission error.
   * @param operation - The operation that was attempted.
   * @param requiredKeyType - The type of API key required.
   * @param currentKeyType - The type of API key currently being used.
   */
  constructor(
    operation: string,
    requiredKeyType: 'INFERENCE' | 'ADMIN',
    currentKeyType?: 'INFERENCE' | 'ADMIN' | 'UNKNOWN'
  ) {
    const message = `${operation} requires an ${requiredKeyType} API key`;
    const currentInfo = currentKeyType
      ? `\n\nYou are currently using: ${currentKeyType} key`
      : '';
    
    const fullMessage = `${message}${currentInfo}\n\nTo get an ${requiredKeyType} API key:\n  1. Visit https://venice.ai/settings/api\n  2. Click "Create New API Key"\n  3. Select "${requiredKeyType}" as the key type\n  4. Update your VENICE_API_KEY environment variable`;

    super(fullMessage, 401, {
      operation,
      requiredKeyType,
      currentKeyType,
      helpUrl: 'https://venice.ai/settings/api'
    });

    this.name = 'VenicePermissionError';
    this.requiredKeyType = requiredKeyType;
    this.currentKeyType = currentKeyType;

    // Add specific recovery hints
    if (this.context) {
      this.context.recoveryHints = [
      {
        action: 'get_correct_key',
        description: `Get an ${requiredKeyType} API key from https://venice.ai/settings/api`,
        automated: false
      },
      {
        action: 'update_environment',
        description: `Update your VENICE_API_KEY environment variable with the ${requiredKeyType} key`,
        automated: false,
        code: `export VENICE_API_KEY="your-${requiredKeyType.toLowerCase()}-key-here"`
      },
      {
        action: 'check_key_type',
        description: 'Verify you are using the correct API key for this operation',
        automated: false
      }
    ];
    }

    Object.setPrototypeOf(this, VenicePermissionError.prototype);
  }

  /**
   * Get a user-friendly error message with instructions.
   */
  getUserMessage(): string {
    let msg = `⚠️  Permission Error\n\n`;
    msg += `This operation requires an ${this.requiredKeyType} API key.\n`;
    
    if (this.currentKeyType && this.currentKeyType !== 'UNKNOWN') {
      msg += `You are currently using: ${this.currentKeyType} key\n`;
    }
    
    msg += `\n📝 To fix this:\n\n`;
    msg += `1. Visit https://venice.ai/settings/api\n`;
    msg += `2. Create a new "${this.requiredKeyType}" API key\n`;
    msg += `3. Update your environment:\n`;
    msg += `   export VENICE_API_KEY="your-new-key"\n\n`;
    
    msg += `💡 Tip: Keep separate keys for different purposes:\n`;
    msg += `   • INFERENCE keys - for chat, images, embeddings\n`;
    msg += `   • ADMIN keys - for API key management and billing\n`;
    
    return msg;
  }
}

export default VenicePermissionError;
