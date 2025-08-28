/**
 * 📦 STOREFRONT HOOKS MAIN INDEX
 * ==============================
 *
 * Centralized exports for ALL storefront hooks organized by feature.
 * Nueva estructura de "Fase Futura" - Organización por Feature.
 *
 * 📍 Estructura refactorizada: /hooks/[feature]/
 *
 * @version 3.0.0 - Feature-First Architecture
 */

// 📦 PRODUCTS HOOKS
export * from "./products";

// ❤️ WISHLIST HOOKS
export * from "./wishlist";

// 🏠 OVERVIEW HOOKS
export * from "./overview";

// 🔧 SHARED HOOKS
export * from "./shared";

// 🌐 EXISTING GLOBAL HOOKS (mantener compatibilidad)
export { useStorefrontQuery } from "./useStorefrontQuery";
export { useWishlistActions } from "./useWishlistActions";
