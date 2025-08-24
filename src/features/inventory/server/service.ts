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
import { validateInventoryPermissions } from "./validators";
import { 
  createProductQuery, 
  updateProductQuery, 
  deleteProductQuery,
  getProductsQuery,
  getProductByIdQuery,
  createCategoryQuery,
  getCategoriesQuery,
  createSupplierQuery,
  getSuppliersQuery,
  addStockMovementQuery,
  getInventoryStatsQuery,
  getLowStockAlertsQuery
} from "./queries";
import { 
  mapProductToExternal, 
  mapCategoryToExternal, 
  mapSupplierToExternal,
  mapStatsToExternal,
  mapAlertsToExternal 
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
  validatePagination
} from "./validators";
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
      const user = await requireAuth();
      await validateInventoryPermissions(user, 'CREATE_PRODUCT');
      
      // 📋 Input Validation
      const validatedInput = validateCreateProduct(input);
      
      // 🧠 Business Logic
      await this.validateBusinessRules(validatedInput);
      
      // 💾 Database Operation
      const rawProduct = await createProductQuery(validatedInput, userId);
      
      // 🔄 Data Transformation
      const product = mapProductToExternal(rawProduct);
      
      // 📊 Audit Logging
      await this.logProductAction('CREATED', product.id, userId);
      
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return this.handleError(error, 'Error creating product');
    }
  }
  
  static async update(
    input: UpdateProductInput,
    userId: string
  ): Promise<ActionResult<ProductWithRelations>> {
    try {
      const user = await requireAuth();
      await validateInventoryPermissions(user, 'UPDATE_PRODUCT');
      
      const validatedInput = validateUpdateProduct(input);
      
      // 🔍 Verify product exists
      const existingProduct = await getProductByIdQuery(validatedInput.id);
      if (!existingProduct) {
        return { success: false, error: 'Product not found' };
      }
      
      // 🧠 Business Logic
      await this.validateUpdateBusinessRules(validatedInput, existingProduct);
      
      const rawProduct = await updateProductQuery(validatedInput, userId);
      const product = mapProductToExternal(rawProduct);
      
      await this.logProductAction('UPDATED', product.id, userId);
      
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return this.handleError(error, 'Error updating product');
    }
  }
  
  static async delete(
    productId: string,
    userId: string
  ): Promise<ActionResult> {
    try {
      const user = await requireAuth();
      await validateInventoryPermissions(user, 'DELETE_PRODUCT');
      
      // 🔍 Business Logic - Check dependencies
      const canDelete = await this.canDeleteProduct(productId);
      if (!canDelete.allowed) {
        return { success: false, error: canDelete.reason };
      }
      
      await deleteProductQuery(productId);
      await this.logProductAction('DELETED', productId, userId);
      
      return { success: true };
    } catch (error) {
      return this.handleError(error, 'Error deleting product');
    }
  }
  
  static async getMany(
    filters?: ProductFilters,
    pagination?: PaginationParams,
    userId?: string
  ): Promise<ActionResult<PaginatedResponse<ProductWithRelations>>> {
    try {
      const user = await requireAuth();
      
      const validatedFilters = filters ? validateProductFilters(filters) : {};
      const validatedPagination = pagination ? validatePagination(pagination) : 
        { page: 1, limit: 20, sortDirection: 'asc' as const };
      
      const rawResult = await getProductsQuery(validatedFilters, validatedPagination);
      
      const result: PaginatedResponse<ProductWithRelations> = {
        ...rawResult,
        data: rawResult.data.map(mapProductToExternal),
      };
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching products');
    }
  }
  
  static async getById(
    productId: string
  ): Promise<ActionResult<ProductWithRelations>> {
    try {
      await requireAuth();
      
      const rawProduct = await getProductByIdQuery(productId);
      if (!rawProduct) {
        return { success: false, error: 'Product not found' };
      }
      
      const product = mapProductToExternal(rawProduct);
      
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching product');
    }
  }
  
  // 🧠 BUSINESS LOGIC METHODS
  private static async validateBusinessRules(input: CreateProductInput): Promise<void> {
    // SKU uniqueness
    const existingSku = await getProductsQuery({ search: input.sku });
    if (existingSku.data.length > 0) {
      throw new Error('SKU already exists');
    }
    
    // Barcode uniqueness if provided
    if (input.barcode) {
      const existingBarcode = await getProductsQuery({ search: input.barcode });
      if (existingBarcode.data.length > 0) {
        throw new Error('Barcode already exists');
      }
    }
    
    // Price > Cost validation
    if (input.price <= input.cost) {
      throw new Error('Price must be greater than cost');
    }
    
    // Category validation
    const categoryExists = await getCategoriesQuery({ search: input.categoryId });
    if (categoryExists.length === 0) {
      throw new Error('Invalid category');
    }
  }
  
  private static async validateUpdateBusinessRules(
    input: UpdateProductInput, 
    existing: any
  ): Promise<void> {
    // SKU uniqueness (exclude current product)
    if (input.sku && input.sku !== existing.sku) {
      const existingSku = await getProductsQuery({ search: input.sku });
      if (existingSku.data.some(p => p.id !== input.id)) {
        throw new Error('SKU already exists');
      }
    }
    
    // Price validation
    if (input.price && input.cost) {
      if (input.price <= input.cost) {
        throw new Error('Price must be greater than cost');
      }
    }
  }
  
  private static async canDeleteProduct(productId: string): Promise<{allowed: boolean; reason?: string}> {
    // TODO: Check for dependencies (orders, sales, etc.)
    // For now, allow all deletions
    return { allowed: true };
  }
  
  private static async logProductAction(action: string, productId: string, userId: string): Promise<void> {
    // TODO: Integrate with audit system
    console.log(`[AUDIT] ${action} product ${productId} by user ${userId}`);
  }
  
  private static handleError(error: any, defaultMessage: string): ActionResult {
    console.error(`[INVENTORY_SERVICE] ${defaultMessage}:`, error);
    
    if (error.message) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: defaultMessage };
  }
}

