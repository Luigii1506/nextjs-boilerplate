/**
 * 🛒 POS SALE STORE (Zustand)
 * ===========================
 *
 * Single source of truth for the POS sale/cart flow.
 * Mirrors the storefront cart architecture so both channels share
 * the same mental model: normalized state, memoized action hooks and
 * selectors focused on primitives to avoid avoidable rerenders.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  addToSaleAction,
  applyDiscountAction,
  clearSaleAction,
  getActiveSaleAction,
  removeFromSaleAction,
  updateSaleQuantityAction,
  validateSaleForCheckoutAction,
} from "../server/actions";
import type {
  POSSaleAdjustment,
  POSSaleItemWithProduct,
  POSSaleSummary,
} from "../types";
import { logger } from "@/shared/utils/logger";

type SaleSnapshot =
  | {
      id?: string;
      sessionId?: string | null;
      items?: POSSaleItemWithProduct[] | null;
    }
  | null
  | undefined;

interface SaleValidation {
  isValid: boolean;
  errors: string[];
}

interface SaleStoreState {
  sessionId: string | null;
  saleId: string | null;
  items: POSSaleItemWithProduct[];
  summary: POSSaleSummary;
  adjustments: POSSaleAdjustment[];

  itemCount: number;
  uniqueItems: number;
  totalAmount: number;
  hasItems: boolean;
  canCheckout: boolean;

  lastValidation: SaleValidation | null;
  lastError: string | null;

  isLoading: boolean;
  isInitialized: boolean;
  isError: boolean;

  lastUpdatedAt: number | null;
}

interface SaleStoreActions {
  setSessionId: (sessionId: string | null) => void;
  setSaleSnapshot: (
    sale: SaleSnapshot,
    summaryOverride?: POSSaleSummary | null
  ) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;

  refreshSale: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearSale: () => Promise<void>;
  applyDiscount: (
    type: "percentage" | "fixed",
    value: number
  ) => Promise<void>;
  validateForCheckout: () => Promise<SaleValidation>;
}

type SaleStore = SaleStoreState & SaleStoreActions;

const STORE_NAME = "POS-Sale-Store";

const emptySummary: POSSaleSummary = {
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  fees: 0,
  tax: 0,
  taxRate: 0,
  total: 0,
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value instanceof Number) return value.valueOf();
  return 0;
};

const normaliseItems = (
  sale: SaleSnapshot
): POSSaleItemWithProduct[] => {
  if (!sale?.items || !Array.isArray(sale.items)) {
    return [];
  }

  return sale.items.map((rawItem) => {
    const quantity = toNumber(rawItem.quantity);
    const unitPrice = toNumber(rawItem.unitPrice);
    const discount = toNumber(rawItem.discount);
    const tax = toNumber(rawItem.tax);
    const subtotal =
      rawItem.subtotal != null
        ? toNumber(rawItem.subtotal)
        : unitPrice * quantity;
    const total =
      rawItem.total != null ? toNumber(rawItem.total) : subtotal;

    return {
      ...rawItem,
      quantity,
      unitPrice,
      discount,
      tax,
      subtotal,
      total,
    };
  });
};

const normaliseAdjustments = (
  sale: SaleSnapshot
): POSSaleAdjustment[] => {
  const rawAdjustments = (sale as any)?.adjustments;

  if (!rawAdjustments || !Array.isArray(rawAdjustments)) {
    return [];
  }

  return rawAdjustments.map((adjustment: any) => ({
    ...adjustment,
    amount: toNumber(adjustment.amount),
  }));
};

const normaliseSummary = (
  summary: POSSaleSummary | null | undefined,
  items: POSSaleItemWithProduct[]
): POSSaleSummary => {
  if (!summary) {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const total = items.reduce((acc, item) => acc + item.total, 0);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    return {
      itemCount,
      subtotal,
      discount: 0,
      fees: 0,
      tax: Math.max(0, total - subtotal),
      taxRate: itemCount > 0 ? 0.16 : 0,
      total,
    };
  }

  const itemCount =
    summary.itemCount ??
    items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    itemCount,
    subtotal: toNumber(summary.subtotal),
    discount: toNumber(summary.discount),
    fees: toNumber(summary.fees ?? 0),
    tax: toNumber(summary.tax),
    taxRate: summary.taxRate ?? 0,
    total: toNumber(summary.total ?? summary.subtotal),
  };
};

const createInitialState = (): SaleStoreState => ({
  sessionId: null,
  saleId: null,
  items: [],
  summary: { ...emptySummary },
  adjustments: [],
  itemCount: 0,
  uniqueItems: 0,
  totalAmount: 0,
  hasItems: false,
  canCheckout: false,
  lastValidation: null,
  lastError: null,
  isLoading: false,
  isInitialized: false,
  isError: false,
  lastUpdatedAt: null,
});

export const useSaleStore = create<SaleStore>()(
  devtools(
    (set, get) => ({
      ...createInitialState(),

      setSessionId: (sessionId) =>
        set((state) => {
          if (state.sessionId === sessionId) {
            return state;
          }

          if (!sessionId) {
            return {
              ...state,
              ...createInitialState(),
            };
          }

          return {
            ...state,
            sessionId,
            isInitialized: false,
            lastValidation: null,
            lastError: null,
            isError: false,
          };
        }),

      setSaleSnapshot: (sale, summaryOverride) =>
        set((state) => {
          if (!sale) {
            return {
              ...state,
              saleId: null,
              items: [],
              summary: { ...emptySummary },
              adjustments: [],
              itemCount: 0,
              uniqueItems: 0,
              totalAmount: 0,
              hasItems: false,
              canCheckout: false,
              lastValidation: null,
              lastUpdatedAt: Date.now(),
              isInitialized: true,
            };
          }

          const items = normaliseItems(sale);
          const adjustments = normaliseAdjustments(sale);
          const summary = normaliseSummary(summaryOverride, items);
          const itemCount = summary.itemCount;
          const uniqueItems = items.length;
          const totalAmount = summary.total;
          const hasItems = uniqueItems > 0;
          const canCheckout = hasItems && itemCount > 0;

          return {
            ...state,
            saleId: sale.id ?? null,
            items,
            summary,
            adjustments,
            itemCount,
            uniqueItems,
            totalAmount,
            hasItems,
            canCheckout,
            lastValidation: null,
            lastUpdatedAt: Date.now(),
            isInitialized: true,
            isError: false,
            lastError: null,
          };
        }),

      setLoading: (value) =>
        set((state) => ({
          ...state,
          isLoading: value,
        })),

      setError: (message) =>
        set((state) => ({
          ...state,
          isError: !!message,
          lastError: message,
        })),

      reset: () =>
        set(() => ({
          ...createInitialState(),
        })),

      refreshSale: async () => {
        const sessionId = get().sessionId;
        if (!sessionId) {
          get().setSaleSnapshot(null);
          return;
        }

        get().setLoading(true);
        get().setError(null);

        try {
          const result = await getActiveSaleAction(sessionId);
          if (result.success && result.data) {
            const { sale, summary } = result.data;
            get().setSaleSnapshot(sale ?? null, summary ?? null);
          } else {
            get().setSaleSnapshot(null);
            if (result.error) {
              get().setError(result.error);
            }
          }
        } catch (error) {
          logger.error("POS Sale Store: failed to refresh sale", { error });
          get().setSaleSnapshot(null);
          const message =
            error instanceof Error ? error.message : "Failed to refresh sale";
          get().setError(message);
        } finally {
          get().setLoading(false);
        }
      },

      addItem: async (productId, quantity = 1) => {
        const sessionId = get().sessionId;
        if (!sessionId) {
          throw new Error("POS session is not initialized. Cannot add items.");
        }

        get().setLoading(true);
        get().setError(null);

        try {
          const result = await addToSaleAction(sessionId, productId, quantity);
          if (!result.success || !result.data) {
            const message = result.error ?? "Failed to add item to sale";
            get().setError(message);
            throw new Error(message);
          }

          const { sale, summary } = result.data;
          get().setSaleSnapshot(sale ?? null, summary ?? null);
        } catch (error) {
          logger.error("POS Sale Store: add item failed", { error });
          const message =
            error instanceof Error ? error.message : "Failed to add item";
          get().setError(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const sessionId = get().sessionId;
        if (!sessionId) {
          throw new Error(
            "POS session is not initialized. Cannot update quantity."
          );
        }

        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        get().setLoading(true);
        get().setError(null);

        try {
          const result = await updateSaleQuantityAction(
            sessionId,
            itemId,
            quantity
          );

          if (!result.success || !result.data) {
            const message =
              result.error ?? "Failed to update sale item quantity";
            get().setError(message);
            throw new Error(message);
          }

          const { sale, summary } = result.data;
          get().setSaleSnapshot(sale ?? null, summary ?? null);
        } catch (error) {
          logger.error("POS Sale Store: update quantity failed", { error });
          const message =
            error instanceof Error ? error.message : "Failed to update item";
          get().setError(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },

      removeItem: async (itemId) => {
        const sessionId = get().sessionId;
        if (!sessionId) {
          throw new Error(
            "POS session is not initialized. Cannot remove items."
          );
        }

        get().setLoading(true);
        get().setError(null);

        try {
          const result = await removeFromSaleAction(sessionId, itemId);

          if (!result.success || !result.data) {
            const message =
              result.error ?? "Failed to remove item from sale";
            get().setError(message);
            throw new Error(message);
          }

          const { sale, summary } = result.data;
          get().setSaleSnapshot(sale ?? null, summary ?? null);
        } catch (error) {
          logger.error("POS Sale Store: remove item failed", { error });
          const message =
            error instanceof Error ? error.message : "Failed to remove item";
          get().setError(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },

      clearSale: async () => {
        const sessionId = get().sessionId;
        if (!sessionId) {
          throw new Error("POS session is not initialized. Cannot clear sale.");
        }

        get().setLoading(true);
        get().setError(null);

        try {
          const result = await clearSaleAction(sessionId);
          if (!result.success) {
            const message = result.error ?? "Failed to clear sale";
            get().setError(message);
            throw new Error(message);
          }

          get().setSaleSnapshot(null);
        } catch (error) {
          logger.error("POS Sale Store: clear sale failed", { error });
          const message =
            error instanceof Error ? error.message : "Failed to clear sale";
          get().setError(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },

      applyDiscount: async (type, value) => {
        const sessionId = get().sessionId;
        if (!sessionId) {
          throw new Error(
            "POS session is not initialized. Cannot apply discounts."
          );
        }

        get().setLoading(true);
        get().setError(null);

        try {
          const result = await applyDiscountAction(sessionId, type, value);
          if (!result.success || !result.data) {
            const message = result.error ?? "Failed to apply discount";
            get().setError(message);
            throw new Error(message);
          }

          const { sale, summary } = result.data;
          get().setSaleSnapshot(sale ?? null, summary ?? null);
        } catch (error) {
          logger.error("POS Sale Store: apply discount failed", { error });
          const message =
            error instanceof Error ? error.message : "Failed to apply discount";
          get().setError(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },

      validateForCheckout: async () => {
        const sessionId = get().sessionId;
        if (!sessionId) {
          const validation: SaleValidation = {
            isValid: false,
            errors: ["POS session is not initialized"],
          };
          set((state) => ({
            ...state,
            lastValidation: validation,
            isError: true,
            lastError: validation.errors.join(", "),
          }));
          return validation;
        }

        get().setError(null);

        try {
          const result = await validateSaleForCheckoutAction(sessionId);
          const validation: SaleValidation =
            result.data && typeof result.data === "object"
              ? {
                  isValid: !!(result.data as SaleValidation).isValid,
                  errors: Array.isArray(
                    (result.data as SaleValidation).errors
                  )
                    ? (result.data as SaleValidation).errors
                    : [],
                }
              : {
                  isValid: !!result.success,
                  errors: result.success || !result.error ? [] : [result.error],
                };

          set((state) => ({
            ...state,
            lastValidation: validation,
            isError: !validation.isValid,
            lastError: validation.isValid
              ? null
              : validation.errors.join(", ") || result.error || null,
          }));

          return validation;
        } catch (error) {
          logger.error("POS Sale Store: validation failed", { error });
          const message =
            error instanceof Error ? error.message : "Sale validation failed";
          const validation: SaleValidation = {
            isValid: false,
            errors: [message],
          };

          set((state) => ({
            ...state,
            lastValidation: validation,
            isError: true,
            lastError: message,
          }));

          return validation;
        }
      },
    }),
    { name: STORE_NAME }
  )
);

// ---------------------------------------------------------------------------
// SELECTOR HOOKS
// ---------------------------------------------------------------------------

export const useSaleItems = () =>
  useSaleStore((state) => state.items);

export const useSaleSummary = () =>
  useSaleStore((state) => state.summary);

export const useSaleAdjustments = () =>
  useSaleStore((state) => state.adjustments);

export const useSaleMetrics = () => {
  const itemCount = useSaleStore((state) => state.itemCount);
  const uniqueItems = useSaleStore((state) => state.uniqueItems);
  const totalAmount = useSaleStore((state) => state.totalAmount);
  const hasItems = useSaleStore((state) => state.hasItems);
  const canCheckout = useSaleStore((state) => state.canCheckout);

  return useMemo(
    () => ({
      itemCount,
      uniqueItems,
      totalAmount,
      hasItems,
      canCheckout,
    }),
    [canCheckout, hasItems, itemCount, totalAmount, uniqueItems]
  );
};

export const useItemCount = () =>
  useSaleStore((state) => state.itemCount);

export const useHasItems = () =>
  useSaleStore((state) => state.hasItems);

export const useCanCheckout = () =>
  useSaleStore((state) => state.canCheckout);

export const useSaleStatus = () => {
  const isLoading = useSaleStore((state) => state.isLoading);
  const isInitialized = useSaleStore((state) => state.isInitialized);
  const isError = useSaleStore((state) => state.isError);
  const lastError = useSaleStore((state) => state.lastError);
  const lastValidation = useSaleStore((state) => state.lastValidation);

  return useMemo(
    () => ({
      isLoading,
      isInitialized,
      isError,
      lastError,
      lastValidation,
    }),
    [isError, isInitialized, isLoading, lastError, lastValidation]
  );
};

export const useSaleSessionId = () =>
  useSaleStore((state) => state.sessionId);

export const useSaleLastUpdatedAt = () =>
  useSaleStore((state) => state.lastUpdatedAt);

// ---------------------------------------------------------------------------
// ACTION HOOKS
// ---------------------------------------------------------------------------

export const useSaleActions = () => {
  const setSessionId = useSaleStore((state) => state.setSessionId);
  const refreshSale = useSaleStore((state) => state.refreshSale);
  const addItem = useSaleStore((state) => state.addItem);
  const updateQuantity = useSaleStore((state) => state.updateQuantity);
  const removeItem = useSaleStore((state) => state.removeItem);
  const clearSale = useSaleStore((state) => state.clearSale);
  const applyDiscount = useSaleStore((state) => state.applyDiscount);
  const validateForCheckout = useSaleStore(
    (state) => state.validateForCheckout
  );
  const reset = useSaleStore((state) => state.reset);

  return useMemo(
    () => ({
      setSessionId,
      refreshSale,
      addItem,
      updateQuantity,
      removeItem,
      clearSale,
      applyDiscount,
      validateForCheckout,
      reset,
    }),
    [
      addItem,
      applyDiscount,
      clearSale,
      refreshSale,
      removeItem,
      reset,
      setSessionId,
      updateQuantity,
      validateForCheckout,
    ]
  );
};

/**
 * Aggregated sale helper matching the legacy context signature.
 * Useful for components that want a single hook with everything.
 */
