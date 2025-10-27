/**
 * 📊 USE PRODUCT METRICS HOOK
 * ===========================
 *
 * Custom hook for calculating and memoizing product metrics
 * Encapsulates complex useMemo logic from tabs
 *
 * USAGE:
 * const { inventoryMetrics, operationalMetrics } = useProductMetrics()
 *
 * Created: 2025-01-27 - Inventory Hooks Refactor
 */

import { useMemo } from "react";
import { useInventoryContext } from "../context";
import {
  calculateInventoryMetrics,
  calculateOperationalMetrics,
  type InventoryMetrics,
  type OperationalMetrics,
} from "../utils";

/**
 * Hook return type
 */
export interface UseProductMetricsReturn {
  inventoryMetrics: InventoryMetrics;
  operationalMetrics: OperationalMetrics;
  isLoading: boolean;
  hasProducts: boolean;
}

/**
 * Calculate and memoize inventory metrics
 *
 * This hook extracts the heavy useMemo logic from OverviewTab
 * making it reusable and testable
 *
 * @returns Metrics object with inventory and operational data
 *
 * @example
 * const MyDashboard = () => {
 *   const { inventoryMetrics, operationalMetrics } = useProductMetrics()
 *
 *   return (
 *     <div>
 *       <p>Total Products: {inventoryMetrics.totalProducts}</p>
 *       <p>Needs Attention: {operationalMetrics.needsAttentionCount}</p>
 *     </div>
 *   )
 * }
 */
export const useProductMetrics = (): UseProductMetricsReturn => {
  const { inventory } = useInventoryContext();
  const { products, isLoading } = inventory;

  // Memoize inventory-wide metrics
  const inventoryMetrics = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        totalValue: 0,
        totalRetailValue: 0,
        totalProfit: 0,
        lowStockCount: 0,
        criticalStockCount: 0,
        outOfStockCount: 0,
        needsAttentionCount: 0,
      };
    }

    return calculateInventoryMetrics(products);
  }, [products]);

  // Memoize operational metrics (filtered products)
  const operationalMetrics = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        needsAttentionCount: 0,
        lowStockProducts: [],
        criticalStockProducts: [],
        outOfStockProducts: [],
        recentProducts: [],
      };
    }

    return calculateOperationalMetrics(products);
  }, [products]);

  return {
    inventoryMetrics,
    operationalMetrics,
    isLoading,
    hasProducts: products.length > 0,
  };
};
