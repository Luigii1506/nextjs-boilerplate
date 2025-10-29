/**
 * 💳 CHECKOUT TAB (Zustand Optimised)
 * ==================================
 *
 * Breaks the checkout coordinator into memoised subcomponents that subscribe
 * to the Zustand checkout store with shallow selectors. This drastically
 * reduces rerenders compared with el antiguo CheckoutContext monolítico.
 */

"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import {
  useCheckoutStore,
  useCheckout,
} from "@/features/storefront/checkout";
import { useCartActions } from "@/features/storefront/cart";
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
import CartSummary from "../../features/cart/components/CartSummary";
import Image from "next/image";

export interface CheckoutTabProps {
  className?: string;
  onReturnToStore?: () => void;
  onViewOrder?: (orderId: string) => void;
}

type SavedPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
  stripePaymentMethodId?: string;
  stripeCustomerId?: string;
};

const checkoutStateSelector = useShallow(
  (state: ReturnType<typeof useCheckoutStore.getState>) => ({
    session: state.session,
    calculation: state.calculation,
    currentStep: state.currentStep,
    isCreatingOrder: state.isCreatingOrder,
    isProcessingPayment: state.isProcessingPayment,
    lastError: state.lastError,
  })
);

const CheckoutEmptyState = memo(
  ({ onReturnToStore, className }: { onReturnToStore?: () => void; className: string }) => (
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
  )
);
CheckoutEmptyState.displayName = "CheckoutEmptyState";

const ProcessingOverlay = memo(() => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md mx-4">
      <div className="relative mb-8">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <CreditCard className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Procesando tu pago
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
        No cierres esta ventana mientras confirmamos la transacción.
      </p>
      <div className="space-y-3 text-left">
        <ProgressBullet color="bg-green-500" label="Confirmando con Stripe" />
        <ProgressBullet color="bg-blue-500" label="Creando tu pedido" />
        <ProgressBullet color="bg-purple-500" label="Preparando confirmación" />
      </div>
    </div>
  </div>
));
ProcessingOverlay.displayName = "ProcessingOverlay";

const ProgressBullet = memo(({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
    <div className={cn("w-2 h-2 rounded-full animate-pulse", color)}></div>
    <span>{label}</span>
  </div>
));
ProgressBullet.displayName = "ProgressBullet";

const CompletionState = memo(
  ({
    createdOrderId,
    isWebhookProcessing,
    onViewOrder,
    onReturnToStore,
    onRestart,
  }: {
    createdOrderId: string | null;
    isWebhookProcessing: boolean;
    onViewOrder?: (orderId: string) => void;
    onReturnToStore?: () => void;
    onRestart: () => void;
  }) => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
        <div className="text-green-600 mb-6">
          <CheckCircle className="w-24 h-24 mx-auto" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {isWebhookProcessing ? "¡Pago exitoso!" : "¡Pedido completado!"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          {isWebhookProcessing
            ? "Tu pago ha sido confirmado. En breve recibirás un correo con tu pedido."
            : "Gracias por tu compra. Hemos procesado tu pedido correctamente."}
        </p>
        {createdOrderId && !isWebhookProcessing && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Número de pedido:
            <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 ml-2">
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
              Ver detalles del pedido
            </button>
          )}
          {onReturnToStore && (
            <button
              onClick={() => {
                onRestart();
                onReturnToStore();
              }}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              Seguir comprando
            </button>
          )}
        </div>
      </div>
    </div>
  )
);
CompletionState.displayName = "CompletionState";

const ShippingAddressSection = memo(
  ({
    addresses,
    selectedAddressId,
    onSelect,
    onAddNew,
  }: {
    addresses: Address[];
    selectedAddressId: string | null;
    onSelect: (address: Address) => void;
    onAddNew: () => void;
  }) => (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Dirección de envío
          </h3>
        </div>
        {addresses.length > 0 && (
          <button
            onClick={onAddNew}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Nueva dirección
          </button>
        )}
      </header>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tienes direcciones guardadas
          </p>
          <button
            onClick={onAddNew}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Agregar dirección
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <article
              key={address.id}
              onClick={() => onSelect(address)}
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
            </article>
          ))}
        </div>
      )}
    </section>
  )
);
ShippingAddressSection.displayName = "ShippingAddressSection";

