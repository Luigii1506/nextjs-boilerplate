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
  storefront: process.env.FEATURE_STOREFRONT === "true",
  pos: process.env.FEATURE_POS === "true",
  ecommerce: process.env.FEATURE_ECOMMERCE === "true",
  suppliers: process.env.FEATURE_SUPPLIERS === "true",
  aiIntegration: process.env.FEATURE_AI === "true",
  analytics: process.env.FEATURE_ANALYTICS === "true",

  // 🔗 INTEGRATIONS
  paymentGateways: process.env.FEATURE_PAYMENT_GATEWAYS === "true",
  shippingIntegration: process.env.FEATURE_SHIPPING === "true",
  emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS === "true",

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

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

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
      "storefront",
      "pos",
      "ecommerce",
      "suppliers",
      "aiIntegration",
      "analytics",
      "paymentGateways",
      "shippingIntegration",
      "emailNotifications",
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

// 🔗 FEATURE DEPENDENCIES SYSTEM
export const FEATURE_DEPENDENCIES: FeatureDependencies = {
  pos: ["inventory"], // POS requiere Inventory
  ecommerce: ["inventory", "payments"], // E-commerce requiere Inventory + Payments
  suppliers: ["inventory"], // Suppliers requiere Inventory
  shippingIntegration: ["ecommerce"], // Shipping requiere E-commerce
  emailNotifications: ["ecommerce", "pos"], // Emails requiere ventas
  paymentGateways: ["payments"],
} as const;

export type FeatureDependencies = {
  [key in FeatureFlag]?: readonly FeatureFlag[];
};

// 🔍 Validation utilities
export function validateFeatureDependencies(
  feature: keyof typeof FEATURE_DEPENDENCIES,
  enabledFeatures: readonly string[]
): boolean {
  const dependencies = FEATURE_DEPENDENCIES[feature] || [];
  return dependencies.every((dep) => enabledFeatures.includes(dep));
}

export function getFeatureDependencies(
  feature: keyof typeof FEATURE_DEPENDENCIES
): readonly string[] {
  return FEATURE_DEPENDENCIES[feature] || [];
}

export function getDependentFeatures(
  feature: FeatureFlag
): Array<keyof typeof FEATURE_DEPENDENCIES> {
  const result: Array<keyof typeof FEATURE_DEPENDENCIES> = [];

  for (const [key, dependencies] of Object.entries(FEATURE_DEPENDENCIES)) {
    if ((dependencies as readonly FeatureFlag[]).includes(feature)) {
      result.push(key as keyof typeof FEATURE_DEPENDENCIES);
    }
  }

  return result;
}
