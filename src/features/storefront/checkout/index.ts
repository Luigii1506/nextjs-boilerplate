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

// 🪝 HOOKS
export * from "./hooks/checkout/useCheckoutState";
export * from "./hooks/checkout/useCheckoutActions";

// 🌍 CONTEXT
export * from "./context/CheckoutContext";

// 🎯 QUICK IMPORTS (Aliases for common usage)
export {
  CheckoutProvider,
  useCheckoutContext,
} from "./context/CheckoutContext";

// 🎨 UI Components are now in @/features/storefront/ui/features/checkout
// Import from: import { CheckoutTab } from "@/features/storefront/ui/features/checkout"
