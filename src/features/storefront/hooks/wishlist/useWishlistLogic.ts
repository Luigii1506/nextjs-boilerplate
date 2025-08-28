/**
 * 🧠 USE WISHLIST LOGIC HOOK
 * ==========================
 *
 * Hook especializado para toda la lógica de negocio de wishlist:
 * conversión de wishlist items a productos, filtrado, búsqueda y ordenamiento.
 *
 * 📍 Nueva ubicación: /hooks/wishlist/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useMemo, useCallback } from "react";
import { ProductForCustomer } from "@/features/storefront/types";
import { WishlistFilters } from "../../ui/components/tabs/wishlist/types";

interface UseWishlistLogicProps {
  wishlist: any[];
  searchTerm: string;
  filters: WishlistFilters;
}

export function useWishlistLogic({
  wishlist,
  searchTerm,
  filters,
}: UseWishlistLogicProps) {
  // 🔄 Convert wishlist items to products with enhanced debugging
  const wishlistProducts = useMemo(() => {
    console.log("🧠 [useWishlistLogic] Converting wishlist to products:", {
      wishlistLength: wishlist?.length || 0,
      wishlistItems: wishlist?.map((item) => ({
        id: item.id,
        productId: item.productId,
        addedAt: item.addedAt,
        hasProductIncluded: !!item.product,
        productName: item.product?.name?.slice(0, 30),
      })),
      approach: "using-included-products",
    });

    // 🚮 FILTER OUT TEMP ITEMS: Remove temporary optimistic items that don't have products
    const realWishlistItems = (wishlist || []).filter((item) => {
      const isTemp = item.id.startsWith("temp-");
      if (isTemp && !item.product) {
        console.log(
          "🚮 [useWishlistLogic] Filtering out temp item without product:",
          {
            itemId: item.id,
            productId: item.productId,
            hasProduct: !!item.product,
          }
        );
        return false;
      }
      return true;
    });

    console.log("🧹 [useWishlistLogic] After filtering temp items:", {
      originalCount: (wishlist || []).length,
      filteredCount: realWishlistItems.length,
      removedTempItems: (wishlist || []).length - realWishlistItems.length,
    });

    // ✅ NEW APPROACH: Use the product that comes WITH the wishlist item
    const result = realWishlistItems
      .map((item, index) => {
        console.log(`🔍 [useWishlistLogic] Processing item ${index + 1}:`, {
          wishlistItemId: item.id,
          productId: item.productId,
          addedAt: item.addedAt,
          hasProductIncluded: !!item.product,
          productName: item.product?.name?.slice(0, 30),
        });

        // ✅ USE DIRECT PRODUCT: The wishlist already includes complete product data
        if (!item.product) {
          console.error(
            "❌ [useWishlistLogic] No product included in wishlist item:",
            {
              searchingFor: item.productId,
              wishlistItemId: item.id,
              itemKeys: Object.keys(item),
            }
          );
          return null;
        }

        const wishlistProduct = {
          ...item.product,
          dateAddedToWishlist: item.addedAt,
          isWishlisted: true, // Ensure it's marked as wishlisted
        };

        console.log("✅ [useWishlistLogic] Using included product:", {
          productId: item.product.id,
          productName: item.product.name,
          source: "wishlist-included",
          originalIsWishlisted: item.product.isWishlisted,
          finalIsWishlisted: true,
        });

        return wishlistProduct;
      })
      .filter(
        (product) => product !== null && product.isWishlisted === true
      ) as (ProductForCustomer & { dateAddedToWishlist: Date })[];

    console.log("📋 [useWishlistLogic] Final wishlist products result:", {
      inputWishlistItems: wishlist?.length || 0,
      filteredWishlistItems: realWishlistItems.length,
      outputProducts: result.length,
      successRate: `${result.length}/${realWishlistItems.length}`,
      productsFound: result.map((p) => ({
        id: p.id,
        name: p.name.slice(0, 30),
        isWishlisted: p.isWishlisted,
      })),
      missingProducts: realWishlistItems.length - result.length,
    });

    return result;
  }, [wishlist]);

  // 📊 Processed Products with Filtering & Sorting
  const processedProducts = useMemo(() => {
    console.log("🔄 [useWishlistLogic] Starting processing:", {
      inputWishlistProducts: wishlistProducts.length,
      inputProductIds: wishlistProducts.map((p) => ({
        id: p.id,
        name: p.name.slice(0, 30),
      })),
      searchTerm,
      filters,
    });

    let results = [...wishlistProducts];

    // 🔍 SEARCH FILTER
    if (searchTerm.trim()) {
      const beforeSearch = results.length;
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description &&
            product.description.toLowerCase().includes(searchLower)) ||
          (product.category &&
            product.category.toLowerCase().includes(searchLower)) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower))
      );
      console.log("🔍 [useWishlistLogic] After search filter:", {
        searchTerm,
        before: beforeSearch,
        after: results.length,
      });
    }

    // 🏷️ CATEGORY FILTER
    if (filters.categories.length > 0) {
      const beforeCategory = results.length;
      results = results.filter(
        (product) =>
          product &&
          product.category &&
          filters.categories.includes(product.category)
      );
      console.log("🏷️ [useWishlistLogic] After category filter:", {
        categoryFilters: filters.categories,
        before: beforeCategory,
        after: results.length,
      });
    }

    // 💰 PRICE RANGE FILTER
    const beforePrice = results.length;
    results = results.filter(
      (product) =>
        (product.currentPrice || 0) >= filters.priceRange[0] &&
        (product.currentPrice || 0) <= filters.priceRange[1]
    );
    console.log("💰 [useWishlistLogic] After price filter:", {
      priceRange: filters.priceRange,
      before: beforePrice,
      after: results.length,
      rejectedPrices: wishlistProducts
        .filter(
          (p) =>
            (p.currentPrice || 0) < filters.priceRange[0] ||
            (p.currentPrice || 0) > filters.priceRange[1]
        )
        .map((p) => ({
          name: p.name.slice(0, 30),
          price: p.currentPrice || 0,
        })),
    });

    // 🔥 SALE FILTER
    if (filters.onSale) {
      const beforeSale = results.length;
      results = results.filter((product) => product.isOnSale);
      console.log("🔥 [useWishlistLogic] After sale filter:", {
        onSale: filters.onSale,
        before: beforeSale,
        after: results.length,
      });
    }

    // 📦 STOCK FILTER
    if (filters.inStock) {
      const beforeStock = results.length;
      results = results.filter((product) => product.stock > 0);
      console.log("📦 [useWishlistLogic] After stock filter:", {
        inStock: filters.inStock,
        before: beforeStock,
        after: results.length,
      });
    }

    // 🔄 SORTING
    switch (filters.sortBy) {
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price_asc":
        results.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
        break;
      case "price_desc":
        results.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
        break;
      case "rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // date_added
        results.sort(
          (a, b) =>
            new Date(b.dateAddedToWishlist).getTime() -
            new Date(a.dateAddedToWishlist).getTime()
        );
        break;
    }

    console.log("✅ [useWishlistLogic] Final processed result:", {
      inputCount: wishlistProducts.length,
      outputCount: results.length,
      finalProducts: results.map((p) => ({
        id: p.id,
        name: p.name.slice(0, 30),
        price: p.currentPrice || 0,
        isWishlisted: p.isWishlisted,
      })),
      allFiltersApplied: {
        search: !!searchTerm.trim(),
        categories: filters.categories.length > 0,
        priceRange: `${filters.priceRange[0]}-${filters.priceRange[1]}`,
        onSale: filters.onSale,
        inStock: filters.inStock,
        sortBy: filters.sortBy,
      },
    });

    return results;
  }, [wishlistProducts, searchTerm, filters]);

  // 🔧 FILTER LOGIC HELPERS
  const handleSortChange = useCallback(
    (sortBy: string) => {
      return {
        ...filters,
        sortBy: sortBy as WishlistFilters["sortBy"],
      };
    },
    [filters]
  );

  const handleCategoryFilter = useCallback(
    (category: string) => {
      return {
        ...filters,
        categories: filters.categories.includes(category)
          ? filters.categories.filter((c) => c !== category)
          : [...filters.categories, category],
      };
    },
    [filters]
  );

  const handlePriceRangeFilter = useCallback(
    (range: [number, number]) => {
      return { ...filters, priceRange: range };
    },
    [filters]
  );

  const handleSpecialFilterChange = useCallback(
    (
      key: keyof WishlistFilters,
      value: string | number | boolean | string[] | [number, number]
    ) => {
      return { ...filters, [key]: value };
    },
    [filters]
  );

  // 📊 BUSINESS LOGIC COMPUTATIONS
  const availableCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    wishlistProducts.forEach((product) => {
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
  }, [wishlistProducts]);

  const priceRange = useMemo(() => {
    if (!wishlistProducts.length) return { min: 0, max: 0 };

    const prices = wishlistProducts.map((p) => p.currentPrice || 0);

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [wishlistProducts]);

  return {
    // Main processed data
    wishlistProducts,
    processedProducts,

    // Computed values
    availableCategories,
    priceRange,

    // Filter helpers
    handleSortChange,
    handleCategoryFilter,
    handlePriceRangeFilter,
    handleSpecialFilterChange,
  };
}

export default useWishlistLogic;
