// 🎛️ FEATURE FLAGS MODULE
// =======================
// Patrón directo simplificado (como users) - sin complejidad enterprise

// 🎨 UI Components
export { default as FeatureFlagsView } from "./ui/routes/index.screen";
export { FeatureFlagCard } from "./ui/components";

// 🏗️ Server Actions (Patrón Directo)
export {
  getAllFeatureFlagsServerAction,
  toggleFeatureFlagServerAction,
} from "./server/actions";

// 🎯 Types esenciales
export type {
  FeatureFlagDomain,
  FeatureFlagCardData,
  FeatureFlagStats,
} from "./types";

// 🎨 Configuración de categorías
export { CATEGORY_CONFIG } from "./config/categories";

// 🔧 Utils básicos
export { getCategoryColors, getCategoryIcon } from "./utils";

// 📊 Constants básicos
export { FEATURE_FLAGS_CACHE_TAGS, FEATURE_FLAGS_PATHS } from "./constants";
