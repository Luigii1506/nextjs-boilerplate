/**
 * 🛒 CART SERVICE
 * ===============
 *
 * Domain Service Layer - Business Logic for Cart operations
 * Clean Architecture: Domain Layer (Business Logic)
 * Following Feature-First v3.0.0 patterns
 *
 * @version 1.0.0 - Cart Feature
 */

import { getServerSession, type Session } from "@/core/auth/server";

import {
  validateCartAccess,
  validateCartItemInput,
  validateCartOwnership,
} from "./validators";

import {
  getCartQuery,
  addToCartQuery,
  updateCartItemQuery,
  removeFromCartQuery,
  clearCartQuery,
  cleanupExpiredCartsQuery,
} from "./queries";

import {
  mapRawCartToCartWithItems,
  generateCartSummary,
  cartToApiResponse,
} from "./mappers";

import type {
  CartWithItems,
  CartSummary,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  CartValidationResult,
} from "../types";

import type { ApiResponse } from "../types/api";

// 🛒 CART BUSINESS SERVICES
// =========================

/**
 * Get customer cart with all items and products
 */
export async function getCartService(options: {
  userId?: string;
  sessionId?: string;
  session?: Session;
}): Promise<CartWithItems | null> {
  const { userId, sessionId, session } = options;

  console.log("🏢 [CART SERVICE] Getting cart:", {
    userId,
    sessionId,
    hasSession: !!session,
  });

  try {
    // Validate access permissions
    if (session && userId) {
      await validateCartAccess(session, userId);
    }

    // Get raw cart data from database
    const rawCart = await getCartQuery({
      userId,
      sessionId,
      includeInactive: false, // Don't include inactive products
    });

    if (!rawCart) {
      console.log("🏢 [CART SERVICE] No cart found");
      return null;
    }

    // Transform to business model
    const cart = mapRawCartToCartWithItems(rawCart);

    // Validate cart items are still valid
    await validateCartItems(cart);

    console.log("✅ [CART SERVICE] Cart retrieved successfully:", {
      cartId: cart.id,
      itemsCount: cart.items.length,
      total: cart.total,
    });

    return cart;
  } catch (error) {
    console.error("❌ [CART SERVICE] Error getting cart:", error);
    throw error;
  }
}

/**
 * Add item to cart with business logic validation
 */
export async function addToCartService(
  input: AddToCartInput,
  session?: Session
): Promise<
  ApiResponse<{
    cart: CartWithItems;
    addedItem: any;
    summary: CartSummary;
    isNewCart: boolean;
  }>
> {
  console.log("🏢 [CART SERVICE] Adding to cart:", input);

  try {
    // Validate input
    const validationResult = validateCartItemInput(input);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validationResult.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    // Validate access permissions
    if (session && input.userId) {
      await validateCartAccess(session, input.userId);
    }

    // Execute database operation
    const result = await addToCartQuery(input);

    // Transform to business models
    const cart = mapRawCartToCartWithItems(result.cart);
    const summary = generateCartSummary(cart);

    // Find the added/updated item
    const addedItem = cart.items.find(
      (item) => item.id === result.addedItem.id
    );

    console.log("✅ [CART SERVICE] Item added to cart successfully:", {
      cartId: cart.id,
      itemId: addedItem?.id,
      productName: addedItem?.product.name,
      quantity: addedItem?.quantity,
      isNewCart: result.isNewCart,
    });

    return {
      success: true,
      data: {
        cart,
        addedItem,
        summary,
        isNewCart: result.isNewCart,
      },
      message: result.isNewCart
        ? "Cart created and item added successfully"
        : "Item added to cart successfully",
    };
  } catch (error) {
    console.error("❌ [CART SERVICE] Error adding to cart:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to add item to cart",
    };
  }
}

/**
 * Update cart item quantity with validation
 */
export async function updateCartItemService(
  input: UpdateCartItemInput,
  session?: Session
): Promise<
  ApiResponse<{
    cart: CartWithItems;
    updatedItem: any;
    summary: CartSummary;
  }>
