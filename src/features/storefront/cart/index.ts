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

// 🧠 Zustand Store (primary state management)
export {
  useCartStore,
  useCart,
  useCartActions,
  useCartItems,
  useCartSummary,
  useCartMetadata,
  useCartStatus,
  useCartInitializer,
} from "./state/cart.store";

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
} from "./types";

// 🚀 Main Actions (most commonly used)
export {
  getCartAction,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
} from "./server";

// 🎨 UI Components are now in @/features/storefront/ui/features/cart
// Import from: import { CartTab, CartBadge, CartDebugPanel } from "@/features/storefront/ui/features/cart"

export default {};
