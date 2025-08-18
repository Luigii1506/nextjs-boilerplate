"use server";

/**
 * 🎛️ FEATURE-FLAGS ENTERPRISE SERVER ACTIONS
 * ==========================================
 *
 * Next.js 15 Server Actions siguiendo el patrón enterprise V2.0
 * React 19 + Hexagonal Architecture + Enterprise patterns
 *
 * Updated: 2025-01-18 - Enterprise patterns refactor
 */

import { revalidateTag, revalidatePath } from "next/cache";
import * as schemas from "../../schemas";
import * as validators from "../validators/feature-flags.validators";
import { featureFlagService } from "../services";
import { invalidateFeatureFlagsCache } from "@/core/config/server-feature-flags";
import { regenerateSchema } from "@/core/database/schema-builder";
import {
  featureFlagsServerActionLogger,
  featureFlagsSecurityLogger,
  featureFlagsSchemaLogger,
  featureFlagsBatchLogger,
} from "../../utils/logger";
import { FEATURE_FLAGS_CACHE_TAGS, FEATURE_FLAGS_PATHS } from "../../constants";

// 🎯 Enterprise Action Result Interface
export interface FeatureFlagActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// 📋 GET ALL FEATURE FLAGS (Enterprise Server Action)
export async function getAllFeatureFlagsServerAction(): Promise<FeatureFlagActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🏢 Business logic via service
    await featureFlagService.initializeDefaultFlags();
    const flags = await featureFlagService.getAllFeatureFlags();

    return {
      success: true,
      data: flags,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Get all flags failed", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo feature flags",
      timestamp: new Date().toISOString(),
    };
  }
}

