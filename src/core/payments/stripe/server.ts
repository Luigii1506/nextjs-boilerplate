/**
 * 💳 STRIPE SERVER
 * ================
 *
 * Server-side Stripe operations (Node.js).
 * Handles payment intents, customers, payment methods, and webhooks.
 *
 * @version 2.0.0 - Core Infrastructure
 */

"use server";

import Stripe from "stripe";
import {
  getStripeConfig,
  isStripeConfigured,
  dollarsToCents,
  STRIPE_API_VERSION,
  PAYMENT_INTENT_CONFIG,
} from "./config";

// 🎯 STRIPE INSTANCE (SINGLETON)
// ==============================

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe server instance (internal use only)
 * Uses singleton pattern to reuse the same instance
 *
 * @returns Stripe instance or null if not configured
 */
function getStripeServer(): Stripe | null {
  // Return existing instance if already initialized
  if (stripeInstance) {
    return stripeInstance;
  }

  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    console.warn("⚠️ [STRIPE SERVER] Stripe is not configured. Please set STRIPE_SECRET_KEY.");
    return null;
  }

  // Initialize Stripe
  const config = getStripeConfig();
  stripeInstance = new Stripe(config.secretKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });

  console.log("✅ [STRIPE SERVER] Stripe initialized successfully");

  return stripeInstance;
}

// 🎯 PAYMENT INTENT OPERATIONS
// ============================

export interface CreatePaymentIntentParams {
  amount: number; // in dollars
  currency?: string;
  metadata?: Record<string, string>;
  customerId?: string;
  description?: string;
}

export interface PaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

/**
 * Create a new payment intent
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured. Please check your environment variables.",
      };
    }

    const {
      amount,
      currency = "usd",
      metadata = {},
      customerId,
      description,
    } = params;

    // Convert amount to cents
    const amountInCents = dollarsToCents(amount);

    const createParams = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      ...PAYMENT_INTENT_CONFIG,
      customer: customerId,
      description,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
      },
    };

    console.log("💳 [STRIPE SERVER] Creating payment intent:", {
      amount: amountInCents,
      currency,
      customerId,
      hasCustomerId: !!customerId,
      metadata,
      fullParams: createParams,
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(createParams);

    console.log("✅ [STRIPE SERVER] Payment intent created successfully:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      customer: paymentIntent.customer,
      hasCustomer: !!paymentIntent.customer,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error creating payment intent:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment intent",
    };
  }
}

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<{ success: boolean; paymentIntent?: Stripe.PaymentIntent; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error retrieving payment intent:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve payment intent",
    };
  }
}

/**
 * Update a payment intent
 */
export async function updatePaymentIntent(
  paymentIntentId: string,
  updates: {
    amount?: number; // in dollars
    metadata?: Record<string, string>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    const updateData: Stripe.PaymentIntentUpdateParams = {};

    if (updates.amount !== undefined) {
      updateData.amount = dollarsToCents(updates.amount);
    }

    if (updates.metadata) {
      updateData.metadata = updates.metadata;
    }

    await stripe.paymentIntents.update(paymentIntentId, updateData);

    console.log("✅ [STRIPE SERVER] Payment intent updated:", paymentIntentId);

    return { success: true };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error updating payment intent:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update payment intent",
    };
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    await stripe.paymentIntents.cancel(paymentIntentId);

    console.log("✅ [STRIPE SERVER] Payment intent canceled:", paymentIntentId);

    return { success: true };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error canceling payment intent:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel payment intent",
    };
  }
}