// 🏷️ CATEGORY SERVICES
export class CategoryService {
  static async create(
    input: CreateCategoryInput,
    userId: string
  ): Promise<ActionResult<CategoryWithRelations>> {
    try {
      const user = await requireAuth();
      await validateInventoryPermissions(user, 'CREATE_CATEGORY');
      
      const validatedInput = validateCreateCategory(input);
      
      // Business Logic - Name uniqueness
      const existing = await getCategoriesQuery({ search: validatedInput.name });
      if (existing.some(c => c.name.toLowerCase() === validatedInput.name.toLowerCase())) {
        return { success: false, error: 'Category name already exists' };
      }
      
      const rawCategory = await createCategoryQuery(validatedInput, userId);
      const category = mapCategoryToExternal(rawCategory);
      
      await this.logCategoryAction('CREATED', category.id, userId);
      
      return {
        success: true,
        data: category,
      };
    } catch (error) {
      return this.handleError(error, 'Error creating category');
    }
  }
  
  static async getMany(
    filters?: CategoryFilters
  ): Promise<ActionResult<CategoryWithRelations[]>> {
    try {
      await requireAuth();
      
      const validatedFilters = filters ? validateCategoryFilters(filters) : {};
      const rawCategories = await getCategoriesQuery(validatedFilters);
      const categories = rawCategories.map(mapCategoryToExternal);
      
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching categories');
    }
  }
  
  private static async logCategoryAction(action: string, categoryId: string, userId: string): Promise<void> {
    console.log(`[AUDIT] ${action} category ${categoryId} by user ${userId}`);
  }
  
  private static handleError(error: any, defaultMessage: string): ActionResult {
    console.error(`[CATEGORY_SERVICE] ${defaultMessage}:`, error);
    return { success: false, error: error.message || defaultMessage };
  }
}

// 🚛 SUPPLIER SERVICES
export class SupplierService {
  static async create(
    input: CreateSupplierInput,
    userId: string
  ): Promise<ActionResult<SupplierWithRelations>> {
    try {
      const user = await requireAuth();
      await validateInventoryPermissions(user, 'CREATE_SUPPLIER');
      
      const validatedInput = validateCreateSupplier(input);
      
      // Business Logic - Name uniqueness
      const existing = await getSuppliersQuery({ search: validatedInput.name });
      if (existing.some(s => s.name.toLowerCase() === validatedInput.name.toLowerCase())) {
        return { success: false, error: 'Supplier name already exists' };
      }
      
      // Email uniqueness if provided
      if (validatedInput.email) {
        const existingEmail = await getSuppliersQuery({ search: validatedInput.email });
        if (existingEmail.some(s => s.email === validatedInput.email)) {
          return { success: false, error: 'Supplier email already exists' };
        }
      }
      
      const rawSupplier = await createSupplierQuery(validatedInput, userId);
      const supplier = mapSupplierToExternal(rawSupplier);
      
      await this.logSupplierAction('CREATED', supplier.id, userId);
      
      return {
        success: true,
        data: supplier,
      };
    } catch (error) {
      return this.handleError(error, 'Error creating supplier');
    }
  }
  
