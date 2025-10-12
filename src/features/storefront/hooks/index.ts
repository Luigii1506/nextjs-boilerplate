/**
 * 🎣 STOREFRONT HOOKS - EXPORTS
 * =============================
 *
 * Clean exports para todos los hooks de TanStack Query.
 *
 * @version 3.0.0 - TanStack Query Migration
 */

// 🔑 Query Keys
export { storefrontKeys } from "./queryKeys";

// 📊 Data Hooks
export {
  useStorefrontData,
  useStorefrontProducts,
  useStorefrontCategories,
  useFeaturedContent,
} from "./useStorefrontData";

// 💖 Wishlist Hooks
export { useWishlist, useWishlistToggle } from "./useWishlist";

// 🛒 Cart Hooks - REMOVED: Using UltraFast Cart Context instead
// export { useCart } from "./useCart";
