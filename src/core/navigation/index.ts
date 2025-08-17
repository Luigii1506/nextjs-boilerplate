/**
 * 📄 CORE NAVIGATION - INFRASTRUCTURE EXPORTS
 * ============================================
 *
 * Barrel exports para el sistema de navegación del core.
 * Infraestructura base del sistema - siempre disponible.
 *
 * Created: 2025-01-17 - Core navigation system
 */

// 🎯 Core Hooks (Infrastructure)
export {
  useNavigation,
  navigationSelectors,
  navigationUtils,
  type UseNavigationReturn,
  type NavigationHookConfig,
} from "./hooks";

// 📝 Types & Interfaces
export type {
  NavigationItem,
  UserRole,
  FeatureFlag,
  NavigationItemId,
  NavigationCategory,
  GeneratedModuleConfig,
} from "./constants";

export type { NavigationContext } from "./config";

// 🏗️ Core Configuration System
export {
  NavigationConfigManager,
  navigationConfig,
  navigationConfigUtils,
  type CoreNavigationConfig,
} from "./config";

// 📊 Core Constants
export {
  NAVIGATION_CORE_CONFIG,
  NAVIGATION_REGISTRY,
  NAVIGATION_CATEGORIES,
  NAVIGATION_STYLES,
  NavigationRegistryUtils,
} from "./constants";

// 🏗️ Core Service
export {
  CoreNavigationService,
  coreNavigationService,
  type FeatureFlagChecker,
  type NavigationFilterOptions,
  type NavigationServiceResult,
} from "./service";

// 🎯 Module Information
export const NAVIGATION_CORE_INFO = {
  name: "Navigation Core",
  version: "1.0.0",
  type: "core" as const,
  description: "Core navigation infrastructure for the system",
  location: "/src/core/navigation",
  author: "Enterprise Development Team",
  created: "2025-01-17",
  patterns: [
    "Core Infrastructure Pattern",
    "Configuration Manager",
    "Service Layer",
    "Hook Abstraction",
    "Singleton Pattern",
  ],
  features: [
    "Role-based navigation",
    "Feature flag integration",
    "Performance optimization",
    "Caching system",
    "TypeScript strict mode",
    "React 19 compliance",
    "Extensible registry",
  ],
} as const;
