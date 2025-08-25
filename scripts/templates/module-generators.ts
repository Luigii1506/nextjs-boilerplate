/**
 * 🎨 ENTERPRISE MODULE TEMPLATES
 * ==============================
 *
 * Templates para generar archivos de módulos siguiendo patrones Enterprise.
 * Incluye templates para módulos Core y Feature Flag.
 *
 * Created: 2025-01-17 - Enterprise Module Generator
 */

import fs from "fs-extra";
import path from "path";

interface ModuleConfig {
  name: string;
  displayName: string;
  description: string;
  type: "core" | "feature";
  icon: string;
  route: string;
  requiredRole: "user" | "admin" | "super_admin" | "none";
  category: "core" | "feature" | "admin";
  order: number;
  prismaFields: PrismaField[];
}

interface PrismaField {
  name: string;
  type: "String" | "Int" | "Boolean" | "DateTime" | "Json";
  optional: boolean;
  unique: boolean;
  default?: string;
}

// 🎯 Operation Types for generated hooks
export type OperationInput = Record<string, unknown>;
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 📊 GENERAR CONSTANTS
 */
export async function generateConstants(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "constants/index.ts";
  const filePath = path.join(basePath, fileName);

  const content =
    config.type === "feature"
      ? generateFeatureFlagConstants(config)
      : generateCoreConstants(config);

  await fs.writeFile(filePath, content);
}

function generateFeatureFlagConstants(config: ModuleConfig): string {
  const moduleName = config.name.toUpperCase().replace(/-/g, "_");
  const camelCaseName = toCamelCase(config.name);

  return `/**
 * 📊 ${config.displayName.toUpperCase()} - ENTERPRISE CONSTANTS
 * ${"=".repeat(50)}
 * 
 * Configuración centralizada para el módulo ${config.displayName}.
 * Módulo con Feature Flags - experimental/opcional.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } module
 */

// 🔧 ENTERPRISE CONFIG (con feature flags)
export const ENTERPRISE_CONFIG = {
  // 🔧 Feature flags (módulo experimental/opcional)
  enableOptimisticUI: true,
  enableAdvancedLogging: process.env.NODE_ENV === "development",
  enableProgressTracking: true,
  enableAutoRefresh: true,
  enableCaching: true,
  enablePerformanceMetrics: process.env.NODE_ENV === "development",

  // ⚡ Performance settings
  debounceMs: 300,
  maxRetries: 3,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  requestTimeout: 30 * 1000, // 30 seconds

  // 🕐 Timing constants
  refreshDelayMs: 1000,
  retryDelayMs: 1000,
  optimisticDelayMs: 50,
  clearCompletedDelay: 2000,

  // 📊 UI Constants
  itemsPerPage: 20,
  maxItemsPerBatch: 10,
  maxItemSize: 50 * 1024 * 1024, // 50MB
  progressUpdateInterval: 100,

  // 🔧 Module-specific settings
  enableBatchOperations: true,
  enableRealTimeUpdates: true,
  enableOfflineSupport: false,
} as const;

// Action constants - TIPADOS Y CENTRALIZADOS
export const ${moduleName}_ACTIONS = {
  START_OPERATION: "START_OPERATION",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  COMPLETE_OPERATION: "COMPLETE_OPERATION",
  FAIL_OPERATION: "FAIL_OPERATION",
  CLEAR_COMPLETED: "CLEAR_COMPLETED",
  REFRESH_DATA: "REFRESH_DATA",
} as const;

// Status constants
export const ${moduleName}_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
  CANCELLED: "cancelled",
} as const;

// Default providers/handlers
export const DEFAULT_PROVIDERS = {
  storage: "local",
  processor: "standard",
  validator: "default",
} as const;

// Cache tags para revalidation
export const CACHE_TAGS = {
  DATA: "${camelCaseName}-data",
  STATS: "${camelCaseName}-stats",
  CATEGORIES: "${camelCaseName}-categories",
  USER_DATA: "${camelCaseName}-user-data",
} as const;

// Logging levels y prefijos
export const LOG_LEVELS = {
  INFO: "info",
  ERROR: "error",
  DEBUG: "debug",
  WARN: "warn",
  PERFORMANCE: "performance",
} as const;

export const LOG_PREFIXES = {
  HOOK: "[${config.displayName}Hook]",
  SERVER: "[${config.displayName}Server]",
  OPTIMISTIC: "[${config.displayName}Optimistic]",
  CACHE: "[${config.displayName}Cache]",
  CONFIG: "[${config.displayName}Config]",
} as const;

// 🎯 Helper Types
export type ${toPascalCase(
    config.name
  )}Action = keyof typeof ${moduleName}_ACTIONS;
export type ${toPascalCase(
    config.name
  )}Status = (typeof ${moduleName}_STATUS)[keyof typeof ${moduleName}_STATUS];
export type ${toPascalCase(
    config.name
  )}Provider = keyof typeof DEFAULT_PROVIDERS;
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];`;
}

