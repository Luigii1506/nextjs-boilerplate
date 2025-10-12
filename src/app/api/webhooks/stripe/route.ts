/**
 * 🔔 STRIPE WEBHOOK HANDLER
 * =========================
 *
 * Handles incoming Stripe webhook events.
 * This is the central webhook endpoint for ALL Stripe events.
 *
 * Features using Stripe (Storefront, POS, etc.) should listen to
 * events via this unified webhook handler.
 *
 * @version 2.0.0 - Core Infrastructure
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, STRIPE_WEBHOOK_EVENTS } from "@/core/payments";
import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ [STRIPE WEBHOOK] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const verification = await verifyWebhookSignature(body, signature);

    if (!verification.success || !verification.event) {
      console.error("❌ [STRIPE WEBHOOK] Signature verification failed:", verification.error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = verification.event;

    console.log("🔔 [STRIPE WEBHOOK] Received event:", {
      type: event.type,
      id: event.id,
    });

    // Handle different event types
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED:
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_CANCELED:
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case STRIPE_WEBHOOK_EVENTS.CHARGE_REFUNDED:
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_CREATED:
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_UPDATED:
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_DELETED:
        await handleCustomerDeleted(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`⚠️ [STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ [STRIPE WEBHOOK] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// 🎯 EVENT HANDLERS
// =================

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("✅ [STRIPE WEBHOOK] Payment succeeded:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  });

  // TODO: Update order status in database
  // TODO: Send confirmation email
  // TODO: Trigger fulfillment process

  // Features can extend this by importing their own handlers
  // Example: await updateOrderStatusAfterPayment(paymentIntent.metadata.orderId);
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error("❌ [STRIPE WEBHOOK] Payment failed:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    last_payment_error: paymentIntent.last_payment_error,
    metadata: paymentIntent.metadata,
  });

  // TODO: Update order status to failed
  // TODO: Send failure notification
  // TODO: Log for fraud detection
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log("⚠️ [STRIPE WEBHOOK] Payment canceled:", {
    id: paymentIntent.id,
    metadata: paymentIntent.metadata,
  });

  // TODO: Update order status to canceled
  // TODO: Release inventory
}

/**
 * Handle refunded charge
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log("💰 [STRIPE WEBHOOK] Charge refunded:", {
    id: charge.id,
    amount: charge.amount,
    amount_refunded: charge.amount_refunded,
    metadata: charge.metadata,
  });

  // TODO: Update order status to refunded
  // TODO: Send refund confirmation email
  // TODO: Update inventory
}

/**
 * Handle customer created
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log("👤 [STRIPE WEBHOOK] Customer created:", {
    id: customer.id,
    email: customer.email,
    metadata: customer.metadata,
  });

  // TODO: Link Stripe customer to user account
  // TODO: Sync customer data
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log("👤 [STRIPE WEBHOOK] Customer updated:", {
    id: customer.id,
    email: customer.email,
  });

  // TODO: Sync customer data updates
}

/**
 * Handle customer deleted
 */
async function handleCustomerDeleted(customer: Stripe.Customer) {
  console.log("👤 [STRIPE WEBHOOK] Customer deleted:", {
    id: customer.id,
  });

  // TODO: Handle customer deletion (GDPR compliance)
  // TODO: Anonymize data
}
