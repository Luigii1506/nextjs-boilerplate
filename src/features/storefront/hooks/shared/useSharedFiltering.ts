/**
 * 🔧 USE SHARED FILTERING HOOK
 * ===========================
 *
 * Hook compartido que contiene lógica de filtrado común entre
 * productos, wishlist y otras features que necesiten filtros similares.
 *
 * 📍 Nueva ubicación: /hooks/shared/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useMemo, useCallback } from "react";
import { ProductForCustomer } from "@/features/storefront/types";

// 🔧 SHARED FILTER TYPES
export interface BaseFilters {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
}

interface UseSharedFilteringProps {
  products: ProductForCustomer[];
  searchTerm?: string;
  filters: BaseFilters;
  sortBy?: string;
}

// 🎯 MAIN SHARED HOOK
export function useSharedFiltering({
  products,
  searchTerm = "",
  filters,
  sortBy = "relevance",
}: UseSharedFilteringProps) {
  // 🔍 SHARED SEARCH LOGIC
  const searchProducts = useCallback(
    (products: ProductForCustomer[], term: string) => {
      if (!term.trim()) return products;

      const searchLower = term.toLowerCase();
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description?.toLowerCase() || "").includes(searchLower) ||
          (product.category?.toLowerCase() || "").includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower)
      );
    },
    []
  );

  // 🏷️ SHARED CATEGORY FILTERING
  const filterByCategories = useCallback(
    (products: ProductForCustomer[], categories: string[]) => {
      if (categories.length === 0) return products;

      return products.filter(
        (product) => product.category && categories.includes(product.category)
      );
    },
    []
  );

  // 💰 SHARED PRICE FILTERING
  const filterByPrice = useCallback(
    (products: ProductForCustomer[], priceRange: [number, number]) => {
      const [minPrice, maxPrice] = priceRange;

      return products.filter((product) => {
        const productPrice =
          product.publicPrice || product.price || product.currentPrice || 0;
        return productPrice >= minPrice && productPrice <= maxPrice;
      });
    },
    []
  );

  // 📦 SHARED STOCK FILTERING
  const filterByStock = useCallback(
    (products: ProductForCustomer[], inStock: boolean) => {
      if (!inStock) return products;

      return products.filter((product) => product.stock && product.stock > 0);
    },
    []
  );

  // 🔥 SHARED SALE FILTERING
  const filterBySale = useCallback(
    (products: ProductForCustomer[], onSale: boolean) => {
      if (!onSale) return products;

      return products.filter((product) => product.isOnSale);
    },
    []
  );

  // 🔄 SHARED SORTING LOGIC
  const sortProducts = useCallback(
    (products: ProductForCustomer[], sortBy: string) => {
      const getProductPrice = (product: ProductForCustomer) =>
        product.publicPrice || product.price || product.currentPrice || 0;

      const sorted = [...products];

      switch (sortBy) {
        case "name":
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case "price_asc":
          return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        case "price_desc":
          return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        case "rating":
          return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case "newest":
          return sorted.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "bestseller":
          return sorted.sort(
            (a, b) => (b.salesCount || 0) - (a.salesCount || 0)
          );
        default: // relevance
          return sorted;
      }
    },
    []
  );

  // 📊 MAIN PROCESSING PIPELINE
  const processedProducts = useMemo(() => {
    console.log("🔧 [useSharedFiltering] Processing products:", {
      inputCount: products?.length || 0,
      searchTerm,
      filters,
      sortBy,
    });

    if (!products || !Array.isArray(products)) {
      return [];
    }

    let results = [...products];

    // Apply filters in pipeline
    results = searchProducts(results, searchTerm);
    results = filterByCategories(results, filters.categories);
    results = filterByPrice(results, filters.priceRange);
    results = filterByStock(results, filters.inStock);
    results = filterBySale(results, filters.onSale);
    results = sortProducts(results, sortBy);

    console.log("✅ [useSharedFiltering] Final results:", {
      inputCount: products.length,
      outputCount: results.length,
      firstProduct: results[0]?.name,
      sortBy,
    });

    return results;
  }, [
    products,
    searchTerm,
    filters,
    sortBy,
    searchProducts,
    filterByCategories,
    filterByPrice,
    filterByStock,
    filterBySale,
    sortProducts,
  ]);

  // 📈 SHARED ANALYTICS
  const filterAnalytics = useMemo(() => {
    const activeFilters =
      filters.categories.length +
      (filters.inStock ? 1 : 0) +
      (filters.onSale ? 1 : 0) +
      (searchTerm.trim() ? 1 : 0);

    const filteringEffectiveness =
      products?.length > 0
        ? ((processedProducts.length / products.length) * 100).toFixed(1)
        : "0";

    return {
      activeFiltersCount: activeFilters,
      filteringEffectiveness: parseFloat(filteringEffectiveness),
      originalCount: products?.length || 0,
      filteredCount: processedProducts.length,
    };
  }, [products, processedProducts, filters, searchTerm]);

  // 🔧 SHARED FILTER HELPERS
  const createCategoryToggle = useCallback(
    (category: string, currentCategories: string[]) => {
      return currentCategories.includes(category)
        ? currentCategories.filter((c) => c !== category)
        : [...currentCategories, category];
    },
    []
  );

  const createPriceRangeUpdate = useCallback((newRange: [number, number]) => {
    return newRange;
  }, []);

  // 📊 SHARED COMPUTED VALUES
  const availableFilters = useMemo(() => {
    if (!products?.length)
      return { categories: [], priceRange: { min: 0, max: 0 }, brands: [] };

    const categories = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    const prices = products.map(
      (p) => p.publicPrice || p.price || p.currentPrice || 0
    );

    return {
      categories: categories.map((name) => ({
        name,
        count: products.filter((p) => p.category === name).length,
      })),
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      brands: brands.map((name) => ({
        name,
        count: products.filter((p) => p.brand === name).length,
      })),
    };
  }, [products]);

  return {
    // Main processed data
    processedProducts,

    // Analytics
    filterAnalytics,
    availableFilters,

    // Helper functions
    createCategoryToggle,
    createPriceRangeUpdate,

    // Individual filter functions (for advanced usage)
    searchProducts,
    filterByCategories,
    filterByPrice,
    filterByStock,
    filterBySale,
    sortProducts,
  };
}

export default useSharedFiltering;
