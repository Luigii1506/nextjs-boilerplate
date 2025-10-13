/**
 * 🛡️ CHECKOUT SCHEMAS
 * ===================
 *
 * Zod validation schemas for checkout process
 */

import { z } from "zod";

// 📧 BASIC VALIDATIONS
// ===================

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

const phoneSchema = z
  .string()
  .optional()
  .refine((phone) => {
    if (!phone) return true;
    return /^\+?[\d\s\-\(\)]+$/.test(phone);
  }, "Invalid phone number format");

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

const optionalNameSchema = z
  .string()
  .max(100, "Name must be less than 100 characters")
  .optional();

// 👤 CUSTOMER INFO SCHEMA
// =======================

export const customerInfoSchema = z.object({
  email: emailSchema,
  firstName: optionalNameSchema,
  lastName: optionalNameSchema,
  phone: phoneSchema,
});

export type CustomerInfoSchema = z.infer<typeof customerInfoSchema>;

// 📍 ADDRESS SCHEMA
// ================

export const addressSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  company: z.string().max(100).optional(),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(50),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(2), // ISO country code
  phone: phoneSchema,
});

export type AddressSchema = z.infer<typeof addressSchema>;

// 🚚 SHIPPING METHOD SCHEMA
// =========================

export const shippingMethodSchema = z.object({
  id: z.string().min(1, "Shipping method is required"),
  name: z.string().min(1),
  price: z.number().min(0),
  estimatedDays: z.number().min(0),
});

// 💳 PAYMENT METHOD SCHEMA
// ========================

export const paymentMethodSchema = z.object({
  id: z.string().min(1, "Payment method is required"),
  type: z.enum([
    "credit_card",
    "debit_card",
    "paypal",
    "bank_transfer",
    "cash_on_delivery",
  ]),
});

// 🎯 CHECKOUT SESSION SCHEMA
// ==========================

export const checkoutSessionSchema = z.object({
  cartId: z.string().cuid("Invalid cart ID"),
  userId: z.string().cuid().optional(),
  sessionId: z.string().optional(),

  customerInfo: customerInfoSchema,
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),

  shippingMethodId: z.string().optional(),
  paymentMethodId: z.string().optional(),

  customerNotes: z.string().max(500).optional(),

  currentStep: z.enum([
    "customer-info",
    "shipping-address",
    "shipping-method",
    "payment-method",
    "review-order",
    "processing",
    "completed",
  ]),
});

export type CheckoutSessionSchema = z.infer<typeof checkoutSessionSchema>;

// 📦 CREATE ORDER SCHEMA
// ======================

export const createOrderSchema = z.object({
  cartId: z.string().cuid("Invalid cart ID"),
  userId: z.string().cuid().optional(),

  customerInfo: customerInfoSchema.refine(
    (data) => {
      return data.email && (data.firstName || data.lastName);
    },
    {
      message: "Email and at least one name are required",
      path: ["customerInfo"],
    }
  ),

  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),

  shippingMethodId: z.string().min(1, "Shipping method is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),

  customerNotes: z.string().max(500).optional(),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;

// 💰 CALCULATE ORDER SCHEMA
// =========================

export const calculateOrderSchema = z.object({
  cartId: z.string().cuid("Invalid cart ID"),
  shippingAddress: addressSchema.optional(),
  shippingMethodId: z.string().optional(),
  discountCodes: z.array(z.string()).optional(),
});

export type CalculateOrderSchema = z.infer<typeof calculateOrderSchema>;

// 🏦 PROCESS PAYMENT SCHEMA
// =========================

export const processPaymentSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  paymentData: z.record(z.any()).optional(),
});

export type ProcessPaymentSchema = z.infer<typeof processPaymentSchema>;

// 🧾 PAYMENT INTENT SCHEMA
// ========================

export const createPaymentIntentSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  returnUrl: z.string().url().optional(),
});

export type CreatePaymentIntentSchema = z.infer<
  typeof createPaymentIntentSchema
>;

// 🚛 CALCULATE SHIPPING SCHEMA
// ============================

export const calculateShippingSchema = z.object({
  cartId: z.string().cuid("Invalid cart ID"),
  shippingAddress: addressSchema,
});

export type CalculateShippingSchema = z.infer<typeof calculateShippingSchema>;

// 🔍 QUERY SCHEMAS
// ===============

export const getOrderSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  userId: z.string().cuid().optional(),
});

export const getUserOrdersSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  status: z.array(z.string()).optional(),
});

// 🛠️ ADMIN SCHEMAS
// ================

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  notes: z.string().max(500).optional(),
});

export const updateShippingInfoSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  trackingNumber: z.string().max(100).optional(),
  shippedAt: z.date().optional(),
  estimatedDelivery: z.date().optional(),
});

export const refundOrderSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  amount: z.number().min(0).optional(), // Partial refund amount in cents
  reason: z.string().max(500).optional(),
});

// 🎨 FORM VALIDATION HELPERS
// ==========================

/**
 * Validates a checkout step based on current session data
 */
export function validateCheckoutStep(
  step: string,
  sessionData: any
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  switch (step) {
    case "customer-info":
      const customerResult = customerInfoSchema.safeParse(
        sessionData.customerInfo
      );
      if (!customerResult.success) {
        customerResult.error.issues.forEach((issue) => {
          errors[issue.path.join(".")] = issue.message;
        });
      }
      break;

    case "shipping-address":
      const addressResult = addressSchema.safeParse(
        sessionData.shippingAddress
      );
      if (!addressResult.success) {
        addressResult.error.issues.forEach((issue) => {
          errors[issue.path.join(".")] = issue.message;
        });
      }
      break;

    case "shipping-method":
      if (!sessionData.shippingMethodId) {
        errors.shippingMethodId = "Shipping method is required";
      }
      break;

    case "payment-method":
      if (!sessionData.paymentMethodId) {
        errors.paymentMethodId = "Payment method is required";
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get all required fields for a specific checkout step
 */
export function getRequiredFieldsForStep(step: string): string[] {
  switch (step) {
    case "customer-info":
      return ["email"];
    case "shipping-address":
      return [
        "firstName",
        "lastName",
        "addressLine1",
        "city",
        "state",
        "postalCode",
        "country",
      ];
    case "shipping-method":
      return ["shippingMethodId"];
    case "payment-method":
      return ["paymentMethodId"];
    default:
      return [];
  }
}
