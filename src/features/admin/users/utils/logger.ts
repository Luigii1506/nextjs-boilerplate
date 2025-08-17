/**
 * 👥 USERS ENTERPRISE LOGGER
 * ==========================
 *
 * Sistema de logging estructurado para el módulo CORE de usuarios
 * Incluye logging especial para operaciones de seguridad
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import { USERS_CORE_CONFIG, LOG_LEVELS, ANALYTICS_EVENTS } from "../constants";

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type LogContext = Record<string, unknown>;
export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

// 🔐 Security-specific context for user operations
export interface SecurityLogContext extends LogContext {
  userId?: string;
  targetUserId?: string;
  currentUserRole?: string;
  targetUserRole?: string;
  operation?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// 📊 Performance metrics context
export interface PerformanceLogContext extends LogContext {
  duration?: number;
  queryCount?: number;
  cacheHit?: boolean;
  memoryUsage?: number;
  operationType?: string;
}

/**
 * 🏗️ ENTERPRISE LOGGER FOR USERS MODULE
 *
 * Features específicas para usuarios:
 * - Security logging para operaciones críticas
 * - Performance tracking para queries de usuarios
 * - Analytics events para métricas de negocio
 * - Structured logging con contexto completo
 */
class UsersEnterpriseLogger {
  private module: string;
  private sessionId: string;

