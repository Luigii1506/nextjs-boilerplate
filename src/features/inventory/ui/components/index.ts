/**
 * 📦 INVENTORY UI COMPONENTS - BARREL EXPORTS
 * ==========================================
 *
 * Exportaciones centralizadas para todos los componentes UI del módulo inventory
 *
 * Created: 2025-01-17 - Inventory Management Module
 * Updated: 2025-01-18 - Added tabs exports
 */

// 🎯 Shared components (reusable across the module)
export {
  ProductCard,
  StockIndicator,
  CategoryBadge,
  TabTransition,
  TabLoadingSkeleton,
  TabBadge,
} from "./shared";

// 🔍 Tab Components (SPA navigation)
export { default as OverviewTab } from "./tabs/OverviewTab";
export { default as ProductsTab } from "./tabs/ProductsTab";
export { default as CategoriesTab } from "./tabs/CategoriesTab";

// 📝 Modals and Forms
export { default as ProductModal } from "./ProductModal";
export { DeleteProductModal } from "./DeleteProductModal";
export { default as ProductViewModal } from "./ProductViewModal";
export { default as CategoryModal } from "./CategoryModal";
export { default as CategoryViewModal } from "./CategoryViewModal";
export { default as CategoryDeleteModal } from "./CategoryDeleteModal";

// 📊 Main components (TODO: Create these components)
// export { default as ProductsTable } from "./ProductsTable";
// export { default as ProductModal } from "./ProductModal";
// export { default as StockMovements } from "./StockMovements";
// export { default as LowStockAlert } from "./LowStockAlert";
// export { default as BulkActions } from "./BulkActions";

// 🏷️ Category components (TODO: Create these components)
// export { default as CategoriesTree } from "./CategoriesTree";

// 🚛 Supplier components (TODO: Create these components)
// export { default as SuppliersGrid } from "./SuppliersGrid";
// export { default as SupplierModal } from "./SupplierModal";

// 🔍 Search and filter components (TODO: Create these components)
// export { default as InventoryFilters } from "./InventoryFilters";
// export { default as ProductSearch } from "./ProductSearch";
