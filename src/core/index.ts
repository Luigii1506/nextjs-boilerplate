// 🏗️ CORE INDEX
// =============
// Exportaciones centralizadas de todos los módulos del core del sistema

// 🎛️ Administration - Features moved to src/features/admin/

// 🔧 Configuration (feature flags, environment, modules)
export * from "./config";

// 🧭 Navigation (TanStack Query optimized)
export {
  useNavigation,
  useNavigationQuery,
  useNavigationPrefetch,
  navigationQueryUtils,
  NAVIGATION_QUERY_KEYS,
  NAVIGATION_CORE_CONFIG,
  NAVIGATION_REGISTRY,
  NAVIGATION_CATEGORIES,
  NAVIGATION_STYLES,
  NavigationRegistryUtils,
  NAVIGATION_CORE_INFO,
  type NavigationItem,
  type UserRole as NavigationUserRole,
  type FeatureFlag as NavigationFeatureFlag,
  type NavigationItemId,
  type NavigationCategory,
  type GeneratedModuleConfig,
} from "./navigation";

// 🧩 Components - Auth components moved to core/auth/components

// 🔐 Auth Core (solo exports públicos)
// export * from "./auth";  // Descomenta cuando tengas exports públicos

// 🗃️ Database (solo si necesitas exports públicos)
// export * from "./database";  // Por ejemplo, para tipos de Prisma
