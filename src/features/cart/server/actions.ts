/**
 * 🛒 CART SERVER ACTIONS
 * ======================
 *
 * Next.js 15 Server Actions for Cart operations
 * Clean Architecture: Infrastructure Layer (Thin Actions)
 * Following Feature-First v3.0.0 patterns
 *
 * Pattern: Thin Actions, Thick Services
 *
 * @version 1.0.0 - Cart Feature
 */

"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { getServerSession } from "@/core/auth/server";
import * as cartService from "./service";
import * as validators from "./validators";

import type {
  CartWithItems,
  CartSummary,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  CartValidationResult,
} from "../types";

import type { ApiResponse } from "../types/api";

// 🔍 CART ACTIONS
// ===============

/**
 * Get customer cart with all items
 */
export async function getCartAction(options: {
  userId?: string;
  sessionId?: string;
}): Promise<ApiResponse<CartWithItems>> {
  const requestId = `getCart-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Getting cart:", { requestId, ...options });

    const session = await getServerSession();

    // Get cart from service layer
    const cart = await cartService.getCartService({
      ...options,
      session,
    });

    console.log("✅ [CART ACTION] Cart retrieved:", {
      requestId,
      hasCart: !!cart,
      itemsCount: cart?.items.length || 0,
    });

    return {
      success: true,
      data: cart || {
        id: "",
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        items: [],
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      message: cart ? "Cart retrieved successfully" : "No cart found",
    };
  } catch (error) {
    console.error("❌ [CART ACTION] Error getting cart:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get cart",
    };
  }
}

/**
 * Add item to cart
 */
export async function addToCartAction(input: AddToCartInput): Promise<
  ApiResponse<{
    cart: CartWithItems;
    addedItem: any;
    summary: CartSummary;
    isNewCart: boolean;
  }>
> {
  const requestId = `addToCart-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Adding to cart:", {
      requestId,
      productId: input.productId,
      quantity: input.quantity,
      hasUserId: !!input.userId,
      hasSessionId: !!input.sessionId,
    });

    // Validate input
    const validationResult = validators.validateCartItemInput(input);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validationResult.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    const session = await getServerSession();

    // Add to cart via service layer
    const result = await cartService.addToCartService(input, session);

    // Revalidate cache if successful
    if (result.success) {
      revalidateTag("cart");
      if (input.userId) {
        revalidateTag(`cart-user-${input.userId}`);
      }
      if (input.sessionId) {
        revalidateTag(`cart-session-${input.sessionId}`);
      }
    }

    console.log("✅ [CART ACTION] Add to cart result:", {
      requestId,
      success: result.success,
      isNewCart: result.data?.isNewCart,
      itemsCount: result.data?.cart.items.length,
    });

    return result;
  } catch (error) {
    console.error("❌ [CART ACTION] Error adding to cart:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to add item to cart",
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemAction(input: UpdateCartItemInput): Promise<
  ApiResponse<{
    cart: CartWithItems;
    updatedItem: any;
    summary: CartSummary;
  }>
> {
  const requestId = `updateCartItem-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Updating cart item:", {
      requestId,
      cartItemId: input.cartItemId,
      quantity: input.quantity,
      hasUserId: !!input.userId,
      hasSessionId: !!input.sessionId,
    });

    // Validate input
    const validationResult = validators.validateUpdateCartItemInput(input);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validationResult.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    const session = await getServerSession();

    // Update cart item via service layer
    const result = await cartService.updateCartItemService(input, session);

    // Revalidate cache if successful
    if (result.success) {
      revalidateTag("cart");
      if (input.userId) {
        revalidateTag(`cart-user-${input.userId}`);
      }
      if (input.sessionId) {
        revalidateTag(`cart-session-${input.sessionId}`);
      }
    }

    console.log("✅ [CART ACTION] Update cart item result:", {
      requestId,
      success: result.success,
      newQuantity: result.data?.updatedItem?.quantity,
    });

    return result;
  } catch (error) {
    console.error("❌ [CART ACTION] Error updating cart item:", error);
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
export async function removeFromCartAction(input: RemoveFromCartInput): Promise<
  ApiResponse<{
    cart: CartWithItems;
    removedItemId: string;
    summary: CartSummary;
  }>
> {
  const requestId = `removeFromCart-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Removing from cart:", {
      requestId,
      cartItemId: input.cartItemId,
      hasUserId: !!input.userId,
      hasSessionId: !!input.sessionId,
    });

    // Validate input
    const validationResult = validators.validateRemoveFromCartInput(input);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validationResult.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    const session = await getServerSession();

    // Remove from cart via service layer
    const result = await cartService.removeFromCartService(input, session);

    // Revalidate cache if successful
    if (result.success) {
      revalidateTag("cart");
      if (input.userId) {
        revalidateTag(`cart-user-${input.userId}`);
      }
      if (input.sessionId) {
        revalidateTag(`cart-session-${input.sessionId}`);
      }
    }

    console.log("✅ [CART ACTION] Remove from cart result:", {
      requestId,
      success: result.success,
      remainingItems: result.data?.cart.items.length,
    });

    return result;
  } catch (error) {
    console.error("❌ [CART ACTION] Error removing from cart:", error);
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
export async function clearCartAction(options: {
  userId?: string;
  sessionId?: string;
}): Promise<
  ApiResponse<{
    cart: CartWithItems;
    removedCount: number;
  }>
> {
  const requestId = `clearCart-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Clearing cart:", { requestId, ...options });

    const session = await getServerSession();

    // Clear cart via service layer
    const result = await cartService.clearCartService({
      ...options,
      session,
    });

    // Revalidate cache if successful
    if (result.success) {
      revalidateTag("cart");
      if (options.userId) {
        revalidateTag(`cart-user-${options.userId}`);
      }
      if (options.sessionId) {
        revalidateTag(`cart-session-${options.sessionId}`);
      }
    }

    console.log("✅ [CART ACTION] Clear cart result:", {
      requestId,
      success: result.success,
      removedCount: result.data?.removedCount,
    });

    return result;
  } catch (error) {
    console.error("❌ [CART ACTION] Error clearing cart:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to clear cart",
    };
  }
}

/**
 * Validate cart items are still available and in stock
 */
export async function validateCartAction(options: {
  userId?: string;
  sessionId?: string;
}): Promise<ApiResponse<CartValidationResult>> {
  const requestId = `validateCart-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Validating cart:", { requestId, ...options });

    const session = await getServerSession();

    // Validate cart via service layer
    const result = await cartService.validateCartService({
      ...options,
      session,
    });

    console.log("✅ [CART ACTION] Validate cart result:", {
      requestId,
      success: result.success,
      isValid: result.data?.isValid,
      errorsCount: result.data?.errors.length || 0,
      warningsCount: result.data?.warnings.length || 0,
    });

    return result;
  } catch (error) {
    console.error("❌ [CART ACTION] Error validating cart:", error);
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
export async function syncGuestCartToUserAction(options: {
  guestSessionId: string;
  userId: string;
  mergeStrategy?: "replace" | "merge" | "keep_latest";
}): Promise<
  ApiResponse<{
    cart: CartWithItems;
    mergedItems: number;
    replacedItems: number;
  }>
> {
  const requestId = `syncGuestCart-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Syncing guest cart to user:", {
      requestId,
      guestSessionId: options.guestSessionId,
      userId: options.userId,
      mergeStrategy: options.mergeStrategy,
    });

    // Validate input
    const validationResult = validators.syncCartSchema.safeParse(options);
    if (!validationResult.success) {
      return {
        success: false,
        message: `Validation failed: ${validationResult.error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    const session = await getServerSession();
    if (!session) {
      return {
        success: false,
        message: "Authentication required for cart sync",
      };
    }

    // Sync cart via service layer
    const result = await cartService.syncGuestCartToUserService({
      ...options,
      session,
    });

    // Revalidate cache if successful
    if (result.success) {
      revalidateTag("cart");
      revalidateTag(`cart-user-${options.userId}`);
      revalidateTag(`cart-session-${options.guestSessionId}`);
    }

    console.log("✅ [CART ACTION] Sync guest cart result:", {
      requestId,
      success: result.success,
      mergedItems: result.data?.mergedItems,
      replacedItems: result.data?.replacedItems,
    });

    return result;
  } catch (error) {
    console.error("❌ [CART ACTION] Error syncing guest cart:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to sync guest cart",
    };
  }
}

// 🛠️ MAINTENANCE ACTIONS
// ======================

/**
 * Cleanup expired carts (admin/maintenance action)
 */
export async function cleanupExpiredCartsAction(): Promise<
  ApiResponse<{
    removedCount: number;
  }>
> {
  const requestId = `cleanupExpiredCarts-${Date.now()}`;

  try {
    console.log("🎬 [CART ACTION] Cleaning up expired carts:", { requestId });

    const session = await getServerSession();
    if (!session) {
      return {
        success: false,
        message: "Authentication required for maintenance operations",
      };
    }

    // TODO: Add admin permission check
    // const hasAdminPermission = await hasPermission(sessionToPermissionUser(session), "admin:write");
    // if (!hasAdminPermission) {
    //   return {
    //     success: false,
    //     message: "Admin permissions required for maintenance operations",
    //   };
    // }

    // Cleanup via service layer
    const result = await cartService.cleanupExpiredCartsService();

    // Revalidate cache
    revalidateTag("cart");

    console.log("✅ [CART ACTION] Cleanup expired carts result:", {
      requestId,
      success: result.success,
      removedCount: result.removedCount,
    });

    return {
      success: result.success,
      data: {
        removedCount: result.removedCount,
      },
      message: result.message,
    };
  } catch (error) {
    console.error("❌ [CART ACTION] Error cleaning up expired carts:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cleanup expired carts",
    };
  }
}

// 🎯 CONVENIENCE ACTIONS
// ======================

/**
 * Increment cart item quantity by 1
 */
export async function incrementCartItemAction(options: {
  cartItemId: string;
  userId?: string;
  sessionId?: string;
}): Promise<
  ApiResponse<{
    cart: CartWithItems;
    updatedItem: any;
    summary: CartSummary;
  }>
> {
  // First, get current cart to find the item and its current quantity
  const cartResult = await getCartAction({
    userId: options.userId,
    sessionId: options.sessionId,
  });

  if (!cartResult.success || !cartResult.data) {
    return {
      success: false,
      message: "Cart not found",
    };
  }

  const currentItem = cartResult.data.items.find(
    (item) => item.id === options.cartItemId
  );
  if (!currentItem) {
    return {
      success: false,
      message: "Cart item not found",
    };
  }

  return await updateCartItemAction({
    cartItemId: options.cartItemId,
    quantity: currentItem.quantity + 1,
    userId: options.userId,
    sessionId: options.sessionId,
  });
}

/**
 * Decrement cart item quantity by 1 (removes if quantity becomes 0)
 */
export async function decrementCartItemAction(options: {
  cartItemId: string;
  userId?: string;
  sessionId?: string;
}): Promise<
  ApiResponse<{
    cart: CartWithItems;
    updatedItem?: any;
    removedItemId?: string;
    summary: CartSummary;
  }>
> {
  // First, get current cart to find the item and its current quantity
  const cartResult = await getCartAction({
    userId: options.userId,
    sessionId: options.sessionId,
  });

  if (!cartResult.success || !cartResult.data) {
    return {
      success: false,
      message: "Cart not found",
    };
  }

  const currentItem = cartResult.data.items.find(
    (item) => item.id === options.cartItemId
  );
  if (!currentItem) {
    return {
      success: false,
      message: "Cart item not found",
    };
  }

  if (currentItem.quantity <= 1) {
    // Remove item if quantity would become 0
    const removeResult = await removeFromCartAction({
      cartItemId: options.cartItemId,
      userId: options.userId,
      sessionId: options.sessionId,
    });

    if (removeResult.success) {
      return {
        success: true,
        data: {
          cart: removeResult.data!.cart,
          removedItemId: removeResult.data!.removedItemId,
          summary: removeResult.data!.summary,
        },
        message: "Item removed from cart",
      };
    }

    return removeResult as any;
  }

  // Decrement quantity
  const updateResult = await updateCartItemAction({
    cartItemId: options.cartItemId,
    quantity: currentItem.quantity - 1,
    userId: options.userId,
    sessionId: options.sessionId,
  });

  if (updateResult.success) {
    return {
      success: true,
      data: {
        cart: updateResult.data!.cart,
        updatedItem: updateResult.data!.updatedItem,
        summary: updateResult.data!.summary,
      },
      message: "Cart item quantity decremented",
    };
  }

  return updateResult as any;
}

// Note: Server actions file - no default export needed
