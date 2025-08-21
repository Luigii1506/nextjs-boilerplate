/**
 * 📋 CONFIGURACIÓN CENTRALIZADA
 *
 * Punto único de acceso a toda la configuración del sistema.
 * Exporta módulos, feature flags, entorno y utilidades.
 */

// 🎛️ Feature flags (from consolidated system)
export {
  FEATURE_FLAGS,
  FEATURE_CATEGORIES,
  getFeatureCategory,
  isFeatureEnabled,
  getEnabledFeatures,
  getFeaturesByCategory,
} from "../feature-flags/config";

export type { FeatureFlag, FeatureCategory } from "../feature-flags/types";

// 🌍 Variables de entorno
export {
  ENV,
  getEnv,
  validateEnvironment,
  getDatabaseConfig,
  getAuthConfig,
  getUploadConfig,
  getDeploymentConfig,
  EMAIL_CONFIG,
  ANALYTICS_CONFIG,
  DEBUG_CONFIG,
  STRIPE_CONFIG,
  ECOMMERCE_CONFIG,
} from "./environment";

// 🚀 CONFIGURACIÓN SIMPLIFICADA
export const CONFIG_INFO = {
  name: "NextJS Enterprise Boilerplate",
  version: "1.0.0",
  description: "Enterprise-grade Next.js boilerplate with modular architecture",
} as const;
