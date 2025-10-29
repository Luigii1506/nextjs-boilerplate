/**
 * 📦 CHECKOUT MODULE - BARREL EXPORTS
 * ===================================
 *
 * Main entry point for the checkout feature module
 */

// 🎯 TYPES
export * from "./types";

// 🔧 CONSTANTS & SCHEMAS
export * from "./constants";
export * from "./schemas";

// 🏢 SERVER LAYER
export * from "./server";

// 🪝 STORE (Zustand)
export {
  useCheckoutStore,
  useCheckout,
  useCheckoutActions,
  useCheckoutState,
  useCheckoutInitializer,
} from "./state/checkout.store";

// 🎨 UI Components are now in @/features/storefront/ui/features/checkout
// Import from: import { CheckoutTab } from "@/features/storefront/ui/features/checkout"
