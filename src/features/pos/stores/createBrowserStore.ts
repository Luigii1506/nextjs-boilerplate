/**
 * Browser Store Creator
 * =====================
 *
 * Creates Zustand stores that only work on the client-side
 * Fixes the getServerSnapshot warning in Next.js 15
 *
 * @module pos/stores/createBrowserStore
 */

'use client';

import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Create a client-only Zustand store
 * This ensures the store only runs in the browser
 */
export function createBrowserStore<T extends object>(
  storeCreator: StateCreator<T, [["zustand/devtools", never]], []>,
  name: string
) {
  // Ensure we're only creating the store on the client
  if (typeof window === 'undefined') {
    // Return a dummy store for SSR
    return (() => {
      throw new Error(`Store ${name} should not be accessed during SSR`);
    }) as any;
  }

  return create<T>()(devtools(storeCreator, { name }));
}
