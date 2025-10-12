/**
 * 💳 STRIPE ELEMENTS WRAPPER
 * ==========================
 *
 * Wrapper component that provides Stripe Elements context.
 * Handles Stripe initialization and loading states.
 *
 * @version 1.0.0 - Stripe Elements wrapper
 */

"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { getStripeClient } from "../stripe/client";
import { stripeElementsAppearance, stripeElementsDarkAppearance } from "../stripe/config";
import type { Stripe, StripeElementsOptions } from "@stripe/stripe-js";

// 🏷️ COMPONENT PROPS
// ===================

export interface StripeElementsWrapperProps {
  /** Client secret from payment intent */
  clientSecret: string;
  /** Amount in dollars (for display) */
  amount: number;
  /** Currency code */
  currency?: string;
  /** Child components (typically StripePaymentForm) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

// 🎨 COMPONENT
// ============

/**
 * Stripe Elements provider wrapper
 * Handles Stripe initialization and theming
 */
export function StripeElementsWrapper({
  clientSecret,
  children,
  className = "",
}: StripeElementsWrapperProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const { theme, systemTheme } = useTheme();

  // 🔧 Initialize Stripe
  useEffect(() => {
    setStripePromise(getStripeClient());
  }, []);

  // 🎨 Determine current theme
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // 🎨 Configure Elements appearance based on theme
  const appearance = isDark ? stripeElementsDarkAppearance : stripeElementsAppearance;

  // 🎯 Stripe Elements options
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
    loader: "auto",
  };

  // 🔄 Loading state
  if (!stripePromise) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading payment form...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Elements stripe={stripePromise} options={options}>
        {children}
      </Elements>
    </div>
  );
}

export default StripeElementsWrapper;
