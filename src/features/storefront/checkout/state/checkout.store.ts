/**
 * 💳 CHECKOUT STORE (Zustand)
 * ==========================
 *
 * Centralized state and actions for the checkout flow.
 * Replaces CheckoutContext/useCheckoutState with a shared Zustand store
 * while preserving the public API expected by existing components.
 */

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  CHECKOUT_STEPS,
  DEFAULT_CUSTOMER_INFO,
} from "../constants";
import { validateCheckoutStep } from "../schemas";
import {
  createOrderAction,
  calculateOrderAction,
  processPaymentAction,
} from "../server/actions";
import type {
  CheckoutSession,
  CheckoutStep,
  CustomerInfo,
  Address,
  Order,
  OrderCalculation,
  CheckoutMetrics,
  PaymentData,
} from "../types";
import type { CartWithItems } from "@/features/storefront/cart/types";
import type { ProcessPaymentInput } from "../types/api";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCart, useCartMetadata } from "@/features/storefront/cart";

interface CheckoutStoreState {
  session: CheckoutSession | null;
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  errors: Record<string, string>;
  lastError: string | null;

  calculation: OrderCalculation | null;
  metrics: CheckoutMetrics | null;

  isLoading: boolean;
  isCalculating: boolean;
  isCreatingOrder: boolean;
  isProcessingPayment: boolean;
  isHydrated: boolean;
}

interface CheckoutStoreActions {
  setHydrated: (value: boolean) => void;
  initializeSession: (
    cartId: string,
    options?: { userId?: string; sessionId?: string | null }
  ) => void;
  hydrateSession: (options: {
    session: CheckoutSession;
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
  }) => void;

  setCustomerInfo: (info: CustomerInfo) => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setShippingMethod: (methodId: string) => void;
  setPaymentMethod: (methodId: string | null) => void;
  setCustomerNotes: (notes: string) => void;

