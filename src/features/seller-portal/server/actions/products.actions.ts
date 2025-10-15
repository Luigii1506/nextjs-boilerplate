/**
 * 🏷️ PRODUCTS ACTIONS - Seller Portal
 * ====================================
 *
 * Server actions for products management
 * Quick visibility and channel updates
 *
 * Created: 2025-01-17
 */

"use server";

import { prisma } from "@/core/database/prisma";
import type { ApiResponse, ProductVisibilityUpdate, PaginatedResponse, ProductQuickView } from "../../types";
import { ProductVisibility, SalesChannel } from "@prisma/client";
import { getProductsQuickView, getCategoriesForFilter } from "../queries/products.queries";

/**
 * Update product visibility and channels
 */
export async function updateProductVisibilityAction(
  update: ProductVisibilityUpdate
): Promise<ApiResponse<void>> {
  try {
    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: update.productId },
    });

    if (!product) {
      return {
        success: false,
        error: "Producto no encontrado",
      };
    }

    // Update product
    await prisma.product.update({
      where: { id: update.productId },
      data: {
        visibility: update.visibility,
        availableChannels: update.availableChannels,
        isPublic: update.isPublic,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating product visibility:", error);
    return {
      success: false,
      error: "Error al actualizar visibilidad del producto",
    };
  }
}

/**
 * Toggle product active status
 */
export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean
): Promise<ApiResponse<void>> {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error toggling product active:", error);
    return {
      success: false,
      error: "Error al activar/desactivar producto",
    };
  }
}

/**
 * Bulk update visibility for multiple products
 */
export async function bulkUpdateVisibilityAction(
  productIds: string[],
  visibility: ProductVisibility,
  availableChannels?: SalesChannel[]
): Promise<ApiResponse<void>> {
  try {
    const updateData: any = {
      visibility,
    };

    if (availableChannels) {
      updateData.availableChannels = availableChannels;
    }

    await prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: updateData,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error bulk updating visibility:", error);
    return {
      success: false,
      error: "Error al actualizar productos en lote",
    };
  }
}

// ========================================
// 📊 QUERY ACTIONS (Replaces API Routes)
// ========================================

/**
 * Get products for quick view management
 * Replaces: GET /api/seller-portal/products
 */
export async function getProductsAction(
  page: number = 1,
  pageSize: number = 20,
  searchQuery?: string,
  categoryId?: string,
  visibility?: ProductVisibility
): Promise<PaginatedResponse<ProductQuickView>> {
  return await getProductsQuickView(page, pageSize, searchQuery, categoryId, visibility);
}

/**
 * Get categories for filter dropdown
 * Replaces: GET /api/seller-portal/products/categories
 */
export async function getCategoriesAction() {
  return await getCategoriesForFilter();
}
