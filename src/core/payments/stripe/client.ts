/**
 * 💳 STRIPE CLIENT
 * ================
 *
 * Client-side Stripe operations (browser).
 * Handles Stripe.js initialization and client-side payment operations.
 *
 * @version 2.0.0 - Core Infrastructure
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { getStripeConfig, isStripeClientConfigured } from "./config";

// 🎯 STRIPE INSTANCE (SINGLETON)
// ==============================

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance for client-side use
 * Uses singleton pattern to ensure only one instance exists
 *
 * @returns Promise that resolves to Stripe instance or null if not configured
 */
export const getStripeClient = (): Promise<Stripe | null> => {
  // Return existing promise if already initialized
  if (stripePromise) {
    return stripePromise;
  }

  // Check if Stripe is configured
  if (!isStripeClientConfigured()) {
    console.warn(
      "⚠️ [STRIPE CLIENT] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable"
    );
    return Promise.resolve(null);
  }

  // Initialize Stripe
  const config = getStripeConfig();
  stripePromise = loadStripe(config.publishableKey);

  return stripePromise;
};

/**
 * Reset Stripe instance (useful for testing or hot reload)
 */
export const resetStripeClient = (): void => {
  stripePromise = null;
};

// 🎯 HELPER FUNCTIONS
// ===================

/**
 * Check if Stripe is ready to use
 */
export const isStripeReady = async (): Promise<boolean> => {
  try {
    const stripe = await getStripeClient();
    return stripe !== null;
  } catch (error) {
    console.error("❌ [STRIPE CLIENT] Error checking Stripe readiness:", error);
    return false;
  }
};
