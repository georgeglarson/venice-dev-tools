/**
 * Logger Utility
 * 
 * This module provides logging functionality for the SDK.
 * It allows for different log levels and can be enabled/disabled.
 */

/**
 * Log levels
 */
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Log level
   * @default LogLevel.NONE
   */
  level: LogLevel;

  /**
   * Whether to include timestamps in logs
   * @default true
   */
  timestamps: boolean;

  /**
   * Custom log handler
   * @default console.log
   */
  logHandler?: (message: string, level: LogLevel) => void;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.NONE,
  timestamps: true
};

/**
 * Logger class
 */
export class Logger {
  /**
   * Current configuration
   */
  private static config: LoggerConfig = { ...DEFAULT_CONFIG };

  /**
   * Configure the logger
   * 
   * @param config - Logger configuration
   */
  public static configure(config: Partial<LoggerConfig>): void {
    Logger.config = {
      ...Logger.config,
      ...config
    };
  }

  /**
   * Set the log level
   * 
   * @param level - Log level
   */
  public static setLevel(level: LogLevel): void {
    Logger.config.level = level;
  }

  /**
   * Log a message at the error level
   * 
   * @param message - Message to log
   * @param data - Additional data to log
   */
  public static error(message: string, data?: any): void {
    Logger.log(message, LogLevel.ERROR, data);
  }

  /**
   * Log a message at the warn level
   * 
   * @param message - Message to log
   * @param data - Additional data to log
   */
  public static warn(message: string, data?: any): void {
    Logger.log(message, LogLevel.WARN, data);
  }

  /**
   * Log a message at the info level
   * 
   * @param message - Message to log
   * @param data - Additional data to log
   */
  public static info(message: string, data?: any): void {
    Logger.log(message, LogLevel.INFO, data);
  }

  /**
   * Log a message at the debug level
   * 
   * @param message - Message to log
   * @param data - Additional data to log
   */
  public static debug(message: string, data?: any): void {
    Logger.log(message, LogLevel.DEBUG, data);
  }

  /**
   * Log a message at the trace level
   * 
   * @param message - Message to log
   * @param data - Additional data to log
   */
  public static trace(message: string, data?: any): void {
    Logger.log(message, LogLevel.TRACE, data);
  }

  /**
   * Sanitizes an object to exclude image data
   *
   * @param data - Object to sanitize
   * @returns Sanitized object
   */
  private static sanitizeImageData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Create a shallow copy of the object
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    // Check each property for potential image data
    for (const key in sanitized) {
      if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
        const value = sanitized[key];
        
        // Check for common image/file field names
        if (['image', 'data', 'content', 'file', 'buffer', 'base64'].includes(key.toLowerCase())) {
          // Check if value is likely image data or PDF (string longer than 1000 chars or Buffer)
          if ((typeof value === 'string' && value.length > 1000) ||
              (value && typeof value === 'object' && 'buffer' in value) ||
              (value instanceof Buffer)) {
            sanitized[key] = '[FILE DATA EXCLUDED]';
          }
        } else if (typeof value === 'string' && value.length > 1000 &&
                  (value.startsWith('data:image') ||
                   value.startsWith('/9j/') || // JPEG
                   value.startsWith('iVBOR') || // PNG
                   value.startsWith('JVBERi0') || // PDF (%PDF- in base64)
                   value.startsWith('aiA8PAovVHlwZS') || // PDF header pattern
                   value.startsWith('%PDF-') || // PDF header in plain text
                   /^[A-Za-z0-9+/=]{1000,}$/.test(value))) {
          // Also check for base64 encoded images or PDFs in other fields
          sanitized[key] = '[FILE DATA EXCLUDED]';
        } else if (typeof value === 'object' && value !== null) {
          // Recursively sanitize nested objects
          sanitized[key] = Logger.sanitizeImageData(value);
        }
      }
    }

    return sanitized;
  }

  /**
   * Log a message at the specified level
   *
   * @param message - Message to log
   * @param level - Log level
   * @param data - Additional data to log
   */
  private static log(message: string, level: LogLevel, data?: any): void {
    if (level > Logger.config.level) {
      return;
    }

    const timestamp = Logger.config.timestamps ? `[${new Date().toISOString()}] ` : '';
    const levelStr = LogLevel[level].padEnd(5);
    let logMessage = `${timestamp}${levelStr} - ${message}`;

    if (data !== undefined) {
      if (typeof data === 'object') {
        try {
          // Sanitize object to exclude image data before stringifying
          const sanitizedData = Logger.sanitizeImageData(data);
          const dataStr = JSON.stringify(sanitizedData, null, 2);
          logMessage += `\n${dataStr}`;
        } catch (error) {
          logMessage += `\n[Object could not be stringified]`;
        }
      } else {
        // For non-object data, check if it's a string that might be base64 encoded image or PDF
        if (typeof data === 'string' && data.length > 1000 &&
            (data.startsWith('data:image') ||
             data.startsWith('/9j/') || // JPEG
             data.startsWith('iVBOR') || // PNG
             data.startsWith('JVBERi0') || // PDF (%PDF- in base64)
             data.startsWith('aiA8PAovVHlwZS') || // PDF header pattern
             data.startsWith('%PDF-') || // PDF header in plain text
             /^[A-Za-z0-9+/=]{1000,}$/.test(data))) {
          logMessage += ' [FILE DATA EXCLUDED]';
        } else {
          logMessage += ` ${data}`;
        }
      }
    }

    if (Logger.config.logHandler) {
      Logger.config.logHandler(logMessage, level);
    } else {
      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage);
          break;
        case LogLevel.WARN:
          console.warn(logMessage);
          break;
        default:
          console.log(logMessage);
          break;
      }
    }
  }
}