/**
 * 📦 INVENTORY QUERIES
 * ===================
 *
 * Data Access Layer - Database queries para Inventory Management
 * Clean Architecture: Infrastructure Layer (Database)
 *
 * All TODOs implemented with Prisma for real database operations
 * Created: 2025-01-17 - Inventory Management Module
 */

import { prisma } from "@/core/database/prisma";
import { Prisma } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import type {
  Product,
  ProductWithRelations,
  Category,
  Supplier,
  StockMovement,
  StockStatus,
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
  SupplierWithRelations,
} from "../types";

// 🔄 DECIMAL CONVERSION HELPERS
// ============================
// Handles conversion between Prisma Decimal and JavaScript number types

function convertNumberToDecimal(value: number | string | Decimal): Decimal {
  if (typeof value === "number") {
    return new Prisma.Decimal(value);
  }
  if (value instanceof Prisma.Decimal) {
    return value;
  }
  return new Prisma.Decimal(value);
}

function convertDecimalToNumber(decimal: Decimal | number): number {
  return typeof decimal === "number" ? decimal : Number(decimal.toString());
}

function convertDecimalToNullableNumber(
  decimal: Decimal | number | null | undefined
): number | null {
  if (decimal === null || decimal === undefined) {
    return null;
  }
  return typeof decimal === "number" ? decimal : Number(decimal.toString());
}

function convertJsonValueToMetadata(
  jsonValue: unknown
): Record<string, unknown> | null {
  if (jsonValue === null || jsonValue === undefined) return null;
  if (typeof jsonValue === "object" && jsonValue !== null) {
    return jsonValue as Record<string, unknown>;
  }
  return null;
}

// 📦 PRODUCT QUERIES
export async function createProductQuery(
  input: CreateProductInput,
  userId: string
): Promise<Product> {
  return await prisma.$transaction(async (tx) => {
    const stock = input.stock ?? 0;
    const minStock = input.minStock ?? 0;

    // Create the product
    const rawProduct = await tx.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        description: input.description || null,
        categoryId: input.categoryId,
        price: input.price,
        cost: input.cost,
        stock,
        minStock,
        maxStock: input.maxStock || null,
        unit: input.unit || "piece",
        barcode: input.barcode || null,
        images: input.images || [],
        supplierId: input.supplierId || null,
        tags: input.tags || [],
        metadata: input.metadata
          ? JSON.parse(JSON.stringify(input.metadata))
          : null,
      },
    });

    // Create initial stock movement if stock > 0
    if (stock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: rawProduct.id,
          type: "IN",
          quantity: stock,
          previousStock: 0,
          newStock: stock,
          reason: "Stock inicial del producto",
          reference: `INIT-${rawProduct.sku}`,
          userId,
        },
      });
    }

    // Convert Decimal fields to numbers for TypeScript compatibility
    return {
      ...rawProduct,
      price: convertDecimalToNumber(rawProduct.price),
      cost: convertDecimalToNumber(rawProduct.cost),
      metadata: convertJsonValueToMetadata(rawProduct.metadata),
    };
  });
}

