"use server";

// ⚡ FEATURE FLAGS SERVER ACTIONS
// ===============================
// Next.js 15 Server Actions para feature flags (Enterprise)

import { featureFlagService } from "../services";
import { invalidateFeatureFlagsCache } from "@/core/config/server-feature-flags";
import { auth } from "@/core/auth/server/auth";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
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

// 🚀 NEW SERVER ACTIONS - Replacing API routes
// ============================================

// 📊 GET ALL FEATURE FLAGS (replaces GET /api/feature-flags)
export async function getAllFeatureFlagsAction(): Promise<
  ActionResult<FeatureFlagDomain[]>
> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    // Solo admins pueden ver feature flags
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    // Inicializar flags por defecto si no existen
    await featureFlagService.initializeDefaultFlags();

    // Obtener todas las feature flags
    const flags = await featureFlagService.getAllFeatureFlags();

    return {
      success: true,
      data: flags,
      message: "Feature flags retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🔧 UPDATE FEATURE FLAG (replaces PUT /api/feature-flags)
export async function updateFeatureFlagServerAction(
  formData: FormData
): Promise<ActionResult<FeatureFlagDomain>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    // Extract form data
    const flagKey = formData.get("flagKey") as string;
    const enabled = formData.get("enabled") === "true";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const rolloutPercentage =
      parseInt(formData.get("rolloutPercentage") as string) || 100;

    if (!flagKey) {
      throw new Error("Flag key is required");
    }

    const updateData: UpdateFeatureFlagInput = {
      enabled,
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category }),
      ...(rolloutPercentage !== 100 && { rolloutPercentage }),
    };

    const result = await updateFeatureFlagAction(
      flagKey,
      updateData,
      session.user.id
    );

    if (result.success) {
      // 🔄 Invalidate caches
      await invalidateFeatureFlagsCache();
      revalidateTag("feature-flags");
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// ➕ CREATE FEATURE FLAG (replaces POST /api/feature-flags)
export async function createFeatureFlagServerAction(
  formData: FormData
): Promise<ActionResult<FeatureFlagDomain>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    // Extract form data
    const key = formData.get("key") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = (formData.get("category") as string) || "general";
    const enabled = formData.get("enabled") === "true";

    if (!key || !name) {
      throw new Error("Key and name are required");
    }

    const flagData: CreateFeatureFlagInput = {
      key,
      name,
      description,
      category:
        (category as "admin" | "module" | "core" | "experimental" | "ui") ||
        "general",
      enabled,
      hasPrismaModels: false, // Default value
      dependencies: [], // Default empty array
      conflicts: [], // Default empty array
    };

    const result = await createFeatureFlagAction(flagData);

    if (result.success) {
      // 🔄 Invalidate caches
      await invalidateFeatureFlagsCache();
      revalidateTag("feature-flags");
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🗑️ DELETE FEATURE FLAG (replaces DELETE /api/feature-flags)
export async function deleteFeatureFlagServerAction(
  formData: FormData
): Promise<ActionResult<void>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    const flagKey = formData.get("flagKey") as string;

    if (!flagKey) {
      throw new Error("Flag key is required");
    }

    const result = await deleteFeatureFlagAction(flagKey);

    if (result.success) {
      // 🔄 Invalidate caches
      await invalidateFeatureFlagsCache();
      revalidateTag("feature-flags");
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🔄 TOGGLE FEATURE FLAG (replaces PUT /api/feature-flags with toggle)
// 🎯 Toggle function for direct form submission
export async function toggleFeatureFlagServerAction(
  formData: FormData
): Promise<ActionResult<FeatureFlagDomain>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    const flagKey = formData.get("flagKey") as string;

    if (!flagKey) {
      throw new Error("Flag key is required");
    }

    const result = await toggleFeatureFlagAction(flagKey, session.user.id);

    if (result.success) {
      // 🔄 Invalidate caches immediately
      await invalidateFeatureFlagsCache();
      revalidateTag("feature-flags");
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🚀 Toggle function compatible with useActionState (React 19)
export async function toggleFeatureFlagActionState(
  prevState: ActionResult<FeatureFlagDomain> | null,
  formData: FormData
): Promise<ActionResult<FeatureFlagDomain>> {
  // Just call the original function, ignoring prevState
  return await toggleFeatureFlagServerAction(formData);
}

// 🔄 INVALIDATE CACHE (replaces POST /api/feature-flags/invalidate-cache)
export async function invalidateCacheServerAction(): Promise<
  ActionResult<void>
> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    // Invalidate both server and edge caches
    await invalidateFeatureFlagsCache();
    revalidateTag("feature-flags");

    return {
      success: true,
      message: "Cache invalidated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error invalidating cache",
    };
  }
}
