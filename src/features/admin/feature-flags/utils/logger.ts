/**
 * 📝 FEATURE-FLAGS ENTERPRISE LOGGING SYSTEM
 * ==========================================
 *
 * Sistema de logging estratégico siguiendo el patrón Lite Logger
 * Solo logging crítico para operaciones importantes
 *
 * Updated: 2025-01-18 - Enterprise patterns V2.0
 */

import { FEATURE_FLAGS_CONFIG, FF_LOG_PREFIXES } from "../constants";

export type LogContext = Record<string, unknown>;

class FeatureFlagsLiteLogger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private shouldLog(): boolean {
    return (
      FEATURE_FLAGS_CONFIG.enableAdvancedLogging ||
      process.env.NODE_ENV === "production"
    );
  }

  // ❌ ERROR LOGGING (Siempre habilitado)
  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`❌ ${this.module} | ${message}`, {
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
      ...context,
    });
  }

  // 🔐 SECURITY LOGGING (Solo operaciones críticas)
  security(event: string, context: LogContext): void {
    console.warn(`🔐 ${this.module} | SECURITY: ${event}`, {
      timestamp: new Date().toISOString(),
      level: "SECURITY_AUDIT",
      ...context,
    });
  }

  // 🎯 OPERATION LOGGING (Solo operaciones críticas)
  operation(name: string, success: boolean, details?: LogContext): void {
    const status = success ? "✅" : "❌";
    console.log(`🎯 ${this.module} | ${name} ${status}`, {
      timestamp: new Date().toISOString(),
      operation: name,
      success,
      ...(details || {}),
    });
  }

  // ℹ️ INFO LOGGING (Solo en desarrollo)
  info(message: string, context?: LogContext): void {
    if (this.shouldLog()) {
      console.log(`ℹ️ ${this.module} | ${message}`, {
        timestamp: new Date().toISOString(),
        ...context,
      });
    }
  }

  // 🔍 DEBUG LOGGING (Solo en desarrollo)
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.log(`🔍 ${this.module} | ${message}`, {
        timestamp: new Date().toISOString(),
        ...context,
      });
    }
  }

  // ⚡ PERFORMANCE LOGGING (Para feature flags críticas)
  performance(operation: string, duration: number, context?: LogContext): void {
    if (this.shouldLog()) {
      const emoji = duration > 1000 ? "🐌" : duration > 500 ? "⚠️" : "⚡";
      console.log(
        `${emoji} ${this.module} | PERF: ${operation} (${duration}ms)`,
        {
          timestamp: new Date().toISOString(),
          operation,
          duration,
          ...context,
        }
      );
    }
  }

  // 🔄 SCHEMA LOGGING (Para regeneración de schemas)
  schema(action: string, success: boolean, details?: LogContext): void {
    const status = success ? "✅" : "❌";
    console.log(`🗂️ ${this.module} | SCHEMA: ${action} ${status}`, {
      timestamp: new Date().toISOString(),
      schemaAction: action,
      success,
      ...(details || {}),
    });
  }

  // 📊 ANALYTICS LOGGING (Para métricas de feature flags)
  analytics(event: string, properties: LogContext): void {
    if (process.env.NODE_ENV === "production") {
      console.log(`📊 ${this.module} | ANALYTICS: ${event}`, {
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  }
}

// 🏗️ Factory function para crear loggers
export function createFeatureFlagsLogger(
  module: string
): FeatureFlagsLiteLogger {
  return new FeatureFlagsLiteLogger(
    `${FF_LOG_PREFIXES.FEATURE_FLAGS} ${module}`
  );
}

// 🎯 Pre-configured loggers (solo los esenciales)
export const featureFlagsHookLogger = createFeatureFlagsLogger("Hook");
export const featureFlagsServerActionLogger =
  createFeatureFlagsLogger("ServerAction");
export const featureFlagsSecurityLogger = createFeatureFlagsLogger("Security");
export const featureFlagsPerformanceLogger =
  createFeatureFlagsLogger("Performance");
export const featureFlagsSchemaLogger = createFeatureFlagsLogger("Schema");

// 🎯 SPECIALIZED LOGGERS

/**
 * 🔄 TOGGLE LOGGER - Para operaciones de toggle críticas
 */
export const featureFlagsToggleLogger = {
  ...createFeatureFlagsLogger("Toggle"),

  toggleAttempt(flagKey: string, userId: string, context?: LogContext): void {
    featureFlagsSecurityLogger.security("FLAG_TOGGLE_ATTEMPT", {
      flagKey,
      userId,
      ...context,
    });
  },

  toggleSuccess(flagKey: string, newState: boolean, userId: string): void {
    featureFlagsServerActionLogger.operation(`Toggle ${flagKey}`, true, {
      flagKey,
      newState,
      userId,
    });
  },

  toggleFailure(flagKey: string, error: unknown, userId: string): void {
    featureFlagsServerActionLogger.error(
      `Toggle failed for ${flagKey}`,
      error,
      { flagKey, userId }
    );
  },
};

/**
 * 🏗️ BATCH LOGGER - Para operaciones en lote
 */
export const featureFlagsBatchLogger = {
  ...createFeatureFlagsLogger("Batch"),

  batchStart(operation: string, count: number, userId: string): void {
    featureFlagsServerActionLogger.info(`Batch ${operation} started`, {
      operation,
      count,
      userId,
    });
  },

  batchProgress(operation: string, completed: number, total: number): void {
    if (process.env.NODE_ENV === "development") {
      featureFlagsServerActionLogger.debug(`Batch ${operation} progress`, {
        operation,
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      });
    }
  },

  batchComplete(
    operation: string,
    successCount: number,
    totalCount: number
  ): void {
    featureFlagsServerActionLogger.operation(
      `Batch ${operation}`,
      successCount === totalCount,
      {
        operation,
        successCount,
        totalCount,
        hasFailures: successCount < totalCount,
      }
    );
  },
};

/**
 * 📊 CACHE LOGGER - Para operaciones de cache
 */
export const featureFlagsCacheLogger = {
  ...createFeatureFlagsLogger("Cache"),

  cacheInvalidation(tags: string[], userId: string): void {
    featureFlagsServerActionLogger.info("Cache invalidation requested", {
      tags,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  cacheHit(key: string): void {
    if (process.env.NODE_ENV === "development") {
      featureFlagsPerformanceLogger.debug("Cache hit", { key });
    }
  },

  cacheMiss(key: string): void {
    if (process.env.NODE_ENV === "development") {
      featureFlagsPerformanceLogger.debug("Cache miss", { key });
    }
  },
};

// 🎯 ALL LOGGERS EXPORTED ABOVE
// (Individual logger instances are exported throughout the file)