export async function updateProductQuery(
  input: UpdateProductInput,
  userId: string
): Promise<Product> {
  return await prisma.$transaction(async (tx) => {
    // Get current product for stock comparison
    const currentProduct = await tx.product.findUnique({
      where: { id: input.id },
      select: { stock: true, sku: true },
    });

    if (!currentProduct) {
      throw new Error("Producto no encontrado");
    }

    // 🐛 Debug: Log update input data
    console.log("🐛 [updateProductQuery] Input data:", {
      id: input.id,
      categoryId: input.categoryId,
      supplierId: input.supplierId,
      barcode: input.barcode,
      sku: input.sku,
      name: input.name,
    });

    // ✅ Prepare data with proper null handling
    const updateData: Record<string, unknown> = {};

    // Required/always-present fields
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.cost !== undefined) updateData.cost = input.cost;
    if (input.stock !== undefined) updateData.stock = input.stock;
    if (input.minStock !== undefined) updateData.minStock = input.minStock;
    if (input.maxStock !== undefined) updateData.maxStock = input.maxStock;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // ✅ Special handling for categoryId (REQUIRED field - cannot be null)
    if (input.categoryId !== undefined) {
      if (!input.categoryId) {
        throw new Error("Category is required - categoryId cannot be empty");
      }

      // ✅ Validate category exists and is active
      const categoryExists = await tx.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true, isActive: true },
      });

      if (!categoryExists) {
        throw new Error(`Category with ID ${input.categoryId} does not exist`);
      }

      if (!categoryExists.isActive) {
        throw new Error(`Category with ID ${input.categoryId} is inactive`);
      }

      updateData.categoryId = input.categoryId;
    }

    // ✅ Special handling for nullable fields
    if (input.barcode !== undefined) {
      updateData.barcode = input.barcode || null; // Convert empty string to null
    }

    if (input.supplierId !== undefined) {
      const supplierId = input.supplierId || null; // Convert empty string to null

      // ✅ Validate supplier exists if provided
      if (supplierId) {
        const supplierExists = await tx.supplier.findUnique({
          where: { id: supplierId },
          select: { id: true, isActive: true },
        });

        if (!supplierExists) {
          throw new Error(`Supplier with ID ${supplierId} does not exist`);
        }

        if (!supplierExists.isActive) {
          throw new Error(`Supplier with ID ${supplierId} is inactive`);
        }
      }

      updateData.supplierId = supplierId;
    }

    // 🐛 Debug: Log prepared update data
    console.log("🐛 [updateProductQuery] Prepared update data:", {
      updateData,
      categoryId: updateData.categoryId,
      supplierId: updateData.supplierId,
      barcode: updateData.barcode,
    });

    // Update the product
    const rawProduct = await tx.product.update({
      where: { id: input.id },
      data: updateData,
    });

    // Create stock movement if stock changed
    if (input.stock !== undefined && input.stock !== currentProduct.stock) {
      const quantity = input.stock - currentProduct.stock;
      const type = quantity > 0 ? "IN" : "OUT";

      await tx.stockMovement.create({
        data: {
          productId: input.id,
          type: type === "IN" || type === "OUT" ? type : "ADJUSTMENT",
          quantity: Math.abs(quantity),
          previousStock: currentProduct.stock,
          newStock: input.stock,
          reason: `Ajuste manual de inventario - Actualización de producto`,
          reference: `UPDATE-${currentProduct.sku}`,
          userId,
        },
      });
    }

    // Convert Decimal fields to numbers for TypeScript compatibility
    return {
      ...rawProduct,
      price: convertDecimalToNumber(rawProduct.price),
      cost: convertDecimalToNumber(rawProduct.cost),
      metadata: convertJsonValueToMetadata(rawProduct.metadata),
    };
  });
}

export async function deleteProductQuery(id: string): Promise<Product> {
  return await prisma.$transaction(async (tx) => {
    // Get full product data for response
    const rawProductToDelete = await tx.product.findUnique({
      where: { id },
    });

    if (!rawProductToDelete) {
      throw new Error("Producto no encontrado durante la eliminación");
    }

    // Delete the product (CASCADE will handle stockMovements if any)
    await tx.product.delete({
      where: { id },
    });

    // Convert Decimal fields to numbers for TypeScript compatibility
    return {
      ...rawProductToDelete,
      price: convertDecimalToNumber(rawProductToDelete.price),
      cost: convertDecimalToNumber(rawProductToDelete.cost),
      metadata: convertJsonValueToMetadata(rawProductToDelete.metadata),
    };
  });
}

// 📦 Product List Response Type - minimal data for listing performance
export type ProductListItem = Product & {
  category: Pick<Category, "id" | "name" | "color" | "icon">;
  supplier: Pick<Supplier, "id" | "name" | "contactPerson"> | null;
  _count: { stockMovements: number };
};

