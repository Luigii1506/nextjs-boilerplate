// 🏆 ENTERPRISE CONFIGURATION SYSTEM - Configurable, extensible, type-safe
// =========================================================================

import { ENTERPRISE_CONFIG } from "../constants";
import type { UploadConfig } from "../types";

// 🎯 Enterprise Configuration Types
export interface EnterpriseFileUploadConfig {
  // 🔧 Feature toggles
  features: {
    optimisticUI: boolean;
    advancedLogging: boolean;
    progressTracking: boolean;
    autoRefresh: boolean;
    retryOnFailure: boolean;
    backgroundSync: boolean;
    compressionEnabled: boolean;
  };

  // ⚡ Performance tuning
  performance: {
    debounceMs: number;
    maxRetries: number;
    cacheTimeout: number;
    maxConcurrentUploads: number;
    chunkSize: number;
    memoryThreshold: number;
  };

  // 🕐 Timing configuration
  timing: {
    uploadProgressDelay: number;
    clearCompletedDelay: number;
    retryDelayMs: number;
    backgroundRefreshInterval: number;
    connectionTimeout: number;
  };

  // 📊 UI/UX settings
  ui: {
    maxFilesPerBatch: number;
    maxFileSize: number;
    progressUpdateInterval: number;
    showDetailedProgress: boolean;
    animationDuration: number;
    toastTimeout: number;
  };

  // 🗂️ File handling
  files: {
    allowedMimeTypes: string[];
    forbiddenExtensions: string[];
    virusScanEnabled: boolean;
    metadataExtraction: boolean;
    imageOptimization: boolean;
  };

  // 🔒 Security settings
  security: {
    enableCSRF: boolean;
    maxRequestSize: number;
    allowedOrigins: string[];
    encryptFileNames: boolean;
    sanitizeMetadata: boolean;
  };

  // 📈 Monitoring & Analytics
  monitoring: {
    trackUploadMetrics: boolean;
    trackUserBehavior: boolean;
    errorReportingEnabled: boolean;
    performanceTracking: boolean;
  };
}

// 🏗️ Default Enterprise Configuration
const DEFAULT_ENTERPRISE_CONFIG: EnterpriseFileUploadConfig = {
  features: {
    optimisticUI: ENTERPRISE_CONFIG.enableOptimisticUI,
    advancedLogging: ENTERPRISE_CONFIG.enableAdvancedLogging,
    progressTracking: ENTERPRISE_CONFIG.enableProgressTracking,
    autoRefresh: ENTERPRISE_CONFIG.enableAutoRefresh,
    retryOnFailure: ENTERPRISE_CONFIG.enableRetryOnFailure,
    backgroundSync: false,
    compressionEnabled: false,
  },

  performance: {
    debounceMs: ENTERPRISE_CONFIG.debounceMs,
    maxRetries: ENTERPRISE_CONFIG.maxRetries,
    cacheTimeout: ENTERPRISE_CONFIG.cacheTimeout,
    maxConcurrentUploads: 3,
    chunkSize: 8 * 1024 * 1024, // 8MB
    memoryThreshold: 100 * 1024 * 1024, // 100MB
  },

  timing: {
    uploadProgressDelay: ENTERPRISE_CONFIG.uploadProgressDelay,
    clearCompletedDelay: ENTERPRISE_CONFIG.clearCompletedDelay,
    retryDelayMs: ENTERPRISE_CONFIG.retryDelayMs,
    backgroundRefreshInterval: ENTERPRISE_CONFIG.backgroundRefreshInterval,
    connectionTimeout: 30000,
  },

  ui: {
    maxFilesPerBatch: ENTERPRISE_CONFIG.maxFilesPerBatch,
    maxFileSize: ENTERPRISE_CONFIG.maxFileSize,
    progressUpdateInterval: ENTERPRISE_CONFIG.progressUpdateInterval,
    showDetailedProgress: true,
    animationDuration: 300,
    toastTimeout: 4000,
  },

  files: {
    allowedMimeTypes: [...ENTERPRISE_CONFIG.allowedMimeTypes],
    forbiddenExtensions: [".exe", ".bat", ".cmd", ".scr"],
    virusScanEnabled: false,
    metadataExtraction: true,
    imageOptimization: true,
  },

  security: {
    enableCSRF: true,
    maxRequestSize: 500 * 1024 * 1024, // 500MB
    allowedOrigins: [],
    encryptFileNames: false,
    sanitizeMetadata: true,
  },

  monitoring: {
    trackUploadMetrics: true,
    trackUserBehavior: false,
    errorReportingEnabled: true,
    performanceTracking: process.env.NODE_ENV === "development",
  },
};

// 🎯 Configuration Management Class
export class FileUploadConfigManager {
  private static instance: FileUploadConfigManager;
  private config: EnterpriseFileUploadConfig;
  private overrides: Partial<EnterpriseFileUploadConfig> = {};

  private constructor() {
    this.config = this.deepClone(DEFAULT_ENTERPRISE_CONFIG);
  }

