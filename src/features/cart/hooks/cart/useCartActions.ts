/**
 * ⚡ CART ACTIONS HOOK
 * ===================
 *
 * Hook para acciones del Cart: Add/Remove/Update/Sync con optimistic updates.
 * Feature-First v3.0.0: Actions + Mutations + Optimistic UI
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UseCartActionsProps,
  UseCartActionsReturn,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  CartWithItems,
  CartValidationResult,
} from "../../types";

// Import server actions
import {
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
  validateCartAction,
  syncGuestCartToUserAction,
  incrementCartItemAction,
  decrementCartItemAction,
} from "../../server";

// 🎯 QUERY KEYS
// =============

const CART_QUERY_KEYS = {
  all: ["cart"] as const,
  byUser: (userId: string) => ["cart", "user", userId] as const,
  bySession: (sessionId: string) => ["cart", "session", sessionId] as const,
  current: (userId?: string, sessionId?: string) =>
    userId
      ? ["cart", "user", userId]
      : sessionId
      ? ["cart", "session", sessionId]
      : (["cart", "guest"] as const),
};

// 🪝 MAIN HOOK
// ============

/**
 * useCartActions - Hook principal para acciones del cart
 */
export function useCartActions(
  props: UseCartActionsProps
): UseCartActionsReturn {
  const {
    userId,
    sessionId,
    onCartChange,
    onItemAdded,
    onItemUpdated,
    onItemRemoved,
    onError,
    enableOptimisticUpdates = true,
  } = props;

  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const lastActionRef = useRef<{
    type: string;
    timestamp: Date;
    success: boolean;
  }>();

  console.log("⚡ [CART ACTIONS] Hook initialized:", {
    userId,
    hasSessionId: !!sessionId,
    enableOptimisticUpdates,
  });

  // 🔄 MUTATION HELPERS
  // ===================

  /**
   * Handle mutation success
   */
  const handleMutationSuccess = useCallback(
    (result: any, actionType: string, productId?: string) => {
      setIsProcessing(false);

      console.log(`🔍 [CART ACTIONS] ${actionType} result received:`, {
        success: result.success,
        hasData: !!result.data,
        hasCart: !!result.data?.cart,
        resultKeys: result.data ? Object.keys(result.data) : null,
        fullResult: result,
      });

      if (result.success && result.data?.cart) {
        // Update last action
        lastActionRef.current = {
          type: actionType,
          timestamp: new Date(),
          success: true,
        };

        // Trigger callbacks
        onCartChange?.(result.data.cart);

        if (actionType === "ADD" && result.data.addedItem) {
          onItemAdded?.(result.data.addedItem);
        } else if (actionType === "UPDATE" && result.data.updatedItem) {
          onItemUpdated?.(result.data.updatedItem);
        } else if (actionType === "REMOVE" && result.data.removedItemId) {
          onItemRemoved?.(result.data.removedItemId);
        }

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
        if (userId) {
          queryClient.invalidateQueries({
            queryKey: CART_QUERY_KEYS.byUser(userId),
          });
        }
        if (sessionId) {
          queryClient.invalidateQueries({
            queryKey: CART_QUERY_KEYS.bySession(sessionId),
          });
        }

        console.log(`✅ [CART ACTIONS] ${actionType} successful:`, {
          productId,
          itemsCount: result.data.cart.items.length,
          total: result.data.cart.total,
        });
      } else {
        console.warn(`⚠️ [CART ACTIONS] ${actionType} returned no cart data:`, {
          success: result.success,
          hasData: !!result.data,
          hasCart: !!result.data?.cart,
          fullResult: result,
        });
        onError?.(`${actionType} completed but no cart data received`);
      }
    },
    [
      userId,
      sessionId,
      onCartChange,
      onItemAdded,
      onItemUpdated,
      onItemRemoved,
      onError,
      queryClient,
    ]
  );

  /**
   * Handle mutation error
   */
  const handleMutationError = useCallback(
    (error: any, actionType: string, productId?: string) => {
      setIsProcessing(false);

      lastActionRef.current = {
        type: actionType,
        timestamp: new Date(),
        success: false,
      };

      const errorMessage =
        error?.message || `Failed to ${actionType.toLowerCase()}`;

      console.error(`❌ [CART ACTIONS] ${actionType} failed:`, {
        productId,
        error: errorMessage,
      });

      onError?.(errorMessage);
    },
    [onError]
  );

  // 🎬 MUTATIONS
  // ============

  /**
   * Add to cart mutation with OPTIMISTIC UPDATES for SPA experience
   */
  const addToCartMutation = useMutation({
    mutationFn: addToCartAction,
    onMutate: async (variables) => {
      console.log("🚀 [OPTIMISTIC] Adding to cart:", variables.productId);

      // 🚀 OPTIMISTIC UPDATE - Show immediate feedback
      const previousCart = queryClient.getQueryData(
        CART_QUERY_KEYS.current(userId, sessionId)
      );

      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: CART_QUERY_KEYS.current(userId, sessionId),
      });

      setIsProcessing(true);

      // Immediately trigger UI callbacks for instant feedback
      if (enableOptimisticUpdates) {
        onItemAdded?.(variables);
      }

      return { previousCart };
    },
    onSuccess: (result, variables) => {
      console.log("✅ [OPTIMISTIC] Add to cart confirmed");
      handleMutationSuccess(result, "ADD", variables.productId);
    },
    onError: (error, variables, context) => {
      console.warn("❌ [OPTIMISTIC] Add to cart failed, rolling back");

      // 🔄 ROLLBACK if needed
      if (context?.previousCart) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.current(userId, sessionId),
          context.previousCart
        );
      }

      handleMutationError(error, "ADD", variables.productId);
    },
    onSettled: () => {
      // Always refetch for consistency
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEYS.current(userId, sessionId),
      });
    },
  });

  /**
   * Update cart item mutation with OPTIMISTIC UPDATES for SPA experience
   */
  const updateCartItemMutation = useMutation({
    mutationFn: updateCartItemAction,
    onMutate: async (variables) => {
      console.log("🚀 [OPTIMISTIC] Immediate UI update:", variables);

      // 🚀 OPTIMISTIC UPDATE - Update UI IMMEDIATELY
      const previousCart = queryClient.getQueryData(
        CART_QUERY_KEYS.current(userId, sessionId)
      );

      // Cancel in-flight queries to avoid conflicts
      await queryClient.cancelQueries({
        queryKey: CART_QUERY_KEYS.current(userId, sessionId),
      });

      // Optimistically update the cart in cache
      if (previousCart) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.current(userId, sessionId),
          (old: any) => {
            if (!old || !old.items) return old;

            return {
              ...old,
              items: old.items.map((item: any) =>
                item.id === variables.cartItemId
                  ? {
                      ...item,
                      quantity: variables.quantity,
                      total: item.unitPrice * variables.quantity,
                    }
                  : item
              ),
              // Recalculate cart totals optimistically
              subtotal: old.items.reduce(
                (sum: number, item: any) =>
                  sum +
                  (item.id === variables.cartItemId
                    ? item.unitPrice * variables.quantity
                    : item.total),
                0
              ),
              total: old.items.reduce(
                (sum: number, item: any) =>
                  sum +
                  (item.id === variables.cartItemId
                    ? item.unitPrice * variables.quantity
                    : item.total),
                0
              ),
            };
          }
        );
      }

      // Immediately trigger UI callbacks for instant feedback
      if (enableOptimisticUpdates) {
        onItemUpdated?.(variables);
      }

      setIsProcessing(true);

      // Return rollback data
      return { previousCart };
    },
    onSuccess: (result, variables) => {
      console.log("✅ [OPTIMISTIC] Server confirmed update");
      handleMutationSuccess(result, "UPDATE", variables.cartItemId);
    },
    onError: (error, variables, context) => {
      console.warn("❌ [OPTIMISTIC] Rolling back UI changes");

      // 🔄 ROLLBACK - Restore previous data on error
      if (context?.previousCart) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.current(userId, sessionId),
          context.previousCart
        );
      }

      handleMutationError(error, "UPDATE", variables.cartItemId);
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEYS.current(userId, sessionId),
      });
    },
  });

  /**
   * Remove from cart mutation with OPTIMISTIC UPDATES for SPA experience
   */
  const removeFromCartMutation = useMutation({
    mutationFn: removeFromCartAction,
    onMutate: async (variables) => {
      console.log("🚀 [OPTIMISTIC] Removing from cart:", variables.cartItemId);

      // 🚀 OPTIMISTIC UPDATE - Remove item immediately from UI
      const previousCart = queryClient.getQueryData(
        CART_QUERY_KEYS.current(userId, sessionId)
      );

      await queryClient.cancelQueries({
        queryKey: CART_QUERY_KEYS.current(userId, sessionId),
      });

      // Optimistically remove item from cache
      if (previousCart) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.current(userId, sessionId),
          (old: any) => {
            if (!old || !old.items) return old;

            const filteredItems = old.items.filter(
              (item: any) => item.id !== variables.cartItemId
            );
            const newSubtotal = filteredItems.reduce(
              (sum: number, item: any) => sum + item.total,
              0
            );

            return {
              ...old,
              items: filteredItems,
              subtotal: newSubtotal,
              total: newSubtotal,
              itemCount: filteredItems.length,
            };
          }
        );
      }

      setIsProcessing(true);

      // Immediately trigger UI callbacks
      if (enableOptimisticUpdates) {
        onItemRemoved?.(variables.cartItemId);
      }

      return { previousCart };
    },
    onSuccess: (result, variables) => {
      console.log("✅ [OPTIMISTIC] Remove from cart confirmed");
      handleMutationSuccess(result, "REMOVE", variables.cartItemId);
    },
    onError: (error, variables, context) => {
      console.warn("❌ [OPTIMISTIC] Remove failed, rolling back");

      // 🔄 ROLLBACK
      if (context?.previousCart) {
        queryClient.setQueryData(
          CART_QUERY_KEYS.current(userId, sessionId),
          context.previousCart
        );
      }

      handleMutationError(error, "REMOVE", variables.cartItemId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: CART_QUERY_KEYS.current(userId, sessionId),
      });
    },
  });

  /**
   * Clear cart mutation
   */
  const clearCartMutation = useMutation({
    mutationFn: clearCartAction,
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: (result) => {
      handleMutationSuccess(result, "CLEAR");
    },
    onError: (error) => {
      handleMutationError(error, "CLEAR");
    },
  });

  /**
   * Validate cart mutation
   */
  const validateCartMutation = useMutation({
    mutationFn: validateCartAction,
  });

  /**
   * Sync cart mutation
   */
  const syncCartMutation = useMutation({
    mutationFn: syncGuestCartToUserAction,
    onSuccess: (result) => {
      handleMutationSuccess(result, "SYNC");
    },
    onError: (error) => {
      handleMutationError(error, "SYNC");
    },
  });

  // 🎯 PRIMARY ACTIONS
  // ==================

  /**
   * Add item to cart
   */
  const addToCart = useCallback(
    async (
      input: Omit<AddToCartInput, "userId" | "sessionId">
    ): Promise<boolean> => {
      try {
        console.log("➕ [CART ACTIONS] Adding to cart:", input);

        const result = await addToCartMutation.mutateAsync({
          ...input,
          userId,
          sessionId,
        });

        return result.success;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Add to cart failed:", error);
        return false;
      }
    },
    [addToCartMutation, userId, sessionId]
  );

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback(
    async (
      input: Omit<UpdateCartItemInput, "userId" | "sessionId">
    ): Promise<boolean> => {
      try {
        console.log("🔄 [CART ACTIONS] Updating cart item:", input);

        const result = await updateCartItemMutation.mutateAsync({
          ...input,
          userId,
          sessionId,
        });

        return result.success;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Update cart item failed:", error);
        return false;
      }
    },
    [updateCartItemMutation, userId, sessionId]
  );

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(
    async (
      input: Omit<RemoveFromCartInput, "userId" | "sessionId">
    ): Promise<boolean> => {
      try {
        console.log("🗑️ [CART ACTIONS] Removing from cart:", input);

        const result = await removeFromCartMutation.mutateAsync({
          ...input,
          userId,
          sessionId,
        });

        return result.success;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Remove from cart failed:", error);
        return false;
      }
    },
    [removeFromCartMutation, userId, sessionId]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🧹 [CART ACTIONS] Clearing cart");

      const result = await clearCartMutation.mutateAsync({
        userId,
        sessionId,
      });

      return result.success;
    } catch (error) {
      console.error("❌ [CART ACTIONS] Clear cart failed:", error);
      return false;
    }
  }, [clearCartMutation, userId, sessionId]);

  // 🎯 CONVENIENCE ACTIONS
  // ======================

  /**
   * Increment item quantity by 1
   */
  const incrementItem = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        console.log("➕ [CART ACTIONS] Incrementing item:", productId);

        // Find current cart item to get cartItemId
        const currentCart = queryClient.getQueryData<CartWithItems>([
          "cart",
          userId ? "user" : "session",
          userId || sessionId,
        ]);

        const currentItem = currentCart?.items.find(
          (item) => item.productId === productId
        );
        if (!currentItem) {
          console.error(
            "❌ [CART ACTIONS] Item not found for increment:",
            productId
          );
          return false;
        }

        const result = await incrementCartItemAction({
          cartItemId: currentItem.id,
          userId,
          sessionId,
        });

        if (result.success) {
          handleMutationSuccess(result, "INCREMENT", productId);
        }

        return result.success;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Increment item failed:", error);
        return false;
      }
    },
    [userId, sessionId, queryClient, handleMutationSuccess]
  );

  /**
   * Decrement item quantity by 1
   */
  const decrementItem = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        console.log("➖ [CART ACTIONS] Decrementing item:", productId);

        // Find current cart item to get cartItemId
        const currentCart = queryClient.getQueryData<CartWithItems>([
          "cart",
          userId ? "user" : "session",
          userId || sessionId,
        ]);

        const currentItem = currentCart?.items.find(
          (item) => item.productId === productId
        );
        if (!currentItem) {
          console.error(
            "❌ [CART ACTIONS] Item not found for decrement:",
            productId
          );
          return false;
        }

        const result = await decrementCartItemAction({
          cartItemId: currentItem.id,
          userId,
          sessionId,
        });

        if (result.success) {
          const actionType = result.data?.removedItemId
            ? "REMOVE"
            : "DECREMENT";
          handleMutationSuccess(result, actionType, productId);
        }

        return result.success;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Decrement item failed:", error);
        return false;
      }
    },
    [userId, sessionId, queryClient, handleMutationSuccess]
  );

  /**
   * Set specific item quantity
   */
  const setItemQuantity = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      try {
        console.log("🔢 [CART ACTIONS] Setting item quantity:", {
          productId,
          quantity,
        });

        // Find current cart item to get cartItemId
        const currentCart = queryClient.getQueryData<CartWithItems>([
          "cart",
          userId ? "user" : "session",
          userId || sessionId,
        ]);

        const currentItem = currentCart?.items.find(
          (item) => item.productId === productId
        );
        if (!currentItem) {
          console.error(
            "❌ [CART ACTIONS] Item not found for quantity update:",
            productId
          );
          return false;
        }

        return await updateCartItem({
          cartItemId: currentItem.id,
          quantity,
        });
      } catch (error) {
        console.error("❌ [CART ACTIONS] Set item quantity failed:", error);
        return false;
      }
    },
    [updateCartItem, userId, sessionId, queryClient]
  );

  /**
   * Remove item by product ID
   */
  const removeItem = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        console.log(
          "🗑️ [CART ACTIONS] Removing item by product ID:",
          productId
        );

        // Find current cart item to get cartItemId
        const currentCart = queryClient.getQueryData<CartWithItems>([
          "cart",
          userId ? "user" : "session",
          userId || sessionId,
        ]);

        const currentItem = currentCart?.items.find(
          (item) => item.productId === productId
        );
        if (!currentItem) {
          console.error(
            "❌ [CART ACTIONS] Item not found for removal:",
            productId
          );
          return false;
        }

        return await removeFromCart({
          cartItemId: currentItem.id,
        });
      } catch (error) {
        console.error("❌ [CART ACTIONS] Remove item failed:", error);
        return false;
      }
    },
    [removeFromCart, userId, sessionId, queryClient]
  );

  // 🏗️ BULK ACTIONS
  // ===============

  /**
   * Add multiple items to cart
   */
  const addMultipleItems = useCallback(
    async (
      items: Omit<AddToCartInput, "userId" | "sessionId">[]
    ): Promise<boolean> => {
      try {
        console.log("📦 [CART ACTIONS] Adding multiple items:", items.length);

        let allSuccessful = true;

        for (const item of items) {
          const success = await addToCart(item);
          if (!success) {
            allSuccessful = false;
            console.warn("⚠️ [CART ACTIONS] Failed to add item:", item);
          }
        }

        return allSuccessful;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Add multiple items failed:", error);
        return false;
      }
    },
    [addToCart]
  );

  /**
   * Update multiple items quantities
   */
  const updateMultipleItems = useCallback(
    async (
      updates: { productId: string; quantity: number }[]
    ): Promise<boolean> => {
      try {
        console.log(
          "📝 [CART ACTIONS] Updating multiple items:",
          updates.length
        );

        let allSuccessful = true;

        for (const update of updates) {
          const success = await setItemQuantity(
            update.productId,
            update.quantity
          );
          if (!success) {
            allSuccessful = false;
            console.warn("⚠️ [CART ACTIONS] Failed to update item:", update);
          }
        }

        return allSuccessful;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Update multiple items failed:", error);
        return false;
      }
    },
    [setItemQuantity]
  );

  // 🛠️ CART MANAGEMENT
  // ==================

  /**
   * Validate and fix cart issues
   */
  const validateAndFixCart =
    useCallback(async (): Promise<CartValidationResult> => {
      try {
        console.log("✅ [CART ACTIONS] Validating cart");

        const result = await validateCartMutation.mutateAsync({
          userId,
          sessionId,
        });

        if (result.success && result.data) {
          return result.data;
        }

        return {
          isValid: false,
          errors: [
            {
              type: "VALIDATION_ERROR",
              message: "Cart validation failed",
            },
          ],
          warnings: [],
        };
      } catch (error) {
        console.error("❌ [CART ACTIONS] Validate cart failed:", error);
        return {
          isValid: false,
          errors: [
            {
              type: "VALIDATION_ERROR",
              message:
                error instanceof Error ? error.message : "Validation failed",
            },
          ],
          warnings: [],
        };
      }
    }, [validateCartMutation, userId, sessionId]);

  /**
   * Sync cart (guest to user on login)
   */
  const syncCart = useCallback(async (): Promise<boolean> => {
    if (!userId || !sessionId) {
      console.warn(
        "⚠️ [CART ACTIONS] Cannot sync cart: missing userId or sessionId"
      );
      return false;
    }

    try {
      console.log("🔄 [CART ACTIONS] Syncing guest cart to user");

      const result = await syncCartMutation.mutateAsync({
        guestSessionId: sessionId,
        userId,
        mergeStrategy: "merge",
      });

      return result.success;
    } catch (error) {
      console.error("❌ [CART ACTIONS] Sync cart failed:", error);
      return false;
    }
  }, [syncCartMutation, userId, sessionId]);

  /**
   * Refresh cart data from server
   */
  const refreshCart = useCallback(async (): Promise<void> => {
    try {
      console.log("🔄 [CART ACTIONS] Refreshing cart data");

      // Invalidate and refetch cart queries
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });

      if (userId) {
        await queryClient.refetchQueries({
          queryKey: CART_QUERY_KEYS.byUser(userId),
        });
      }

      if (sessionId) {
        await queryClient.refetchQueries({
          queryKey: CART_QUERY_KEYS.bySession(sessionId),
        });
      }
    } catch (error) {
      console.error("❌ [CART ACTIONS] Refresh cart failed:", error);
    }
  }, [queryClient, userId, sessionId]);

  /**
   * Migrate guest cart to user (on login)
   */
  const migrateGuestCart = useCallback(
    async (newUserId: string): Promise<boolean> => {
      if (!sessionId) {
        console.warn("⚠️ [CART ACTIONS] Cannot migrate: no guest session");
        return false;
      }

      try {
        console.log(
          "🔄 [CART ACTIONS] Migrating guest cart to user:",
          newUserId
        );

        const result = await syncCartMutation.mutateAsync({
          guestSessionId: sessionId,
          userId: newUserId,
          mergeStrategy: "merge",
        });

        return result.success;
      } catch (error) {
        console.error("❌ [CART ACTIONS] Migrate guest cart failed:", error);
        return false;
      }
    },
    [syncCartMutation, sessionId]
  );

  // 📤 RETURN INTERFACE
  // ===================

  return {
    // Primary actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,

    // Convenience actions
    incrementItem,
    decrementItem,
    setItemQuantity,
    removeItem,

    // Bulk actions
    addMultipleItems,
    updateMultipleItems,

    // Cart management
    validateAndFixCart,
    syncCart,
    refreshCart,

    // Guest/User transitions
    migrateGuestCart,

    // States
    isProcessing,
    lastAction: lastActionRef.current,
  };
}

export default useCartActions;
