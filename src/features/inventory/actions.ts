/**
 * 📦 INVENTORY SERVER ACTIONS
 * ===========================
 *
 * Next.js Server Actions para el módulo de inventory management
 * CRUD completo con validación, cache invalidation y mock data
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

"use server";

import { revalidateTag } from "next/cache";
import { requireAuth } from "@/core/auth/server";
import { INVENTORY_CACHE_TAGS } from "./constants";
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  createSupplierSchema,
  updateSupplierSchema,
  createStockMovementSchema,
  productFiltersSchema,
  categoryFiltersSchema,
  supplierFiltersSchema,
  paginationParamsSchema,
} from "./schemas";
import type {
  ActionResult,
  Product,
  ProductWithRelations,
  Category,
  CategoryWithRelations,
  Supplier,
  SupplierWithRelations,
  StockMovement,
  InventoryStats,
  StockAlert,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateStockMovementInput,
  ProductFilters,
  CategoryFilters,
  SupplierFilters,
  PaginationParams,
  PaginatedResponse,
  StockMovementType,
} from "./types";

// 🗃️ MOCK DATA (replace with real database calls)
const MOCK_CATEGORIES: CategoryWithRelations[] = [
  {
    id: "cat-1",
    name: "Electrónicos",
    description: "Dispositivos y accesorios electrónicos",
    parentId: null,
    color: "#3B82F6",
    icon: "Smartphone",
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    products: [],
    _count: { products: 15, children: 2 },
  },
  {
    id: "cat-2",
    name: "Ropa",
    description: "Prendas de vestir y accesorios",
    parentId: null,
    color: "#EC4899",
    icon: "Shirt",
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    products: [],
    _count: { products: 8, children: 0 },
  },
  {
    id: "cat-3",
    name: "Hogar",
    description: "Artículos para el hogar",
    parentId: null,
    color: "#10B981",
    icon: "Home",
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    products: [],
    _count: { products: 12, children: 1 },
  },
];

const MOCK_SUPPLIERS: SupplierWithRelations[] = [
  {
    id: "sup-1",
    name: "TechCorp SA",
    contactPerson: "Juan Pérez",
    email: "juan@techcorp.com",
    phone: "+52-55-1234-5678",
    website: "https://techcorp.com",
    taxId: "TCO123456789",
    paymentTerms: 30,
    isActive: true,
    rating: 4.5,
    notes: "Proveedor confiable de electrónicos",
    addressLine1: "Av. Reforma 123",
    addressLine2: "Col. Centro",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "06000",
    country: "MX",
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    _count: { products: 15 },
  },
  {
    id: "sup-2",
    name: "Textiles del Norte",
    contactPerson: "María González",
    email: "maria@textilesnorte.com",
    phone: "+52-81-9876-5432",
    website: "https://textilesnorte.com",
    taxId: "TDN987654321",
    paymentTerms: 15,
    isActive: true,
    rating: 4.2,
    notes: "Especialistas en ropa y textiles",
    addressLine1: "Blvd. Díaz Ordaz 456",
    addressLine2: null,
    city: "Monterrey",
    state: "Nuevo León",
    postalCode: "64000",
    country: "MX",
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    _count: { products: 8 },
  },
];

const MOCK_PRODUCTS: ProductWithRelations[] = [
  {
    id: "prod-1",
    sku: "IPHONE15-128",
    name: "iPhone 15 128GB",
    description: "Smartphone Apple iPhone 15 con 128GB de almacenamiento",
    categoryId: "cat-1",
    price: 24999.0,
    cost: 18000.0,
    stock: 25,
    minStock: 5,
    maxStock: 50,
    unit: "piece",
    barcode: "194253781234",
    images: [
      "https://example.com/iphone15-front.jpg",
      "https://example.com/iphone15-back.jpg",
    ],
    isActive: true,
    supplierId: "sup-1",
    tags: ["apple", "smartphone", "premium"],
    metadata: { warranty: "12 months", color: "Natural Titanium" },
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[0]!,
    supplier: MOCK_SUPPLIERS[0],
    stockMovements: [],
    _count: { stockMovements: 8 },
  },
  {
    id: "prod-2",
    sku: "TSHIRT-M-BLK",
    name: "Playera Básica Negra M",
    description: "Playera básica de algodón 100% color negro talla M",
    categoryId: "cat-2",
    price: 299.0,
    cost: 150.0,
    stock: 2, // Low stock
    minStock: 5,
    maxStock: 100,
    unit: "piece",
    barcode: "123456789012",
    images: ["https://example.com/tshirt-black.jpg"],
    isActive: true,
    supplierId: "sup-2",
    tags: ["ropa", "algodón", "básica"],
    metadata: { size: "M", material: "100% cotton" },
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[1]!,
    supplier: MOCK_SUPPLIERS[1],
    stockMovements: [],
    _count: { stockMovements: 3 },
  },
  {
    id: "prod-3",
    sku: "LAMP-LED-DIM",
    name: "Lámpara LED Regulable",
    description: "Lámpara de escritorio LED con regulador de intensidad",
    categoryId: "cat-3",
    price: 899.0,
    cost: 450.0,
    stock: 0, // Out of stock
    minStock: 3,
    maxStock: 25,
    unit: "piece",
    barcode: null,
    images: ["https://example.com/lamp-led.jpg"],
    isActive: true,
    supplierId: null,
    tags: ["lámpara", "led", "regulable", "escritorio"],
    metadata: { power: "12W", color_temp: "3000K-6000K" },
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[2]!,
    supplier: null,
    stockMovements: [],
    _count: { stockMovements: 5 },
  },
];

// 📊 MOCK STOCK MOVEMENTS
const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-1",
    productId: "prod-1",
    type: "IN" as StockMovementType,
    quantity: 30,
    previousStock: 10,
    newStock: 40,
    reason: "Compra inicial de inventario",
    reference: "PO-001",
    userId: "user-1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "mov-2",
    productId: "prod-1",
    type: "OUT" as StockMovementType,
    quantity: 15,
    previousStock: 40,
    newStock: 25,
    reason: "Venta cliente mayorista",
    reference: "SALE-123",
    userId: "user-1",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "mov-3",
    productId: "prod-2",
    type: "OUT" as StockMovementType,
    quantity: 3,
    previousStock: 5,
    newStock: 2,
    reason: "Venta en tienda",
    reference: "SALE-124",
    userId: "user-1",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
];

// 🔍 Helper functions
function applyProductFilters(
  products: ProductWithRelations[],
  filters: ProductFilters
): ProductWithRelations[] {
  return products.filter((product) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !product.name.toLowerCase().includes(searchLower) &&
        !product.sku.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.supplierId && product.supplierId !== filters.supplierId) {
      return false;
    }

    if (
      filters.isActive !== undefined &&
      product.isActive !== filters.isActive
    ) {
      return false;
    }

    if (filters.stockStatus) {
      const stockStatus = getStockStatus(product);
      if (stockStatus !== filters.stockStatus) {
        return false;
      }
    }

    return true;
  });
}

function getStockStatus(
  product: ProductWithRelations
): "IN_STOCK" | "LOW_STOCK" | "CRITICAL_STOCK" | "OUT_OF_STOCK" {
  if (product.stock === 0) return "OUT_OF_STOCK";
  if (product.stock <= 2) return "CRITICAL_STOCK";
  if (product.stock <= product.minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

function paginateResults<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = items.slice(offset, offset + limit);

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

// 📦 PRODUCT ACTIONS
export async function getProductsAction(
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<ActionResult<PaginatedResponse<ProductWithRelations>>> {
  try {
    await requireAuth();

    // Validate inputs
    const validatedFilters = filters ? productFiltersSchema.parse(filters) : {};
    const validatedPagination = pagination
      ? paginationParamsSchema.parse(pagination)
      : { page: 1, limit: 20, sortDirection: "asc" as const };

    // TODO: Replace with actual Prisma query
    let filteredProducts = applyProductFilters(MOCK_PRODUCTS, validatedFilters);

    // Sort products
    if (validatedPagination.sortBy) {
      filteredProducts.sort((a, b) => {
        const aValue = (a as any)[validatedPagination.sortBy!];
        const bValue = (b as any)[validatedPagination.sortBy!];
        const direction = validatedPagination.sortDirection === "desc" ? -1 : 1;

        if (typeof aValue === "string") {
          return aValue.localeCompare(bValue) * direction;
        }
        return (aValue - bValue) * direction;
      });
    }

    const result = paginateResults(
      filteredProducts,
      validatedPagination.page,
      validatedPagination.limit
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[Inventory] Error fetching products:", error);
    return {
      success: false,
      error: "Error al obtener productos",
    };
  }
}

export async function getProductByIdAction(
  id: string
): Promise<ActionResult<ProductWithRelations>> {
  try {
    await requireAuth();

    // TODO: Replace with actual Prisma query
    const product = MOCK_PRODUCTS.find((p) => p.id === id);

    if (!product) {
      return {
        success: false,
        error: "Producto no encontrado",
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("[Inventory] Error fetching product:", error);
    return {
      success: false,
      error: "Error al obtener producto",
    };
  }
}

export async function createProductAction(
  input: CreateProductInput
): Promise<ActionResult<Product>> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = createProductSchema.parse(input);

    // TODO: Replace with actual Prisma creation
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      ...validatedInput,
      images: validatedInput.images || [],
      tags: validatedInput.tags || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock: Add to in-memory array
    MOCK_PRODUCTS.push({
      ...newProduct,
      category: MOCK_CATEGORIES.find((c) => c.id === newProduct.categoryId)!,
      supplier: newProduct.supplierId
        ? MOCK_SUPPLIERS.find((s) => s.id === newProduct.supplierId) || null
        : null,
      stockMovements: [],
      _count: { stockMovements: 0 },
    });

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.all);
    revalidateTag(INVENTORY_CACHE_TAGS.stats);

    return {
      success: true,
      data: newProduct,
    };
  } catch (error) {
    console.error("[Inventory] Error creating product:", error);
    return {
      success: false,
      error: "Error al crear producto",
    };
  }
}

export async function updateProductAction(
  input: UpdateProductInput
): Promise<ActionResult<Product>> {
  try {
    await requireAuth();

    // Validate input
    const validatedInput = updateProductSchema.parse(input);

    // TODO: Replace with actual Prisma update
    const productIndex = MOCK_PRODUCTS.findIndex(
      (p) => p.id === validatedInput.id
    );
    if (productIndex === -1) {
      return {
        success: false,
        error: "Producto no encontrado",
      };
    }

    const updatedProduct: Product = {
      ...MOCK_PRODUCTS[productIndex]!,
      ...validatedInput,
      updatedAt: new Date(),
    };

    MOCK_PRODUCTS[productIndex] = {
      ...MOCK_PRODUCTS[productIndex]!,
      ...updatedProduct,
    };

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.product(validatedInput.id!));
    revalidateTag(INVENTORY_CACHE_TAGS.all);
    revalidateTag(INVENTORY_CACHE_TAGS.stats);

    return {
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    console.error("[Inventory] Error updating product:", error);
    return {
      success: false,
      error: "Error al actualizar producto",
    };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    // TODO: Check for dependencies (orders, sales, etc.)
    const productIndex = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return {
        success: false,
        error: "Producto no encontrado",
      };
    }

    // TODO: Replace with actual Prisma deletion
    MOCK_PRODUCTS.splice(productIndex, 1);

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.product(id));
    revalidateTag(INVENTORY_CACHE_TAGS.all);
    revalidateTag(INVENTORY_CACHE_TAGS.stats);

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Inventory] Error deleting product:", error);
    return {
      success: false,
      error: "Error al eliminar producto",
    };
  }
}

// 🏷️ CATEGORY ACTIONS
export async function getCategoriesAction(
  filters?: CategoryFilters
): Promise<ActionResult<CategoryWithRelations[]>> {
  try {
    await requireAuth();

    const validatedFilters = filters
      ? categoryFiltersSchema.parse(filters)
      : {};

    // TODO: Replace with actual Prisma query
    let filteredCategories = MOCK_CATEGORIES;

    if (validatedFilters.search) {
      const searchLower = validatedFilters.search.toLowerCase();
      filteredCategories = filteredCategories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          (cat.description &&
            cat.description.toLowerCase().includes(searchLower))
      );
    }

    if (validatedFilters.isActive !== undefined) {
      filteredCategories = filteredCategories.filter(
        (cat) => cat.isActive === validatedFilters.isActive
      );
    }

    return {
      success: true,
      data: filteredCategories,
    };
  } catch (error) {
    console.error("[Inventory] Error fetching categories:", error);
    return {
      success: false,
      error: "Error al obtener categorías",
    };
  }
}

export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<ActionResult<Category>> {
  try {
    await requireAuth();

    const validatedInput = createCategorySchema.parse(input);

    // TODO: Replace with actual Prisma creation
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...validatedInput,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    MOCK_CATEGORIES.push({
      ...newCategory,
      children: [],
      products: [],
      _count: { products: 0, children: 0 },
    });

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.categories);
    revalidateTag(INVENTORY_CACHE_TAGS.all);

    return {
      success: true,
      data: newCategory,
    };
  } catch (error) {
    console.error("[Inventory] Error creating category:", error);
    return {
      success: false,
      error: "Error al crear categoría",
    };
  }
}

// 🚛 SUPPLIER ACTIONS
export async function getSuppliersAction(
  filters?: SupplierFilters
): Promise<ActionResult<SupplierWithRelations[]>> {
  try {
    await requireAuth();

    const validatedFilters = filters
      ? supplierFiltersSchema.parse(filters)
      : {};

    // TODO: Replace with actual Prisma query
    let filteredSuppliers = MOCK_SUPPLIERS;

    if (validatedFilters.search) {
      const searchLower = validatedFilters.search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(
        (sup) =>
          sup.name.toLowerCase().includes(searchLower) ||
          (sup.email && sup.email.toLowerCase().includes(searchLower))
      );
    }

    if (validatedFilters.isActive !== undefined) {
      filteredSuppliers = filteredSuppliers.filter(
        (sup) => sup.isActive === validatedFilters.isActive
      );
    }

    return {
      success: true,
      data: filteredSuppliers,
    };
  } catch (error) {
    console.error("[Inventory] Error fetching suppliers:", error);
    return {
      success: false,
      error: "Error al obtener proveedores",
    };
  }
}

// 📊 STOCK MOVEMENT ACTIONS
export async function addStockMovementAction(
  input: CreateStockMovementInput
): Promise<ActionResult<StockMovement>> {
  try {
    await requireAuth();

    const validatedInput = createStockMovementSchema.parse(input);

    // Find product and update stock
    const productIndex = MOCK_PRODUCTS.findIndex(
      (p) => p.id === validatedInput.productId
    );
    if (productIndex === -1) {
      return {
        success: false,
        error: "Producto no encontrado",
      };
    }

    const product = MOCK_PRODUCTS[productIndex]!;
    const previousStock = product.stock;
    let newStock = previousStock;

    // Calculate new stock based on movement type
    switch (validatedInput.type) {
      case "IN":
        newStock = previousStock + validatedInput.quantity;
        break;
      case "OUT":
        newStock = previousStock - validatedInput.quantity;
        if (newStock < 0) {
          return {
            success: false,
            error: "Stock insuficiente para la salida solicitada",
          };
        }
        break;
      case "ADJUSTMENT":
        // For adjustments, quantity can be positive or negative
        newStock = previousStock + validatedInput.quantity;
        if (newStock < 0) {
          return {
            success: false,
            error: "El ajuste resultaría en stock negativo",
          };
        }
        break;
    }

    // TODO: Replace with actual Prisma transaction
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      ...validatedInput,
      previousStock,
      newStock,
      createdAt: new Date(),
    };

    // Update product stock
    MOCK_PRODUCTS[productIndex] = {
      ...product,
      stock: newStock,
      updatedAt: new Date(),
    };

    // Add movement to mock array
    MOCK_STOCK_MOVEMENTS.push(newMovement);

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.product(validatedInput.productId));
    revalidateTag(INVENTORY_CACHE_TAGS.stockMovements);
    revalidateTag(INVENTORY_CACHE_TAGS.stats);

    return {
      success: true,
      data: newMovement,
    };
  } catch (error) {
    console.error("[Inventory] Error adding stock movement:", error);
    return {
      success: false,
      error: "Error al registrar movimiento de stock",
    };
  }
}

// 📊 ANALYTICS & STATS ACTIONS
export async function getInventoryStatsAction(): Promise<
  ActionResult<InventoryStats>
> {
  try {
    await requireAuth();

    // TODO: Replace with actual Prisma aggregations
    const stats: InventoryStats = {
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

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("[Inventory] Error fetching stats:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas",
    };
  }
}

export async function getLowStockAlertsAction(): Promise<
  ActionResult<StockAlert[]>
> {
  try {
    await requireAuth();

    // TODO: Replace with actual Prisma query
    const alerts: StockAlert[] = MOCK_PRODUCTS.filter((product) => {
      const status = getStockStatus(product);
      return (
        status === "LOW_STOCK" ||
        status === "CRITICAL_STOCK" ||
        status === "OUT_OF_STOCK"
      );
    }).map((product) => ({
      id: `alert-${product.id}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      currentStock: product.stock,
      minStock: product.minStock,
      status: getStockStatus(product),
      category: product.category.name,
      lastMovement: MOCK_STOCK_MOVEMENTS.filter(
        (m) => m.productId === product.id
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        ?.createdAt,
    }));

    return {
      success: true,
      data: alerts,
    };
  } catch (error) {
    console.error("[Inventory] Error fetching low stock alerts:", error);
    return {
      success: false,
      error: "Error al obtener alertas de stock",
    };
  }
}