function generateCoreConstants(config: ModuleConfig): string {
  const moduleName = config.name.toUpperCase().replace(/-/g, "_");
  const camelCaseName = toCamelCase(config.name);

  return `/**
 * 🏗️ ${config.displayName.toUpperCase()} - CORE CONSTANTS
 * ${"=".repeat(50)}
 * 
 * Configuración centralizada para el módulo ${config.displayName}.
 * Módulo Core - crítico/esencial, siempre activo.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } core module
 */

// 🏗️ CORE CONFIG (siempre activo - infraestructura base)
export const CORE_CONFIG = {
  // ⚡ Performance settings (sin feature flags)
  debounceMs: 300,
  maxRetries: 3,
  cacheTimeout: 10 * 60 * 1000, // 10 minutes
  requestTimeout: 30 * 1000, // 30 seconds

  // 🕐 Timing constants
  refreshDelayMs: 1000,
  retryDelayMs: 1000,
  updateInterval: 200,

  // 📊 UI Constants
  itemsPerPage: 20,
  maxItemSize: 100 * 1024 * 1024, // 100MB
  maxConcurrentOperations: 5,

  // 🔧 Core features (siempre habilitadas)
  advancedLogging: process.env.NODE_ENV === "development",
  performanceTracking: true,
  errorReporting: true,
  accessibilityMode: true,

  // 🏗️ Infrastructure settings
  enableCaching: true,
  enableRealTimeUpdates: true,
  enableBatchOperations: true,
} as const;

// Action constants - TIPADOS Y CENTRALIZADOS
export const ${moduleName}_ACTIONS = {
  FETCH_DATA: "FETCH_DATA",
  CREATE_ITEM: "CREATE_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  DELETE_ITEM: "DELETE_ITEM",
  REFRESH_DATA: "REFRESH_DATA",
  CLEAR_CACHE: "CLEAR_CACHE",
} as const;

// Status constants
export const ${moduleName}_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  UPDATING: "updating",
} as const;

// Cache tags para revalidation
export const CACHE_TAGS = {
  DATA: "${camelCaseName}-data",
  STATS: "${camelCaseName}-stats",
  CATEGORIES: "${camelCaseName}-categories",
  USER_DATA: "${camelCaseName}-user-data",
  SYSTEM_DATA: "${camelCaseName}-system",
} as const;

// Logging levels y prefijos
export const LOG_LEVELS = {
  INFO: "info",
  ERROR: "error",
  DEBUG: "debug",
  WARN: "warn",
  PERFORMANCE: "performance",
} as const;

export const LOG_PREFIXES = {
  HOOK: "[${config.displayName}Hook]",
  SERVER: "[${config.displayName}Server]",
  SERVICE: "[${config.displayName}Service]",
  CACHE: "[${config.displayName}Cache]",
  CONFIG: "[${config.displayName}Config]",
} as const;

// 🎯 Helper Types
export type ${toPascalCase(
    config.name
  )}Action = keyof typeof ${moduleName}_ACTIONS;
export type ${toPascalCase(
    config.name
  )}Status = (typeof ${moduleName}_STATUS)[keyof typeof ${moduleName}_STATUS];
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];`;
}

/**
 * ⚙️ GENERAR CONFIG
 */
export async function generateConfig(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "config/index.ts";
  const filePath = path.join(basePath, fileName);

  const content =
    config.type === "feature"
      ? generateFeatureFlagConfig(config)
      : generateCoreConfig(config);

  await fs.writeFile(filePath, content);
}

