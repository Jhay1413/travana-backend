export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private static formatMessage(entry: LogEntry): string {
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${
      entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : ''
    }`;
  }

  public static error(message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    console.error(this.formatMessage(entry));
  }

  public static warn(message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    console.warn(this.formatMessage(entry));
  }

  public static info(message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    console.info(this.formatMessage(entry));
  }

  public static debug(message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    console.debug(this.formatMessage(entry));
  }
}
