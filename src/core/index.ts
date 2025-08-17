// 🏗️ CORE INDEX
// =============
// Exportaciones centralizadas de todos los módulos del core del sistema

// 🎛️ Administration - Features moved to src/features/admin/

// 🔧 Configuration (feature flags, environment, modules)
export * from "./config";

// 🧭 Navigation (infrastructure core)
export {
  useNavigation,
  navigationSelectors,
  navigationUtils,
  NavigationConfigManager,
  navigationConfig,
  navigationConfigUtils,
  CoreNavigationService,
  coreNavigationService,
  NAVIGATION_CORE_CONFIG,
  NAVIGATION_REGISTRY,
  NAVIGATION_CATEGORIES,
  NAVIGATION_STYLES,
  NavigationRegistryUtils,
  NAVIGATION_CORE_INFO,
  type NavigationItem,
  type UserRole as NavigationUserRole,
  type FeatureFlag as NavigationFeatureFlag,
  type NavigationContext,
  type NavigationItemId,
  type NavigationCategory,
  type GeneratedModuleConfig,
  type UseNavigationReturn,
  type NavigationHookConfig,
  type CoreNavigationConfig,
  type FeatureFlagChecker,
  type NavigationFilterOptions,
  type NavigationServiceResult,
} from "./navigation";

// 🧩 Components - Auth components moved to core/auth/components

// 🔐 Auth Core (solo exports públicos)
// export * from "./auth";  // Descomenta cuando tengas exports públicos

// 🗃️ Database (solo si necesitas exports públicos)
// export * from "./database";  // Por ejemplo, para tipos de Prisma
