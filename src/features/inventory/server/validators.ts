/**
 * 📦 INVENTORY VALIDATORS
 * ======================
 * 
 * Server-side validation layer para Inventory Management
 * Clean Architecture: Infrastructure Layer (Validation)
 * 
 * Created: 2025-01-17 - Inventory Management Module
 */

import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  createSupplierSchema,
  createStockMovementSchema,
  productFiltersSchema,
  categoryFiltersSchema,
  supplierFiltersSchema,
  paginationParamsSchema,
} from "../schemas";
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  CreateSupplierInput,
  CreateStockMovementInput,
  ProductFilters,
  CategoryFilters,
  SupplierFilters,
  PaginationParams,
} from "../types";

// 🛡️ PERMISSION VALIDATION
export async function validateInventoryPermissions(
  user: any,
  action: string
): Promise<void> {
  // TODO: Implement proper RBAC permission checking
  if (!user) {
    throw new Error("Authentication required");
  }

  // Basic role-based checks
  const adminActions = [
    "DELETE_PRODUCT",
    "DELETE_CATEGORY", 
    "DELETE_SUPPLIER",
    "CREATE_SUPPLIER",
    "UPDATE_SUPPLIER",
  ];

  if (adminActions.includes(action) && user.role !== "admin") {
    throw new Error(`Insufficient permissions for ${action}`);
  }

  // TODO: Implement more granular permissions
  // - Module-specific permissions
  // - Resource-level permissions
  // - Context-aware permissions
}

// 📦 PRODUCT VALIDATION
export function validateCreateProduct(input: unknown): CreateProductInput {
  try {
    return createProductSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Product validation failed", error.errors);
    }
    throw new Error("Invalid product data");
  }
}

export function validateUpdateProduct(input: unknown): UpdateProductInput {
  try {
    return updateProductSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Product update validation failed", error.errors);
    }
    throw new Error("Invalid product update data");
  }
}

// 🏷️ CATEGORY VALIDATION
export function validateCreateCategory(input: unknown): CreateCategoryInput {
  try {
    return createCategorySchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Category validation failed", error.errors);
    }
    throw new Error("Invalid category data");
  }
}

// 🚛 SUPPLIER VALIDATION
export function validateCreateSupplier(input: unknown): CreateSupplierInput {
  try {
    return createSupplierSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Supplier validation failed", error.errors);
    }
    throw new Error("Invalid supplier data");
  }
}

// 📊 STOCK MOVEMENT VALIDATION
export function validateCreateStockMovement(
  input: unknown
): CreateStockMovementInput {
  try {
    return createStockMovementSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        "Stock movement validation failed",
        error.errors
      );
    }
    throw new Error("Invalid stock movement data");
  }
}

// 🔍 FILTER VALIDATION
export function validateProductFilters(input: unknown): ProductFilters {
  try {
    return productFiltersSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Product filters validation failed", error.errors);
    }
    throw new Error("Invalid product filters");
  }
}

export function validateCategoryFilters(input: unknown): CategoryFilters {
  try {
    return categoryFiltersSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        "Category filters validation failed",
        error.errors
      );
    }
    throw new Error("Invalid category filters");
  }
}

export function validateSupplierFilters(input: unknown): SupplierFilters {
  try {
    return supplierFiltersSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        "Supplier filters validation failed",
        error.errors
      );
    }
    throw new Error("Invalid supplier filters");
  }
}

export function validatePagination(input: unknown): PaginationParams {
  try {
    return paginationParamsSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Pagination validation failed", error.errors);
    }
    throw new Error("Invalid pagination parameters");
  }
}

// 🧠 BUSINESS RULE VALIDATION
export class BusinessRuleValidator {
  static validateProductBusinessRules(input: CreateProductInput): void {
    // Price must be greater than cost
    if (input.price <= input.cost) {
      throw new BusinessRuleError(
        "Price must be greater than cost",
        "PRICE_COST_VALIDATION"
      );
    }

    // Stock cannot be negative
    if (input.stock < 0) {
      throw new BusinessRuleError(
        "Stock cannot be negative",
        "NEGATIVE_STOCK"
      );
    }

    // Min stock cannot be greater than max stock
    if (input.maxStock && input.minStock > input.maxStock) {
      throw new BusinessRuleError(
        "Minimum stock cannot be greater than maximum stock",
        "MIN_MAX_STOCK_VALIDATION"
      );
    }

    // SKU format validation (business-specific)
    this.validateSkuFormat(input.sku);

    // Image limit validation
    if (input.images && input.images.length > 10) {
      throw new BusinessRuleError(
        "Maximum 10 images allowed per product",
        "IMAGE_LIMIT_EXCEEDED"
      );
    }

    // Tag limit validation
    if (input.tags && input.tags.length > 20) {
      throw new BusinessRuleError(
        "Maximum 20 tags allowed per product",
        "TAG_LIMIT_EXCEEDED"
      );
    }
  }

