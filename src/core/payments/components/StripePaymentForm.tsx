/**
 * 💳 STRIPE PAYMENT FORM
 * ======================
 *
 * Payment form component using Stripe Elements.
 * Handles card input, validation, and payment submission.
 *
 * @version 1.0.0 - Stripe payment form
 */

"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  CardElement,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock, AlertCircle } from "lucide-react";

// 🏷️ COMPONENT PROPS
// ===================

export interface StripePaymentFormProps {
  /** Amount to charge in dollars */
  amount: number;
  /** Currency code (default: usd) */
  currency?: string;
  /** Customer email */
  customerEmail: string;
  /** Customer name */
  customerName?: string;
  /** Callback when payment succeeds */
  onPaymentSuccess: (paymentIntentId: string) => void;
  /** Callback when payment fails */
  onPaymentError: (error: string) => void;
  /** Use Payment Element (recommended) or Card Element */
  usePaymentElement?: boolean;
  /** Custom className */
  className?: string;
}

// 🎨 COMPONENT
// ============

/**
 * Stripe payment form with card input
 * Must be wrapped in Elements provider
 */
export function StripePaymentForm({
  amount,
  currency = "usd",
  customerEmail,
  customerName,
  onPaymentSuccess,
  onPaymentError,
  usePaymentElement = true,
  className = "",
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  // 🎯 Component State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cardComplete, setCardComplete] = useState(false);

  // 💳 Handle payment submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("❌ Stripe.js has not loaded yet.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Submit payment elements
      const { error: submitError } = await elements.submit();

      if (submitError) {
        throw new Error(submitError.message);
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              email: customerEmail,
              name: customerName,
            },
          },
        },
        redirect: "if_required", // Only redirect if 3D Secure is required
      });

      if (error) {
        // Show error to customer
        const message =
          error.message || "An unexpected error occurred.";
        setErrorMessage(message);
        onPaymentError(message);
      } else if (paymentIntent) {
        // Payment succeeded
        console.log("✅ Payment succeeded:", paymentIntent.id);
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      setErrorMessage(message);
      onPaymentError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 🎨 Card Element change handler
  const handleCardChange = (event: { complete: boolean; error?: { message: string } }) => {
    setCardComplete(event.complete);
    if (event.error) {
      setErrorMessage(event.error.message);
    } else {
      setErrorMessage("");
    }
  };

  // 🎨 Format amount for display
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Payment Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payment Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your card details
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formattedAmount}
          </p>
        </div>
      </div>

      {/* Payment Element or Card Element */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
        {usePaymentElement ? (
          <PaymentElement
            options={{
              layout: "tabs",
              fields: {
                billingDetails: {
                  email: "never",
                  name: "auto",
                },
              },
            }}
          />
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Information
            </label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#1f2937",
                    "::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                  invalid: {
                    color: "#dc2626",
                  },
                },
                hidePostalCode: false,
              }}
              onChange={handleCardChange}
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Payment Error
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Lock className="w-4 h-4" />
        <span>
          Your payment information is encrypted and secure
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || (!usePaymentElement && !cardComplete)}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white
          transition-all duration-200
          ${
            isProcessing || !stripe || (!usePaymentElement && !cardComplete)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
          }
        `}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ${formattedAmount}`
        )}
      </button>

      {/* Payment Methods */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 opacity-60">
          <img
            src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg"
            alt="Visa"
            className="h-6"
          />
          <img
            src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"
            alt="Mastercard"
            className="h-6"
          />
          <img
            src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg"
            alt="Amex"
            className="h-6"
          />
          <img
            src="https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg"
            alt="Discover"
            className="h-6"
          />
        </div>
      </div>
    </form>
  );
}

export default StripePaymentForm;
