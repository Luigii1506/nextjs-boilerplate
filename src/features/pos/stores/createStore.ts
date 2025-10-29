/**
 * Store Creator Utilities
 * =======================
 *
 * Utilities para crear stores de Zustand compatibles con Next.js 15
 * Soluciona el warning de getServerSnapshot
 *
 * @module pos/stores/createStore
 */

import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Create a Zustand store with proper SSR handling
 * Caches getServerSnapshot to avoid infinite loop warning
 */
export function createPOSStore<T extends object>(
  storeCreator: StateCreator<T, [["zustand/devtools", never]], []>,
  name: string
) {
  return create<T>()(devtools(storeCreator, { name }));
}
