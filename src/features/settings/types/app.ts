/**
 * 🔧 APP CONFIGURATION TYPES
 * ==========================
 *
 * Tipos para la configuración general de la aplicación.
 * Incluye branding, features, y configuraciones de performance.
 */

// App general settings
export interface AppGeneralSettings {
  name: string;
  description: string;
  version: string;
  environment: "development" | "staging" | "production";
  debug: boolean;
  maintenanceMode: boolean;
  timezone: string;
  language: string;
  currency: string;
}

// Branding settings
export interface AppBrandingSettings {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  customCss?: string;
  footerText?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

// Feature flags settings
export interface AppFeatureSettings {
  userRegistration: boolean;
  socialLogin: boolean;
  emailVerification: boolean;
  twoFactorAuth: boolean;
  auditTrail: boolean;
  fileUpload: boolean;
  notifications: boolean;
  darkModeToggle: boolean;
  publicApi: boolean;
  webhooks: boolean;
  analytics: boolean;
  internationalization: boolean;
}

// Performance settings
export interface AppPerformanceSettings {
  cacheEnabled: boolean;
  cacheTtl: number; // seconds
  rateLimit: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number; // seconds
  compressionEnabled: boolean;
  minifyAssets: boolean;
  lazyLoading: boolean;
  infiniteScroll: boolean;
  batchSize: number;
  maxFileSize: number; // MB
  sessionTimeout: number; // minutes
}

// Security settings
export interface AppSecuritySettings {
  forceHttps: boolean;
  corsEnabled: boolean;
  corsOrigins: string[];
  cspEnabled: boolean;
  cspDirectives: Record<string, string>;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sessionSecure: boolean;
  cookieSecure: boolean;
  trustProxy: boolean;
}

// SEO settings
export interface AppSeoSettings {
  sitemapEnabled: boolean;
  robotsEnabled: boolean;
  structuredDataEnabled: boolean;
  ogTagsEnabled: boolean;
  twitterCardsEnabled: boolean;
  canonicalUrls: boolean;
  redirects: Array<{
    from: string;
    to: string;
    permanent: boolean;
  }>;
}

// App configuration combined
export interface AppConfiguration {
  general: AppGeneralSettings;
  branding: AppBrandingSettings;
  features: AppFeatureSettings;
  performance: AppPerformanceSettings;
  security: AppSecuritySettings;
  seo: AppSeoSettings;
}

// App configuration with metadata
export interface AppConfigurationWithMeta extends AppConfiguration {
  id: string;
  environment: "development" | "staging" | "production";
  version: string;
  lastModified: Date;
  modifiedBy: string;
  isActive: boolean;
  backupId?: string;
}

// App settings validation rules
export const APP_SETTINGS_VALIDATION = {
  general: {
    name: { required: true, minLength: 1, maxLength: 100 },
    description: { maxLength: 500 },
    version: { required: true, pattern: /^\d+\.\d+\.\d+$/ },
    timezone: { required: true },
  },
  branding: {
    primaryColor: { required: true, pattern: /^#[0-9A-F]{6}$/i },
    secondaryColor: { required: true, pattern: /^#[0-9A-F]{6}$/i },
    accentColor: { required: true, pattern: /^#[0-9A-F]{6}$/i },
    metaTitle: { maxLength: 60 },
    metaDescription: { maxLength: 160 },
  },
  performance: {
    cacheTtl: { min: 60, max: 86400 }, // 1 minute to 1 day
    rateLimitRequests: { min: 1, max: 10000 },
    rateLimitWindow: { min: 1, max: 3600 }, // 1 second to 1 hour
    batchSize: { min: 10, max: 1000 },
    maxFileSize: { min: 1, max: 100 }, // 1MB to 100MB
    sessionTimeout: { min: 5, max: 1440 }, // 5 minutes to 24 hours
  },
  security: {
    passwordMinLength: { min: 6, max: 128 },
    maxLoginAttempts: { min: 3, max: 20 },
    lockoutDuration: { min: 1, max: 1440 }, // 1 minute to 24 hours
    corsOrigins: {
      pattern: /^https?:\/\/.+$/,
      errorMessage: "Must be valid URLs starting with http:// or https://",
    },
  },
} as const;

// Default app configuration
export const DEFAULT_APP_CONFIG: AppConfiguration = {
  general: {
    name: "My App",
    description: "Enterprise application built with Next.js",
    version: "1.0.0",
    environment: "development",
    debug: true,
    maintenanceMode: false,
    timezone: "UTC",
    language: "en",
    currency: "USD",
  },
  branding: {
    primaryColor: "#3B82F6",
    secondaryColor: "#6366F1",
    accentColor: "#F59E0B",
    darkMode: false,
    footerText: "© 2025 My App. All rights reserved.",
  },
  features: {
    userRegistration: true,
    socialLogin: true,
    emailVerification: true,
    twoFactorAuth: false,
    auditTrail: true,
    fileUpload: true,
    notifications: true,
    darkModeToggle: true,
    publicApi: false,
    webhooks: false,
    analytics: false,
    internationalization: false,
  },
  performance: {
    cacheEnabled: true,
    cacheTtl: 3600, // 1 hour
    rateLimit: true,
    rateLimitRequests: 100,
    rateLimitWindow: 900, // 15 minutes
    compressionEnabled: true,
    minifyAssets: true,
    lazyLoading: true,
    infiniteScroll: true,
    batchSize: 50,
    maxFileSize: 10, // 10MB
    sessionTimeout: 60, // 1 hour
  },
  security: {
    forceHttps: true,
    corsEnabled: true,
    corsOrigins: [],
    cspEnabled: true,
    cspDirectives: {
      "default-src": "'self'",
      "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src": "'self' 'unsafe-inline'",
      "img-src": "'self' data: https:",
    },
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    sessionSecure: true,
    cookieSecure: true,
    trustProxy: false,
  },
  seo: {
    sitemapEnabled: true,
    robotsEnabled: true,
    structuredDataEnabled: true,
    ogTagsEnabled: true,
    twitterCardsEnabled: true,
    canonicalUrls: true,
    redirects: [],
  },
};

// App settings sections for UI
export const APP_SETTINGS_SECTIONS = [
  {
    id: "general",
    name: "general",
    label: "General Settings",
    description: "Basic application configuration",
    icon: "Settings",
    settings: [
      "app.name",
      "app.description",
      "app.version",
      "app.environment",
      "app.debug",
      "app.maintenanceMode",
      "app.timezone",
      "app.language",
      "app.currency",
    ],
    order: 1,
  },
  {
    id: "branding",
    name: "branding",
    label: "Branding & UI",
    description: "Visual appearance and branding",
    icon: "Palette",
    settings: [
      "app.logoUrl",
      "app.faviconUrl",
      "app.primaryColor",
      "app.secondaryColor",
      "app.accentColor",
      "app.darkMode",
      "app.customCss",
      "app.footerText",
    ],
    order: 2,
  },
  {
    id: "features",
    name: "features",
    label: "Feature Flags",
    description: "Enable or disable application features",
    icon: "Flag",
    settings: [
      "app.userRegistration",
      "app.socialLogin",
      "app.emailVerification",
      "app.twoFactorAuth",
      "app.auditTrail",
      "app.fileUpload",
      "app.notifications",
      "app.darkModeToggle",
      "app.publicApi",
      "app.webhooks",
      "app.analytics",
      "app.internationalization",
    ],
    order: 3,
  },
  {
    id: "performance",
    name: "performance",
    label: "Performance",
    description: "Performance optimization settings",
    icon: "Zap",
    settings: [
      "app.cacheEnabled",
      "app.cacheTtl",
      "app.rateLimit",
      "app.rateLimitRequests",
      "app.rateLimitWindow",
      "app.compressionEnabled",
      "app.minifyAssets",
      "app.lazyLoading",
      "app.infiniteScroll",
      "app.batchSize",
      "app.maxFileSize",
      "app.sessionTimeout",
    ],
    order: 4,
  },
  {
    id: "security",
    name: "security",
    label: "Security",
    description: "Security and access control settings",
    icon: "Shield",
    settings: [
      "app.forceHttps",
      "app.corsEnabled",
      "app.corsOrigins",
      "app.cspEnabled",
      "app.cspDirectives",
      "app.passwordMinLength",
      "app.passwordRequireUppercase",
      "app.passwordRequireLowercase",
      "app.passwordRequireNumbers",
      "app.passwordRequireSymbols",
      "app.maxLoginAttempts",
      "app.lockoutDuration",
      "app.sessionSecure",
      "app.cookieSecure",
      "app.trustProxy",
    ],
    order: 5,
  },
  {
    id: "seo",
    name: "seo",
    label: "SEO & Meta",
    description: "Search engine optimization settings",
    icon: "Search",
    settings: [
      "app.metaTitle",
      "app.metaDescription",
      "app.ogImageUrl",
      "app.sitemapEnabled",
      "app.robotsEnabled",
      "app.structuredDataEnabled",
      "app.ogTagsEnabled",
      "app.twitterCardsEnabled",
      "app.canonicalUrls",
      "app.redirects",
    ],
    order: 6,
  },
] as const;
