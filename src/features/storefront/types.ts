/**
 * 🛒 STOREFRONT TYPES
 * ===================
 *
 * Main entry point for all storefront types
 * Re-exports the organized type structure
 *
 * Updated: 2025-01-17 - Clean Architecture
 */

// 🔄 Re-export all types from organized structure
export * from "./types/index";

// 🚫 Legacy imports - removed ActionResult - now using our own version with message property
// TODO: Remove any remaining inventory dependencies after full migration
