/**
 * 🧠 USE OVERVIEW LOGIC HOOK
 * ==========================
 *
 * Hook especializado para la lógica de negocio básica del OverviewTab:
 * procesamiento de datos, featured products, categories y stats.
 *
 * 📍 Nueva ubicación: /hooks/overview/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useMemo } from "react";
import {
  ProductForCustomer,
  CategoryForCustomer,
} from "@/features/storefront/types";

interface UseOverviewLogicProps {
  products: ProductForCustomer[];
  featuredProducts: ProductForCustomer[];
  categories: CategoryForCustomer[];
  wishlistCount: number;
}

export function useOverviewLogic({
  products,
  featuredProducts,
  categories,
  wishlistCount,
}: UseOverviewLogicProps) {
  // 📊 OVERVIEW STATS COMPUTATION
  const overviewStats = useMemo(() => {
    const totalProducts = products?.length || 0;
    const inStockProducts = products?.filter((p) => p.stock > 0).length || 0;
    const onSaleProducts = products?.filter((p) => p.isOnSale).length || 0;
    const totalCategories = categories?.length || 0;

    return {
      totalProducts,
      inStockProducts,
      onSaleProducts,
      totalCategories,
      wishlistItems: wishlistCount,
    };
  }, [products, categories, wishlistCount]);

  // 🌟 FEATURED PRODUCTS PROCESSING
  const processedFeaturedProducts = useMemo(() => {
    console.log("🧠 [useOverviewLogic] Processing featured products:", {
      inputCount: featuredProducts?.length || 0,
      approach: "display-ready",
    });

    if (!featuredProducts?.length) {
      return [];
    }

    // Featured products are already pre-processed by the server
    // Just ensure they're display-ready
    const results = featuredProducts.slice(0, 6); // Limit to 6 for overview

    console.log("✅ [useOverviewLogic] Featured products result:", {
      count: results.length,
      firstProduct: results[0]?.name,
      withWishlist: results.filter((p) => p.isWishlisted).length,
    });

    return results;
  }, [featuredProducts]);

  // 🏷️ POPULAR CATEGORIES PROCESSING
  const popularCategories = useMemo(() => {
    console.log("🧠 [useOverviewLogic] Processing popular categories:", {
      inputCount: categories?.length || 0,
    });

    if (!categories?.length) {
      return [];
    }

    // Sort by product count and take top 8
    const sorted = [...categories]
      .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
      .slice(0, 8);

    console.log("✅ [useOverviewLogic] Popular categories result:", {
      count: sorted.length,
      topCategory: sorted[0]?.name,
      totalProducts: sorted.reduce(
        (sum, cat) => sum + (cat.productCount || 0),
        0
      ),
    });

    return sorted;
  }, [categories]);

  // 🔍 SEARCH SUGGESTIONS
  const searchSuggestions = useMemo(() => {
    if (!products?.length) return [];

    // Get top brands for search suggestions
    const brandMap = new Map<string, number>();
    products.forEach((product) => {
      if (product.brand) {
        brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1);
      }
    });

    return Array.from(brandMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([brand]) => brand);
  }, [products]);

  // 📈 TRENDS & INSIGHTS
  const insights = useMemo(() => {
    if (!products?.length || !overviewStats) return null;

    const avgPrice =
      products.reduce((sum, p) => sum + (p.currentPrice || 0), 0) /
      products.length;
    const salePercentage = (
      (overviewStats.onSaleProducts / products.length) *
      100
    ).toFixed(1);
    const stockPercentage = (
      (overviewStats.inStockProducts / products.length) *
      100
    ).toFixed(1);

    return {
      avgPrice: Math.round(avgPrice),
      salePercentage: parseFloat(salePercentage),
      stockPercentage: parseFloat(stockPercentage),
      mostPopularCategory: popularCategories[0]?.name || "N/A",
    };
  }, [products, overviewStats, popularCategories]);

  return {
    // Main processed data
    processedFeaturedProducts,
    popularCategories,

    // Computed values
    overviewStats,
    searchSuggestions,
    insights,
  };
}

export default useOverviewLogic;
