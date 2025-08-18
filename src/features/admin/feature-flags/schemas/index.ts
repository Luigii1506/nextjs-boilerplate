// 🔍 FEATURE FLAGS SCHEMAS
// =========================
// Esquemas de validación Zod para feature flags

import { z } from "zod";
import { FF_VALIDATION } from "../constants";

// 📋 Schema para feature flag de entrada
export const CreateFeatureFlagSchema = z.object({
  key: z
    .string()
    .min(FF_VALIDATION.KEY_MIN_LENGTH, "Key es requerido")
    .max(FF_VALIDATION.KEY_MAX_LENGTH, "Key muy largo")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Key debe ser alfanumérico y empezar con letra"
    ),
  name: z
    .string()
    .min(FF_VALIDATION.NAME_MIN_LENGTH, "Name es requerido")
    .max(FF_VALIDATION.NAME_MAX_LENGTH, "Name muy largo"),
  description: z
    .string()
    .max(FF_VALIDATION.DESCRIPTION_MAX_LENGTH, "Description muy largo")
    .optional(),
  enabled: z.boolean().default(false),
  category: z
    .enum(["core", "module", "ui", "experimental", "admin"])
    .default("module"),
  hasPrismaModels: z.boolean().default(false),
  dependencies: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  rolloutPercentage: z
    .number()
    .min(FF_VALIDATION.ROLLOUT_MIN)
    .max(FF_VALIDATION.ROLLOUT_MAX)
    .default(100),
});

// 📋 Schema para actualización
export const UpdateFeatureFlagSchema = z.object({
  enabled: z.boolean().optional(),
  name: z
    .string()
    .min(FF_VALIDATION.NAME_MIN_LENGTH)
    .max(FF_VALIDATION.NAME_MAX_LENGTH)
    .optional(),
  description: z.string().max(FF_VALIDATION.DESCRIPTION_MAX_LENGTH).optional(),
  category: z
    .enum(["core", "module", "ui", "experimental", "admin"])
    .optional(),
  rolloutPercentage: z
    .number()
    .min(FF_VALIDATION.ROLLOUT_MIN)
    .max(FF_VALIDATION.ROLLOUT_MAX)
    .optional(),
  dependencies: z.array(z.string()).optional(),
  conflicts: z.array(z.string()).optional(),
});

// 📋 Schema para toggle simple
export const ToggleFeatureFlagSchema = z.object({
  flagKey: z.string().min(1, "Flag key es requerido"),
});

// 📋 Schema para filtros
export const FeatureFlagFiltersSchema = z.object({
  category: z
    .enum(["all", "core", "module", "ui", "experimental", "admin"])
    .default("all"),
  status: z.enum(["all", "enabled", "disabled"]).default("all"),
  search: z.string().optional(),
});

// 🎯 Tipos exportados
export type CreateFeatureFlagInput = z.infer<typeof CreateFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof UpdateFeatureFlagSchema>;
export type ToggleFeatureFlagInput = z.infer<typeof ToggleFeatureFlagSchema>;
export type FeatureFlagFilters = z.infer<typeof FeatureFlagFiltersSchema>;

// 🔍 Funciones de parsing/validación de esquemas
export const parseCreateFeatureFlag = (
  data: unknown
): CreateFeatureFlagInput => {
  return CreateFeatureFlagSchema.parse(data);
};

export const parseUpdateFeatureFlag = (
  data: unknown
): UpdateFeatureFlagInput => {
  return UpdateFeatureFlagSchema.parse(data);
};

export const parseToggleFeatureFlag = (
  data: unknown
): ToggleFeatureFlagInput => {
  return ToggleFeatureFlagSchema.parse(data);
};

export const parseFeatureFlagFilters = (data: unknown): FeatureFlagFilters => {
  return FeatureFlagFiltersSchema.parse(data);
};

// ========================
// 📤 FORM DATA PARSERS (Enterprise V2.0)
// ========================

/**
 * 📤 Parser para FormData de creación
 * Convierte FormData en CreateFeatureFlagInput validado
 */
