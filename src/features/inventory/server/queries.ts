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
} from "../types";

// 🔄 DECIMAL CONVERSION HELPERS
// ============================
// Converts Prisma Decimal types to numbers for TypeScript compatibility

function convertDecimalToNumber(decimal: Decimal | number): number {
  return typeof decimal === "number" ? decimal : Number(decimal.toString());
}

function convertDecimalToNullableNumber(
  decimal: Decimal | number | null
): number | null {
  return decimal === null ? null : convertDecimalToNumber(decimal);
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

  // Build where clause
  const where = {
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { sku: { contains: filters.search, mode: "insensitive" as const } },
        {
          description: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.supplierId && { supplierId: filters.supplierId }),
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters.stockStatus && {
      ...(filters.stockStatus === "OUT_OF_STOCK" && { stock: { equals: 0 } }),
      ...(filters.stockStatus === "CRITICAL_STOCK" && {
        stock: { lte: 2, gt: 0 },
      }),
      ...(filters.stockStatus === "LOW_STOCK" && {
        AND: [
          { stock: { gt: 2 } },
          // Use raw SQL for stock <= minStock comparison
        ],
      }),
      ...(filters.stockStatus === "IN_STOCK" && { stock: { gt: 0 } }),
    }),
  };

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
export async function getSupplierByIdQuery(
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
export async function createSupplierQuery(
  input: CreateSupplierInput
): Promise<Supplier> {
  const rawSupplier = await prisma.supplier.create({
    data: {
      name: input.name,
      contactPerson: input.contactPerson || null,
      email: input.email || null,
      phone: input.phone || null,
      website: input.website || null,
      taxId: input.taxId || null,
      paymentTerms: input.paymentTerms || 30,
      rating: input.rating || null,
      notes: input.notes || null,
      addressLine1: input.addressLine1 || null,
      addressLine2: input.addressLine2 || null,
      city: input.city || null,
      state: input.state || null,
      postalCode: input.postalCode || null,
      country: input.country || "MX",
    },
  });

  // Convert Decimal fields to numbers for TypeScript compatibility
  return {
    ...rawSupplier,
    rating: convertDecimalToNullableNumber(rawSupplier.rating),
  };
}

// 🚛 Extended Supplier type for listing with relations
type SupplierListResponse = Supplier & {
  products: Array<{ id: string; name: string; sku: string; stock: number }>;
  _count: {
    products: number;
  };
};

export async function getSuppliersQuery(
  filters: SupplierFilters = {}
): Promise<SupplierListResponse[]> {
  const where = {
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        {
          contactPerson: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
        { email: { contains: filters.search, mode: "insensitive" as const } },
        { taxId: { contains: filters.search, mode: "insensitive" as const } },
      ],
    }),
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
  };

  const rawSuppliers = await prisma.supplier.findMany({
    where,
    include: {
      products: {
        where: { isActive: true },
        select: { id: true, name: true, sku: true, stock: true },
      },
      _count: {
        select: {
          products: { where: { isActive: true } },
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  // Convert Decimal fields to numbers for TypeScript compatibility
  return rawSuppliers.map((supplier) => ({
    ...supplier,
    rating: convertDecimalToNullableNumber(supplier.rating),
  }));
}

export async function validateSupplierExists(id: string): Promise<boolean> {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });
  return !!supplier && supplier.isActive;
}

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
