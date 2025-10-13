/**
 * 💳 CHECKOUT - BACKWARD COMPATIBILITY WRAPPER
 * ============================================
 *
 * ⚠️ DEPRECATED: This module has been moved to @/features/storefront/checkout
 *
 * This file provides backward compatibility for existing imports.
 * Please update your imports to use the new location:
 *
 * OLD: import { CheckoutProvider } from "@/features/checkout";
 * NEW: import { CheckoutProvider } from "@/features/storefront/checkout";
 *
 * This wrapper will be removed in a future version.
 *
 * @deprecated Use @/features/storefront/checkout instead
 */

// Re-export everything from the new location
export * from "../storefront/checkout";

// Log deprecation warning in development
if (process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️ DEPRECATED: Importing from @/features/checkout is deprecated. " +
    "Please update to @/features/storefront/checkout"
  );
}