  static async getMany(
    filters?: SupplierFilters
  ): Promise<ActionResult<SupplierWithRelations[]>> {
    try {
      await requireAuth();
      
      const validatedFilters = filters ? validateSupplierFilters(filters) : {};
      const rawSuppliers = await getSuppliersQuery(validatedFilters);
      const suppliers = rawSuppliers.map(mapSupplierToExternal);
      
      return {
        success: true,
        data: suppliers,
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching suppliers');
    }
  }
  
  private static async logSupplierAction(action: string, supplierId: string, userId: string): Promise<void> {
    console.log(`[AUDIT] ${action} supplier ${supplierId} by user ${userId}`);
  }
  
  private static handleError(error: any, defaultMessage: string): ActionResult {
    console.error(`[SUPPLIER_SERVICE] ${defaultMessage}:`, error);
    return { success: false, error: error.message || defaultMessage };
  }
}

// 📊 STOCK MOVEMENT SERVICES  
export class StockMovementService {
  static async addMovement(
    input: CreateStockMovementInput,
    userId: string
  ): Promise<ActionResult<any>> {
    try {
      const user = await requireAuth();
      await validateInventoryPermissions(user, 'CREATE_STOCK_MOVEMENT');
      
      const validatedInput = validateCreateStockMovement(input);
      
      // Business Logic - Stock calculations
      const result = await this.calculateStockMovement(validatedInput);
      if (!result.success) {
        return result;
      }
      
      const movement = await addStockMovementQuery(validatedInput, result.newStock, userId);
      
      await this.logStockAction('MOVEMENT_ADDED', movement.id, userId);
      
      return {
        success: true,
        data: movement,
      };
    } catch (error) {
      return this.handleError(error, 'Error adding stock movement');
    }
  }
  
  private static async calculateStockMovement(
    input: CreateStockMovementInput
  ): Promise<{success: boolean; newStock?: number; error?: string}> {
    const product = await getProductByIdQuery(input.productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    let newStock = product.stock;
    
    switch (input.type) {
      case 'IN':
        newStock += input.quantity;
        break;
      case 'OUT':
        newStock -= input.quantity;
        if (newStock < 0) {
          return { success: false, error: 'Insufficient stock for OUT movement' };
        }
        break;
      case 'ADJUSTMENT':
        newStock += input.quantity; // Can be negative
        if (newStock < 0) {
          return { success: false, error: 'Adjustment would result in negative stock' };
        }
        break;
      case 'TRANSFER':
        // TODO: Implement transfer logic
        break;
    }
    
    return { success: true, newStock };
  }
  
  private static async logStockAction(action: string, movementId: string, userId: string): Promise<void> {
    console.log(`[AUDIT] ${action} stock movement ${movementId} by user ${userId}`);
  }
  
  private static handleError(error: any, defaultMessage: string): ActionResult {
    console.error(`[STOCK_SERVICE] ${defaultMessage}:`, error);
    return { success: false, error: error.message || defaultMessage };
  }
}

// 📊 ANALYTICS SERVICES
export class InventoryAnalyticsService {
  static async getStats(): Promise<ActionResult<InventoryStats>> {
    try {
      await requireAuth();
      
      const rawStats = await getInventoryStatsQuery();
      const stats = mapStatsToExternal(rawStats);
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching inventory stats');
    }
  }
  
  static async getLowStockAlerts(): Promise<ActionResult<StockAlert[]>> {
    try {
      await requireAuth();
      
      const rawAlerts = await getLowStockAlertsQuery();
      const alerts = mapAlertsToExternal(rawAlerts);
      
      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching stock alerts');
    }
  }
  
  private static handleError(error: any, defaultMessage: string): ActionResult {
    console.error(`[ANALYTICS_SERVICE] ${defaultMessage}:`, error);
    return { success: false, error: error.message || defaultMessage };
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
