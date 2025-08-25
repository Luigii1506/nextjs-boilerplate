/**
 * 📦 INVENTORY HOOKS - BARREL EXPORTS
 * ==================================
 *
 * Exportaciones centralizadas para todos los hooks del módulo inventory
 *
 * Created: 2025-01-17 - Inventory Management Module
 * Updated: 2025-01-18 - Consolidated UI hooks
 */

// 🎯 Main hooks
// 🔄 Data Query hooks
export { useInventoryQuery } from "./useInventoryQuery";
export { useProductsQuery } from "./useProductsQuery";
export { useCategoriesQuery } from "./useCategoriesQuery";
export { useSuppliersQuery } from "./useSuppliersQuery";

// 🎯 UI Interaction hooks
export { useScrollHeader, useTabScrollHeader } from "./useScrollHeader";

// 📝 Form and Mutation hooks - Products
export {
  useCreateProduct,
  useCreateProductWithNotifications,
  useCreateProductModal,
  useUpdateProduct,
  useUpdateProductModal,
  useDeleteProduct,
  useDeleteProductModal,
} from "./useCreateProduct";

// 📝 Form and Mutation hooks - Categories
export {
  useCreateCategory,
  useCreateCategoryWithNotifications,
  useCreateCategoryModal,
  useUpdateCategory,
  useUpdateCategoryWithNotifications,
  useUpdateCategoryModal,
  useDeleteCategory,
  useDeleteCategoryWithNotifications,
  useDeleteCategoryModal,
} from "./useCreateCategory";

// 🗂️ Query keys for external invalidation
export {
  INVENTORY_QUERY_KEYS,
  PRODUCTS_QUERY_KEYS,
  CATEGORIES_QUERY_KEYS,
  SUPPLIERS_QUERY_KEYS,
  STOCK_MOVEMENTS_QUERY_KEYS,
} from "./useInventoryQuery";

// 🔧 Utility hooks (will be created later)
// export { useStockCalculations } from "./useStockCalculations";
// export { useInventoryFilters } from "./useInventoryFilters";
// export { useBulkActions } from "./useBulkActions";
