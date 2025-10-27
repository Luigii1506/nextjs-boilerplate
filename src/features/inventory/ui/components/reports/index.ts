/**
 * 📊 REPORTS COMPONENTS - BARREL EXPORTS
 * =======================================
 *
 * Centralized exports for reports and analytics UI components
 *
 * Created: 2025-01-27 - Reports Components Extraction
 */

// Chart Configuration
export * from "./chartConfig";

// Chart Loading Spinner
export { ChartLoadingSpinner } from "./ChartLoadingSpinner";

// Chart Components
export { StockMovementsChart } from "./StockMovementsChart";
export type { StockMovementsChartProps } from "./StockMovementsChart";

export { InventoryValueChart } from "./InventoryValueChart";
export type { InventoryValueChartProps } from "./InventoryValueChart";

export { TopProductsChart } from "./TopProductsChart";

export { ProductsByCategoryChart } from "./ProductsByCategoryChart";

// Summary Components
export { StockAlertsSummary } from "./StockAlertsSummary";