const ShippingMethodSection = memo(
  ({
    shippingMethods,
    selectedShippingMethodId,
    onSelect,
  }: {
    shippingMethods: { id: string; name: string; description?: string; price: number; estimatedDays?: number }[];
    selectedShippingMethodId?: string | null;
    onSelect: (id: string) => void;
  }) => (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-3">
      <header className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Método de envío
        </h3>
      </header>
      {shippingMethods.map((method) => (
        <article
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={cn(
            "border-2 rounded-lg p-4 cursor-pointer transition-all",
            selectedShippingMethodId === method.id
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {method.name}
              </p>
              {method.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.description}
                </p>
              )}
              {method.estimatedDays && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Entrega estimada en {method.estimatedDays} días
                </p>
              )}
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {method.price === 0 ? "Gratis" : `$${(method.price / 100).toFixed(2)}`}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
);
ShippingMethodSection.displayName = "ShippingMethodSection";

const PaymentMethodSection = memo(
  ({
    paymentMethods,
    selectedPaymentMethodId,
    useNewCard,
    onSelectSaved,
    onSelectNewCard,
  }: {
    paymentMethods: SavedPaymentMethod[];
    selectedPaymentMethodId: string | null;
    useNewCard: boolean;
    onSelectSaved: (method: SavedPaymentMethod) => void;
    onSelectNewCard: () => void;
  }) => (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Método de pago
          </h3>
        </div>
      </header>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No tienes tarjetas guardadas
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresarás tu tarjeta durante el pago
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((pm) => {
            const isExpired = new Date(pm.expiryYear, pm.expiryMonth) < new Date();
            const isSelected = selectedPaymentMethodId === pm.id && !useNewCard;

            return (
              <article
                key={pm.id}
                onClick={() => !isExpired && onSelectSaved(pm)}
                className={cn(
                  "border-2 rounded-lg p-4 transition-all",
                  isExpired
                    ? "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-gray-300",
                  isSelected
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
                  {isSelected && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          <article
            onClick={onSelectNewCard}
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
          </article>
        </div>
      )}
    </section>
  )
);
PaymentMethodSection.displayName = "PaymentMethodSection";

const OrderSummaryColumn = memo(
  ({
    cartItems,
    calculation,
    onProceedToPayment,
    checkoutStep,
  }: {
    cartItems: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      total: number;
      product: {
        name?: string | null;
        images?: string[];
      };
    }>;
    calculation: ReturnType<typeof useCheckout>["calculation"];
    onProceedToPayment: () => void;
    checkoutStep: "review" | "payment" | "processing" | "completed";
  }) => (
    <aside className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 sticky top-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Resumen del pedido
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {cartItems.length} artículos en tu carrito
          </p>
        </div>
      </header>

      <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
              {item.product?.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product?.name || "Producto"}
                  width={64}
                  height={64}
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
                {item.product?.name || "Producto"}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Cantidad: {item.quantity}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ${(item.total / 100).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <CartSummary
        summary={calculation ? {
          itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          uniqueItems: cartItems.length,
          subtotal: calculation.subtotal,
          taxAmount: calculation.tax,
          shippingAmount: calculation.shipping,
          discountAmount: calculation.discount,
          total: calculation.total,
        } : null}
        priceBreakdown={null}
        onCheckout={onProceedToPayment}
        showCouponInput={false}
        showSecurityBadges
        compact
        isProcessingCheckout={checkoutStep === "processing"}
      />
    </aside>
  )
);
OrderSummaryColumn.displayName = "OrderSummaryColumn";

export function CheckoutTab({
  className = "",
  onReturnToStore,
  onViewOrder,
}: CheckoutTabProps) {
  const queryClient = useQueryClient();
  const { refreshCart } = useCartActions();
  const checkoutSelectors = useCheckoutStore(checkoutStateSelector);
  const {
    cart,
    calculation,
    shippingMethods,
    selectedShippingMethod,
    paymentMethods,
    selectedPaymentMethod,
    setCustomerInfo,
    setShippingAddress,
    setShippingMethod,
    setPaymentMethod,
    createOrder,
  } = useCheckout();
  const { user, isAuthenticated } = useAuth();
  const { data: addressesData } = useAddresses();
  const { data: paymentMethodsData } = usePaymentMethods();
  const cartItems = cart?.items ?? [];

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(
    selectedPaymentMethod?.id ?? null
  );
  const [useNewCard, setUseNewCard] = useState(!selectedPaymentMethodId);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "payment" | "processing" | "completed">(
    "review"
  );

  const addresses = useMemo(() => addressesData?.addresses || [], [addressesData?.addresses]);
  const defaultAddress = addressesData?.defaultAddress ?? null;
  const savedPaymentMethods = useMemo(
    () => paymentMethodsData?.paymentMethods || [],
    [paymentMethodsData?.paymentMethods]
  );
  const defaultSavedPaymentMethod = paymentMethodsData?.defaultPaymentMethod ?? null;

  const mapAddressToShipping = useCallback(
    (address: Address) => ({
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.street,
      addressLine2: address.street2 || undefined,
      city: address.city,
      state: address.state,
      postalCode: address.zipCode,
      country: address.country,
    }),
    []
  );

  // Prefill customer info from auth
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

  // Select default address on mount
  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
      setShippingAddress(mapAddressToShipping(defaultAddress));
    }
  }, [defaultAddress, mapAddressToShipping, selectedAddressId, setShippingAddress]);

  // Select cheapest shipping method
  useEffect(() => {
    if (!selectedShippingMethod && shippingMethods.length > 0) {
      const cheapest = shippingMethods.reduce((prev, current) =>
        prev.price < current.price ? prev : current
      );
      setShippingMethod(cheapest.id);
    }
  }, [selectedShippingMethod, setShippingMethod, shippingMethods]);

  // Select default payment method
  useEffect(() => {
    if (defaultSavedPaymentMethod && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(defaultSavedPaymentMethod.id);
      setUseNewCard(false);
      setPaymentMethod(defaultSavedPaymentMethod.id);
    } else if (savedPaymentMethods.length === 0) {
      setUseNewCard(true);
      setPaymentMethod(null);
    }
  }, [
    defaultSavedPaymentMethod,
    savedPaymentMethods.length,
    selectedPaymentMethodId,
    setPaymentMethod,
  ]);

  // Payment intent handling
  useEffect(() => {
    if (checkoutStep !== "payment" || paymentClientSecret || !calculation?.total) {
      return;
    }

    const selectedPM = selectedPaymentMethodId
      ? savedPaymentMethods.find((pm) => pm.id === selectedPaymentMethodId)
      : null;

    const initializePaymentIntent = async () => {
      setIsCreatingPaymentIntent(true);
      setPaymentError(null);

      try {
        const totalInDollars = calculation.total / 100;
        const stripeCustomerId = selectedPM?.stripeCustomerId || undefined;

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

        if (result.success && result.clientSecret) {
          setPaymentClientSecret(result.clientSecret);
          setPaymentIntentId(result.paymentIntentId || null);
        } else {
          setPaymentError(result.error || "No se pudo inicializar el pago");
        }
      } catch (error) {
        console.error("Error creating payment intent", error);
        setPaymentError("No se pudo inicializar el pago");
      } finally {
        setIsCreatingPaymentIntent(false);
      }
    };

    initializePaymentIntent();
  }, [
    calculation?.total,
    cart?.id,
    checkoutStep,
    paymentClientSecret,
    selectedPaymentMethodId,
    savedPaymentMethods,
    user?.email,
    user?.id,
  ]);

  const handleAddressSelect = useCallback(
    (address: Address) => {
      setSelectedAddressId(address.id);
      setShippingAddress(mapAddressToShipping(address));
    },
    [mapAddressToShipping, setShippingAddress]
  );

  const handleSavedPaymentSelect = useCallback(
    (method: SavedPaymentMethod) => {
      setSelectedPaymentMethodId(method.id);
      setUseNewCard(false);
      setPaymentMethod(method.id);
    },
    [setPaymentMethod]
  );

  const handleSelectNewCard = useCallback(() => {
    setUseNewCard(true);
    setSelectedPaymentMethodId(null);
    setPaymentMethod(null);
  }, [setPaymentMethod]);

  const isReadyForExpressCheckout = useMemo(
    () =>
      isAuthenticated &&
      selectedAddressId &&
      shippingMethods.length > 0 &&
      (selectedPaymentMethodId || useNewCard) &&
      cartItems.length > 0,
    [
      cartItems.length,
      isAuthenticated,
      selectedAddressId,
      selectedPaymentMethodId,
      shippingMethods.length,
      useNewCard,
    ]
  );

  const resetCheckoutState = useCallback(() => {
    setCheckoutStep("review");
    setCreatedOrderId(null);
    setPaymentClientSecret(null);
    setPaymentIntentId(null);
    setPaymentError(null);
    refreshCart();
  }, [refreshCart]);

  const confirmPaymentWithSavedCard = useCallback(async () => {
    if (!paymentIntentId || !selectedPaymentMethodId) {
      setPaymentError("Información de pago incompleta");
      return;
    }

    const selectedPM = savedPaymentMethods.find(
      (pm) => pm.id === selectedPaymentMethodId
    );
    if (!selectedPM?.stripePaymentMethodId) {
      setPaymentError("No se pudo obtener la tarjeta seleccionada");
      return;
    }

    setCheckoutStep("processing");
    setPaymentError(null);

    try {
      const result = await confirmPaymentIntentAction(
        paymentIntentId,
        selectedPM.stripePaymentMethodId,
        selectedPM.stripeCustomerId || undefined
      );

      if (!result.success) {
        throw new Error(result.error || "No se pudo confirmar el pago");
      }

      const startTime = Date.now();
      const maxWait = 10000;
      const poll = async () => {
        const elapsed = Date.now() - startTime;
        await queryClient.refetchQueries({ queryKey: ["cart"] });
        const cartData = queryClient.getQueryData(["cart"]) as
          | { data?: { items?: unknown[] } }
          | undefined;
        const itemsCount = cartData?.data?.items?.length || 0;

        if (itemsCount === 0) {
          setCreatedOrderId("webhook-processing");
          setCheckoutStep("completed");
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          refreshCart();
          return;
        }

        if (elapsed > maxWait) {
          setCreatedOrderId("webhook-processing");
          setCheckoutStep("completed");
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          refreshCart();
          return;
        }

        setTimeout(poll, 500);
      };

      setTimeout(poll, 500);
    } catch (error) {
      console.error("Error processing saved card", error);
      setCheckoutStep("payment");
      setPaymentError(
        error instanceof Error ? error.message : "Error procesando el pago"
      );
    }
  }, [paymentIntentId, selectedPaymentMethodId, savedPaymentMethods, queryClient, refreshCart]);

  const handleCreateOrder = useCallback(async () => {
    const order = await createOrder();
    if (order) {
      setCreatedOrderId(order.id);
      setCheckoutStep("completed");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      refreshCart();
    }
  }, [createOrder, queryClient, refreshCart]);

  if (cartItems.length === 0) {
    return <CheckoutEmptyState onReturnToStore={onReturnToStore} className={className} />;
  }

  if (checkoutStep === "processing") {
    return <ProcessingOverlay />;
  }

  if (checkoutStep === "completed") {
    const isWebhookProcessing = createdOrderId === "webhook-processing";
    return (
      <CompletionState
        createdOrderId={createdOrderId}
        isWebhookProcessing={isWebhookProcessing}
        onViewOrder={onViewOrder}
        onReturnToStore={onReturnToStore}
        onRestart={resetCheckoutState}
      />
    );
  }

  return (
    <div className={cn("max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {checkoutStep === "review"
            ? "Revisa y confirma tu pedido"
            : "Completa tu pago"}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {checkoutStep === "review" ? (
            <>
              <ShippingAddressSection
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelect={handleAddressSelect}
                onAddNew={() => {/* TODO: integrar formulario address */}}
              />

              <ShippingMethodSection
                shippingMethods={shippingMethods}
                selectedShippingMethodId={selectedShippingMethod?.id}
                onSelect={setShippingMethod}
              />

              <PaymentMethodSection
                paymentMethods={savedPaymentMethods}
                selectedPaymentMethodId={selectedPaymentMethodId}
                useNewCard={useNewCard}
                onSelectSaved={handleSavedPaymentSelect}
                onSelectNewCard={handleSelectNewCard}
              />

              {isReadyForExpressCheckout && (
                <button
                  onClick={() => setCheckoutStep("payment")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  Continuar al pago
                </button>
              )}
            </>
          ) : (
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPaymentMethodId && !useNewCard
                      ? "Confirmar pago"
                      : "Información de pago"}
                  </h3>
                </div>
                <button
                  onClick={() => setCheckoutStep("review")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ← Volver
                </button>
              </div>

              {selectedPaymentMethodId && !useNewCard ? (
                <SavedCardPayment
                  paymentIntentId={paymentIntentId}
                  selectedPaymentMethodId={selectedPaymentMethodId}
                  paymentMethods={savedPaymentMethods}
                  onConfirm={confirmPaymentWithSavedCard}
                  paymentError={paymentError}
                  isProcessing={checkoutSelectors.isProcessingPayment}
                />
              ) : paymentClientSecret ? (
                <StripeElementsWrapper
                  clientSecret={paymentClientSecret}
                  amount={calculation ? calculation.total / 100 : 0}
                  currency="usd"
                >
                  <StripePaymentForm
                    amount={calculation ? calculation.total / 100 : 0}
                    currency="usd"
                    customerEmail={user?.email}
                    customerName={user?.name}
                    onPaymentSuccess={() => {
                      setCheckoutStep("processing");
                      handleCreateOrder();
                    }}
                    onPaymentError={(error) => {
                      console.error("Payment form error", error);
                      setPaymentError(error);
                    }}
                    isProcessing={isCreatingPaymentIntent || checkoutSelectors.isProcessingPayment}
                    usePaymentElement
                  />
                </StripeElementsWrapper>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-sm text-gray-600 dark:text-gray-400">
                  {isCreatingPaymentIntent ? "Preparando formulario de pago..." : "Cargando detalles de pago"}
                </div>
              )}

              {paymentError && (
                <p className="text-sm text-red-600 dark:text-red-400">{paymentError}</p>
              )}
            </section>
          )}
        </div>

        <OrderSummaryColumn
          cartItems={cartItems}
          calculation={calculation}
          checkoutStep={checkoutStep}
          onProceedToPayment={() => setCheckoutStep("payment")}
        />
      </div>
    </div>
  );
}

const SavedCardPayment = memo(
  ({
    paymentIntentId,
    selectedPaymentMethodId,
    paymentMethods,
    onConfirm,
    paymentError,
    isProcessing,
  }: {
    paymentIntentId: string | null;
    selectedPaymentMethodId: string | null;
    paymentMethods: SavedPaymentMethod[];
    onConfirm: () => Promise<void>;
    paymentError: string | null;
    isProcessing: boolean;
  }) => {
    const selectedPM = paymentMethods.find((pm) => pm.id === selectedPaymentMethodId);

    if (!selectedPM) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          No se encontró la tarjeta seleccionada.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
            Pagarás con tu tarjeta guardada
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
          onClick={onConfirm}
          disabled={!paymentIntentId || isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-6 h-6" />
          Confirmar y pagar
        </button>

        {paymentError && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{paymentError}</p>
        )}
      </div>
    );
  }
);
SavedCardPayment.displayName = "SavedCardPayment";

export default CheckoutTab;
