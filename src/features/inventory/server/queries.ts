/**
 * 📦 INVENTORY QUERIES
 * ===================
 * 
 * Data Access Layer - Database queries para Inventory Management
 * Clean Architecture: Infrastructure Layer (Database)
 * 
 * Created: 2025-01-17 - Inventory Management Module
 */

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
  PaginatedResponse,
  StockMovementType,
} from "../types";

// 🗃️ MOCK DATA (TODO: Replace with Prisma queries)
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_SUPPLIERS,
  MOCK_STOCK_MOVEMENTS,
} from "./mockData";

// 📦 PRODUCT QUERIES
export async function createProductQuery(
  input: CreateProductInput,
  userId: string
): Promise<any> {
  // TODO: Replace with Prisma
  const newProduct = {
    id: `prod-${Date.now()}`,
    ...input,
    images: input.images || [],
    tags: input.tags || [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Find related data
  const category = MOCK_CATEGORIES.find((c) => c.id === input.categoryId);
  const supplier = input.supplierId
    ? MOCK_SUPPLIERS.find((s) => s.id === input.supplierId)
    : null;

  const fullProduct = {
    ...newProduct,
    category: category!,
    supplier,
    stockMovements: [],
    _count: { stockMovements: 0 },
  };

  MOCK_PRODUCTS.push(fullProduct);
  return fullProduct;
}

export async function updateProductQuery(
  input: UpdateProductInput,
  userId: string
): Promise<any> {
  // TODO: Replace with Prisma
  const index = MOCK_PRODUCTS.findIndex((p) => p.id === input.id);
  if (index === -1) throw new Error("Product not found");

  const updatedProduct = {
    ...MOCK_PRODUCTS[index],
    ...input,
    updatedAt: new Date(),
  };

  MOCK_PRODUCTS[index] = updatedProduct;
  return updatedProduct;
}

export async function deleteProductQuery(productId: string): Promise<void> {
  // TODO: Replace with Prisma transaction + dependency checks
  const index = MOCK_PRODUCTS.findIndex((p) => p.id === productId);
  if (index === -1) throw new Error("Product not found");

  MOCK_PRODUCTS.splice(index, 1);
}

export async function getProductsQuery(
  filters: ProductFilters = {},
  pagination?: PaginationParams
): Promise<PaginatedResponse<any>> {
  // TODO: Replace with Prisma complex query
  let filtered = MOCK_PRODUCTS;

  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchLower))
    );
  }

  if (filters.categoryId) {
    filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.supplierId) {
    filtered = filtered.filter((p) => p.supplierId === filters.supplierId);
  }

  if (filters.isActive !== undefined) {
    filtered = filtered.filter((p) => p.isActive === filters.isActive);
  }

  if (filters.stockStatus) {
    filtered = filtered.filter((p) => {
      const status = getProductStockStatus(p);
      return status === filters.stockStatus;
    });
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((p) =>
      filters.tags!.some((tag) => p.tags.includes(tag))
    );
  }

  // Apply sorting
  if (pagination?.sortBy) {
    const { sortBy, sortDirection = "asc" } = pagination;
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      const direction = sortDirection === "desc" ? -1 : 1;

      if (typeof aVal === "string") {
        return aVal.localeCompare(bVal) * direction;
      }
      return (aVal - bVal) * direction;
    });
  }

  // Apply pagination
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getProductByIdQuery(productId: string): Promise<any | null> {
  // TODO: Replace with Prisma findUnique + include relations
  return MOCK_PRODUCTS.find((p) => p.id === productId) || null;
}

// 🏷️ CATEGORY QUERIES
export async function createCategoryQuery(
  input: CreateCategoryInput,
  userId: string
): Promise<any> {
  // TODO: Replace with Prisma
  const newCategory = {
    id: `cat-${Date.now()}`,
    ...input,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fullCategory = {
    ...newCategory,
    parent: null,
    children: [],
    products: [],
    _count: { products: 0, children: 0 },
  };

  MOCK_CATEGORIES.push(fullCategory);
  return fullCategory;
}

export async function getCategoriesQuery(
  filters: CategoryFilters = {}
): Promise<any[]> {
  // TODO: Replace with Prisma
  let filtered = MOCK_CATEGORIES;

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        (c.description && c.description.toLowerCase().includes(searchLower))
    );
  }

  if (filters.parentId !== undefined) {
    filtered = filtered.filter((c) => c.parentId === filters.parentId);
  }

  if (filters.isActive !== undefined) {
    filtered = filtered.filter((c) => c.isActive === filters.isActive);
  }

  return filtered;
}

// 🚛 SUPPLIER QUERIES
export async function createSupplierQuery(
  input: CreateSupplierInput,
  userId: string
): Promise<any> {
  // TODO: Replace with Prisma
  const newSupplier = {
    id: `sup-${Date.now()}`,
    ...input,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fullSupplier = {
    ...newSupplier,
    products: [],
    _count: { products: 0 },
  };

  MOCK_SUPPLIERS.push(fullSupplier);
  return fullSupplier;
}

export async function getSuppliersQuery(
  filters: SupplierFilters = {}
): Promise<any[]> {
  // TODO: Replace with Prisma
  let filtered = MOCK_SUPPLIERS;

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        (s.email && s.email.toLowerCase().includes(searchLower)) ||
        (s.contactPerson &&
          s.contactPerson.toLowerCase().includes(searchLower))
    );
  }

  if (filters.isActive !== undefined) {
    filtered = filtered.filter((s) => s.isActive === filters.isActive);
  }

  if (filters.minRating !== undefined) {
    filtered = filtered.filter((s) => s.rating && s.rating >= filters.minRating!);
  }

  if (filters.country) {
    filtered = filtered.filter((s) => s.country === filters.country);
  }

  return filtered;
}

