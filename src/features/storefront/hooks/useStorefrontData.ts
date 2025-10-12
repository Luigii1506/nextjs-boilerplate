/**
 * 🛒 MAIN STOREFRONT DATA HOOK
 * ============================
 *
 * Hook principal para cargar todos los datos del storefront.
 * Reemplaza el Context API completo con TanStack Query.
 *
 * Beneficios:
 * - ✅ Zero loops infinitos (TanStack maneja deps)
 * - ✅ Cache automático inteligente
 * - ✅ Loading/Error states built-in
 * - ✅ Background refetching
 * - ✅ Type-safe completo
 *
 * @version 3.0.0 - TanStack Query Migration
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { getStorefrontDataAction } from "../server";
import { storefrontKeys } from "./queryKeys";
import type { StorefrontData } from "../types";

/**
 * 🎯 USE STOREFRONT DATA
 * =====================
 *
 * Hook principal que carga todos los datos del storefront:
 * - Products (con filtros)
 * - Categories
 * - Featured products/categories
 * - Wishlist (si está autenticado)
 *
 * @example
 * ```tsx
 * function ProductsTab() {
 *   const { data, isLoading, error } = useStorefrontData();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return <ProductsGrid products={data.products} />;
 * }
 * ```
 */
export function useStorefrontData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: storefrontKeys.all,
    queryFn: async (): Promise<StorefrontData> => {
      console.log("🔄 [TanStack Query] Fetching storefront data...", {
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });

      const result = await getStorefrontDataAction({
        productFilters: {
          sortBy: "name",
          sortOrder: "desc",
          page: 1,
          limit: 50,
          isPublic: true, // Solo productos públicos
        },
        categoryFilters: {
          sortBy: "name",
          sortOrder: "asc",
          page: 1,
          limit: 20,
          isPublic: true, // Solo categorías públicas
        },
        userId: user?.id,
        featuredProductsLimit: 12,
        featuredCategoriesLimit: 8,
      });

      if (!result.success || !result.data) {
        console.error("❌ [TanStack Query] Failed to load storefront data:", {
          error: result.error,
        });
        throw new Error(result.error || "Failed to load storefront data");
      }

      console.log("✅ [TanStack Query] Storefront data loaded:", {
        products: result.data.products?.length || 0,
        categories: result.data.categories?.length || 0,
        wishlist: result.data.wishlist?.length || 0,
        featuredProducts: result.data.featuredProducts?.length || 0,
      });

      return result.data;
    },

    // 🎯 CACHE CONFIGURATION
    // =====================
    // staleTime: Tiempo que los datos son considerados "fresh"
    // gcTime: Tiempo que los datos permanecen en cache después de no usarse
    staleTime: 5 * 60 * 1000, // 5 minutos - datos son "fresh"
    gcTime: 10 * 60 * 1000, // 10 minutos - garbage collection

    // 🔄 REFETCH CONFIGURATION
    // ========================
    refetchOnWindowFocus: false, // No refetch al cambiar tabs del browser
    refetchOnMount: false, // No refetch si cache es válido
    refetchOnReconnect: true, // Sí refetch al reconectar internet

    // 🎯 RETRY CONFIGURATION
    // ======================
    retry: 3, // Reintentar 3 veces si falla
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // 📊 META (para debugging en DevTools)
    meta: {
      errorMessage: "Failed to load storefront data",
    },
  });
}

/**
 * 🎨 HELPER HOOK: useStorefrontProducts
 * =====================================
 *
 * Hook especializado que solo retorna productos.
 * Útil para componentes que solo necesitan productos.
 */
export function useStorefrontProducts() {
  const { data, isLoading, error } = useStorefrontData();

  return {
    products: data?.products || [],
    isLoading,
    error,
  };
}

/**
 * 🏷️ HELPER HOOK: useStorefrontCategories
 * ========================================
 *
 * Hook especializado que solo retorna categorías.
 */
export function useStorefrontCategories() {
  const { data, isLoading, error } = useStorefrontData();

  return {
    categories: data?.categories || [],
    isLoading,
    error,
  };
}

/**
 * ⭐ HELPER HOOK: useFeaturedContent
 * ==================================
 *
 * Hook especializado para contenido destacado.
 */
export function useFeaturedContent() {
  const { data, isLoading, error } = useStorefrontData();

  return {
    featuredProducts: data?.featuredProducts || [],
    featuredCategories: data?.featuredCategories || [],
    isLoading,
    error,
  };
}
