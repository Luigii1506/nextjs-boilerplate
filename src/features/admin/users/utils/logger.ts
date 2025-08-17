/**
 * 👥 USERS LITE LOGGER
 * ====================
 *
 * Sistema de logging simplificado para operaciones críticas de usuarios
 * Solo mantiene lo esencial: seguridad, errores y operaciones importantes
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0 (Simplified)
 */

import { USERS_CORE_CONFIG } from "../constants";

export type LogContext = Record<string, unknown>;

// 🔐 Security context para operaciones críticas
export interface SecurityLogContext extends LogContext {
  userId?: string;
  targetUserId?: string;
  currentUserRole?: string;
  targetUserRole?: string;
  operation?: string;
  requestId?: string;
}

/**
 * 🏗️ USERS LITE LOGGER
 *
 * Versión simplificada enfocada solo en lo crítico:
 * - 🔐 Security events para auditoría
 * - ❌ Error logging para debugging
 * - 👤 Operaciones importantes de usuarios
 */
class UsersLiteLogger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private shouldLog(): boolean {
    return (
      USERS_CORE_CONFIG.advancedLogging || process.env.NODE_ENV === "production"
    );
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // ❌ ERROR LOGGING (Siempre habilitado)
  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`❌ ${this.module} | ${message}`, {
      timestamp: this.getTimestamp(),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      ...context,
    });
  }

  // 🔐 SECURITY LOGGING (Siempre habilitado - CRÍTICO)
  security(event: string, context: SecurityLogContext): void {
    console.warn(`🔐 ${this.module} | SECURITY: ${event}`, {
      timestamp: this.getTimestamp(),
      level: "SECURITY_AUDIT",
      ...context,
    });
  }

  // 👤 USER OPERATION LOGGING (Solo operaciones críticas)
  userOperation(
    operation: string,
    userId: string,
    targetUserId: string | null,
    success: boolean,
    details?: SecurityLogContext
  ): void {
    const status = success ? "✅" : "❌";
    console.log(`👥 ${this.module} | ${operation} ${status}`, {
      timestamp: this.getTimestamp(),
      operation,
      userId,
      targetUserId: targetUserId || undefined,
      success,
      ...(details || {}),
    });
  }

  // 🎭 ROLE CHANGE LOGGING (CRÍTICO)
  roleChange(
    adminId: string,
    targetUserId: string,
    fromRole: string,
    toRole: string,
    context?: SecurityLogContext
  ): void {
    this.security("ROLE_CHANGE", {
      adminId,
      targetUserId,
      fromRole,
      toRole,
      severity: "HIGH",
      ...(context || {}),
    });
  }

  // 🚫 BAN/UNBAN OPERATIONS (CRÍTICO)
  banOperation(
    adminId: string,
    targetUserId: string,
    action: "BAN" | "UNBAN",
    reason?: string | null,
    context?: SecurityLogContext
  ): void {
    this.security(`USER_${action}`, {
      adminId,
      targetUserId,
      reason: reason || undefined,
      severity: "HIGH",
      ...(context || {}),
    });
  }

  // ℹ️ INFO LOGGING (Solo en desarrollo)
  info(message: string, context?: LogContext): void {
    if (this.shouldLog()) {
      console.log(`ℹ️ ${this.module} | ${message}`, {
        timestamp: this.getTimestamp(),
        ...context,
      });
    }
  }

  // 🔍 DEBUG LOGGING (Solo en desarrollo)
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`🔍 ${this.module} | ${message}`, {
        timestamp: this.getTimestamp(),
        ...context,
      });
    }
  }
}

// 🏗️ Factory function simplificada
export function createUsersLogger(module: string): UsersLiteLogger {
  return new UsersLiteLogger(`[Users] ${module}`);
}

// 🎯 Pre-configured loggers (solo los esenciales)
export const usersHookLogger = createUsersLogger("Hook");
export const usersServerActionLogger = createUsersLogger("ServerAction");
export const usersSecurityLogger = createUsersLogger("Security");

// Para backward compatibility
export const usersOptimisticLogger = createUsersLogger("Optimistic");
export const usersServiceLogger = createUsersLogger("Service");
export const usersUILogger = createUsersLogger("UI");
export const usersAnalyticsLogger = createUsersLogger("Analytics");
