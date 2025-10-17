// 🌍 ENVIRONMENT CONFIGURATION
// ============================
// Configuración centralizada de variables de entorno con validación

// 🔍 DEBUGGING: Verificar contexto de ejecución
const isClient = typeof window !== "undefined";

/**
 * Obtiene una variable de entorno requerida (solo server-side)
 */
function getRequiredEnv(key: string): string {
  if (isClient) {
    throw new Error(
      `❌ Variable ${key} intentada desde cliente. Solo server-side permitido.`
    );
  }

  const value = process.env[key];
  if (!value || value.trim() === "") {
    console.error(`❌ Variable faltante: ${key}`);
    console.error(
      `🔍 Todas las variables disponibles:`,
      Object.keys(process.env).filter(
        (k) => k.includes("AUTH") || k.includes("DATABASE")
      )
    );
    throw new Error(`Variable de entorno requerida faltante: ${key}`);
  }
  return value.trim();
}

/**
 * Obtiene una variable de entorno opcional con valor por defecto
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  if (isClient) {
    return defaultValue;
  }
  return process.env[key]?.trim() || defaultValue;
}

/**
 * Convierte string a boolean
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  if (isClient) {
    return defaultValue;
  }
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
}

/**
 * Convierte string a número
 */
function getNumberEnv(key: string, defaultValue: number): number {
  if (isClient) {
    return defaultValue;
  }
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

// 🗄️ DATABASE CONFIGURATION
export function getDatabaseConfig() {
  return {
    url: getRequiredEnv("DATABASE_URL"),
  } as const;
}

// 🔐 BETTER AUTH CONFIGURATION
export function getAuthConfig() {
  return {
    secret: getRequiredEnv("BETTER_AUTH_SECRET"),
    baseURL: getOptionalEnv(
      "NEXT_PUBLIC_BETTER_AUTH_URL",
      "http://localhost:3000"
    ),
    trustedOrigins: getOptionalEnv(
      "BETTER_AUTH_TRUSTED_ORIGINS",
      "http://localhost:3000"
    ),
  } as const;
}

// 📁 FILE UPLOAD CONFIGURATION
export function getUploadConfig() {
  return {
    provider: getOptionalEnv("UPLOAD_PROVIDER", "local") as
      | "local"
      | "s3"
      | "cloudinary",

    // Local storage
    localPath: getOptionalEnv("UPLOAD_LOCAL_PATH", "uploads"),
    localBaseURL: getOptionalEnv(
      "UPLOAD_LOCAL_BASE_URL",
      "http://localhost:3000/uploads"
    ),

    // Limits
    maxFileSize: getNumberEnv("UPLOAD_MAX_FILE_SIZE", 10 * 1024 * 1024), // 10MB default
    allowedTypes: getOptionalEnv(
      "UPLOAD_ALLOWED_TYPES",
      "image/*,application/pdf,text/*"
    ).split(","),

    // AWS S3
    s3: {
      accessKeyId: getOptionalEnv("AWS_ACCESS_KEY_ID", ""),
      secretAccessKey: getOptionalEnv("AWS_SECRET_ACCESS_KEY", ""),
      region: getOptionalEnv("AWS_REGION", "us-east-1"),
      bucket: getOptionalEnv("AWS_S3_BUCKET", ""),
      endpoint: getOptionalEnv("AWS_S3_ENDPOINT", ""),
      forcePathStyle: getBooleanEnv("AWS_S3_FORCE_PATH_STYLE", false),
    },

    // Cloudinary
    cloudinary: {
      cloudName: getOptionalEnv("CLOUDINARY_CLOUD_NAME", ""),
      apiKey: getOptionalEnv("CLOUDINARY_API_KEY", ""),
      apiSecret: getOptionalEnv("CLOUDINARY_API_SECRET", ""),
      folder: getOptionalEnv("CLOUDINARY_FOLDER", "nextjs-boilerplate"),
    },
  } as const;
}

// 🔧 FEATURE FLAGS
export function getFeatureFlags() {
  return {
    fileUpload: getBooleanEnv("MODULE_FILE_UPLOAD", true),
    stripePayments: getBooleanEnv("MODULE_STRIPE_PAYMENTS", false),
    inventory: getBooleanEnv("MODULE_INVENTORY", false),
    ecommerce: getBooleanEnv("MODULE_ECOMMERCE", false),
    aiChat: getBooleanEnv("MODULE_AI_CHAT", false),
  } as const;
}

// 🚀 DEPLOYMENT CONFIGURATION
export function getDeploymentConfig() {
  return {
    nodeEnv: getOptionalEnv("NODE_ENV", "development") as
      | "development"
      | "production"
      | "test",
    appURL: getOptionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  } as const;
}

// 📧 EMAIL CONFIGURATION (future use)
export const EMAIL_CONFIG = {
  provider: getOptionalEnv("EMAIL_PROVIDER", "resend") as
    | "resend"
    | "sendgrid"
    | "smtp",
  from: getOptionalEnv("EMAIL_FROM", "noreply@localhost"),
} as const;

// 📊 ANALYTICS CONFIGURATION
export const ANALYTICS_CONFIG = {
  gaTrackingId: getOptionalEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", ""),
  sentryDSN: getOptionalEnv("NEXT_PUBLIC_SENTRY_DSN", ""),
} as const;

// 🔍 DEBUGGING CONFIGURATION
export const DEBUG_CONFIG = {
  logLevel: getOptionalEnv("LOG_LEVEL", "info") as
    | "debug"
    | "info"
    | "warn"
    | "error",
  debugMode: getBooleanEnv("NEXT_PUBLIC_DEBUG_MODE", false),
} as const;

// 💳 STRIPE CONFIGURATION
export function getStripeEnvironmentConfig() {
  // Client-side: only return publishable key (safe for client)
  if (isClient) {
    return {
      secretKey: "",
      publishableKey: getOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", ""),
      webhookSecret: "",
    } as const;
  }

  // Server-side: return all keys
  const config = {
    secretKey: getOptionalEnv("STRIPE_SECRET_KEY", ""),
    publishableKey: getOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", ""),
    webhookSecret: getOptionalEnv("STRIPE_WEBHOOK_SECRET", ""),
  };

  // Debug log only in development and server-side
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [STRIPE CONFIG] Loading configuration...", {
      hasSecretKey: !!config.secretKey,
      hasPublishableKey: !!config.publishableKey,
      secretKeyLength: config.secretKey?.length || 0,
      publishableKeyLength: config.publishableKey?.length || 0,
      secretKeyPrefix: config.secretKey?.substring(0, 10) || "EMPTY",
      publishableKeyPrefix: config.publishableKey?.substring(0, 10) || "EMPTY",
      rawEnvSecretKey: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || "MISSING",
      rawEnvPublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || "MISSING",
    });
  }

  return config;
}