function generateFeatureFlagConfig(config: ModuleConfig): string {
  const pascalName = toPascalCase(config.name);

  return `/**
 * ⚙️ ${config.displayName.toUpperCase()} CONFIG - FEATURE FLAGS
 * ${"=".repeat(50)}
 * 
 * Configuration Manager para ${config.displayName} con feature flags.
 * Módulo experimental/opcional - puede ser deshabilitado.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } configuration
 */

import { ENTERPRISE_CONFIG } from "../constants";

// 🔧 ${pascalName} Config Interface (con feature flags)
export interface Enterprise${pascalName}Config {
  features: {
    optimisticUI: boolean;
    advancedLogging: boolean;
    progressTracking: boolean;
    autoRefresh: boolean;
    caching: boolean;
    performanceMetrics: boolean;
  };
  performance: {
    debounceMs: number;
    maxRetries: number;
    cacheTimeout: number;
    requestTimeout: number;
  };
  ui: {
    itemsPerPage: number;
    maxItemsPerBatch: number;
    maxItemSize: number;
  };
  timing: {
    refreshDelayMs: number;
    retryDelayMs: number;
    optimisticDelayMs: number;
  };
}

// 🔧 Default configuration
const DEFAULT_CONFIG: Enterprise${pascalName}Config = {
  features: {
    optimisticUI: ENTERPRISE_CONFIG.enableOptimisticUI,
    advancedLogging: ENTERPRISE_CONFIG.enableAdvancedLogging,
    progressTracking: ENTERPRISE_CONFIG.enableProgressTracking,
    autoRefresh: ENTERPRISE_CONFIG.enableAutoRefresh,
    caching: ENTERPRISE_CONFIG.enableCaching,
    performanceMetrics: ENTERPRISE_CONFIG.enablePerformanceMetrics,
  },
  performance: {
    debounceMs: ENTERPRISE_CONFIG.debounceMs,
    maxRetries: ENTERPRISE_CONFIG.maxRetries,
    cacheTimeout: ENTERPRISE_CONFIG.cacheTimeout,
    requestTimeout: ENTERPRISE_CONFIG.requestTimeout,
  },
  ui: {
    itemsPerPage: ENTERPRISE_CONFIG.itemsPerPage,
    maxItemsPerBatch: ENTERPRISE_CONFIG.maxItemsPerBatch,
    maxItemSize: ENTERPRISE_CONFIG.maxItemSize,
  },
  timing: {
    refreshDelayMs: ENTERPRISE_CONFIG.refreshDelayMs,
    retryDelayMs: ENTERPRISE_CONFIG.retryDelayMs,
    optimisticDelayMs: ENTERPRISE_CONFIG.optimisticDelayMs,
  },
};

// 🏗️ ${pascalName} CONFIG MANAGER (Singleton Pattern - Feature Flags)
export class ${pascalName}ConfigManager {
  private static instance: ${pascalName}ConfigManager;
  private config: Enterprise${pascalName}Config;
  private overrides: Partial<Enterprise${pascalName}Config> = {};

  private constructor() {
    this.config = this.deepClone(DEFAULT_CONFIG);
  }

  public static getInstance(): ${pascalName}ConfigManager {
    if (!${pascalName}ConfigManager.instance) {
      ${pascalName}ConfigManager.instance = new ${pascalName}ConfigManager();
    }
    return ${pascalName}ConfigManager.instance;
  }

  public getConfig(): Enterprise${pascalName}Config {
    return this.mergeConfigs(this.config, this.overrides);
  }

  public setOverrides(overrides: Partial<Enterprise${pascalName}Config>): void {
    this.overrides = this.deepClone(overrides);
  }

  // 🎯 Para feature flags
  public isFeatureEnabled(
    feature: keyof Enterprise${pascalName}Config["features"]
  ): boolean {
    return this.getConfig().features[feature];
  }

  public getPerformanceSetting(
    key: keyof Enterprise${pascalName}Config["performance"]
  ): number {
    return this.getConfig().performance[key];
  }

  public getUISetting(
    key: keyof Enterprise${pascalName}Config["ui"]
  ): number {
    return this.getConfig().ui[key];
  }

  public getConfigSummary(): Record<string, unknown> {
    const config = this.getConfig();
    return {
      features: config.features,
      performance: config.performance,
      ui: config.ui,
      timing: config.timing,
      hasOverrides: Object.keys(this.overrides).length > 0,
    };
  }

  public validateConfig(): boolean {
    const config = this.getConfig();
    
    // Validaciones básicas
    if (config.performance.debounceMs < 0) return false;
    if (config.performance.maxRetries < 1) return false;
    if (config.ui.itemsPerPage < 1) return false;
    
    return true;
  }

  // 🔧 Utility methods
  private mergeConfigs(
    base: Enterprise${pascalName}Config,
    overrides: Partial<Enterprise${pascalName}Config>
  ): Enterprise${pascalName}Config {
    const result = this.deepClone(base) as unknown as Record<string, unknown>;

    Object.keys(overrides).forEach((key) => {
      const typedKey = key as keyof Enterprise${pascalName}Config;
      const override = overrides[typedKey];
      
      if (override && typeof override === "object" && !Array.isArray(override)) {
        result[key as string] = {
          ...((result[key as string] as Record<string, unknown>) || {}),
          ...override,
        };
      } else {
        result[key as string] = override;
      }
    });

    return result as unknown as Enterprise${pascalName}Config;
  }

  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item)) as unknown as T;
    if (typeof obj === "object") {
      const copy = {} as Record<string, unknown>;
      Object.keys(obj).forEach((key) => {
        copy[key] = this.deepClone((obj as Record<string, unknown>)[key]);
      });
      return copy as T;
    }
    return obj;
  }
}

// 🚀 Singleton instance
export const ${toCamelCase(
    config.name
  )}Config = ${pascalName}ConfigManager.getInstance();

// 🎯 Adapter para hooks (permite overrides del usuario)
export function adaptConfigForHook(
  userConfig?: Partial<Enterprise${pascalName}Config>
): Enterprise${pascalName}Config {
  const manager = ${pascalName}ConfigManager.getInstance();
  
  if (userConfig) {
    const currentConfig = manager.getConfig();
    return manager.mergeConfigs(currentConfig, userConfig);
  }
  
  return manager.getConfig();
}

// 🎯 Configuration utilities para desarrollo
export const configUtils = {
  // Enable high performance mode
  enableHighPerformance: () => {
    ${toCamelCase(config.name)}Config.setOverrides({
      performance: {
        debounceMs: 100,
        maxRetries: 5,
        cacheTimeout: 30 * 60 * 1000, // 30 minutes
        requestTimeout: 60 * 1000, // 60 seconds
      },
      features: {
        optimisticUI: true,
        caching: true,
        performanceMetrics: true,
        progressTracking: true,
        advancedLogging: false, // Disable in high perf
        autoRefresh: true,
      },
    });
  },

  // Enable development mode
  enableDevelopmentMode: () => {
    ${toCamelCase(config.name)}Config.setOverrides({
      features: {
        advancedLogging: true,
        performanceMetrics: true,
        optimisticUI: true,
        progressTracking: true,
        caching: false, // Fresh data in dev
        autoRefresh: true,
      },
      performance: {
        debounceMs: 500, // Slower for debugging
        maxRetries: 1,
        cacheTimeout: 1 * 60 * 1000, // 1 minute
        requestTimeout: 10 * 1000, // 10 seconds
      },
    });
  },

  // Reset to defaults
  resetToDefaults: () => {
    ${toCamelCase(config.name)}Config.setOverrides({});
  },
};`;
}

