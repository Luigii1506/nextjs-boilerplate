/**
 * 🛒 STOREFRONT TRUE SPA CONTEXT
 * ==============================
 *
 * VERDADERA arquitectura SPA con estado global en memoria
 * - Los datos se cargan UNA VEZ y viven en memoria
 * - Updates optimistas inmediatos
 * - Cero re-fetching entre tabs
 * - TanStack Query solo para server sync
 * - Single source of truth compartido
 *
 * Fixed: 2025-01-26 - True SPA Architecture
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthQuery } from "../../../shared/hooks/useAuthQuery";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import {
  getStorefrontDataAction,
  addToWishlistAction,
  removeFromWishlistAction,
} from "../server/actions";
import type {
  ProductForCustomer,
  CategoryForCustomer,
  CartWithItems,
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
  cart: CartWithItems | null;
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
  login: (
    data: CustomerRegistrationInput
  ) => Promise<ActionResult<{ user: { id: string; email: string } }>>;
  register: (
    data: CustomerLoginInput
  ) => Promise<ActionResult<{ user: { id: string; email: string } }>>;
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
  const [isUpdatingCart] = useState(false);

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

  // 🔄 Query Client for manual cache invalidation
  const queryClient = useQueryClient();

  // ✨ OPTIMISTIC STATE UPDATERS (instant UI updates)
  const updateProductWishlistStatus = useCallback(
    (productId: string, isWishlisted: boolean) => {
      console.log("🔄 [OPTIMISTIC UPDATE] Starting wishlist update:", {
        productId,
        isWishlisted,
        authUserId: authUser?.id,
      });

      setStorefrontData((prev) => {
        const updatedData = {
          ...prev,
          // Update main products array
          products: prev.products.map((product) =>
            product.id === productId ? { ...product, isWishlisted } : product
          ),
          // Update featured products array
          featuredProducts: prev.featuredProducts.map((product) =>
            product.id === productId ? { ...product, isWishlisted } : product
          ),
          // Update wishlist array
          wishlist: isWishlisted
            ? [
                ...prev.wishlist,
                {
                  id: `temp-${productId}`,
                  productId,
                  userId: authUser?.id || "",
                  addedAt: new Date(),
                } as WishlistItem,
              ] // Add to wishlist
            : prev.wishlist.filter(
                (item: WishlistItem) => item.productId !== productId
              ), // Remove from wishlist
        };

        console.log("✅ [OPTIMISTIC UPDATE] State updated:", {
          action: isWishlisted ? "ADDED" : "REMOVED",
          productId,
          newWishlistCount: updatedData.wishlist.length,
          updatedProductsCount: updatedData.products.filter(
            (p) => p.isWishlisted
          ).length,
          updatedFeaturedCount: updatedData.featuredProducts.filter(
            (p) => p.isWishlisted
          ).length,
        });

        return updatedData;
      });
    },
    [authUser?.id]
  );

  // 🔄 BACKGROUND SYNC MUTATIONS (no UI blocking)
  const syncAddToWishlistMutation = useMutation({
    mutationFn: async ({
      userId,
      productId,
    }: {
      userId: string;
      productId: string;
    }) => {
      console.log("🚀 [SERVER SYNC] Starting ADD to wishlist:", {
        userId,
        productId,
      });

      const result = await addToWishlistAction(userId, productId);

      console.log("📤 [SERVER SYNC] ADD result:", {
        success: result.success,
        message: result.message,
        data: result.data,
      });

      return result;
    },
    onSuccess: (result, variables) => {
      console.log("✅ [SERVER SYNC] ADD successful:", {
        productId: variables.productId,
        result,
      });

      // 🔄 FORCE REFETCH: Replace optimistic items with real data from server
      console.log(
        "🔄 [SERVER SYNC] Forcing refetch to get real wishlist data..."
      );
      hasInitialized.current = false;
      setIsLoading(true);
      queryClient.invalidateQueries({ queryKey: ["storefront-initial-data"] });
    },
    onError: (errorObj, variables) => {
      // Revert optimistic update on server error
      console.error("❌ [SERVER SYNC] Failed to add to wishlist:", {
        error: errorObj,
        productId: variables.productId,
        userId: variables.userId,
      });
      updateProductWishlistStatus(variables.productId, false);
      error("Failed to add to wishlist - reverted changes");
    },
  });

  const syncRemoveFromWishlistMutation = useMutation({
    mutationFn: async ({
      userId,
      productId,
    }: {
      userId: string;
      productId: string;
    }) => {
      console.log("🚀 [SERVER SYNC] Starting REMOVE from wishlist:", {
        userId,
        productId,
      });

      const result = await removeFromWishlistAction(userId, productId);

      console.log("📤 [SERVER SYNC] REMOVE result:", {
        success: result.success,
        message: result.message,
      });

      return result;
    },
    onSuccess: (result, variables) => {
      console.log("✅ [SERVER SYNC] REMOVE successful:", {
        productId: variables.productId,
        result,
      });

      // 🔄 FORCE REFETCH: Replace optimistic items with real data from server
      console.log(
        "🔄 [SERVER SYNC] Forcing refetch to get updated wishlist data..."
      );
      hasInitialized.current = false;
      setIsLoading(true);
      queryClient.invalidateQueries({ queryKey: ["storefront-initial-data"] });
    },
    onError: (errorObj, variables) => {
      // Revert optimistic update on server error
      console.error("❌ [SERVER SYNC] Failed to remove from wishlist:", {
        error: errorObj,
        productId: variables.productId,
        userId: variables.userId,
      });
      updateProductWishlistStatus(variables.productId, true);
      error("Failed to remove from wishlist - reverted changes");
    },
  });

  // 🎯 TRUE SPA STATE - Datos viven en memoria, NO en queries
  const [storefrontData, setStorefrontData] = useState<{
    products: ProductForCustomer[];
    categories: CategoryForCustomer[];
    featuredProducts: ProductForCustomer[];
    featuredCategories: CategoryForCustomer[];
    wishlist: WishlistItem[];
    cart: CartWithItems | null;
    stats: StorefrontStats | null;
    isInitialized: boolean;
  }>({
    products: [],
    categories: [],
    featuredProducts: [],
    featuredCategories: [],
    wishlist: [],
    cart: null,
    stats: null,
    isInitialized: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  // 🚀 INITIAL LOAD - Solo UNA VEZ al inicio (DESPUÉS de auth)
  const initialDataQuery = useQuery({
    queryKey: ["storefront-initial-data", authUser?.id, isAuthenticated],
    queryFn: async () => {
      console.log("🔄 [INITIAL LOAD] Starting data fetch with auth:", {
        authUser: authUser?.id,
        isAuthenticated,
        isAuthLoading,
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
        userId: authUser?.id, // ✨ IMPORTANTE: Include userId if authenticated
        featuredProductsLimit: 12,
        featuredCategoriesLimit: 8,
      });

      console.log("📤 [INITIAL LOAD] Server response:", {
        success: result.success,
        hasData: !!result.data,
        wishlistCount: result.data?.wishlist?.length || 0,
        userId: authUser?.id,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to load storefront data");
      }

      return result.data;
    },
    staleTime: Infinity, // ✨ NEVER refetch - data lives in memory
    gcTime: Infinity, // ✨ NEVER garbage collect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    // ✨ KEY FIX: Load when auth completes OR when auth state changes
    enabled: !isAuthLoading,
  });

  // 🔄 UPDATE STATE when data loads (ONLY ONCE OR WHEN AUTH CHANGES)
  useEffect(() => {
    if (
      initialDataQuery.data &&
      (!hasInitialized.current || initialDataQuery.isSuccess)
    ) {
      console.log("🚀 [INITIAL LOAD] Raw data from server:", {
        fullDataStructure: initialDataQuery.data,
        products: initialDataQuery.data.products?.length || 0,
        featuredProducts: initialDataQuery.data.featuredProducts?.length || 0,
        wishlist: initialDataQuery.data.wishlist?.length || 0,
        categories: initialDataQuery.data.categories?.length || 0,
        userId: authUser?.id,
        isAuthenticated,
        wasInitialized: hasInitialized.current,
      });

      console.log("📋 [INITIAL LOAD] Detailed wishlist data:", {
        wishlistItems: initialDataQuery.data.wishlist,
        wishlistCount: initialDataQuery.data.wishlist?.length || 0,
        firstFewItems: initialDataQuery.data.wishlist?.slice(0, 3),
        authState: { isAuthenticated, authUserId: authUser?.id },
      });

      console.log("🔍 [INITIAL LOAD] Product wishlist status analysis:", {
        totalProducts: initialDataQuery.data.products?.length || 0,
        productsWithWishlistTrue:
          initialDataQuery.data.products?.filter((p) => p.isWishlisted)
            ?.length || 0,
        featuredProductsWithWishlistTrue:
          initialDataQuery.data.featuredProducts?.filter((p) => p.isWishlisted)
            ?.length || 0,
      });

      // 🔍 DEBUG: Check wishlist data structure before setting
      console.log("🔍 [CONTEXT] Wishlist data from server before setState:", {
        wishlistLength: initialDataQuery.data.wishlist?.length || 0,
        wishlistItems: initialDataQuery.data.wishlist?.map((item) => ({
          id: item.id,
          productId: item.productId,
          hasProduct: !!item.product,
          productName: item.product?.name,
          productKeys: item.product ? Object.keys(item.product) : [],
        })),
      });

      // 🧹 CLEAN WISHLIST: Remove any temp items and use only real server data
      const cleanWishlist = (initialDataQuery.data.wishlist || []).filter(
        (item) => !item.id.startsWith("temp-")
      );

      console.log("🧹 [CONTEXT] Cleaning wishlist data:", {
        originalWishlistCount: initialDataQuery.data.wishlist?.length || 0,
        cleanWishlistCount: cleanWishlist.length,
        removedTempItems:
          (initialDataQuery.data.wishlist?.length || 0) - cleanWishlist.length,
        tempItemsFound:
          initialDataQuery.data.wishlist?.filter((item) =>
            item.id.startsWith("temp-")
          )?.length || 0,
      });

      // ✨ ALWAYS update state when fresh data comes from server
      const newStorefrontData = {
        products: initialDataQuery.data.products || [],
        categories: initialDataQuery.data.categories || [],
        featuredProducts: initialDataQuery.data.featuredProducts || [],
        featuredCategories: initialDataQuery.data.featuredCategories || [],
        wishlist: cleanWishlist, // ✅ Use cleaned wishlist without temp items
        cart: initialDataQuery.data.cart || null,
        stats: initialDataQuery.data.stats || null,
        isInitialized: true,
      };

      console.log("📋 [CONTEXT] Setting storefrontData with:", {
        products: newStorefrontData.products.length,
        wishlist: newStorefrontData.wishlist.length,
        wishlistItemsWithProduct: newStorefrontData.wishlist.filter(
          (item) => !!item.product
        ).length,
        wishlistItemsWithoutProduct: newStorefrontData.wishlist.filter(
          (item) => !item.product
        ).length,
        wishlistIsClean: newStorefrontData.wishlist.every(
          (item) => !item.id.startsWith("temp-")
        ),
      });

      setStorefrontData(newStorefrontData);

      setIsLoading(false);
      hasInitialized.current = true;

      console.log("✅ [INITIAL LOAD] State has been set successfully", {
        newWishlistCount: initialDataQuery.data.wishlist?.length || 0,
        authUserId: authUser?.id,
      });
    }
  }, [
    initialDataQuery.data,
    initialDataQuery.isSuccess,
    authUser?.id,
    isAuthenticated,
  ]);

  // 🔄 FORCE INITIAL DATA LOAD when auth completes
  const previousAuthState = useRef<{
    isAuthenticated: boolean;
    userId?: string;
    isAuthLoading: boolean;
  }>({
    isAuthenticated: false,
    userId: undefined,
    isAuthLoading: true,
  });

  useEffect(() => {
    const currentAuthState = {
      isAuthenticated,
      userId: authUser?.id,
      isAuthLoading,
    };

    console.log("🔐 [AUTH MONITOR] Auth state change detected:", {
      previous: previousAuthState.current,
      current: currentAuthState,
      authLoadingTransition: `${previousAuthState.current.isAuthLoading} → ${currentAuthState.isAuthLoading}`,
      authTransition: `${previousAuthState.current.isAuthenticated} → ${currentAuthState.isAuthenticated}`,
      userIdTransition: `${previousAuthState.current.userId} → ${currentAuthState.userId}`,
      shouldTriggerInitialLoad:
        previousAuthState.current.isAuthLoading &&
        !currentAuthState.isAuthLoading,
    });

    // 🚀 CRITICAL: When auth loading finishes, force initial data load
    if (
      previousAuthState.current.isAuthLoading &&
      !currentAuthState.isAuthLoading
    ) {
      console.log(
        "🚀 [AUTH MONITOR] Auth loading completed, forcing initial data load...",
        {
          wasLoading: previousAuthState.current.isAuthLoading,
          nowLoading: currentAuthState.isAuthLoading,
          isAuthenticated: currentAuthState.isAuthenticated,
          userId: currentAuthState.userId,
          hasInitialized: hasInitialized.current,
        }
      );

      // Reset initialization to force fresh data
      hasInitialized.current = false;
      setIsLoading(true);

      // Force query execution
      initialDataQuery.refetch();
    }

    // 🔄 Handle auth state changes (login/logout)
    if (!isAuthLoading && hasInitialized.current) {
      const authStateChanged =
        previousAuthState.current.isAuthenticated !==
          currentAuthState.isAuthenticated ||
        previousAuthState.current.userId !== currentAuthState.userId;

      if (authStateChanged) {
        console.log(
          "🔄 [AUTH MONITOR] User auth state changed, refetching data...",
          {
            authChanged:
              previousAuthState.current.isAuthenticated !==
              currentAuthState.isAuthenticated,
            userChanged:
              previousAuthState.current.userId !== currentAuthState.userId,
          }
        );

        // Reset initialization state to allow fresh data fetch
        hasInitialized.current = false;
        setIsLoading(true);

        // This will trigger a new query with updated auth state
        initialDataQuery.refetch();
      }
    }

    previousAuthState.current = currentAuthState;
  }, [isAuthenticated, authUser?.id, isAuthLoading, initialDataQuery]);

  // 🧮 Computed Values from MEMORY state (not queries)
  const cartItemsCount = storefrontData.cart?.items?.length || 0;
  const wishlistCount = storefrontData.wishlist.length;

  // 🔍 DEBUG: Log state changes
  useEffect(() => {
    console.log("📊 [STATE MONITOR] Storefront data updated:", {
      productsCount: storefrontData.products.length,
      featuredProductsCount: storefrontData.featuredProducts.length,
      wishlistCount: storefrontData.wishlist.length,
      wishlistItems: storefrontData.wishlist.map((item) => ({
        id: item.id,
        productId: item.productId,
      })),
      productsWithWishlistTrue: storefrontData.products.filter(
        (p) => p.isWishlisted
      ).length,
      featuredWithWishlistTrue: storefrontData.featuredProducts.filter(
        (p) => p.isWishlisted
      ).length,
      isInitialized: storefrontData.isInitialized,
      timestamp: new Date().toISOString(),
    });
  }, [storefrontData]);

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

  // 🔄 Navigation Actions - TRUE SPA (no unnecessary refetch)
  const refetchAll = useCallback(() => {
    // In a true SPA, we rarely need to refetch everything
    // Only refetch if explicitly requested (like pull-to-refresh)
    console.log(
      "🔄 [TRUE SPA] Manual refetch requested - reloading initial data"
    );
    hasInitialized.current = false;
    setIsLoading(true);
    queryClient.invalidateQueries({ queryKey: ["storefront-initial-data"] });
  }, [queryClient]);

  const clearAllFilters = useCallback(() => {
    setGlobalSearchTerm("");
    setProductFilters({});
    setCategoryFilters({});
  }, []);

  // ✨ TRUE OPTIMISTIC WISHLIST ACTIONS (instant UI, background sync)
  const addToWishlist = useCallback(
    async (product: ProductForCustomer) => {
      console.log("🚀 [TRUE SPA] Optimistic addToWishlist called", {
        productId: product.id,
        productName: product.name,
        isAuthenticated,
        authUserId: authUser?.id,
      });

      if (!isAuthenticated || !authUser?.id) {
        error("🔐 Please log in to add items to wishlist");
        return { success: false, message: "Authentication required" };
      }

      // ✨ INSTANT UI UPDATE (optimistic)
      updateProductWishlistStatus(product.id, true);
      success("❤️ Added to wishlist!");

      // 🔄 Background server sync (non-blocking)
      syncAddToWishlistMutation.mutate({
        userId: authUser.id,
        productId: product.id,
      });

      return { success: true, message: "Added to wishlist" };
    },
    [
      isAuthenticated,
      authUser,
      error,
      success,
      updateProductWishlistStatus,
      syncAddToWishlistMutation,
    ]
  );

  const removeFromWishlist = useCallback(
    async (product: ProductForCustomer) => {
      console.log("🚀 [TRUE SPA] Optimistic removeFromWishlist called", {
        productId: product.id,
        productName: product.name,
        isAuthenticated,
        authUserId: authUser?.id,
      });

      if (!isAuthenticated || !authUser?.id) {
        return { success: false, message: "Authentication required" };
      }

      // ✨ INSTANT UI UPDATE (optimistic)
      updateProductWishlistStatus(product.id, false);
      success("💔 Removed from wishlist!");

      // 🔄 Background server sync (non-blocking)
      syncRemoveFromWishlistMutation.mutate({
        userId: authUser.id,
        productId: product.id,
      });

      return { success: true, message: "Removed from wishlist" };
    },
    [
      isAuthenticated,
      authUser,
      success,
      updateProductWishlistStatus,
      syncRemoveFromWishlistMutation,
    ]
  );

  // 🔄 Toggle Wishlist (Smart Toggle)
  const toggleWishlist = useCallback(
    async (product: ProductForCustomer) => {
      console.log("🎯 [TOGGLE WISHLIST] Toggle called:", {
        productId: product.id,
        productName: product.name,
        currentWishlistStatus: product.isWishlisted,
        isAuthenticated,
        authUserId: authUser?.id,
        action: product.isWishlisted ? "REMOVE" : "ADD",
      });

      if (!isAuthenticated) {
        console.log("❌ [TOGGLE WISHLIST] User not authenticated");
        return { success: false, message: "Authentication required" };
      }

      const result = product.isWishlisted
        ? await removeFromWishlist(product)
        : await addToWishlist(product);

      console.log("📋 [TOGGLE WISHLIST] Toggle result:", {
        productId: product.id,
        action: product.isWishlisted ? "REMOVE" : "ADD",
        result,
      });

      return result;
    },
    [isAuthenticated, addToWishlist, removeFromWishlist, authUser?.id]
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

    // Shopping State from MEMORY (TRUE SPA)
    cart: storefrontData.cart,
    cartItemsCount,
    wishlist: storefrontData.wishlist,
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

    // Loading States - TRUE SPA (no constant loading)
    isAddingToCart,
    isUpdatingCart,
    isAddingToWishlist:
      syncAddToWishlistMutation.isPending ||
      syncRemoveFromWishlistMutation.isPending,

    // Global Loading States - Only initial load
    isLoading,
    isRefetching: initialDataQuery.isFetching && hasInitialized.current,
    isError: initialDataQuery.isError,
    error: initialDataQuery.error || null,

    // Data from MEMORY (TRUE SPA - no query dependency)
    products: storefrontData.products,
    categories: storefrontData.categories,
    featuredProducts: storefrontData.featuredProducts,
    popularCategories: storefrontData.featuredCategories || [],
    stats: storefrontData.stats,
    customerStats: null,

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
