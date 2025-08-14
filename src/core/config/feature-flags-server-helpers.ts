/**
 * 🏢 SERVER COMPONENTS FEATURE FLAGS HELPERS
 * ===========================================
 *
 * Utilidades para acceder a feature flags desde Server Components
 * Los flags han sido evaluados previamente en el middleware (edge)
 *
 * Enterprise Pattern:
 * - Zero additional database queries
 * - Ultra-fast flag access (already evaluated)
 * - Consistent server/client state
 * - Perfect for Server Components
 *
 * Created: 2025-01-29
 */

import { headers, cookies } from "next/headers";
import { getServerFeatureFlags } from "./server-feature-flags";
import type { FeatureFlag } from "./feature-flags";

/**
 * 🚀 PRIMARY METHOD: Get feature flags evaluated by middleware
 * This is the FASTEST method - uses flags already evaluated at edge
 */
export async function getFeatureFlags(): Promise<Record<string, boolean>> {
  try {
    // 1️⃣ Try to get from middleware headers first (fastest)
    const headersList = await headers();
    const flagsHeader = headersList.get("x-feature-flags");

    if (flagsHeader) {
      return JSON.parse(flagsHeader);
    }

    // 2️⃣ Fallback: get from cookies (still fast)
    const cookieStore = await cookies();
    const flagsCookie = cookieStore.get("feature-flags");

    if (flagsCookie) {
      return JSON.parse(flagsCookie.value);
    }

    // 3️⃣ Last resort: evaluate here (slower but still cached)
    console.warn(
      "[FeatureFlags] Neither header nor cookie found, evaluating server-side"
    );
    return await getServerFeatureFlags();
  } catch (error) {
    console.error(
      "[FeatureFlags] Failed to parse from headers/cookies:",
      error
    );

    // 🛟 Final fallback: evaluate with server function
    try {
      return await getServerFeatureFlags();
    } catch (fallbackError) {
      console.error(
        "[FeatureFlags] Server evaluation also failed:",
        fallbackError
      );
      return {};
    }
  }
}

/**
 * 🎯 TYPE-SAFE FEATURE FLAG CHECKER
 * Check if a specific feature flag is enabled
 */
export async function isFeatureEnabled(flag: FeatureFlag): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[flag] || false;
}

/**
 * 📊 BATCH FEATURE FLAG CHECKER
 * Check multiple flags at once (optimized)
 */
export async function areMultipleFeaturesEnabled(
  flagKeys: FeatureFlag[]
): Promise<Record<FeatureFlag, boolean>> {
  const allFlags = await getFeatureFlags();
  const result: Record<string, boolean> = {};

  flagKeys.forEach((key) => {
    result[key] = allFlags[key] || false;
  });

  return result as Record<FeatureFlag, boolean>;
}

/**
 * 🧪 A/B TESTING SERVER COMPONENT HELPER
 * Get experiment variant for current user
 */
export async function getExperimentVariant(
  experimentKey: string,
  userId: string,
  variants: string[] = ["control", "test"]
): Promise<string> {
  // Import dynamic to avoid edge runtime issues
  const { getExperimentVariant: getVariant } = await import(
    "./server-feature-flags"
  );
  return getVariant(experimentKey, userId, variants);
}

// Note: React Server Components with JSX are exported from a separate file
// to avoid TypeScript parsing issues in this utility file.
// See: feature-flags-server-components.tsx for UI components

// Re-export Server Components for convenience
export {
  FeatureBoundary,
  ConditionalNavItem,
  FeatureFlagsDebugInfo,
  FeatureFlagsMetrics,
} from "./feature-flags-server-components";
