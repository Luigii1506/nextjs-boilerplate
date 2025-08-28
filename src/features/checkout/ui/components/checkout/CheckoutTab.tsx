/**
 * 💳 CHECKOUT TAB
 * ==============
 *
 * Main checkout interface - integrated as a tab in the Storefront
 */

"use client";

import React from "react";
import { useCheckoutContext } from "../../../context/CheckoutContext";
import { CHECKOUT_STEP_LABELS } from "../../../constants";
import type { CheckoutStep } from "../../../types";
import {
  ShoppingCart,
  User,
  MapPin,
  Truck,
  CreditCard,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// 🎯 COMPONENT PROPS
// ==================

export interface CheckoutTabProps {
  className?: string;
}

// 🎨 STEP ICONS
// =============

const STEP_ICONS = {
  "customer-info": User,
  "shipping-address": MapPin,
  "shipping-method": Truck,
  "payment-method": CreditCard,
  "review-order": FileText,
  processing: ShoppingCart,
  completed: CheckCircle,
};

// 🚀 MAIN COMPONENT
// ==================

export function CheckoutTab({ className = "" }: CheckoutTabProps) {
  const {
    session,
    cart,
    calculation,
    currentStep,
    completedSteps,
    canProceedToNext,
    canGoBack,
    isLoading,
    isCreatingOrder,
    errors,
    goToNextStep,
    goToPreviousStep,
    createOrder,
    setCustomerInfo,
    setShippingAddress,
    setBillingAddress,
    setShippingMethod,
    setPaymentMethod,
    shippingMethods,
    paymentMethods,
  } = useCheckoutContext();

  // 🔒 EARLY RETURNS
  // ================

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add some items to your cart before checking out
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing checkout...
          </p>
        </div>
      </div>
    );
  }

  // 🎯 STEP PROGRESS INDICATOR
  // ==========================

  const renderStepProgress = () => {
    const visibleSteps = [
      "customer-info",
      "shipping-address",
      "shipping-method",
      "payment-method",
      "review-order",
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {visibleSteps.map((step, index) => {
            const StepIcon = STEP_ICONS[step as keyof typeof STEP_ICONS];
            const isCompleted = completedSteps.includes(step as CheckoutStep);
            const isCurrent = currentStep === step;
            const isActive = isCompleted || isCurrent;

            return (
              <React.Fragment key={step}>
                <div
                  className={`flex flex-col items-center ${
                    isActive ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isCurrent
                        ? "border-blue-600 text-blue-600"
                        : "border-gray-300 text-gray-400"
                    }
                  `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-20">
                    {
                      CHECKOUT_STEP_LABELS[
                        step as keyof typeof CHECKOUT_STEP_LABELS
                      ]
                    }
                  </span>
                </div>

                {index < visibleSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      completedSteps.includes(
                        visibleSteps[index + 1] as CheckoutStep
                      )
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // 🎯 CURRENT STEP CONTENT
  // =======================

  const renderStepContent = () => {
    switch (currentStep) {
      case "customer-info":
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  value={session.customerInfo.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCustomerInfo({
                      ...session.customerInfo,
                      email: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                    value={session.customerInfo.firstName || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setCustomerInfo({
                        ...session.customerInfo,
                        firstName: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                    value={session.customerInfo.lastName || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setCustomerInfo({
                        ...session.customerInfo,
                        lastName: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "review-order":
        return (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {item.product?.name || "Product"}
                      </h4>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.total / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              {calculation && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(calculation.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${(calculation.shipping / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(calculation.tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${(calculation.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <button
              onClick={async () => {
                const order = await createOrder();
                if (order) {
                  console.log("Order created successfully:", order.id);
                } else {
                  console.error("Order creation failed");
                }
              }}
              disabled={isCreatingOrder}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreatingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        );

      case "shipping-address":
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              Shipping Address
            </h3>

            <div className="space-y-6">
              {/* Address Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                    value={session.shippingAddress?.addressLine1 || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setShippingAddress({
                        ...(session.shippingAddress || {
                          firstName: session.customerInfo.firstName || "",
                          lastName: session.customerInfo.lastName || "",
                          addressLine1: "",
                          city: "",
                          state: "",
                          postalCode: "",
                          country: "US",
                        }),
                        addressLine1: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Apartment/Suite (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apt 2B"
                    value={session.shippingAddress?.addressLine2 || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setShippingAddress({
                        ...(session.shippingAddress || {
                          firstName: session.customerInfo.firstName || "",
                          lastName: session.customerInfo.lastName || "",
                          addressLine1: "",
                          city: "",
                          state: "",
                          postalCode: "",
                          country: "US",
                        }),
                        addressLine2: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="New York"
                    value={session.shippingAddress?.city || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setShippingAddress({
                        ...(session.shippingAddress || {
                          firstName: session.customerInfo.firstName || "",
                          lastName: session.customerInfo.lastName || "",
                          addressLine1: "",
                          city: "",
                          state: "",
                          postalCode: "",
                          country: "US",
                        }),
                        city: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="NY"
                    value={session.shippingAddress?.state || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setShippingAddress({
                        ...(session.shippingAddress || {
                          firstName: session.customerInfo.firstName || "",
                          lastName: session.customerInfo.lastName || "",
                          addressLine1: "",
                          city: "",
                          state: "",
                          postalCode: "",
                          country: "US",
                        }),
                        state: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10001"
                    value={session.shippingAddress?.postalCode || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setShippingAddress({
                        ...(session.shippingAddress || {
                          firstName: session.customerInfo.firstName || "",
                          lastName: session.customerInfo.lastName || "",
                          addressLine1: "",
                          city: "",
                          state: "",
                          postalCode: "",
                          country: "US",
                        }),
                        postalCode: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Country
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={session.shippingAddress?.country || "US"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setShippingAddress({
                      ...(session.shippingAddress || {
                        firstName: session.customerInfo.firstName || "",
                        lastName: session.customerInfo.lastName || "",
                        addressLine1: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "US",
                      }),
                      country: e.target.value,
                    });
                  }}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>

              {/* Same as Billing Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  className="rounded border-gray-300"
                  checked={!session.billingAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.checked) {
                      setBillingAddress(null);
                    }
                  }}
                />
                <label htmlFor="sameAsBilling" className="text-sm">
                  Billing address is the same as shipping address
                </label>
              </div>
            </div>
          </div>
        );

      case "shipping-method":
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              Shipping Method
            </h3>

            <div className="space-y-4">
              {shippingMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    session.shippingMethodId === method.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setShippingMethod(method.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{method.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {method.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {method.estimatedDays} business days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(method.price / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "payment-method":
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              Payment Method
            </h3>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    session.paymentMethodId === method.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{method.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {method.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {method.type === "credit_card" && (
                        <div className="text-blue-600 mr-2">💳</div>
                      )}
                      {method.type === "paypal" && (
                        <div className="text-blue-600 mr-2">🏦</div>
                      )}
                      {method.type === "bank_transfer" && (
                        <div className="text-green-600 mr-2">🏛️</div>
                      )}
                      {method.type === "cash_on_delivery" && (
                        <div className="text-orange-600 mr-2">💰</div>
                      )}
                      <input
                        type="radio"
                        checked={session.paymentMethodId === method.id}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-sm border text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Processing Your Order
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your payment and prepare your
              order...
            </p>
          </div>
        );

      case "completed":
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-sm border text-center">
            <div className="text-green-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Order Completed!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              View Order Details
            </button>
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">{currentStep}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              This step is not yet implemented. Coming soon!
            </p>
          </div>
        );
    }
  };

  // 🎯 NAVIGATION BUTTONS
  // =====================

  const renderNavigation = () => {
    if (currentStep === "processing" || currentStep === "completed") {
      return null;
    }

    return (
      <div className="flex justify-between mt-8">
        <button
          onClick={goToPreviousStep}
          disabled={!canGoBack}
          className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep !== "review-order" && (
          <button
            onClick={goToNextStep}
            disabled={!canProceedToNext}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  // 🎯 ERROR DISPLAY
  // ================

  const renderErrors = () => {
    if (Object.keys(errors).length === 0) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h4 className="text-red-800 font-semibold mb-2">
          Please fix the following errors:
        </h4>
        <ul className="text-red-700 text-sm space-y-1">
          {Object.entries(errors).map(([field, message]) => (
            <li key={field}>• {message}</li>
          ))}
        </ul>
      </div>
    );
  };

  // 🎯 MAIN RENDER
  // ==============

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Checkout
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete your purchase
            </p>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      {renderStepProgress()}

      {/* Errors */}
      {renderErrors()}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      {renderNavigation()}

      {/* Loading Overlay */}
      {(isLoading || isCreatingOrder) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isCreatingOrder ? "Creating your order..." : "Loading..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
