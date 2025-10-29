/**
 * 🛒 POS Sale Store (Zustand)
 * ===========================
 *
 * Global state management for POS sales/cart using Zustand.
 * Replaces the old SaleProvider with a centralized store.
 *
 * @module pos/stores/saleStore
 * @version 3.0.0
 * Updated: 2025-10-28 - Added computed selectors and stabilized action hooks for React 19
 */

'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as actions from '../sale/server/actions';
import type { POSSaleItemWithProduct, POSSaleSummary } from '../sale/types';

// ========================================
// TYPES
// ========================================

interface SaleState {
  // State
  sessionId: string | null;
  items: POSSaleItemWithProduct[];
  summary: POSSaleSummary;
  isLoading: boolean;
  isInitialized: boolean;

  // Computed selectors (stable functions)
  itemCount: () => number;
  total: () => number;
  hasItems: () => boolean;
  canCheckout: () => boolean;

  // Actions
  setSessionId: (sessionId: string | null) => void;
  initializeSale: (sessionId: string) => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearSale: () => Promise<void>;
  applyDiscount: (type: 'percentage' | 'fixed', value: number) => Promise<void>;
  refreshSale: () => Promise<void>;
  reset: () => void;
}

// ========================================
// INITIAL STATE
// ========================================

const initialSummary: POSSaleSummary = {
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  tax: 0,
  taxRate: 0.16,
  total: 0,
};

// ========================================
// STORE
// ========================================