/**
 * Confirm a payment intent with a saved payment method
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string,
  customerId?: string
): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    console.log("💳 [STRIPE SERVER] Confirming payment intent:", {
      paymentIntentId,
      paymentMethodId,
      customerId,
      hasCustomerId: !!customerId,
    });

    // If customerId is provided, first retrieve and check if we need to update the payment intent
    if (customerId) {
      console.log("🔍 [STRIPE SERVER] Retrieving existing payment intent...");
      const existingIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      console.log("📋 [STRIPE SERVER] Existing payment intent details:", {
        id: existingIntent.id,
        status: existingIntent.status,
        customer: existingIntent.customer,
        hasCustomer: !!existingIntent.customer,
        customerMatch: existingIntent.customer === customerId,
      });

      // If payment intent doesn't have a customer, update it first
      if (!existingIntent.customer) {
        console.log("🔄 [STRIPE SERVER] Payment Intent has NO customer. Updating with:", customerId);
        const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
          customer: customerId,
        });
        console.log("✅ [STRIPE SERVER] Payment Intent updated with customer:", {
          id: updatedIntent.id,
          customer: updatedIntent.customer,
        });
      } else if (existingIntent.customer !== customerId) {
        console.warn("⚠️ [STRIPE SERVER] Payment Intent has different customer:", {
          existingCustomer: existingIntent.customer,
          providedCustomer: customerId,
        });
      } else {
        console.log("✅ [STRIPE SERVER] Payment Intent already has correct customer");
      }
    } else {
      console.warn("⚠️ [STRIPE SERVER] No customerId provided for confirmation");
    }

    // Now confirm with the payment method
    console.log("🚀 [STRIPE SERVER] Confirming payment intent with payment method:", paymentMethodId);
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    console.log("✅ [STRIPE SERVER] Payment intent confirmed successfully:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      customer: paymentIntent.customer,
      payment_method: paymentIntent.payment_method,
    });

    return {
      success: true,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error confirming payment intent:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to confirm payment intent",
    };
  }
}

// 🎯 CUSTOMER OPERATIONS
// ======================

export interface CreateCustomerParams {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(
  params: CreateCustomerParams
): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    const { email, name, phone, metadata } = params;

    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata,
    });

    console.log("✅ [STRIPE SERVER] Customer created:", customer.id);

    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error creating customer:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

/**
 * Retrieve a Stripe customer
 */
export async function retrieveStripeCustomer(
  customerId: string
): Promise<{ success: boolean; customer?: Stripe.Customer; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      return {
        success: false,
        error: "Customer has been deleted",
      };
    }

    return {
      success: true,
      customer: customer as Stripe.Customer,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error retrieving customer:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve customer",
    };
  }
}

// 🎯 PAYMENT METHOD OPERATIONS
// ============================

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    console.log("✅ [STRIPE SERVER] Payment method attached:", {
      paymentMethodId,
      customerId,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error attaching payment method:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to attach payment method",
    };
  }
}

/**
 * Detach a payment method from a customer
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    console.log("✅ [STRIPE SERVER] Payment method detached:", paymentMethodId);

    return { success: true };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error detaching payment method:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to detach payment method",
    };
  }
}

/**
 * List payment methods for a customer
 */
export async function listCustomerPaymentMethods(
  customerId: string
): Promise<{ success: boolean; paymentMethods?: Stripe.PaymentMethod[]; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return {
      success: true,
      paymentMethods: paymentMethods.data,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error listing payment methods:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list payment methods",
    };
  }
}

// 🎯 WEBHOOK VERIFICATION
// =======================

/**
 * Verify a Stripe webhook signature
 */
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<{ success: boolean; event?: Stripe.Event; error?: string }> {
  try {
    const stripe = getStripeServer();
    const config = getStripeConfig();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    if (!config.webhookSecret) {
      return {
        success: false,
        error: "Webhook secret not configured",
      };
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.webhookSecret
    );

    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Webhook signature verification failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook signature verification failed",
    };
  }
}

// 🎯 REFUND OPERATIONS
// ====================

/**
 * Create a refund for a payment intent
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // in dollars, optional (full refund if not provided)
  reason?: "duplicate" | "fraudulent" | "requested_by_customer"
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const stripe = getStripeServer();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe not configured",
      };
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason,
    };

    if (amount !== undefined) {
      refundParams.amount = dollarsToCents(amount);
    }

    const refund = await stripe.refunds.create(refundParams);

    console.log("✅ [STRIPE SERVER] Refund created:", refund.id);

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    console.error("❌ [STRIPE SERVER] Error creating refund:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create refund",
    };
  }
}
