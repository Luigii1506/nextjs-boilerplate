/**
 * 🎨 STOREFRONT UI CONTEXT
 * ========================
 *
 * Context ULTRA-LIGERO para manejar SOLO UI state.
 * NO maneja data (eso lo hace TanStack Query).
 *
 * Responsabilidades:
 * - ✅ Tab navigation (SPA)
 * - ✅ Global search term
 * - ✅ Product modal/detail view
 *
 * Features eliminadas (ahora en TanStack Query):
 * - ❌ Products data
 * - ❌ Wishlist data
 * - ❌ Cart data
 * - ❌ Loading states
 * - ❌ Error handling
 *
 * Reducción: 348 líneas → 80 líneas (-77%)
 *
 * @version 3.0.0 - TanStack Query Migration
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ProductForCustomer } from "../types";

// 🎯 TABS DEL SPA
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

// 🎨 CONTEXT TYPE (Solo UI State)
interface StorefrontUIContextType {
  // 🎨 Tab Management
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // 🔍 Search
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;

  // 👁️ Product Modal
  viewingProduct: ProductForCustomer | null;
  setViewingProduct: (product: ProductForCustomer | null) => void;
}

// 🏭 CONTEXT
const StorefrontUIContext = createContext<StorefrontUIContextType | null>(
  null
);

// 🎯 PROVIDER (Super simple - solo UI state)
interface StorefrontUIProviderProps {
  children: ReactNode;
}

export function StorefrontUIProvider({
  children,
}: StorefrontUIProviderProps) {
  // 🎨 Tab State
  const [activeTab, setActiveTabState] = useState<TabId>("overview");
  const [isTabChanging, setIsTabChanging] = useState(false);

  // 🔍 Search State
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  // 👁️ Product Modal State
  const [viewingProduct, setViewingProduct] =
    useState<ProductForCustomer | null>(null);

  // 🎨 Tab Management con transición suave
  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;

      setIsTabChanging(true);
      setActiveTabState(tab);

      // Quick transition (150ms)
      setTimeout(() => setIsTabChanging(false), 150);

      console.log("🔄 [StorefrontUI] Tab changed:", tab);
    },
    [activeTab]
  );

  // 🎯 Context Value
  const contextValue: StorefrontUIContextType = {
    // Tab management
    activeTab,
    setActiveTab,
    isTabChanging,

    // Search
    globalSearchTerm,
    setGlobalSearchTerm,

    // Product modal
    viewingProduct,
    setViewingProduct,
  };

  return (
    <StorefrontUIContext.Provider value={contextValue}>
      {children}
    </StorefrontUIContext.Provider>
  );
}

// 🪝 HOOK
export function useStorefrontUI() {
  const context = useContext(StorefrontUIContext);

  if (!context) {
    throw new Error(
      "useStorefrontUI must be used within StorefrontUIProvider"
    );
  }

  return context;
}

/**
 * 📝 EJEMPLO DE USO:
 * =================
 *
 * ```tsx
 * // En storefront.screen.tsx
 * function StorefrontScreen() {
 *   return (
 *     <StorefrontUIProvider>
 *       <StorefrontContent />
 *     </StorefrontUIProvider>
 *   );
 * }
 *
 * // En cualquier componente hijo
 * function ProductsTab() {
 *   // UI state (tabs, search, modals)
 *   const { activeTab, globalSearchTerm } = useStorefrontUI();
 *
 *   // Data (TanStack Query)
 *   const { data, isLoading } = useStorefrontData();
 *   const { addToWishlist } = useWishlist();
 *
 *   // ✅ Separación clara: UI state vs Data
 * }
 * ```
 */
