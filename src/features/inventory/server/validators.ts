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
  Product,
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
// 🔐 PERMISSIONS SYSTEM
import {
  hasPermission,
  inventoryPermissions,
  type PermissionUser,
} from "@/core/auth/permissions";
import type { Session } from "@/core/auth/server";

// 🔄 SESSION TO PERMISSION USER CONVERTER
export function sessionToPermissionUser(
  session: Session | null
): PermissionUser {
  if (!session?.user) {
    throw new ValidationError("Authentication required - no valid session");
  }

  return {
    id: session.user.id,
    role: session.user.role || "user",
    permissions: [], // Better Auth handles permissions via role
  } satisfies PermissionUser;
}

// 🛡️ INVENTORY PERMISSION VALIDATION
// ===================================
// Validación robusta usando el sistema centralizado de permisos

/**
 * Valida permisos de inventory usando el sistema centralizado
 * Reemplaza la validación básica anterior con un sistema granular y robusto
 */
export function validateInventoryPermissions(
  user: PermissionUser,
  action: InventoryPermissionAction
): void {
  if (!user) {
    throw new ValidationError("Authentication required");
  }

  // Map legacy actions to new permission system
  const actionMapping: Record<InventoryPermissionAction, () => boolean> = {
    // Products
    CREATE_PRODUCT: () => inventoryPermissions.canCreateProduct(user),
    READ_PRODUCT: () => inventoryPermissions.canReadProduct(user),
    UPDATE_PRODUCT: () => inventoryPermissions.canUpdateProduct(user),
    DELETE_PRODUCT: () => inventoryPermissions.canDeleteProduct(user),
    LIST_PRODUCTS: () => inventoryPermissions.canListProducts(user),
    SET_STOCK: () => inventoryPermissions.canSetStock(user),
    VIEW_COST: () => inventoryPermissions.canViewCost(user),

    // Categories
    CREATE_CATEGORY: () => inventoryPermissions.canCreateCategory(user),
    DELETE_CATEGORY: () => inventoryPermissions.canDeleteCategory(user),

    // Suppliers
    CREATE_SUPPLIER: () => inventoryPermissions.canCreateSupplier(user),
    UPDATE_SUPPLIER: () => hasPermission(user, "inventory_supplier:update"),
    DELETE_SUPPLIER: () => inventoryPermissions.canDeleteSupplier(user),

    // Stock Movements
    CREATE_STOCK_MOVEMENT: () =>
      inventoryPermissions.canCreateStockMovement(user),
    STOCK_ADJUSTMENT: () => inventoryPermissions.canMakeAdjustment(user),

    // Analytics
    VIEW_ANALYTICS: () => inventoryPermissions.canViewAnalytics(user),
    EXPORT_REPORTS: () => inventoryPermissions.canExportReports(user),
  };

  const permissionCheck = actionMapping[action];
  if (!permissionCheck) {
    throw new ValidationError(`Unknown inventory action: ${action}`);
  }

  if (!permissionCheck()) {
    throw new ValidationError(
      `Insufficient permissions for ${action}. Required role: ${
        user.role || "unknown"
      } lacks inventory permissions.`
    );
  }
}

// 🎯 INVENTORY PERMISSION ACTIONS
export type InventoryPermissionAction =
  | "CREATE_PRODUCT"
  | "READ_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT"
  | "LIST_PRODUCTS"
  | "SET_STOCK"
  | "VIEW_COST"
  | "CREATE_CATEGORY"
  | "DELETE_CATEGORY"
  | "CREATE_SUPPLIER"
  | "UPDATE_SUPPLIER"
  | "DELETE_SUPPLIER"
  | "CREATE_STOCK_MOVEMENT"
  | "STOCK_ADJUSTMENT"
  | "VIEW_ANALYTICS"
  | "EXPORT_REPORTS";

// 🔧 INVENTORY PERMISSION HELPERS
// ===============================
// Funciones de conveniencia para validaciones específicas

