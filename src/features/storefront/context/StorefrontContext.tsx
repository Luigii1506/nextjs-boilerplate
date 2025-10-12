"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  getStorefrontDataAction,
  addToWishlistAction,
  removeFromWishlistAction,
} from "../server";
import type {
  ProductForCustomer,
  CategoryForCustomer,
  WishlistItem,
} from "../types";

// 🎯 SPA Tab Configuration
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

interface StorefrontContextType {
  // 🎨 Tab Management
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // 📊 Data - Single Source of Truth
  products: ProductForCustomer[];
  categories: CategoryForCustomer[];
  featuredProducts: ProductForCustomer[];
  wishlist: WishlistItem[];

  // 🎛️ UI State
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;

  // 👁️ Product Modal
  viewingProduct: ProductForCustomer | null;
  setViewingProduct: (product: ProductForCustomer | null) => void;

  // ⚡ Actions - Direct & Simple
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const StorefrontContext = createContext<StorefrontContextType | null>(null);

export function useStorefrontContext() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error(
      "useStorefrontContext must be used within StorefrontProvider"
    );
  }
  return context;
}

interface StorefrontProviderProps {
  children: React.ReactNode;
}

export function StorefrontProvider({ children }: StorefrontProviderProps) {
  const { user, isAuthenticated } = useAuth();

  // 🔒 STABLE USER ID - Prevent infinite loops
  const userId = useMemo(() => user?.id, [user?.id]);

  // 🎨 Tab State - Simple
  const [activeTab, setActiveTabState] = useState<TabId>("overview");
  const [isTabChanging, setIsTabChanging] = useState(false);

  // 📊 Data State - Single Source of Truth
  const [data, setData] = useState<{
    products: ProductForCustomer[];
    categories: CategoryForCustomer[];
    featuredProducts: ProductForCustomer[];
    wishlist: WishlistItem[];
    isInitialized: boolean;
  }>({
    products: [],
    categories: [],
    featuredProducts: [],
    wishlist: [],
    isInitialized: false,
  });

  // 🎛️ UI State
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [viewingProduct, setViewingProduct] =
    useState<ProductForCustomer | null>(null);

  // 🚀 Load Data - SUPER FAST & DIRECT (No Loading States)
  const loadData = useCallback(async () => {
    try {
      console.log("🚀 [STOREFRONT] Loading data INSTANTLY...", {
        isAuthenticated,
        userId: userId,
      });

      const result = await getStorefrontDataAction({
        productFilters: {
          sortBy: "name",
          sortOrder: "desc",
          page: 1,
          limit: 50,
        },
        categoryFilters: {
          sortBy: "name",
          sortOrder: "asc",
          page: 1,
          limit: 20,
        },
        userId: userId,
        featuredProductsLimit: 12,
        featuredCategoriesLimit: 8,
      });

      if (result.success && result.data) {
        console.log("⚡ [STOREFRONT] Data loaded INSTANTLY:", {
          products: result.data.products?.length || 0,
          wishlist: result.data.wishlist?.length || 0,
          isAuthenticated,
        });

        setData({
          products: result.data.products || [],
          categories: result.data.categories || [],
          featuredProducts: result.data.featuredProducts || [],
          wishlist: result.data.wishlist || [],
          isInitialized: true,
        });
      } else {
        console.warn("⚠️ [STOREFRONT] No data received, keeping empty state");
      }
    } catch (error) {
      console.warn(
        "⚠️ [STOREFRONT] Data load failed, keeping empty state:",
        error
      );
      // No error states - just keep empty arrays for super fast UX
    }
  }, [userId, isAuthenticated]);

  // 🚀 Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 🎨 Tab Management - Smooth Transitions
  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;

      setIsTabChanging(true);
      setActiveTabState(tab);

      // Quick transition
      setTimeout(() => setIsTabChanging(false), 150);

      console.log("🔄 [STOREFRONT] Tab changed:", tab);
    },
    [activeTab]
  );

  // 💖 Wishlist Actions - Direct & Simple
  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!userId) {
        throw new Error("Authentication required");
      }

      try {
        console.log("➕ [STOREFRONT] Adding to wishlist:", productId);

        // Optimistic update
        setData((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p.id === productId ? { ...p, isWishlisted: true } : p
          ),
          featuredProducts: prev.featuredProducts.map((p) =>
            p.id === productId ? { ...p, isWishlisted: true } : p
          ),
          wishlist: [
            ...prev.wishlist,
            {
              id: `temp-${productId}`,
              productId,
              userId: userId,
              addedAt: new Date(),
            } as WishlistItem,
          ],
        }));

        const result = await addToWishlistAction(userId, productId);

        if (!result.success) {
          // Revert on failure
          setData((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p.id === productId ? { ...p, isWishlisted: false } : p
            ),
            featuredProducts: prev.featuredProducts.map((p) =>
              p.id === productId ? { ...p, isWishlisted: false } : p
            ),
            wishlist: prev.wishlist.filter((w) => w.productId !== productId),
          }));
          throw new Error(result.error || "Failed to add to wishlist");
        }

        console.log("✅ [STOREFRONT] Added to wishlist");
      } catch (error) {
        console.error("❌ [STOREFRONT] Add to wishlist failed:", error);
        throw error;
      }
    },
    [userId]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!userId) {
        throw new Error("Authentication required");
      }

      try {
        console.log("➖ [STOREFRONT] Removing from wishlist:", productId);

        // Optimistic update
        setData((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p.id === productId ? { ...p, isWishlisted: false } : p
          ),
          featuredProducts: prev.featuredProducts.map((p) =>
            p.id === productId ? { ...p, isWishlisted: false } : p
          ),
          wishlist: prev.wishlist.filter((w) => w.productId !== productId),
        }));

        const result = await removeFromWishlistAction(userId, productId);

        if (!result.success) {
          // Revert on failure
          setData((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p.id === productId ? { ...p, isWishlisted: true } : p
            ),
            featuredProducts: prev.featuredProducts.map((p) =>
              p.id === productId ? { ...p, isWishlisted: true } : p
            ),
            wishlist: [
              ...prev.wishlist,
              {
                id: `temp-${productId}`,
                productId,
                userId: userId,
                addedAt: new Date(),
              } as WishlistItem,
            ],
          }));
          throw new Error(result.error || "Failed to remove from wishlist");
        }

        console.log("✅ [STOREFRONT] Removed from wishlist");
      } catch (error) {
        console.error("❌ [STOREFRONT] Remove from wishlist failed:", error);
        throw error;
      }
    },
    [userId]
  );

  // 🔄 Refresh Action
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // 🎯 Context Value - Memoized for Performance
  const contextValue = useMemo(
    () => ({
      // Tab Management
      activeTab,
      setActiveTab,
      isTabChanging,

      // Data
      products: data.products,
      categories: data.categories,
      featuredProducts: data.featuredProducts,
      wishlist: data.wishlist,

      // UI State
      globalSearchTerm,
      setGlobalSearchTerm,

      // Product Modal
      viewingProduct,
      setViewingProduct,

      // Actions
      addToWishlist,
      removeFromWishlist,
      refreshData,
    }),
    [
      activeTab,
      setActiveTab,
      isTabChanging,
      data,
      globalSearchTerm,
      setGlobalSearchTerm,
      viewingProduct,
      setViewingProduct,
      addToWishlist,
      removeFromWishlist,
      refreshData,
    ]
  );

  return (
    <StorefrontContext.Provider value={contextValue}>
      {children}
    </StorefrontContext.Provider>
  );
}

// 🎯 Simplified Exports - No intermediate hooks needed
export { StorefrontProvider as default };
