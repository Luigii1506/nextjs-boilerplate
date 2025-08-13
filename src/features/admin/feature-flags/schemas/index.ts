// 🔍 FEATURE FLAGS SCHEMAS
// =========================
// Esquemas de validación Zod para feature flags

import { z } from "zod";

// 📋 Schema para feature flag de entrada
export const CreateFeatureFlagSchema = z.object({
  key: z
    .string()
    .min(1, "Key es requerido")
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "Key debe ser alfanumérico"),
  name: z.string().min(1, "Name es requerido").max(100, "Name muy largo"),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  category: z
    .enum(["core", "module", "ui", "experimental", "admin"])
    .default("module"),
  hasPrismaModels: z.boolean().default(false),
  dependencies: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
});

// 📋 Schema para actualización
export const UpdateFeatureFlagSchema = z.object({
  enabled: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
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
