/**
 * 📦 WISHLIST HOOKS BARREL EXPORT
 * ===============================
 *
 * Centralized exports for all Wishlist-related hooks.
 *
 * 📍 Nueva ubicación: /hooks/wishlist/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

// 🔄 State Management
export {
  useWishlistState,
  type WishlistState,
  type WishlistAction,
} from "./useWishlistState";

// 🧠 Business Logic
export {
  useWishlistLogic,
  default as useWishlistFilters,
} from "./useWishlistLogic";

// ⚡ Actions
export { useWishlistActions } from "./useWishlistActions";


