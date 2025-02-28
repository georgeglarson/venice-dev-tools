/**
 * Venice AI API Client
 * 
 * This is the main client class for interacting with the Venice AI API.
 * It provides access to all API resources and handles configuration.
 * 
 * @example
 * ```typescript
 * import { VeniceAI } from 'venice-ai-sdk-apl';
 * 
 * const venice = new VeniceAI({
 *   apiKey: 'your-api-key',
 * });
 * 
 * // Now you can use the client to access API resources
 * const models = await venice.models.list();
 * ```
 */

import { ChatResource } from './resources/chat';
import { ImageResource } from './resources/image';
import { ModelsResource } from './resources/models';
import { ApiKeysResource } from './resources/api-keys';
import { CharactersResource } from './resources/characters';
import { VVVResource } from './resources/vvv';
import { ClientConfig } from './types/common';
import { HttpClient } from './utils/http';
import { Logger, LogLevel } from './utils/logger';
import { commands } from './cli';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<ClientConfig> = {
  baseUrl: 'https://api.venice.ai/api/v1',
  timeout: 30000, // 30 seconds
  logLevel: LogLevel.NONE,
};

/**
 * Main Venice AI API client class
 */
export class VeniceAI {
  /**
   * The configuration for this client instance
   */
  private config: ClientConfig;

  /**
   * HTTP client for making API requests
   */
  private httpClient: HttpClient;

  /**
   * Chat completions resource
   */
  public chat: ChatResource;

  /**
   * Image generation resource
   */
  public image: ImageResource;

  /**
   * Models resource
   */
  public models: ModelsResource;

  /**
   * API keys resource
   */
  public apiKeys: ApiKeysResource;

  /**
   * Characters resource
   */
  public characters: CharactersResource;

  /**
   * VVV resource
   */
  public vvv: VVVResource;

  /**
   * Creates a new Venice AI API client
   * 
   * @param config - Client configuration
   */
  constructor(config: Partial<ClientConfig>) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as ClientConfig;

    // Validate required config
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    // Configure logger
    if (this.config.logLevel !== undefined) {
      Logger.setLevel(this.config.logLevel);
    }

    // Initialize HTTP client
    this.httpClient = new HttpClient(this.config);