// 📊 STOCK MOVEMENT QUERIES
export async function addStockMovementQuery(
  input: CreateStockMovementInput,
  newStock: number,
  userId: string
): Promise<any> {
  // TODO: Replace with Prisma transaction
  const product = MOCK_PRODUCTS.find((p) => p.id === input.productId);
  if (!product) throw new Error("Product not found");

  const previousStock = product.stock;

  // Create movement record
  const movement = {
    id: `mov-${Date.now()}`,
    ...input,
    previousStock,
    newStock,
    createdAt: new Date(),
  };

  // Update product stock
  product.stock = newStock;
  product.updatedAt = new Date();

  // Add to movements
  MOCK_STOCK_MOVEMENTS.push(movement);

  return movement;
}

export async function getStockMovementsQuery(
  productId?: string
): Promise<any[]> {
  // TODO: Replace with Prisma
  if (productId) {
    return MOCK_STOCK_MOVEMENTS.filter((m) => m.productId === productId);
  }
  return MOCK_STOCK_MOVEMENTS;
}

// 📊 ANALYTICS QUERIES
export async function getInventoryStatsQuery(): Promise<any> {
  // TODO: Replace with Prisma aggregations
  const stats = {
    totalProducts: MOCK_PRODUCTS.length,
    activeProducts: MOCK_PRODUCTS.filter((p) => p.isActive).length,
    totalCategories: MOCK_CATEGORIES.length,
    totalSuppliers: MOCK_SUPPLIERS.length,
    totalValue: MOCK_PRODUCTS.reduce((sum, p) => sum + p.cost * p.stock, 0),
    totalRetailValue: MOCK_PRODUCTS.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    ),
    lowStockProducts: MOCK_PRODUCTS.filter((p) => p.stock <= p.minStock)
      .length,
    outOfStockProducts: MOCK_PRODUCTS.filter((p) => p.stock === 0).length,
    recentMovements: MOCK_STOCK_MOVEMENTS.filter(
      (m) => m.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
  };

  return stats;
}

export async function getLowStockAlertsQuery(): Promise<any[]> {
  // TODO: Replace with Prisma
  const alerts = MOCK_PRODUCTS.filter((product) => {
    const status = getProductStockStatus(product);
    return ["LOW_STOCK", "CRITICAL_STOCK", "OUT_OF_STOCK"].includes(status);
  }).map((product) => ({
    id: `alert-${product.id}`,
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    currentStock: product.stock,
    minStock: product.minStock,
    status: getProductStockStatus(product),
    category: product.category.name,
    lastMovement: MOCK_STOCK_MOVEMENTS.filter(
      (m) => m.productId === product.id
    )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
      ?.createdAt,
  }));

  return alerts;
}

// 🔧 UTILITY FUNCTIONS
function getProductStockStatus(
  product: any
): "IN_STOCK" | "LOW_STOCK" | "CRITICAL_STOCK" | "OUT_OF_STOCK" {
  if (product.stock === 0) return "OUT_OF_STOCK";
  if (product.stock <= 2) return "CRITICAL_STOCK";
  if (product.stock <= product.minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

// 📊 AGGREGATION QUERIES (for future Prisma implementation)
export async function getProductCountByCategoryQuery(): Promise<any[]> {
  // TODO: Implement with Prisma groupBy
  const counts = MOCK_CATEGORIES.map((category) => ({
    categoryId: category.id,
    categoryName: category.name,
    productCount: MOCK_PRODUCTS.filter((p) => p.categoryId === category.id)
      .length,
  }));

  return counts;
}

export async function getTopProductsByMovementQuery(limit = 10): Promise<any[]> {
  // TODO: Implement with Prisma aggregation
  const productMovements = MOCK_PRODUCTS.map((product) => {
    const movements = MOCK_STOCK_MOVEMENTS.filter(
      (m) => m.productId === product.id
    );
    return {
      ...product,
      movementCount: movements.length,
      totalQuantityMoved: movements.reduce(
        (sum, m) => sum + Math.abs(m.quantity),
        0
      ),
    };
  });

  return productMovements
    .sort((a, b) => b.movementCount - a.movementCount)
    .slice(0, limit);
}

// 🎯 SEARCH QUERIES
export async function searchProductsQuery(
  searchTerm: string,
  limit = 20
): Promise<any[]> {
  // TODO: Implement with Prisma full-text search or database-specific search
  const searchLower = searchTerm.toLowerCase();

  return MOCK_PRODUCTS
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        (product.barcode && product.barcode.includes(searchTerm))
    )
    .slice(0, limit);
}

export async function getProductsNeedingRestockQuery(): Promise<any[]> {
  // TODO: Implement with Prisma where clause
  return MOCK_PRODUCTS.filter(
    (product) => product.stock <= product.minStock && product.isActive
  );
}

// 📈 TREND QUERIES
export async function getStockTrendsQuery(
  productId: string,
  days = 30
): Promise<any[]> {
  // TODO: Implement with Prisma date filtering and aggregation
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return MOCK_STOCK_MOVEMENTS
    .filter((m) => m.productId === productId && m.createdAt >= cutoffDate)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