export const usePOSSale = () => {
  const sessionId = useSaleSessionId();
  const items = useSaleItems();
  const summary = useSaleSummary();
  const adjustments = useSaleAdjustments();
  const metrics = useSaleMetrics();
  const status = useSaleStatus();
  const actions = useSaleActions();

  return useMemo(
    () => ({
      sessionId,
      items,
      summary,
      adjustments,
      ...metrics,
      ...status,
      ...actions,
    }),
    [actions, adjustments, items, metrics, sessionId, status, summary]
  );
};

/**
 * Hook to keep the sale store in sync with the active POS session.
 * Call it from layout-level components after the POS session is resolved.
 */
export const useSaleInitializer = (sessionId: string | null | undefined) => {
  const normalizedSessionId = sessionId ?? null;
  const { setSessionId, refreshSale, reset } = useSaleActions();
  const currentSessionId = useSaleSessionId();
  const isInitialized = useSaleStore((state) => state.isInitialized);
  const previousSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!normalizedSessionId) {
      if (currentSessionId !== null) {
        setSessionId(null);
      } else if (isInitialized) {
        reset();
      }
      previousSessionId.current = null;
      return;
    }

    if (
      previousSessionId.current === normalizedSessionId &&
      currentSessionId === normalizedSessionId &&
      isInitialized
    ) {
      return;
    }

    setSessionId(normalizedSessionId);
    previousSessionId.current = normalizedSessionId;

    refreshSale().catch((error) => {
      logger.error("POS Sale Store: initial refresh failed", { error });
    });
  }, [
    currentSessionId,
    isInitialized,
    normalizedSessionId,
    refreshSale,
    reset,
    setSessionId,
  ]);
};

export type { SaleStoreState as SaleState };