function generateCoreConfig(config: ModuleConfig): string {
  const pascalName = toPascalCase(config.name);

  return `/**
 * ⚙️ ${config.displayName.toUpperCase()} CONFIG - CORE INFRASTRUCTURE
 * ${"=".repeat(50)}
 * 
 * Configuration Manager para ${config.displayName} core.
 * Infraestructura base - sin feature flags, configuraciones siempre disponibles.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } core configuration
 */

import { CORE_CONFIG } from "../constants";

// 🏗️ Core ${pascalName} Config Interface (sin feature flags)
export interface Core${pascalName}Config {
  performance: {
    debounceMs: number;
    maxRetries: number;
    cacheTimeout: number;
    requestTimeout: number;
  };
  ui: {
    itemsPerPage: number;
    maxItemSize: number;
    maxConcurrentOperations: number;
  };
  settings: {
    advancedLogging: boolean;
    performanceTracking: boolean;
    errorReporting: boolean;
    accessibilityMode: boolean;
  };
  infrastructure: {
    enableCaching: boolean;
    enableRealTimeUpdates: boolean;
    enableBatchOperations: boolean;
  };
}

// 🏗️ Default configuration
const DEFAULT_CORE_CONFIG: Core${pascalName}Config = {
  performance: {
    debounceMs: CORE_CONFIG.debounceMs,
    maxRetries: CORE_CONFIG.maxRetries,
    cacheTimeout: CORE_CONFIG.cacheTimeout,
    requestTimeout: CORE_CONFIG.requestTimeout,
  },
  ui: {
    itemsPerPage: CORE_CONFIG.itemsPerPage,
    maxItemSize: CORE_CONFIG.maxItemSize,
    maxConcurrentOperations: CORE_CONFIG.maxConcurrentOperations,
  },
  settings: {
    advancedLogging: CORE_CONFIG.advancedLogging,
    performanceTracking: CORE_CONFIG.performanceTracking,
    errorReporting: CORE_CONFIG.errorReporting,
    accessibilityMode: CORE_CONFIG.accessibilityMode,
  },
  infrastructure: {
    enableCaching: CORE_CONFIG.enableCaching,
    enableRealTimeUpdates: CORE_CONFIG.enableRealTimeUpdates,
    enableBatchOperations: CORE_CONFIG.enableBatchOperations,
  },
};

// 🏗️ CORE ${pascalName.toUpperCase()} CONFIG MANAGER (Singleton - Infrastructure)
export class Core${pascalName}ConfigManager {
  private static instance: Core${pascalName}ConfigManager;
  private config: Core${pascalName}Config;
  private overrides: Partial<Core${pascalName}Config> = {};

  private constructor() {
    this.config = this.deepClone(DEFAULT_CORE_CONFIG);
  }

  public static getInstance(): Core${pascalName}ConfigManager {
    if (!Core${pascalName}ConfigManager.instance) {
      Core${pascalName}ConfigManager.instance = new Core${pascalName}ConfigManager();
    }
    return Core${pascalName}ConfigManager.instance;
  }

  public getConfig(): Core${pascalName}Config {
    return this.mergeConfigs(this.config, this.overrides);
  }

  public setOverrides(overrides: Partial<Core${pascalName}Config>): void {
    this.overrides = this.deepClone(overrides);
  }

  // 🏗️ Core infrastructure - configuraciones siempre disponibles
  public getPerformanceSetting(
    key: keyof Core${pascalName}Config["performance"]
  ): number {
    return this.getConfig().performance[key];
  }

  public isSettingEnabled(key: keyof Core${pascalName}Config["settings"]): boolean {
    return this.getConfig().settings[key];
  }

  public isInfrastructureEnabled(
    key: keyof Core${pascalName}Config["infrastructure"]
  ): boolean {
    return this.getConfig().infrastructure[key];
  }

  public getUISetting(key: keyof Core${pascalName}Config["ui"]): number {
    return this.getConfig().ui[key];
  }

  public getConfigSummary(): Record<string, unknown> {
    const config = this.getConfig();
    return {
      performance: config.performance,
      ui: config.ui,
      settings: config.settings,
      infrastructure: config.infrastructure,
      hasOverrides: Object.keys(this.overrides).length > 0,
    };
  }

  // 🔧 Utility methods
  private mergeConfigs(
    base: Core${pascalName}Config,
    overrides: Partial<Core${pascalName}Config>
  ): Core${pascalName}Config {
    const result = this.deepClone(base) as unknown as Record<string, unknown>;

    Object.keys(overrides).forEach((key) => {
      const typedKey = key as keyof Core${pascalName}Config;
      const override = overrides[typedKey];
      
      if (override && typeof override === "object" && !Array.isArray(override)) {
        result[key as string] = {
          ...((result[key as string] as Record<string, unknown>) || {}),
          ...override,
        };
      } else {
        result[key as string] = override;
      }
    });

    return result as unknown as Core${pascalName}Config;
  }

  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item)) as unknown as T;
    if (typeof obj === "object") {
      const copy = {} as Record<string, unknown>;
      Object.keys(obj).forEach((key) => {
        copy[key] = this.deepClone((obj as Record<string, unknown>)[key]);
      });
      return copy as T;
    }
    return obj;
  }
}

// 🚀 Singleton instance
export const core${pascalName}Config = Core${pascalName}ConfigManager.getInstance();

// 🎯 Configuration utilities para desarrollo
export const ${toCamelCase(config.name)}ConfigUtils = {
  // Enable high performance mode
  enableHighPerformance: () => {
    core${pascalName}Config.setOverrides({
      performance: {
        debounceMs: 50,
        maxRetries: 5,
        cacheTimeout: 30 * 60 * 1000, // 30 minutes
        requestTimeout: 60 * 1000, // 60 seconds
      },
      infrastructure: {
        enableCaching: true,
        enableRealTimeUpdates: true,
        enableBatchOperations: true,
      },
    });
  },

  // Enable accessibility mode
  enableAccessibilityMode: () => {
    core${pascalName}Config.setOverrides({
      settings: {
        advancedLogging: true,
        performanceTracking: true,
        errorReporting: true,
        accessibilityMode: true,
      },
      ui: {
        itemsPerPage: 10, // Less items for accessibility
        maxItemSize: 50 * 1024 * 1024, // 50MB
        maxConcurrentOperations: 2, // Less concurrent for stability
      },
    });
  },

  // Reset to defaults
  resetToDefaults: () => {
    core${pascalName}Config.setOverrides({});
  },
};`;
}

