/**
 * 🚀 FEATURE FLAGS SERVER ACTIONS
 * ===============================
 *
 * Simple, secure, validated server actions.
 * Handles all feature flag mutations with proper auth.
 *
 * Simple: 2025-01-17 - Server actions
 */

"use server";

import { prisma } from "@/core/database/prisma";
import { requireAuth } from "@/core/auth/server";
import {
  getFeatureFlagsWithMetadata,
  invalidateFeatureFlagsCache,
} from "./feature-flags.server";
import type {
  FeatureFlagActionResult,
  FeatureFlagData,
  FeatureFlagBatchUpdate,
  FeatureFlagBatchResult,
} from "./feature-flags.types";

// 🛡️ Auth helper
async function requireAdminAuth() {
  const session = await requireAuth();

  if (!session || !session.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  if (session.user.role !== "admin" && session.user.role !== "super_admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return session;
}

// 🔍 Get all feature flags (for admin UI)
export async function getFeatureFlagsAction(): Promise<
  FeatureFlagActionResult<FeatureFlagData[]>
> {
  try {
    // 🛡️ Simple auth check
    await requireAdminAuth();

    const flags = await getFeatureFlagsWithMetadata();

    return {
      success: true,
      data: flags,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[FeatureFlags] Get flags error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load feature flags",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🔄 Toggle feature flag
export async function toggleFeatureFlagAction(
  flagKey: string
): Promise<FeatureFlagActionResult<{ key: string; enabled: boolean }>> {
  try {
    // 🛡️ Auth + validation
    const session = await requireAdminAuth();

    // 🔍 Simple validation
    if (!flagKey || typeof flagKey !== "string") {
      return {
        success: false,
        error: "Invalid flag key",
        timestamp: new Date().toISOString(),
      };
    }

    // 🔄 Get current state and toggle
    const currentFlag = await prisma.featureFlag.findUnique({
      where: { key: flagKey },
      select: { enabled: true },
    });

    const newEnabledState = currentFlag ? !currentFlag.enabled : true;

    // 🔄 Update or create with toggled value
    const updatedFlag = await prisma.featureFlag.upsert({
      where: { key: flagKey },
      update: {
        enabled: newEnabledState,
        updatedAt: new Date(),
      },
      create: {
        key: flagKey,
        name: formatFlagName(flagKey),
        description: `${formatFlagName(flagKey)} feature flag`,
        enabled: newEnabledState,
        category: "module",
      },
      select: { key: true, enabled: true },
    });

    // 🔄 Invalidate cache
    await invalidateFeatureFlagsCache();

    // 📊 Simple audit log
    console.log(
      `[FeatureFlags] ${flagKey} toggled to ${updatedFlag.enabled} by ${session.user.email}`
    );

    return {
      success: true,
      data: { key: updatedFlag.key, enabled: updatedFlag.enabled },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[FeatureFlags] Toggle error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle feature flag",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🔄 Update feature flag (set specific value)
export async function updateFeatureFlagAction(
  flagKey: string,
  enabled: boolean
): Promise<FeatureFlagActionResult<{ key: string; enabled: boolean }>> {
  try {
    const session = await requireAdminAuth();

    if (
      !flagKey ||
      typeof flagKey !== "string" ||
      typeof enabled !== "boolean"
    ) {
      return {
        success: false,
        error: "Invalid parameters",
        timestamp: new Date().toISOString(),
      };
    }

    const updatedFlag = await prisma.featureFlag.upsert({
      where: { key: flagKey },
      update: {
        enabled,
        updatedAt: new Date(),
      },
      create: {
        key: flagKey,
        name: formatFlagName(flagKey),
        description: `${formatFlagName(flagKey)} feature flag`,
        enabled,
        category: "module",
      },
      select: { key: true, enabled: true },
    });

    await invalidateFeatureFlagsCache();

    console.log(
      `[FeatureFlags] ${flagKey} set to ${enabled} by ${session.user.email}`
    );

    return {
      success: true,
      data: { key: updatedFlag.key, enabled: updatedFlag.enabled },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[FeatureFlags] Update error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update feature flag",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🔄 Batch update feature flags
export async function batchUpdateFeatureFlagsAction(
  updates: FeatureFlagBatchUpdate[]
): Promise<FeatureFlagActionResult<FeatureFlagBatchResult>> {
  try {
    const session = await requireAdminAuth();

    // 🔍 Validation
    if (!Array.isArray(updates) || updates.length === 0) {
      return {
        success: false,
        error: "Invalid updates array",
        timestamp: new Date().toISOString(),
      };
    }

    // 🔄 Batch update with transaction
    const results = await prisma.$transaction(
      updates.map(({ key, enabled }) =>
        prisma.featureFlag.upsert({
          where: { key },
          update: { enabled, updatedAt: new Date() },
          create: {
            key,
            name: formatFlagName(key),
            description: `${formatFlagName(key)} feature flag`,
            enabled,
            category: "module",
          },
        })
      )
    );

    await invalidateFeatureFlagsCache();

    console.log(
      `[FeatureFlags] Batch updated ${results.length} flags by ${session.user.email}`
    );

    return {
      success: true,
      data: {
        updated: results.length,
        total: updates.length,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[FeatureFlags] Batch update error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update feature flags",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🗑️ Delete feature flag (removes from DB, falls back to static)
export async function deleteFeatureFlagAction(
  flagKey: string
): Promise<FeatureFlagActionResult<{ key: string }>> {
  try {
    const session = await requireAdminAuth();

    if (!flagKey || typeof flagKey !== "string") {
      return {
        success: false,
        error: "Invalid flag key",
        timestamp: new Date().toISOString(),
      };
    }

    // 🗑️ Delete from database (will fall back to static config)
    await prisma.featureFlag.delete({
      where: { key: flagKey },
    });

    await invalidateFeatureFlagsCache();

    console.log(`[FeatureFlags] ${flagKey} deleted by ${session.user.email}`);

    return {
      success: true,
      data: { key: flagKey },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[FeatureFlags] Delete error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete feature flag",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🔄 Refresh cache action
export async function refreshFeatureFlagsCacheAction(): Promise<
  FeatureFlagActionResult<{ message: string }>
> {
  try {
    await requireAdminAuth();

    await invalidateFeatureFlagsCache();

    return {
      success: true,
      data: { message: "Cache refreshed successfully" },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[FeatureFlags] Cache refresh error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to refresh cache",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🎯 Utility: Format flag name for display
function formatFlagName(flagKey: string): string {
  return flagKey
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}
