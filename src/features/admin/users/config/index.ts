/**
 * 👥 USERS CORE CONFIG MANAGER
 * =============================
 *
 * Configuration Manager para el módulo CORE de usuarios
 * Sin feature flags - Todas las funcionalidades siempre activas
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import { USERS_CORE_CONFIG } from "../constants";

// 🏗️ Core Module Configuration Interface (Sin feature flags)
export interface UsersModuleConfig {
  // ⚡ Performance settings (siempre activas)
  performance: {
    debounceMs: number;
    maxRetries: number;
    cacheTimeout: number;
    refreshDelayMs: number;
    retryDelayMs: number;
  };

  // 📊 UI Configuration (siempre disponible)
  ui: {
    itemsPerPage: number;
    maxUsersPerBatch: number;
    updateInterval: number;
    searchMinChars: number;
  };

  // 🔧 Core settings (siempre habilitadas)
  settings: {
    advancedLogging: boolean;
    performanceTracking: boolean;
    optimisticUpdates: boolean;
    autoRefresh: boolean;
  };

  // 🛡️ Security settings (críticas - siempre activas)
  security: {
    maxLoginAttempts: number;
    banDurationHours: number;
    sessionTimeout: number;
  };

  // 📧 Validation rules (siempre aplicadas)
  validation: {
    email: {
      minLength: number;
      maxLength: number;
      pattern: RegExp;
    };
    name: {
      minLength: number;
      maxLength: number;
    };
    password: {
      minLength: number;
      maxLength: number;
    };
  };
}

// 🎯 Default configuration for Core module
const DEFAULT_CORE_CONFIG: UsersModuleConfig = {
  performance: {
    debounceMs: USERS_CORE_CONFIG.debounceMs,
    maxRetries: USERS_CORE_CONFIG.maxRetries,
    cacheTimeout: USERS_CORE_CONFIG.cacheTimeout,
    refreshDelayMs: USERS_CORE_CONFIG.refreshDelayMs,
    retryDelayMs: USERS_CORE_CONFIG.retryDelayMs,
  },
  ui: {
    itemsPerPage: USERS_CORE_CONFIG.itemsPerPage,
    maxUsersPerBatch: USERS_CORE_CONFIG.maxUsersPerBatch,
    updateInterval: USERS_CORE_CONFIG.updateInterval,
    searchMinChars: USERS_CORE_CONFIG.searchMinChars,
  },
  settings: {
    advancedLogging: USERS_CORE_CONFIG.advancedLogging,
    performanceTracking: USERS_CORE_CONFIG.performanceTracking,
    optimisticUpdates: USERS_CORE_CONFIG.optimisticUpdates,
    autoRefresh: USERS_CORE_CONFIG.autoRefresh,
  },
  security: {
    maxLoginAttempts: USERS_CORE_CONFIG.maxLoginAttempts,
    banDurationHours: USERS_CORE_CONFIG.banDurationHours,
    sessionTimeout: USERS_CORE_CONFIG.sessionTimeout,
  },
  validation: USERS_CORE_CONFIG.validation,
};

/**
 * 🏗️ USERS CORE CONFIG MANAGER
 *
 * Maneja la configuración centralizada para el módulo CORE de usuarios.
 * Como es un módulo crítico, NO tiene feature flags - todo siempre activo.
 *
 * Características:
 * - ✅ Singleton pattern para instancia única
 * - ✅ Deep merge para configuración personalizada
 * - ✅ Performance settings siempre disponibles
 * - ✅ Security settings no modificables externamente
 * - ✅ Validation rules consistentes
 * - ✅ Environment-aware configuration
 */
export class UsersConfigManager {
  private static instance: UsersConfigManager;
  private config: UsersModuleConfig;
  private overrides: Partial<UsersModuleConfig> = {};

  private constructor() {
    this.config = this.deepClone(DEFAULT_CORE_CONFIG);
  }

  public static getInstance(): UsersConfigManager {
    if (!UsersConfigManager.instance) {
      UsersConfigManager.instance = new UsersConfigManager();
    }
    return UsersConfigManager.instance;
  }

  // 🎯 Get complete configuration
  public getConfig(): UsersModuleConfig {
    return {
      ...this.config,
      ...this.overrides,
      performance: {
        ...this.config.performance,
        ...(this.overrides.performance || {}),
      },
      ui: {
        ...this.config.ui,
        ...(this.overrides.ui || {}),
      },
      settings: {
        ...this.config.settings,
        ...(this.overrides.settings || {}),
      },
      security: this.config.security, // Security never overrideable
      validation: {
        ...this.config.validation,
        ...(this.overrides.validation || {}),
      },
    };
  }

  // ⚙️ Set configuration overrides (excluyendo security por seguridad)
  public setOverrides(
    overrides: Partial<Omit<UsersModuleConfig, "security">>
  ): void {
    // 🛡️ Security settings no pueden ser overrideadas
    const safeOverrides = this.deepClone(overrides);
    this.overrides = safeOverrides as Partial<UsersModuleConfig>;
  }

  // 🏗️ Métodos específicos para módulos Core

  // ⚡ Performance getters (siempre disponibles)
  public getPerformanceSetting<
    K extends keyof UsersModuleConfig["performance"]
  >(key: K): UsersModuleConfig["performance"][K] {
    return this.getConfig().performance[key];
  }

  // 📊 UI getters (siempre disponibles)
  public getUISetting<K extends keyof UsersModuleConfig["ui"]>(
    key: K
  ): UsersModuleConfig["ui"][K] {
    return this.getConfig().ui[key];
  }

