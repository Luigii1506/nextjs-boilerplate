/**
 * 🎨 STOREFRONT UI STORE (Zustand)
 * ===============================
 *
 * Single source of truth for SPA UI state.
 * Replaces the old React Context while keeping the same API surface.
 *
 * Pattern: Zustand + React 19 (stable selectors & memoized action hooks).
 */

"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ProductForCustomer } from "../types";

export const STOREFRONT_TABS = [
  { id: "overview", label: "Inicio", icon: "Home" },
  { id: "products", label: "Productos", icon: "Package" },
  { id: "categories", label: "Categorías", icon: "Grid3X3" },
  { id: "wishlist", label: "Wishlist", icon: "Heart" },
  { id: "cart", label: "Carrito", icon: "ShoppingCart" },
  { id: "checkout", label: "Checkout", icon: "CreditCard" },
  { id: "account", label: "Mi Cuenta", icon: "User" },
  { id: "support", label: "Ayuda", icon: "HelpCircle" },
] as const;

export type TabId = (typeof STOREFRONT_TABS)[number]["id"];

interface StorefrontUIState {
  activeTab: TabId;
  isTabChanging: boolean;
  globalSearchTerm: string;
  viewingProduct: ProductForCustomer | null;
  tabTransitionTimer: number | null;

  setActiveTab: (tab: TabId) => void;
  setGlobalSearchTerm: (term: string) => void;
  setViewingProduct: (product: ProductForCustomer | null) => void;
  reset: () => void;
}

const STORE_NAME = "Storefront-UI-Store";

export const useStorefrontUIStore = create<StorefrontUIState>()(
  devtools(
    (set, get) => ({
      activeTab: "overview",
      isTabChanging: false,
      globalSearchTerm: "",
      viewingProduct: null,
      tabTransitionTimer: null,

      setActiveTab: (tab: TabId) => {
        const { activeTab, tabTransitionTimer } = get();
        if (activeTab === tab) {
          return;
        }

        if (tabTransitionTimer && typeof window !== "undefined") {
          window.clearTimeout(tabTransitionTimer);
        }

        const timer =
          typeof window !== "undefined"
            ? window.setTimeout(() => {
                set((state) => ({
                  ...state,
                  isTabChanging: false,
                  tabTransitionTimer: null,
                }));
              }, 150)
            : null;

        set(() => ({
          activeTab: tab,
          isTabChanging: true,
          tabTransitionTimer: timer,
        }));
      },

      setGlobalSearchTerm: (term: string) =>
        set(() => ({
          globalSearchTerm: term,
        })),

      setViewingProduct: (product: ProductForCustomer | null) =>
        set(() => ({
          viewingProduct: product,
        })),

      reset: () => {
        const { tabTransitionTimer } = get();
        if (tabTransitionTimer && typeof window !== "undefined") {
          window.clearTimeout(tabTransitionTimer);
        }

        set(() => ({
          activeTab: "overview",
          isTabChanging: false,
          globalSearchTerm: "",
          viewingProduct: null,
          tabTransitionTimer: null,
        }));
      },
    }),
    { name: STORE_NAME }
  )
);

/**
 * Stable action hook for React 19.
 * Aggregates store actions with useMemo so consumers can destructure safely.
 */
export const useStorefrontUIActions = () => {
  const setActiveTab = useStorefrontUIStore((state) => state.setActiveTab);
  const setGlobalSearchTerm = useStorefrontUIStore(
    (state) => state.setGlobalSearchTerm
  );
  const setViewingProduct = useStorefrontUIStore(
    (state) => state.setViewingProduct
  );
  const reset = useStorefrontUIStore((state) => state.reset);

  return useMemo(
    () => ({
      setActiveTab,
      setGlobalSearchTerm,
      setViewingProduct,
      reset,
    }),
    [setActiveTab, setGlobalSearchTerm, setViewingProduct, reset]
  );
};

/**
 * Convenience hook retaining the original context API shape.
 * Combines primitive selectors and memoized actions.
 */
export const useStorefrontUI = () => {
  const activeTab = useStorefrontUIStore((state) => state.activeTab);
  const isTabChanging = useStorefrontUIStore((state) => state.isTabChanging);
  const globalSearchTerm = useStorefrontUIStore(
    (state) => state.globalSearchTerm
  );
  const viewingProduct = useStorefrontUIStore((state) => state.viewingProduct);

  const actions = useStorefrontUIActions();

  return useMemo(
    () => ({
      activeTab,
      isTabChanging,
      globalSearchTerm,
      viewingProduct,
      ...actions,
    }),
    [actions, activeTab, globalSearchTerm, isTabChanging, viewingProduct]
  );
};

