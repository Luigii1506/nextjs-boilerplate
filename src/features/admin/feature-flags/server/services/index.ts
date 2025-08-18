// 🎯 FEATURE FLAGS SERVICES
// =========================
// Lógica de negocio para feature flags (Casos de uso)

import {
  getAllFeatureFlagsQuery,
  getFeatureFlagByKeyQuery,
  getEnabledFeatureFlagsQuery,
  searchFeatureFlagsQuery,
  getConflictingFlagsQuery,
  featureFlagExistsQuery,
  getFeatureFlagHistoryQuery,
  createFeatureFlagQuery,
  updateFeatureFlagQuery,
  deleteFeatureFlagQuery,
  createFeatureFlagHistoryQuery,
} from "../queries";
import {
  mapPrismaArrayToDomainArray,
  mapPrismaToFeatureFlagDomain,
  mapDomainArrayToCardArray,
  calculateFeatureFlagStats,
  mapDomainToToggleState,
} from "../mappers";
import type {
  FeatureFlagDomain,
  FeatureFlagCardData,
  FeatureFlagStats,
} from "../../types";
import {
  type CreateFeatureFlagInput,
  type UpdateFeatureFlagInput,
  type FeatureFlagFilters,
} from "../../schemas";

import {
  validateCreateFeatureFlag,
  validateUpdateFeatureFlag,
  validateDependencies,
} from "../validators";

// 🎯 Servicio principal de Feature Flags
export class FeatureFlagService {
  // 📊 Obtener todas las flags para UI
  async getAllForUI(): Promise<FeatureFlagCardData[]> {
    const prismaFlags = await getAllFeatureFlagsQuery();
    const domainFlags = mapPrismaArrayToDomainArray(prismaFlags);
    return mapDomainArrayToCardArray(domainFlags);
  }

  // 📊 Obtener estadísticas
  async getStats(): Promise<FeatureFlagStats> {
    const cardData = await this.getAllForUI();
    return calculateFeatureFlagStats(cardData);
  }

  // 🎛️ Obtener estado simple para toggles
  async getToggleState(): Promise<Record<string, boolean>> {
    const prismaFlags = await getAllFeatureFlagsQuery();
    const domainFlags = mapPrismaArrayToDomainArray(prismaFlags);
    return mapDomainToToggleState(domainFlags);
  }

  // 🔍 Buscar flags con filtros
  async searchFlags(
    filters: FeatureFlagFilters
  ): Promise<FeatureFlagCardData[]> {
    const prismaFlags = await searchFeatureFlagsQuery(filters);
    const domainFlags = mapPrismaArrayToDomainArray(prismaFlags);
    return mapDomainArrayToCardArray(domainFlags);
  }

  // 🎯 Obtener una flag específica
  async getByKey(key: string): Promise<FeatureFlagDomain | null> {
    const prismaFlag = await getFeatureFlagByKeyQuery(key);
    return prismaFlag ? mapPrismaToFeatureFlagDomain(prismaFlag) : null;
  }

  // ✅ Verificar si una flag está habilitada
  async isEnabled(
    key: string,
    options?: {
      userId?: string;
      role?: string;
      ignoreRollout?: boolean;
    }
  ): Promise<boolean> {
    // 1. Verificar override de ENV
    const envKey = `FF_${key.toUpperCase()}`;
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      return ["1", "true", "on", "yes", "enable", "enabled"].includes(
        envValue.toLowerCase()
      );
    }

    // 2. Obtener de base de datos
    const flag = await this.getByKey(key);
    if (!flag) {
      console.warn(`⚠️  Feature flag '${key}' not found`);
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // 3. Verificar rollout percentage
    if (!options?.ignoreRollout && flag.rolloutPercentage < 100) {
      const seed = options?.userId || "anonymous";
      const hash = seed.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const percentage = Math.abs(hash % 100);
      return percentage < flag.rolloutPercentage;
    }

    return true;
  }

  // 🔄 Toggle una flag
  async toggleFlag(
    key: string,
    changedBy?: string
  ): Promise<FeatureFlagDomain> {
    const currentFlag = await this.getByKey(key);
    if (!currentFlag) {
      throw new Error(`Feature flag '${key}' not found`);
    }

    return await this.updateFlag(
      key,
      { enabled: !currentFlag.enabled },
      changedBy
    );
  }

