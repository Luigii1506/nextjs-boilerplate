/**
 * 🛒 STOREFRONT SPA CONTEXT
 * =========================
 *
 * Estado compartido para el SPA storefront con navegación por tabs
 * Context Pattern + Custom Hooks para UX fluida customer-focused
 *
 * Created: 2025-01-17 - Storefront SPA Context
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { useStorefrontQuery } from "../hooks";
import { useAuthQuery } from "../../../shared/hooks/useAuthQuery";
import { useNotifications } from "../../../shared/hooks/useNotifications"; // Added for wishlist feedback
import type {
  ProductForCustomer,
  CategoryForCustomer,
  CustomerTier,
  Cart,
  CartItem,
  WishlistItem,
  CustomerStats,
  StorefrontStats,
  ProductFilters,
  CategoryFilters,
  AddToCartInput,
  UpdateCartItemInput,
  CustomerRegistrationInput,
  CustomerLoginInput,
  ActionResult,
} from "../types";

// 🎯 TABS DISPONIBLES PARA STOREFRONT (OBLIGATORIO)
export const STOREFRONT_TABS = [
  {
    id: "overview",
    label: "Inicio",
    icon: "Home",
    description: "Productos destacados y ofertas",
    color: "blue",
  },
  {
    id: "products",
    label: "Productos",
    icon: "Package",
    description: "Catálogo completo de productos",
    color: "green",
  },
  {
    id: "categories",
    label: "Categorías",
    icon: "Grid3X3",
    description: "Navegar por categorías",
    color: "purple",
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: "Heart",
    description: "Tus productos favoritos",
    color: "red",
  },
  {
    id: "account",
    label: "Mi Cuenta",
    icon: "User",
    description: "Perfil y configuración",
    color: "indigo",
  },
  {
    id: "support",
    label: "Ayuda",
    icon: "HelpCircle",
    description: "Soporte y contacto",
    color: "orange",
  },
] as const;

export type TabId = (typeof STOREFRONT_TABS)[number]["id"];

// 🏗️ INTERFACE DEL CONTEXTO (OBLIGATORIO)
interface StorefrontContextType {
  // Tab Management (OBLIGATORIO)
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // Global Search & Filters
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  productFilters: ProductFilters;
  setProductFilters: (filters: ProductFilters) => void;
  categoryFilters: CategoryFilters;
  setCategoryFilters: (filters: CategoryFilters) => void;

  // View Modes
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  gridColumns: 2 | 3 | 4 | 6;
  setGridColumns: (columns: 2 | 3 | 4 | 6) => void;

  // User Authentication State
  isAuthenticated: boolean;
  customer: null; // Deprecated: Using authUser directly now

  // Shopping State
  cart: Cart | null;
  cartItemsCount: number;
  wishlist: WishlistItem[];
  wishlistCount: number;
  recentlyViewed: ProductForCustomer[];

  // Modal States
  // Product Modals
  isProductQuickViewOpen: boolean;
  setIsProductQuickViewOpen: (open: boolean) => void;

  // Customer Modals
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;

  // Cart Modal
  isCartModalOpen: boolean;
  setIsCartModalOpen: (open: boolean) => void;

  // Address Modal
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: (open: boolean) => void;

  // Product States
  viewingProduct: ProductForCustomer | null;
  setViewingProduct: (product: ProductForCustomer | null) => void;

  // UI States
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Loading States
  isAddingToCart: boolean;
  isUpdatingCart: boolean;
  isAddingToWishlist: boolean;

  // Hook Loading States
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;

  // Data from API (TODO: Connect with actual hooks)
  products: ProductForCustomer[];
  categories: CategoryForCustomer[];
  featuredProducts: ProductForCustomer[];
  popularCategories: CategoryForCustomer[];
  stats: StorefrontStats | null;
  customerStats: CustomerStats | null;

  // User Actions (OBLIGATORIO)
  login: (data: CustomerRegistrationInput) => Promise<ActionResult<any>>;
  register: (data: CustomerLoginInput) => Promise<ActionResult<any>>;
  logout: () => Promise<ActionResult>;

  // Shopping Actions (OBLIGATORIO)
  addToCart: (data: AddToCartInput) => Promise<ActionResult<CartItem>>;
  updateCartItem: (
    data: UpdateCartItemInput
  ) => Promise<ActionResult<CartItem>>;
  removeFromCart: (cartItemId: string) => Promise<ActionResult>;
  clearCart: () => Promise<ActionResult>;

  // Wishlist Actions (OBLIGATORIO)
  addToWishlist: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  removeFromWishlist: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  toggleWishlist: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;

  // Cart Quick Actions
  addToCartOptimistic: (
    product: ProductForCustomer,
    quantity: number
  ) => Promise<void>;
  showCartPreview: () => void;

  // Navigation Actions (OBLIGATORIO)
  refetchAll: () => void;
  clearAllFilters: () => void;

  // Product Interaction Actions
  openProductQuickView: (product: ProductForCustomer) => void;
  closeProductQuickView: () => void;
  addToRecentlyViewed: (product: ProductForCustomer) => void;

  // Customer Modal Actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
}

// 🎯 CONTEXT CREATION
const StorefrontContext = createContext<StorefrontContextType | null>(null);

// 🎯 PROVIDER COMPONENT (OBLIGATORIO)
interface StorefrontProviderProps {
  children: ReactNode;
}

export const StorefrontProvider: React.FC<StorefrontProviderProps> = ({
  children,
}) => {
  // 🎨 Tab State (OBLIGATORIO)
  const [activeTab, setActiveTabState] = useState<TabId>("overview");
  const [isTabChanging, setIsTabChanging] = useState(false);

  // 🔍 Search & Filters State
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [productFilters, setProductFilters] = useState<ProductFilters>({});
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters>({});

  // 🎛️ View Modes
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 6>(3);

  // 👤 Customer State (local UI state)
  const [recentlyViewed, setRecentlyViewed] = useState<ProductForCustomer[]>(
    []
  );

  // 📝 Modal States
  const [isProductQuickViewOpen, setIsProductQuickViewOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🛒 Product States
  const [viewingProduct, setViewingProduct] =
    useState<ProductForCustomer | null>(null);

  // ⏳ Loading States
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);

  // 🔐 Real Authentication Integration
  const {
    isAuthenticated,
    user: authUser,
    isLoading: isAuthLoading,
    logout: authLogout,
  } = useAuthQuery(false); // No redirect for public storefront

  // 🔍 DEBUG: Log authentication state
  console.log("🔐 [StorefrontContext] Auth state:", {
    isAuthenticated,
    authUserId: authUser?.id,
    authUserEmail: authUser?.email,
    isAuthLoading,
    authUser: authUser,
  });

  // 🔔 Notifications for user feedback
  const { notify, error, success } = useNotifications();

  // 📊 Real Data from Hook with TanStack Query
  const storefront = useStorefrontQuery({
    productFilters: {
      ...productFilters,
      query: globalSearchTerm || undefined, // Changed from 'search' to 'query'
    },
    categoryFilters,
    userId: isAuthenticated ? authUser?.id : undefined,
    enabled: true,
  });

  // 🧮 Computed Values - Use Real Auth
  const cartItemsCount = storefront.cart?.items?.length || 0;
  const wishlistCount = storefront.wishlist.length;

  // 👤 Simplified: No need for separate Customer model anymore
  // We use authUser directly for all user-related operations

  // 🎯 Instant Tab Change para True SPA Experience (OBLIGATORIO)
  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;

      // Cambio instantáneo - sin delays artificiales
      setActiveTabState(tab);

      // Brief visual transition solo para smooth UX
      setIsTabChanging(true);
      requestAnimationFrame(() => {
        setIsTabChanging(false);
      });
    },
    [activeTab]
  );

  // 🔄 Navigation Actions
  const refetchAll = useCallback(() => {
    storefront.refetch();
  }, [storefront]);

  const clearAllFilters = useCallback(() => {
    setGlobalSearchTerm("");
    setProductFilters({});
    setCategoryFilters({});
  }, []);

  // 💖 Individual Wishlist Actions - Simplified Direct Implementation
  const addToWishlist = useCallback(
    async (product: ProductForCustomer) => {
      console.log("🔥 [StorefrontContext] addToWishlist called", {
        productId: product.id,
        productName: product.name,
        isAuthenticated,
        authUserId: authUser?.id,
        authUserEmail: authUser?.email,
      });

      if (!isAuthenticated || !authUser?.id) {
        console.log("❌ [StorefrontContext] User not authenticated");
        error("🔐 Please log in to add items to wishlist");
        return { success: false, message: "Authentication required" };
      }

      try {
        console.log(
          "✅ [StorefrontContext] User authenticated, calling server action"
        );
        // Direct call to wishlist action using user ID
        const { addToWishlistAction } = await import("../server/actions");
        const result = await addToWishlistAction(authUser.id, product.id);

        console.log("📤 [StorefrontContext] Server action result:", result);

        if (result.success) {
          success("❤️ Added to wishlist successfully");
          storefront.refetch(); // Refresh data
        }

        return {
          success: result.success,
          message: result.message || "Operation completed",
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add to wishlist";
        error(`❌ Failed to add to wishlist: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [isAuthenticated, authUser, storefront, error, success]
  );

  const removeFromWishlist = useCallback(
    async (product: ProductForCustomer) => {
      if (!isAuthenticated || !authUser?.id) {
        return { success: false, message: "Authentication required" };
      }

      try {
        // Direct call to wishlist action using user ID
        const { removeFromWishlistAction } = await import("../server/actions");
        const result = await removeFromWishlistAction(authUser.id, product.id);

        if (result.success) {
          success("💔 Removed from wishlist successfully");
          storefront.refetch(); // Refresh data
        }

        return {
          success: result.success,
          message: result.message || "Operation completed",
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove from wishlist";
        error(`❌ Failed to remove from wishlist: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [isAuthenticated, authUser, storefront, error, success]
  );

  // 🔄 Toggle Wishlist (Smart Toggle)
  const toggleWishlist = useCallback(
    async (product: ProductForCustomer) => {
      if (!isAuthenticated) {
        return { success: false, message: "Authentication required" };
      }

      return product.isWishlisted
        ? await removeFromWishlist(product)
        : await addToWishlist(product);
    },
    [isAuthenticated, addToWishlist, removeFromWishlist]
  );

  // 🚀 Quick Actions - Optimistic Cart Implementation
  const addToCartOptimistic = useCallback(
    async (product: ProductForCustomer, quantity: number) => {
      if (!isAuthenticated) {
        notify(
          async () => Promise.resolve(),
          "Inicia sesión para agregar productos al carrito"
        );
        return;
      }

      // Set loading state
      setIsAddingToCart(true);

      try {
        console.log("Adding to cart:", product.id, quantity);

        // Show immediate feedback
        notify(
          async () => Promise.resolve(),
          `${product.name} agregado al carrito`,
          `${product.name} agregado al carrito`
        );

        // TODO: Call actual cart server action when implemented
        // const { addToCartAction } = await import("../server/actions");
        // const result = await addToCartAction({ productId: product.id, quantity });
        const result = { success: true }; // Mock for now

        if (result && !result.success) {
          // If server action failed, show error
          notify(
            async () => Promise.resolve(),
            "Error al agregar al carrito. Intenta de nuevo."
          );
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        notify(
          async () => Promise.resolve(),
          "Error al agregar al carrito. Intenta de nuevo."
        );
      } finally {
        setIsAddingToCart(false);
      }
    },
    [isAuthenticated, notify]
  );

  const showCartPreview = useCallback(() => {
    setIsCartModalOpen(true);
  }, []);

  // 👁️ Product View Actions
  const addToRecentlyViewed = useCallback((product: ProductForCustomer) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 10); // Keep max 10 items
    });
  }, []);

  const openProductQuickView = useCallback(
    (product: ProductForCustomer) => {
      setViewingProduct(product);
      setIsProductQuickViewOpen(true);
      addToRecentlyViewed(product);
    },
    [addToRecentlyViewed]
  );

  const closeProductQuickView = useCallback(() => {
    setViewingProduct(null);
    setIsProductQuickViewOpen(false);
  }, []);

  // 🎭 Modal Actions
  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(false);
  }, []);

  const switchToRegister = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  }, []);

  const switchToLogin = useCallback(() => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  }, []);

  // 🎯 Context Value
  const value: StorefrontContextType = {
    // Tab Management
    activeTab,
    setActiveTab,
    isTabChanging,

    // Search & Filters
    globalSearchTerm,
    setGlobalSearchTerm,
    productFilters,
    setProductFilters,
    categoryFilters,
    setCategoryFilters,

    // View Modes
    viewMode,
    setViewMode,
    gridColumns,
    setGridColumns,

    // User State - Real Auth Integration
    isAuthenticated,
    customer: null, // Deprecated: Use authUser instead

    // Shopping State from Hook
    cart: storefront.cart,
    cartItemsCount,
    wishlist: storefront.wishlist,
    wishlistCount,
    recentlyViewed,

    // Modal States
    isProductQuickViewOpen,
    setIsProductQuickViewOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    isCartModalOpen,
    setIsCartModalOpen,
    isAddressModalOpen,
    setIsAddressModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,

    // Product States
    viewingProduct,
    setViewingProduct,

    // Loading States (local + hook)
    isAddingToCart,
    isUpdatingCart,
    isAddingToWishlist: false, // TODO: Add loading state for wishlist

    // Hook Loading States
    isLoading: storefront.isLoading,
    isRefetching: false, // TODO: Add refetching state
    isError: storefront.isError,
    error: null, // TODO: Properly handle errors

    // Data from Hook
    products: storefront.products,
    categories: storefront.categories,
    featuredProducts: storefront.featuredProducts,
    popularCategories: storefront.featuredCategories || [], // Use featuredCategories as popular
    stats: storefront.stats,
    customerStats: null, // TODO: Implement customer stats

    // Customer Actions - Temporary implementations
    login: async () => ({ success: false, message: "Not implemented" }),
    register: async () => ({ success: false, message: "Not implemented" }),
    logout: async () => {
      await authLogout();
      return { success: true };
    },

    // Shopping Actions - Temporary implementations
    addToCart: async () => ({ success: false, message: "Not implemented" }),
    updateCartItem: async () => ({
      success: false,
      message: "Not implemented",
    }),
    removeFromCart: async () => ({
      success: false,
      message: "Not implemented",
    }),
    clearCart: async () => ({ success: false, message: "Not implemented" }),

    // Wishlist Actions - Real Implementation with Context Integration
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,

    // Quick Actions
    addToCartOptimistic,
    showCartPreview,

    // Navigation Actions
    refetchAll,
    clearAllFilters,

    // Product Interaction Actions
    openProductQuickView,
    closeProductQuickView,
    addToRecentlyViewed,

    // Modal Actions
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    switchToRegister,
    switchToLogin,
  };

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
};

// 🎯 CUSTOM HOOK (OBLIGATORIO)
export const useStorefrontContext = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error(
      "useStorefrontContext must be used within StorefrontProvider"
    );
  }
  return context;
};

// 🎯 TAB-SPECIFIC HOOKS (útiles para componentes específicos)
export const useTabTransition = () => {
  const { activeTab, setActiveTab, isTabChanging } = useStorefrontContext();

  const switchTab = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  return {
    activeTab,
    switchTab,
    isTabChanging,
    currentTabConfig: STOREFRONT_TABS.find((t) => t.id === activeTab)!,
  };
};

export const useShoppingActions = () => {
  const {
    addToCart,
    addToWishlist,
    toggleWishlist,
    addToCartOptimistic,
    isAddingToCart,
    isAddingToWishlist,
  } = useStorefrontContext();

  return {
    addToCart,
    addToWishlist,
    toggleWishlist,
    addToCartOptimistic,
    isAddingToCart,
    isAddingToWishlist,
  };
};