export function requireInventoryPermission(
  user: PermissionUser,
  action: InventoryPermissionAction
): void {
  try {
    validateInventoryPermissions(user, action);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Permission check failed: ${error}`);
  }
}

// Helpers específicos para cada recurso
export const inventoryValidators = {
  // Products
  canCreateProduct: (user: PermissionUser) => {
    requireInventoryPermission(user, "CREATE_PRODUCT");
  },
  canDeleteProduct: (user: PermissionUser) => {
    requireInventoryPermission(user, "DELETE_PRODUCT");
  },
  canUpdateProduct: (user: PermissionUser) => {
    requireInventoryPermission(user, "UPDATE_PRODUCT");
  },
  canViewCosts: (user: PermissionUser) => {
    requireInventoryPermission(user, "VIEW_COST");
  },

  // Categories
  canCreateCategory: (user: PermissionUser) => {
    requireInventoryPermission(user, "CREATE_CATEGORY");
  },
  canDeleteCategory: (user: PermissionUser) => {
    requireInventoryPermission(user, "DELETE_CATEGORY");
  },

  // Suppliers
  canManageSuppliers: (user: PermissionUser) => {
    requireInventoryPermission(user, "CREATE_SUPPLIER");
  },

  // Stock movements
  canAdjustStock: (user: PermissionUser) => {
    requireInventoryPermission(user, "STOCK_ADJUSTMENT");
  },
} as const;

// 📦 PRODUCT VALIDATION
export function validateCreateProduct(input: unknown): CreateProductInput {
  try {
    const result = createProductSchema.parse(input);
    // Convert metadata null to undefined to match TypeScript type
    return {
      ...result,
      metadata: result.metadata ?? undefined,
    } as CreateProductInput;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Product validation failed", error.issues);
    }
    throw new Error("Invalid product data");
  }
}

export function validateUpdateProduct(input: unknown): UpdateProductInput {
  try {
    const result = updateProductSchema.parse(input);
    // Convert metadata null to undefined to match TypeScript type
    return {
      ...result,
      metadata: result.metadata ?? undefined,
    } as UpdateProductInput;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        "Product update validation failed",
        error.issues
      );
    }
    throw new Error("Invalid product update data");
  }
}

// 🏷️ CATEGORY VALIDATION
export function validateCreateCategory(input: unknown): CreateCategoryInput {
  try {
    const result = createCategorySchema.parse(input);
    // Convert null to undefined to match TypeScript type
    return {
      ...result,
      parentId: result.parentId ?? undefined,
    } as CreateCategoryInput;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Category validation failed", error.issues);
    }
    throw new Error("Invalid category data");
  }
}

// 🚛 SUPPLIER VALIDATION
export function validateCreateSupplier(input: unknown): CreateSupplierInput {
  try {
    const result = createSupplierSchema.parse(input);
    // Convert null values to undefined to match TypeScript type
    return {
      ...result,
      email: result.email ?? undefined,
    } as CreateSupplierInput;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Supplier validation failed", error.issues);
    }
    throw new Error("Invalid supplier data");
  }
}

// 📊 STOCK MOVEMENT VALIDATION
export function validateCreateStockMovement(
  input: unknown
): CreateStockMovementInput {
  try {
    const result = createStockMovementSchema.parse(input);
    // Convert null values to undefined to match TypeScript type
    return {
      ...result,
      reference: result.reference ?? undefined,
    } as CreateStockMovementInput;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        "Stock movement validation failed",
        error.issues
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
      throw new ValidationError(
        "Product filters validation failed",
        error.issues
      );
    }
    throw new Error("Invalid product filters");
  }
}

export function validateCategoryFilters(input: unknown): CategoryFilters {
  try {
    const result = categoryFiltersSchema.parse(input);
    // Convert null values to undefined to match TypeScript type
    return {
      ...result,
      parentId: result.parentId ?? undefined,
    } as CategoryFilters;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        "Category filters validation failed",
        error.issues
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
        error.issues
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
      throw new ValidationError("Pagination validation failed", error.issues);
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
    if (input.stock !== undefined && input.stock < 0) {
      throw new BusinessRuleError("Stock cannot be negative", "NEGATIVE_STOCK");
    }

    // Min stock cannot be greater than max stock
    if (
      input.maxStock &&
      input.minStock !== undefined &&
      input.minStock > input.maxStock
    ) {
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
    _existingProduct?: Pick<Product, "id" | "stock" | "price" | "cost">
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
      if (!allowedDomains.some((domain) => urlObj.hostname.endsWith(domain))) {
        throw new SecurityError(
          "Image URL domain not allowed",
          "UNTRUSTED_DOMAIN"
        );
      }

      // Check file extension
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
      const hasValidExtension = allowedExtensions.some((ext) =>
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

  static sanitizeMetadata(
    metadata: Record<string, unknown>
  ): Record<string, unknown> {
    // Remove potentially dangerous properties
    const sanitized = { ...metadata };

    // Remove functions, undefined, symbols
    Object.keys(sanitized).forEach((key) => {
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
    function limitDepth(obj: unknown, depth: number): unknown {
      if (depth > maxDepth || typeof obj !== "object" || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => limitDepth(item, depth + 1));
      }

      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(
        obj as Record<string, unknown>
      )) {
        result[key] = limitDepth(value, depth + 1);
      }
      return result;
    }

    return limitDepth(sanitized, 0) as Record<string, unknown>;
  }
}

// 🚨 CUSTOM ERROR CLASSES
export class ValidationError extends Error {
  public readonly code = "VALIDATION_ERROR";
  public readonly details: z.ZodIssue[];

  constructor(message: string, details: z.ZodIssue[] = []) {
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

export function isBusinessRuleError(
  error: unknown
): error is BusinessRuleError {
  return error instanceof BusinessRuleError;
}

export function isSecurityError(error: unknown): error is SecurityError {
  return error instanceof SecurityError;
}

export function formatValidationErrors(
  errors: z.ZodIssue[]
): Record<string, string> {
  const formatted: Record<string, string> = {};

  errors.forEach((error) => {
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