  goToStep: (step: CheckoutStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  clearErrors: () => void;
  resetCheckout: () => void;

  setCalculation: (calculation: OrderCalculation | null) => void;
  setLastError: (error: string | null) => void;

  calculateOrder: (
    cartId: string,
    sessionId?: string | null,
    shippingAddress?: Address,
    shippingMethodId?: string,
    discountCodes?: string[]
  ) => Promise<OrderCalculation | null>;
  createOrder: (
    session: CheckoutSession,
    cart: CartWithItems
  ) => Promise<Order | null>;
  processPayment: (
    orderId: string,
    paymentMethodId: string,
    paymentData: PaymentData
  ) => Promise<{ success: boolean; error?: string }>;
}

type CheckoutStore = CheckoutStoreState & CheckoutStoreActions;

const initialState: CheckoutStoreState = {
  session: null,
  currentStep: "customer-info",
  completedSteps: [],
  errors: {},
  lastError: null,
  calculation: null,
  metrics: null,
  isLoading: false,
  isCalculating: false,
  isCreatingOrder: false,
  isProcessingPayment: false,
  isHydrated: false,
};

const withUpdatedSession = (
  session: CheckoutSession,
  updates: Partial<CheckoutSession>
) => ({
  ...session,
  ...updates,
});

export const useCheckoutStore = create<CheckoutStore>()(
  devtools((set, get) => ({
    ...initialState,

    setHydrated: (value) =>
      set(() => ({
        isHydrated: value,
      })),

    initializeSession: (cartId, options) =>
      set((state) => {
        const { userId, sessionId } = options ?? {};
        const shouldReset =
          !state.session || state.session.cartId !== cartId;

        if (!shouldReset) {
          return state;
        }

        const session: CheckoutSession = {
          id: `checkout-${Date.now()}`,
          cartId,
          userId,
          sessionId: sessionId ?? undefined,
          customerInfo: { ...DEFAULT_CUSTOMER_INFO },
          currentStep: "customer-info",
          completedSteps: [],
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        };

        return {
          ...state,
          session,
          currentStep: "customer-info",
          completedSteps: [],
          errors: {},
          lastError: null,
          isHydrated: state.isHydrated,
        };
      }),

    hydrateSession: ({ session, currentStep, completedSteps }) =>
      set((state) => ({
        ...state,
        session,
        currentStep,
        completedSteps,
        errors: {},
        isHydrated: true,
      })),

    setCustomerInfo: (info) =>
      set((state) => {
        if (!state.session) return state;
        return {
          ...state,
          session: withUpdatedSession(state.session, {
            customerInfo: info,
          }),
          errors: {},
        };
      }),

    setShippingAddress: (address) =>
      set((state) => {
        if (!state.session) return state;
        return {
          ...state,
          session: withUpdatedSession(state.session, {
            shippingAddress: address,
          }),
          completedSteps: state.completedSteps.includes("shipping-address")
            ? state.completedSteps
            : [...state.completedSteps, "shipping-address"],
          errors: {},
        };
      }),

    setBillingAddress: (address) =>
      set((state) => {
        if (!state.session) return state;
        return {
          ...state,
          session: withUpdatedSession(state.session, {
            billingAddress: address || undefined,
          }),
          errors: {},
        };
      }),

    setShippingMethod: (methodId) =>
      set((state) => {
        if (!state.session) return state;
        return {
          ...state,
          session: withUpdatedSession(state.session, {
            shippingMethodId: methodId,
          }),
          completedSteps: state.completedSteps.includes("shipping-method")
            ? state.completedSteps
            : [...state.completedSteps, "shipping-method"],
          errors: {},
        };
      }),

    setPaymentMethod: (methodId) =>
      set((state) => {
        if (!state.session) return state;
        return {
          ...state,
          session: withUpdatedSession(state.session, {
            paymentMethodId: methodId ?? undefined,
          }),
          completedSteps: state.completedSteps.includes("payment-method")
            ? state.completedSteps
            : [...state.completedSteps, "payment-method"],
          errors: {},
        };
      }),

    setCustomerNotes: (notes) =>
      set((state) => {
        if (!state.session) return state;
        return {
          ...state,
          session: withUpdatedSession(state.session, {
            customerNotes: notes,
          }),
        };
      }),

    goToStep: (step) =>
      set((state) => {
        if (!state.session) return state;
        return {
          ...state,
          currentStep: step,
          session: withUpdatedSession(state.session, {
            currentStep: step,
          }),
          errors: {},
        };
      }),

    goToNextStep: () => {
      const state = get();
      if (!state.session) {
        return;
      }

      const validation = validateCheckoutStep(
        state.currentStep,
        state.session
      );

      if (!validation.isValid) {
        set(() => ({
          errors: validation.errors,
          lastError: "Debe completar la información requerida",
        }));
        return;
      }

      const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
      if (currentIndex >= 0 && currentIndex < CHECKOUT_STEPS.length - 1) {
        const nextStep = CHECKOUT_STEPS[currentIndex + 1];
        set(() => ({
          currentStep: nextStep,
          session: state.session
            ? withUpdatedSession(state.session, {
                currentStep: nextStep,
              })
            : state.session,
          completedSteps: state.completedSteps.includes(state.currentStep)
            ? state.completedSteps
            : [...state.completedSteps, state.currentStep],
          errors: {},
          lastError: null,
        }));
      }
    },

    goToPreviousStep: () => {
      const state = get();
      if (!state.session) return;

      const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
      if (currentIndex > 0) {
        const previousStep = CHECKOUT_STEPS[currentIndex - 1];
        set(() => ({
          currentStep: previousStep,
          session: withUpdatedSession(state.session!, {
            currentStep: previousStep,
          }),
          errors: {},
        }));
      }
    },

    clearErrors: () =>
      set(() => ({
        errors: {},
        lastError: null,
      })),

    resetCheckout: () =>
      set(() => ({
        ...initialState,
        isHydrated: true, // keep hydration flag to avoid re-hydrating immediately
      })),

    setCalculation: (calculation) =>
      set(() => ({
        calculation,
      })),

    setLastError: (error) =>
      set(() => ({
        lastError: error,
      })),

    calculateOrder: async (
      cartId,
      sessionId,
      shippingAddress,
      shippingMethodId,
      discountCodes
    ) => {
      set(() => ({ isCalculating: true }));
      try {
        const response = await calculateOrderAction({
          cartId,
          sessionId,
          shippingAddress,
          shippingMethodId,
          discountCodes,
        });

        if (response.success && response.data) {
          set(() => ({ calculation: response.data, lastError: null }));
          return response.data;
        }

        const errorMessage = response.error || "No se pudo calcular el pedido";
        set(() => ({ lastError: errorMessage }));
        return null;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error calculando el pedido";
        set(() => ({ lastError: message }));
        console.error("❌ [CHECKOUT STORE] calculateOrder failed:", error);
        return null;
      } finally {
        set(() => ({ isCalculating: false }));
      }
    },

    createOrder: async (session, cart) => {
      set(() => ({ isCreatingOrder: true }));

      try {
        const response = await createOrderAction({
          cartId: session.cartId,
          userId: session.userId,
          sessionId: session.sessionId,
          customerInfo: session.customerInfo,
          shippingAddress: session.shippingAddress!,
          billingAddress: session.billingAddress,
          shippingMethodId: session.shippingMethodId!,
          paymentMethodId: session.paymentMethodId!,
          customerNotes: session.customerNotes,
        });

        if (response.success && response.data) {
          set((state) => ({
            lastError: null,
            currentStep: "processing",
            session: state.session
              ? withUpdatedSession(state.session, {
                  currentStep: "processing",
                })
              : state.session,
          }));
          return response.data;
        }

        const errorMessage = response.error || "No se pudo crear la orden";
        set(() => ({ lastError: errorMessage }));
        return null;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error creando la orden";
        set(() => ({ lastError: message }));
        console.error("❌ [CHECKOUT STORE] createOrder failed:", error);
        return null;
      } finally {
        set(() => ({ isCreatingOrder: false }));
      }
    },

    processPayment: async (orderId, paymentMethodId, paymentData) => {
      set(() => ({ isProcessingPayment: true }));

      const input: ProcessPaymentInput = {
        orderId,
        paymentMethodId,
        paymentData,
      };

      try {
        const response = await processPaymentAction(input);

        if (response.success) {
          set(() => ({ lastError: null }));
          return { success: true };
        }

        const errorMessage = response.error || "Pago rechazado";
        set(() => ({ lastError: errorMessage }));
        return { success: false, error: errorMessage };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error procesando el pago";
        set(() => ({ lastError: message }));
        console.error("❌ [CHECKOUT STORE] processPayment failed:", error);
        return { success: false, error: message };
      } finally {
        set(() => ({ isProcessingPayment: false }));
      }
    },
  }))
);

// -----------------------------
// SELECTOR HOOKS
// -----------------------------

export const useCheckoutState = () =>
  useCheckoutStore((state) => ({
    session: state.session,
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
    errors: state.errors,
    lastError: state.lastError,
    calculation: state.calculation,
    metrics: state.metrics,
    isLoading: state.isLoading,
    isCalculating: state.isCalculating,
    isCreatingOrder: state.isCreatingOrder,
    isProcessingPayment: state.isProcessingPayment,
  }));

export const useCheckoutActions = () => {
  const initializeSession = useCheckoutStore((state) => state.initializeSession);
  const hydrateSession = useCheckoutStore((state) => state.hydrateSession);
  const setCustomerInfo = useCheckoutStore((state) => state.setCustomerInfo);
  const setShippingAddress = useCheckoutStore(
    (state) => state.setShippingAddress
  );
  const setBillingAddress = useCheckoutStore(
    (state) => state.setBillingAddress
  );
  const setShippingMethod = useCheckoutStore(
    (state) => state.setShippingMethod
  );
  const setPaymentMethod = useCheckoutStore(
    (state) => state.setPaymentMethod
  );
  const setCustomerNotes = useCheckoutStore(
    (state) => state.setCustomerNotes
  );
  const goToStep = useCheckoutStore((state) => state.goToStep);
  const goToNextStep = useCheckoutStore((state) => state.goToNextStep);
  const goToPreviousStep = useCheckoutStore(
    (state) => state.goToPreviousStep
  );
  const clearErrors = useCheckoutStore((state) => state.clearErrors);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const calculateOrder = useCheckoutStore((state) => state.calculateOrder);
  const createOrder = useCheckoutStore((state) => state.createOrder);
  const processPayment = useCheckoutStore((state) => state.processPayment);
  const setCalculation = useCheckoutStore((state) => state.setCalculation);
  const setLastError = useCheckoutStore((state) => state.setLastError);
  const setHydrated = useCheckoutStore((state) => state.setHydrated);

  return useMemo(
    () => ({
      initializeSession,
      hydrateSession,
      setCustomerInfo,
      setShippingAddress,
      setBillingAddress,
      setShippingMethod,
      setPaymentMethod,
      setCustomerNotes,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      clearErrors,
      resetCheckout,
      calculateOrder,
      createOrder,
      processPayment,
      setCalculation,
      setLastError,
      setHydrated,
    }),
    [
      calculateOrder,
      clearErrors,
      createOrder,
      goToNextStep,
      goToPreviousStep,
      goToStep,
      hydrateSession,
      initializeSession,
      processPayment,
      resetCheckout,
      setBillingAddress,
      setCalculation,
      setCustomerInfo,
      setCustomerNotes,
      setHydrated,
      setLastError,
      setPaymentMethod,
      setShippingAddress,
      setShippingMethod,
    ]
  );
};

export const useCheckout = () => {
  const state = useCheckoutState();
  const actions = useCheckoutActions();
  const { cart, summary, items, totalAmount } = useCart();
  const metadata = useCartMetadata();

  const {
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
    calculateOrder: calculateOrderRaw,
    createOrder: createOrderRaw,
    processPayment: processPaymentRaw,
    setLastError,
    clearErrors,
  } = actions;

  const availableShippingMethods = useMemo(
    () => SHIPPING_METHODS.filter((method) => method.isActive),
    []
  );

  const availablePaymentMethods = useMemo(
    () => PAYMENT_METHODS.filter((method) => method.enabled),
    []
  );

  const selectedShippingMethod = useMemo(() => {
    if (!state.session?.shippingMethodId) return null;
    return (
      availableShippingMethods.find(
        (method) => method.id === state.session?.shippingMethodId
      ) || null
    );
  }, [availableShippingMethods, state.session?.shippingMethodId]);

  const selectedPaymentMethod = useMemo(() => {
    if (!state.session?.paymentMethodId) return null;
    return (
      availablePaymentMethods.find(
        (method) => method.id === state.session?.paymentMethodId
      ) || null
    );
  }, [availablePaymentMethods, state.session?.paymentMethodId]);

  const canProceedToNext = useMemo(() => {
    if (!state.session) return false;
    const validation = validateCheckoutStep(state.currentStep, state.session);
    return validation.isValid;
  }, [state.currentStep, state.session]);

  const canGoBack = useMemo(() => {
    const currentIndex = CHECKOUT_STEPS.indexOf(state.currentStep);
    return currentIndex > 0;
  }, [state.currentStep]);

  const calculateOrder = useCallback(
    async (discountCodes: string[] = []) => {
      const targetCartId = cart?.id ?? metadata.cartId;
      if (!targetCartId) {
        setLastError("No hay carrito activo para calcular.");
        return null;
      }

      return calculateOrderRaw(
        targetCartId,
        metadata.sessionId ?? cart?.sessionId ?? undefined,
        state.session?.shippingAddress,
        state.session?.shippingMethodId,
        discountCodes
      );
    },
    [
      cart,
      calculateOrderRaw,
      metadata.cartId,
      metadata.sessionId,
      setLastError,
      state.session,
    ]
  );

  const createOrder = useCallback(async () => {
    if (!state.session) {
      setLastError("La sesión de checkout no está inicializada.");
      return null;
    }

    if (!cart) {
      setLastError("No hay carrito activo.");
      return null;
    }

    if (
      !state.session.shippingAddress ||
      !state.session.shippingMethodId ||
      !state.session.paymentMethodId
    ) {
      setLastError("Completa la información del checkout antes de continuar.");
      return null;
    }

    return createOrderRaw(state.session, cart);
  }, [cart, createOrderRaw, setLastError, state.session]);

  const processPayment = useCallback(
    async (orderId: string, paymentMethodId: string, paymentData: PaymentData) =>
      processPaymentRaw(orderId, paymentMethodId, paymentData),
    [processPaymentRaw]
  );

  const clearError = useCallback(() => setLastError(null), [setLastError]);

  return useMemo(
    () => ({
      session: state.session,
      cart,
      items,
      summary,
      totalAmount,
      calculation: state.calculation,
      metrics: state.metrics,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      errors: state.errors,
      lastError: state.lastError,
      isLoading: state.isLoading,
      isCalculating: state.isCalculating,
      isCreatingOrder: state.isCreatingOrder,
      isProcessingPayment: state.isProcessingPayment,
      shippingMethods: availableShippingMethods,
      selectedShippingMethod,
      paymentMethods: availablePaymentMethods,
      selectedPaymentMethod,
      canProceedToNext,
      canGoBack,
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
      calculateOrder,
      createOrder,
      processPayment,
      clearError,
      clearErrors,
    }),
    [
      availablePaymentMethods,
      availableShippingMethods,
      calculateOrder,
      canGoBack,
      canProceedToNext,
      cart,
      clearError,
      clearErrors,
      createOrder,
      goToNextStep,
      goToPreviousStep,
      goToStep,
      items,
      processPayment,
      resetCheckout,
      selectedPaymentMethod,
      selectedShippingMethod,
      setBillingAddress,
      setCustomerInfo,
      setCustomerNotes,
      setPaymentMethod,
      setShippingAddress,
      setShippingMethod,
      state,
      summary,
      totalAmount,
    ]
  );
};

// -----------------------------
// INITIALIZER & PERSISTENCE
// -----------------------------

export const useCheckoutInitializer = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  const metadata = useCartMetadata();
  const {
    initializeSession,
    hydrateSession,
    setHydrated,
  } = useCheckoutActions();
  const { session, currentStep, completedSteps, isHydrated } = useCheckoutStore(
    (state) => ({
      session: state.session,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      isHydrated: state.isHydrated,
    })
  );

