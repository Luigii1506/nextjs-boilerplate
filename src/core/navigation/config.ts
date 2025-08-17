/**
 * ⚙️ CORE NAVIGATION CONFIG - INFRASTRUCTURE
 * ===========================================
 *
 * Configuration Manager para navegación del core del sistema.
 * Infraestructura base - sin feature flags, configuraciones siempre disponibles.
 *
 * Created: 2025-01-17 - Core navigation configuration
 */

import {
  NAVIGATION_CORE_CONFIG,
  type NavigationItem,
  type UserRole,
} from "./constants";

// 🏗️ Core Navigation Config Interface (sin feature flags)
export interface CoreNavigationConfig {
  performance: {
    debounceMs: number;
    cacheTimeout: number;
  };
  ui: {
    maxMenuItems: number;
    animationDuration: number;
  };
  settings: {
    advancedLogging: boolean;
    performanceTracking: boolean;
    accessibilityMode: boolean;
  };
}

// 🎯 User Navigation Context
export interface NavigationContext {
  userId: string;
  userRole: UserRole;
  isAuthenticated: boolean;
  availableFeatures: Set<string>;
}

// 🏗️ CORE NAVIGATION CONFIG MANAGER (Singleton - Infraestructura)
export class NavigationConfigManager {
  private static instance: NavigationConfigManager;
  private config: CoreNavigationConfig;
  private overrides: Partial<CoreNavigationConfig> = {};
  private navigationCache = new Map<string, NavigationItem[]>();

  private constructor() {
    this.config = this.createDefaultConfig();
  }

  public static getInstance(): NavigationConfigManager {
    if (!NavigationConfigManager.instance) {
      NavigationConfigManager.instance = new NavigationConfigManager();
    }
    return NavigationConfigManager.instance;
  }

  // 🔧 Default configuration
  private createDefaultConfig(): CoreNavigationConfig {
    return {
      performance: {
        debounceMs: NAVIGATION_CORE_CONFIG.debounceMs,
        cacheTimeout: NAVIGATION_CORE_CONFIG.cacheTimeout,
      },
      ui: {
        maxMenuItems: NAVIGATION_CORE_CONFIG.maxMenuItems,
        animationDuration: NAVIGATION_CORE_CONFIG.animationDuration,
      },
      settings: {
        advancedLogging: NAVIGATION_CORE_CONFIG.advancedLogging,
        performanceTracking: NAVIGATION_CORE_CONFIG.performanceTracking,
        accessibilityMode: NAVIGATION_CORE_CONFIG.accessibilityMode,
      },
    };
  }

  // 🏗️ Get current configuration
  public getConfig(): CoreNavigationConfig {
    return this.mergeConfigs(this.config, this.overrides);
  }

  // 🔄 Set configuration overrides
  public setOverrides(overrides: Partial<CoreNavigationConfig>): void {
    this.overrides = this.deepClone(overrides);
    this.clearCache();
  }

  // 🏗️ Core infrastructure - configuraciones siempre disponibles
  public getPerformanceSetting(
    key: keyof CoreNavigationConfig["performance"]
  ): number {
    return this.getConfig().performance[key];
  }

  public isSettingEnabled(
    key: keyof CoreNavigationConfig["settings"]
  ): boolean {
    return this.getConfig().settings[key];
  }

  // 🎯 Navigation-specific methods
  public getMaxMenuItems(): number {
    return this.getConfig().ui.maxMenuItems;
  }

  public getAnimationDuration(): number {
    return this.getConfig().ui.animationDuration;
  }

  // 🗂️ Cache management
  public cacheNavigation(key: string, items: NavigationItem[]): void {
    this.navigationCache.set(key, items);
  }

  public getCachedNavigation(key: string): NavigationItem[] | undefined {
    return this.navigationCache.get(key);
  }

  public clearCache(): void {
    this.navigationCache.clear();
  }

  // 🎨 Configuration summary for debugging
  public getConfigSummary(): Record<string, unknown> {
    const config = this.getConfig();
    return {
      performance: config.performance,
      ui: config.ui,
      settings: config.settings,
      cacheSize: this.navigationCache.size,
      hasOverrides: Object.keys(this.overrides).length > 0,
    };
  }

  // 🔧 Utility methods
  private mergeConfigs(
    base: CoreNavigationConfig,
    overrides: Partial<CoreNavigationConfig>
  ): CoreNavigationConfig {
    const result = this.deepClone(base) as unknown as Record<string, unknown>;

    Object.keys(overrides).forEach((key) => {
      const typedKey = key as keyof CoreNavigationConfig;
      const override = overrides[typedKey];

      if (
        override &&
        typeof override === "object" &&
        !Array.isArray(override)
      ) {
        result[key as string] = {
          ...((result[key as string] as Record<string, unknown>) || {}),
          ...override,
        };
      } else {
        result[key as string] = override;
      }
    });

    return result as unknown as CoreNavigationConfig;
  }

  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array)
      return obj.map((item) => this.deepClone(item)) as unknown as T;
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
export const navigationConfig = NavigationConfigManager.getInstance();

// 🎯 Configuration utilities for development
export const navigationConfigUtils = {
  // Enable high performance mode
  enableHighPerformance: () => {
    navigationConfig.setOverrides({
      performance: {
        debounceMs: 50,
        cacheTimeout: 30 * 60 * 1000, // 30 minutes
      },
      ui: {
        maxMenuItems: 50,
        animationDuration: 100,
      },
    });
  },

  // Enable accessibility mode
  enableAccessibilityMode: () => {
    navigationConfig.setOverrides({
      settings: {
        advancedLogging: true,
        performanceTracking: true,
        accessibilityMode: true,
      },
      ui: {
        animationDuration: 300, // Slower for accessibility
        maxMenuItems: 15, // Less items for clarity
      },
    });
  },

  // Reset to defaults
  resetToDefaults: () => {
    navigationConfig.setOverrides({});
  },
};

