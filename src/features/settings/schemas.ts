/**
 * ✅ SETTINGS SCHEMAS - VALIDATION
 * ===============================
 *
 * Schemas básicos de validación para configuraciones
 * Solo validaciones esenciales para módulo de config
 *
 * Simple: 2025-01-18 - Appropriate validation for config module
 */

import { z } from "zod";
import type { SettingCategory } from "./types";

// 🎯 Setting categories
export const settingCategorySchema = z.enum([
  "app",
  "auth",
  "database",
  "communications",
  "deployment",
  "integrations",
]);

// 🎯 Setting types
export const settingTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "text",
  "email",
  "url",
  "password",
  "json",
]);

// 🎯 Environment types
export const settingEnvironmentSchema = z.enum([
  "development",
  "staging",
  "production",
  "all",
]);

// 🎯 Basic setting update schema
export const updateSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required"),
  value: z.unknown(),
  category: settingCategorySchema.optional(),
});

// 🎯 App settings validation
export const appSettingsSchema = z.object({
  "app.name": z
    .string()
    .min(1, "App name is required")
    .max(50, "App name too long"),
  "app.description": z.string().max(200, "Description too long").optional(),
  "app.version": z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Invalid version format")
    .optional(),
  "app.logoUrl": z.string().url("Invalid logo URL").optional(),
  "app.primaryColor": z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format")
    .optional(),
});

// 🎯 Auth settings validation
export const authSettingsSchema = z.object({
  "auth.google.clientId": z
    .string()
    .min(1, "Google Client ID is required")
    .optional(),
  "auth.google.clientSecret": z
    .string()
    .min(1, "Google Client Secret is required")
    .optional(),
  "auth.github.clientId": z
    .string()
    .min(1, "GitHub Client ID is required")
    .optional(),
  "auth.github.clientSecret": z
    .string()
    .min(1, "GitHub Client Secret is required")
    .optional(),
});

// 🎯 Database settings validation
export const databaseSettingsSchema = z.object({
  "db.connectionString": z.string().url("Invalid database URL").optional(),
  "db.poolSize": z.number().min(1).max(100).optional(),
});

// 🎯 Communications settings validation
export const communicationsSettingsSchema = z.object({
  "email.provider": z.enum(["smtp", "sendgrid", "mailgun", "ses"]).optional(),
  "email.fromEmail": z.string().email("Invalid email address").optional(),
  "email.fromName": z.string().min(1).max(50).optional(),
});

// 🎯 Deployment settings validation
export const deploymentSettingsSchema = z.object({
  "vercel.projectId": z
    .string()
    .min(1, "Vercel Project ID is required")
    .optional(),
  "vercel.accessToken": z
    .string()
    .min(1, "Vercel Access Token is required")
    .optional(),
});

// 🎯 Integrations settings validation
export const integrationsSettingsSchema = z.object({
  "analytics.googleAnalytics": z
    .string()
    .min(1, "GA Tracking ID is required")
    .optional(),
  "analytics.mixpanel": z
    .string()
    .min(1, "Mixpanel Token is required")
    .optional(),
});

// 🎯 Combined schemas by category
export const settingSchemasByCategory = {
  app: appSettingsSchema,
  auth: authSettingsSchema,
  database: databaseSettingsSchema,
  communications: communicationsSettingsSchema,
  deployment: deploymentSettingsSchema,
  integrations: integrationsSettingsSchema,
} as const;

// 🎯 Validation helper function
export function validateSettingValue(
  category: SettingCategory,
  key: string,
  value: unknown
): { isValid: boolean; errors?: string[] } {
  try {
    const categorySchema = settingSchemasByCategory[category];
    if (!categorySchema) {
      return { isValid: false, errors: [`Unknown category: ${category}`] };
    }

    // Create a partial schema for just this key
    const keySchema = categorySchema.pick({ [key]: true } as Record<
      string,
      true
    >);

    const result = keySchema.safeParse({ [key]: value });

    if (result.success) {
      return { isValid: true };
    } else {
      const errors = result.error.errors.map((err) => err.message);
      return { isValid: false, errors };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: ["Validation error occurred"],
    };
  }
}

// 🎯 Form data parser
export function parseUpdateSettingFormData(formData: FormData) {
  const key = formData.get("key") as string;
  const rawValue = formData.get("value") as string;
  const type = formData.get("type") as string;

  let value: unknown = rawValue;

  // Parse value based on type
  switch (type) {
    case "boolean":
      value = rawValue === "true" || rawValue === "on";
      break;
    case "number":
      value = rawValue ? Number(rawValue) : undefined;
      break;
    case "json":
      try {
        value = rawValue ? JSON.parse(rawValue) : undefined;
      } catch {
        throw new Error("Invalid JSON format");
      }
      break;
    default:
      value = rawValue || undefined;
  }

  return updateSettingSchema.parse({ key, value });
}
