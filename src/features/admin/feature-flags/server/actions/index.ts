// ⚡ FEATURE FLAGS ACTIONS
// =======================
// Acciones del dominio para feature flags (Comandos)

import { featureFlagService } from "../services";
import { regenerateSchema } from "@/core/database/schema-builder";
import type {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "../../schemas";
import type { FeatureFlagDomain } from "../../types";

// 🎯 Resultado de acciones
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 🔄 Toggle feature flag con regeneración automática
export async function toggleFeatureFlagAction(
  flagKey: string,
  userId?: string
): Promise<ActionResult<FeatureFlagDomain>> {
  try {
    const updatedFlag = await featureFlagService.toggleFlag(flagKey, userId);

    // Si la flag afecta modelos de Prisma, regenerar schema
    if (updatedFlag.hasPrismaModels) {
      try {
        const enabledFlags = await featureFlagService.getSchemaFlags();
        await regenerateSchema(enabledFlags);
        console.log("🏗️  Schema regenerated due to flag change");
      } catch (error) {
        console.error("❌ Error regenerating schema:", error);
        // No fallar la acción por esto
      }
    }

    return {
      success: true,
      data: updatedFlag,
      message: `Feature flag '${flagKey}' ${
        updatedFlag.enabled ? "enabled" : "disabled"
      }`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 🔧 Actualizar feature flag
export async function updateFeatureFlagAction(
  flagKey: string,
  updateData: UpdateFeatureFlagInput,
  userId?: string
): Promise<ActionResult<FeatureFlagDomain>> {
  try {
    const updatedFlag = await featureFlagService.updateFlag(
      flagKey,
      updateData,
      userId
    );

    // Si se cambió el estado de habilitado y afecta modelos de Prisma
    if (updateData.enabled !== undefined && updatedFlag.hasPrismaModels) {
      try {
        const enabledFlags = await featureFlagService.getSchemaFlags();
        await regenerateSchema(enabledFlags);
        console.log("🏗️  Schema regenerated due to flag update");
      } catch (error) {
        console.error("❌ Error regenerating schema:", error);
      }
    }

    return {
      success: true,
      data: updatedFlag,
      message: "Feature flag updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ➕ Crear nueva feature flag
export async function createFeatureFlagAction(
  flagData: CreateFeatureFlagInput
): Promise<ActionResult<FeatureFlagDomain>> {
  try {
    const newFlag = await featureFlagService.createFlag(flagData);

    return {
      success: true,
      data: newFlag,
      message: `Feature flag '${newFlag.key}' created successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 🗑️ Eliminar feature flag
export async function deleteFeatureFlagAction(
  flagKey: string
): Promise<ActionResult<void>> {
  try {
    await featureFlagService.deleteFlag(flagKey);

    return {
      success: true,
      message: `Feature flag '${flagKey}' deleted successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 🔄 Resetear todas las flags a estado deshabilitado
export async function resetAllFeatureFlagsAction(
  userId?: string
): Promise<ActionResult<{ resettedCount: number }>> {
  try {
    const allFlags = await featureFlagService.getAllForUI();
    const enabledFlags = allFlags.filter((flag) => flag.enabled);

    let resettedCount = 0;

    for (const flag of enabledFlags) {
      await featureFlagService.updateFlag(flag.id, { enabled: false }, userId);
      resettedCount++;
    }

    // Regenerar schema después del reset masivo
    try {
      const enabledFlags = await featureFlagService.getSchemaFlags();
      await regenerateSchema(enabledFlags);
      console.log("🏗️  Schema regenerated after mass reset");
    } catch (error) {
      console.error("❌ Error regenerating schema:", error);
    }

    return {
      success: true,
      data: { resettedCount },
      message: `${resettedCount} feature flags were resetted`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 🔄 Actualizar múltiples flags (batch update)
export async function batchUpdateFeatureFlagsAction(
  updates: { flagKey: string; enabled: boolean }[],
  userId?: string
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    let updatedCount = 0;
    let needsSchemaRegeneration = false;

    for (const update of updates) {
      const result = await featureFlagService.updateFlag(
        update.flagKey,
        { enabled: update.enabled },
        userId
      );

      if (result.hasPrismaModels) {
        needsSchemaRegeneration = true;
      }

      updatedCount++;
    }

    // Regenerar schema una sola vez al final si es necesario
    if (needsSchemaRegeneration) {
      try {
        const enabledFlags = await featureFlagService.getSchemaFlags();
        await regenerateSchema(enabledFlags);
        console.log("🏗️  Schema regenerated after batch update");
      } catch (error) {
        console.error("❌ Error regenerating schema:", error);
      }
    }

    return {
      success: true,
      data: { updatedCount },
      message: `${updatedCount} feature flags updated successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 🚀 Inicializar sistema de feature flags
export async function initializeFeatureFlagsAction(): Promise<
  ActionResult<void>
> {
  try {
    await featureFlagService.initializeDefaultFlags();

    return {
      success: true,
      message: "Feature flags system initialized successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
