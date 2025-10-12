/**
 * 🛒 CART FEATURE - MAIN EXPORTS
 * ==============================
 *
 * Cart feature entry point following Feature-First v3.0.0 architecture.
 * Independent, reusable cart functionality for e-commerce.
 *
 * @version 2.0.0 - Cart Feature (Cleaned & Optimized)
 */

// 📋 Types
export * from "./types";

// 🎬 Server Layer (Actions, Services, Queries)
export * from "./server";

// 🎨 UI Components Layer
export * from "./ui/components";

// 🌍 Context Layer (Primary state management)
export * from "./context";

// 🔗 Compatibility alias: useCart → useCartContext
export { useCartContext as useCart } from "./context";

// 🛠️ Utilities Layer
export * from "./utils";

// 🎯 Quick Access Exports (commonly used items)
export type {
  CartWithItems,
  CartItem,
  CartItemWithProduct,
  CartSummary,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  CartValidationResult,
  CartState,
  CartContextValue,
} from "./types";

// 🚀 Main Actions (most commonly used)
export {
  getCartAction,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
} from "./server";

// 🌍 Context (primary state management)
export { CartProvider, useCartContext } from "./context";

// 🎨 Main Components (commonly used)
export { CartTab, CartBadge, CartEmpty, CartDebugPanel } from "./ui/components";

export default {};