> {
  console.log("🏢 [CART SERVICE] Updating cart item:", input);

  try {
    // Validate input
    if (input.quantity < 0) {
      return {
        success: false,
        message: "Quantity cannot be negative",
      };
    }

    if (input.quantity === 0) {
      // If quantity is 0, remove the item instead
      return await removeFromCartService(
        {
          cartItemId: input.cartItemId,
          userId: input.userId,
          sessionId: input.sessionId,
        },
        session
      );
    }

    // Validate access permissions
    if (session && input.userId) {
      await validateCartAccess(session, input.userId);
    }

    // Execute database operation
    const result = await updateCartItemQuery(input);

    // Transform to business models
    const cart = mapRawCartToCartWithItems(result.cart);
    const summary = generateCartSummary(cart);

    // Find the updated item
    const updatedItem = cart.items.find(
      (item) => item.id === result.updatedItem.id
    );

    console.log("✅ [CART SERVICE] Cart item updated successfully:", {
      cartId: cart.id,
      itemId: updatedItem?.id,
      productName: updatedItem?.product.name,
      newQuantity: updatedItem?.quantity,
    });

    return {
      success: true,
      data: {
        cart,
        updatedItem,
        summary,
      },
      message: "Cart item updated successfully",
    };
  } catch (error) {
    console.error("❌ [CART SERVICE] Error updating cart item:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update cart item",
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCartService(
  input: RemoveFromCartInput,
  session?: Session
): Promise<
  ApiResponse<{
    cart: CartWithItems;
    removedItemId: string;
    summary: CartSummary;
  }>
> {
  console.log("🏢 [CART SERVICE] Removing from cart:", input);

  try {
    // Validate access permissions
    if (session && input.userId) {
      await validateCartAccess(session, input.userId);
    }

    // Execute database operation
    const result = await removeFromCartQuery(input);

    // Transform to business models
    const cart = mapRawCartToCartWithItems(result.cart);
    const summary = generateCartSummary(cart);

    console.log("✅ [CART SERVICE] Item removed from cart successfully:", {
      cartId: cart.id,
      removedItemId: result.removedItemId,
      remainingItems: cart.items.length,
    });

    return {
      success: true,
      data: {
        cart,
        removedItemId: result.removedItemId,
        summary,
      },
      message: "Item removed from cart successfully",
    };
  } catch (error) {
    console.error("❌ [CART SERVICE] Error removing from cart:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove item from cart",
    };
  }
}

/**
 * Clear entire cart
 */
export async function clearCartService(options: {
  userId?: string;
  sessionId?: string;
  session?: Session;
}): Promise<
  ApiResponse<{
    cart: CartWithItems;
    removedCount: number;
  }>
> {
  const { userId, sessionId, session } = options;

  console.log("🏢 [CART SERVICE] Clearing cart:", { userId, sessionId });

  try {
    // Validate access permissions
    if (session && userId) {
      await validateCartAccess(session, userId);
    }

    // Execute database operation
    const result = await clearCartQuery({ userId, sessionId });

    // Transform to business models
    const cart = mapRawCartToCartWithItems(result.cart);

    console.log("✅ [CART SERVICE] Cart cleared successfully:", {
      cartId: cart.id,
      removedCount: result.removedCount,
    });

    return {
      success: true,
      data: {
        cart,
        removedCount: result.removedCount,
      },
      message: `Cart cleared successfully. Removed ${result.removedCount} items.`,
    };
  } catch (error) {
    console.error("❌ [CART SERVICE] Error clearing cart:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to clear cart",
    };
  }
}

/**
 * Validate cart items are still available and in stock
 */
export async function validateCartService(options: {
  userId?: string;
  sessionId?: string;
  session?: Session;
}): Promise<ApiResponse<CartValidationResult>> {
  const { userId, sessionId, session } = options;

  console.log("🏢 [CART SERVICE] Validating cart:", { userId, sessionId });

  try {
    // Validate access permissions
    if (session && userId) {
      await validateCartAccess(session, userId);
    }

    // Get current cart
    const cart = await getCartService({ userId, sessionId, session });

    if (!cart) {
      return {
        success: true,
        data: {
          isValid: true,
          errors: [],
          warnings: [],
        },
        message: "No cart to validate",
      };
    }

    // Perform validation
    const validationResult = await validateCartItems(cart);

    console.log("✅ [CART SERVICE] Cart validation completed:", {
      cartId: cart.id,
      isValid: validationResult.isValid,
      errorsCount: validationResult.errors.length,
      warningsCount: validationResult.warnings.length,
    });

    return {
      success: true,
      data: validationResult,
      message: validationResult.isValid
        ? "Cart is valid"
        : "Cart has validation issues",
    };
  } catch (error) {
    console.error("❌ [CART SERVICE] Error validating cart:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to validate cart",
    };
  }
}

/**
 * Sync guest cart to user cart (on login)
 */
export async function syncGuestCartToUserService(options: {
  guestSessionId: string;
  userId: string;
  session: Session;
  mergeStrategy?: "replace" | "merge" | "keep_latest";
}): Promise<
  ApiResponse<{
    cart: CartWithItems;
    mergedItems: number;
    replacedItems: number;
  }>
> {
  const { guestSessionId, userId, session, mergeStrategy = "merge" } = options;

  console.log("🏢 [CART SERVICE] Syncing guest cart to user:", {
    guestSessionId,
    userId,
    mergeStrategy,
  });

  try {
    // Validate access permissions
    await validateCartAccess(session, userId);

    // Get guest cart
    const guestCart = await getCartService({ sessionId: guestSessionId });
    if (!guestCart || guestCart.items.length === 0) {
      // No guest cart to sync, just return user's existing cart
      const userCart = await getCartService({ userId, session });
      return {
        success: true,
        data: {
          cart: userCart || {
            id: "",
            userId,
            sessionId: null,
            items: [],
            subtotal: 0,
            taxAmount: 0,
            total: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
          mergedItems: 0,
          replacedItems: 0,
        },
        message: "No guest cart to sync",
      };
    }

    // Get user's existing cart
    const userCart = await getCartService({ userId, session });

    let mergedItems = 0;
    let replacedItems = 0;

    // Add each item from guest cart to user cart
    for (const guestItem of guestCart.items) {
      try {
        if (mergeStrategy === "replace" && userCart) {
          // Clear user cart first if replace strategy
          await clearCartService({ userId, session });
          replacedItems = userCart.items.length;
        }

        const result = await addToCartService(
          {
            productId: guestItem.productId,
            quantity: guestItem.quantity,
            userId,
          },
          session
        );

        if (result.success) {
          mergedItems++;
        }
      } catch (error) {
        console.warn("⚠️ [CART SERVICE] Failed to sync item:", {
          productId: guestItem.productId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Clear guest cart after successful sync
    await clearCartQuery({ sessionId: guestSessionId });

    // Get final user cart
    const finalCart = await getCartService({ userId, session });

    console.log("✅ [CART SERVICE] Guest cart synced successfully:", {
      userId,
      mergedItems,
      replacedItems,
      finalItemsCount: finalCart?.items.length || 0,
    });

    return {
      success: true,
      data: {
        cart: finalCart || {
          id: "",
          userId,
          sessionId: null,
          items: [],
          subtotal: 0,
          taxAmount: 0,
          total: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        mergedItems,
        replacedItems,
      },
      message: `Cart synced successfully. Merged ${mergedItems} items.`,
    };
  } catch (error) {
    console.error("❌ [CART SERVICE] Error syncing guest cart:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to sync guest cart",
    };
  }
}

// 🛠️ UTILITY FUNCTIONS
// ====================

/**
 * Validate cart items are still available and in stock
 */
async function validateCartItems(
  cart: CartWithItems
): Promise<CartValidationResult> {
  const errors: CartValidationResult["errors"] = [];
  const warnings: CartValidationResult["warnings"] = [];

  for (const item of cart.items) {
    const product = item.product;

    // Check if product still exists and is active
    if (!product.isActive) {
      errors.push({
        type: "PRODUCT_NOT_FOUND",
        productId: product.id,
        cartItemId: item.id,
        message: `Product "${product.name}" is no longer available`,
        suggestedAction: "Remove from cart",
      });
      continue;
    }

    // Check stock availability
    if (product.stock < item.quantity) {
      if (product.stock === 0) {
        errors.push({
          type: "OUT_OF_STOCK",
          productId: product.id,
          cartItemId: item.id,
          message: `Product "${product.name}" is out of stock`,
          suggestedAction: "Remove from cart or check back later",
        });
      } else {
        errors.push({
          type: "INVALID_QUANTITY",
          productId: product.id,
          cartItemId: item.id,
          message: `Only ${product.stock} units of "${product.name}" available, but ${item.quantity} requested`,
          suggestedAction: `Reduce quantity to ${product.stock}`,
        });
      }
    } else if (product.stock <= 5 && product.stock > 0) {
      // Low stock warning
      warnings.push({
        type: "LOW_STOCK",
        productId: product.id,
        cartItemId: item.id,
        message: `Only ${product.stock} units of "${product.name}" remaining`,
      });
    }

    // Check if price has changed significantly (more than 10%)
    const currentPrice = Number(product.price);
    const cartPrice = item.unitPrice;
    const priceDifference = Math.abs(currentPrice - cartPrice) / cartPrice;

    if (priceDifference > 0.1) {
      // 10% difference
      warnings.push({
        type: "PRICE_CHANGED",
        productId: product.id,
        cartItemId: item.id,
        message: `Price of "${product.name}" has changed`,
        oldValue: cartPrice,
        newValue: currentPrice,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Cleanup service for expired carts
 */
export async function cleanupExpiredCartsService(): Promise<{
  success: boolean;
  removedCount: number;
  message: string;
}> {
  console.log("🏢 [CART SERVICE] Starting expired carts cleanup...");

  try {
    const removedCount = await cleanupExpiredCartsQuery();

    console.log("✅ [CART SERVICE] Expired carts cleanup completed:", {
      removedCount,
    });

    return {
      success: true,
      removedCount,
      message: `Cleanup completed. Removed ${removedCount} expired carts.`,
    };
  } catch (error) {
    console.error("❌ [CART SERVICE] Error cleaning up expired carts:", error);
    return {
      success: false,
      removedCount: 0,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cleanup expired carts",
    };
  }
}

export default {};


