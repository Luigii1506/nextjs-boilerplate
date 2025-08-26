/**
 * 🛒 STOREFRONT SERVER ACTIONS
 * ============================
 *
 * Next.js 15 Server Actions para Customer-facing Storefront
 * Clean Architecture: Infrastructure Layer (Thin Actions)
 *
 * Pattern: Thin Actions, Thick Services
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import * as storefrontService from "./service";
import * as schemas from "../schemas";
import * as validators from "./validators";
import {
  storefrontLogger,
  generateRequestId,
  PerformanceTimer,
} from "../utils/logger";
import { STOREFRONT_CACHE_TAGS } from "../constants";

import type {
  ActionResult,
  ProductForCustomer,
  CategoryForCustomer,
  PaginatedResponse,
  StorefrontStats,
  UseStorefrontQueryResult,
  ProductQueryOptions,
  CategoryQueryOptions,
  WishlistItem,
} from "../types";

// 🔍 PRODUCT ACTIONS
// ==================

export async function getPublicProductsAction(
  options: Partial<ProductQueryOptions> = {}
): Promise<ActionResult<PaginatedResponse<ProductForCustomer>>> {
  const requestId = generateRequestId("getPublicProducts");

  try {
    storefrontLogger.logActionStart("getPublicProducts", requestId, options);

    // 🔍 Validate input
    const validatedOptions = validators.validateProductFilters(options);

    // 🔍 Validate pagination limits
    if (validatedOptions.page && validatedOptions.limit) {
      validators.validatePaginationLimits(
        validatedOptions.page,
        validatedOptions.limit
      );
    }

    // 🔍 Validate search term
    if (validatedOptions.query) {
      validators.validateSearchLength(validatedOptions.query);
      validatedOptions.query = validators.sanitizeSearchTerm(
        validatedOptions.query
      );
    }

    // 🛡️ Get optional session for personalization
    const session = await validators.getOptionalValidatedSession();

    // 🚀 Delegate to service layer
    const result = await storefrontService.getPublicProductsService(
      validatedOptions,
      session
    );

    storefrontLogger.logActionSuccess(
      "getPublicProducts",
      requestId,
      0,
      result
    );

    return {
      success: true,
      data: result,
      message: "Products retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError(
      "getPublicProducts",
      requestId,
      0,
      error as Error
    );

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get products",
    };
  }
}

export async function getFeaturedProductsAction(
  limit: number = 8
): Promise<ActionResult<ProductForCustomer[]>> {
  const requestId = generateRequestId("getFeaturedProducts");

  try {
    storefrontLogger.logActionStart("getFeaturedProducts", requestId, {
      limit,
    });

    // 🔍 Validate limit
    if (limit > 50) {
      throw new validators.StorefrontValidationError(
        "Limit cannot exceed 50 for featured products"
      );
    }

    // 🛡️ Get optional session for personalization
    const session = await validators.getOptionalValidatedSession();

    // 🚀 Delegate to service layer
    const result = await storefrontService.getFeaturedProductsService(
      limit,
      session
    );

    storefrontLogger.logActionSuccess(
      "getFeaturedProducts",
      requestId,
      0,
      result
    );

    return {
      success: true,
      data: result,
      message: "Featured products retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError(
      "getFeaturedProducts",
      requestId,
      0,
      error as Error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get featured products",
    };
  }
}

// 🏷️ CATEGORY ACTIONS
// ===================

export async function getPublicCategoriesAction(
  options: Partial<CategoryQueryOptions> = {}
): Promise<ActionResult<PaginatedResponse<CategoryForCustomer>>> {
  const requestId = generateRequestId("getPublicCategories");

  try {
    storefrontLogger.logActionStart("getPublicCategories", requestId, options);

    // 🔍 Validate input
    const validatedOptions = validators.validateCategoryFilters(options);

    // 🔍 Validate pagination limits
    if (validatedOptions.page && validatedOptions.limit) {
      validators.validatePaginationLimits(
        validatedOptions.page,
        validatedOptions.limit
      );
    }

    // 🚀 Delegate to service layer
    const result = await storefrontService.getPublicCategoriesService(
      validatedOptions
    );

    storefrontLogger.logActionSuccess(
      "getPublicCategories",
      requestId,
      0,
      result
    );

    return {
      success: true,
      data: result,
      message: "Categories retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError(
      "getPublicCategories",
      requestId,
      0,
      error as Error
    );

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get categories",
    };
  }
}

export async function getFeaturedCategoriesAction(
  limit: number = 6
): Promise<ActionResult<CategoryForCustomer[]>> {
  const requestId = generateRequestId("getFeaturedCategories");

  try {
    storefrontLogger.logActionStart("getFeaturedCategories", requestId, {
      limit,
    });

    // 🔍 Validate limit
    if (limit > 20) {
      throw new validators.StorefrontValidationError(
        "Limit cannot exceed 20 for featured categories"
      );
    }

    // 🚀 Delegate to service layer
    const result = await storefrontService.getFeaturedCategoriesService(limit);

    storefrontLogger.logActionSuccess(
      "getFeaturedCategories",
      requestId,
      0,
      result
    );

    return {
      success: true,
      data: result,
      message: "Featured categories retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError(
      "getFeaturedCategories",
      requestId,
      0,
      error as Error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get featured categories",
    };
  }
}

// 📊 STATS ACTIONS
// ================

export async function getStorefrontStatsAction(): Promise<
  ActionResult<StorefrontStats>
> {
  const requestId = generateRequestId("getStorefrontStats");

  try {
    storefrontLogger.logActionStart("getStorefrontStats", requestId, {});

    // 🚀 Delegate to service layer
    const result = await storefrontService.getStorefrontStatsService();

    storefrontLogger.logActionSuccess(
      "getStorefrontStats",
      requestId,
      0,
      result
    );

    return {
      success: true,
      data: result,
      message: "Storefront stats retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError(
      "getStorefrontStats",
      requestId,
      0,
      error as Error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get storefront stats",
    };
  }
}

// 💖 WISHLIST ACTIONS
// ===================

export async function getWishlistAction(
  userId: string
): Promise<ActionResult<WishlistItem[]>> {
  const requestId = generateRequestId("getWishlist");

  try {
    storefrontLogger.logActionStart("getWishlist", requestId, { userId });

    // 🛡️ Session validation and authorization
    const session = await validators.getValidatedSession();
    const user = validators.sessionToPermissionUser(session);
    validators.validateCustomerPermissions(user, "READ_WISHLIST", {
      userId,
    });

    // 🚀 Delegate to service layer
    const result = await storefrontService.getCustomerWishlistService(
      userId,
      session
    );

    // 📊 Analytics logging
    storefrontLogger.logWishlistAction("view", userId, undefined, {
      itemCount: result.length,
    });

    storefrontLogger.logActionSuccess("getWishlist", requestId, 0, result);

    return {
      success: true,
      data: result,
      message: "Wishlist retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError(
      "getWishlist",
      requestId,
      0,
      error as Error
    );

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get wishlist",
    };
  }
}

export async function addToWishlistAction(
  userId: string,
  productId: string
): Promise<ActionResult<WishlistItem>> {
  const requestId = generateRequestId("addToWishlist");

  console.log("🚀 [ACTIONS] addToWishlistAction called", {
    userId,
    productId,
    requestId,
  });

  try {
    storefrontLogger.logActionStart("addToWishlist", requestId, {
      userId,
      productId,
    });

    console.log("🔐 [ACTIONS] Validating session...");
    // 🛡️ Session validation and authorization
    const session = await validators.getValidatedSession();
    console.log("✅ [ACTIONS] Session validated:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    const user = validators.sessionToPermissionUser(session);
    console.log("🔐 [ACTIONS] Validating permissions...");
    validators.validateCustomerPermissions(user, "WRITE_WISHLIST", {
      userId,
    });
    console.log("✅ [ACTIONS] Permissions validated");

    console.log("📞 [ACTIONS] Calling service layer...");
    // 🚀 Delegate to service layer
    const result = await storefrontService.addToWishlistService(
      userId,
      productId,
      session
    );

    console.log("📤 [ACTIONS] Service result:", result);

    if (result.success && result.data) {
      // 📊 Analytics logging
      storefrontLogger.logWishlistAction("add", userId, productId, {
        success: true,
      });

      // 🔄 Cache invalidation for UI updates
      revalidateTag(STOREFRONT_CACHE_TAGS.WISHLIST);
      revalidateTag(`${STOREFRONT_CACHE_TAGS.CUSTOMER_DATA}-${userId}`);
    }

    storefrontLogger.logActionSuccess("addToWishlist", requestId, 0, result);

    return result;
  } catch (error) {
    storefrontLogger.logActionError(
      "addToWishlist",
      requestId,
      0,
      error as Error
    );

    // 📊 Analytics logging for failures
    storefrontLogger.logWishlistAction("add", userId, productId, {
      success: false,
      error: (error as Error).message,
    });

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to add to wishlist",
    };
  }
}

export async function removeFromWishlistAction(
  userId: string,
  productId: string
): Promise<ActionResult> {
  const requestId = generateRequestId("removeFromWishlist");

  try {
    storefrontLogger.logActionStart("removeFromWishlist", requestId, {
      userId,
      productId,
    });

    // 🛡️ Session validation and authorization
    const session = await validators.getValidatedSession();
    const user = validators.sessionToPermissionUser(session);
    validators.validateCustomerPermissions(user, "WRITE_WISHLIST", {
      userId,
    });

    // 🚀 Delegate to service layer
    const result = await storefrontService.removeFromWishlistService(
      userId,
      productId,
      session
    );

    if (result.success) {
      // 📊 Analytics logging
      storefrontLogger.logWishlistAction("remove", userId, productId, {
        success: true,
      });

      // 🔄 Cache invalidation for UI updates
      revalidateTag(STOREFRONT_CACHE_TAGS.WISHLIST);
      revalidateTag(`${STOREFRONT_CACHE_TAGS.CUSTOMER_DATA}-${userId}`);
    }

    storefrontLogger.logActionSuccess(
      "removeFromWishlist",
      requestId,
      0,
      result
    );

    return result;
  } catch (error) {
    storefrontLogger.logActionError(
      "removeFromWishlist",
      requestId,
      0,
      error as Error
    );

    // 📊 Analytics logging for failures
    storefrontLogger.logWishlistAction("remove", userId, productId, {
      success: false,
      error: (error as Error).message,
    });

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove from wishlist",
    };
  }
}

// 🛒 CART ACTIONS (TODO: Implement when cart service is ready)
// ============================================================

export async function getCartAction(
  userId?: string,
  sessionId?: string
): Promise<ActionResult<any>> {
  const requestId = generateRequestId("getCart");

  try {
    storefrontLogger.logActionStart("getCart", requestId, {
      userId,
      sessionId,
    });

    // 🚀 Delegate to service layer
    const result = await storefrontService.getCustomerCartService(
      userId || "",
      sessionId
    );

    storefrontLogger.logActionSuccess("getCart", requestId, 0, result);

    return {
      success: true,
      data: result,
      message: "Cart retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError("getCart", requestId, 0, error as Error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get cart",
    };
  }
}

// 🔄 COMBINED DATA ACTION
// =======================

export async function getStorefrontDataAction(
  options: {
    featuredProductsLimit?: number;
    featuredCategoriesLimit?: number;
    productFilters?: ProductQueryOptions;
    categoryFilters?: CategoryQueryOptions;
    userId?: string;
    sessionId?: string;
  } = {}
): Promise<ActionResult<Partial<UseStorefrontQueryResult>>> {
  const requestId = generateRequestId("getStorefrontData");

  try {
    storefrontLogger.logActionStart("getStorefrontData", requestId, options);

    // 🔍 Validate limits
    if (options.featuredProductsLimit && options.featuredProductsLimit > 50) {
      throw new validators.StorefrontValidationError(
        "Featured products limit cannot exceed 50"
      );
    }

    if (
      options.featuredCategoriesLimit &&
      options.featuredCategoriesLimit > 20
    ) {
      throw new validators.StorefrontValidationError(
        "Featured categories limit cannot exceed 20"
      );
    }

    // 🚀 Delegate to service layer
    const result = await storefrontService.getStorefrontDataService(options);

    // 📊 Performance logging
    storefrontLogger.logPerformanceMetric("storefront-data-load", 0, {
      productsCount: result.products?.length || 0,
      categoriesCount: result.categories?.length || 0,
      featuredProductsCount: result.featuredProducts?.length || 0,
      wishlistCount: result.wishlist?.length || 0,
    });

    storefrontLogger.logActionSuccess(
      "getStorefrontData",
      requestId,
      0,
      result
    );

    return {
      success: true,
      data: result,
      message: "Storefront data retrieved successfully",
    };
  } catch (error) {
    storefrontLogger.logActionError(
      "getStorefrontData",
      requestId,
      0,
      error as Error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get storefront data",
    };
  }
}
