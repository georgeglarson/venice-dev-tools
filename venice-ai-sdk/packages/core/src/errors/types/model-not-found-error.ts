import { VeniceApiError } from './api-error';

/**
 * Error thrown when a specified model is not found.
 * Provides helpful suggestions for finding the correct model name.
 */
export class VeniceModelNotFoundError extends VeniceApiError {
  /**
   * The model ID that was not found.
   */
  readonly modelId: string;

  /**
   * Suggested alternative models.
   */
  readonly suggestions?: string[];

  /**
   * Create a new model not found error.
   * @param modelId - The model ID that was not found.
   * @param suggestions - Optional array of suggested alternative model IDs.
   */
  constructor(modelId: string, suggestions?: string[]) {
    const message = `Model '${modelId}' not found`;
    const suggestionsText = suggestions && suggestions.length > 0
      ? `\n\nSuggested alternatives:\n${suggestions.map(s => `  - ${s}`).join('\n')}`
      : '';
    
    const fullMessage = `${message}${suggestionsText}\n\nTip: Use venice.models.list() to see all available models`;

    super(fullMessage, 404, {
      modelId,
      suggestions,
      helpUrl: 'https://docs.venice.ai/models'
    });

    this.name = 'VeniceModelNotFoundError';
    this.modelId = modelId;
    this.suggestions = suggestions;

    // Add specific recovery hints
    if (this.context) {
      this.context.recoveryHints = [
      {
        action: 'list_models',
        description: 'Call venice.models.list() to see all available models',
        automated: false,
        code: 'const models = await venice.models.list();\nconsole.log(models.data.map(m => m.id));'
      },
      {
        action: 'check_model_type',
        description: 'Use the correct endpoint for your model type (chat, image, embedding)',
        automated: false
      },
      ...(suggestions && suggestions.length > 0 ? [{
        action: 'try_suggestion',
        description: `Try one of these similar models: ${suggestions.join(', ')}`,
        automated: false
      }] : []),
      {
        action: 'check_documentation',
        description: 'Visit https://docs.venice.ai/models for the latest model list',
        automated: false
      }
    ];
    }

    Object.setPrototypeOf(this, VeniceModelNotFoundError.prototype);
  }

  /**
   * Get a user-friendly error message with suggestions.
   */
  getUserMessage(): string {
    let msg = `The model '${this.modelId}' was not found.\n\n`;
    
    if (this.suggestions && this.suggestions.length > 0) {
      msg += 'Did you mean one of these?\n';
      this.suggestions.forEach(s => {
        msg += `  • ${s}\n`;
      });
      msg += '\n';
    }
    
    msg += 'To see all available models, run:\n';
    msg += '  const models = await venice.models.list();\n';
    msg += '  console.log(models.data.map(m => m.id));\n';
    
    return msg;
  }
}

export default VeniceModelNotFoundError;
