/**
 * 📊 INVENTORY METRICS
 * ====================
 *
 * Aggregation and calculation functions for inventory dashboard metrics
 * These functions process collections of products to generate insights
 *
 * RULES:
 * - Pure aggregation functions
 * - No side effects
 * - Return normalized data structures
 * - Performance optimized for large datasets
 *
 * Created: 2025-01-27 - Inventory Utils Refactor
 */

import type { ProductWithRelations, StockStatus } from "../types";
import { calculateStockStatus, productNeedsAttention } from "./product.helpers";

/**
 * Inventory Dashboard Metrics
 */
export interface InventoryMetrics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalValue: number;
  totalRetailValue: number;
  totalProfit: number;
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
  needsAttentionCount: number;
}

/**
 * Operational Metrics for Overview
 */
export interface OperationalMetrics {
  needsAttentionCount: number;
  lowStockProducts: ProductWithRelations[];
  criticalStockProducts: ProductWithRelations[];
  outOfStockProducts: ProductWithRelations[];
  recentProducts: ProductWithRelations[];
}

/**
 * Category Metrics
 */
export interface CategoryMetrics {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalValue: number;
  averageStock: number;
  lowStockCount: number;
}

/**
 * Calculate comprehensive inventory metrics
 *
 * @param products - Array of products with relations
 * @returns Aggregated inventory metrics
 *
 * @example
 * const metrics = calculateInventoryMetrics(products)
 * console.log(metrics.totalValue) // 125000
 * console.log(metrics.lowStockCount) // 15
 */
export const calculateInventoryMetrics = (
  products: ProductWithRelations[]
): InventoryMetrics => {
  const activeProducts = products.filter((p) => p.isActive);
  const inactiveProducts = products.filter((p) => !p.isActive);

  let totalValue = 0;
  let totalRetailValue = 0;
  let lowStockCount = 0;
  let criticalStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((product) => {
    // Calculate values
    totalValue += product.cost * product.stock;
    totalRetailValue += product.price * product.stock;

    // Count stock statuses
    const status = calculateStockStatus(product.stock, product.minStock);
    if (status === "LOW_STOCK") lowStockCount++;
    if (status === "CRITICAL_STOCK") criticalStockCount++;
    if (status === "OUT_OF_STOCK") outOfStockCount++;
  });

  const needsAttentionCount =
    lowStockCount + criticalStockCount + outOfStockCount;

  return {
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    inactiveProducts: inactiveProducts.length,
    totalValue,
    totalRetailValue,
    totalProfit: totalRetailValue - totalValue,
    lowStockCount,
    criticalStockCount,
    outOfStockCount,
    needsAttentionCount,
  };
};

/**
 * Calculate operational metrics for overview dashboard
 *
 * @param products - Array of products with relations
 * @returns Operational metrics with filtered products
 *
 * @example
 * const metrics = calculateOperationalMetrics(products)
 * console.log(metrics.criticalStockProducts) // [...]
 */
export const calculateOperationalMetrics = (
  products: ProductWithRelations[]
): OperationalMetrics => {
  const lowStockProducts: ProductWithRelations[] = [];
  const criticalStockProducts: ProductWithRelations[] = [];
  const outOfStockProducts: ProductWithRelations[] = [];

  products.forEach((product) => {
    const status = calculateStockStatus(product.stock, product.minStock);

    if (status === "LOW_STOCK") {
      lowStockProducts.push(product);
    } else if (status === "CRITICAL_STOCK") {
      criticalStockProducts.push(product);
    } else if (status === "OUT_OF_STOCK") {
      outOfStockProducts.push(product);
    }
  });

  const needsAttentionCount =
    lowStockProducts.length +
    criticalStockProducts.length +
    outOfStockProducts.length;

  // Get recent products (last 10 updated)
  const recentProducts = [...products]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 10);

  return {
    needsAttentionCount,
    lowStockProducts,
    criticalStockProducts,
    outOfStockProducts,
    recentProducts,
  };
};

