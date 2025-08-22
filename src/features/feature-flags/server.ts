/**
 * 🏢 SERVER-SIDE FEATURE FLAGS
 * ============================
 *
 * Cached, secure, performant server-side utilities.
 * Handles database integration and caching.
 *
 * Simple: 2025-01-17 - Server utilities
 */

import { unstable_cache } from "next/cache";
import { prisma } from "@/core/database/prisma";
import { FEATURE_FLAGS, getFeatureCategory } from "./config";
import type { FeatureFlag, FeatureFlagData, FeatureCategory } from "./types";

// 🗄️ Cache configuration
const CACHE_CONFIG = {
  revalidate: 30, // 30 seconds
  tags: ["feature-flags"],
} as const;

// 🗄️ Cached server-side feature flags
export const getServerFeatureFlags = unstable_cache(
  async (): Promise<Record<string, boolean>> => {
    try {
      // 🔍 Get dynamic flags from database
      const dbFlags = await prisma.featureFlag.findMany({
        select: { key: true, enabled: true },
        where: { key: { in: Object.keys(FEATURE_FLAGS) } }, // Only known flags
      });

      // 🔄 Merge with static config (DB overrides static)
      const result: Record<string, boolean> = { ...FEATURE_FLAGS };
      dbFlags.forEach((flag) => {
        if (flag.key in result) {
          result[flag.key] = flag.enabled;
        }
      });

      return result;
    } catch (error) {
      console.error("[FeatureFlags] Database error:", error);
      return { ...FEATURE_FLAGS }; // Fallback to static config
    }
  },
  ["server-feature-flags"],
  {
    revalidate: CACHE_CONFIG.revalidate,
    tags: [...CACHE_CONFIG.tags],
  }
);

// 🎯 Check single feature (server-side)
export async function isServerFeatureEnabled(
  flag: FeatureFlag
): Promise<boolean> {
  const flags = await getServerFeatureFlags();
  return flags[flag] || false;
}

// 📊 Get multiple features at once (optimized)
export async function getMultipleServerFeatures(
  flagKeys: FeatureFlag[]
): Promise<Record<FeatureFlag, boolean>> {
  const allFlags = await getServerFeatureFlags();
  const result: Record<string, boolean> = {};

  flagKeys.forEach((key) => {
    result[key] = allFlags[key] || false;
  });

  return result as Record<FeatureFlag, boolean>;
}

// 📊 Get all flags with metadata (for admin UI)
export async function getFeatureFlagsWithMetadata(): Promise<
  FeatureFlagData[]
> {
  try {
    const serverFlags = await getServerFeatureFlags();

    // Get additional metadata from DB
    const dbFlags = await prisma.featureFlag.findMany({
      select: {
        key: true,
        name: true,
        description: true,
        enabled: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create a map for faster lookups
    const dbFlagsMap = new Map(dbFlags.map((flag) => [flag.key, flag]));

    // Merge static config with DB metadata
    return Object.entries(serverFlags).map(([key, enabled]) => {
      const dbFlag = dbFlagsMap.get(key);
      return {
        key: key as FeatureFlag,
        name: dbFlag?.name || formatFlagName(key),
        description:
          dbFlag?.description || `${formatFlagName(key)} feature flag`,
        enabled,
        category:
          (dbFlag?.category as FeatureCategory) || getFeatureCategory(key),
        isStatic: !dbFlag,
        createdAt: dbFlag?.createdAt || new Date(),
        updatedAt: dbFlag?.updatedAt || new Date(),
      };
    });
  } catch (error) {
    console.error("[FeatureFlags] Metadata error:", error);
    throw error;
  }
}

// 🔄 Cache invalidation
export async function invalidateFeatureFlagsCache(): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("feature-flags");
  console.log("[FeatureFlags] Cache invalidated");
}

// 🎯 Utility: Format flag name for display
function formatFlagName(flagKey: string): string {
  return flagKey
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

// 🔍 Debug utilities (development only)
export const FeatureFlagsDebug = {
  /**
   * Get all feature flags with detailed info (dev only)
   */
  async getAllWithDetails() {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Debug functions not available in production");
    }

    try {
      const serverFlags = await getServerFeatureFlags();
      const metadata = await getFeatureFlagsWithMetadata();

      return {
        static: FEATURE_FLAGS,
        server: serverFlags,
        metadata,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: FEATURE_FLAGS,
      };
    }
  },

  /**
   * Force cache refresh (dev only)
   */
  async refreshCache() {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Debug functions not available in production");
    }

    await invalidateFeatureFlagsCache();
    return "Cache refreshed successfully";
  },
};
