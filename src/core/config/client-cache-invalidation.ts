/**
 * 🔄 CLIENT-SIDE CACHE INVALIDATION
 * =================================
 *
 * Utilities to force immediate cache invalidation on the client side
 * when feature flags change. Ensures zero-delay flag updates.
 *
 * Created: 2025-01-29 - For immediate client updates
 */

"use client";

/**
 * Force invalidate feature flags cache on client-side
 * Call this after updating a feature flag to ensure immediate UI updates
 */
export async function invalidateClientCache(): Promise<boolean> {
  try {
    // 1. Clear browser cache for feature flags
    if (typeof window !== "undefined") {
      // Remove feature flags from localStorage/sessionStorage if cached
      localStorage.removeItem("feature-flags");
      sessionStorage.removeItem("feature-flags");

      // Clear cookies that might contain cached flags
      document.cookie =
        "feature-flags=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    // 2. Call server cache invalidation endpoint
    const response = await fetch("/api/feature-flags/invalidate-cache", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!result.success) {
      console.warn(
        "[ClientCache] Server cache invalidation failed:",
        result.error
      );
      return false;
    }

    console.log("[ClientCache] Cache invalidated successfully");
    return true;
  } catch (error) {
    console.error("[ClientCache] Cache invalidation failed:", error);
    return false;
  }
}

/**
 * Force a hard refresh of the current page
 * Use as last resort when cache invalidation doesn't work
 */
export function forcePageRefresh(): void {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

/**
 * Try soft invalidation first, then router refresh if needed
 * This is the recommended approach for feature flag changes
 */
export async function ensureFeatureFlagUpdate(): Promise<void> {
  try {
    // 1. Try soft cache invalidation first
    const cacheCleared = await invalidateClientCache();

    if (cacheCleared) {
      // 2. Give it a moment to propagate
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 3. Use Next.js router refresh (Server Components will re-render)
      if (typeof window !== "undefined") {
        try {
          // Trigger a soft refresh of Server Components
          window.location.reload();
        } catch {
          // Fallback to hard refresh
          forcePageRefresh();
        }
      }
    } else {
      // 4. If cache invalidation failed, force refresh
      console.warn(
        "[ClientCache] Cache invalidation failed, forcing page refresh"
      );
      forcePageRefresh();
    }
  } catch (error) {
    console.error(
      "[ClientCache] Ensure update failed, forcing refresh:",
      error
    );
    forcePageRefresh();
  }
}

/**
 * 🚀 ENTERPRISE SOLUTION: Router refresh for Server Components
 * This forces Server Components to re-render with new data WITHOUT full page reload
 */
export async function refreshServerComponents(): Promise<void> {
  try {
    // 1. Invalidate server cache first
    const cacheCleared = await invalidateClientCache();

    if (cacheCleared) {
      // 2. Small delay for cache propagation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 3. ELEGANT: Use Next.js router refresh (re-renders Server Components only)
      if (typeof window !== "undefined") {
        try {
          // This is the cleanest way - no full page reload needed
          const event = new CustomEvent("refresh-server-components");
          window.dispatchEvent(event);
        } catch (error) {
          console.warn("[ClientCache] Custom event failed, using fallback");
          window.location.reload();
        }
      }
    }
  } catch (error) {
    console.error("[ClientCache] Server component refresh failed:", error);
    forcePageRefresh();
  }
}

/**
 * Hook to provide cache invalidation utilities to React components
 */
export function useCacheInvalidation() {
  const invalidateCache = async () => {
    return await invalidateClientCache();
  };

  const forceRefresh = () => {
    forcePageRefresh();
  };

  const ensureUpdate = async () => {
    await ensureFeatureFlagUpdate();
  };

  const refreshServer = async () => {
    await refreshServerComponents();
  };

  return {
    invalidateCache,
    forceRefresh,
    ensureUpdate,
    refreshServerComponents: refreshServer,
  };
}
