/**
 * 📦 INVENTORY SERVER ACTIONS
 * ===========================
 *
 * Next.js Server Actions para el módulo de inventory management
 * Clean Architecture: Infrastructure Layer (Thin Layer - Solo Presentación)
 *
 * Responsabilidades:
 * - Schema parsing/validation (input sanitization)
 * - Session authentication
 * - Service delegation
 * - Cache invalidation (UI concerns)
 * - Error transformation for presentation
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

"use server";

import { revalidateTag } from "next/cache";
import { requireAuth } from "@/core/auth/server";
import { INVENTORY_CACHE_TAGS } from "./constants";
import {
  ProductService,
  CategoryService,
  StockMovementService,
  InventoryAnalyticsService,
} from "./server/service";
// SupplierService now from shared module
import { SupplierService } from "@/features/suppliers/server/service";
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
  CreateSupplierInput,
  CreateStockMovementInput,
  ProductFilters,
  CategoryFilters,
  SupplierFilters,
  PaginationParams,
  PaginatedResponse,
} from "./types";

// 🎯 Clean Architecture Implementation
// Actions = Thin Infrastructure Layer
// Services = Thick Domain Layer (Business Logic)
// This follows the established pattern in the codebase

// 📦 PRODUCT ACTIONS

// ⚡ ULTRA-FAST READ OPERATIONS - No auth needed for public data
export async function getProductsAction(
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<ActionResult<PaginatedResponse<ProductWithRelations>>> {
  try {
    // 🚀 FAST - Direct service call, zero auth overhead
    const result = await ProductService.getMany(filters, pagination);

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - getProducts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener productos",
    };
  }
}

// ⚡ ULTRA-FAST READ - No auth for public product details
export async function getProductByIdAction(
  id: string
): Promise<ActionResult<ProductWithRelations>> {
  try {
    // 🚀 FAST - Direct service call, zero auth overhead
    const result = await ProductService.getById(id);

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - getProductById:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener producto",
    };
  }
}

export async function createProductAction(
  input: CreateProductInput
): Promise<ActionResult<Product>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await ProductService.create(input, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.products);
      revalidateTag(INVENTORY_CACHE_TAGS.all);
      revalidateTag(INVENTORY_CACHE_TAGS.stats);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - createProduct:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear producto",
    };
  }
}

export async function updateProductAction(
  id: string,
  input: UpdateProductInput
): Promise<ActionResult<Product>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await ProductService.update({ ...input, id }, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.products);
      revalidateTag(INVENTORY_CACHE_TAGS.product(id));
      revalidateTag(INVENTORY_CACHE_TAGS.all);
      revalidateTag(INVENTORY_CACHE_TAGS.stats);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - updateProduct:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar producto",
    };
  }
}

export async function deleteProductAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await ProductService.delete(id, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.products);
      revalidateTag(INVENTORY_CACHE_TAGS.product(id));
      revalidateTag(INVENTORY_CACHE_TAGS.all);
      revalidateTag(INVENTORY_CACHE_TAGS.stats);
    }

    return result as ActionResult<void>;
  } catch (error) {
    console.error("[Inventory] Action error - deleteProduct:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar producto",
    };
  }
}

// 🏷️ CATEGORY ACTIONS
// ⚡ ULTRA-FAST READ - No auth for public categories
export async function getCategoriesAction(
  filters?: CategoryFilters
): Promise<ActionResult<CategoryWithRelations[]>> {
  try {
    // 🚀 FAST - Direct service call, zero auth overhead
    const result = await CategoryService.getMany(filters);

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - getCategories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener categorías",
    };
  }
}

export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<ActionResult<Category>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await CategoryService.create(input, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.categories);
      revalidateTag(INVENTORY_CACHE_TAGS.all);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - createCategory:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear categoría",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  input: CreateCategoryInput & { isActive?: boolean }
): Promise<ActionResult<Category>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await CategoryService.update(id, input, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.categories);
      revalidateTag(INVENTORY_CACHE_TAGS.category(id));
      revalidateTag(INVENTORY_CACHE_TAGS.products); // Categories affect products
      revalidateTag(INVENTORY_CACHE_TAGS.all);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - updateCategory:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar categoría",
    };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await CategoryService.delete(id, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.categories);
      revalidateTag(INVENTORY_CACHE_TAGS.category(id));
      revalidateTag(INVENTORY_CACHE_TAGS.products); // Categories affect products
      revalidateTag(INVENTORY_CACHE_TAGS.all);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - deleteCategory:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar categoría",
    };
  }
}

// 🚛 SUPPLIER ACTIONS
// ⚡ ULTRA-FAST READ - No auth for public suppliers
export async function getSuppliersAction(
  filters?: SupplierFilters
): Promise<ActionResult<SupplierWithRelations[]>> {
  try {
    // 🚀 FAST - Direct service call, zero auth overhead
    const result = await SupplierService.getMany(filters);

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - getSuppliers:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener proveedores",
    };
  }
}

export async function createSupplierAction(
  input: CreateSupplierInput
): Promise<ActionResult<Supplier>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await SupplierService.create(input, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.suppliers);
      revalidateTag(INVENTORY_CACHE_TAGS.all);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - createSupplier:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear proveedor",
    };
  }
}

export async function updateSupplierAction(
  id: string,
  input: CreateSupplierInput & { isActive?: boolean }
): Promise<ActionResult<Supplier>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    // Convert to UpdateSupplierInput by adding id
    const result = await SupplierService.update(id, { ...input, id }, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.suppliers);
      revalidateTag(INVENTORY_CACHE_TAGS.supplier(id));
      revalidateTag(INVENTORY_CACHE_TAGS.products); // Suppliers affect products
      revalidateTag(INVENTORY_CACHE_TAGS.all);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - updateSupplier:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar proveedor",
    };
  }
}

export async function deleteSupplierAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await SupplierService.delete(id, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.suppliers);
      revalidateTag(INVENTORY_CACHE_TAGS.supplier(id));
      revalidateTag(INVENTORY_CACHE_TAGS.products); // Suppliers affect products
      revalidateTag(INVENTORY_CACHE_TAGS.all);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - deleteSupplier:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar proveedor",
    };
  }
}

// 📊 STOCK MOVEMENT ACTIONS
export async function addStockMovementAction(
  input: Omit<CreateStockMovementInput, "userId">
): Promise<ActionResult<StockMovement>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // Add userId from session to input
    const fullInput: CreateStockMovementInput = {
      ...input,
      userId,
    };

    // 🎯 Delegate to service (thick layer)
    const result = await StockMovementService.addMovement(fullInput, userId);

    // 🔄 Cache invalidation (UI concerns)
    if (result.success) {
      revalidateTag(INVENTORY_CACHE_TAGS.products);
      revalidateTag(INVENTORY_CACHE_TAGS.product(input.productId));
      revalidateTag(INVENTORY_CACHE_TAGS.stockMovements);
      revalidateTag(INVENTORY_CACHE_TAGS.stats);
    }

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - addStockMovement:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al registrar movimiento de stock",
    };
  }
}

// 📊 ANALYTICS & STATS ACTIONS

// ⚡ ULTRA-FAST READ - No auth for public stats
export async function getInventoryStatsAction(): Promise<
  ActionResult<InventoryStats>
> {
  try {
    // 🚀 FAST - Direct service call, zero auth overhead
    const result = await InventoryAnalyticsService.getStats();

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - getInventoryStats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener estadísticas",
    };
  }
}

// ⚡ ULTRA-FAST READ - No auth for public alerts
export async function getLowStockAlertsAction(): Promise<
  ActionResult<StockAlert[]>
> {
  try {
    // 🚀 FAST - Direct service call, zero auth overhead
    const result = await InventoryAnalyticsService.getLowStockAlerts();

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - getLowStockAlerts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener alertas de stock",
    };
  }
}

export async function getStockMovementsAction(): Promise<
  ActionResult<StockMovement[]>
> {
  try {
    // 🚀 FAST - Direct service call
    const result = await StockMovementService.getAll();

    return result;
  } catch (error) {
    console.error("[Inventory] Action error - getStockMovements:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener movimientos de stock",
    };
  }
}

// 📊 ANALYTICS ACTIONS

export async function getStockMovementsByDateAction(
  startDate: Date,
  endDate: Date
): Promise<
  ActionResult<
    Array<{
      date: string;
      IN: number;
      OUT: number;
      ADJUSTMENT: number;
    }>
  >
> {
  try {
    const { getStockMovementsByDateQuery } = await import("./server/queries");
    const data = await getStockMovementsByDateQuery(startDate, endDate);
    return { success: true, data };
  } catch (error) {
    console.error("[Inventory] Action error - getStockMovementsByDate:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener movimientos por fecha",
    };
  }
}

export async function getInventoryValueOverTimeAction(
  days: number = 30
): Promise<
  ActionResult<
    Array<{
      date: string;
      totalValue: number;
      totalRetailValue: number;
    }>
  >
> {
  try {
    const { getInventoryValueOverTimeQuery } = await import("./server/queries");
    const data = await getInventoryValueOverTimeQuery(days);
    return { success: true, data };
  } catch (error) {
    console.error(
      "[Inventory] Action error - getInventoryValueOverTime:",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener valor del inventario",
    };
  }
}

export async function getTopProductsByValueAction(limit: number = 10): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      sku: string;
      totalValue: number;
      stock: number;
    }>
  >
> {
  try {
    const { getTopProductsByValueQuery } = await import("./server/queries");
    const data = await getTopProductsByValueQuery(limit);
    return { success: true, data };
  } catch (error) {
    console.error("[Inventory] Action error - getTopProductsByValue:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener productos principales",
    };
  }
}

export async function getProductsByCategoryAction(): Promise<
  ActionResult<
    Array<{
      categoryId: string;
      categoryName: string;
      productCount: number;
      totalStock: number;
      totalValue: number;
    }>
  >
> {
  try {
    const { getProductsByCategoryQuery } = await import("./server/queries");
    const data = await getProductsByCategoryQuery();
    return { success: true, data };
  } catch (error) {
    console.error("[Inventory] Action error - getProductsByCategory:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener productos por categoría",
    };
  }
}

export async function getStockAlertsSummaryAction(): Promise<
  ActionResult<{
    critical: number;
    low: number;
    ok: number;
    outOfStock: number;
  }>
> {
  try {
    const { getStockAlertsSummaryQuery } = await import("./server/queries");
    const data = await getStockAlertsSummaryQuery();
    return { success: true, data };
  } catch (error) {
    console.error("[Inventory] Action error - getStockAlertsSummary:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener resumen de alertas",
    };
  }
}

// 🎯 BULK OPERATIONS ACTIONS
// ============================

/**
 * Bulk update category for multiple products
 */