export async function getProductsQuery(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20, sortDirection: "asc" }
): Promise<PaginatedResponse<ProductListItem>> {
  // Ensure pagination has default values
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;

  // Build where clause with advanced filters support
  const whereConditions: any[] = [];

  // Search filter
  if (filters.search) {
    whereConditions.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { sku: { contains: filters.search, mode: "insensitive" as const } },
        { description: { contains: filters.search, mode: "insensitive" as const } },
        { barcode: { contains: filters.search, mode: "insensitive" as const } },
      ],
    });
  }

  // Category filters - support both single and multi-select
  if (filters.categoryId) {
    whereConditions.push({ categoryId: filters.categoryId });
  } else if (filters.categoryIds && filters.categoryIds.length > 0) {
    whereConditions.push({ categoryId: { in: filters.categoryIds } });
  }

  // Supplier filters - support both single and multi-select
  if (filters.supplierId) {
    whereConditions.push({ supplierId: filters.supplierId });
  } else if (filters.supplierIds && filters.supplierIds.length > 0) {
    whereConditions.push({ supplierId: { in: filters.supplierIds } });
  }

  // Active status filter
  if (filters.isActive !== undefined) {
    whereConditions.push({ isActive: filters.isActive });
  }

  // Stock status filters - support multi-select
  if (filters.stockStatuses && filters.stockStatuses.length > 0) {
    const stockConditions = filters.stockStatuses.map((status) => {
      switch (status) {
        case "OUT_OF_STOCK":
          return { stock: { equals: 0 } };
        case "CRITICAL_STOCK":
          return { stock: { lte: 2, gt: 0 } };
        case "LOW_STOCK":
          return { AND: [{ stock: { gt: 2 } }] };
        case "IN_STOCK":
          return { stock: { gt: 0 } };
        default:
          return {};
      }
    });
    if (stockConditions.length > 0) {
      whereConditions.push({ OR: stockConditions });
    }
  } else if (filters.stockStatus) {
    // Single stock status (backward compatibility)
    switch (filters.stockStatus) {
      case "OUT_OF_STOCK":
        whereConditions.push({ stock: { equals: 0 } });
        break;
      case "CRITICAL_STOCK":
        whereConditions.push({ stock: { lte: 2, gt: 0 } });
        break;
      case "LOW_STOCK":
        whereConditions.push({ stock: { gt: 2 } });
        break;
      case "IN_STOCK":
        whereConditions.push({ stock: { gt: 0 } });
        break;
    }
  }

  // Stock range filters
  if (filters.minStock !== undefined) {
    whereConditions.push({ stock: { gte: filters.minStock } });
  }
  if (filters.maxStock !== undefined) {
    whereConditions.push({ stock: { lte: filters.maxStock } });
  }

  // Price range filters
  if (filters.minPrice !== undefined) {
    whereConditions.push({ price: { gte: filters.minPrice } });
  }
  if (filters.maxPrice !== undefined) {
    whereConditions.push({ price: { lte: filters.maxPrice } });
  }

  // Cost range filters
  if (filters.minCost !== undefined) {
    whereConditions.push({ cost: { gte: filters.minCost } });
  }
  if (filters.maxCost !== undefined) {
    whereConditions.push({ cost: { lte: filters.maxCost } });
  }

  // Date range filters
  if (filters.createdAfter) {
    whereConditions.push({ createdAt: { gte: new Date(filters.createdAfter) } });
  }
  if (filters.createdBefore) {
    whereConditions.push({ createdAt: { lte: new Date(filters.createdBefore) } });
  }
  if (filters.updatedAfter) {
    whereConditions.push({ updatedAt: { gte: new Date(filters.updatedAfter) } });
  }
  if (filters.updatedBefore) {
    whereConditions.push({ updatedAt: { lte: new Date(filters.updatedBefore) } });
  }

  // Advanced boolean filters
  if (filters.hasImages !== undefined) {
    whereConditions.push(
      filters.hasImages
        ? { images: { isEmpty: false } }
        : { OR: [{ images: { isEmpty: true } }, { images: { equals: [] } }] }
    );
  }

  if (filters.isOutOfStock) {
    whereConditions.push({ stock: { equals: 0 } });
  }

  if (filters.hasLowStock) {
    // Stock below minStock threshold
    whereConditions.push({
      AND: [
        { stock: { gt: 0 } },
        // This is an approximation - ideally use raw SQL for stock < minStock
        { stock: { lte: 10 } },
      ],
    });
  }

  if (filters.hasCriticalStock) {
    whereConditions.push({ stock: { lte: 2, gt: 0 } });
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    whereConditions.push({ tags: { hasSome: filters.tags } });
  }

  // Combine all conditions
  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Build order clause
  const orderBy = pagination.sortBy
    ? { [pagination.sortBy]: pagination.sortDirection }
    : { createdAt: "desc" as const };

  // ⚡ OPTIMIZED PARALLEL QUERIES - Minimal necessary data for max speed
  const [rawProducts, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      // 🚀 FAST - Only essential fields for listing
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        categoryId: true,
        price: true,
        cost: true,
        stock: true,
        minStock: true,
        maxStock: true,
        unit: true,
        barcode: true,
        images: true,
        supplierId: true,
        tags: true,
        metadata: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // 🚀 FAST - Minimal category info (no deep nesting)
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        // 🚀 FAST - Minimal supplier info (no deep nesting)
        supplier: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
          },
        },
        // 🚀 FAST - Essential counts only
        _count: {
          select: { stockMovements: true },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Convert Decimal fields to numbers for TypeScript compatibility
  const products: ProductListItem[] = rawProducts.map((product) => ({
    ...product,
    price: convertDecimalToNumber(product.price),
    cost: convertDecimalToNumber(product.cost),
    metadata: convertJsonValueToMetadata(product.metadata),
    // category and supplier are already in the correct partial format
  }));

  // Format response
  const totalPages = Math.ceil(totalCount / limit);
  return {
    data: products,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// 📦 Product Detail Response Type - full data for detail view
export type ProductDetailItem = Product & {
  category: Pick<
    Category,
    "id" | "name" | "description" | "color" | "icon" | "parentId"
  >;
  supplier: Pick<
    Supplier,
    "id" | "name" | "contactPerson" | "email" | "phone"
  > | null;
  stockMovements: (Pick<
    StockMovement,
    | "id"
    | "type"
    | "quantity"
    | "previousStock"
    | "newStock"
    | "reason"
    | "reference"
    | "createdAt"
  > & {
    user: { id: string; name: string | null }; // User info from auth system
  })[];
  _count: { stockMovements: number };
};

// ⚡ OPTIMIZED - Full product details with necessary relations only
export async function getProductByIdQuery(
  id: string
): Promise<ProductDetailItem | null> {
  const rawProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      // 🚀 FAST - All product fields
      id: true,
      sku: true,
      name: true,
      description: true,
      categoryId: true,
      price: true,
      cost: true,
      stock: true,
      minStock: true,
      maxStock: true,
      unit: true,
      barcode: true,
      images: true,
      supplierId: true,
      tags: true,
      metadata: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // 🚀 FAST - Essential category with minimal nesting
      category: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          parentId: true,
        },
      },
      // 🚀 FAST - Essential supplier info
      supplier: {
        select: {
          id: true,
          name: true,
          contactPerson: true,
          email: true,
          phone: true,
        },
      },
      // 🚀 FAST - Recent stock movements (limit for performance)
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 10, // Limit recent movements
        select: {
          id: true,
          type: true,
          quantity: true,
          previousStock: true,
          newStock: true,
          reason: true,
          reference: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: { select: { stockMovements: true } },
    },
  });

  if (!rawProduct) {
    throw new Error("Producto no encontrado");
  }

  // Convert Decimal fields to numbers for TypeScript compatibility
  return {
    ...rawProduct,
    price: convertDecimalToNumber(rawProduct.price),
    cost: convertDecimalToNumber(rawProduct.cost),
    metadata: convertJsonValueToMetadata(rawProduct.metadata),
    // category, supplier, and stockMovements are already in the correct partial format
  } as ProductDetailItem;
}

