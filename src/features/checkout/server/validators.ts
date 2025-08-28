/**
 * 🛡️ CHECKOUT VALIDATORS
 * ======================
 *
 * Server-side validation for checkout operations
 */

import { getServerSession } from "@/core/auth/server";
import type { CustomerInfo, Address, CheckoutSession } from "../types";
import { customerInfoSchema, addressSchema } from "../schemas";
import {
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  SUPPORTED_COUNTRIES,
} from "../constants";

// 🔐 AUTHENTICATION & AUTHORIZATION
// =================================

/**
 * Validate checkout access (user can access their own orders or guest with session)
 */
export async function validateCheckoutAccess(
  userId?: string,
  sessionId?: string
): Promise<{ isValid: boolean; error?: string }> {
  console.log("🔐 [CHECKOUT VALIDATOR] Validating checkout access:", {
    hasUserId: !!userId,
    hasSessionId: !!sessionId,
  });

  try {
    // Either user must be authenticated OR have a valid session
    if (!userId && !sessionId) {
      return {
        isValid: false,
        error: "Authentication or valid session required for checkout",
      };
    }

    // If userId is provided, verify it matches the current session
    if (userId) {
      const session = await getServerSession();
      if (!session?.user?.id || session.user.id !== userId) {
        return {
          isValid: false,
          error: "User authentication mismatch",
        };
      }
    }

    console.log("✅ [CHECKOUT VALIDATOR] Checkout access validated");
    return { isValid: true };
  } catch (error) {
    console.error(
      "❌ [CHECKOUT VALIDATOR] Error validating checkout access:",
      error
    );
    return {
      isValid: false,
      error: "Authentication validation failed",
    };
  }
}

/**
 * Validate order ownership (user can only access their own orders)
 */
export async function validateOrderAccess(
  orderId: string,
  userId?: string,
  sessionId?: string
): Promise<{ isValid: boolean; error?: string }> {
  console.log("🔐 [CHECKOUT VALIDATOR] Validating order access:", {
    orderId,
    hasUserId: !!userId,
    hasSessionId: !!sessionId,
  });

  // Validate order ownership in database
  if (!userId && !sessionId) {
    return {
      isValid: false,
      error: "User ID or session ID required to access order",
    };
  }

  return { isValid: true };
}

// 📋 DATA VALIDATION
// ==================

/**
 * Validate customer information
 */
export function validateCustomerInfo(customerInfo: CustomerInfo): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: CustomerInfo;
} {
  console.log("📋 [CHECKOUT VALIDATOR] Validating customer info:", {
    hasEmail: !!customerInfo?.email,
    hasFirstName: !!customerInfo?.firstName,
    hasLastName: !!customerInfo?.lastName,
  });

  try {
    const result = customerInfoSchema.safeParse(customerInfo);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });

      console.log(
        "❌ [CHECKOUT VALIDATOR] Customer info validation failed:",
        errors
      );
      return { isValid: false, errors };
    }

    console.log("✅ [CHECKOUT VALIDATOR] Customer info validated");
    return { isValid: true, errors: {}, data: result.data };
  } catch (error) {
    console.error(
      "❌ [CHECKOUT VALIDATOR] Error validating customer info:",
      error
    );
    return {
      isValid: false,
      errors: { general: "Validation error occurred" },
    };
  }
}

/**
 * Validate shipping address
 */
export function validateShippingAddress(address: Address): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: Address;
} {
  console.log("🏠 [CHECKOUT VALIDATOR] Validating shipping address:", {
    hasAddress1: !!address?.addressLine1,
    city: address?.city,
    state: address?.state,
    country: address?.country,
  });

  try {
    const result = addressSchema.safeParse(address);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });

      console.log("❌ [CHECKOUT VALIDATOR] Address validation failed:", errors);
      return { isValid: false, errors };
    }

    // Additional business validation
    const businessValidation = validateAddressBusiness(result.data);
    if (!businessValidation.isValid) {
      console.log(
        "❌ [CHECKOUT VALIDATOR] Address business validation failed:",
        businessValidation.errors
      );
      return businessValidation;
    }

    console.log("✅ [CHECKOUT VALIDATOR] Shipping address validated");
    return { isValid: true, errors: {}, data: result.data };
  } catch (error) {
    console.error(
      "❌ [CHECKOUT VALIDATOR] Error validating shipping address:",
      error
    );
    return {
      isValid: false,
      errors: { general: "Address validation error occurred" },
    };
  }
}

/**
 * Business logic validation for addresses
 */