export const parseCreateFeatureFlagFormData = (
  formData: FormData
): CreateFeatureFlagInput => {
  const data = {
    key: formData.get("key") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    enabled: formData.get("enabled") === "true",
    category: (formData.get("category") as string) || "module",
    hasPrismaModels: formData.get("hasPrismaModels") === "true",
    dependencies: formData.get("dependencies")
      ? JSON.parse(formData.get("dependencies") as string)
      : [],
    conflicts: formData.get("conflicts")
      ? JSON.parse(formData.get("conflicts") as string)
      : [],
    rolloutPercentage: formData.get("rolloutPercentage")
      ? parseInt(formData.get("rolloutPercentage") as string)
      : 100,
  };

  return CreateFeatureFlagSchema.parse(data);
};

/**
 * 📤 Parser para FormData de actualización
 * Convierte FormData en UpdateFeatureFlagInput validado
 */
export const parseUpdateFeatureFlagFormData = (
  formData: FormData
): UpdateFeatureFlagInput => {
  const data: Record<string, unknown> = {};

  // Solo incluir campos que estén presentes
  const enabled = formData.get("enabled");
  if (enabled !== null) {
    data.enabled = enabled === "true";
  }

  const name = formData.get("name");
  if (name) {
    data.name = name as string;
  }

  const description = formData.get("description");
  if (description !== null) {
    data.description = description as string;
  }

  const category = formData.get("category");
  if (category) {
    data.category = category as string;
  }

  const rolloutPercentage = formData.get("rolloutPercentage");
  if (rolloutPercentage) {
    data.rolloutPercentage = parseInt(rolloutPercentage as string);
  }

  const dependencies = formData.get("dependencies");
  if (dependencies) {
    data.dependencies = JSON.parse(dependencies as string);
  }

  const conflicts = formData.get("conflicts");
  if (conflicts) {
    data.conflicts = JSON.parse(conflicts as string);
  }

  return UpdateFeatureFlagSchema.parse(data);
};

/**
 * 📤 Parser para FormData de toggle
 * Convierte FormData en ToggleFeatureFlagInput validado
 */
export const parseToggleFeatureFlagFormData = (
  formData: FormData
): ToggleFeatureFlagInput => {
  const data = {
    flagKey: formData.get("flagKey") as string,
  };

  return ToggleFeatureFlagSchema.parse(data);
};

/**
 * 📤 Parser para FormData de filtros
 * Convierte FormData en FeatureFlagFilters validado
 */
export const parseFeatureFlagFiltersFormData = (
  formData: FormData
): FeatureFlagFilters => {
  const data = {
    category: (formData.get("category") as string) || "all",
    status: (formData.get("status") as string) || "all",
    search: (formData.get("search") as string) || undefined,
  };

  return FeatureFlagFiltersSchema.parse(data);
};

// ========================
// 🗑️ DELETE SCHEMA (Enterprise V2.0)
// ========================

export const DeleteFeatureFlagSchema = z.object({
  flagKey: z.string().min(1, "Flag key es requerido"),
});

export type DeleteFeatureFlagInput = z.infer<typeof DeleteFeatureFlagSchema>;

export const parseDeleteFeatureFlagInput = (
  data: unknown
): DeleteFeatureFlagInput => {
  return DeleteFeatureFlagSchema.parse(data);
};

export const parseDeleteFeatureFlagFormData = (
  formData: FormData
): DeleteFeatureFlagInput => {
  const data = {
    flagKey: formData.get("flagKey") as string,
  };

  return DeleteFeatureFlagSchema.parse(data);
};

// ========================
// 📦 BATCH OPERATIONS SCHEMA (Enterprise V2.0)
// ========================

export const BatchUpdateFeatureFlagSchema = z.object({
  operations: z
    .array(
      z.object({
        flagKey: z.string().min(1),
        enabled: z.boolean(),
      })
    )
    .min(1, "Al menos una operación es requerida")
    .max(50, "Máximo 50 operaciones por lote"),
});

export type BatchUpdateFeatureFlagInput = z.infer<
  typeof BatchUpdateFeatureFlagSchema
>;

export const parseBatchUpdateFeatureFlagInput = (
  data: unknown
): BatchUpdateFeatureFlagInput => {
  return BatchUpdateFeatureFlagSchema.parse(data);
};

export const parseBatchUpdateFeatureFlagFormData = (
  formData: FormData
): BatchUpdateFeatureFlagInput => {
  const data = {
    operations: JSON.parse(formData.get("operations") as string),
  };

  return BatchUpdateFeatureFlagSchema.parse(data);
};
