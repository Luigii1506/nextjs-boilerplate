/**
 * 💳 PAYMENT METHODS SCHEMAS
 * ===========================
 *
 * Zod validation schemas for payment methods.
 *
 * @version 1.0.0 - Feature-First Architecture
 */

import { z } from "zod";

// 💳 Create Payment Method Schema
export const createPaymentMethodSchema = z.object({
  stripePaymentMethodId: z
    .string()
    .min(1, "Payment method ID is required")
    .startsWith("pm_", "Invalid payment method ID format"),
  stripeCustomerId: z
    .string()
    .startsWith("cus_", "Invalid customer ID format")
    .optional(),
  label: z
    .string()
    .max(50, "Label must be 50 characters or less")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  isDefault: z.boolean().optional().default(false),
});

export type CreatePaymentMethodInput = z.infer<
  typeof createPaymentMethodSchema
>;

// 💳 Update Payment Method Schema
export const updatePaymentMethodSchema = z.object({
  id: z.string().min(1, "Payment method ID is required"),
  label: z
    .string()
    .max(50, "Label must be 50 characters or less")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  isDefault: z.boolean().optional(),
});

export type UpdatePaymentMethodInput = z.infer<
  typeof updatePaymentMethodSchema
>;