  static validateProductUpdateBusinessRules(
    input: UpdateProductInput,
    existingProduct?: any
  ): void {
    // Price validation
    if (input.price !== undefined && input.cost !== undefined) {
      if (input.price <= input.cost) {
        throw new BusinessRuleError(
          "Price must be greater than cost",
          "PRICE_COST_VALIDATION"
        );
      }
    }

    // Cannot reduce stock below reserved quantities (future feature)
    // if (input.stock !== undefined && existingProduct) {
    //   const reservedStock = await getReservedStock(existingProduct.id);
    //   if (input.stock < reservedStock) {
    //     throw new BusinessRuleError(
    //       "Cannot reduce stock below reserved quantities",
    //       "INSUFFICIENT_AVAILABLE_STOCK"
    //     );
    //   }
    // }
  }

  static validateStockMovementBusinessRules(
    input: CreateStockMovementInput,
    currentStock?: number
  ): void {
    // OUT movements cannot exceed current stock
    if (input.type === "OUT" && currentStock !== undefined) {
      if (input.quantity > currentStock) {
        throw new BusinessRuleError(
          "Cannot remove more stock than available",
          "INSUFFICIENT_STOCK"
        );
      }
    }

    // Quantity must be positive
    if (input.quantity <= 0) {
      throw new BusinessRuleError(
        "Movement quantity must be positive",
        "INVALID_QUANTITY"
      );
    }

    // ADJUSTMENT movements have special rules
    if (input.type === "ADJUSTMENT") {
      // Validate adjustment reason is provided
      if (!input.reason || input.reason.trim().length < 10) {
        throw new BusinessRuleError(
          "Adjustment movements require detailed reason (min 10 characters)",
          "INSUFFICIENT_ADJUSTMENT_REASON"
        );
      }
    }
  }

  private static validateSkuFormat(sku: string): void {
    // Business rule: SKU should follow company format
    // Example: Product type + variant + optional suffix
    // This is just an example - adjust to your business needs
    
    if (sku.length < 3) {
      throw new BusinessRuleError(
        "SKU must be at least 3 characters",
        "SKU_TOO_SHORT"
      );
    }

    // Check for invalid characters (business-specific)
    if (!/^[A-Z0-9\-_]+$/i.test(sku)) {
      throw new BusinessRuleError(
        "SKU can only contain letters, numbers, hyphens, and underscores",
        "INVALID_SKU_FORMAT"
      );
    }
  }
}

// 🔐 SECURITY VALIDATION
export class SecurityValidator {
  static validateImageUrls(images: string[]): void {
    for (const url of images) {
      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new SecurityError("Invalid image URL format", "INVALID_URL");
      }

      // Check for allowed domains (security)
      const allowedDomains = [
        "example.com",
        "images.example.com",
        "cdn.example.com",
        // Add your trusted domains
      ];

      const urlObj = new URL(url);
      if (!allowedDomains.some(domain => urlObj.hostname.endsWith(domain))) {
        throw new SecurityError(
          "Image URL domain not allowed",
          "UNTRUSTED_DOMAIN"
        );
      }

      // Check file extension
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
      const hasValidExtension = allowedExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        throw new SecurityError(
          "Invalid image file extension",
          "INVALID_FILE_TYPE"
        );
      }
    }
  }

  static sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    // Remove potentially dangerous properties
    const sanitized = { ...metadata };
    
    // Remove functions, undefined, symbols
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      if (
        typeof value === "function" ||
        typeof value === "undefined" ||
        typeof value === "symbol"
      ) {
        delete sanitized[key];
      }
    });

    // Limit nesting depth to prevent JSON bombs
    const maxDepth = 3;
    function limitDepth(obj: any, depth: number): any {
      if (depth > maxDepth || typeof obj !== "object" || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(item => limitDepth(item, depth + 1));
      }

      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = limitDepth(value, depth + 1);
      }
      return result;
    }

    return limitDepth(sanitized, 0);
  }
}

// 🚨 CUSTOM ERROR CLASSES
export class ValidationError extends Error {
  public readonly code = "VALIDATION_ERROR";
  public readonly details: any[];

  constructor(message: string, details: any[] = []) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class BusinessRuleError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "BusinessRuleError";
    this.code = code;
  }
}

export class SecurityError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "SecurityError";
    this.code = code;
  }
}

// 🔧 VALIDATOR UTILITIES
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isBusinessRuleError(error: unknown): error is BusinessRuleError {
  return error instanceof BusinessRuleError;
}

export function isSecurityError(error: unknown): error is SecurityError {
  return error instanceof SecurityError;
}

export function formatValidationErrors(errors: z.ZodIssue[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  errors.forEach(error => {
    const path = error.path.join(".");
    formatted[path] = error.message;
  });
  
  return formatted;
}

// 📊 VALIDATION METRICS (for monitoring)
export class ValidationMetrics {
  private static validationCounts = new Map<string, number>();
  private static errorCounts = new Map<string, number>();

  static recordValidation(validator: string): void {
    const current = this.validationCounts.get(validator) || 0;
    this.validationCounts.set(validator, current + 1);
  }

  static recordValidationError(validator: string, errorType: string): void {
    const key = `${validator}:${errorType}`;
    const current = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, current + 1);
  }

  static getMetrics() {
    return {
      validations: Object.fromEntries(this.validationCounts),
      errors: Object.fromEntries(this.errorCounts),
    };
  }

  static reset(): void {
    this.validationCounts.clear();
    this.errorCounts.clear();
  }
}
