// 🎛️ FEATURE FLAGS FEATURE BARREL
// ===============================
// Entry point para la feature de feature flags (nueva arquitectura)

// 🎨 UI components
export { default as FeatureFlagsView } from "./ui/routes/index.screen";
export { FeatureFlagCard } from "./ui/components";

// 📊 Configuration
export { getFeatureFlagMetadata } from "./config";

// 🪝 Hooks personalizados
export {
  useFeatureFlagAdmin,
  useFeatureFlagStats,
  useNotifications,
} from "./hooks";

// 🏗️ Server (nueva arquitectura)
export { featureFlagService } from "./server";

// 🎯 Types
export type {
  FeatureFlagState,
  NotificationState,
  FeatureFlagStats,
  FeatureFlagCardData,
  FeatureFlagCategory,
} from "./types";

// 🔧 Utils
export {
  filterFeatureFlags,
  groupByCategory,
  getCategoryColors,
  getCategoryIcon,
  getNotificationStyles,
} from "./utils";

// 🔍 Schemas & Validation
export {
  CreateFeatureFlagSchema,
  UpdateFeatureFlagSchema,
  ToggleFeatureFlagSchema,
  FeatureFlagFiltersSchema,
  parseCreateFeatureFlag,
  parseUpdateFeatureFlag,
  parseToggleFeatureFlag,
  parseFeatureFlagFilters,
} from "./schemas";

export type {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
  ToggleFeatureFlagInput,
  FeatureFlagFilters,
} from "./schemas";

// ✅ Todas las funcionalidades están disponibles a través de la nueva arquitectura
// Para funciones del servidor usar: ./server/services/index.ts
