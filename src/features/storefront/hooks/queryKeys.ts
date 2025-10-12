/**
 * 🔑 STOREFRONT QUERY KEYS FACTORY
 * =================================
 *
 * Query key factory para TanStack Query.
 * Provee keys type-safe para todas las queries de storefront.
 *
 * Pattern: Hierarchical keys para invalidación selectiva.
 *
 * @version 3.0.0 - TanStack Query Migration
 */

export const storefrontKeys = {
  // 🎯 Base key - invalida TODO el storefront
  all: ['storefront'] as const,

  // 📦 Products
  products: () => [...storefrontKeys.all, 'products'] as const,
  product: (id: string) => [...storefrontKeys.products(), id] as const,
  productsByCategory: (categoryId: string) =>
    [...storefrontKeys.products(), 'category', categoryId] as const,

  // 🏷️ Categories
  categories: () => [...storefrontKeys.all, 'categories'] as const,
  category: (id: string) => [...storefrontKeys.categories(), id] as const,

  // 💖 Wishlist (por usuario)
  wishlists: () => [...storefrontKeys.all, 'wishlists'] as const,
  wishlist: (userId?: string) =>
    [...storefrontKeys.wishlists(), userId || 'anonymous'] as const,

  // ⭐ Featured
  featured: () => [...storefrontKeys.all, 'featured'] as const,
  featuredProducts: () => [...storefrontKeys.featured(), 'products'] as const,
  featuredCategories: () => [...storefrontKeys.featured(), 'categories'] as const,

  // 📊 Stats & Overview
  stats: () => [...storefrontKeys.all, 'stats'] as const,
} as const;

/**
 * 🛒 CART QUERY KEYS - DEPRECATED
 * ================================
 * Cart now uses UltraFast Context instead of TanStack Query
 * These keys are no longer used
 */
// export const cartKeys = {
//   all: ['cart'] as const,
//   detail: (userId?: string, sessionId?: string) =>
//     [...cartKeys.all, { userId, sessionId }] as const,
//   summary: (userId?: string, sessionId?: string) =>
//     [...cartKeys.all, 'summary', { userId, sessionId }] as const,
// } as const;

/**
 * 📋 EJEMPLOS DE USO:
 * ==================
 *
 * // Invalidar TODO el storefront
 * queryClient.invalidateQueries({ queryKey: storefrontKeys.all });
 *
 * // Invalidar solo productos
 * queryClient.invalidateQueries({ queryKey: storefrontKeys.products() });
 *
 * // Invalidar wishlist de un usuario específico
 * queryClient.invalidateQueries({ queryKey: storefrontKeys.wishlist('user123') });
 *
 * // Invalidar productos de una categoría
 * queryClient.invalidateQueries({ queryKey: storefrontKeys.productsByCategory('cat456') });
 */
