// 🏆 ENTERPRISE LOGGER - Sistema de logging estructurado y reutilizable
// =======================================================================

import { ENTERPRISE_CONFIG, LOG_LEVELS, LOG_PREFIXES } from "../constants";

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type LogContext = Record<string, unknown>;

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  context?: LogContext;
  timestamp: string;
  sessionId?: string;
}

class EnterpriseLogger {
  private module: string;
  private sessionId: string;

  constructor(module: string) {
    this.module = module;
    this.sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    return {
      level,
      module: this.module,
      message,
      context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === "error") return true; // Always log errors
    return ENTERPRISE_CONFIG.enableAdvancedLogging;
  }

  private formatMessage(entry: LogEntry): string {
    const emoji = {
      info: "🏆",
      debug: "🔍",
      warn: "⚠️",
      error: "❌",
    }[entry.level];

    return `${emoji} ${entry.module} ${entry.message}`;
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog("info")) return;

    const entry = this.createLogEntry("info", message, context);
    console.log(this.formatMessage(entry), context || "");
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;

    const entry = this.createLogEntry("debug", message, context);
    console.debug(this.formatMessage(entry), context || "");
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog("warn")) return;

    const entry = this.createLogEntry("warn", message, context);
    console.warn(this.formatMessage(entry), context || "");
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const entry = this.createLogEntry("error", message, {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    });

    console.error(this.formatMessage(entry), entry.context);
  }

  // 🎯 Enterprise method: Log with performance timing
  timeStart(label: string): void {
    if (this.shouldLog("debug")) {
      console.time(`⏱️ ${this.module} ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog("debug")) {
      console.timeEnd(`⏱️ ${this.module} ${label}`);
    }
  }

  // 🎯 Enterprise method: Log with call stack
  trace(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;

    const entry = this.createLogEntry("debug", message, context);
    console.trace(this.formatMessage(entry), context || "");
  }

  // 🎯 Enterprise method: Group related logs
  group(title: string): void {
    if (this.shouldLog("debug")) {
      console.group(`🗂️ ${this.module} ${title}`);
    }
  }

  groupEnd(): void {
    if (this.shouldLog("debug")) {
      console.groupEnd();
    }
  }
}

// 🏗️ Factory function for creating module-specific loggers
export function createLogger(module: string): EnterpriseLogger {
  return new EnterpriseLogger(`${LOG_PREFIXES.FILE_UPLOAD} ${module}`);
}

// 🎯 Pre-configured loggers for common use cases
export const fileUploadLogger = createLogger("Hook");
export const serverActionLogger = createLogger("ServerAction");
export const optimisticLogger = createLogger("Optimistic");
export const cacheLogger = createLogger("Cache");

// 🔧 Legacy compatibility
export const log = fileUploadLogger;
