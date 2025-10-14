/**
 * 💳 PAYMENT METHODS ACTIONS
 * ===========================
 *
 * Server-side mutations for payment methods.
 * Integrates with Stripe for PCI-compliant card storage.
 *
 * @version 1.0.0 - Feature-First Architecture
 */

"use server";

import { prisma } from "@/core/database/prisma";
import { getServerSession } from "@/core/auth/server";
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  type CreatePaymentMethodInput,
  type UpdatePaymentMethodInput,
} from "../schemas";
import type { PaymentMethod } from "../types";
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

// 🔄 Format PaymentMethod from Prisma to clean type
function formatPaymentMethod(pm: any): PaymentMethod {
  return {
    id: pm.id,
    userId: pm.userId,
    stripePaymentMethodId: pm.stripePaymentMethodId,
    stripeCustomerId: pm.stripeCustomerId,
    brand: pm.brand,
    last4: pm.last4,
    expiryMonth: pm.expiryMonth,
    expiryYear: pm.expiryYear,
    label: pm.label,
    isDefault: pm.isDefault,
    createdAt: pm.createdAt,
    updatedAt: pm.updatedAt,
  };
}

/**
 * Create a new payment method
 * Called after successful Stripe Setup Intent
 */
export async function createPaymentMethodAction(
  input: CreatePaymentMethodInput
): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    const validated = createPaymentMethodSchema.parse(input);

    // Get card details from Stripe
    const stripe = getStripe();
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(
      validated.stripePaymentMethodId
    );

    if (stripePaymentMethod.type !== "card" || !stripePaymentMethod.card) {
      return { success: false, error: "Invalid payment method type" };
    }

    const card = stripePaymentMethod.card;

    // Get customer ID from Stripe payment method or from input
    // Stripe payment method has the customer ID attached to it
    const stripeCustomerId =
      (typeof stripePaymentMethod.customer === 'string'
        ? stripePaymentMethod.customer
        : null) || validated.stripeCustomerId || null;

    console.log("💳 [createPaymentMethodAction] Payment method details:", {
      stripePaymentMethodId: validated.stripePaymentMethodId,
      stripeCustomerId,
      customerFromStripe: stripePaymentMethod.customer,
      customerFromInput: validated.stripeCustomerId,
    });

    // If this is set as default, unset other defaults
    if (validated.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create payment method in database
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        stripePaymentMethodId: validated.stripePaymentMethodId,
        stripeCustomerId,
        brand: card.brand,
        last4: card.last4,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        label: validated.label || null,
        isDefault: validated.isDefault || false,
      },
    });

    return { success: true, paymentMethod: formatPaymentMethod(paymentMethod) };
  } catch (error) {
    console.error("[createPaymentMethodAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al guardar método de pago",
    };
  }
}

/**
 * Update a payment method (label or default status)
 */
export async function updatePaymentMethodAction(
  input: UpdatePaymentMethodInput
): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    const validated = updatePaymentMethodSchema.parse(input);

    // Verify ownership
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        id: validated.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Método de pago no encontrado" };
    }

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: validated.id },
        },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id: validated.id },
      data: {
        label: validated.label !== undefined ? validated.label : undefined,
        isDefault:
          validated.isDefault !== undefined
            ? validated.isDefault
            : undefined,
      },
    });

    return { success: true, paymentMethod: formatPaymentMethod(paymentMethod) };
  } catch (error) {
    console.error("[updatePaymentMethodAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar método de pago",
    };
  }
}

/**
 * Fix payment method - update stripeCustomerId from Stripe
 * Use this to fix existing payment methods that have null stripeCustomerId
 */
export async function fixPaymentMethodCustomerIdAction(
  paymentMethodId: string
): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Get payment method from database
    const pm = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: session.user.id,
      },
    });

    if (!pm) {
      return { success: false, error: "Payment method not found" };
    }

    // Get payment method from Stripe to get customer ID
    const stripe = getStripe();
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(
      pm.stripePaymentMethodId
    );

    const stripeCustomerId =
      typeof stripePaymentMethod.customer === 'string'
        ? stripePaymentMethod.customer
        : null;

    console.log("🔧 [fixPaymentMethodCustomerIdAction] Fixing payment method:", {
      paymentMethodId,
      stripePaymentMethodId: pm.stripePaymentMethodId,
      oldCustomerId: pm.stripeCustomerId,
      newCustomerId: stripeCustomerId,
    });

    if (!stripeCustomerId) {
      return {
        success: false,
        error: "Payment method has no customer associated in Stripe",
      };
    }

    // Update payment method with customer ID
    const updatedPM = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: { stripeCustomerId },
    });

    return { success: true, paymentMethod: formatPaymentMethod(updatedPM) };
  } catch (error) {
    console.error("[fixPaymentMethodCustomerIdAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar método de pago",
    };
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethodAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Verify ownership
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Método de pago no encontrado" };
    }

    // Detach from Stripe (optional, but good practice)
    try {
      const stripe = getStripe();
      await stripe.paymentMethods.detach(existing.stripePaymentMethodId);
    } catch (stripeError) {
      console.warn(
        "[deletePaymentMethodAction] Failed to detach from Stripe:",
        stripeError
      );
      // Continue anyway - we'll delete from our database
    }

    // Delete from database
    await prisma.paymentMethod.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("[deletePaymentMethodAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al eliminar método de pago",
    };
  }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethodAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return updatePaymentMethodAction({ id, isDefault: true });
}
