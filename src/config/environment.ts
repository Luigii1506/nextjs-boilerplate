/**
 * 🌍 CONFIGURACIÓN DE ENTORNO
 *
 * Centralización y validación de variables de entorno.
 * Tipos seguros y valores por defecto.
 */

// 🔍 VALIDACIÓN DE VARIABLES REQUERIDAS
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

// 🔧 CONFIGURACIÓN POR CATEGORÍAS
export const ENV = {
  // 🏗️ CONFIGURACIÓN BÁSICA
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3000",

  // 🗄️ BASE DE DATOS
  DATABASE_URL: requireEnv("DATABASE_URL"),

  // 🔐 AUTENTICACIÓN
  BETTER_AUTH_SECRET: requireEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnv("BETTER_AUTH_URL", "http://localhost:3000"),

  // 🧩 MÓDULOS - TOGGLES
  MODULES: {
    FILE_UPLOAD: getEnv("MODULE_FILE_UPLOAD") === "true",
    STRIPE: getEnv("MODULE_STRIPE") === "true",
    INVENTORY: getEnv("MODULE_INVENTORY") === "true",
    ECOMMERCE: getEnv("MODULE_ECOMMERCE") === "true",
    AI: getEnv("MODULE_AI") === "true",
    ANALYTICS: getEnv("MODULE_ANALYTICS") === "true",
  },

  // 💳 STRIPE (si está habilitado)
  STRIPE: {
    PUBLIC_KEY: getEnv("STRIPE_PUBLIC_KEY"),
    SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
    WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
  },

  // 📁 FILE UPLOAD (si está habilitado)
  FILE_UPLOAD: {
    PROVIDER: getEnv("UPLOAD_PROVIDER", "local"),
    MAX_SIZE: getEnv("UPLOAD_MAX_SIZE", "10MB"),
    AWS_BUCKET: getEnv("AWS_S3_BUCKET"),
    AWS_ACCESS_KEY: getEnv("AWS_ACCESS_KEY_ID"),
    AWS_SECRET_KEY: getEnv("AWS_SECRET_ACCESS_KEY"),
    AWS_REGION: getEnv("AWS_REGION", "us-east-1"),
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  },

  // 🎛️ FEATURE FLAGS
  FEATURES: {
    BETA: getEnv("ENABLE_BETA_FEATURES") === "true",
    NEW_DASHBOARD: getEnv("FEATURE_NEW_DASHBOARD") === "true",
    DARK_MODE: getEnv("FEATURE_DARK_MODE") === "true",
    ANIMATIONS: getEnv("FEATURE_ANIMATIONS") !== "false", // Default true
    SYSTEM_LOGS: getEnv("FEATURE_SYSTEM_LOGS") === "true",
    DATA_EXPORT: getEnv("FEATURE_DATA_EXPORT") === "true",
  },

  // 🧪 DESARROLLO
  DEV: {
    DEBUG: process.env.NODE_ENV === "development",
    MOCK_PAYMENTS: getEnv("MOCK_PAYMENTS") === "true",
    SKIP_EMAIL_VERIFICATION: getEnv("SKIP_EMAIL_VERIFICATION") === "true",
  },
} as const;

// 🔍 VALIDACIONES ESPECÍFICAS POR MÓDULO
export function validateModuleEnv() {
  const errors: string[] = [];

  // Validar Stripe si está habilitado
  if (ENV.MODULES.STRIPE) {
    if (!ENV.STRIPE.PUBLIC_KEY)
      errors.push(
        "STRIPE_PUBLIC_KEY is required when MODULE_STRIPE is enabled"
      );
    if (!ENV.STRIPE.SECRET_KEY)
      errors.push(
        "STRIPE_SECRET_KEY is required when MODULE_STRIPE is enabled"
      );
  }

  // Validar AWS S3 si file upload está configurado para S3
  if (ENV.MODULES.FILE_UPLOAD && ENV.FILE_UPLOAD.PROVIDER === "aws-s3") {
    if (!ENV.FILE_UPLOAD.AWS_BUCKET)
      errors.push("AWS_S3_BUCKET is required for S3 file upload");
    if (!ENV.FILE_UPLOAD.AWS_ACCESS_KEY)
      errors.push("AWS_ACCESS_KEY_ID is required for S3 file upload");
    if (!ENV.FILE_UPLOAD.AWS_SECRET_KEY)
      errors.push("AWS_SECRET_ACCESS_KEY is required for S3 file upload");
  }

  // Validar Cloudinary si está configurado
  if (ENV.MODULES.FILE_UPLOAD && ENV.FILE_UPLOAD.PROVIDER === "cloudinary") {
    if (!ENV.FILE_UPLOAD.CLOUDINARY_CLOUD_NAME)
      errors.push("CLOUDINARY_CLOUD_NAME is required for Cloudinary upload");
    if (!ENV.FILE_UPLOAD.CLOUDINARY_API_KEY)
      errors.push("CLOUDINARY_API_KEY is required for Cloudinary upload");
    if (!ENV.FILE_UPLOAD.CLOUDINARY_API_SECRET)
      errors.push("CLOUDINARY_API_SECRET is required for Cloudinary upload");
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
}

// 🎯 UTILIDADES
export const isDevelopment = ENV.NODE_ENV === "development";
export const isProduction = ENV.NODE_ENV === "production";
export const isTest = ENV.NODE_ENV === "test";

// 📊 TIPOS
export type Environment = typeof ENV;
