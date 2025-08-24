"use server";

/**
 * ⚙️ SETTINGS SERVER ACTIONS - SIMPLE CONFIG MODULE
 * =================================================
 *
 * Server actions simples para configuración - No necesita arquitectura completa
 * Solo CRUD básico para settings management
 *
 * Simple: 2025-01-18 - Appropriate for config module
 */

import { revalidateTag } from "next/cache";
import { requireAuth } from "@/core/auth/server";
import { SETTINGS_CACHE_TAGS } from "./constants";
import type { ActionResult } from "@/shared/types";
import type {
  SettingCategory,
  SettingWithValue,
  SettingsOperationResult,
} from "./types";

/**
 * 📊 GET SETTINGS BY CATEGORY
 */
export async function getSettingsByCategoryAction(
  category: SettingCategory
): Promise<ActionResult<SettingWithValue[]>> {
  try {
    // 🔐 Auth check
    const session = await requireAuth();
    const userRole = session.user.role || "user";

    // 🛡️ Permission check (basic)
    if (!["admin", "super_admin"].includes(userRole)) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    // 🗄️ Mock data - In real app, would query database
    console.log(`[Settings] Fetching settings for category: ${category}`);

    // Simulate DB query delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockSettings: SettingWithValue[] = [
      {
        id: "app.name",
        category: "app",
        key: "app.name",
        name: "Application Name",
        description: "The name of your application",
        type: "string",
        value: process.env.NEXT_PUBLIC_APP_NAME || "My Next.js App",
        defaultValue: "Next.js Boilerplate",
        isRequired: true,
        isSecret: false,
        environment: "all",
        validation: {
          type: "string",
          minLength: 1,
          maxLength: 50,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
        updatedBy: session.user.id,
        canEdit: true,
      },
      {
        id: "app.description",
        category: "app",
        key: "app.description",
        name: "Application Description",
        description: "Brief description of your application",
        type: "text",
        value:
          process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
          "A powerful Next.js application",
        defaultValue: "Enterprise Next.js boilerplate",
        isRequired: false,
        isSecret: false,
        environment: "all",
        validation: {
          type: "string",
          maxLength: 200,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
        updatedBy: session.user.id,
        canEdit: true,
      },
      {
        id: "app.version",
        category: "app",
        key: "app.version",
        name: "Application Version",
        description: "Current version of the application",
        type: "string",
        value: "1.0.0",
        defaultValue: "1.0.0",
        isRequired: true,
        isSecret: false,
        environment: "all",
        validation: {
          type: "string",
          pattern: "^\\d+\\.\\d+\\.\\d+$",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
        updatedBy: "system",
        canEdit: false, // Version controlled separately
      },
    ];

    // Filter by category
    const filteredSettings = mockSettings.filter(
      (s) => s.category === category
    );

    return {
      success: true,
      data: filteredSettings,
    };
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch settings",
    };
  }
}

/**
 * 📊 GET SETTINGS STATS
 */
export async function getSettingsStatsAction(): Promise<
  ActionResult<{
    totalSettings: number;
    configuredSettings: number;
    healthScore: number;
    lastUpdated: Date;
  }>
> {
  try {
    // 🔐 Auth check
    const session = await requireAuth();
    const userRole = session.user.role || "user";

    if (!["admin", "super_admin"].includes(userRole)) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    // 🗄️ Mock stats calculation
    console.log("[Settings] Calculating settings stats");

    await new Promise((resolve) => setTimeout(resolve, 200));

    const stats = {
      totalSettings: 45,
      configuredSettings: 32,
      healthScore: 87,
      lastUpdated: new Date(),
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("❌ Error fetching settings stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}

/**
 * ✏️ UPDATE SETTING
 */
export async function updateSettingAction(
  key: string,
  value: unknown
): Promise<ActionResult<SettingsOperationResult<SettingWithValue>>> {
  try {
    // 🔐 Auth check
    const session = await requireAuth();
    const userRole = session.user.role || "user";

    if (!["admin", "super_admin"].includes(userRole)) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    // 🔍 Basic validation
    if (!key || typeof key !== "string") {
      return {
        success: false,
        error: "Invalid setting key",
      };
    }

    console.log(`[Settings] Updating setting: ${key} = ${value}`);

    // 🗄️ Mock update - In real app, would update database/env vars
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 🔄 Invalidate cache
    const category = key.split(".")[0] as SettingCategory;
    revalidateTag(SETTINGS_CACHE_TAGS.CATEGORY(category));
    revalidateTag(SETTINGS_CACHE_TAGS.STATS);

    const result: SettingsOperationResult<SettingWithValue> = {
      success: true,
      message: `Setting ${key} updated successfully`,
      timestamp: new Date(),
    };

    return {
      success: true,
      data: result,
      message: result.message,
    };
  } catch (error) {
    console.error("❌ Error updating setting:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update setting",
    };
  }
}

/**
 * 🔄 RESET SETTINGS TO DEFAULT
 */
export async function resetSettingsAction(
  category: SettingCategory
): Promise<ActionResult<SettingsOperationResult<void>>> {
  try {
    // 🔐 Auth check
    const session = await requireAuth();
    const userRole = session.user.role || "user";

    if (userRole !== "super_admin") {
      return {
        success: false,
        error: "Only super admins can reset settings",
      };
    }

    console.log(`[Settings] Resetting settings for category: ${category}`);

    // 🗄️ Mock reset - In real app, would reset to defaults
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 🔄 Invalidate cache
    revalidateTag(SETTINGS_CACHE_TAGS.CATEGORY(category));
    revalidateTag(SETTINGS_CACHE_TAGS.STATS);

    const result: SettingsOperationResult<void> = {
      success: true,
      message: `Settings for ${category} reset to defaults`,
      timestamp: new Date(),
    };

    return {
      success: true,
      data: result,
      message: result.message,
    };
  } catch (error) {
    console.error("❌ Error resetting settings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset settings",
    };
  }
}

/**
 * 🔍 VALIDATE SETTING VALUE
 */
export async function validateSettingAction(
  key: string,
  value: unknown
): Promise<ActionResult<{ isValid: boolean; errors?: string[] }>> {
  try {
    // 🔐 Auth check
    const session = await requireAuth();
    const userRole = session.user.role || "user";

    if (!["admin", "super_admin"].includes(userRole)) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    console.log(`[Settings] Validating setting: ${key}`);

    // 🔍 Mock validation - In real app, would use Zod schemas
    const errors: string[] = [];

    // Basic validation examples
    if (
      key === "app.name" &&
      (!value || typeof value !== "string" || value.length < 1)
    ) {
      errors.push("App name is required and must be a non-empty string");
    }

    if (key === "app.name" && typeof value === "string" && value.length > 50) {
      errors.push("App name must be 50 characters or less");
    }

    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      success: true,
      data: {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    console.error("❌ Error validating setting:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to validate setting",
    };
  }
}
