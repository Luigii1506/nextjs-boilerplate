/**
 * 📦 PRODUCTS HOOKS BARREL EXPORT
 * ===============================
 *
 * Centralized exports for all Products-related hooks.
 *
 * 📍 Nueva ubicación: /hooks/products/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

// 🔄 State Management
export {
  useProductsState,
  type ProductsState,
  type ProductsAction,
} from "./useProductsState";

// 🧠 Business Logic
export {
  useProductsLogic,
  default as useProductsFilters,
} from "./useProductsLogic";

// ⚡ Actions
export { useProductsActions } from "./useProductsActions";


