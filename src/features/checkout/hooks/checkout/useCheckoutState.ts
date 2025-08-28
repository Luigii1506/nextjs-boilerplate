/**
 * 🪝 USE CHECKOUT STATE
 * ====================
 *
 * Manages checkout form state and step navigation
 */

"use client";

import { useReducer, useCallback, useMemo } from "react";
import type {
  CheckoutSession,
  CheckoutStep,
  CustomerInfo,
  Address,
  UseCheckoutStateReturn,
} from "../../types";
import {
  CHECKOUT_STEPS,
  CHECKOUT_STEP_LABELS,
  DEFAULT_CUSTOMER_INFO,
  DEFAULT_ADDRESS,
} from "../../constants";
import { validateCheckoutStep } from "../../schemas";

// 🎯 STATE TYPES
// ==============

interface CheckoutState {
  session: CheckoutSession | null;
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  errors: Record<string, string>;
  isLoading: boolean;
}

type CheckoutAction =
  | { type: "INITIALIZE_SESSION"; payload: { cartId: string; userId?: string } }
  | { type: "SET_CUSTOMER_INFO"; payload: CustomerInfo }
  | { type: "SET_SHIPPING_ADDRESS"; payload: Address }
  | { type: "SET_BILLING_ADDRESS"; payload: Address | null }
  | { type: "SET_SHIPPING_METHOD"; payload: string }
  | { type: "SET_PAYMENT_METHOD"; payload: string }
  | { type: "SET_CUSTOMER_NOTES"; payload: string }
  | { type: "GO_TO_STEP"; payload: CheckoutStep }
  | { type: "GO_TO_NEXT_STEP" }
  | { type: "GO_TO_PREVIOUS_STEP" }
  | { type: "COMPLETE_STEP"; payload: CheckoutStep }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET_CHECKOUT" };

// 🔄 REDUCER
// ==========

function checkoutStateReducer(
  state: CheckoutState,
  action: CheckoutAction
): CheckoutState {
  switch (action.type) {
    case "INITIALIZE_SESSION": {
      const session: CheckoutSession = {
        id: `checkout-${Date.now()}`,
        cartId: action.payload.cartId,
        userId: action.payload.userId,
        customerInfo: DEFAULT_CUSTOMER_INFO,
        currentStep: "customer-info",
        completedSteps: [],
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };

      return {
        ...state,
        session,
        currentStep: "customer-info",
        completedSteps: [],
        errors: {},
      };
    }

    case "SET_CUSTOMER_INFO": {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          customerInfo: action.payload,
        },
        errors: {}, // Clear errors when data is updated
      };
    }

    case "SET_SHIPPING_ADDRESS": {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          shippingAddress: action.payload,
        },
        errors: {},
      };
    }

    case "SET_BILLING_ADDRESS": {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          billingAddress: action.payload || undefined,
        },
        errors: {},
      };
    }

    case "SET_SHIPPING_METHOD": {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          shippingMethodId: action.payload,
        },
        errors: {},
      };
    }

    case "SET_PAYMENT_METHOD": {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          paymentMethodId: action.payload,
        },
        errors: {},
      };
    }

    case "SET_CUSTOMER_NOTES": {
      if (!state.session) return state;

      return {
        ...state,
        session: {
          ...state.session,
          customerNotes: action.payload,
        },
      };
    }

    case "GO_TO_STEP": {
      if (!state.session) return state;

      return {
        ...state,
        currentStep: action.payload,
        session: {
          ...state.session,
          currentStep: action.payload,
        },
        errors: {}, // Clear errors when navigating
      };
    }

    case "GO_TO_NEXT_STEP": {
      if (!state.session) return state;

      const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
      if (currentIndex >= 0 && currentIndex < CHECKOUT_STEPS.length - 1) {
        const nextStep = CHECKOUT_STEPS[currentIndex + 1];
        return {
          ...state,
          currentStep: nextStep,
          session: {
            ...state.session,
            currentStep: nextStep,
          },
          errors: {},
        };
      }

      return state;
    }

    case "GO_TO_PREVIOUS_STEP": {
      if (!state.session) return state;

      const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
      if (currentIndex > 0) {
        const previousStep = CHECKOUT_STEPS[currentIndex - 1];
        return {
          ...state,
          currentStep: previousStep,
          session: {
            ...state.session,
            currentStep: previousStep,
          },
          errors: {},
        };
      }

      return state;
    }

    case "COMPLETE_STEP": {
      if (!state.session) return state;

      const step = action.payload;
      const isAlreadyCompleted = state.completedSteps.includes(step);

      if (!isAlreadyCompleted) {
        const newCompletedSteps = [...state.completedSteps, step];

        return {
          ...state,
          completedSteps: newCompletedSteps,
          session: {
            ...state.session,
            completedSteps: newCompletedSteps,
          },
        };
      }

      return state;
    }

    case "SET_ERRORS": {
      return {
        ...state,
        errors: action.payload,
      };
    }

    case "CLEAR_ERRORS": {
      return {
        ...state,
        errors: {},
      };
    }

    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case "RESET_CHECKOUT": {
      return {
        session: null,
        currentStep: "customer-info",
        completedSteps: [],
        errors: {},
        isLoading: false,
      };
    }

    default:
      return state;
  }
}