// ⚡ ULTRA-FAST VALIDATION QUERIES - Minimal data for max speed
export async function checkSkuUniqueness(
  sku: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.product.findUnique({
    where: { sku },
    select: { id: true }, // 🚀 FAST - Only ID needed
  });

  return !existing || (!!excludeId && existing.id === excludeId);
}

export async function checkBarcodeUniqueness(
  barcode: string,
  excludeId?: string
): Promise<boolean> {
  if (!barcode) return true;

  const existing = await prisma.product.findUnique({
    where: { barcode },
    select: { id: true }, // 🚀 FAST - Only ID needed
  });

  return !existing || (!!excludeId && existing.id === excludeId);
}

// ⚡ ULTRA-FAST - Validation-specific product query (minimal fields)
export async function getProductForValidation(
  id: string
): Promise<Pick<Product, "id" | "sku" | "name" | "stock" | "isActive"> | null> {
  return await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      sku: true,
      name: true,
      stock: true,
      isActive: true,
    }, // 🚀 FAST - Only essential validation fields
  });
}

// ⚡ ULTRA-FAST - Category validation by ID
export async function getCategoryByIdQuery(
  id: string
): Promise<Pick<Category, "id" | "name" | "isActive"> | null> {
  return await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isActive: true,
    }, // 🚀 FAST - Only essential validation fields
  });
}