export async function bulkUpdateCategoryAction(
  productIds: string[],
  categoryId: string
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  try {
    await requireAuth();

    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se proporcionaron productos" };
    }

    if (!categoryId) {
      return { success: false, error: "No se proporcionó una categoría" };
    }

    // Update all products
    const { prisma } = await import("@/core/database/prisma");
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        categoryId,
        updatedAt: new Date(),
      },
    });

    // Invalidate caches
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.categories);

    return {
      success: true,
      data: {
        successCount: result.count,
        failedCount: productIds.length - result.count,
      },
    };
  } catch (error) {
    console.error("[Inventory] Action error - bulkUpdateCategory:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar categorías",
    };
  }
}

/**
 * Bulk update supplier for multiple products
 */
export async function bulkUpdateSupplierAction(
  productIds: string[],
  supplierId: string
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  try {
    await requireAuth();

    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se proporcionaron productos" };
    }

    if (!supplierId) {
      return { success: false, error: "No se proporcionó un proveedor" };
    }

    // Update all products
    const { prisma } = await import("@/core/database/prisma");
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        supplierId,
        updatedAt: new Date(),
      },
    });

    // Invalidate caches
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.suppliers);

    return {
      success: true,
      data: {
        successCount: result.count,
        failedCount: productIds.length - result.count,
      },
    };
  } catch (error) {
    console.error("[Inventory] Action error - bulkUpdateSupplier:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar proveedores",
    };
  }
}

