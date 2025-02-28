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
          const dataStr = JSON.stringify(data, null, 2);
          logMessage += `\n${dataStr}`;
        } catch (error) {
          logMessage += `\n[Object could not be stringified]`;
        }
      } else {
        logMessage += ` ${data}`;
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