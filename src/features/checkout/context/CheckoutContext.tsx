/**
 * 🌍 CHECKOUT CONTEXT
 * ===================
 *
 * Global state management for checkout process
 */

"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { CheckoutContextType } from "../types";
import { useCheckoutState } from "../hooks/checkout/useCheckoutState";
import { useCheckoutActions } from "../hooks/checkout/useCheckoutActions";
import { useCartContext } from "@/features/cart/context";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../constants";

// 🌍 CONTEXT
// ==========

const CheckoutContext = createContext<CheckoutContextType | null>(null);

// 🎯 PROVIDER PROPS
// =================

export interface CheckoutProviderProps {
  children: React.ReactNode;
}

// 🚀 PROVIDER COMPONENT
// =====================

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  // Get cart data from cart context
  const cartContext = useCartContext();
  const { items, summary, totalAmount } = cartContext;

  // Build a cart object compatible with checkout
  const cart = useMemo(() => {
    if (!items || items.length === 0) return null;

    return {
      id: `cart-${Date.now()}`, // TODO: Get from server if persisted
      items,
      subtotal: summary?.subtotal || totalAmount || 0,
      total: summary?.total || totalAmount || 0,
      userId: undefined, // Will be set by auth
      sessionId: undefined,
    };
  }, [items, summary, totalAmount]);

  // Initialize checkout state with cart info
  const checkoutState = useCheckoutState(cart?.id, cart?.userId);
  const checkoutActions = useCheckoutActions();

  // 🧮 DERIVED STATE
  // ================

  const calculation = useMemo(() => {
    if (!cart) return null;

    // Basic calculation - in real app this would come from server
    return {
      subtotal: cart.subtotal || 0,
      shipping: 0, // Will be calculated when shipping method is selected
      tax: Math.round((cart.subtotal || 0) * 0.08), // 8% tax
      discount: 0,
      total: (cart.subtotal || 0) + Math.round((cart.subtotal || 0) * 0.08),
    };
  }, [cart]);

  // 🚚 SHIPPING & PAYMENT OPTIONS
  // =============================

  const availableShippingMethods = useMemo(() => {
    return SHIPPING_METHODS.filter((method) => method.isActive);
  }, []);

  const availablePaymentMethods = useMemo(() => {
    return PAYMENT_METHODS.filter((method) => method.enabled);
  }, []);

  const selectedShippingMethod = useMemo(() => {
    if (!checkoutState.session?.shippingMethodId) return null;
    return (
      availableShippingMethods.find(
        (m) => m.id === checkoutState.session?.shippingMethodId
      ) || null
    );
  }, [checkoutState.session?.shippingMethodId, availableShippingMethods]);

  const selectedPaymentMethod = useMemo(() => {
    if (!checkoutState.session?.paymentMethodId) return null;
    return (
      availablePaymentMethods.find(
        (m) => m.id === checkoutState.session?.paymentMethodId
      ) || null
    );
  }, [checkoutState.session?.paymentMethodId, availablePaymentMethods]);

  // 🔄 ENHANCED ACTIONS
  // ===================

  const calculateOrder = async () => {
    if (!cart || !checkoutState.session) return;

    try {
      await checkoutActions.calculateOrder(
        cart.id,
        checkoutState.session.shippingAddress,
        checkoutState.session.shippingMethodId,
        [] // discount codes
      );
    } catch (error) {
      console.error("❌ [CHECKOUT CONTEXT] Error calculating order:", error);
    }
  };

  const createOrder = async () => {
    if (!checkoutState.session || !cart) {
      console.error("❌ [CHECKOUT CONTEXT] Missing session or cart data");
      return null;
    }

    try {
      const order = await checkoutActions.createOrder(
        checkoutState.session,
        cart
      );

      if (order) {
        // Navigate to next step on successful order creation
        checkoutState.goToStep("processing");
      }

      return order;
    } catch (error) {
      console.error("❌ [CHECKOUT CONTEXT] Error creating order:", error);
      return null;
    }
  };

  const processPayment = async () => {
    // This would be called after order is created
    return { success: true }; // Placeholder
  };

  // 🎯 CONTEXT VALUE
  // ================

  const contextValue: CheckoutContextType = {
    // State
    session: checkoutState.session,
    cart,
    calculation,
    metrics: null, // Analytics will be implemented in Phase 2

    // Current step info
    currentStep: checkoutState.currentStep,
    completedSteps: checkoutState.completedSteps,
    canProceedToNext: checkoutState.canProceedToNext,
    canGoBack: checkoutState.canGoBack,

    // Loading states
    isLoading: checkoutState.isLoading,
    isCalculating: checkoutActions.isCalculatingOrder,
    isCreatingOrder: checkoutActions.isCreatingOrder,
    isProcessingPayment: checkoutActions.isProcessingPayment,

    // Error states
    errors: checkoutState.errors,
    lastError: checkoutActions.lastError,

    // Shipping & Payment
    shippingMethods: availableShippingMethods,
    selectedShippingMethod,
    paymentMethods: availablePaymentMethods,
    selectedPaymentMethod,

    // Actions - Step Navigation
    goToStep: checkoutState.goToStep,
    goToNextStep: checkoutState.goToNextStep,
    goToPreviousStep: checkoutState.goToPreviousStep,

    // Actions - Data Management
    setCustomerInfo: checkoutState.setCustomerInfo,
    setShippingAddress: checkoutState.setShippingAddress,
    setBillingAddress: checkoutState.setBillingAddress,
    setShippingMethod: checkoutState.setShippingMethod,
    setPaymentMethod: checkoutState.setPaymentMethod,
    setCustomerNotes: checkoutState.setCustomerNotes,

    // Actions - Process
    calculateOrder,
    createOrder,
    processPayment,
    resetCheckout: checkoutState.resetCheckout,

    // Actions - Error handling
    clearError: checkoutActions.clearError,
    clearErrors: checkoutState.resetCheckout, // Using reset as clear errors for now
  };

  // 🔄 DEBUG LOGGING
  // ================

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🌍 [CHECKOUT CONTEXT] State updated:", {
        hasSession: !!checkoutState.session,
        currentStep: checkoutState.currentStep,
        completedSteps: checkoutState.completedSteps.length,
        hasCart: !!cart,
        cartItems: cart?.items?.length || 0,
        canProceedToNext: checkoutState.canProceedToNext,
      });
    }
  }, [
    checkoutState.session,
    checkoutState.currentStep,
    checkoutState.completedSteps,
    checkoutState.canProceedToNext,
    cart,
  ]);

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
}

// 🪝 HOOK TO USE CONTEXT
// ======================

export function useCheckoutContext(): CheckoutContextType {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error(
      "useCheckoutContext must be used within a CheckoutProvider"
    );
  }

  return context;
}
