/**
 * 💳 STRIPE SETUP INTENT API
 * ===========================
 *
 * Creates a Setup Intent for saving payment methods without charging.
 *
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/core/auth/server";
import Stripe from "stripe";
import { ENV } from "@/core/config/environment";

// Initialize Stripe
const getStripe = () => {
  const secretKey = ENV.stripe.secretKey;
  if (!secretKey) {
    throw new Error("Stripe secret key not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-09-30.clover",
    typescript: true,
  });
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const stripe = getStripe();

    // Create or retrieve Stripe customer
    let customerId: string | undefined;

    // TODO: Store customerId in user table for reuse
    // For now, create a new customer each time (or search by email)
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error) {
    console.error("[Setup Intent API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al crear Setup Intent",
      },
      { status: 500 }
    );
  }
}