/**
 * Bulk adjust prices for multiple products
 */
export async function bulkAdjustPricesAction(
  productIds: string[],
  adjustment: {
    type: "percentage" | "fixed";
    value: number;
    operation: "increase" | "decrease";
  }
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  try {
    await requireAuth();

    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se proporcionaron productos" };
    }

    if (!adjustment.value || adjustment.value <= 0) {
      return { success: false, error: "Valor de ajuste inválido" };
    }

    // Get all products
    const { prisma } = await import("@/core/database/prisma");
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    // Calculate new prices
    const updates = products.map((product) => {
      const currentPrice = Number(product.price);
      let newPrice: number;

      if (adjustment.type === "percentage") {
        const multiplier =
          adjustment.operation === "increase"
            ? 1 + adjustment.value / 100
            : 1 - adjustment.value / 100;
        newPrice = currentPrice * multiplier;
      } else {
        newPrice =
          adjustment.operation === "increase"
            ? currentPrice + adjustment.value
            : currentPrice - adjustment.value;
      }

      // Ensure price doesn't go below 0
      newPrice = Math.max(0, newPrice);

      return { id: product.id, newPrice };
    });

    // Update products
    let successCount = 0;
    for (const update of updates) {
      try {
        await prisma.product.update({
          where: { id: update.id },
          data: { price: update.newPrice, updatedAt: new Date() },
        });
        successCount++;
      } catch (error) {
        console.error(`Error updating product ${update.id}:`, error);
      }
    }

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.products);

    return {
      success: true,
      data: {
        successCount,
        failedCount: productIds.length - successCount,
      },
    };
  } catch (error) {
    console.error("[Inventory] Action error - bulkAdjustPrices:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al ajustar precios",
    };
  }
}