// 🪝 HOOK
// =======

export function useCheckoutState(
  initialCartId?: string,
  initialUserId?: string
): UseCheckoutStateReturn {
  const [state, dispatch] = useReducer(checkoutStateReducer, {
    session: null,
    currentStep: "customer-info",
    completedSteps: [],
    errors: {},
    isLoading: false,
  });

  // Initialize session if cart ID is provided
  React.useEffect(() => {
    if (initialCartId && !state.session) {
      dispatch({
        type: "INITIALIZE_SESSION",
        payload: { cartId: initialCartId, userId: initialUserId },
      });
    }
  }, [initialCartId, initialUserId, state.session]);

  // 🎯 NAVIGATION HELPERS
  // ====================

  const canProceedToNext = useMemo(() => {
    if (!state.session) return false;

    // Validate current step before allowing to proceed
    const validation = validateCheckoutStep(state.currentStep, state.session);
    return validation.isValid;
  }, [state.session, state.currentStep]);

  const canGoBack = useMemo(() => {
    const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
    return currentIndex > 0;
  }, [state.currentStep]);

  // 🎯 ACTION CREATORS
  // ==================

  const setCustomerInfo = useCallback((info: CustomerInfo) => {
    dispatch({ type: "SET_CUSTOMER_INFO", payload: info });
  }, []);

  const setShippingAddress = useCallback((address: Address) => {
    dispatch({ type: "SET_SHIPPING_ADDRESS", payload: address });

    // Auto-complete the shipping address step
    dispatch({ type: "COMPLETE_STEP", payload: "shipping-address" });
  }, []);

  const setBillingAddress = useCallback((address: Address | null) => {
    dispatch({ type: "SET_BILLING_ADDRESS", payload: address });
  }, []);

  const setShippingMethod = useCallback((methodId: string) => {
    dispatch({ type: "SET_SHIPPING_METHOD", payload: methodId });

    // Auto-complete the shipping method step
    dispatch({ type: "COMPLETE_STEP", payload: "shipping-method" });
  }, []);

  const setPaymentMethod = useCallback((methodId: string) => {
    dispatch({ type: "SET_PAYMENT_METHOD", payload: methodId });

    // Auto-complete the payment method step
    dispatch({ type: "COMPLETE_STEP", payload: "payment-method" });
  }, []);

  const setCustomerNotes = useCallback((notes: string) => {
    dispatch({ type: "SET_CUSTOMER_NOTES", payload: notes });
  }, []);

  const goToStep = useCallback((step: CheckoutStep) => {
    dispatch({ type: "GO_TO_STEP", payload: step });
  }, []);

  const goToNextStep = useCallback(() => {
    if (!canProceedToNext) {
      // Validate current step and show errors
      if (state.session) {
        const validation = validateCheckoutStep(
          state.currentStep,
          state.session
        );
        if (!validation.isValid) {
          dispatch({ type: "SET_ERRORS", payload: validation.errors });
          return;
        }
      }
    }

    // Complete current step before proceeding
    dispatch({ type: "COMPLETE_STEP", payload: state.currentStep });
    dispatch({ type: "GO_TO_NEXT_STEP" });
  }, [canProceedToNext, state.currentStep, state.session]);

  const goToPreviousStep = useCallback(() => {
    if (canGoBack) {
      dispatch({ type: "GO_TO_PREVIOUS_STEP" });
    }
  }, [canGoBack]);

  const resetCheckout = useCallback(() => {
    dispatch({ type: "RESET_CHECKOUT" });
  }, []);

  // 🔄 AUTO-SAVE (TODO: Implement session persistence)
  // ==================================================

  React.useEffect(() => {
    if (state.session) {
      // TODO: Auto-save session to localStorage or server
      console.log("💾 [CHECKOUT STATE] Session updated:", {
        sessionId: state.session.id,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps.length,
      });
    }
  }, [state.session, state.currentStep, state.completedSteps]);

  return {
    session: state.session,
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
    canProceedToNext,
    canGoBack,
    isLoading: state.isLoading,
    errors: state.errors,

    // Actions
    setCustomerInfo,
    setShippingAddress,
    setBillingAddress,
    setShippingMethod,
    setPaymentMethod,
    setCustomerNotes,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    resetCheckout,
  };
}

// Add React import at the top
import React from "react";
