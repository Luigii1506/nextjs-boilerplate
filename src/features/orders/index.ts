/**
 * 📦 ORDERS - BACKWARD COMPATIBILITY WRAPPER
 * ==========================================
 *
 * ⚠️ DEPRECATED: This module has been moved to @/features/storefront/orders
 *
 * This file provides backward compatibility for existing imports.
 * Please update your imports to use the new location:
 *
 * OLD: import { useOrders } from "@/features/orders";
 * NEW: import { useOrders } from "@/features/storefront/orders";
 *
 * This wrapper will be removed in a future version.
 *
 * @deprecated Use @/features/storefront/orders instead
 */

// Re-export everything from the new location
export * from "../storefront/orders";

// Log deprecation warning in development
if (process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️ DEPRECATED: Importing from @/features/orders is deprecated. " +
    "Please update to @/features/storefront/orders"
  );
}
