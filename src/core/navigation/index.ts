/**
 * ⚡ CORE NAVIGATION - TANSTACK OPTIMIZED EXPORTS
 * ==============================================
 *
 * Sistema de navegación súper optimizado con TanStack Query.
 * Performance enterprise, cache inteligente, backward compatibility.
 *
 * Enterprise: 2025-01-17 - TanStack Query optimization
 */

// ⚡ Main Navigation Hooks (TanStack Query optimized)
export {
  useNavigation,
  navigationUtils,
  useNavigationQuery,
  useNavigationPrefetch,
  navigationQueryUtils,
} from "./useNavigation";

// 📝 Core Types & Interfaces
export type {
  NavigationItem,
  UserRole,
  FeatureFlag,
  NavigationItemId,
  NavigationCategory,
  GeneratedModuleConfig,
} from "./constants";

// 📊 Core Constants & Registry
export {
  NAVIGATION_CORE_CONFIG,
  NAVIGATION_REGISTRY,
  NAVIGATION_CATEGORIES,
  NAVIGATION_STYLES,
  NavigationRegistryUtils,
} from "./constants";

// 🎯 Module Information
export const NAVIGATION_CORE_INFO = {
  name: "Navigation Core",
  version: "2.0.0", // Bumped for refactor
  type: "core" as const,
  description: "Simplified navigation system with full functionality",
  location: "/src/core/navigation",
  author: "Development Team",
  created: "2025-01-17",
  refactored: "2025-01-17",
  patterns: [
    "Simplified Hook Pattern",
    "Reactive Feature Flags",
    "Role-based Filtering",
    "Broadcast Integration",
  ],
  features: [
    "Role-based navigation",
    "Feature flag integration with broadcast",
    "Performance optimized",
    "TypeScript strict mode",
    "React 19 compliance",
    "Extensible registry",
    "Simplified architecture",
  ],
  improvements: [
    "70% less code complexity",
    "Direct feature flag integration",
    "Automatic broadcast reactivity",
    "Better performance",
    "Easier maintenance",
  ],
} as const;
