/**
 * 🧠 USE PRODUCTS LOGIC HOOK
 * ==========================
 *
 * Hook especializado para toda la lógica de negocio de productos:
 * filtrado, búsqueda, ordenamiento y procesamiento de datos.
 *
 * 📍 Nueva ubicación: /hooks/products/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useMemo, useCallback } from "react";
import { ProductForCustomer } from "@/features/storefront/types";
import { ProductFilters } from "../../ui/components/tabs/products/types";

interface UseProductsLogicProps {
  products: ProductForCustomer[];
  searchTerm: string;
  filters: ProductFilters;
  sortBy: string;
}

// 🎯 MAIN HOOK
export function useProductsLogic({
  products,
  searchTerm,
  filters,
  sortBy,
}: UseProductsLogicProps) {
  // 📊 PROCESSED PRODUCTS with Filtering & Sorting
  const processedProducts = useMemo(() => {
    console.log("🧠 [useProductsLogic] Processing products:", {
      inputCount: products?.length || 0,
      searchTerm,
      filters,
      sortBy,
    });

    // Safety check
    if (!products || !Array.isArray(products)) {
      return [];
    }

    let results = [...products];

    // 🔍 SEARCH FILTER
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description?.toLowerCase() || "").includes(searchLower) ||
          (product.category?.toLowerCase() || "").includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower)
      );
      console.log("🔍 [useProductsLogic] After search:", results.length);
    }

    // 🏷️ CATEGORY FILTER
    if (filters.categories.length > 0) {
      results = results.filter(
        (product) =>
          product.category && filters.categories.includes(product.category)
      );
      console.log("🏷️ [useProductsLogic] After category:", results.length);
    }

    // 💰 PRICE RANGE FILTER
    results = results.filter((product) => {
      const productPrice =
        product.publicPrice || product.price || product.currentPrice || 0;
      return (
        productPrice >= filters.priceRange[0] &&
        productPrice <= filters.priceRange[1]
      );
    });
    console.log("💰 [useProductsLogic] After price:", results.length);

    // ⭐ RATING FILTER
    if (filters.ratings.length > 0) {
      results = results.filter(
        (product) =>
          product.rating &&
          filters.ratings.some((rating) => product.rating! >= rating)
      );
      console.log("⭐ [useProductsLogic] After rating:", results.length);
    }

    // 📦 STOCK FILTER
    if (filters.inStock) {
      results = results.filter((product) => product.stock && product.stock > 0);
      console.log("📦 [useProductsLogic] After stock:", results.length);
    }

    // 🔥 SALE FILTER
    if (filters.onSale) {
      results = results.filter((product) => product.isOnSale);
      console.log("🔥 [useProductsLogic] After sale:", results.length);
    }

    // 🔄 SORTING
    const getProductPrice = (product: ProductForCustomer) =>
      product.publicPrice || product.price || product.currentPrice || 0;

    switch (sortBy) {
      case "price_asc":
        results.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price_desc":
        results.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "bestseller":
        results.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      default: // relevance
        break;
    }

    console.log("✅ [useProductsLogic] Final results:", {
      count: results.length,
      firstProduct: results[0]?.name,
      sortBy,
    });

    return results;
  }, [products, searchTerm, filters, sortBy]);

  // 🔧 FILTER LOGIC HELPERS
  const handleCategoryFilter = useCallback(
    (category: string, currentFilters: ProductFilters) => {
      return {
        ...currentFilters,
        categories: currentFilters.categories.includes(category)
          ? currentFilters.categories.filter((c) => c !== category)
          : [...currentFilters.categories, category],
      };
    },
    []
  );

  const handlePriceRangeFilter = useCallback(
    (range: [number, number], currentFilters: ProductFilters) => {
      return { ...currentFilters, priceRange: range };
    },
    []
  );

  const handleRatingFilter = useCallback(
    (rating: number, currentFilters: ProductFilters) => {
      return {
        ...currentFilters,
        ratings: currentFilters.ratings.includes(rating)
          ? currentFilters.ratings.filter((r) => r !== rating)
          : [...currentFilters.ratings, rating],
      };
    },
    []
  );

  const handleSpecialFilterChange = useCallback(
    (
      key: keyof ProductFilters,
      value: boolean | string[] | [number, number],
      currentFilters: ProductFilters
    ) => {
      return { ...currentFilters, [key]: value };
    },
    []
  );

  // 📊 BUSINESS LOGIC COMPUTATIONS
  const activeFiltersCount = useMemo(() => {
    return (
      filters.categories.length +
      filters.ratings.length +
      (filters.onSale ? 1 : 0) +
      (filters.inStock ? 1 : 0)
    );
  }, [filters]);

  const priceRange = useMemo(() => {
    if (!processedProducts.length) return { min: 0, max: 0 };

    const prices = processedProducts.map(
      (p) => p.publicPrice || p.price || p.currentPrice || 0
    );

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [processedProducts]);

  const availableCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    processedProducts.forEach((product) => {
      if (product.category) {
        categoryMap.set(
          product.category,
          (categoryMap.get(product.category) || 0) + 1
        );
      }
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [processedProducts]);

  return {
    // Main processed data
    processedProducts,

    // Computed values
    activeFiltersCount,
    priceRange,
    availableCategories,

    // Filter helpers
    handleCategoryFilter,
    handlePriceRangeFilter,
    handleRatingFilter,
    handleSpecialFilterChange,
  };
}

export default useProductsLogic;
