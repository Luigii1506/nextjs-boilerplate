/**
 * 💳 PAYMENT METHODS QUERIES
 * ===========================
 *
 * Server-side queries for retrieving payment methods.
 *
 * @version 1.0.0 - Feature-First Architecture
 */

"use server";

import { prisma } from "@/core/database/prisma";
import { getServerSession } from "@/core/auth/server";
import type { PaymentMethod, PaymentMethodsResponse } from "../types";

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
 * Get all payment methods for current user
 */
export async function getPaymentMethodsQuery(): Promise<PaymentMethodsResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        paymentMethods: [],
        defaultPaymentMethod: null,
      };
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    const formatted = paymentMethods.map(formatPaymentMethod);
    const defaultPaymentMethod =
      formatted.find((pm) => pm.isDefault) || formatted[0] || null;

    return {
      paymentMethods: formatted,
      defaultPaymentMethod,
    };
  } catch (error) {
    console.error("[getPaymentMethodsQuery] Error:", error);
    return {
      paymentMethods: [],
      defaultPaymentMethod: null,
    };
  }
}

/**
 * Get a specific payment method by ID
 */
export async function getPaymentMethodQuery(
  id: string
): Promise<PaymentMethod | null> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return null;
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return paymentMethod ? formatPaymentMethod(paymentMethod) : null;
  } catch (error) {
    console.error("[getPaymentMethodQuery] Error:", error);
    return null;
  }
}
