/**
 * 📦 INVENTORY SERVICE
 * ===================
 *
 * Domain Service Layer - Business Logic para Inventory Management
 * Clean Architecture: Domain Layer (Thick Layer)
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { requireAuth } from "@/core/auth/server";
import {
  validateInventoryPermissions,
  sessionToPermissionUser,
} from "./validators";
import {
  createProductQuery,
  updateProductQuery,
  deleteProductQuery,
  getProductsQuery,
  getProductByIdQuery,
  createCategoryQuery,
  getCategoriesQuery,
  getCategoryByIdQuery,
  createSupplierQuery,
  getSuppliersQuery,
  getSupplierByIdQuery,
  addStockMovementQuery,
  getInventoryStatsQuery,
  getLowStockAlertsQuery,
  type ProductListItem,
  type ProductDetailItem,
} from "./queries";
import {
  mapProductToExternal,
  mapCategoryToExternal,
  mapSupplierToExternal,
  mapStatsToExternal,
  mapAlertsToExternal,
} from "./mappers";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateCategory,
  validateCreateSupplier,
  validateCreateStockMovement,
  validateProductFilters,
  validateCategoryFilters,
  validateSupplierFilters,
  validatePagination,
} from "./validators";
import type {
  Product,
  StockMovement,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  CreateSupplierInput,
  CreateStockMovementInput,
  ProductFilters,
  CategoryFilters,
  SupplierFilters,
  PaginationParams,
  ProductWithRelations,
  CategoryWithRelations,
  SupplierWithRelations,
  InventoryStats,
  StockAlert,
  PaginatedResponse,
  ActionResult,
} from "../types";

// 🎯 PRODUCT SERVICES
export class ProductService {
  static async create(
    input: CreateProductInput,
    userId: string
  ): Promise<ActionResult<ProductWithRelations>> {
    try {
      // 🛡️ Authentication & Authorization
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "CREATE_PRODUCT");

      // 📋 Input Validation
      const validatedInput = validateCreateProduct(input);

      // 🧠 Business Logic
      await this.validateBusinessRules(validatedInput);

      // 💾 Database Operation
      const rawProduct = await createProductQuery(validatedInput, userId);

      // 🔄 Data Transformation
      const product = mapProductToExternal(rawProduct);

      // 📊 Audit Logging
      await this.logProductAction("CREATED", product.id, userId);

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return this.handleError(error, "Error creating product");
    }
  }

  static async update(
    input: UpdateProductInput,
    userId: string
  ): Promise<ActionResult<ProductWithRelations>> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "UPDATE_PRODUCT");

      const validatedInput = validateUpdateProduct(input);

      // 🔍 Verify product exists
      const existingProduct = await getProductByIdQuery(validatedInput.id);
      if (!existingProduct) {
        return { success: false, error: "Product not found" };
      }

      // 🧠 Business Logic
      await this.validateUpdateBusinessRules(validatedInput, existingProduct);

      const rawProduct = await updateProductQuery(validatedInput, userId);
      const product = mapProductToExternal(rawProduct);

      await this.logProductAction("UPDATED", product.id, userId);

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return this.handleError(error, "Error updating product");
    }
  }

  static async delete(
    productId: string,
    userId: string
  ): Promise<ActionResult> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "DELETE_PRODUCT");

      // 🔍 Business Logic - Check dependencies
      const canDelete = await this.canDeleteProduct(productId);
      if (!canDelete.allowed) {
        return { success: false, error: canDelete.reason };
      }

      await deleteProductQuery(productId);
      await this.logProductAction("DELETED", productId, userId);

      return { success: true };
    } catch (error) {
      return this.handleError(error, "Error deleting product");
    }
  }

  // ⚡ ULTRA-FAST READ - No auth needed for public data
  static async getMany(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<ActionResult<PaginatedResponse<ProductWithRelations>>> {
    try {
      // 🚀 FAST - Skip auth for public reads, direct validation
      const validatedFilters = filters ? validateProductFilters(filters) : {};
      const validatedPagination = pagination
        ? validatePagination(pagination)
        : { page: 1, limit: 20, sortDirection: "asc" as const };

      // 🚀 FAST - Direct query call
      const rawResult = await getProductsQuery(
        validatedFilters,
        validatedPagination
      );

      // 🔄 Transform ProductListItem[] to ProductWithRelations[]
      const result: PaginatedResponse<ProductWithRelations> = {
        ...rawResult,
        data: rawResult.data.map(
          (product: ProductListItem): ProductWithRelations => ({
            ...product,
            // Add missing optional fields for ProductWithRelations compatibility
            category: {
              ...product.category,
              description: null, // Not available in list view
              parentId: null, // Not available in list view
              isActive: true, // Assume active
              sortOrder: 0, // Not needed
              createdAt: new Date(), // Placeholder
              updatedAt: new Date(), // Placeholder
            },
            supplier: product.supplier
              ? {
                  ...product.supplier,
                  email: null, // Not available in list view
                  phone: null, // Not available in list view
                  website: null, // Not available in list view
                  taxId: null, // Not available in list view
                  paymentTerms: 30, // Default
                  rating: null, // Not available in list view
                  notes: null, // Not available in list view
                  addressLine1: null, // Not available in list view
                  addressLine2: null, // Not available in list view
                  city: null, // Not available in list view
                  state: null, // Not available in list view
                  postalCode: null, // Not available in list view
                  country: null, // Not available in list view
                  isActive: true, // Assume active
                  createdAt: new Date(), // Placeholder
                  updatedAt: new Date(), // Placeholder
                }
              : null,
            stockMovements: [], // Empty for list view - use _count instead
          })
        ),
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return this.handleError(error, "Error fetching products");
    }
  }

  // ⚡ ULTRA-FAST READ - No auth needed for public product details
  static async getById(
    productId: string
  ): Promise<ActionResult<ProductWithRelations>> {
    try {
      // 🚀 FAST - Skip auth for public reads, direct query
      const rawProduct = await getProductByIdQuery(productId);
      if (!rawProduct) {
        return { success: false, error: "Product not found" };
      }

      // 🔄 Transform ProductDetailItem to ProductWithRelations
      const product: ProductWithRelations = {
        ...rawProduct,
        // Add missing fields for Category
        category: {
          ...rawProduct.category,
          isActive: true, // Assume active
          sortOrder: 0, // Not needed for detail view
          createdAt: new Date(), // Placeholder
          updatedAt: new Date(), // Placeholder
        },
        // Add missing fields for Supplier (if exists)
        supplier: rawProduct.supplier
          ? {
              ...rawProduct.supplier,
              website: null, // Not selected in query
              taxId: null, // Not selected in query
              paymentTerms: 30, // Default
              rating: null, // Not selected in query
              notes: null, // Not selected in query
              addressLine1: null, // Not selected in query
              addressLine2: null, // Not selected in query
              city: null, // Not selected in query
              state: null, // Not selected in query
              postalCode: null, // Not selected in query
              country: null, // Not selected in query
              isActive: true, // Assume active
              createdAt: new Date(), // Placeholder
              updatedAt: new Date(), // Placeholder
            }
          : null,
        // Transform stockMovements to complete StockMovement objects
        stockMovements: rawProduct.stockMovements.map((movement) => ({
          ...movement,
          productId: rawProduct.id, // Fill missing required field
          userId: movement.user.id, // Map from user relation
          updatedAt: movement.createdAt, // Use createdAt as updatedAt placeholder
        })),
      };

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return this.handleError(error, "Error fetching product");
    }
  }

  // 🧠 BUSINESS LOGIC METHODS
  // ⚡ PARALLEL VALIDATIONS - All checks run simultaneously for max speed
  private static async validateBusinessRules(
    input: CreateProductInput
  ): Promise<void> {
    // 🚀 FAST - Price validation (instant, no DB call)
    if (input.price <= input.cost) {
      throw new Error("Price must be greater than cost");
    }

    // 🚀 PARALLEL - All DB validations run simultaneously
    const validationPromises = [
      // SKU uniqueness
      getProductsQuery({ search: input.sku }).then((result) => {
        if (result.data.length > 0) {
          throw new Error("SKU already exists");
        }
      }),

      // Category validation (by ID)
      getCategoryByIdQuery(input.categoryId).then((result) => {
        if (!result || !result.isActive) {
          throw new Error("Invalid category");
        }
      }),
    ];

    // Barcode uniqueness if provided (conditional parallel validation)
    if (input.barcode) {
      validationPromises.push(
        getProductsQuery({ search: input.barcode }).then((result) => {
          if (result.data.length > 0) {
            throw new Error("Barcode already exists");
          }
        })
      );
    }

    // Supplier validation if provided (conditional parallel validation)
    if (input.supplierId) {
      validationPromises.push(
        getSupplierByIdQuery(input.supplierId).then((result) => {
          if (!result || !result.isActive) {
            throw new Error("Invalid supplier");
          }
        })
      );
    }

    // 🚀 Wait for ALL validations to complete in parallel
    await Promise.all(validationPromises);
  }

  // ⚡ PARALLEL UPDATE VALIDATIONS - All checks run simultaneously
  private static async validateUpdateBusinessRules(
    input: UpdateProductInput,
    existing: Product
  ): Promise<void> {
    // 🚀 FAST - Price validation (instant, no DB call)
    if (input.price && input.cost) {
      if (input.price <= input.cost) {
        throw new Error("Price must be greater than cost");
      }
    }

    // 🚀 PARALLEL - Only run DB validations if fields are changing
    const validationPromises: Promise<void>[] = [];

    // SKU uniqueness (only if changing)
    if (input.sku && input.sku !== existing.sku) {
      validationPromises.push(
        getProductsQuery({ search: input.sku }).then((result) => {
          if (result.data.some((p) => p.id !== input.id)) {
            throw new Error("SKU already exists");
          }
        })
      );
    }

    // Run all validations in parallel (if any)
    if (validationPromises.length > 0) {
      await Promise.all(validationPromises);
    }
  }

  private static async canDeleteProduct(
    _productId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    // TODO: Check for dependencies (orders, sales, etc.)
    // For now, allow all deletions
    return { allowed: true };
  }

  private static async logProductAction(
    action: string,
    productId: string,
    userId: string
  ): Promise<void> {
    // TODO: Integrate with audit system
    console.log(`[AUDIT] ${action} product ${productId} by user ${userId}`);
  }

  private static handleError<T = unknown>(
    error: unknown,
    defaultMessage: string
  ): ActionResult<T> {
    console.error(`[INVENTORY_SERVICE] ${defaultMessage}:`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage || defaultMessage };
  }
}

// 🏷️ CATEGORY SERVICES
export class CategoryService {
  static async create(
    input: CreateCategoryInput,
    userId: string
  ): Promise<ActionResult<CategoryWithRelations>> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "CREATE_CATEGORY");

      const validatedInput = validateCreateCategory(input);

      // Business Logic - Name uniqueness
      const existing = await getCategoriesQuery({
        search: validatedInput.name,
      });
      if (
        existing.some(
          (c) => c.name.toLowerCase() === validatedInput.name.toLowerCase()
        )
      ) {
        return { success: false, error: "Category name already exists" };
      }

      const rawCategory = await createCategoryQuery(validatedInput);
      const category = mapCategoryToExternal(rawCategory);

      await this.logCategoryAction("CREATED", category.id, userId);

      return {
        success: true,
        data: category,
      };
    } catch (error) {
      return this.handleError(error, "Error creating category");
    }
  }

  // ⚡ ULTRA-FAST READ - No auth needed for public categories
  static async getMany(
    filters?: CategoryFilters
  ): Promise<ActionResult<CategoryWithRelations[]>> {
    try {
      // 🚀 FAST - Skip auth for public reads, direct validation
      const validatedFilters = filters ? validateCategoryFilters(filters) : {};

      // 🚀 FAST - Get categories from database
      const rawCategories = await getCategoriesQuery(validatedFilters);

      // 🔄 Transform to domain types (products is optional so we omit it for performance)
      const categories: CategoryWithRelations[] = rawCategories.map(
        (category) => ({
          ...category,
          // Omit products array for list performance - use _count for product count info
          products: undefined, // Optional field - undefined for listing performance
        })
      );

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return this.handleError(error, "Error fetching categories");
    }
  }

  private static async logCategoryAction(
    action: string,
    categoryId: string,
    userId: string
  ): Promise<void> {
    console.log(`[AUDIT] ${action} category ${categoryId} by user ${userId}`);
  }

  private static handleError<T = unknown>(
    error: unknown,
    defaultMessage: string
  ): ActionResult<T> {
    console.error(`[CATEGORY_SERVICE] ${defaultMessage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage || defaultMessage };
  }
}

// 🚛 SUPPLIER SERVICES
export class SupplierService {
  static async create(
    input: CreateSupplierInput,
    userId: string
  ): Promise<ActionResult<SupplierWithRelations>> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "CREATE_SUPPLIER");

      const validatedInput = validateCreateSupplier(input);

      // Business Logic - Name uniqueness
      const existing = await getSuppliersQuery({ search: validatedInput.name });
      if (
        existing.some(
          (s) => s.name.toLowerCase() === validatedInput.name.toLowerCase()
        )
      ) {
        return { success: false, error: "Supplier name already exists" };
      }

      // Email uniqueness if provided
      if (validatedInput.email) {
        const existingEmail = await getSuppliersQuery({
          search: validatedInput.email,
        });
        if (existingEmail.some((s) => s.email === validatedInput.email)) {
          return { success: false, error: "Supplier email already exists" };
        }
      }

      const rawSupplier = await createSupplierQuery(validatedInput);
      const supplier = mapSupplierToExternal(rawSupplier);

      await this.logSupplierAction("CREATED", supplier.id, userId);

      return {
        success: true,
        data: supplier,
      };
    } catch (error) {
      return this.handleError(error, "Error creating supplier");
    }
  }

  // ⚡ ULTRA-FAST READ - No auth needed for public suppliers
  static async getMany(
    filters?: SupplierFilters
  ): Promise<ActionResult<SupplierWithRelations[]>> {
    try {
      // 🚀 FAST - Skip auth for public reads, direct validation
      const validatedFilters = filters ? validateSupplierFilters(filters) : {};

      // 🚀 FAST - Get suppliers from database
      const rawSuppliers = await getSuppliersQuery(validatedFilters);

      // 🔄 Transform to domain types (products is optional so we omit it for performance)
      const suppliers: SupplierWithRelations[] = rawSuppliers.map(
        (supplier) => ({
          ...supplier,
          // Omit products array for list performance - use _count for product count info
          products: undefined, // Optional field - undefined for listing performance
        })
      );

      return {
        success: true,
        data: suppliers,
      };
    } catch (error) {
      return this.handleError(error, "Error fetching suppliers");
    }
  }

  private static async logSupplierAction(
    action: string,
    supplierId: string,
    userId: string
  ): Promise<void> {
    console.log(`[AUDIT] ${action} supplier ${supplierId} by user ${userId}`);
  }

  private static handleError<T = unknown>(
    error: unknown,
    defaultMessage: string
  ): ActionResult<T> {
    console.error(`[SUPPLIER_SERVICE] ${defaultMessage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage || defaultMessage };
  }
}

// 📊 STOCK MOVEMENT SERVICES
export class StockMovementService {
  static async addMovement(
    input: CreateStockMovementInput,
    userId: string
  ): Promise<ActionResult<StockMovement>> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "CREATE_STOCK_MOVEMENT");

      const validatedInput = validateCreateStockMovement(input);

      // Business Logic - Stock calculations
      const result = await this.calculateStockMovement(validatedInput);
      if (!result.success) {
        return result;
      }

      const movement = await addStockMovementQuery(
        validatedInput,
        userId,
        result.previousStock || 0,
        result.newStock
      );

      await this.logStockAction("MOVEMENT_ADDED", movement.id, userId);

      return {
        success: true,
        data: movement,
      };
    } catch (error) {
      return this.handleError(error, "Error adding stock movement");
    }
  }

  private static async calculateStockMovement(
    input: CreateStockMovementInput
  ): Promise<{
    success: boolean;
    newStock: number;
    previousStock: number;
    error?: string;
  }> {
    const product = await getProductByIdQuery(input.productId);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
        newStock: 0,
        previousStock: 0,
      };
    }

    const previousStock = product.stock;
    let newStock = product.stock;

    switch (input.type) {
      case "IN":
        newStock += input.quantity;
        break;
      case "OUT":
        newStock -= input.quantity;
        if (newStock < 0) {
          return {
            success: false,
            error: "Insufficient stock for OUT movement",
            newStock: 0,
            previousStock,
          };
        }
        break;
      case "ADJUSTMENT":
        newStock += input.quantity; // Can be negative
        if (newStock < 0) {
          return {
            success: false,
            error: "Adjustment would result in negative stock",
            newStock: 0,
            previousStock,
          };
        }
        break;
      case "TRANSFER":
        // TODO: Implement transfer logic
        break;
    }

    return { success: true, newStock, previousStock };
  }

  private static async logStockAction(
    action: string,
    movementId: string,
    userId: string
  ): Promise<void> {
    console.log(
      `[AUDIT] ${action} stock movement ${movementId} by user ${userId}`
    );
  }

  private static handleError<T = unknown>(
    error: unknown,
    defaultMessage: string
  ): ActionResult<T> {
    console.error(`[STOCK_SERVICE] ${defaultMessage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage || defaultMessage };
  }
}

// 📊 ANALYTICS SERVICES
export class InventoryAnalyticsService {
  // ⚡ ULTRA-FAST READ - No auth needed for public stats
  static async getStats(): Promise<ActionResult<InventoryStats>> {
    try {
      // 🚀 FAST - Skip auth for public reads, direct query
      const rawStats = await getInventoryStatsQuery();
      const stats = mapStatsToExternal(rawStats);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return this.handleError(error, "Error fetching inventory stats");
    }
  }

  // ⚡ ULTRA-FAST READ - No auth needed for public alerts
  static async getLowStockAlerts(): Promise<ActionResult<StockAlert[]>> {
    try {
      // 🚀 FAST - Skip auth for public reads, direct query
      const rawAlerts = await getLowStockAlertsQuery();
      const alerts = mapAlertsToExternal(rawAlerts);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return this.handleError(error, "Error fetching stock alerts");
    }
  }

  private static handleError<T = unknown>(
    error: unknown,
    defaultMessage: string
  ): ActionResult<T> {
    console.error(`[ANALYTICS_SERVICE] ${defaultMessage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage || defaultMessage };
  }
}

// 🔧 UTILITIES
export const InventoryService = {
  Products: ProductService,
  Categories: CategoryService,
  Suppliers: SupplierService,
  StockMovements: StockMovementService,
  Analytics: InventoryAnalyticsService,
};

export default InventoryService;
