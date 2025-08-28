/**
 * 🛒 CART VALIDATORS
 * ==================
 *
 * Server-side validation layer for Cart operations
 * Clean Architecture: Infrastructure Layer (Validation)
 * Following Feature-First v3.0.0 patterns
 *
 * @version 1.0.0 - Cart Feature
 */

import { z } from "zod";
import type {
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  CartValidationResult,
} from "../types";

// 🔐 PERMISSIONS SYSTEM
import { hasPermission, type PermissionUser } from "@/core/auth/permissions";
import {
  requireAuth,
  getServerSession,
  type Session,
} from "@/core/auth/server";

// 💢 CUSTOM VALIDATION ERRORS
// ===========================

export class CartValidationError extends Error {
  code: string;
  statusCode: number;

  constructor(
    message: string,
    code: string = "CART_VALIDATION_ERROR",
    statusCode: number = 400
  ) {
    super(message);
    this.name = "CartValidationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class CartAccessError extends Error {
  code: string;
  statusCode: number;

  constructor(
    message: string,
    code: string = "CART_ACCESS_DENIED",
    statusCode: number = 403
  ) {
    super(message);
    this.name = "CartAccessError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// 📋 VALIDATION SCHEMAS
// ====================

/**
 * Add to cart input validation schema
 */
export const addToCartSchema = z
  .object({
    productId: z.string().cuid("Invalid product ID format"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(999, "Quantity cannot exceed 999")
      .optional()
      .default(1),
    userId: z.string().cuid("Invalid user ID format").optional(),
    sessionId: z.string().min(1, "Session ID cannot be empty").optional(),
  })
  .refine((data) => data.userId || data.sessionId, {
    message: "Either userId or sessionId must be provided",
    path: ["userId", "sessionId"],
  });

/**
 * Update cart item input validation schema
 */
export const updateCartItemSchema = z
  .object({
    cartItemId: z.string().cuid("Invalid cart item ID format"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(0, "Quantity cannot be negative")
      .max(999, "Quantity cannot exceed 999"),
    userId: z.string().cuid("Invalid user ID format").optional(),
    sessionId: z.string().min(1, "Session ID cannot be empty").optional(),
  })
  .refine((data) => data.userId || data.sessionId, {
    message: "Either userId or sessionId must be provided",
    path: ["userId", "sessionId"],
  });

/**
 * Remove from cart input validation schema
 */
export const removeFromCartSchema = z
  .object({
    cartItemId: z.string().cuid("Invalid cart item ID format"),
    userId: z.string().cuid("Invalid user ID format").optional(),
    sessionId: z.string().min(1, "Session ID cannot be empty").optional(),
  })
  .refine((data) => data.userId || data.sessionId, {
    message: "Either userId or sessionId must be provided",
    path: ["userId", "sessionId"],
  });

/**
 * Get cart input validation schema
 */
export const getCartSchema = z
  .object({
    userId: z.string().cuid("Invalid user ID format").optional(),
    sessionId: z.string().min(1, "Session ID cannot be empty").optional(),
  })
  .refine((data) => data.userId || data.sessionId, {
    message: "Either userId or sessionId must be provided",
    path: ["userId", "sessionId"],
  });

/**
 * Sync cart input validation schema
 */
export const syncCartSchema = z.object({
  guestSessionId: z.string().min(1, "Guest session ID is required"),
  userId: z.string().cuid("Invalid user ID format"),
  mergeStrategy: z
    .enum(["replace", "merge", "keep_latest"])
    .optional()
    .default("merge"),
});

// 🔐 PERMISSION VALIDATORS
// ========================

/**
 * Validate cart access permissions
 */
export async function validateCartAccess(
  session: Session,
  userId?: string
): Promise<PermissionUser> {
  try {
    console.log("🔐 [CART VALIDATOR] Validating cart access:", {
      userId,
      hasSession: !!session,
    });

    const permissionUser = sessionToPermissionUser(session);

    // If userId is provided, validate user can access this cart
    if (userId) {
      // Users can only access their own carts unless they're admin
      if (permissionUser.id !== userId) {
        const isAdmin = await hasPermission(permissionUser, "admin:read");
        if (!isAdmin) {
          throw new CartAccessError(
            "You can only access your own cart",
            "CART_ACCESS_DENIED_USER_MISMATCH"
          );
        }
      }
    }

    console.log("✅ [CART VALIDATOR] Cart access validated");
    return permissionUser;
  } catch (error) {
    console.error("❌ [CART VALIDATOR] Cart access validation failed:", error);
    if (error instanceof CartAccessError) {
      throw error;
    }
    throw new CartAccessError("Cart access validation failed");
  }
}

/**
 * Validate cart ownership (for cart items operations)
 */
export async function validateCartOwnership(
  cartUserId: string | null,
  cartSessionId: string | null,
  requestUserId?: string,
  requestSessionId?: string
): Promise<boolean> {
  try {
    console.log("🔐 [CART VALIDATOR] Validating cart ownership:", {
      cartUserId,
      cartSessionId: !!cartSessionId,
      requestUserId,
      requestSessionId: !!requestSessionId,
    });

    // If cart has userId, check user match
    if (cartUserId) {
      if (!requestUserId || cartUserId !== requestUserId) {
        throw new CartAccessError(
          "Cart does not belong to the requesting user",
          "CART_OWNERSHIP_MISMATCH_USER"
        );
      }
      return true;
    }

    // If cart has sessionId, check session match
    if (cartSessionId) {
      if (!requestSessionId || cartSessionId !== requestSessionId) {
        throw new CartAccessError(
          "Cart does not belong to the requesting session",
          "CART_OWNERSHIP_MISMATCH_SESSION"
        );
      }
      return true;
    }

    throw new CartAccessError(
      "Cart has no valid ownership identifier",
      "CART_OWNERSHIP_INVALID"
    );
  } catch (error) {
    console.error(
      "❌ [CART VALIDATOR] Cart ownership validation failed:",
      error
    );
    if (error instanceof CartAccessError) {
      throw error;
    }
    throw new CartAccessError("Cart ownership validation failed");
  }
}

// 🧪 INPUT VALIDATORS
// ===================

/**
 * Validate add to cart input
 */
export function validateCartItemInput(
  input: AddToCartInput
): CartValidationResult {
  try {
    console.log("✅ [CART VALIDATOR] Validating add to cart input:", input);

    const result = addToCartSchema.safeParse(input);

    if (!result.success) {
      // ✅ Safe access to errors array to prevent undefined errors
      const zodErrors = result.error?.errors || [];
      const errors = zodErrors.map((err) => ({
        type: "INVALID_QUANTITY" as const,
        message: err.message,
        productId: input.productId,
      }));

      return {
        isValid: false,
        errors,
        warnings: [],
      };
    }

    // Additional business logic validation
    const warnings: CartValidationResult["warnings"] = [];

    // Check for large quantities (warning only)
    if (result.data.quantity > 50) {
      warnings.push({
        type: "INVALID_QUANTITY",
        message: `Large quantity requested: ${result.data.quantity}`,
        productId: input.productId,
      });
    }

    console.log("✅ [CART VALIDATOR] Add to cart input validated successfully");

    return {
      isValid: true,
      errors: [],
      warnings,
    };
  } catch (error) {
    console.error(
      "❌ [CART VALIDATOR] Add to cart input validation failed:",
      error
    );
    return {
      isValid: false,
      errors: [
        {
          type: "VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Validation failed",
          productId: input.productId,
        },
      ],
      warnings: [],
    };
  }
}

/**
 * Validate update cart item input
 */
export function validateUpdateCartItemInput(
  input: UpdateCartItemInput
): CartValidationResult {
  try {
    console.log(
      "✅ [CART VALIDATOR] Validating update cart item input:",
      input
    );

    const result = updateCartItemSchema.safeParse(input);

    if (!result.success) {
      // ✅ Safe access to errors array to prevent undefined errors
      const zodErrors = result.error?.errors || [];
      const errors = zodErrors.map((err) => ({
        type: "INVALID_QUANTITY" as const,
        message: err.message,
        cartItemId: input.cartItemId,
      }));

      return {
        isValid: false,
        errors,
        warnings: [],
      };
    }

    console.log(
      "✅ [CART VALIDATOR] Update cart item input validated successfully"
    );

    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  } catch (error) {
    console.error(
      "❌ [CART VALIDATOR] Update cart item input validation failed:",
      error
    );
    return {
      isValid: false,
      errors: [
        {
          type: "VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Validation failed",
          cartItemId: input.cartItemId,
        },
      ],
      warnings: [],
    };
  }
}

/**
 * Validate remove from cart input
 */
export function validateRemoveFromCartInput(
  input: RemoveFromCartInput
): CartValidationResult {
  try {
    console.log(
      "✅ [CART VALIDATOR] Validating remove from cart input:",
      input
    );

    const result = removeFromCartSchema.safeParse(input);

    if (!result.success) {
      // ✅ Safe access to errors array to prevent undefined errors
      const zodErrors = result.error?.errors || [];
      const errors = zodErrors.map((err) => ({
        type: "VALIDATION_ERROR" as const,
        message: err.message,
        cartItemId: input.cartItemId,
      }));

      return {
        isValid: false,
        errors,
        warnings: [],
      };
    }

    console.log(
      "✅ [CART VALIDATOR] Remove from cart input validated successfully"
    );

    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  } catch (error) {
    console.error(
      "❌ [CART VALIDATOR] Remove from cart input validation failed:",
      error
    );
    return {
      isValid: false,
      errors: [
        {
          type: "VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Validation failed",
          cartItemId: input.cartItemId,
        },
      ],
      warnings: [],
    };
  }
}

// 🛠️ UTILITY FUNCTIONS
// =====================

/**
 * Convert session to permission user (cart-specific)
 */
export function sessionToPermissionUser(session: Session): PermissionUser {
  if (!session?.user?.id) {
    throw new CartAccessError(
      "Invalid session - no user ID",
      "INVALID_SESSION"
    );
  }

  return {
    id: session.user.id,
    email: session.user.email || "",
    role: session.user.role || "USER",
  };
}

/**
 * Sanitize cart input for logging (remove sensitive data)
 */
export function sanitizeCartInput(input: any): any {
  return {
    ...input,
    sessionId: input.sessionId ? "[REDACTED]" : undefined,
  };
}

/**
 * Check if cart is expired
 */
export function isCartExpired(expiresAt: Date): boolean {
  return expiresAt <= new Date();
}

/**
 * Generate new cart expiry date
 */
export function generateCartExpiryDate(daysFromNow: number = 30): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysFromNow);
  return expiry;
}

// 📊 VALIDATION RESULT HELPERS
// ============================

/**
 * Check if validation result has errors
 */
export function hasValidationErrors(result: CartValidationResult): boolean {
  return !result.isValid || result.errors.length > 0;
}

/**
 * Check if validation result has warnings
 */
export function hasValidationWarnings(result: CartValidationResult): boolean {
  return result.warnings.length > 0;
}

/**
 * Get validation summary message
 */
export function getValidationSummaryMessage(
  result: CartValidationResult
): string {
  if (result.isValid && result.warnings.length === 0) {
    return "Validation passed";
  }

  if (!result.isValid) {
    return `Validation failed: ${result.errors
      .map((e) => e.message)
      .join(", ")}`;
  }

  return `Validation passed with warnings: ${result.warnings
    .map((w) => w.message)
    .join(", ")}`;
}

export default {};