// ➕ CREATE FEATURE FLAG (Enterprise Server Action)
export async function createFeatureFlagServerAction(
  formData: FormData
): Promise<FeatureFlagActionResult> {
  const requestId = `create-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Session validation (STEP 1)
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🔍 Parse and validate input (STEP 2)
    const flagData = schemas.parseCreateFeatureFlagFormData(formData);
    validators.validateFlagKey(flagData.key);
    validators.validateDependencies(flagData.dependencies);
    validators.validateConflicts(flagData.conflicts);

    // 🔐 Security audit log (CRÍTICO)
    featureFlagsSecurityLogger.security("FLAG_CREATE_ATTEMPT", {
      requestId,
      userId: session.user.id,
      flagKey: flagData.key,
      category: flagData.category,
    });

    // 🏢 Business logic via service (STEP 3)
    const newFlag = await featureFlagService.createFlag(flagData);

    // 🔄 Cache invalidation (STEP 4)
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.FLAGS);
    revalidatePath(FEATURE_FLAGS_PATHS.ADMIN);
    await invalidateFeatureFlagsCache();

    featureFlagsServerActionLogger.info("Feature flag created successfully", {
      requestId,
      flagKey: newFlag.key,
      userId: session.user.id,
    });

    return {
      success: true,
      data: newFlag,
      message: `Feature flag '${newFlag.key}' creado exitosamente`,
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Create flag failed", error, {
      requestId,
    });

    // 🔐 Security audit for failed attempt
    featureFlagsSecurityLogger.security("FLAG_CREATE_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error creando feature flag",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 🔧 UPDATE FEATURE FLAG (Enterprise Server Action)
export async function updateFeatureFlagServerAction(
  formData: FormData
): Promise<FeatureFlagActionResult> {
  const requestId = `update-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🔍 Parse and validate
    const flagKey = formData.get("flagKey") as string;
    const updateData = schemas.parseUpdateFeatureFlagFormData(formData);

    if (!flagKey) {
      return {
        success: false,
        error: "Flag key es requerido",
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    validators.validateFlagKey(flagKey);

    // 🔐 Security audit log (CRÍTICO)
    featureFlagsSecurityLogger.security("FLAG_UPDATE_ATTEMPT", {
      requestId,
      userId: session.user.id,
      flagKey,
      changes: Object.keys(updateData),
    });

    // 🏢 Business logic via service
    const updatedFlag = await featureFlagService.updateFlag(
      flagKey,
      updateData,
      session.user.id
    );

    // 🔄 Schema regeneration if needed
    if (updateData.enabled !== undefined && updatedFlag.hasPrismaModels) {
      try {
        const enabledFlags = await featureFlagService.getSchemaFlags();
        await regenerateSchema(enabledFlags);

        featureFlagsSchemaLogger.schema("regenerate", true, {
          requestId,
          flagKey,
          enabled: updateData.enabled,
        });
      } catch (schemaError) {
        featureFlagsSchemaLogger.schema("regenerate", false, {
          requestId,
          flagKey,
          error: schemaError,
        });
      }
    }

    // 🔄 Cache invalidation
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.FLAGS);
    revalidatePath(FEATURE_FLAGS_PATHS.ADMIN);
    await invalidateFeatureFlagsCache();

    featureFlagsServerActionLogger.info("Feature flag updated successfully", {
      requestId,
      flagKey,
      userId: session.user.id,
    });

    return {
      success: true,
      data: updatedFlag,
      message: "Feature flag actualizado exitosamente",
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Update flag failed", error, {
      requestId,
    });

    // 🔐 Security audit for failed attempt
    featureFlagsSecurityLogger.security("FLAG_UPDATE_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error actualizando feature flag",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 🔄 TOGGLE FEATURE FLAG (Enterprise Server Action)
export async function toggleFeatureFlagServerAction(
  formData: FormData
): Promise<FeatureFlagActionResult> {
  const requestId = `toggle-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🔍 Parse and validate
    const toggleData = schemas.parseToggleFeatureFlagFormData(formData);
    validators.validateFlagKey(toggleData.flagKey);

    // 🔐 Security audit log (CRÍTICO)
    featureFlagsSecurityLogger.security("FLAG_TOGGLE_ATTEMPT", {
      requestId,
      userId: session.user.id,
      flagKey: toggleData.flagKey,
    });

    // 🏢 Business logic via service
    const updatedFlag = await featureFlagService.toggleFlag(
      toggleData.flagKey,
      session.user.id
    );

    // 🔄 Schema regeneration if needed
    if (updatedFlag.hasPrismaModels) {
      try {
        const enabledFlags = await featureFlagService.getSchemaFlags();
        await regenerateSchema(enabledFlags);

        featureFlagsSchemaLogger.schema("regenerate_toggle", true, {
          requestId,
          flagKey: toggleData.flagKey,
          newState: updatedFlag.enabled,
        });
      } catch (schemaError) {
        featureFlagsSchemaLogger.schema("regenerate_toggle", false, {
          requestId,
          flagKey: toggleData.flagKey,
          error: schemaError,
        });
      }
    }

    // 🔄 Cache invalidation
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.FLAGS);
    revalidatePath(FEATURE_FLAGS_PATHS.ADMIN);
    await invalidateFeatureFlagsCache();

    featureFlagsServerActionLogger.info("Feature flag toggled successfully", {
      requestId,
      flagKey: toggleData.flagKey,
      newState: updatedFlag.enabled,
      userId: session.user.id,
    });

    return {
      success: true,
      data: updatedFlag,
      message: `Feature flag '${toggleData.flagKey}' ${
        updatedFlag.enabled ? "habilitado" : "deshabilitado"
      }`,
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Toggle flag failed", error, {
      requestId,
    });

    // 🔐 Security audit for failed attempt
    featureFlagsSecurityLogger.security("FLAG_TOGGLE_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error cambiando estado de feature flag",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 🗑️ DELETE FEATURE FLAG (Enterprise Server Action)
export async function deleteFeatureFlagServerAction(
  formData: FormData
): Promise<FeatureFlagActionResult> {
  const requestId = `delete-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🔍 Parse and validate
    const deleteData = schemas.parseDeleteFeatureFlagFormData(formData);
    validators.validateFlagKey(deleteData.flagKey);

    // 🔐 Security audit log (CRÍTICO)
    featureFlagsSecurityLogger.security("FLAG_DELETE_ATTEMPT", {
      requestId,
      userId: session.user.id,
      flagKey: deleteData.flagKey,
    });

    // 🏢 Business logic via service
    await featureFlagService.deleteFlag(deleteData.flagKey);

    // 🔄 Cache invalidation
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.FLAGS);
    revalidatePath(FEATURE_FLAGS_PATHS.ADMIN);
    await invalidateFeatureFlagsCache();

    featureFlagsServerActionLogger.info("Feature flag deleted successfully", {
      requestId,
      flagKey: deleteData.flagKey,
      userId: session.user.id,
    });

    return {
      success: true,
      message: `Feature flag '${deleteData.flagKey}' eliminado exitosamente`,
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Delete flag failed", error, {
      requestId,
    });

    // 🔐 Security audit for failed attempt
    featureFlagsSecurityLogger.security("FLAG_DELETE_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error eliminando feature flag",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 📦 BATCH UPDATE FEATURE FLAGS (Enterprise Server Action)
export async function batchUpdateFeatureFlagsServerAction(
  formData: FormData
): Promise<FeatureFlagActionResult> {
  const requestId = `batch-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🔍 Parse and validate
    const batchData = schemas.parseBatchUpdateFeatureFlagFormData(formData);
    validators.validateBatchOperation(batchData.operations);

    // 🔐 Security audit log (CRÍTICO)
    featureFlagsSecurityLogger.security("BATCH_UPDATE_ATTEMPT", {
      requestId,
      userId: session.user.id,
      operationCount: batchData.operations.length,
    });

    // 🏢 Business logic via service
    featureFlagsBatchLogger.batchStart(
      "update",
      batchData.operations.length,
      session.user.id
    );

    let updatedCount = 0;
    let needsSchemaRegeneration = false;

    for (const operation of batchData.operations) {
      try {
        const result = await featureFlagService.updateFlag(
          operation.flagKey,
          { enabled: operation.enabled },
          session.user.id
        );

        if (result.hasPrismaModels) {
          needsSchemaRegeneration = true;
        }

        updatedCount++;
        featureFlagsBatchLogger.batchProgress(
          "update",
          updatedCount,
          batchData.operations.length
        );
      } catch (operationError) {
        featureFlagsServerActionLogger.error(
          `Batch operation failed for ${operation.flagKey}`,
          operationError,
          { requestId, flagKey: operation.flagKey }
        );
      }
    }

    // 🔄 Schema regeneration if needed
    if (needsSchemaRegeneration) {
      try {
        const enabledFlags = await featureFlagService.getSchemaFlags();
        await regenerateSchema(enabledFlags);
        featureFlagsSchemaLogger.schema("regenerate_batch", true, {
          requestId,
        });
      } catch (schemaError) {
        featureFlagsSchemaLogger.schema("regenerate_batch", false, {
          requestId,
          error: schemaError,
        });
      }
    }

    // 🔄 Cache invalidation
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.FLAGS);
    revalidatePath(FEATURE_FLAGS_PATHS.ADMIN);
    await invalidateFeatureFlagsCache();

    featureFlagsBatchLogger.batchComplete(
      "update",
      updatedCount,
      batchData.operations.length
    );

    return {
      success: true,
      data: { updatedCount },
      message: `${updatedCount} feature flags actualizados exitosamente`,
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Batch update failed", error, {
      requestId,
    });

    // 🔐 Security audit for failed attempt
    featureFlagsSecurityLogger.security("BATCH_UPDATE_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error en actualización masiva",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 🔄 INVALIDATE CACHE (Enterprise Server Action)
export async function invalidateCacheServerAction(): Promise<FeatureFlagActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🏢 Business logic via service
    await invalidateFeatureFlagsCache();
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.FLAGS);
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.CONFIG);
    revalidatePath(FEATURE_FLAGS_PATHS.ADMIN);

    featureFlagsServerActionLogger.info("Cache invalidated successfully", {
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Cache invalidado exitosamente",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Cache invalidation failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error invalidando cache",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🚀 INITIALIZE FEATURE FLAGS (Enterprise Server Action)
export async function initializeFeatureFlagsServerAction(): Promise<FeatureFlagActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🏢 Business logic via service
    await featureFlagService.initializeDefaultFlags();

    // 🔄 Cache invalidation
    revalidateTag(FEATURE_FLAGS_CACHE_TAGS.FLAGS);
    revalidatePath(FEATURE_FLAGS_PATHS.ADMIN);

    return {
      success: true,
      message: "Sistema de feature flags inicializado exitosamente",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    featureFlagsServerActionLogger.error("Initialization failed", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error inicializando sistema",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🎯 LEGACY COMPATIBILITY FUNCTIONS
// Re-export main functions with old names for compatibility
export const getAllFeatureFlagsAction = getAllFeatureFlagsServerAction;
export const createFeatureFlagAction = createFeatureFlagServerAction;
export const updateFeatureFlagAction = updateFeatureFlagServerAction;
export const toggleFeatureFlagAction = toggleFeatureFlagServerAction;
export const deleteFeatureFlagAction = deleteFeatureFlagServerAction;
export const batchUpdateFeatureFlagsAction =
  batchUpdateFeatureFlagsServerAction;
export const invalidateCacheAction = invalidateCacheServerAction;
export const initializeFeatureFlagsAction = initializeFeatureFlagsServerAction;

// 🔄 React 19 useActionState compatibility
export const toggleFeatureFlagActionState = async (
  prevState: FeatureFlagActionResult | null,
  formData: FormData
): Promise<FeatureFlagActionResult> => {
  return await toggleFeatureFlagServerAction(formData);
};