  constructor(module: string) {
    this.module = module;
    this.sessionId = `users-session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // 🚨 Security logs always enabled
    if (level === LOG_LEVELS.SECURITY) return true;
    // ❌ Error logs always enabled
    if (level === LOG_LEVELS.ERROR) return true;
    // 🔧 Other logs depend on config
    return USERS_CORE_CONFIG.advancedLogging;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = this.getTimestamp();
    const emoji = this.getLevelEmoji(level);
    return `${emoji} [${timestamp}] ${this.module} | ${message}`;
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LOG_LEVELS.INFO:
        return "ℹ️";
      case LOG_LEVELS.DEBUG:
        return "🔍";
      case LOG_LEVELS.WARN:
        return "⚠️";
      case LOG_LEVELS.ERROR:
        return "❌";
      case LOG_LEVELS.SECURITY:
        return "🔐";
      default:
        return "📝";
    }
  }

  // 📝 Standard logging methods
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    console.log(this.formatMessage(LOG_LEVELS.INFO, message), {
      sessionId: this.sessionId,
      ...context,
    });
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    console.debug(this.formatMessage(LOG_LEVELS.DEBUG, message), {
      sessionId: this.sessionId,
      ...context,
    });
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message), {
      sessionId: this.sessionId,
      ...context,
    });
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message), {
      sessionId: this.sessionId,
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
  }

  // 🔐 SECURITY LOGGING (Always enabled)
  security(message: string, context: SecurityLogContext): void {
    console.warn(this.formatMessage(LOG_LEVELS.SECURITY, message), {
      sessionId: this.sessionId,
      timestamp: this.getTimestamp(),
      level: "SECURITY_AUDIT",
      ...context,
    });
  }

  // 🚨 Security events específicos
  securityEvent(
    event: string,
    details: SecurityLogContext,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM"
  ): void {
    this.security(`Security Event: ${event}`, {
      ...details,
      severity,
      eventType: "USER_SECURITY_EVENT",
    });
  }

  // 👤 User operation logging
  userOperation(
    operation: string,
    userId: string,
    targetUserId: string | null,
    success: boolean,
    details?: SecurityLogContext
  ): void {
    this.security(`User Operation: ${operation}`, {
      operation,
      userId,
      targetUserId: targetUserId || undefined,
      success,
      ...(details || {}),
    });
  }

  // 🎭 Role change logging (crítico)
  roleChange(
    adminId: string,
    targetUserId: string,
    fromRole: string,
    toRole: string,
    context?: SecurityLogContext
  ): void {
    this.securityEvent(
      "ROLE_CHANGE",
      {
        adminId,
        targetUserId,
        fromRole,
        toRole,
        ...(context || {}),
      },
      "HIGH"
    );
  }

  // 🚫 Ban/Unban operations
  banOperation(
    adminId: string,
    targetUserId: string,
    action: "BAN" | "UNBAN",
    reason?: string | null,
    context?: SecurityLogContext
  ): void {
    this.securityEvent(
      `USER_${action}`,
      {
        adminId,
        targetUserId,
        reason: reason || undefined,
        ...(context || {}),
      },
      "HIGH"
    );
  }

  // ⚡ PERFORMANCE TRACKING
  timeStart(label: string): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.time(`⏱️ ${this.module} ${label}`);
    }
  }

  timeEnd(label: string, context?: PerformanceLogContext): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.timeEnd(`⏱️ ${this.module} ${label}`);
      if (context) {
        this.debug(`Performance metrics for ${label}`, {
          ...context,
          timestamp: this.getTimestamp(),
        });
      }
    }
  }

  // 📊 Performance with metrics
  performance(
    operation: string,
    duration: number,
    context?: PerformanceLogContext
  ): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;

    const level = duration > 1000 ? "WARN" : "INFO";
    const message = `Performance: ${operation} took ${duration}ms`;

    if (level === "WARN") {
      this.warn(message, { ...context, duration, operation });
    } else {
      this.info(message, { ...context, duration, operation });
    }
  }

  // 🗂️ GROUPED LOGGING
  group(title: string, context?: LogContext): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.group(`🗂️ ${this.module} ${title}`);
      if (context) {
        this.debug(`Group context: ${title}`, context);
      }
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.groupEnd();
    }
  }

  // 📈 ANALYTICS LOGGING
  analytics(event: AnalyticsEvent, data: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;

    this.info(`Analytics: ${event}`, {
      event,
      ...data,
      timestamp: this.getTimestamp(),
      type: "ANALYTICS_EVENT",
    });
  }

  // 🔍 Query logging with performance
  query(
    queryName: string,
    duration: number,
    recordCount?: number,
    context?: LogContext
  ): void {
    this.performance(`Query ${queryName}`, duration, {
      ...context,
      queryName,
      recordCount,
      operationType: "DATABASE_QUERY",
    });
  }

  // 📊 Cache logging
  cache(
    operation: "HIT" | "MISS" | "SET",
    key: string,
    context?: LogContext
  ): void {
    this.debug(`Cache ${operation}: ${key}`, {
      ...context,
      cacheOperation: operation,
      cacheKey: key,
    });
  }

  // 🚀 Bulk operation logging
  bulkOperation(
    operation: string,
    itemCount: number,
    duration: number,
    successCount: number,
    context?: LogContext
  ): void {
    const successRate = (successCount / itemCount) * 100;

    this.info(`Bulk Operation: ${operation}`, {
      ...context,
      operation,
      itemCount,
      successCount,
      failureCount: itemCount - successCount,
      successRate: `${successRate.toFixed(1)}%`,
      duration,
    });

    if (successRate < 100) {
      this.warn(`Bulk operation ${operation} had failures`, {
        successRate,
        failureCount: itemCount - successCount,
      });
    }
  }
}

// 🏗️ Factory function for creating loggers
export function createUsersLogger(module: string): UsersEnterpriseLogger {
  return new UsersEnterpriseLogger(`[Users] ${module}`);
}

// 🎯 Pre-configured loggers for different parts of the module
export const usersHookLogger = createUsersLogger("Hook");
export const usersServerActionLogger = createUsersLogger("ServerAction");
export const usersOptimisticLogger = createUsersLogger("Optimistic");
export const usersServiceLogger = createUsersLogger("Service");
export const usersUILogger = createUsersLogger("UI");

// 🔐 Security-focused logger
export const usersSecurityLogger = createUsersLogger("Security");

// 📊 Analytics-focused logger
export const usersAnalyticsLogger = createUsersLogger("Analytics");