  // 🏗️ Singleton pattern
  public static getInstance(): FileUploadConfigManager {
    if (!FileUploadConfigManager.instance) {
      FileUploadConfigManager.instance = new FileUploadConfigManager();
    }
    return FileUploadConfigManager.instance;
  }

  // 🔧 Deep clone utility for configuration
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // 🎯 Get full configuration with overrides applied
  public getConfig(): EnterpriseFileUploadConfig {
    return this.mergeConfigs(this.config, this.overrides);
  }

  // 🔄 Apply configuration overrides
  public setOverrides(overrides: Partial<EnterpriseFileUploadConfig>): void {
    this.overrides = this.deepClone(overrides);
  }

  // 🔧 Get specific configuration section
  public getFeatures() {
    return this.getConfig().features;
  }
  public getPerformance() {
    return this.getConfig().performance;
  }
  public getTiming() {
    return this.getConfig().timing;
  }
  public getUI() {
    return this.getConfig().ui;
  }
  public getFiles() {
    return this.getConfig().files;
  }
  public getSecurity() {
    return this.getConfig().security;
  }
  public getMonitoring() {
    return this.getConfig().monitoring;
  }

  // 🎯 Feature flag checks
  public isFeatureEnabled(
    feature: keyof EnterpriseFileUploadConfig["features"]
  ): boolean {
    return this.getFeatures()[feature];
  }

  // 🔄 Merge configurations recursively
  private mergeConfigs(
    base: EnterpriseFileUploadConfig,
    overrides: Partial<EnterpriseFileUploadConfig>
  ): EnterpriseFileUploadConfig {
    const result = this.deepClone(base);

    Object.keys(overrides).forEach((key) => {
      const typedKey = key as keyof EnterpriseFileUploadConfig;
      const override = overrides[typedKey];

      if (
        override &&
        typeof override === "object" &&
        !Array.isArray(override)
      ) {
        // Merge objects
        (result as unknown as Record<string, unknown>)[typedKey as string] = {
          ...result[typedKey],
          ...override,
        };
      } else if (override !== undefined) {
        // Direct assignment for primitives and arrays
        (result as unknown as Record<string, unknown>)[typedKey as string] =
          override;
      }
    });

    return result;
  }

  // 🎯 Validate configuration
  public validateConfig(): boolean {
    const config = this.getConfig();

    // Basic validation rules
    if (config.performance.maxRetries < 0) return false;
    if (config.ui.maxFileSize <= 0) return false;
    if (config.files.allowedMimeTypes.length === 0) return false;

    return true;
  }

  // 🔧 Reset to defaults
  public resetToDefaults(): void {
    this.overrides = {};
    this.config = this.deepClone(DEFAULT_ENTERPRISE_CONFIG);
  }

  // 📊 Get configuration summary for debugging
  public getConfigSummary() {
    const config = this.getConfig();
    return {
      featuresEnabled: Object.entries(config.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
      maxFileSize: `${Math.round(config.ui.maxFileSize / (1024 * 1024))}MB`,
      maxRetries: config.performance.maxRetries,
      allowedTypes: config.files.allowedMimeTypes.length,
      hasOverrides: Object.keys(this.overrides).length > 0,
    };
  }
}

// 🏗️ Global configuration instance
export const fileUploadConfig = FileUploadConfigManager.getInstance();

// 🎯 Hook-compatible config adapter
export function adaptConfigForHook(
  userConfig?: UploadConfig
): EnterpriseFileUploadConfig {
  const manager = FileUploadConfigManager.getInstance();

  if (userConfig) {
    // Apply user overrides
    const currentConfig = manager.getConfig();
    manager.setOverrides({
      ui: {
        ...currentConfig.ui,
        maxFileSize: userConfig.maxFileSize,
      },
      files: {
        ...currentConfig.files,
        allowedMimeTypes: userConfig.allowedTypes,
      },
    });
  }

  return manager.getConfig();
}

// 🔧 Development utilities
export const configUtils = {
  // Enable development mode
  enableDevMode: () => {
    const currentConfig = fileUploadConfig.getConfig();
    fileUploadConfig.setOverrides({
      features: { ...currentConfig.features, advancedLogging: true },
      monitoring: { ...currentConfig.monitoring, performanceTracking: true },
    });
  },

  // Enable production optimizations
  enableProdMode: () => {
    const currentConfig = fileUploadConfig.getConfig();
    fileUploadConfig.setOverrides({
      features: { ...currentConfig.features, advancedLogging: false },
      performance: { ...currentConfig.performance, maxConcurrentUploads: 5 },
      monitoring: { ...currentConfig.monitoring, performanceTracking: false },
    });
  },

  // Enable high-performance mode
  enableHighPerformance: () => {
    const currentConfig = fileUploadConfig.getConfig();
    fileUploadConfig.setOverrides({
      performance: {
        ...currentConfig.performance,
        maxConcurrentUploads: 10,
        chunkSize: 16 * 1024 * 1024, // 16MB
        debounceMs: 100,
      },
      timing: {
        ...currentConfig.timing,
        clearCompletedDelay: 1000,
      },
    });
  },
};