/**
 * Calculate metrics grouped by category
 *
 * @param products - Array of products with relations
 * @returns Array of category metrics
 *
 * @example
 * const metrics = calculateCategoryMetrics(products)
 * metrics.forEach(cat => console.log(cat.categoryName, cat.productCount))
 */
export const calculateCategoryMetrics = (
  products: ProductWithRelations[]
): CategoryMetrics[] => {
  const categoryMap = new Map<string, CategoryMetrics>();

  products.forEach((product) => {
    if (!product.category) return;

    const categoryId = product.category.id;
    const existing = categoryMap.get(categoryId);

    if (existing) {
      existing.productCount++;
      existing.totalValue += product.cost * product.stock;
      existing.averageStock =
        (existing.averageStock * (existing.productCount - 1) + product.stock) /
        existing.productCount;

      if (productNeedsAttention(product)) {
        existing.lowStockCount++;
      }
    } else {
      categoryMap.set(categoryId, {
        categoryId,
        categoryName: product.category.name,
        productCount: 1,
        totalValue: product.cost * product.stock,
        averageStock: product.stock,
        lowStockCount: productNeedsAttention(product) ? 1 : 0,
      });
    }
  });

  return Array.from(categoryMap.values()).sort(
    (a, b) => b.productCount - a.productCount
  );
};

/**
 * Calculate stock distribution by status
 *
 * @param products - Array of products
 * @returns Object with counts per status
 *
 * @example
 * const distribution = calculateStockDistribution(products)
 * console.log(distribution) // { IN_STOCK: 100, LOW_STOCK: 25, ... }
 */
export const calculateStockDistribution = (
  products: ProductWithRelations[]
): Record<StockStatus, number> => {
  const distribution: Record<StockStatus, number> = {
    IN_STOCK: 0,
    LOW_STOCK: 0,
    CRITICAL_STOCK: 0,
    OUT_OF_STOCK: 0,
  };

  products.forEach((product) => {
    const status = calculateStockStatus(product.stock, product.minStock);
    distribution[status]++;
  });

  return distribution;
};

/**
 * Calculate top products by value
 *
 * @param products - Array of products
 * @param limit - Number of top products to return (default: 10)
 * @returns Array of top products
 *
 * @example
 * const topProducts = calculateTopProductsByValue(products, 5)
 * topProducts.forEach(p => console.log(p.name, p.totalValue))
 */
export const calculateTopProductsByValue = (
  products: ProductWithRelations[],
  limit: number = 10
): Array<ProductWithRelations & { totalValue: number }> => {
  return products
    .map((product) => ({
      ...product,
      totalValue: product.cost * product.stock,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);
};

/**
 * Calculate average stock level
 *
 * @param products - Array of products
 * @returns Average stock quantity
 *
 * @example
 * const avgStock = calculateAverageStock(products) // 45.5
 */
export const calculateAverageStock = (
  products: ProductWithRelations[]
): number => {
  if (products.length === 0) return 0;

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  return totalStock / products.length;
};

/**
 * Calculate stock turnover rate (requires movements data)
 *
 * @param products - Array of products with movements
 * @param days - Number of days to calculate (default: 30)
 * @returns Turnover rate
 *
 * @example
 * const turnover = calculateStockTurnover(products, 30) // 2.5
 */
export const calculateStockTurnover = (
  products: ProductWithRelations[],
  days: number = 30
): number => {
  // This is a simplified calculation
  // In production, you'd want actual sales/movements data
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalMovements = products.reduce(
    (sum, p) => sum + (p.stockMovements?.length || 0),
    0
  );

  if (totalStock === 0) return 0;
  return (totalMovements / totalStock) * (365 / days);
};

/**
 * Calculate products below reorder point
 *
 * @param products - Array of products
 * @returns Array of products that need reordering
 *
 * @example
 * const needsReorder = calculateReorderProducts(products)
 * console.log(`${needsReorder.length} products need reordering`)
 */
export const calculateReorderProducts = (
  products: ProductWithRelations[]
): ProductWithRelations[] => {
  return products.filter((product) => {
    const status = calculateStockStatus(product.stock, product.minStock);
    return status !== "IN_STOCK" && product.isActive;
  });
};