  const cartId = cart?.id ?? metadata.cartId ?? null;

  // Hydrate from localStorage when cartId changes
  useEffect(() => {
    if (!cartId || isHydrated === true) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(
      `checkout-session-${cartId}`
    );

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<CheckoutSession> & {
          currentStep?: CheckoutStep;
          completedSteps?: CheckoutStep[];
        };

        if (parsed && parsed.cartId === cartId) {
          const hydratedSession: CheckoutSession = {
            id:
              typeof parsed.id === "string" && parsed.id.length > 0
                ? parsed.id
                : `checkout-${Date.now()}`,
            cartId,
            userId: parsed.userId,
            sessionId: parsed.sessionId,
            customerInfo: {
              ...DEFAULT_CUSTOMER_INFO,
              ...(parsed.customerInfo ?? {}),
            },
            shippingAddress: parsed.shippingAddress,
            billingAddress: parsed.billingAddress,
            shippingMethodId: parsed.shippingMethodId,
            paymentMethodId: parsed.paymentMethodId,
            customerNotes: parsed.customerNotes,
            currentStep: parsed.currentStep ?? "customer-info",
            completedSteps: Array.isArray(parsed.completedSteps)
              ? (parsed.completedSteps as CheckoutStep[])
              : [],
            startedAt: parsed.startedAt ? new Date(parsed.startedAt) : new Date(),
            expiresAt: parsed.expiresAt
              ? new Date(parsed.expiresAt)
              : new Date(Date.now() + 30 * 60 * 1000),
          };

          hydrateSession({
            session: hydratedSession,
            currentStep: hydratedSession.currentStep,
            completedSteps: hydratedSession.completedSteps,
          });
          setHydrated(true);
          return;
        }
      } catch (error) {
        console.warn("⚠️ [CHECKOUT STORE] Failed to hydrate session:", error);
      }
    }

    initializeSession(cartId, {
      userId: user?.id,
      sessionId: metadata.sessionId,
    });
    setHydrated(true);
  }, [cartId, hydrateSession, initializeSession, isHydrated, metadata.sessionId, setHydrated, user?.id]);

  // Persist session to localStorage when it changes
  useEffect(() => {
    if (!cartId || !session || typeof window === "undefined") {
      return;
    }

    const snapshot = {
      ...session,
      currentStep,
      completedSteps,
    };

    try {
      window.localStorage.setItem(
        `checkout-session-${cartId}`,
        JSON.stringify(snapshot)
      );
    } catch (error) {
      console.warn("⚠️ [CHECKOUT STORE] Failed to persist session:", error);
    }
  }, [cartId, completedSteps, currentStep, session]);
};