export const useSaleStore = create<SaleState>()(
  devtools(
    (set, get) => ({
      // ========================================
      // INITIAL STATE
      // ========================================

      sessionId: null,
      items: [],
      summary: initialSummary,
      isLoading: false,
      isInitialized: false,

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Set session ID (required for all operations)
       */
      setSessionId: (sessionId: string | null) => {
        set({ sessionId, isInitialized: false });

        // Auto-initialize when sessionId is set
        if (sessionId) {
          get().initializeSale(sessionId);
        }
      },

      /**
       * Initialize sale from server
       */
      initializeSale: async (sessionId: string) => {
        set({ isLoading: true });

        try {
          const result = await actions.getActiveSaleAction(sessionId);

          if (result.success && result.data) {
            const { sale, summary: fetchedSummary } = result.data;

            set({
              items: sale?.items || [],
              summary: fetchedSummary || initialSummary,
              isLoading: false,
              isInitialized: true,
            });
          } else {
            // No active sale, initialize empty
            set({
              items: [],
              summary: initialSummary,
              isLoading: false,
              isInitialized: true,
            });
          }
        } catch (error) {
          console.error('[SaleStore] Initialize error:', error);
          set({
            items: [],
            summary: initialSummary,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      /**
       * Add item to sale
       */
      addItem: async (productId: string, quantity: number = 1) => {
        const sessionId = get().sessionId;

        if (!sessionId) {
          console.error('[SaleStore] No session ID');
          throw new Error('No session ID available');
        }

        set({ isLoading: true });

        try {
          const result = await actions.addToSaleAction(sessionId, productId, quantity);

          if (result.success && result.data) {
            const { sale, summary: updatedSummary } = result.data;

            set({
              items: sale?.items || [],
              summary: updatedSummary || initialSummary,
              isLoading: false,
            });

            console.log('[SaleStore] Item added:', result.message);
          } else {
            set({ isLoading: false });
            throw new Error(result.error || 'Failed to add item');
          }
        } catch (error) {
          console.error('[SaleStore] Add item error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Update item quantity
       */
      updateQuantity: async (itemId: string, quantity: number) => {
        const sessionId = get().sessionId;

        if (!sessionId) {
          console.error('[SaleStore] No session ID');
          throw new Error('No session ID available');
        }

        set({ isLoading: true });

        try {
          const result = await actions.updateSaleQuantityAction(
            sessionId,
            itemId,
            quantity
          );

          if (result.success && result.data) {
            const { sale, summary: updatedSummary } = result.data;

            set({
              items: sale?.items || [],
              summary: updatedSummary || initialSummary,
              isLoading: false,
            });

            console.log('[SaleStore] Quantity updated:', result.message);
          } else {
            set({ isLoading: false });
            throw new Error(result.error || 'Failed to update quantity');
          }
        } catch (error) {
          console.error('[SaleStore] Update quantity error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Remove item from sale
       */
      removeItem: async (itemId: string) => {
        const sessionId = get().sessionId;

        if (!sessionId) {
          console.error('[SaleStore] No session ID');
          throw new Error('No session ID available');
        }

        set({ isLoading: true });

        try {
          const result = await actions.removeFromSaleAction(sessionId, itemId);

          if (result.success && result.data) {
            const { sale, summary: updatedSummary } = result.data;

            if (sale === null) {
              // Sale was deleted (no items left)
              set({
                items: [],
                summary: initialSummary,
                isLoading: false,
              });
            } else {
              set({
                items: sale?.items || [],
                summary: updatedSummary || initialSummary,
                isLoading: false,
              });
            }

            console.log('[SaleStore] Item removed:', result.message);
          } else {
            set({ isLoading: false });
            throw new Error(result.error || 'Failed to remove item');
          }
        } catch (error) {
          console.error('[SaleStore] Remove item error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Clear entire sale
       */
      clearSale: async () => {
        const sessionId = get().sessionId;

        if (!sessionId) {
          console.error('[SaleStore] No session ID');
          throw new Error('No session ID available');
        }

        set({ isLoading: true });

        try {
          const result = await actions.clearSaleAction(sessionId);

          if (result.success) {
            set({
              items: [],
              summary: initialSummary,
              isLoading: false,
            });

            console.log('[SaleStore] Sale cleared');
          } else {
            set({ isLoading: false });
            throw new Error(result.error || 'Failed to clear sale');
          }
        } catch (error) {
          console.error('[SaleStore] Clear sale error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Apply discount to sale
       */
      applyDiscount: async (type: 'percentage' | 'fixed', value: number) => {
        const sessionId = get().sessionId;

        if (!sessionId) {
          console.error('[SaleStore] No session ID');
          throw new Error('No session ID available');
        }

        set({ isLoading: true });

        try {
          const result = await actions.applyDiscountAction(sessionId, type, value);

          if (result.success && result.data) {
            const { sale, summary: updatedSummary } = result.data;

            set({
              items: sale?.items || [],
              summary: updatedSummary || initialSummary,
              isLoading: false,
            });

            console.log('[SaleStore] Discount applied:', result.message);
          } else {
            set({ isLoading: false });
            throw new Error(result.error || 'Failed to apply discount');
          }
        } catch (error) {
          console.error('[SaleStore] Apply discount error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Refresh sale from server
       */
      refreshSale: async () => {
        const sessionId = get().sessionId;

        if (!sessionId) {
          return;
        }

        await get().initializeSale(sessionId);
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set({
          sessionId: null,
          items: [],
          summary: initialSummary,
          isLoading: false,
          isInitialized: false,
        });
      },

      // ========================================
      // COMPUTED SELECTORS
      // ========================================

      /**
       * Get total item count
       */
      itemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      /**
       * Get total amount
       */
      total: () => {
        return get().summary.total;
      },

      /**
       * Check if cart has items
       */
      hasItems: () => {
        return get().items.length > 0;
      },

      /**
       * Check if can proceed to checkout
       */
      canCheckout: () => {
        const state = get();
        const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
        return state.items.length > 0 && !state.isLoading && count > 0;
      },
    }),
    { name: 'POS-Sale' } // DevTools name
  )
);

// ========================================
// SELECTORS & ACTION HOOKS
// ========================================

/**
 * Stable sale actions hook
 * ------------------------
 * React 19 calls getSnapshot twice during render.
 * Creating a new object in the selector breaks caching.
 * We subscribe to each action individually and memoize the aggregated object.
 */
export const useSaleActions = () => {
  const setSessionId = useSaleStore((state) => state.setSessionId);
  const initializeSale = useSaleStore((state) => state.initializeSale);
  const addItem = useSaleStore((state) => state.addItem);
  const updateQuantity = useSaleStore((state) => state.updateQuantity);
  const removeItem = useSaleStore((state) => state.removeItem);
  const clearSale = useSaleStore((state) => state.clearSale);
  const applyDiscount = useSaleStore((state) => state.applyDiscount);
  const refreshSale = useSaleStore((state) => state.refreshSale);
  const reset = useSaleStore((state) => state.reset);

  return useMemo(
    () => ({
      setSessionId,
      initializeSale,
      addItem,
      updateQuantity,
      removeItem,
      clearSale,
      applyDiscount,
      refreshSale,
      reset,
    }),
    [setSessionId, initializeSale, addItem, updateQuantity, removeItem, clearSale, applyDiscount, refreshSale, reset]
  );
};

/**
 * Selector hooks for convenience
 */
export const useSaleItems = () => useSaleStore((state) => state.items);
export const useSaleSummary = () => useSaleStore((state) => state.summary);
export const useItemCount = () => useSaleStore((state) => state.itemCount());
export const useHasItems = () => useSaleStore((state) => state.hasItems());
export const useCanCheckout = () => useSaleStore((state) => state.canCheckout());

export type { SaleState };
