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
import { prisma } from "@/core/database/prisma";
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
 * Creates order and updates inventory
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("✅ [STRIPE WEBHOOK] Payment succeeded:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  });

  const { cartId, userId, customerEmail } = paymentIntent.metadata;

  if (!cartId || !userId) {
    console.error("❌ [STRIPE WEBHOOK] Missing required metadata (cartId, userId)");
    return;
  }

  try {
    console.log("🔍 [STRIPE WEBHOOK] Looking for cart:", {
      cartId,
      userId,
    });

    // Get cart with items and products
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      console.error(`❌ [STRIPE WEBHOOK] Cart not found: ${cartId}`);

      // Try to find cart by userId as fallback
      console.log("🔍 [STRIPE WEBHOOK] Trying to find cart by userId...");
      const userCart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (userCart) {
        console.log("✅ [STRIPE WEBHOOK] Found cart by userId:", {
          foundCartId: userCart.id,
          itemsCount: userCart.items.length,
        });
        // Continue with userCart instead
        return handleOrderCreation(paymentIntent, userCart);
      }

      console.error(`❌ [STRIPE WEBHOOK] No cart found for user: ${userId}`);
      return;
    }

    if (cart.items.length === 0) {
      console.error(`❌ [STRIPE WEBHOOK] Cart is empty: ${cartId}`);
      return;
    }

    console.log("✅ [STRIPE WEBHOOK] Cart found:", {
      cartId: cart.id,
      itemsCount: cart.items.length,
    });

    return handleOrderCreation(paymentIntent, cart);
  } catch (error) {
    console.error("❌ [STRIPE WEBHOOK] Error in handlePaymentIntentSucceeded:", error);
  }
}

/**
 * Handle order creation after finding cart
 */
async function handleOrderCreation(paymentIntent: Stripe.PaymentIntent, cart: any) {
  const { userId, customerEmail } = paymentIntent.metadata;

  try {

    // Calculate totals from cart
    const subtotal = cart.items.reduce((sum: number, item: any) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Prepare shipping address JSON
    const shippingAddressData = paymentIntent.shipping?.address
      ? {
          line1: paymentIntent.shipping.address.line1,
          line2: paymentIntent.shipping.address.line2,
          city: paymentIntent.shipping.address.city,
          state: paymentIntent.shipping.address.state,
          postal_code: paymentIntent.shipping.address.postal_code,
          country: paymentIntent.shipping.address.country,
        }
      : null;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        number: orderNumber,
        status: "CONFIRMED",

        // Contact info
        email: customerEmail || "",
        phone: paymentIntent.shipping?.phone || null,

        // Shipping info
        shippingMethod: paymentIntent.shipping?.carrier || null,
        shippingAddress: shippingAddressData ? JSON.stringify(shippingAddressData) : null,

        // Amounts
        subtotal,
        taxAmount: 0, // TODO: Calculate from cart or metadata
        shippingCost: 0, // TODO: Get from metadata
        total: paymentIntent.amount / 100, // Stripe amount is in cents

        // Payment info
        paymentMethod: "STRIPE",
        paymentStatus: "PAID",
        paymentIntentId: paymentIntent.id,

        // Create order items
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            total: Number(item.product.price) * item.quantity,
            productSku: item.product.sku || `SKU-${item.productId.substring(0, 8)}`,
            productName: item.product.name,
            productImage: item.product.images?.[0] || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    console.log(`✅ [STRIPE WEBHOOK] Order created: ${order.id} with ${order.items.length} items`);

    // Clear the cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      },
    });

    console.log(`✅ [STRIPE WEBHOOK] Cart cleared: ${cart.id}`);

    // Update product stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    console.log(`✅ [STRIPE WEBHOOK] Stock updated for ${cart.items.length} products`);

    // TODO: Send confirmation email
    // TODO: Notify fulfillment team
  } catch (error) {
    console.error("❌ [STRIPE WEBHOOK] Error processing payment:", error);
    throw error;
  }
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

  // Check if order exists and update status
  const order = await prisma.order.findFirst({
    where: { paymentIntentId: paymentIntent.id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
      },
    });
    console.log(`✅ [STRIPE WEBHOOK] Order marked as failed: ${order.id}`);
  }

  // TODO: Send payment failed email
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log("⚠️ [STRIPE WEBHOOK] Payment canceled:", {
    id: paymentIntent.id,
    metadata: paymentIntent.metadata,
  });

  const order = await prisma.order.findFirst({
    where: { paymentIntentId: paymentIntent.id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
      },
    });
    console.log(`✅ [STRIPE WEBHOOK] Order canceled: ${order.id}`);
  }
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

  const paymentIntentId = charge.payment_intent as string;

  const order = await prisma.order.findFirst({
    where: { paymentIntentId: paymentIntentId },
    include: {
      items: true,
    },
  });

  if (order && order.items) {
    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
      },
    });

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    console.log(`✅ [STRIPE WEBHOOK] Order refunded and stock restored: ${order.id}`);
  }

  // TODO: Send refund confirmation email
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
