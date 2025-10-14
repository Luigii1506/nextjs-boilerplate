/**
 * 💳 OPTIMIZED CHECKOUT TAB - AMAZON-STYLE FAST CHECKOUT
 * ========================================================
 *
 * Super fast checkout flow leveraging:
 * - Pre-filled user data from auth
 * - Saved addresses from address feature
 * - Combined steps for faster completion
 * - Express checkout option
 *
 * @version 2.0.0 - Optimized for Speed
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCheckoutContext,
} from "@/features/storefront/checkout";
import { useCartContext } from "@/features/storefront/cart";
import {
  ShoppingCart,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  Plus,
  Zap,
} from "lucide-react";
import { StripeElementsWrapper, StripePaymentForm } from "@/core/payments";
import {
  createCheckoutPaymentIntentAction,
  confirmPaymentIntentAction,
} from "@/features/storefront/checkout/server/actions";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAddresses } from "@/features/storefront/addresses";
import type { Address } from "@/features/storefront/addresses";
import { usePaymentMethods } from "@/features/storefront/payment-methods";
import { cn } from "@/lib/utils";

export interface CheckoutTabProps {
  className?: string;
  onReturnToStore?: () => void;
  onViewOrder?: (orderId: string) => void;
}

export function CheckoutTab({
  className = "",
  onReturnToStore,
  onViewOrder,
}: CheckoutTabProps) {
  const queryClient = useQueryClient();
  const { refreshCart } = useCartContext();
  const { user, isAuthenticated } = useAuth();
  const { data: addressesData } = useAddresses();
  const { data: paymentMethodsData } = usePaymentMethods();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "payment" | "processing" | "completed">("review");

  const {
    cart,
    calculation,
    isCreatingOrder,
    createOrder,
    setCustomerInfo,
    setShippingAddress,
    setShippingMethod,
    shippingMethods,
  } = useCheckoutContext();

  const addresses = useMemo(() => addressesData?.addresses || [], [addressesData?.addresses]);
  const defaultAddress = addressesData?.defaultAddress;
  const paymentMethods = useMemo(() => paymentMethodsData?.paymentMethods || [], [paymentMethodsData?.paymentMethods]);
  const defaultPaymentMethod = paymentMethodsData?.defaultPaymentMethod;

  // 🚀 Auto-fill customer info from auth
  useEffect(() => {
    if (isAuthenticated && user) {
      const [firstName, ...lastNameParts] = (user.name || "").split(" ");
      setCustomerInfo({
        email: user.email,
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
      });
    }
  }, [isAuthenticated, user, setCustomerInfo]);

  // 🚀 Auto-select default address
  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
      mapAddressToShipping(defaultAddress);
    }
  }, [defaultAddress, selectedAddressId]);

  // 🚀 Auto-select cheapest shipping method
  useEffect(() => {
    if (shippingMethods.length > 0) {
      const cheapest = shippingMethods.reduce((prev, current) =>
        prev.price < current.price ? prev : current
      );
      setShippingMethod(cheapest.id);
    }
  }, [shippingMethods, setShippingMethod]);

  // 🚀 Auto-select default payment method
  useEffect(() => {
    if (defaultPaymentMethod && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(defaultPaymentMethod.id);
      setUseNewCard(false);
    } else if (paymentMethods.length === 0) {
      setUseNewCard(true);
    }
  }, [defaultPaymentMethod, selectedPaymentMethodId, paymentMethods.length]);

  const mapAddressToShipping = (address: Address) => {
    setShippingAddress({
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.street,
      addressLine2: address.street2 || undefined,
      city: address.city,
      state: address.state,
      postalCode: address.zipCode,
      country: address.country,
    });
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address.id);
    mapAddressToShipping(address);
  };

  // Check if ready for express checkout
  const isReadyForExpressCheckout = useMemo(() => {
    return (
      isAuthenticated &&
      selectedAddressId &&
      shippingMethods.length > 0 &&
      (selectedPaymentMethodId || useNewCard) &&
      cart?.items && cart.items.length > 0
    );
  }, [isAuthenticated, selectedAddressId, shippingMethods, selectedPaymentMethodId, useNewCard, cart]);

  // Create payment intent when moving to payment step
  useEffect(() => {
    if (checkoutStep === "payment" && !paymentClientSecret && calculation?.total) {
      const initializePayment = async () => {
        setIsCreatingPaymentIntent(true);
        setPaymentError(null);

        try {
          const totalInDollars = calculation.total / 100;

          // Get Stripe Customer ID from selected payment method if available
          const selectedPM = selectedPaymentMethodId
            ? paymentMethods.find(pm => pm.id === selectedPaymentMethodId)
            : null;
          const stripeCustomerId = selectedPM?.stripeCustomerId || undefined;

          console.log("🔍 [CheckoutTab] Creating Payment Intent with:", {
            totalInDollars,
            cartId: cart?.id,
            cartType: typeof cart?.id,
            fullCart: cart,
            userId: user?.id,
            customerEmail: user?.email,
            stripeCustomerId,
            selectedPaymentMethodId,
            hasSelectedPM: !!selectedPM,
            selectedPMData: selectedPM ? {
              id: selectedPM.id,
              stripePaymentMethodId: selectedPM.stripePaymentMethodId,
              stripeCustomerId: selectedPM.stripeCustomerId,
              brand: selectedPM.brand,
              last4: selectedPM.last4,
            } : null,
          });

          const result = await createCheckoutPaymentIntentAction(
            totalInDollars,
            "usd",
            {
              cartId: cart?.id,
              userId: user?.id,
              customerEmail: user?.email,
              stripeCustomerId,
            }
          );

          console.log("📥 [CheckoutTab] Payment Intent result:", {
            success: result.success,
            hasClientSecret: !!result.clientSecret,
            hasPaymentIntentId: !!result.paymentIntentId,
            paymentIntentId: result.paymentIntentId,
            error: result.error,
          });

          if (result.success && result.clientSecret) {
            setPaymentClientSecret(result.clientSecret);
            setPaymentIntentId(result.paymentIntentId || null);
          } else {
            setPaymentError(result.error || "Failed to initialize payment");
          }
        } catch (error) {
          console.error("Error creating payment intent:", error);
          setPaymentError("Failed to initialize payment");
        } finally {
          setIsCreatingPaymentIntent(false);
        }
      };

      initializePayment();
    }
  }, [checkoutStep, paymentClientSecret, calculation, cart, user, selectedPaymentMethodId, paymentMethods]);

  // Empty cart check
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={cn("max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Agrega productos para continuar con la compra
          </p>
          {onReturnToStore && (
            <button
              onClick={onReturnToStore}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar Comprando
            </button>
          )}
        </div>
      </div>
    );
  }

  // Completed state
  if (checkoutStep === "completed") {
    const isWebhookProcessing = createdOrderId === "webhook-processing";

    return (
      <div className={cn("max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
          <div className="text-green-600 mb-6">
            <CheckCircle className="w-24 h-24 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {isWebhookProcessing ? "¡Pago Exitoso!" : "¡Pedido Completado!"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            {isWebhookProcessing
              ? "Tu pago ha sido procesado exitosamente. Tu pedido está siendo preparado."
              : "Gracias por tu compra. Tu pedido ha sido procesado exitosamente."}
          </p>
          {isWebhookProcessing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
                ✅ Pago Confirmado
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Recibirás un correo de confirmación con los detalles de tu pedido en breve.
                Puedes ver tu pedido en la sección &ldquo;Mis Pedidos&rdquo;.
              </p>
            </div>
          )}
          {createdOrderId && !isWebhookProcessing && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Número de pedido:{" "}
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                {createdOrderId}
              </span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {createdOrderId && !isWebhookProcessing && onViewOrder && (
              <button
                onClick={() => onViewOrder(createdOrderId)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Ver Detalles del Pedido
              </button>
            )}
            {isWebhookProcessing && (
              <button
                onClick={() => {
                  // Navigate to orders page
                  if (onReturnToStore) {
                    onReturnToStore();
                  }
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Ver Mis Pedidos
              </button>
            )}
            {onReturnToStore && (
              <button
                onClick={() => {
                  // Clear all checkout state
                  setCheckoutStep("review");
                  setCreatedOrderId(null);
                  setPaymentClientSecret(null);
                  setPaymentIntentId(null);
                  setPaymentError(null);
                  // Force cart refresh to ensure UI is in sync
                  refreshCart();
                  onReturnToStore();
                }}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Continuar Comprando
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Processing state - Full screen overlay to prevent any interaction
  if (checkoutStep === "processing") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md mx-4">
          {/* Animated spinner */}
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse">
                <CreditCard className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Procesando tu Pago
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            Por favor no cierres esta ventana ni presiones el botón de retroceso
          </p>

          {/* Progress steps */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Confirmando con Stripe...</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Creando tu pedido...</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Preparando confirmación...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout UI
  return (
    <div className={cn("max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {checkoutStep === "review" ? "Revisa y confirma tu pedido" : "Completa tu pago"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {checkoutStep === "review" ? (
            <>
              {/* Shipping Address Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Dirección de Envío
                    </h3>
                  </div>
                  {addresses.length > 0 && (
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva Dirección
                    </button>
                  )}
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No tienes direcciones guardadas
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Agregar dirección
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleAddressSelect(address)}
                        className={cn(
                          "border-2 rounded-lg p-4 cursor-pointer transition-all",
                          selectedAddressId === address.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {address.label && (
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {address.label}
                                </span>
                              )}
                              {address.isDefault && (
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {address.street}
                              {address.street2 && `, ${address.street2}`}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                          {selectedAddressId === address.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipping Method Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Método de Envío
                  </h3>
                </div>

                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setShippingMethod(method.id)}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {method.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {method.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {method.estimatedDays} días hábiles
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          ${(method.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Método de Pago
                    </h3>
                  </div>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      No tienes tarjetas guardadas
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ingresarás los datos de tu tarjeta en el siguiente paso
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Saved Cards */}
                    {paymentMethods.map((pm) => {
                      const isExpired = new Date(pm.expiryYear, pm.expiryMonth) < new Date();
                      return (
                        <div
                          key={pm.id}
                          onClick={() => {
                            if (!isExpired) {
                              setSelectedPaymentMethodId(pm.id);
                              setUseNewCard(false);
                            }
                          }}
                          className={cn(
                            "border-2 rounded-lg p-4 transition-all",
                            isExpired
                              ? "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:border-gray-300",
                            selectedPaymentMethodId === pm.id && !useNewCard
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-xs font-mono">
                                💳
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                    {pm.brand}
                                  </span>
                                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                                    •••• {pm.last4}
                                  </span>
                                  {pm.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                      Predeterminada
                                    </span>
                                  )}
                                  {isExpired && (
                                    <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                                      Vencida
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Vence {String(pm.expiryMonth).padStart(2, "0")}/{pm.expiryYear}
                                </p>
                              </div>
                            </div>
                            {selectedPaymentMethodId === pm.id && !useNewCard && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Use New Card Option */}
                    <div
                      onClick={() => {
                        setUseNewCard(true);
                        setSelectedPaymentMethodId(null);
                      }}
                      className={cn(
                        "border-2 rounded-lg p-4 cursor-pointer transition-all",
                        useNewCard
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Usar una tarjeta nueva
                          </span>
                        </div>
                        {useNewCard && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Express Checkout Button */}
              {isReadyForExpressCheckout && (
                <button
                  onClick={() => setCheckoutStep("payment")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  Continuar al Pago
                </button>
              )}
            </>
          ) : (
            /* Payment Section */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPaymentMethodId && !useNewCard ? "Confirmar Pago" : "Información de Pago"}
                  </h3>
                </div>
                <button
                  onClick={() => setCheckoutStep("review")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ← Volver
                </button>
              </div>

              {/* Paying with saved card */}
              {selectedPaymentMethodId && !useNewCard ? (
                (() => {
                  const selectedPM = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);
                  if (!selectedPM) return null;

                  return (
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                          Pagarás con tu tarjeta guardada:
                        </p>
                        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-xs font-mono">
                            💳
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                {selectedPM.brand}
                              </span>
                              <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                                •••• {selectedPM.last4}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Vence {String(selectedPM.expiryMonth).padStart(2, "0")}/{selectedPM.expiryYear}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (!paymentIntentId || !selectedPM?.stripePaymentMethodId) {
                            setPaymentError("Error: Missing payment information");
                            return;
                          }

                          setCheckoutStep("processing");
                          setPaymentError(null);

                          try {
                            console.log("💳 Confirming payment with saved card:", {
                              paymentIntentId,
                              paymentMethodId: selectedPM.stripePaymentMethodId,
                              customerId: selectedPM.stripeCustomerId,
                            });

                            // Confirm payment with Stripe (including customer ID to avoid errors)
                            const result = await confirmPaymentIntentAction(
                              paymentIntentId,
                              selectedPM.stripePaymentMethodId,
                              selectedPM.stripeCustomerId || undefined
                            );

                            if (!result.success) {
                              throw new Error(result.error || "Payment confirmation failed");
                            }

                            console.log("✅ Payment confirmed successfully! Waiting for webhook...");

                            // Start intelligent polling to detect when webhook completes
                            // We poll the cart to check if it's been cleared (signal that webhook finished)
                            const startTime = Date.now();
                            const maxWaitTime = 10000; // 10 seconds max
                            const pollInterval = 500; // Check every 500ms

                            const checkWebhookCompletion = async () => {
                              const elapsed = Date.now() - startTime;

                              // If we've waited too long, show success anyway
                              if (elapsed > maxWaitTime) {
                                console.log("⏱️ Timeout reached, showing success screen");
                                setCreatedOrderId("webhook-processing");
                                setCheckoutStep("completed");
                                queryClient.invalidateQueries({ queryKey: ["cart"] });
                                queryClient.invalidateQueries({ queryKey: ["orders"] });
                                refreshCart();
                                return;
                              }

                              // Force refetch the cart to get latest data
                              await queryClient.refetchQueries({ queryKey: ["cart"] });

                              // Check if cart is empty (webhook cleared it)
                              const cartData = queryClient.getQueryData(["cart"]) as { data?: { items?: unknown[] } } | undefined;
                              const itemsCount = cartData?.data?.items?.length || 0;

                              console.log("🔍 Polling cart status:", {
                                elapsed: `${elapsed}ms`,
                                itemsCount,
                              });

                              if (itemsCount === 0) {
                                // Cart is empty! Webhook completed successfully
                                console.log("🎉 Webhook completed! Cart is empty. Showing success screen.");
                                setCreatedOrderId("webhook-processing");
                                setCheckoutStep("completed");
                                queryClient.invalidateQueries({ queryKey: ["orders"] });
                                refreshCart();
                                return;
                              }

                              // Cart still has items, keep polling
                              setTimeout(checkWebhookCompletion, pollInterval);
                            };

                            // Start polling after a brief delay (webhook needs time to receive event)
                            setTimeout(checkWebhookCompletion, pollInterval);
                          } catch (error) {
                            console.error("❌ Error processing payment:", error);
                            setCheckoutStep("payment");
                            setPaymentError(
                              error instanceof Error
                                ? error.message
                                : "Error al procesar el pago"
                            );
                          }
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                      >
                        <CreditCard className="w-6 h-6" />
                        Confirmar y Pagar ${calculation?.total ? (calculation.total / 100).toFixed(2) : "0.00"}
                      </button>
                    </div>
                  );
                })()
              ) : (
                /* Paying with new card */
                <>
                  {isCreatingPaymentIntent ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Inicializando pago seguro...
                      </p>
                    </div>
                  ) : paymentError || !paymentClientSecret ? (
                    <div className="text-center py-8">
                      <div className="text-red-500 mb-4">⚠️</div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {paymentError || "Error al inicializar el pago"}
                      </p>
                      <button
                        onClick={() => {
                          setPaymentError(null);
                          setPaymentClientSecret(null);
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Intentar de Nuevo
                      </button>
                    </div>
                  ) : (
                    <StripeElementsWrapper
                      clientSecret={paymentClientSecret}
                      amount={calculation?.total ? calculation.total / 100 : 0}
                      currency="usd"
                    >
                      <StripePaymentForm
                        amount={calculation?.total ? calculation.total / 100 : 0}
                        currency="usd"
                        customerEmail={user?.email}
                        customerName={user?.name}
                        onPaymentSuccess={async (paymentIntentId) => {
                          console.log("✅ Payment succeeded:", paymentIntentId);
                          setCheckoutStep("processing");
                          try {
                            const order = await createOrder();
                            if (order) {
                              setCreatedOrderId(order.id);
                              setCheckoutStep("completed");
                            }
                          } catch (error) {
                            console.error("Order creation failed:", error);
                            setPaymentError(
                              "Pago exitoso pero error al crear el pedido. Contacta soporte."
                            );
                          }
                        }}
                        onPaymentError={(error) => {
                          console.error("❌ Payment failed:", error);
                          setPaymentError(error);
                        }}
                        usePaymentElement={true}
                      />
                    </StripeElementsWrapper>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Resumen del Pedido
            </h3>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.product?.name || "Product"}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${(item.total / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            {calculation && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    ${(calculation.subtotal / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Envío</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    ${(calculation.shipping / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Impuestos</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    ${(calculation.tax / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    ${(calculation.total / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