    // Initialize resources
    this.chat = new ChatResource(this.httpClient);
    this.image = new ImageResource(this.httpClient);
    this.models = new ModelsResource(this.httpClient);
    this.apiKeys = new ApiKeysResource(this.httpClient);
    this.characters = new CharactersResource(this.httpClient);
    this.vvv = new VVVResource(this.httpClient);
  }

  /**
   * Get the current configuration
   */
  public getConfig(): ClientConfig {
    return { ...this.config };
  }

  /**
   * Set the log level
   * 
   * @param level - Log level
   */
  public setLogLevel(level: LogLevel): void {
    this.config.logLevel = level;
    Logger.setLevel(level);
  }

  /**
   * Enable debug logging
   */
  public enableDebugLogging(): void {
    this.setLogLevel(LogLevel.DEBUG);
  }

  /**
   * Disable logging
   */
  public disableLogging(): void {
    this.setLogLevel(LogLevel.NONE);
  }

  /**
   * CLI-style interface that mirrors the command-line syntax
   *
   * This method allows you to use the same commands you're familiar with from the CLI
   * directly in your code. It supports both string-based CLI-style arguments and
   * object-based options.
   *
   * @example
   * ```typescript
   * // CLI-style with string arguments
   * const styles = await venice.cli('list-styles --limit 5');
   *
   * // CLI-style with object arguments
   * const models = await venice.cli('list-models', { limit: 5, raw: true });
   *
   * // Generate an image
   * const image = await venice.cli('generate-image "A beautiful sunset" --style Photographic --output sunset.png');
   * ```
   *
   * @param command - The command to execute (e.g., 'list-keys', 'chat', 'generate-image')
   * @param options - Options for the command (can be a string of CLI arguments or an object)
   * @returns The result of the command
   */
  public async cli(command: string, options: string | Record<string, any> = {}): Promise<any> {
    // Parse the command to extract the base command and any arguments
    const parts = command.trim().split(/\s+/);
    const baseCommand = parts[0];
    
    // If options is a string, parse it as CLI arguments
    if (typeof options === 'string') {
      options = this._parseCliArgs(options);
    }
    
    // If there are arguments in the command string, extract them
    if (parts.length > 1) {
      // Extract quoted arguments (for prompts, etc.)
      let remainingArgs = parts.slice(1).join(' ');
      const quotedArgs: string[] = [];
      
      // Extract text in quotes
      const quoteRegex = /"([^"]*)"|'([^']*)'/g;
      let match;
      while ((match = quoteRegex.exec(remainingArgs)) !== null) {
        quotedArgs.push(match[1] || match[2]);
        // Remove the quoted text from remainingArgs
        remainingArgs = remainingArgs.replace(match[0], '');
      }
      
      // Parse the remaining arguments
      const parsedArgs = this._parseCliArgs(remainingArgs);
      
      // Merge the parsed arguments with the options
      options = { ...parsedArgs, ...options };
      
      // Add the quoted arguments as positional arguments
      if (quotedArgs.length > 0) {
        options._args = quotedArgs;
      }
    }
    
    // Map commands to functions
    switch (baseCommand) {
      case 'list-keys':
        return commands.listKeys(options);
        
      case 'create-key':
        if (!options.name && options._args && options._args.length > 0) {
          return commands.createKey(options._args[0], options);
        }
        return commands.createKey(options.name, options);
        
      case 'delete-key':
        if (!options.id && options._args && options._args.length > 0) {
          return commands.deleteKey(options._args[0], options);
        }
        return commands.deleteKey(options.id, options);
        
      case 'rate-limits':
        return commands.rateLimits(options);
        
      case 'list-models':
        return commands.listModels(options);
        
      case 'chat':
        if (options._args && options._args.length > 0) {
          return commands.chat(options._args[0], options);
        }
        throw new Error('Chat command requires a prompt');
        
      case 'generate-image':
        if (options._args && options._args.length > 0) {
          return commands.generateImage(options._args[0], options);
        }
        throw new Error('Generate image command requires a prompt');
        
      case 'list-styles':
        return commands.listStyles(options);
        
      case 'list-characters':
        return commands.listCharacters(options);
        
      case 'vvv-supply':
        return commands.vvvCirculatingSupply(options);
        
      case 'vvv-utilization':
        return commands.vvvUtilization(options);
        
      case 'vvv-yield':
        return commands.vvvStakingYield(options);
        
      case 'configure':
        if (options._args && options._args.length > 0) {
          return commands.configure(options._args[0]);
        }
        if (options.apiKey) {
          return commands.configure(options.apiKey);
        }
        throw new Error('Configure command requires an API key');
        
      default:
        throw new Error(`Unknown command: ${baseCommand}`);
    }
  }
  
  /**
   * Parse CLI-style arguments into an options object
   *
   * @example
   * ```typescript
   * // "--limit 5 --raw" becomes { limit: "5", raw: true }
   * const options = venice._parseCliArgs("--limit 5 --raw");
   * ```
   *
   * @param argsString - The CLI arguments string to parse
   * @returns An object with the parsed options
   * @private
   */
  private _parseCliArgs(argsString: string): Record<string, any> {
    const options: Record<string, any> = {};
    
    // Simple parsing logic for --flag and --key value
    const args = argsString.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const key = args[i].substring(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          // Handle numeric values
          const value = args[i + 1];
          if (/^\d+$/.test(value)) {
            options[key] = parseInt(value, 10);
          } else if (/^\d+\.\d+$/.test(value)) {
            options[key] = parseFloat(value);
          } else {
            options[key] = value;
          }
          i++;
        } else {
          options[key] = true;
        }
      } else if (args[i].startsWith('-')) {
        // Handle short flags (-d, -r, etc.)
        const flags = args[i].substring(1).split('');
        for (const flag of flags) {
          // Map short flags to long flags
          switch (flag) {
            case 'd':
              options.debug = true;
              break;
            case 'r':
              options.raw = true;
              break;
            case 'w':
              options.webSearch = true;
              break;
            case 'm':
              if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                options.model = args[i + 1];
                i++;
              }
              break;
            case 's':
              if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                options.system = args[i + 1];
                i++;
              }
              break;
            case 'n':
              if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                options.negative = args[i + 1];
                i++;
              }
              break;
            case 'h':
              if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                options.height = parseInt(args[i + 1], 10);
                i++;
              }
              break;
            case 'o':
              if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                options.output = args[i + 1];
                i++;
              }
              break;
            default:
              options[flag] = true;
          }
        }
      }
    }
    
    return options;
  }
}

// Export LogLevel enum
export { LogLevel };