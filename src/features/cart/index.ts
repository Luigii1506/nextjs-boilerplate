/**
 * 🛒 CART - BACKWARD COMPATIBILITY WRAPPER
 * =========================================
 *
 * ⚠️ DEPRECATED: This module has been moved to @/features/storefront/cart
 *
 * This file provides backward compatibility for existing imports.
 * Please update your imports to use the new location:
 *
 * OLD: import { useCart } from "@/features/cart";
 * NEW: import { useCart } from "@/features/storefront/cart";
 *
 * This wrapper will be removed in a future version.
 *
 * @deprecated Use @/features/storefront/cart instead
 */

// Re-export everything from the new location
export * from "../storefront/cart";

// Log deprecation warning in development
if (process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️ DEPRECATED: Importing from @/features/cart is deprecated. " +
    "Please update to @/features/storefront/cart"
  );
}