/**
 * 📝 GENERAR LOGGER
 */
export async function generateLogger(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "utils/logger.ts";
  const filePath = path.join(basePath, fileName);

  const configImport =
    config.type === "feature" ? "ENTERPRISE_CONFIG" : "CORE_CONFIG";
  const pascalName = toPascalCase(config.name);

  const content = `/**
 * 📝 ${config.displayName.toUpperCase()} LOGGER - ENTERPRISE SYSTEM
 * ${"=".repeat(50)}
 * 
 * Sistema de logging estructurado para ${config.displayName}.
 * Enterprise Logger con múltiples niveles y contexto.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } logging
 */

import { ${configImport}, LOG_LEVELS, LOG_PREFIXES } from "../constants";

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type LogContext = Record<string, unknown>;

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  module: string;
  sessionId: string;
}

// 🏗️ ENTERPRISE LOGGER CLASS
class EnterpriseLogger {
  private module: string;
  private sessionId: string;
  private performanceMarks: Map<string, number> = new Map();

  constructor(module: string) {
    this.module = module;
    this.sessionId = \`session-\${Date.now()}-\${Math.random()
      .toString(36)
      .substr(2, 9)}\`;
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors and warnings
    if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) return true;
    
    // Check configuration
    ${
      config.type === "feature"
        ? `return ${configImport}.enableAdvancedLogging;`
        : `return ${configImport}.advancedLogging;`
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      module: this.module,
      sessionId: this.sessionId,
    };
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const entry = this.createLogEntry(LOG_LEVELS.INFO, message, context);
    console.log(\`🏆 \${this.module} \${message}\`, context || "");
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    
    const entry = this.createLogEntry(LOG_LEVELS.DEBUG, message, context);
    console.debug(\`🔍 \${this.module} \${message}\`, context || "");
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LOG_LEVELS.WARN, message, context);
    console.warn(\`⚠️ \${this.module} \${message}\`, context || "");
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const enhancedContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };

    const entry = this.createLogEntry(LOG_LEVELS.ERROR, message, enhancedContext);
    console.error(\`❌ \${this.module} \${message}\`, enhancedContext);
  }

  // 🎯 Enterprise: Performance timing
  timeStart(label: string): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      this.performanceMarks.set(label, performance.now());
      console.time(\`⏱️ \${this.module} \${label}\`);
    }
  }

  timeEnd(label: string): number | null {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return null;

    const startTime = this.performanceMarks.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(label);
      console.timeEnd(\`⏱️ \${this.module} \${label}\`);
      
      // Log performance metrics
      this.info(\`Performance: \${label} completed\`, {
        duration: \`\${duration.toFixed(2)}ms\`,
        label,
      });
      
      return duration;
    }
    
    console.timeEnd(\`⏱️ \${this.module} \${label}\`);
    return null;
  }

  // 🎯 Enterprise: Grouped logging
  group(title: string): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.group(\`🗂️ \${this.module} \${title}\`);
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.groupEnd();
    }
  }
}

// 🏗️ Factory function
export function createLogger(module: string): EnterpriseLogger {
  return new EnterpriseLogger(\`\${LOG_PREFIXES.HOOK} \${module}\`);
}

// 🎯 Pre-configured loggers
export const ${toCamelCase(config.name)}Logger = createLogger("Hook");
export const ${toCamelCase(
    config.name
  )}ServerActionLogger = createLogger("ServerAction");
export const ${toCamelCase(
    config.name
  )}OptimisticLogger = createLogger("Optimistic");
export const ${toCamelCase(config.name)}CacheLogger = createLogger("Cache");
export const ${toCamelCase(config.name)}ConfigLogger = createLogger("Config");

// 🚀 Default export
export default {
  createLogger,
  ${toCamelCase(config.name)}Logger,
  ${toCamelCase(config.name)}ServerActionLogger,
  ${toCamelCase(config.name)}OptimisticLogger,
  ${toCamelCase(config.name)}CacheLogger,
  ${toCamelCase(config.name)}ConfigLogger,
};`;

  await fs.writeFile(filePath, content);
}