  // 🔧 Settings getters (siempre habilitadas)
  public isSettingEnabled<K extends keyof UsersModuleConfig["settings"]>(
    key: K
  ): boolean {
    return this.getConfig().settings[key] as boolean;
  }

  // 🛡️ Security getters (inmutables)
  public getSecuritySetting<K extends keyof UsersModuleConfig["security"]>(
    key: K
  ): UsersModuleConfig["security"][K] {
    return this.config.security[key]; // Siempre usar original, no merged
  }

  // 📧 Validation getters
  public getValidationRule<K extends keyof UsersModuleConfig["validation"]>(
    key: K
  ): UsersModuleConfig["validation"][K] {
    return this.getConfig().validation[key];
  }

  // 🔄 Configuration management methods
  public resetToDefaults(): void {
    this.overrides = {};
  }

  public getConfigSummary(): Record<string, unknown> {
    const config = this.getConfig();
    return {
      performanceTracking: config.settings.performanceTracking,
      optimisticUpdates: config.settings.optimisticUpdates,
      autoRefresh: config.settings.autoRefresh,
      itemsPerPage: config.ui.itemsPerPage,
      cacheTimeout: config.performance.cacheTimeout,
      advancedLogging: config.settings.advancedLogging,
    };
  }

  // 🎯 Environment-specific configurations
  public enableDevMode(): void {
    this.setOverrides({
      settings: {
        ...this.config.settings,
        advancedLogging: true,
        performanceTracking: true,
      },
      performance: {
        ...this.config.performance,
        cacheTimeout: 60 * 1000, // 1 minute for dev
      },
    });
  }

  public enableProductionMode(): void {
    this.setOverrides({
      settings: {
        ...this.config.settings,
        advancedLogging: false,
        performanceTracking: true, // Keep for monitoring
      },
      performance: {
        ...this.config.performance,
        cacheTimeout: 15 * 60 * 1000, // 15 minutes for production
      },
    });
  }

  public enableHighPerformanceMode(): void {
    this.setOverrides({
      performance: {
        ...this.config.performance,
        cacheTimeout: 30 * 60 * 1000, // 30 minutes
        debounceMs: 150, // Faster debounce
        maxRetries: 2, // Less retries for speed
      },
      ui: {
        ...this.config.ui,
        itemsPerPage: 50, // More items per page
        updateInterval: 200, // Faster updates
      },
    } as Partial<UsersModuleConfig>);
  }

  // 🛠️ Utility methods
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  private mergeConfigs<T extends Record<string, unknown>>(
    base: T,
    override: Partial<T>
  ): T {
    const result = this.deepClone(base as T);

    for (const key in override) {
      const typedKey = key as keyof T;
      const baseValue = result[typedKey];
      const overrideValue = override[key];

      if (overrideValue === null || overrideValue === undefined) {
        continue;
      }

      if (
        typeof baseValue === "object" &&
        typeof overrideValue === "object" &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue) &&
        baseValue !== null &&
        overrideValue !== null
      ) {
        result[typedKey] = this.mergeConfigs(
          baseValue as Record<string, unknown>,
          overrideValue as Record<string, unknown>
        ) as T[keyof T];
      } else {
        result[typedKey] = overrideValue as T[keyof T];
      }
    }

    return result;
  }
}

// 🎯 Global instance
export const usersConfig = UsersConfigManager.getInstance();

// 🔧 Hook configuration adapter
export function adaptConfigForHook(
  userConfig?: Partial<UsersModuleConfig>
): UsersModuleConfig {
  const currentConfig = usersConfig.getConfig();

  if (!userConfig) {
    return currentConfig;
  }

  // Use the global instance instead of creating a new one
  const tempManager = UsersConfigManager.getInstance();
  tempManager.setOverrides(userConfig);
  const result = tempManager.getConfig();
  tempManager.resetToDefaults(); // Reset after use
  return result;
}

// 🛠️ Configuration utilities
export const configUtils = {
  // 🔧 Development helpers
  enableDevMode: () => usersConfig.enableDevMode(),
  enableProductionMode: () => usersConfig.enableProductionMode(),
  enableHighPerformanceMode: () => usersConfig.enableHighPerformanceMode(),

  // 🎯 Quick accessors
  getItemsPerPage: () => usersConfig.getUISetting("itemsPerPage"),
  getCacheTimeout: () => usersConfig.getPerformanceSetting("cacheTimeout"),
  getDebounceMs: () => usersConfig.getPerformanceSetting("debounceMs"),

  // 🔍 Feature checks (todas siempre true para Core modules)
  isOptimisticUpdatesEnabled: () =>
    usersConfig.isSettingEnabled("optimisticUpdates"),
  isAutoRefreshEnabled: () => usersConfig.isSettingEnabled("autoRefresh"),
  isPerformanceTrackingEnabled: () =>
    usersConfig.isSettingEnabled("performanceTracking"),
  isAdvancedLoggingEnabled: () =>
    usersConfig.isSettingEnabled("advancedLogging"),

  // 🛡️ Security accessors
  getMaxLoginAttempts: () => usersConfig.getSecuritySetting("maxLoginAttempts"),
  getBanDuration: () => usersConfig.getSecuritySetting("banDurationHours"),
  getSessionTimeout: () => usersConfig.getSecuritySetting("sessionTimeout"),

  // 📧 Validation accessors
  getEmailValidation: () => usersConfig.getValidationRule("email"),
  getNameValidation: () => usersConfig.getValidationRule("name"),
  getPasswordValidation: () => usersConfig.getValidationRule("password"),

  // 📊 Summary
  getSummary: () => usersConfig.getConfigSummary(),
};
