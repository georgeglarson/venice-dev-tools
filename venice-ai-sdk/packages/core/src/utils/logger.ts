import { LogLevel } from '../types/common';

/**
 * A log entry.
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Options for the logger.
 */
export interface LoggerOptions {
  level?: LogLevel;
  handlers?: Array<(entry: LogEntry) => void>;
}

/**
 * Logger for the Venice AI SDK.
 * Provides logging functionality with different log levels.
 */
export class Logger {
  /**
   * The current log level.
   */
  private level: LogLevel;
  
  /**
   * The log handlers.
   */
  private handlers: Array<(entry: LogEntry) => void>;
  
  /**
   * Creates a new logger.
   * 
   * @param options - Logger options
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 1;
    this.handlers = options.handlers ?? [this.defaultHandler.bind(this)];
  }
  
  /**
   * Sets the log level.
   * 
   * @param level - The log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * Adds a log handler.
   * 
   * @param handler - The log handler
   */
  addHandler(handler: (entry: LogEntry) => void): void {
    this.handlers.push(handler);
  }
  
  /**
   * Logs a debug message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  debug(message: string, data?: any): void {
    this.log(0, message, data);
  }
  
  /**
   * Logs an info message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  info(message: string, data?: any): void {
    this.log(1, message, data);
  }
  
  /**
   * Logs a warning message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  warn(message: string, data?: any): void {
    this.log(2, message, data);
  }
  
  /**
   * Logs an error message.
   * 
   * @param message - The message to log
   * @param data - Additional data to log
   */
  error(message: string, data?: any): void {
    this.log(3, message, data);
  }
  
  /**
   * Logs a message at the specified level.
   * 
   * @param level - The log level
   * @param message - The message to log
   * @param data - Additional data to log
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.level) return;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };
    
    for (const handler of this.handlers) {
      handler(entry);
    }
  }
  
  /**
   * Default log handler.
   * 
   * @param entry - The log entry
   */
  private defaultHandler(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[entry.level] || 'UNKNOWN';
    
    let logMessage = `[${entry.timestamp}] ${levelName}: ${entry.message}`;
    
    if (entry.data !== undefined) {
      try {
        const dataStr = typeof entry.data === 'string' 
          ? entry.data 
          : JSON.stringify(entry.data, null, 2);
        logMessage += `\n${dataStr}`;
      } catch (e) {
        logMessage += '\n[Unable to stringify data]';
      }
    }
    
    // In Node.js environment
    if (typeof process !== 'undefined' && process.stdout) {
      const stream = entry.level >= 3 ? process.stderr : process.stdout;
      stream.write(`${logMessage}\n`);
    } else {
      // In browser environment
      const method = entry.level >= 3 
        ? 'error' 
        : entry.level === 2 
          ? 'warn' 
          : entry.level === 1 
            ? 'info' 
            : 'debug';
      console[method](logMessage);
    }
  }
}

export default Logger;