// ⚡ ULTRA-FAST - Supplier validation by ID
export async function getSupplierForValidationQuery(
  id: string
): Promise<Pick<Supplier, "id" | "name" | "isActive"> | null> {
  return await prisma.supplier.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isActive: true,
    }, // 🚀 FAST - Only essential validation fields
  });
}

// 📦 Product Dependencies Response Type - minimal data for dependency checking
type ProductDependenciesItem = Product & {
  category: Category;
  supplier: Supplier | null;
  stockMovements: { id: string }[]; // Just IDs for dependency checking
  _count: { stockMovements: number };
};

export async function getProductWithDependencies(
  id: string
): Promise<ProductDependenciesItem | null> {
  const rawProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      stockMovements: {
        select: { id: true },
        take: 1,
      },
      _count: {
        select: { stockMovements: true },
      },
    },
  });

  if (!rawProduct) return null;

  // Convert Decimal fields to numbers for TypeScript compatibility
  return {
    ...rawProduct,
    price: convertDecimalToNumber(rawProduct.price),
    cost: convertDecimalToNumber(rawProduct.cost),
    metadata: convertJsonValueToMetadata(rawProduct.metadata),
    supplier: rawProduct.supplier
      ? {
          ...rawProduct.supplier,
          rating: convertDecimalToNullableNumber(rawProduct.supplier.rating),
        }
      : null,
  } as ProductDependenciesItem;
}

// 🏷️ CATEGORY QUERIES
export async function createCategoryQuery(
  input: CreateCategoryInput
): Promise<Category> {
  return await prisma.category.create({
    data: {
      name: input.name,
      description: input.description || null,
      parentId: input.parentId || null,
      color: input.color || "#6B7280",
      icon: input.icon || null,
      sortOrder: input.sortOrder,
    },
  });
}

// 🏷️ Extended Category type for listing with relations
type CategoryListResponse = Category & {
  parent: Category | null;
  children: Category[];
  products: Array<{ id: string }>;
  _count: {
    products: number;
    children: number;
  };
};

export async function getCategoriesQuery(
  filters: CategoryFilters = {}
): Promise<CategoryListResponse[]> {
  const where = {
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        {
          description: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
  };

  return await prisma.category.findMany({
    where,
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      products: {
        where: { isActive: true },
        select: { id: true },
      },
      _count: {
        select: {
          products: { where: { isActive: true } },
          children: { where: { isActive: true } },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function checkCategoryNameUniqueness(
  name: string
): Promise<boolean> {
  const existing = await prisma.category.findUnique({
    where: { name },
    select: { id: true },
  });

  return !existing;
}

export async function validateCategoryExists(id: string): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });
  return !!category && category.isActive;
}

export async function updateCategoryQuery(
  id: string,
  input: Partial<CreateCategoryInput> & { isActive?: boolean }
): Promise<Category> {
  return await prisma.category.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.parentId !== undefined && { parentId: input.parentId }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
}

export async function deleteCategoryQuery(id: string): Promise<Category> {
  return await prisma.category.delete({
    where: { id },
  });
}

export async function getCategoryWithProductsQuery(
  id: string
): Promise<CategoryListResponse | null> {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      products: {
        where: { isActive: true },
        select: { id: true },
      },
      _count: {
        select: {
          products: { where: { isActive: true } },
          children: { where: { isActive: true } },
        },
      },
    },
  });
}

// 🚛 SUPPLIER QUERIES
// ⚠️ MOVED TO: @/features/suppliers/server/queries
// Supplier is now a SHARED module
// Use these imports instead:
// - createSupplierQuery
// - updateSupplierQuery
// - deleteSupplierQuery
// - getSuppliersQuery
// - getSupplierByIdQuery
// - getSupplierWithProductsQuery
// - validateSupplierExists

// 📊 STOCK MOVEMENT QUERIES
export async function addStockMovementQuery(
  input: CreateStockMovementInput,
  userId: string,
  previousStock: number,
  newStock: number
): Promise<StockMovement> {
  return await prisma.$transaction(
    async (tx) => {
      // Create the stock movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          previousStock,
          newStock,
          reason: input.reason,
          reference: input.reference || null,
          userId,
        },
      });

      // Update product stock
      await tx.product.update({
        where: { id: input.productId },
        data: { stock: newStock },
      });

      return movement;
    },
    {
      timeout: 10000, // 10 seconds
    }
  );
}