/**
 * 🎯 GENERAR REDUCER
 */
export async function generateReducer(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "reducers/index.ts";
  const filePath = path.join(basePath, fileName);

  const actionsImport = `${config.name
    .toUpperCase()
    .replace(/-/g, "_")}_ACTIONS`;
  const pascalName = toPascalCase(config.name);

  const content = `/**
 * 🎯 ${config.displayName.toUpperCase()} REDUCERS - OPTIMISTIC STATE
 * ${"=".repeat(50)}
 * 
 * Manejo de estado optimista para ${config.displayName}.
 * Estado inmutable con selectors y analytics integradas.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } state management
 */

import { ${actionsImport} } from "../constants";
import { ${toCamelCase(config.name)}OptimisticLogger } from "../utils/logger";

// 🎯 Base Item Interface
export interface ${pascalName}Item {
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

// 🎯 Optimistic State Interface
export interface Optimistic${pascalName}State {
  items: ${pascalName}Item[];
  lastUpdated: string;
  totalActiveItems: number;
  totalCompletedItems: number;
  overallProgress: number;
  sessionId: string;
}

// 🎯 Action Types
export type Optimistic${pascalName}Action =
  | {
      type: typeof ${actionsImport}.START_OPERATION;
      items: Partial<${pascalName}Item>[];
      tempIds: string[];
    }
  | {
      type: typeof ${actionsImport}.UPDATE_PROGRESS;
      itemId: string;
      progress: number;
      metadata?: Record<string, unknown>;
    }
  | {
      type: typeof ${actionsImport}.COMPLETE_OPERATION;
      itemId: string;
      result?: unknown;
    }
  | {
      type: typeof ${actionsImport}.FAIL_OPERATION;
      itemId: string;
      error: string;
    }
  | {
      type: typeof ${actionsImport}.CLEAR_COMPLETED;
    }
  | {
      type: typeof ${actionsImport}.REFRESH_DATA;
      data: ${pascalName}Item[];
    };

// 🎯 INITIAL STATE FACTORY
export function createInitialOptimistic${pascalName}State(): Optimistic${pascalName}State {
  return {
    items: [],
    lastUpdated: new Date().toISOString(),
    totalActiveItems: 0,
    totalCompletedItems: 0,
    overallProgress: 0,
    sessionId: \`session-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
  };
}

// 🎯 ENTERPRISE OPTIMISTIC REDUCER
export function optimistic${pascalName}Reducer(
  state: Optimistic${pascalName}State,
  action: Optimistic${pascalName}Action
): Optimistic${pascalName}State {
  ${toCamelCase(
    config.name
  )}OptimisticLogger.debug(\`Optimistic action: \${action.type}\`, {
    currentItems: state.items.length,
    activeItems: state.totalActiveItems,
    completedItems: state.totalCompletedItems,
    sessionId: state.sessionId,
  });

  switch (action.type) {
    case ${actionsImport}.START_OPERATION: {
      const newItems = action.tempIds.map((tempId, index) => ({
        id: tempId,
        progress: 0,
        status: "pending" as const,
        name: action.items[index]?.name || \`Item \${index + 1}\`,
        createdAt: new Date().toISOString(),
        metadata: action.items[index]?.metadata,
      }));

      const updatedItems = [...state.items, ...newItems];
      const nextState: Optimistic${pascalName}State = {
        ...state,
        items: updatedItems,
        lastUpdated: new Date().toISOString(),
        totalActiveItems: updatedItems.filter((item) => item.status === "pending" || item.status === "processing").length,
        totalCompletedItems: updatedItems.filter((item) => item.status === "completed").length,
        overallProgress: updatedItems.length === 0 ? 0 : Math.round(updatedItems.reduce((sum, item) => sum + item.progress, 0) / updatedItems.length),
      };

      return nextState;
    }

    default:
      return state;
  }
}

// 🎯 SELECTOR FUNCTIONS
export const optimistic${pascalName}Selectors = {
  getItems: (state: Optimistic${pascalName}State) => state.items,
  getActiveItems: (state: Optimistic${pascalName}State) =>
    state.items.filter((item) => item.status === "pending" || item.status === "processing"),
  getCompletedItems: (state: Optimistic${pascalName}State) =>
    state.items.filter((item) => item.status === "completed"),
  hasActiveItems: (state: Optimistic${pascalName}State) => state.totalActiveItems > 0,
  getOverallProgress: (state: Optimistic${pascalName}State) => state.overallProgress,
  getStats: (state: Optimistic${pascalName}State) => ({
    total: state.items.length,
    active: state.totalActiveItems,
    completed: state.totalCompletedItems,
    errors: state.items.filter((item) => item.status === "error").length,
    progress: state.overallProgress,
    lastUpdated: state.lastUpdated,
    sessionId: state.sessionId,
  }),
};

// 🚀 Export default reducer
export default optimistic${pascalName}Reducer;`;

  await fs.writeFile(filePath, content);
}