/**
 * Bulk adjust costs for multiple products
 */
export async function bulkAdjustCostsAction(
  productIds: string[],
  adjustment: {
    type: "percentage" | "fixed";
    value: number;
    operation: "increase" | "decrease";
  }
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  try {
    await requireAuth();

    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se proporcionaron productos" };
    }

    if (!adjustment.value || adjustment.value <= 0) {
      return { success: false, error: "Valor de ajuste inválido" };
    }

    // Get all products
    const { prisma } = await import("@/core/database/prisma");
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, cost: true },
    });

    // Calculate new costs
    const updates = products.map((product) => {
      const currentCost = Number(product.cost);
      let newCost: number;

      if (adjustment.type === "percentage") {
        const multiplier =
          adjustment.operation === "increase"
            ? 1 + adjustment.value / 100
            : 1 - adjustment.value / 100;
        newCost = currentCost * multiplier;
      } else {
        newCost =
          adjustment.operation === "increase"
            ? currentCost + adjustment.value
            : currentCost - adjustment.value;
      }

      // Ensure cost doesn't go below 0
      newCost = Math.max(0, newCost);

      return { id: product.id, newCost };
    });

    // Update products
    let successCount = 0;
    for (const update of updates) {
      try {
        await prisma.product.update({
          where: { id: update.id },
          data: { cost: update.newCost, updatedAt: new Date() },
        });
        successCount++;
      } catch (error) {
        console.error(`Error updating product ${update.id}:`, error);
      }
    }

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.products);

    return {
      success: true,
      data: {
        successCount,
        failedCount: productIds.length - successCount,
      },
    };
  } catch (error) {
    console.error("[Inventory] Action error - bulkAdjustCosts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al ajustar costos",
    };
  }
}

/**
 * Bulk activate/deactivate products
 */
export async function bulkUpdateActiveStatusAction(
  productIds: string[],
  isActive: boolean
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  try {
    await requireAuth();

    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se proporcionaron productos" };
    }

    const { prisma } = await import("@/core/database/prisma");
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });

    // Invalidate cache
    revalidateTag(INVENTORY_CACHE_TAGS.products);

    return {
      success: true,
      data: {
        successCount: result.count,
        failedCount: productIds.length - result.count,
      },
    };
  } catch (error) {
    console.error("[Inventory] Action error - bulkUpdateActiveStatus:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar estado",
    };
  }
}

/**
 * Bulk activate products - convenience wrapper
 */
export async function bulkActivateProductsAction(
  productIds: string[]
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  return bulkUpdateActiveStatusAction(productIds, true);
}

/**
 * Bulk deactivate products - convenience wrapper
 */
