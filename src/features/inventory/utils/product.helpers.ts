/**
 * 🧮 PRODUCT HELPERS
 * ==================
 *
 * Pure utility functions for product calculations and transformations
 * These are stateless, side-effect free functions that can be tested independently
 *
 * RULES:
 * - No React hooks
 * - No side effects
 * - Pure functions only
 * - Easily testable
 *
 * Created: 2025-01-27 - Inventory Utils Refactor
 */

import type {
  ProductWithRelations,
  ProductWithComputedProps,
  StockStatus,
} from "../types";

/**
 * Calculate stock status based on current stock and thresholds
 *
 * @param stock - Current stock quantity
 * @param minStock - Minimum stock threshold
 * @returns Stock status enum
 *
 * @example
 * calculateStockStatus(0, 10) // "OUT_OF_STOCK"
 * calculateStockStatus(5, 10) // "LOW_STOCK"
 * calculateStockStatus(2, 10) // "CRITICAL_STOCK"
 * calculateStockStatus(15, 10) // "IN_STOCK"
 */
export const calculateStockStatus = (
  stock: number,
  minStock: number
): StockStatus => {
  if (stock === 0) return "OUT_OF_STOCK";
  if (stock <= 2) return "CRITICAL_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
};

/**
 * Calculate stock percentage based on max stock
 *
 * @param stock - Current stock quantity
 * @param maxStock - Maximum stock capacity
 * @returns Percentage (0-100)
 *
 * @example
 * calculateStockPercentage(50, 100) // 50
 * calculateStockPercentage(75, null) // 100
 */
export const calculateStockPercentage = (
  stock: number,
  maxStock: number | null
): number => {
  if (!maxStock) return 100;
  return (stock / maxStock) * 100;
};

/**
 * Calculate total inventory value (cost-based)
 *
 * @param cost - Unit cost
 * @param stock - Current stock quantity
 * @returns Total value
 *
 * @example
 * calculateInventoryValue(10.50, 100) // 1050
 */
export const calculateInventoryValue = (
  cost: number,
  stock: number
): number => {
  return cost * stock;
};

/**
 * Calculate total retail value (price-based)
 *
 * @param price - Unit price
 * @param stock - Current stock quantity
 * @returns Total retail value
 *
 * @example
 * calculateRetailValue(15.99, 100) // 1599
 */
export const calculateRetailValue = (price: number, stock: number): number => {
  return price * stock;
};

/**
 * Calculate profit margin percentage
 *
 * @param price - Selling price
 * @param cost - Unit cost
 * @returns Profit margin percentage
 *
 * @example
 * calculateProfitMargin(150, 100) // 50
 */
export const calculateProfitMargin = (price: number, cost: number): number => {
  if (cost === 0) return 0;
  return ((price - cost) / cost) * 100;
};

/**
 * Main utility function to compute all product properties
 * This enriches a product with calculated fields for UI display
 *
 * @param product - Product with relations from DB
 * @returns Product with all computed properties
 *
 * @example
 * const enrichedProduct = computeProductProps(rawProduct)
 * console.log(enrichedProduct.stockStatus) // "LOW_STOCK"
 * console.log(enrichedProduct.formattedPrice) // "$150.00"
 */
export const computeProductProps = (
  product: ProductWithRelations
): ProductWithComputedProps => {
  // Calculate stock status
  const stockStatus = calculateStockStatus(product.stock, product.minStock);

  // Calculate stock percentage
  const stockPercentage = calculateStockPercentage(
    product.stock,
    product.maxStock
  );

  // Calculate values
  const totalValue = calculateInventoryValue(product.cost, product.stock);
  const totalRetailValue = calculateRetailValue(product.price, product.stock);

  // Format currency (will be moved to formatters.ts)
  const formattedPrice = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(product.price);

  const formattedCost = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(product.cost);

  return {
    ...product,
    stockStatus,
    stockPercentage,
    totalValue,
    totalRetailValue,
    isLowStock: stockStatus === "LOW_STOCK",
    isCriticalStock: stockStatus === "CRITICAL_STOCK",
    isOutOfStock: stockStatus === "OUT_OF_STOCK",
    lastMovement: product.stockMovements?.[0],
    formattedPrice,
    formattedCost,
  };
};

/**
 * Check if product needs attention (low or out of stock)
 *
 * @param product - Product to check
 * @returns Boolean indicating if attention is needed
 */
export const productNeedsAttention = (
  product: ProductWithRelations
): boolean => {
  const status = calculateStockStatus(product.stock, product.minStock);
  return (
    status === "OUT_OF_STOCK" ||
    status === "CRITICAL_STOCK" ||
    status === "LOW_STOCK"
  );
};

/**
 * Sort products by stock status priority (critical first)
 *
 * @param products - Array of products
 * @returns Sorted array
 */
export const sortProductsByStockPriority = (
  products: ProductWithRelations[]
): ProductWithRelations[] => {
  const statusPriority: Record<StockStatus, number> = {
    OUT_OF_STOCK: 0,
    CRITICAL_STOCK: 1,
    LOW_STOCK: 2,
    IN_STOCK: 3,
  };

  return [...products].sort((a, b) => {
    const statusA = calculateStockStatus(a.stock, a.minStock);
    const statusB = calculateStockStatus(b.stock, b.minStock);
    return statusPriority[statusA] - statusPriority[statusB];
  });
};
