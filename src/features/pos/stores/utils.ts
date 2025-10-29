/**
 * Store Utilities
 * ===============
 *
 * Utilities for Zustand stores to work properly with Next.js 15 SSR
 *
 * @module pos/stores/utils
 */

import { useEffect, useState } from 'react';

/**
 * Hook to ensure hydration on client-side only
 * Prevents SSR/hydration mismatches with Zustand
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Default state for SSR
 * Returns a function that always returns the same default value
 * This prevents the getServerSnapshot warning
 */
export function createSSRDefault<T>(defaultValue: T) {
  // Cache the function to prevent recreating on every render
  const cachedFn = () => defaultValue;
  return cachedFn;
}
