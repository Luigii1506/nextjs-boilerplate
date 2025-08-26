/**
 * 🛒 STOREFRONT VALIDATORS
 * =======================
 *
 * Server-side validation layer para Customer-facing Storefront
 * Clean Architecture: Infrastructure Layer (Validation)
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

import { z } from "zod";
import {
  productFiltersCustomerSchema,
  categoryFiltersCustomerSchema,
  addToWishlistSchema,
  removeFromWishlistSchema,
  addToCartSchema,
  updateCartItemSchema,
} from "../schemas";
import type {
  ProductFiltersCustomer,
  CategoryFiltersCustomer,
  AddToWishlistInput,
  RemoveFromWishlistInput,
  AddToCartInput,
  UpdateCartItemInput,
} from "../types";

// 🔐 PERMISSIONS SYSTEM
import {
  hasPermission,
  type PermissionUser,
} from "../../../core/auth/permissions";
import {
  requireAuth,
  getServerSession,
  type Session,
} from "../../../core/auth/server";

// 💢 CUSTOM VALIDATION ERRORS
// ===========================

export class StorefrontValidationError extends Error {
  code: string;
  statusCode: number;

  constructor(
    message: string,
    code: string = "STOREFRONT_VALIDATION_ERROR",
    statusCode: number = 400
  ) {
    super(message);
    this.name = "StorefrontValidationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class StorefrontAuthError extends Error {
  code: string;
  statusCode: number;

  constructor(
    message: string,
    code: string = "STOREFRONT_AUTH_ERROR",
    statusCode: number = 401
  ) {
    super(message);
    this.name = "StorefrontAuthError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class StorefrontPermissionError extends Error {
  code: string;
  statusCode: number;

  constructor(
    message: string,
    code: string = "STOREFRONT_PERMISSION_ERROR",
    statusCode: number = 403
  ) {
    super(message);
    this.name = "StorefrontPermissionError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// 🔄 SESSION TO PERMISSION USER CONVERTER
export function sessionToPermissionUser(
  session: Session | null
): PermissionUser {
  if (!session?.user) {
    throw new StorefrontAuthError("Authentication required - no valid session");
  }

  return {
    id: session.user.id,
    role: session.user.role || "user",
    permissions: [], // Better Auth handles permissions via role
  } satisfies PermissionUser;
}

// 🔍 SESSION VALIDATION HELPERS
// =============================

export async function getValidatedSession(): Promise<Session> {
  try {
    return await requireAuth();
  } catch (error) {
    throw new StorefrontAuthError("Authentication required for this action");
  }
}

export async function getOptionalValidatedSession(): Promise<Session | null> {
  try {
    return await getServerSession();
  } catch (error) {
    // Optional session - return null if not available
    return null;
  }
}

// 🛡️ STOREFRONT ACCESS VALIDATION
// ===============================

export function validateStorefrontAccess(): void {
  // TODO: Add feature flag validation
  // if (!isFeatureFlagEnabled("STOREFRONT_MODULE")) {
  //   throw new StorefrontValidationError("Storefront module is not available");
  // }

  // TODO: Add rate limiting
  // Basic validation for now - this is a public endpoint
  console.log("[StorefrontValidator] Access validated");
}

// 🏷️ PERMISSION ACTIONS FOR STOREFRONT
type StorefrontPermissionAction =
  | "READ_PRODUCTS"
  | "READ_CATEGORIES"
  | "READ_WISHLIST"
  | "WRITE_WISHLIST"
  | "READ_CART"
  | "WRITE_CART"
  | "READ_ORDERS"
  | "WRITE_ORDERS";

// 🔒 CUSTOMER PERMISSION VALIDATION
// =================================

export function validateCustomerPermissions(
  user: PermissionUser,
  action: StorefrontPermissionAction,
  context?: { userId?: string; productId?: string; cartId?: string }
): void {
  if (!user) {
    throw new StorefrontAuthError(
      "Authentication required for customer actions"
    );
  }

  // 🎯 Customer-specific permissions
  switch (action) {
    case "READ_PRODUCTS":
    case "READ_CATEGORIES":
      // Public read access - anyone can read
      break;

    case "READ_WISHLIST":
    case "WRITE_WISHLIST":
      // Users can only access their own wishlist
      if (context?.userId && context.userId !== user.id) {
        throw new StorefrontPermissionError(
          "Users can only access their own wishlist"
        );
      }
      break;

    case "READ_CART":
    case "WRITE_CART":
      // Users can only access their own cart
      if (context?.userId && context.userId !== user.id) {
        throw new StorefrontPermissionError(
          "Users can only access their own cart"
        );
      }
      break;

    case "READ_ORDERS":
    case "WRITE_ORDERS":
      // Users can only access their own orders
      if (context?.userId && context.userId !== user.id) {
        throw new StorefrontPermissionError(
          "Users can only access their own orders"
        );
      }
      break;

    default:
      throw new StorefrontPermissionError(
        `Unknown permission action: ${action}`
      );
  }

  console.log(
    `[StorefrontValidator] Permission validated: ${action} for user ${user.id}`
  );
}

// 📋 INPUT VALIDATION FUNCTIONS
// =============================

export function validateProductFilters(input: unknown): ProductFiltersCustomer {
  try {
    return productFiltersCustomerSchema.parse(input || {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new StorefrontValidationError(
        `Invalid product filters: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
        "INVALID_PRODUCT_FILTERS"
      );
    }
    throw error;
  }
}

export function validateCategoryFilters(
  input: unknown
): CategoryFiltersCustomer {
  try {
    return categoryFiltersCustomerSchema.parse(input || {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new StorefrontValidationError(
        `Invalid category filters: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
        "INVALID_CATEGORY_FILTERS"
      );
    }
    throw error;
  }
}

export function validateWishlistInput(input: {
  userId: string;
  productId: string;
}): { userId: string; productId: string } {
  try {
    // Basic validation
    if (!input.userId || !input.productId) {
      throw new StorefrontValidationError("UserId and ProductId are required");
    }

    if (
      typeof input.userId !== "string" ||
      typeof input.productId !== "string"
    ) {
      throw new StorefrontValidationError(
        "UserId and ProductId must be strings"
      );
    }

    if (
      input.userId.trim().length === 0 ||
      input.productId.trim().length === 0
    ) {
      throw new StorefrontValidationError(
        "UserId and ProductId cannot be empty"
      );
    }

    return {
      userId: input.userId.trim(),
      productId: input.productId.trim(),
    };
  } catch (error) {
    if (error instanceof StorefrontValidationError) {
      throw error;
    }
    throw new StorefrontValidationError("Invalid wishlist input");
  }
}

export function validateCartInput(input: unknown): AddToCartInput {
  try {
    return addToCartSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new StorefrontValidationError(
        `Invalid cart input: ${error.errors.map((e) => e.message).join(", ")}`,
        "INVALID_CART_INPUT"
      );
    }
    throw error;
  }
}

export function validateUpdateCartInput(input: unknown): UpdateCartItemInput {
  try {
    return updateCartItemSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new StorefrontValidationError(
        `Invalid cart update input: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
        "INVALID_CART_UPDATE_INPUT"
      );
    }
    throw error;
  }
}

// 🔍 BUSINESS RULE VALIDATORS
// ===========================

export function validatePaginationLimits(page: number, limit: number): void {
  const MAX_LIMIT = 100;
  const MAX_PAGE = 1000;

  if (limit > MAX_LIMIT) {
    throw new StorefrontValidationError(
      `Limit cannot exceed ${MAX_LIMIT}`,
      "LIMIT_EXCEEDED"
    );
  }

  if (page > MAX_PAGE) {
    throw new StorefrontValidationError(
      `Page cannot exceed ${MAX_PAGE}`,
      "PAGE_EXCEEDED"
    );
  }
}

export function validateSearchLength(searchTerm: string): void {
  const MIN_SEARCH_LENGTH = 2;
  const MAX_SEARCH_LENGTH = 100;

  if (searchTerm && searchTerm.length < MIN_SEARCH_LENGTH) {
    throw new StorefrontValidationError(
      `Search term must be at least ${MIN_SEARCH_LENGTH} characters`,
      "SEARCH_TOO_SHORT"
    );
  }

  if (searchTerm && searchTerm.length > MAX_SEARCH_LENGTH) {
    throw new StorefrontValidationError(
      `Search term cannot exceed ${MAX_SEARCH_LENGTH} characters`,
      "SEARCH_TOO_LONG"
    );
  }
}

// 🧮 COMPUTED VALIDATION HELPERS
// ==============================

export function validateUserOwnResource(
  userId: string,
  resourceOwnerId: string,
  resourceType: string
): void {
  if (userId !== resourceOwnerId) {
    throw new StorefrontPermissionError(
      `User can only access their own ${resourceType}`,
      "RESOURCE_ACCESS_DENIED"
    );
  }
}

export function sanitizeSearchTerm(searchTerm?: string): string | undefined {
  if (!searchTerm) return undefined;

  // Basic sanitization
  return searchTerm
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 100); // Max length
}

// 📊 RATE LIMITING VALIDATORS (TODO)
// ==================================

export function validateRateLimit(userId: string, action: string): void {
  // TODO: Implement rate limiting validation
  // For now, just log
  console.log(
    `[StorefrontValidator] Rate limit check for user ${userId}, action: ${action}`
  );
}
