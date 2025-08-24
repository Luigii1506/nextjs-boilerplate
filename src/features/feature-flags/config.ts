/**
 * 🎛️ FEATURE FLAGS CONFIGURATION
 * ===============================
 *
 * Simple, unified, environment-based configuration.
 * Single source of truth for all feature flags.
 *
 * Simple: 2025-01-17 - Unified configuration
 */

// 🎯 SINGLE SOURCE OF TRUTH
export const FEATURE_FLAGS = {
  // 🔥 CORE FEATURES (always enabled)
  authentication: true,
  roleBasedAccess: true,
  userManagement: true,
  dashboard: true,
  notifications: true,

  // 🧩 MODULE FEATURES (environment-based)
  fileUpload: process.env.FEATURE_FILE_UPLOAD !== "false", // Default true
  payments: process.env.FEATURE_PAYMENTS === "true",
  inventory: process.env.FEATURE_INVENTORY === "true",
  ecommerce: process.env.FEATURE_ECOMMERCE === "true",
  aiIntegration: process.env.FEATURE_AI === "true",
  analytics: process.env.FEATURE_ANALYTICS === "true",

  // 🎨 UI FEATURES
  darkMode: process.env.FEATURE_DARK_MODE === "true",
  i18n: process.env.FEATURE_I18N === "true",

  // 🧪 EXPERIMENTAL
  betaFeatures: process.env.NODE_ENV === "development",
  debugMode: process.env.NODE_ENV === "development",

  // 🔧 ADMIN FEATURES
  advancedUserManagement: true,
  systemLogs: process.env.FEATURE_SYSTEM_LOGS === "true",
  dataExport: process.env.FEATURE_DATA_EXPORT === "true",
  auditTrail: process.env.FEATURE_AUDIT_TRAIL === "true",
  settings: process.env.FEATURE_SETTINGS === "true",
} as const;

// 🎨 Categories for UI organization
export const FEATURE_CATEGORIES = {
  core: {
    name: "Core Features",
    description: "Essential system functionality",
    color: "blue",
    icon: "Shield",
    flags: [
      "authentication",
      "roleBasedAccess",
      "userManagement",
      "dashboard",
      "notifications",
    ],
  },
  module: {
    name: "Module Features",
    description: "Optional modules and integrations",
    color: "green",
    icon: "Package",
    flags: [
      "fileUpload",
      "payments",
      "inventory",
      "ecommerce",
      "aiIntegration",
      "analytics",
    ],
  },
  experimental: {
    name: "Experimental",
    description: "Beta features and experiments",
    color: "yellow",
    icon: "Flask",
    flags: ["betaFeatures", "debugMode"],
  },
  admin: {
    name: "Admin Features",
    description: "Administrative functionality",
    color: "purple",
    icon: "Settings",
    flags: [
      "advancedUserManagement",
      "systemLogs",
      "dataExport",
      "auditTrail",
      "settings",
    ],
  },
  ui: {
    name: "UI Features",
    description: "User interface and experience features",
    color: "orange",
    icon: "Palette",
    flags: ["darkMode", "i18n", "animations", "notifications"],
  },
} as const;

// 🔍 Utilities
export const getFeatureCategory = (
  flagKey: string
): keyof typeof FEATURE_CATEGORIES => {
  for (const [category, config] of Object.entries(FEATURE_CATEGORIES)) {
    if ((config.flags as readonly string[]).includes(flagKey)) {
      return category as keyof typeof FEATURE_CATEGORIES;
    }
  }
  return "core";
};

export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

export const getEnabledFeatures = (): Array<keyof typeof FEATURE_FLAGS> => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag as keyof typeof FEATURE_FLAGS);
};

export const getFeaturesByCategory = (
  category: keyof typeof FEATURE_CATEGORIES
) => {
  return FEATURE_CATEGORIES[category].flags.filter(
    (flag) => FEATURE_FLAGS[flag as keyof typeof FEATURE_FLAGS]
  );
};