// 🛍️ ECOMMERCE CONFIGURATION (future use)
export const ECOMMERCE_CONFIG = {
  currency: getOptionalEnv("PAYMENT_CURRENCY", "USD"),
  taxRate: getNumberEnv("TAX_RATE", 0.1),
  shippingRate: getNumberEnv("SHIPPING_RATE", 9.99),
} as const;

// 🎯 EXPORT CONSOLIDADO
export function getEnv() {
  // Client-side: only return safe configs
  if (isClient) {
    return {
      database: { url: "" },
      auth: {
        secret: "",
        baseURL: getOptionalEnv("NEXT_PUBLIC_BETTER_AUTH_URL", "http://localhost:3000"),
        trustedOrigins: getOptionalEnv("NEXT_PUBLIC_BETTER_AUTH_TRUSTED_ORIGINS", "http://localhost:3000"),
      },
      upload: {
        provider: "local" as const,
        localPath: "",
        localBaseURL: "",
        maxFileSize: 0,
        allowedTypes: [],
        s3: {
          accessKeyId: "",
          secretAccessKey: "",
          region: "",
          bucket: "",
          endpoint: "",
          forcePathStyle: false,
        },
        cloudinary: {
          cloudName: "",
          apiKey: "",
          apiSecret: "",
          folder: "",
        },
      },
      features: getFeatureFlags(), // Safe: uses NEXT_PUBLIC_ variables
      deployment: getDeploymentConfig(), // Safe: uses NEXT_PUBLIC_ variables
      email: EMAIL_CONFIG,
      analytics: ANALYTICS_CONFIG,
      debug: DEBUG_CONFIG,
      stripe: getStripeEnvironmentConfig(), // Safe: client-aware function
      ecommerce: ECOMMERCE_CONFIG,
    } as const;
  }

  // Server-side: return all configs
  return {
    database: getDatabaseConfig(),
    auth: getAuthConfig(),
    upload: getUploadConfig(),
    features: getFeatureFlags(),
    deployment: getDeploymentConfig(),
    email: EMAIL_CONFIG,
    analytics: ANALYTICS_CONFIG,
    debug: DEBUG_CONFIG,
    stripe: getStripeEnvironmentConfig(),
    ecommerce: ECOMMERCE_CONFIG,
  } as const;
}

// Compatibilidad: ENV como getter para casos que lo necesiten
export const ENV = new Proxy({} as ReturnType<typeof getEnv>, {
  get(target, prop) {
    return getEnv()[prop as keyof ReturnType<typeof getEnv>];
  },
});

// ✅ VALIDATION FUNCTIONS (solo manual)
export function validateEnvironment(): void {
  if (isClient) {
    console.warn("⚠️ validateEnvironment solo funciona en servidor");
    return;
  }

  const errors: string[] = [];

  // Validate required variables
  try {
    getRequiredEnv("DATABASE_URL");
    getRequiredEnv("BETTER_AUTH_SECRET");
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    }
  }

  // Validate file upload provider configuration
  try {
    const uploadConfig = getUploadConfig();
    if (uploadConfig.provider === "s3") {
      if (
        !uploadConfig.s3.accessKeyId ||
        !uploadConfig.s3.secretAccessKey ||
        !uploadConfig.s3.bucket
      ) {
        errors.push(
          "S3 provider seleccionado pero faltan credenciales: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET"
        );
      }
    }

    if (uploadConfig.provider === "cloudinary") {
      if (
        !uploadConfig.cloudinary.cloudName ||
        !uploadConfig.cloudinary.apiKey ||
        !uploadConfig.cloudinary.apiSecret
      ) {
        errors.push(
          "Cloudinary provider seleccionado pero faltan credenciales: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
        );
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Error validating upload config: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Errores de configuración:\n${errors.join("\n")}`);
  }
}
