/**
 * 🚛 SUPPLIER VALIDATORS
 * =======================
 *
 * Input validation for supplier operations
 *
 * Created: 2025-01-17 - Refactored from inventory
 */

import { SUPPLIER_VALIDATION, SUPPLIER_DEFAULTS } from "../constants";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
} from "@/shared/types/supplier";

/**
 * Validate create supplier input
 */
export function validateCreateSupplier(
  input: CreateSupplierInput
): CreateSupplierInput {
  // Name validation
  if (
    !input.name ||
    input.name.trim().length < SUPPLIER_VALIDATION.NAME_MIN_LENGTH
  ) {
    throw new Error(
      `Supplier name must be at least ${SUPPLIER_VALIDATION.NAME_MIN_LENGTH} characters`
    );
  }

  if (input.name.length > SUPPLIER_VALIDATION.NAME_MAX_LENGTH) {
    throw new Error(
      `Supplier name must not exceed ${SUPPLIER_VALIDATION.NAME_MAX_LENGTH} characters`
    );
  }

  // Email validation
  if (input.email) {
    if (!SUPPLIER_VALIDATION.EMAIL_PATTERN.test(input.email)) {
      throw new Error("Invalid email format");
    }
  }

  // Phone validation - only validate if not empty
  if (input.phone && input.phone.trim() !== "") {
    if (!SUPPLIER_VALIDATION.PHONE_PATTERN.test(input.phone)) {
      throw new Error("Invalid phone format");
    }
  }

  // Rating validation
  if (input.rating !== undefined && input.rating !== null) {
    if (
      input.rating < SUPPLIER_VALIDATION.RATING_MIN ||
      input.rating > SUPPLIER_VALIDATION.RATING_MAX
    ) {
      throw new Error(
        `Rating must be between ${SUPPLIER_VALIDATION.RATING_MIN} and ${SUPPLIER_VALIDATION.RATING_MAX}`
      );
    }
  }

  // Payment terms validation
  if (input.paymentTerms !== undefined) {
    if (input.paymentTerms < 0) {
      throw new Error("Payment terms must be positive");
    }
  }

  return {
    ...input,
    name: input.name.trim(),
    paymentTerms: input.paymentTerms ?? SUPPLIER_DEFAULTS.PAYMENT_TERMS,
    country: input.country ?? SUPPLIER_DEFAULTS.COUNTRY,
  };
}

/**
 * Validate update supplier input
 */
export function validateUpdateSupplier(
  input: UpdateSupplierInput
): UpdateSupplierInput {
  if (!input.id) {
    throw new Error("Supplier ID is required for update");
  }

  // Name validation (if provided)
  if (input.name !== undefined) {
    if (input.name.trim().length < SUPPLIER_VALIDATION.NAME_MIN_LENGTH) {
      throw new Error(
        `Supplier name must be at least ${SUPPLIER_VALIDATION.NAME_MIN_LENGTH} characters`
      );
    }

    if (input.name.length > SUPPLIER_VALIDATION.NAME_MAX_LENGTH) {
      throw new Error(
        `Supplier name must not exceed ${SUPPLIER_VALIDATION.NAME_MAX_LENGTH} characters`
      );
    }
  }

  // Email validation (if provided)
  if (input.email !== undefined && input.email !== null) {
    if (!SUPPLIER_VALIDATION.EMAIL_PATTERN.test(input.email)) {
      throw new Error("Invalid email format");
    }
  }

  // Phone validation (if provided and not empty)
  if (
    input.phone !== undefined &&
    input.phone !== null &&
    input.phone.trim() !== ""
  ) {
    if (!SUPPLIER_VALIDATION.PHONE_PATTERN.test(input.phone)) {
      throw new Error("Invalid phone format");
    }
  }

  // Rating validation (if provided)
  if (input.rating !== undefined && input.rating !== null) {
    if (
      input.rating < SUPPLIER_VALIDATION.RATING_MIN ||
      input.rating > SUPPLIER_VALIDATION.RATING_MAX
    ) {
      throw new Error(
        `Rating must be between ${SUPPLIER_VALIDATION.RATING_MIN} and ${SUPPLIER_VALIDATION.RATING_MAX}`
      );
    }
  }

  // Payment terms validation (if provided)
  if (input.paymentTerms !== undefined) {
    if (input.paymentTerms < 0) {
      throw new Error("Payment terms must be positive");
    }
  }

  return {
    ...input,
    name: input.name ? input.name.trim() : undefined,
  };
}

/**
 * Validate supplier filters
 */
export function validateSupplierFilters(
  filters: SupplierFilters
): SupplierFilters {
  const validated: SupplierFilters = { ...filters };

  // Validate minRating
  if (filters.minRating !== undefined) {
    if (
      filters.minRating < SUPPLIER_VALIDATION.RATING_MIN ||
      filters.minRating > SUPPLIER_VALIDATION.RATING_MAX
    ) {
      throw new Error(
        `minRating must be between ${SUPPLIER_VALIDATION.RATING_MIN} and ${SUPPLIER_VALIDATION.RATING_MAX}`
      );
    }
  }

  return validated;
}
