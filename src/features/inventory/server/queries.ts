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
} from "../types";

// 📦 PRODUCT QUERIES
export async function createProductQuery(
  input: CreateProductInput,
  userId: string
): Promise<any> {
  return await prisma.$transaction(async (tx) => {
    // Create the product
    const product = await tx.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        description: input.description || null,
        categoryId: input.categoryId,
        price: input.price,
        cost: input.cost,
        stock: input.stock,
        minStock: input.minStock,
        maxStock: input.maxStock || null,
        unit: input.unit,
        barcode: input.barcode || null,
        images: input.images || [],
        supplierId: input.supplierId || null,
        tags: input.tags || [],
        metadata: input.metadata || null,
      },
    });

    // Create initial stock movement if stock > 0
    if (input.stock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: input.stock,
          previousStock: 0,
          newStock: input.stock,
          reason: "Stock inicial del producto",
          reference: `INIT-${product.sku}`,
          userId,
        },
      });
    }

    return product;
  });
}

export async function updateProductQuery(
  input: UpdateProductInput,
  userId: string
): Promise<any> {
  return await prisma.$transaction(async (tx) => {
    // Get current product for stock comparison
    const currentProduct = await tx.product.findUnique({
      where: { id: input.id },
      select: { stock: true, sku: true },
    });

    if (!currentProduct) {
      throw new Error("Producto no encontrado");
    }

    // Update the product
    const product = await tx.product.update({
      where: { id: input.id },
      data: {
        ...(input.sku && { sku: input.sku }),
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.cost !== undefined && { cost: input.cost }),
        ...(input.stock !== undefined && { stock: input.stock }),
        ...(input.minStock !== undefined && { minStock: input.minStock }),
        ...(input.maxStock !== undefined && { maxStock: input.maxStock }),
        ...(input.unit && { unit: input.unit }),
        ...(input.barcode !== undefined && { barcode: input.barcode }),
        ...(input.images && { images: input.images }),
        ...(input.supplierId !== undefined && { supplierId: input.supplierId }),
        ...(input.tags && { tags: input.tags }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
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

    return product;
  });
}

export async function deleteProductQuery(id: string): Promise<any> {
  return await prisma.$transaction(async (tx) => {
    // Get full product data for response
    const productToDelete = await tx.product.findUnique({
      where: { id },
    });

    if (!productToDelete) {
      throw new Error("Producto no encontrado durante la eliminación");
    }

    // Delete the product (CASCADE will handle stockMovements if any)
    await tx.product.delete({
      where: { id },
    });

    return productToDelete;
  });
}

export async function getProductsQuery(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20, sortDirection: "asc" }
): Promise<PaginatedResponse<any>> {
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

  // Parallel queries for better performance
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          include: {
            children: true,
            products: { select: { id: true } },
            _count: { select: { products: true, children: true } },
          },
        },
        supplier: {
          include: {
            products: { select: { id: true } },
            _count: { select: { products: true } },
          },
        },
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 5, // Recent movements only for performance
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        _count: { select: { stockMovements: true } },
      },
      orderBy,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Format response
  const totalPages = Math.ceil(totalCount / pagination.limit);
  return {
    data: products,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: totalCount,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
}

export async function getProductByIdQuery(id: string): Promise<any> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        include: {
          children: true,
          products: { select: { id: true } },
          _count: { select: { products: true, children: true } },
        },
      },
      supplier: {
        include: {
          products: { select: { id: true } },
          _count: { select: { products: true } },
        },
      },
      stockMovements: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      _count: { select: { stockMovements: true } },
    },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  return product;
}

// Business validation queries
export async function checkSkuUniqueness(
  sku: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.product.findUnique({
    where: { sku },
    select: { id: true },
  });

  return !existing || (excludeId && existing.id === excludeId);
}

export async function checkBarcodeUniqueness(
  barcode: string,
  excludeId?: string
): Promise<boolean> {
  if (!barcode) return true;

  const existing = await prisma.product.findUnique({
    where: { barcode },
    select: { id: true },
  });

  return !existing || (excludeId && existing.id === excludeId);
}

export async function getProductWithDependencies(id: string): Promise<any> {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        select: { id: true },
        take: 1,
      },
      _count: {
        select: { stockMovements: true },
      },
    },
  });
}

// 🏷️ CATEGORY QUERIES
export async function createCategoryQuery(
  input: CreateCategoryInput
): Promise<any> {
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

export async function getCategoriesQuery(
  filters: CategoryFilters = {}
): Promise<any[]> {
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

export async function validateCategoryExists(id: string): Promise<any> {
  return await prisma.category.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });
}

// 🚛 SUPPLIER QUERIES
export async function createSupplierQuery(
  input: CreateSupplierInput
): Promise<any> {
  return await prisma.supplier.create({
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
}

export async function getSuppliersQuery(
  filters: SupplierFilters = {}
): Promise<any[]> {
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

  return await prisma.supplier.findMany({
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
}

export async function validateSupplierExists(id: string): Promise<any> {
  return await prisma.supplier.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });
}

// 📊 STOCK MOVEMENT QUERIES
export async function addStockMovementQuery(
  input: CreateStockMovementInput,
  userId: string,
  previousStock: number,
  newStock: number
): Promise<any> {
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

export async function getProductForStockMovement(id: string): Promise<any> {
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
export async function getInventoryStatsQuery(): Promise<any> {
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

export async function getLowStockAlertsQuery(): Promise<any[]> {
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
  const alerts: any[] = [];

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
  const severityOrder = {
    OUT_OF_STOCK: 3,
    CRITICAL_STOCK: 2,
    LOW_STOCK: 1,
    IN_STOCK: 0,
  };

  alerts.sort((a, b) => {
    const severityDiff = severityOrder[b.status] - severityOrder[a.status];
    if (severityDiff !== 0) return severityDiff;
    return a.currentStock - b.currentStock;
  });

  return alerts;
}
