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

// 🎨 UI COMPONENTS
export * from "./ui/components/checkout/CheckoutTab";

// 🎯 QUICK IMPORTS (Aliases for common usage)
export {
  CheckoutProvider,
  useCheckoutContext,
} from "./context/CheckoutContext";

export { CheckoutTab } from "./ui/components/checkout/CheckoutTab";