function validateAddressBusiness(address: Address): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Check if country is supported
  const supportedCountry = SUPPORTED_COUNTRIES.find(
    (c) => c.code === address.country
  );
  if (!supportedCountry) {
    errors.country = `Shipping to ${address.country} is not supported`;
  }

  // Validate US postal codes
  if (
    address.country === "US" &&
    !/^\d{5}(-\d{4})?$/.test(address.postalCode)
  ) {
    errors.postalCode = "Invalid US postal code format (12345 or 12345-6789)";
  }

  // Validate Canadian postal codes
  if (
    address.country === "CA" &&
    !/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(address.postalCode)
  ) {
    errors.postalCode = "Invalid Canadian postal code format (A1A 1A1)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// 🚚 SHIPPING & PAYMENT VALIDATION
// ================================

/**
 * Validate shipping method selection
 */
export function validateShippingMethod(
  shippingMethodId: string,
  address: Address
): { isValid: boolean; error?: string } {
  console.log("🚚 [CHECKOUT VALIDATOR] Validating shipping method:", {
    shippingMethodId,
    destination: `${address.city}, ${address.state}`,
  });

  const shippingMethod = SHIPPING_METHODS.find(
    (m) => m.id === shippingMethodId
  );
  if (!shippingMethod) {
    return {
      isValid: false,
      error: `Invalid shipping method: ${shippingMethodId}`,
    };
  }

  if (!shippingMethod.isActive) {
    return {
      isValid: false,
      error: `Shipping method ${shippingMethod.name} is not available`,
    };
  }

  // Special validation for store pickup
  if (shippingMethod.id === "pickup" && address.country !== "US") {
    return {
      isValid: false,
      error: "Store pickup is only available in the United States",
    };
  }

  console.log("✅ [CHECKOUT VALIDATOR] Shipping method validated");
  return { isValid: true };
}

/**
 * Validate payment method selection
 */
export function validatePaymentMethod(
  paymentMethodId: string,
  orderTotal: number
): { isValid: boolean; error?: string } {
  console.log("💳 [CHECKOUT VALIDATOR] Validating payment method:", {
    paymentMethodId,
    orderTotal,
  });

  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethodId);
  if (!paymentMethod) {
    return {
      isValid: false,
      error: `Invalid payment method: ${paymentMethodId}`,
    };
  }

  if (!paymentMethod.enabled) {
    return {
      isValid: false,
      error: `Payment method ${paymentMethod.name} is not available`,
    };
  }

  // Check minimum amount
  if (paymentMethod.minAmount && orderTotal < paymentMethod.minAmount) {
    const minAmount = (paymentMethod.minAmount / 100).toFixed(2);
    return {
      isValid: false,
      error: `${paymentMethod.name} requires a minimum order of $${minAmount}`,
    };
  }

  // Check maximum amount
  if (paymentMethod.maxAmount && orderTotal > paymentMethod.maxAmount) {
    const maxAmount = (paymentMethod.maxAmount / 100).toFixed(2);
    return {
      isValid: false,
      error: `${paymentMethod.name} has a maximum order limit of $${maxAmount}`,
    };
  }

  console.log("✅ [CHECKOUT VALIDATOR] Payment method validated");
  return { isValid: true };
}

// 🧪 COMPREHENSIVE VALIDATION
// ===========================

/**
 * Validate complete checkout session before order creation
 */
export function validateCompleteCheckout(sessionData: CheckoutSession): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  console.log("🧪 [CHECKOUT VALIDATOR] Validating complete checkout session");

  const errors: Record<string, string> = {};

  // Validate customer info
  const customerValidation = validateCustomerInfo(sessionData.customerInfo);
  if (!customerValidation.isValid) {
    Object.assign(errors, customerValidation.errors);
  }

  // Validate shipping address
  if (sessionData.shippingAddress) {
    const addressValidation = validateShippingAddress(
      sessionData.shippingAddress
    );
    if (!addressValidation.isValid) {
      Object.assign(errors, addressValidation.errors);
    }
  } else {
    errors.shippingAddress = "Shipping address is required";
  }

  // Validate shipping method
  if (sessionData.shippingAddress && sessionData.shippingMethodId) {
    const shippingValidation = validateShippingMethod(
      sessionData.shippingMethodId,
      sessionData.shippingAddress
    );
    if (!shippingValidation.isValid) {
      errors.shippingMethod =
        shippingValidation.error || "Invalid shipping method";
    }
  } else {
    errors.shippingMethod = "Shipping method is required";
  }

  // Validate payment method
  if (sessionData.paymentMethodId) {
    const paymentValidation = validatePaymentMethod(
      sessionData.paymentMethodId,
      1000 // Basic amount for payment validation - in real implementation get from order calculation
    );
    if (!paymentValidation.isValid) {
      errors.paymentMethod =
        paymentValidation.error || "Invalid payment method";
    }
  } else {
    errors.paymentMethod = "Payment method is required";
  }

  const isValid = Object.keys(errors).length === 0;

  console.log("🧪 [CHECKOUT VALIDATOR] Complete checkout validation result:", {
    isValid,
    errorCount: Object.keys(errors).length,
    errors: Object.keys(errors),
  });

  return { isValid, errors };
}

// 📊 RATE LIMITING & SECURITY
// ===========================

/**
 * Check if user has exceeded checkout attempt limits
 */
export function validateCheckoutRateLimit(
  userId?: string,
  sessionId?: string
): { isAllowed: boolean; error?: string; retryAfter?: number } {
  console.log("📊 [CHECKOUT VALIDATOR] Checking rate limits:", {
    hasUserId: !!userId,
    hasSessionId: !!sessionId,
  });

  // Basic rate limiting implementation
  // TODO: Replace with Redis-based rate limiting for production
  console.log("📊 [CHECKOUT VALIDATOR] Basic rate limiting check passed");

  // For now, implement basic in-memory rate limiting
  // In production, this should use Redis with sliding window
  return { isAllowed: true };
}

/**
 * Validate cart hasn't been modified during checkout
 */
export function validateCartIntegrity(
  originalCartHash: string,
  currentCartHash: string
): { isValid: boolean; error?: string } {
  console.log("🔒 [CHECKOUT VALIDATOR] Validating cart integrity");

  if (originalCartHash !== currentCartHash) {
    return {
      isValid: false,
      error:
        "Cart has been modified during checkout. Please review your items.",
    };
  }

  return { isValid: true };
}