  // 🔧 Actualizar una flag
  async updateFlag(
    key: string,
    updateData: UpdateFeatureFlagInput,
    changedBy?: string
  ): Promise<FeatureFlagDomain> {
    const validatedData = validateUpdateFeatureFlag(updateData);

    const currentFlag = await getFeatureFlagByKeyQuery(key);
    if (!currentFlag) {
      throw new Error(`Feature flag '${key}' not found`);
    }

    // Validar conflictos si se está habilitando
    if (validatedData.enabled === true && currentFlag.conflicts.length > 0) {
      const conflictingFlags = await getConflictingFlagsQuery(
        currentFlag.conflicts
      );
      if (conflictingFlags.length > 0) {
        throw new Error(
          `Cannot enable flag due to conflicts with: ${conflictingFlags
            .map((f) => f.name)
            .join(", ")}`
        );
      }
    }

    // Registrar cambio en historial si se modifica el estado
    if (
      validatedData.enabled !== undefined &&
      validatedData.enabled !== currentFlag.enabled
    ) {
      await createFeatureFlagHistoryQuery({
        flagKey: key,
        previousValue: currentFlag.enabled,
        newValue: validatedData.enabled,
        changedBy: changedBy,
        reason: "Updated via admin panel",
      });
    }

    const updatedFlag = await updateFeatureFlagQuery(key, validatedData);

    return mapPrismaToFeatureFlagDomain(updatedFlag);
  }

  // ➕ Crear nueva flag
  async createFlag(
    flagData: CreateFeatureFlagInput
  ): Promise<FeatureFlagDomain> {
    const validatedData = validateCreateFeatureFlag(flagData);

    const exists = await featureFlagExistsQuery(validatedData.key);
    if (exists) {
      throw new Error(`Feature flag '${validatedData.key}' already exists`);
    }

    // Validar dependencias
    if (validatedData.dependencies.length > 0) {
      const allFlags = await getAllFeatureFlagsQuery();
      const allKeys = allFlags.map((f) => f.key);
      if (!validateDependencies(validatedData.dependencies, allKeys)) {
        throw new Error("Some dependencies do not exist");
      }
    }

    const createdFlag = await createFeatureFlagQuery({
      ...validatedData,
      version: "1.0.0",
      rolloutPercentage: 100,
    });

    return mapPrismaToFeatureFlagDomain(createdFlag);
  }

  // 🗑️ Eliminar flag
  async deleteFlag(key: string): Promise<void> {
    const exists = await featureFlagExistsQuery(key);
    if (!exists) {
      throw new Error(`Feature flag '${key}' not found`);
    }

    await deleteFeatureFlagQuery(key);
  }

  // 📚 Obtener historial
  async getHistory(key: string): Promise<
    Array<{
      id: string;
      flagKey: string;
      previousValue: boolean;
      newValue: boolean;
      changedBy: string | null;
      reason: string | null;
      createdAt: Date;
    }>
  > {
    return await getFeatureFlagHistoryQuery(key);
  }

  // 📊 Obtener todas las flags formato original para API
  async getAllFeatureFlags(): Promise<FeatureFlagDomain[]> {
    const prismaFlags = await getAllFeatureFlagsQuery();
    return mapPrismaArrayToDomainArray(prismaFlags);
  }

  // 🚀 Inicializar flags por defecto
  async initializeDefaultFlags(): Promise<void> {
    // Initializing default feature flags...

    const defaultFlags: CreateFeatureFlagInput[] = [
      {
        key: "fileUpload",
        name: "File Upload System",
        description:
          "Complete file upload and management system with S3 support",
        enabled: true,
        category: "module",
        hasPrismaModels: true,
        dependencies: [],
        conflicts: [],
        rolloutPercentage: 100,
      },
      {
        key: "analytics",
        name: "Advanced Analytics",
        description: "Enhanced analytics and reporting dashboard",
        enabled: false,
        category: "module",
        hasPrismaModels: false,
        dependencies: [],
        conflicts: [],
        rolloutPercentage: 100,
      },
      {
        key: "darkMode",
        name: "Dark Mode",
        description: "Dark theme support for the application",
        enabled: false,
        category: "ui",
        hasPrismaModels: false,
        dependencies: [],
        conflicts: [],
        rolloutPercentage: 100,
      },
      {
        key: "betaFeatures",
        name: "Beta Features",
        description: "Experimental features for testing",
        enabled: false,
        category: "experimental",
        hasPrismaModels: false,
        dependencies: [],
        conflicts: [],
        rolloutPercentage: 100,
      },
    ];

    for (const flagData of defaultFlags) {
      const exists = await featureFlagExistsQuery(flagData.key);
      if (!exists) {
        await this.createFlag(flagData);
      }
    }

    // Default feature flags initialized
  }

  // 🏗️ Obtener flags que requieren regeneración de schema
  async getSchemaFlags(): Promise<string[]> {
    const flags = await getEnabledFeatureFlagsQuery();
    return flags.filter((flag) => flag.hasPrismaModels).map((flag) => flag.key);
  }
}

// 🎯 Instancia singleton del servicio
export const featureFlagService = new FeatureFlagService();