/**
 * 🏆 GENERAR HOOK
 */
export async function generateHook(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = `hooks/use${
    config.type === "core" ? "Core" : ""
  }${toPascalCase(config.name)}.ts`;
  const filePath = path.join(basePath, fileName);

  const content =
    config.type === "feature"
      ? generateFeatureFlagHook(config)
      : generateCoreHook(config);

  await fs.writeFile(filePath, content);
}

function generateFeatureFlagHook(config: ModuleConfig): string {
  const pascalName = toPascalCase(config.name);
  const camelName = toCamelCase(config.name);

  return `/**
 * 🔧 USE ${config.displayName.toUpperCase()} - FEATURE FLAG HOOK
 * ${"=".repeat(50)}
 * 
 * Hook principal para ${config.displayName} con feature flags.
 * React 19 compliance con performance optimization.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } hook
 */

"use client";

import {
  useActionState,
  useOptimistic,
  useCallback,
  useMemo,
  useRef,
  useTransition,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/shared/hooks/useAuth";

export function use${pascalName}() {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performOperation = useCallback(async (input: OperationInput): Promise<OperationResult> => {
    setIsLoading(true);
    try {
      // TODO: Implement operation logic
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      return { success: false, error: "Error" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    // TODO: Implement refresh logic
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return {
    data,
    isLoading,
    error,
    performOperation,
    refresh,
    stats: {
      total: data.length,
      active: 0,
      completed: 0,
      errors: 0,
    },
  };
}

export default use${pascalName};`;
}

function generateCoreHook(config: ModuleConfig): string {
  const pascalName = toPascalCase(config.name);

  return `/**
 * 🏗️ USE CORE ${config.displayName.toUpperCase()} - CORE HOOK
 * ${"=".repeat(50)}
 * 
 * Hook principal para ${config.displayName} core.
 * React 19 compliance - infraestructura siempre activa.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } core hook
 */

"use client";

import {
  useActionState,
  useOptimistic,
  useCallback,
  useMemo,
  useRef,
  useTransition,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/shared/hooks/useAuth";

export function useCore${pascalName}() {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performOperation = useCallback(async (input: OperationInput): Promise<OperationResult> => {
    setIsLoading(true);
    try {
      // TODO: Implement operation logic
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      return { success: false, error: "Error" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    // TODO: Implement refresh logic
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return {
    data,
    isLoading,
    error,
    performOperation,
    refresh,
    stats: {
      total: data.length,
      active: 0,
      completed: 0,
      errors: 0,
    },
  };
}

export default useCore${pascalName};`;
}

// 🎯 Utility functions
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
