/**
 * 🛒 STOREFRONT SERVICE
 * ====================
 *
 * Domain Service Layer - Business Logic para Customer-facing Storefront
 * Clean Architecture: Domain Layer (Thick Layer)
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

import {
  requireAuth,
  getServerSession,
  type Session,
} from "../../../core/auth/server";

import {
  validateStorefrontAccess,
  validateCustomerPermissions,
  sessionToPermissionUser,
  validateWishlistInput,
  validateCartInput,
} from "./validators";
import {
  getPublicProductsQuery,
  getFeaturedProductsQuery,
  getPublicCategoriesQuery,
  getFeaturedCategoriesQuery,
  getCartQuery,
  getWishlistQuery,
  getStorefrontStatsQuery,
  addWishlistItemQuery,
  removeWishlistItemQuery,
  checkWishlistItemExistsQuery,
  validateProductExistsQuery,
} from "./queries";
import {
  mapProductToCustomer,
  mapCategoryToCustomer,
  mapStatsToStorefront,
  mapWishlistToCustomer,
  mapCartToCustomer,
} from "./mappers";
import type {
  ProductForCustomer,
  CategoryForCustomer,
  ProductQueryOptions,
  CategoryQueryOptions,
  PaginatedResponse,
  StorefrontStats,
  WishlistItem,
  UseStorefrontQueryResult,
  ActionResult,
} from "../types";

// 🔍 PRODUCT SERVICES
// ===================

export async function getPublicProductsService(
  options: ProductQueryOptions = {},
  session?: Session | null
): Promise<PaginatedResponse<ProductForCustomer>> {
  try {
    // ✅ Public endpoint - no auth required
    validateStorefrontAccess(); // Basic rate limiting, feature flag check

    // 📊 Get raw products from database
    const rawProducts = await getPublicProductsQuery(options);

    // 🔄 Transform to customer-facing format
    const products = rawProducts.data.map((product) =>
      mapProductToCustomer(product, {
        includeWishlistStatus: !!session?.user?.id,
        userId: session?.user?.id,
      })
    );

    return {
      data: products,
      total: rawProducts.total,
      page: rawProducts.page,
      limit: rawProducts.limit,
      totalPages: rawProducts.totalPages,
      pagination: rawProducts.pagination,
    };
  } catch (error) {
    console.error("[StorefrontService] Error getting public products:", error);
    throw error;
  }
}

export async function getFeaturedProductsService(
  limit: number = 8,
  session?: Session | null
): Promise<ProductForCustomer[]> {
  try {
    validateStorefrontAccess();

    const rawProducts = await getFeaturedProductsQuery(limit);

    return rawProducts.map((product) =>
      mapProductToCustomer(product, {
        includeWishlistStatus: !!session?.user?.id,
        userId: session?.user?.id,
      })
    );
  } catch (error) {
    console.error(
      "[StorefrontService] Error getting featured products:",
      error
    );
    throw error;
  }
}

// 🏷️ CATEGORY SERVICES
// ====================

export async function getPublicCategoriesService(
  options: CategoryQueryOptions = {}
): Promise<PaginatedResponse<CategoryForCustomer>> {
  try {
    validateStorefrontAccess();

    const rawCategories = await getPublicCategoriesQuery(options);

    const categories = rawCategories.data.map(mapCategoryToCustomer);

    return {
      data: categories,
      total: rawCategories.total,
      page: rawCategories.page,
      limit: rawCategories.limit,
      totalPages: rawCategories.totalPages,
      pagination: rawCategories.pagination,
    };
  } catch (error) {
    console.error(
      "[StorefrontService] Error getting public categories:",
      error
    );
    throw error;
  }
}

export async function getFeaturedCategoriesService(
  limit: number = 6
): Promise<CategoryForCustomer[]> {
  try {
    validateStorefrontAccess();

    const rawCategories = await getFeaturedCategoriesQuery(limit);

    return rawCategories.map(mapCategoryToCustomer);
  } catch (error) {
    console.error(
      "[StorefrontService] Error getting featured categories:",
      error
    );
    throw error;
  }
}

// 📊 STATS SERVICES
// =================

export async function getStorefrontStatsService(): Promise<StorefrontStats> {
  try {
    validateStorefrontAccess();

    const rawStats = await getStorefrontStatsQuery();

    return mapStatsToStorefront(rawStats);
  } catch (error) {
    console.error("[StorefrontService] Error getting storefront stats:", error);
    throw error;
  }
}

// 💖 WISHLIST SERVICES
// ====================

export async function getCustomerWishlistService(
  userId: string,
  session: Session
): Promise<WishlistItem[]> {
  try {
    // 🔒 Authentication & Authorization
    const user = sessionToPermissionUser(session);
    validateCustomerPermissions(user, "READ_WISHLIST", { userId });

    const rawWishlist = await getWishlistQuery(userId);

    return mapWishlistToCustomer(rawWishlist);
  } catch (error) {
    console.error(
      "[StorefrontService] Error getting customer wishlist:",
      error
    );
    throw error;
  }
}

export async function addToWishlistService(
  userId: string,
  productId: string,
  session: Session
): Promise<ActionResult<WishlistItem>> {
  console.log("🔧 [SERVICE] addToWishlistService called", {
    userId,
    productId,
    hasSession: !!session,
  });

  try {
    console.log("🔐 [SERVICE] Validating permissions...");
    // 🔒 Authentication & Authorization
    const user = sessionToPermissionUser(session);
    validateCustomerPermissions(user, "WRITE_WISHLIST", { userId });
    console.log("✅ [SERVICE] Permissions OK");

    console.log("📋 [SERVICE] Validating input...");
    // 📋 Input Validation
    validateWishlistInput({ userId, productId });
    console.log("✅ [SERVICE] Input validation OK");

    console.log("🔍 [SERVICE] Checking if product exists...");
    // 🔍 Business Rules Validation
    await validateProductExistsQuery(productId);
    console.log("✅ [SERVICE] Product exists");

    console.log("🔍 [SERVICE] Checking if item already in wishlist...");
    const existingItem = await checkWishlistItemExistsQuery(userId, productId);
    console.log("📋 [SERVICE] Existing item check result:", {
      exists: !!existingItem,
      existingItemId: existingItem?.id,
    });
    if (existingItem) {
      console.log(
        "⚠️ [SERVICE] Item already exists in wishlist, returning existing"
      );
      return {
        success: true,
        message: "Product already in wishlist",
        data: mapWishlistToCustomer([existingItem])[0],
      };
    }

    console.log("➕ [SERVICE] Creating new wishlist item...");
    // 💾 Create wishlist item
    const rawWishlistItem = await addWishlistItemQuery(userId, productId);
    console.log("✅ [SERVICE] Wishlist item created:", {
      id: rawWishlistItem.id,
      userId: rawWishlistItem.userId,
      productId: rawWishlistItem.productId,
    });
    const wishlistItem = mapWishlistToCustomer([rawWishlistItem])[0];

    // 📝 Audit Log
    console.log(
      `[StorefrontService] Added to wishlist: ${productId} for user ${userId}`
    );

    return {
      success: true,
      message: "Added to wishlist successfully",
      data: wishlistItem,
    };
  } catch (error) {
    console.error("[StorefrontService] Error adding to wishlist:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to add to wishlist",
    };
  }
}

export async function removeFromWishlistService(
  userId: string,
  productId: string,
  session: Session
): Promise<ActionResult> {
  try {
    // 🔒 Authentication & Authorization
    const user = sessionToPermissionUser(session);
    validateCustomerPermissions(user, "WRITE_WISHLIST", { userId });

    // 📋 Input Validation
    validateWishlistInput({ userId, productId });

    // 💾 Remove wishlist item
    await removeWishlistItemQuery(userId, productId);

    // 📝 Audit Log
    console.log(
      `[StorefrontService] Removed from wishlist: ${productId} for user ${userId}`
    );

    return {
      success: true,
      message: "Removed from wishlist successfully",
    };
  } catch (error) {
    console.error("[StorefrontService] Error removing from wishlist:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove from wishlist",
    };
  }
}

// 🛒 CART SERVICES (TODO: Implement when needed)
// ===============================================

export async function getCustomerCartService(
  userId: string,
  sessionId?: string
): Promise<any | null> {
  try {
    validateStorefrontAccess();

    const rawCart = await getCartQuery(userId, sessionId);

    return rawCart ? mapCartToCustomer(rawCart) : null;
  } catch (error) {
    console.error("[StorefrontService] Error getting customer cart:", error);
    return null;
  }
}

// 🔄 COMBINED DATA SERVICE
// ========================

export async function getStorefrontDataService(options: {
  productFilters?: ProductQueryOptions;
  categoryFilters?: CategoryQueryOptions;
  featuredProductsLimit?: number;
  featuredCategoriesLimit?: number;
  userId?: string;
  sessionId?: string;
}): Promise<Partial<UseStorefrontQueryResult>> {
  try {
    validateStorefrontAccess();

    // Get optional session for personalization
    const session = await getServerSession();

    // 🔄 Parallel data fetching for performance
    const [
      stats,
      featuredProducts,
      featuredCategories,
      allProducts,
      allCategories,
      cart,
      wishlist,
    ] = await Promise.all([
      getStorefrontStatsService(),
      getFeaturedProductsService(options.featuredProductsLimit, session),
      getFeaturedCategoriesService(options.featuredCategoriesLimit),
      getPublicProductsService(options.productFilters, session),
      getPublicCategoriesService(options.categoryFilters),
      options.userId
        ? getCustomerCartService(options.userId, options.sessionId)
        : Promise.resolve(null),
      options.userId && session
        ? getCustomerWishlistService(options.userId, session)
        : Promise.resolve([]),
    ]);

    return {
      stats,
      featuredProducts,
      featuredCategories,
      products: allProducts.data,
      categories: allCategories.data,
      cart,
      wishlist,
      // Customer stats computed from data
      customerStats: {
        wishlistCount: wishlist.length,
        cartItemsCount: cart?.items?.length || 0,
        ordersCount: 0, // TODO: Implement when orders module ready
        favoriteCategories: [],
        recentlyViewed: [],
        recommendations: featuredProducts.slice(0, 8),
      },
    };
  } catch (error) {
    console.error("[StorefrontService] Error getting storefront data:", error);
    throw error;
  }
}

// 👤 CUSTOMER MANAGEMENT SERVICES
// ================================
