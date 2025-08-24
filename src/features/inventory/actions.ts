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
  SupplierService,
  StockMovementService,
  InventoryAnalyticsService,
} from "./server/service";
import type {
  ActionResult,
  Product,
  ProductWithRelations,
  Category,
  CategoryWithRelations,
  SupplierWithRelations,
  StockMovement,
  InventoryStats,
  StockAlert,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
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
export async function getProductsAction(
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<ActionResult<PaginatedResponse<ProductWithRelations>>> {
  try {
    // 🎯 Delegate to service (thick layer - already handles auth)
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

export async function getProductByIdAction(
  id: string
): Promise<ActionResult<ProductWithRelations>> {
  try {
    // 🎯 Delegate to service (thick layer - already handles auth)
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
export async function getCategoriesAction(
  filters?: CategoryFilters
): Promise<ActionResult<CategoryWithRelations[]>> {
  try {
    // 🎯 Delegate to service (thick layer - already handles auth)
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

// 🚛 SUPPLIER ACTIONS
export async function getSuppliersAction(
  filters?: SupplierFilters
): Promise<ActionResult<SupplierWithRelations[]>> {
  try {
    // 🎯 Delegate to service (thick layer - already handles auth)
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

// 📊 STOCK MOVEMENT ACTIONS
export async function addStockMovementAction(
  input: CreateStockMovementInput
): Promise<ActionResult<StockMovement>> {
  try {
    // 🔐 Authentication
    const session = await requireAuth();
    if (!session?.user) {
      return { success: false, error: "No autenticado" };
    }
    const userId = session.user.id;

    // 🎯 Delegate to service (thick layer)
    const result = await StockMovementService.addMovement(input, userId);

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
export async function getInventoryStatsAction(): Promise<
  ActionResult<InventoryStats>
> {
  try {
    // 🎯 Delegate to service (thick layer - already handles auth)
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

export async function getLowStockAlertsAction(): Promise<
  ActionResult<StockAlert[]>
> {
  try {
    // 🎯 Delegate to service (thick layer - already handles auth)
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