export async function getProductForStockMovement(
  id: string
): Promise<Pick<
  Product,
  "id" | "name" | "sku" | "stock" | "minStock" | "maxStock" | "isActive"
> | null> {
  return await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      minStock: true,
      maxStock: true,
      isActive: true,
    },
  });
}

export async function getAllStockMovementsQuery(): Promise<StockMovement[]> {
  return await prisma.stockMovement.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          images: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// 📊 ANALYTICS QUERIES
export async function getInventoryStatsQuery(): Promise<
  Record<string, number>
> {
  const [
    productCounts,
    categoryCounts,
    supplierCounts,
    valueAggregations,
    lowStockCount,
    outOfStockCount,
    recentMovementsCount,
  ] = await Promise.all([
    // Product counts
    prisma.product.aggregate({
      _count: { id: true },
      where: { isActive: true },
    }),

    // Category count
    prisma.category.count({
      where: { isActive: true },
    }),

    // Supplier count
    prisma.supplier.count({
      where: { isActive: true },
    }),

    // Value aggregations
    prisma.product
      .findMany({
        where: { isActive: true },
        select: {
          cost: true,
          price: true,
          stock: true,
        },
      })
      .then((products) => {
        let totalValue = 0;
        let totalRetailValue = 0;

        products.forEach((product) => {
          const cost = Number(product.cost);
          const price = Number(product.price);
          totalValue += cost * product.stock;
          totalRetailValue += price * product.stock;
        });

        return { totalValue, totalRetailValue };
      }),

    // Low stock products (stock <= minStock)
    prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE "isActive" = true 
      AND stock <= "minStock"
    ` as Promise<[{ count: bigint }]>,

    // Out of stock products
    prisma.product.count({
      where: {
        isActive: true,
        stock: 0,
      },
    }),

    // Recent movements (last 24 hours)
    prisma.stockMovement.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    totalProducts: productCounts._count.id,
    activeProducts: productCounts._count.id,
    totalCategories: categoryCounts,
    totalSuppliers: supplierCounts,
    totalValue: valueAggregations.totalValue,
    totalRetailValue: valueAggregations.totalRetailValue,
    lowStockProducts: Number(lowStockCount[0]?.count || 0),
    outOfStockProducts: outOfStockCount,
    recentMovements: recentMovementsCount,
  };
}

// 📊 Stock Alert type
type StockAlert = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  minStock: number;
  status: StockStatus;
  category: string;
  lastMovement?: Date;
};

export async function getLowStockAlertsQuery(): Promise<StockAlert[]> {
  // Get products with stock issues
  const productsWithAlerts = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { stock: { equals: 0 } }, // OUT_OF_STOCK
        { stock: { lte: 2, gt: 0 } }, // CRITICAL_STOCK
      ],
    },
    include: {
      category: {
        select: { name: true },
      },
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  // Get LOW_STOCK products using raw query
  const lowStockProducts = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      sku: string;
      stock: number;
      minStock: number;
      categoryName: string;
    }[]
  >`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p.stock,
      p."minStock",
      c.name as "categoryName"
    FROM products p
    INNER JOIN categories c ON p."categoryId" = c.id
    WHERE p."isActive" = true
      AND p.stock <= p."minStock"
      AND p.stock > 2
  `;

  // Process all products and create alerts
  const alerts: StockAlert[] = [];

  // Add regular stock alerts
  productsWithAlerts.forEach((product) => {
    let status: "OUT_OF_STOCK" | "CRITICAL_STOCK" | "LOW_STOCK" | "IN_STOCK";

    if (product.stock === 0) {
      status = "OUT_OF_STOCK";
    } else if (product.stock <= 2) {
      status = "CRITICAL_STOCK";
    } else {
      return; // Skip
    }

    alerts.push({
      id: `alert-${product.id}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      currentStock: product.stock,
      minStock: product.minStock,
      status,
      category: product.category.name,
      lastMovement: product.stockMovements[0]?.createdAt || undefined,
    });
  });

  // Add LOW_STOCK alerts
  lowStockProducts.forEach((product) => {
    alerts.push({
      id: `alert-${product.id}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      currentStock: product.stock,
      minStock: product.minStock,
      status: "LOW_STOCK",
      category: product.categoryName,
      lastMovement: undefined,
    });
  });

  // Sort alerts by severity
  const severityOrder: Record<StockStatus, number> = {
    OUT_OF_STOCK: 3,
    CRITICAL_STOCK: 2,
    LOW_STOCK: 1,
    IN_STOCK: 0,
  };

  alerts.sort((a, b) => {
    const severityDiff =
      severityOrder[b.status as StockStatus] -
      severityOrder[a.status as StockStatus];
    if (severityDiff !== 0) return severityDiff;
    return a.currentStock - b.currentStock;
  });

  return alerts;
}

// 📊 ANALYTICS & REPORTS QUERIES

/**
 * Get stock movements analytics by date range
 * Returns aggregated data for charts
 */
export async function getStockMovementsByDateQuery(
  startDate: Date,
  endDate: Date
): Promise<
  Array<{
    date: string;
    IN: number;
    OUT: number;
    ADJUSTMENT: number;
  }>
> {
  const movements = await prisma.stockMovement.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      type: true,
      quantity: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by date and type
  const grouped = movements.reduce((acc, movement) => {
    const date = movement.createdAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = { date, IN: 0, OUT: 0, ADJUSTMENT: 0, TRANSFER: 0 };
    }
    acc[date][movement.type] += movement.quantity;
    return acc;
  }, {} as Record<string, { date: string; IN: number; OUT: number; ADJUSTMENT: number; TRANSFER: number }>);

  return Object.values(grouped).map(({ date, IN, OUT, ADJUSTMENT }) => ({
    date,
    IN,
    OUT,
    ADJUSTMENT,
  }));
}

/**
 * Get inventory value over time
 */
export async function getInventoryValueOverTimeQuery(
  days: number = 30
): Promise<
  Array<{
    date: string;
    totalValue: number;
    totalRetailValue: number;
  }>
> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all stock movements in the range
  const movements = await prisma.stockMovement.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      quantity: true,
      type: true,
      product: {
        select: {
          cost: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Calculate cumulative value by date
  const dailyValues: Record<
    string,
    { date: string; totalValue: number; totalRetailValue: number }
  > = {};

  let currentTotalValue = 0;
  let currentRetailValue = 0;

  movements.forEach((movement) => {
    const date = movement.createdAt.toISOString().split("T")[0];
    const cost = Number(movement.product.cost);
    const price = Number(movement.product.price);
    const change =
      movement.type === "IN"
        ? movement.quantity
        : movement.type === "OUT"
        ? -movement.quantity
        : 0;

    currentTotalValue += cost * change;
    currentRetailValue += price * change;

    dailyValues[date] = {
      date,
      totalValue: currentTotalValue,
      totalRetailValue: currentRetailValue,
    };
  });

  return Object.values(dailyValues);
}

/**
 * Get top products by value
 */
export async function getTopProductsByValueQuery(
  limit: number = 10
): Promise<
  Array<{
    id: string;
    name: string;
    sku: string;
    totalValue: number;
    stock: number;
  }>
> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      cost: true,
      stock: true,
    },
    orderBy: {
      stock: "desc",
    },
    take: limit * 2, // Get more to calculate and filter
  });

  return products
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      totalValue: Number(product.cost) * product.stock,
      stock: product.stock,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);
}

/**
 * Get products by category with stats
 */
export async function getProductsByCategoryQuery(): Promise<
  Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    totalStock: number;
    totalValue: number;
  }>
> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      products: {
        where: { isActive: true },
        select: {
          cost: true,
          stock: true,
        },
      },
    },
  });

  return categories.map((category) => ({
    categoryId: category.id,
    categoryName: category.name,
    productCount: category.products.length,
    totalStock: category.products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: category.products.reduce(
      (sum, p) => sum + Number(p.cost) * p.stock,
      0
    ),
  }));
}

/**
 * Get stock alerts summary
 */
export async function getStockAlertsSummaryQuery(): Promise<{
  critical: number;
  low: number;
  ok: number;
  outOfStock: number;
}> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      stock: true,
      minStock: true,
    },
  });

  const summary = {
    critical: 0,
    low: 0,
    ok: 0,
    outOfStock: 0,
  };

  products.forEach((product) => {
    if (product.stock === 0) {
      summary.outOfStock++;
    } else if (product.stock < product.minStock * 0.5) {
      summary.critical++;
    } else if (product.stock <= product.minStock) {
      summary.low++;
    } else {
      summary.ok++;
    }
  });

  return summary;
}
