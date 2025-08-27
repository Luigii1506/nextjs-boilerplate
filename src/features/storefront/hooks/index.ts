/**
 * 🛒 STOREFRONT HOOKS - BARREL EXPORTS
 * ====================================
 *
 * Exportaciones centralizadas para todos los hooks del módulo storefront
 *
 * Created: 2025-01-17 - Storefront Hooks Module
 */

// 🔄 Data Query hooks
export { useStorefrontQuery } from "./useStorefrontQuery";

// 💖 Wishlist hooks - ✅ IMPLEMENTED
export { useWishlistActions } from "./useWishlistActions";

// TODO: Create these additional hooks
// export { useProductsQuery } from "./useProductsQuery";
// export { useCategoriesQuery } from "./useCategoriesQuery";

// 🛒 Shopping hooks (TODO: Create these hooks)
// export { useCart } from "./useCart";
// export { useCustomerActions } from "./useCustomerActions";

// 🎯 UI Interaction hooks (TODO: Create these hooks)
// export { useProductSearch } from "./useProductSearch";
// export { useScrollHeader } from "./useScrollHeader";

// 📝 Form and Mutation hooks (TODO: Create these hooks)
// export { useCustomerRegistration } from "./useCustomerRegistration";
// export { useCustomerLogin } from "./useCustomerLogin";

// 🗂️ Query keys for external invalidation
export { STOREFRONT_QUERY_KEYS } from "./useStorefrontQuery";