export async function bulkDeactivateProductsAction(
  productIds: string[]
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  return bulkUpdateActiveStatusAction(productIds, false);
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProductsAction(
  productIds: string[]
): Promise<ActionResult<{ successCount: number; failedCount: number }>> {
  try {
    await requireAuth();

    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se proporcionaron productos" };
    }

    const { prisma } = await import("@/core/database/prisma");

    // Delete products (cascade will handle relations)
    const result = await prisma.product.deleteMany({
      where: {
        id: { in: productIds },
      },
    });

    // Invalidate caches
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.stats);

    return {
      success: true,
      data: {
        successCount: result.count,
        failedCount: productIds.length - result.count,
      },
    };
  } catch (error) {
    console.error("[Inventory] Action error - bulkDeleteProducts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar productos",
    };
  }
}

// ================================================================================
// 📥 BULK IMPORT ACTIONS
// ================================================================================

export interface ImportProductInput {
  sku: string;
  name: string;
  description?: string;
  categoryName?: string;
  supplierName?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  unit?: string;
  barcode?: string;
  location?: string;
  weight?: number;
  isActive: boolean;
}

/**
 * Importa productos masivamente desde CSV/Excel
 */
export async function bulkImportProductsAction(
  products: ImportProductInput[]
): Promise<
  ActionResult<{
    successCount: number;
    failedCount: number;
    errors: Array<{ sku: string; error: string }>;
  }>
> {
  try {
    await requireAuth();

    const { prisma } = await import("@/core/database/prisma");
    const errors: Array<{ sku: string; error: string }> = [];
    let successCount = 0;

    // Obtener categorías y proveedores existentes para mapear nombres a IDs
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });

    const suppliers = await prisma.supplier.findMany({
      select: { id: true, name: true },
    });

    const categoryMap = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id])
    );
    const supplierMap = new Map(
      suppliers.map((s) => [s.name.toLowerCase(), s.id])
    );

    // Procesar cada producto
    for (const productInput of products) {
      try {
        // Verificar si el SKU ya existe
        const existingProduct = await prisma.product.findUnique({
          where: { sku: productInput.sku },
        });

        if (existingProduct) {
          errors.push({
            sku: productInput.sku,
            error: "El SKU ya existe en el sistema",
          });
          continue;
        }

        // Mapear categoría y proveedor
        let categoryId: string | undefined;
        let supplierId: string | undefined;

        if (productInput.categoryName) {
          categoryId = categoryMap.get(productInput.categoryName.toLowerCase());
          if (!categoryId) {
            // Crear categoría si no existe
            const newCategory = await prisma.category.create({
              data: {
                name: productInput.categoryName,
                description: `Categoría creada automáticamente durante importación`,
              },
            });
            categoryId = newCategory.id;
            categoryMap.set(
              productInput.categoryName.toLowerCase(),
              categoryId
            );
          }
        }

        if (productInput.supplierName) {
          supplierId = supplierMap.get(productInput.supplierName.toLowerCase());
          if (!supplierId) {
            // Crear proveedor si no existe
            const newSupplier = await prisma.supplier.create({
              data: {
                name: productInput.supplierName,
                contactInfo: { email: "", phone: "" },
              },
            });
            supplierId = newSupplier.id;
            supplierMap.set(
              productInput.supplierName.toLowerCase(),
              supplierId
            );
          }
        }

        // Crear el producto
        await prisma.product.create({
          data: {
            sku: productInput.sku,
            name: productInput.name,
            description: productInput.description || "",
            categoryId: categoryId || categories[0]?.id, // Usar primera categoría como fallback
            supplierId: supplierId,
            price: productInput.price,
            cost: productInput.cost,
            stock: productInput.stock,
            minStock: productInput.minStock,
            maxStock: productInput.maxStock,
            unit: productInput.unit || "piece",
            barcode: productInput.barcode,
            location: productInput.location,
            weight: productInput.weight,
            isActive: productInput.isActive,
          },
        });

        successCount++;
      } catch (error) {
        errors.push({
          sku: productInput.sku,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    // Invalidar caches
    revalidateTag(INVENTORY_CACHE_TAGS.products);
    revalidateTag(INVENTORY_CACHE_TAGS.categories);
    revalidateTag(INVENTORY_CACHE_TAGS.suppliers);
    revalidateTag(INVENTORY_CACHE_TAGS.stats);

    return {
      success: true,
      data: {
        successCount,
        failedCount: errors.length,
        errors,
      },
    };
  } catch (error) {
    console.error("[Inventory] Action error - bulkImportProducts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al importar productos",
    };
  }
}
