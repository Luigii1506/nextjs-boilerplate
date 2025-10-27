/**
 * 🧰 INVENTORY UTILS - BARREL EXPORT
 * ===================================
 *
 * Central export point for all inventory utility functions
 * Organized by domain: helpers, formatters, metrics, import/export, filters
 *
 * Created: 2025-01-27 - Inventory Utils Refactor
 */

// 🧮 Product Helpers - Pure calculation functions
export {
  calculateStockStatus,
  calculateStockPercentage,
  calculateInventoryValue,
  calculateRetailValue,
  calculateProfitMargin,
  computeProductProps,
  productNeedsAttention,
  sortProductsByStockPriority,
} from "./product.helpers";

// 🎨 Product Formatters - Display formatting functions
export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatStockStatus,
  formatMovementType,
  formatSKU,
  truncateText,
  formatFileSize,
} from "./product.formatters";

// 📊 Inventory Metrics - Aggregation and analytics functions
export {
  calculateInventoryMetrics,
  calculateOperationalMetrics,
  calculateCategoryMetrics,
  calculateStockDistribution,
  calculateTopProductsByValue,
  calculateAverageStock,
  calculateStockTurnover,
  calculateReorderProducts,
} from "./inventory.metrics";

// 📤 Import/Export utilities (already exist)
export * from "./import";
export * from "./export";

// 🔍 Filter Presets utilities (already exist)
export * from "./filterPresets";

// 📋 Type exports for convenience
export type {
  InventoryMetrics,
  OperationalMetrics,
  CategoryMetrics,
} from "./inventory.metrics";
