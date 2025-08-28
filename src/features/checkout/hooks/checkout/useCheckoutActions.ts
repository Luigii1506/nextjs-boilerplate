/**
 * 🪝 USE CHECKOUT ACTIONS
 * ======================
 *
 * Manages checkout mutations and server actions
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type {
  UseCheckoutActionsReturn,
  CheckoutSession,
  Order,
  CreateOrderInput,
  ProcessPaymentInput,
  PaymentData,
  Address,
} from "../../types";
import type { CartWithItems } from "@/features/cart/types";
import {
  createOrderAction,
  processPaymentAction,
  calculateOrderAction,
} from "../../server/actions";

// 🎯 QUERY KEYS
// =============

export const CHECKOUT_QUERY_KEYS = {
  all: ["checkout"] as const,
  orders: ["checkout", "orders"] as const,
  userOrders: (userId: string) =>
    ["checkout", "orders", "user", userId] as const,
  order: (orderId: string) => ["checkout", "order", orderId] as const,
  calculation: (cartId: string) => ["checkout", "calculation", cartId] as const,
};

// 🪝 HOOK
// =======

export function useCheckoutActions(): UseCheckoutActionsReturn {
  const queryClient = useQueryClient();
  const [lastError, setLastError] = useState<string | null>(null);

  // 📦 CREATE ORDER MUTATION
  // ========================

  const createOrderMutation = useMutation({
    mutationFn: createOrderAction,
    onSuccess: (response, variables) => {
      console.log("✅ [CHECKOUT ACTIONS] Order created successfully:", {
        success: response.success,
        orderId: response.data?.id,
        orderNumber: response.data?.number,
      });

      if (response.success && response.data) {
        // Cache the new order
        queryClient.setQueryData(
          CHECKOUT_QUERY_KEYS.order(response.data.id),
          response.data
        );

        // Invalidate user orders if user is authenticated
        if (variables.userId) {
          queryClient.invalidateQueries({
            queryKey: CHECKOUT_QUERY_KEYS.userOrders(variables.userId),
          });
        }

        // Invalidate cart data since it should be cleared
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        });

        setLastError(null);
      } else {
        setLastError(response.error || "Failed to create order");
      }
    },
    onError: (error) => {
      console.error("❌ [CHECKOUT ACTIONS] Order creation failed:", error);
      setLastError(
        error instanceof Error ? error.message : "Failed to create order"
      );
    },
  });

  // 💳 PROCESS PAYMENT MUTATION
  // ===========================

  const processPaymentMutation = useMutation({
    mutationFn: processPaymentAction,
    onSuccess: (response, variables) => {
      console.log("✅ [CHECKOUT ACTIONS] Payment processed:", {
        success: response.success,
        orderId: variables.orderId,
        requiresAction: response.data?.requiresAction,
      });

      if (response.success && response.data) {
        // Update the order cache with latest data
        queryClient.setQueryData(
          CHECKOUT_QUERY_KEYS.order(variables.orderId),
          response.data.order
        );

        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: CHECKOUT_QUERY_KEYS.orders,
        });

        setLastError(null);
      } else {
        setLastError(response.error || "Payment processing failed");
      }
    },
    onError: (error) => {
      console.error("❌ [CHECKOUT ACTIONS] Payment processing failed:", error);
      setLastError(
        error instanceof Error ? error.message : "Payment processing failed"
      );
    },
  });

  // 🧮 CALCULATE ORDER MUTATION
  // ===========================

  const calculateOrderMutation = useMutation({
    mutationFn: calculateOrderAction,
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Cache the calculation
        queryClient.setQueryData(
          CHECKOUT_QUERY_KEYS.calculation(variables.cartId),
          response.data
        );

        console.log("✅ [CHECKOUT ACTIONS] Order calculation updated:", {
          cartId: variables.cartId,
          total: response.data.total,
          shipping: response.data.shipping,
        });
      } else {
        console.error(
          "❌ [CHECKOUT ACTIONS] Order calculation failed:",
          response.error
        );
        setLastError(response.error || "Failed to calculate order");
      }
    },
    onError: (error) => {
      console.error("❌ [CHECKOUT ACTIONS] Order calculation error:", error);
      setLastError(
        error instanceof Error ? error.message : "Failed to calculate order"
      );
    },
  });

  // 🎯 ACTION FUNCTIONS
  // ===================

  const createOrder = useCallback(
    async (
      session: CheckoutSession,
      cart: CartWithItems
    ): Promise<Order | null> => {
      if (
        !session.shippingAddress ||
        !session.shippingMethodId ||
        !session.paymentMethodId
      ) {
        setLastError("Checkout session is incomplete");
        return null;
      }

      const orderInput: CreateOrderInput = {
        cartId: session.cartId,
        userId: session.userId,
        customerInfo: session.customerInfo,
        shippingAddress: session.shippingAddress,
        billingAddress: session.billingAddress,
        shippingMethodId: session.shippingMethodId,
        paymentMethodId: session.paymentMethodId,
        customerNotes: session.customerNotes,
      };

      try {
        const response = await createOrderMutation.mutateAsync(orderInput);

        if (response.success && response.data) {
          return response.data;
        } else {
          setLastError(response.error || "Failed to create order");
          return null;
        }
      } catch (error) {
        setLastError(
          error instanceof Error ? error.message : "Failed to create order"
        );
        return null;
      }
    },
    [createOrderMutation]
  );

  const processPayment = useCallback(
    async (
      order: Order,
      paymentData: PaymentData
    ): Promise<{ success: boolean; error?: string }> => {
      const paymentInput: ProcessPaymentInput = {
        orderId: order.id,
        paymentMethodId: order.paymentMethod?.id || "",
        paymentData,
      };

      try {
        const response = await processPaymentMutation.mutateAsync(paymentInput);

        return {
          success: response.success,
          error: response.error,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Payment processing failed";
        setLastError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [processPaymentMutation]
  );

  const confirmOrder = useCallback(
    async (orderId: string): Promise<Order | null> => {
      // For now, this just refetches the order
      // In a real implementation, you might have a separate confirmation step
      try {
        await queryClient.invalidateQueries({
          queryKey: CHECKOUT_QUERY_KEYS.order(orderId),
        });

        const order = queryClient.getQueryData(
          CHECKOUT_QUERY_KEYS.order(orderId)
        ) as Order;
        return order || null;
      } catch (error) {
        setLastError(
          error instanceof Error ? error.message : "Failed to confirm order"
        );
        return null;
      }
    },
    [queryClient]
  );

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  // 🔄 CALCULATED ORDER HELPER
  // ==========================

  const calculateOrder = useCallback(
    async (
      cartId: string,
      shippingAddress?: Address,
      shippingMethodId?: string,
      discountCodes?: string[]
    ) => {
      try {
        await calculateOrderMutation.mutateAsync({
          cartId,
          shippingAddress,
          shippingMethodId,
          discountCodes,
        });
      } catch (error) {
        console.error("❌ [CHECKOUT ACTIONS] Order calculation failed:", error);
        setLastError(
          error instanceof Error ? error.message : "Failed to calculate order"
        );
      }
    },
    [calculateOrderMutation]
  );

  return {
    // Order creation
    createOrder,
    processPayment,
    confirmOrder,
    calculateOrder,

    // States
    isCreatingOrder: createOrderMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,
    isConfirmingOrder: false, // Not implemented yet
    isCalculatingOrder: calculateOrderMutation.isPending,

    // Error handling
    lastError,
    clearError,
  };
}
