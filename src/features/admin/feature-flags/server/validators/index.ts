// 🛡️ FEATURE FLAGS VALIDATORS
// ============================
// Validadores de lógica de negocio para feature flags

import type {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
  ToggleFeatureFlagInput,
  FeatureFlagFilters,
} from "../../schemas";
import {
  parseCreateFeatureFlag,
  parseUpdateFeatureFlag,
  parseToggleFeatureFlag,
  parseFeatureFlagFilters,
} from "../../schemas";

// 🔍 Funciones de validación que combinan schema + lógica de negocio
export const validateCreateFeatureFlag = (
  data: unknown
): CreateFeatureFlagInput => {
  const parsed = parseCreateFeatureFlag(data);

  // Validaciones adicionales de negocio aquí si es necesario
  // Por ejemplo: verificar que el key no exista ya, etc.

  return parsed;
};

export const validateUpdateFeatureFlag = (
  data: unknown
): UpdateFeatureFlagInput => {
  return parseUpdateFeatureFlag(data);
};

export const validateToggleFeatureFlag = (
  data: unknown
): ToggleFeatureFlagInput => {
  return parseToggleFeatureFlag(data);
};

export const validateFeatureFlagFilters = (
  data: unknown
): FeatureFlagFilters => {
  return parseFeatureFlagFilters(data);
};

// 🛡️ Validadores de lógica de negocio específica

/**
 * Valida que todas las dependencias existan en la lista de flags disponibles
 */
export const validateDependencies = (
  dependencies: string[],
  allFlags: string[]
): { isValid: boolean; missingDependencies: string[] } => {
  const missingDependencies = dependencies.filter(
    (dep) => !allFlags.includes(dep)
  );
  return {
    isValid: missingDependencies.length === 0,
    missingDependencies,
  };
};

/**
 * Valida que no hay conflictos con flags actualmente habilitados
 */
export const validateConflicts = (
  conflicts: string[],
  enabledFlags: string[]
): { isValid: boolean; activeConflicts: string[] } => {
  const activeConflicts = conflicts.filter((conflict) =>
    enabledFlags.includes(conflict)
  );
  return {
    isValid: activeConflicts.length === 0,
    activeConflicts,
  };
};

/**
 * Valida que un feature flag puede ser habilitado según sus dependencias
 */
export const validateCanEnable = (
  flagKey: string,
  dependencies: string[],
  enabledFlags: string[]
): { canEnable: boolean; missingDependencies: string[] } => {
  const missingDependencies = dependencies.filter(
    (dep) => !enabledFlags.includes(dep)
  );
  return {
    canEnable: missingDependencies.length === 0,
    missingDependencies,
  };
};

/**
 * Valida que un feature flag puede ser deshabilitado (no hay otros que dependan de él)
 */
export const validateCanDisable = (
  flagKey: string,
  allFlags: { key: string; dependencies: string[]; enabled: boolean }[]
): { canDisable: boolean; dependentFlags: string[] } => {
  const dependentFlags = allFlags
    .filter((flag) => flag.enabled && flag.dependencies.includes(flagKey))
    .map((flag) => flag.key);

  return {
    canDisable: dependentFlags.length === 0,
    dependentFlags,
  };
};
