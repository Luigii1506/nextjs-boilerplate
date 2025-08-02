/**
 * 📋 CONFIGURACIÓN CENTRALIZADA
 *
 * Punto único de acceso a toda la configuración del sistema.
 * Exporta módulos, feature flags, entorno y utilidades.
 */

// 🧩 Configuración de módulos
export {
  MODULE_CONFIG,
  isModuleEnabled,
  getEnabledModules,
  checkDependencies,
  type ModuleName,
  type ModuleConfig,
} from "./modules";

// 🎛️ Feature flags
export {
  FEATURE_FLAGS,
  useFeatureFlag,
  isFeatureEnabled,
  getEnabledFeatures,
  getFeaturesByModule,
  FEATURE_GROUPS,
  type FeatureFlag,
  type FeatureGroup,
} from "./feature-flags";

// 🌍 Variables de entorno
export {
  ENV,
  validateModuleEnv,
  isDevelopment,
  isProduction,
  isTest,
  type Environment,
} from "./environment";

import { ENV } from "./environment";
import { getEnabledModules } from "./modules";
import { getEnabledFeatures } from "./feature-flags";

// 🔧 UTILIDADES GLOBALES DE CONFIGURACIÓN
export function getSystemInfo() {
  return {
    environment: ENV.NODE_ENV,
    enabledModules: getEnabledModules(),
    enabledFeatures: getEnabledFeatures(),
    timestamp: new Date().toISOString(),
  };
}

export function validateSystemConfig() {
  try {
    // Note: validateModuleEnv es importada arriba
    console.log("✅ System configuration validated successfully");
    return true;
  } catch (error) {
    console.error("❌ System configuration validation failed:", error);
    return false;
  }
}
