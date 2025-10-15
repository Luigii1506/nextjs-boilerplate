/**
 * 🎁 PROMOTIONS ACTIONS - Seller Portal
 * ======================================
 *
 * Server actions for promotions management
 * Complete CRUD operations and statistics
 *
 * Created: 2025-01-17
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/core/database/prisma";
import type { ApiResponse, PaginatedResponse, PromotionFormData } from "../../types";
import {
  getPromotionsQuery,
  getPromotionDetailsQuery,
  getActivePromotionsCountQuery,
  getPromotionsStatsQuery,
  type PromotionListItem,
  type PromotionDetails,
  type PromotionFilters,
} from "../queries/promotions.queries";

// ========================================
// 📝 CREATE PROMOTION
// ========================================

export async function createPromotionAction(
  data: PromotionFormData
): Promise<ApiResponse<{ id: string }>> {
  try {
    console.log("🎁 [SELLER PORTAL] Creating promotion:", data.name);

    const promotion = await prisma.promotion.create({
      data: {
        name: data.name,
        description: data.description || null,
        type: data.type,
        discountType: data.discountType,
        discountValue: data.discountValue,
        appliesTo: data.appliesTo,
        startAt: data.startAt,
        endAt: data.endAt || null,
        isActive: data.isActive ?? true,
        maxUsesTotal: data.maxUsesTotal || null,
        maxUsesPerUser: data.maxUsesPerUser || null,
        minPurchaseAmount: data.minPurchaseAmount || null,
        minQuantity: data.minQuantity || null,
        availableChannels: data.availableChannels as any || [],
        targetProductIds: data.targetProductIds || [],
        targetCategoryIds: data.targetCategoryIds || [],
        isPriority: data.isPriority ?? false,
        usageCount: 0,
      },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Promotion created successfully:", promotion.id);

    return {
      success: true,
      data: { id: promotion.id },
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error creating promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create promotion",
    };
  }
}

// ========================================
// ✏️ UPDATE PROMOTION
// ========================================

export async function updatePromotionAction(
  promotionId: string,
  data: Partial<PromotionFormData>
): Promise<ApiResponse<void>> {
  try {
    console.log("🎁 [SELLER PORTAL] Updating promotion:", promotionId);

    // Validate promotion exists
    const existing = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Promoción no encontrada",
      };
    }

    // Build update data
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.appliesTo !== undefined) updateData.appliesTo = data.appliesTo;
    if (data.startAt !== undefined) updateData.startAt = data.startAt;
    if (data.endAt !== undefined) updateData.endAt = data.endAt || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.maxUsesTotal !== undefined) updateData.maxUsesTotal = data.maxUsesTotal || null;
    if (data.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = data.maxUsesPerUser || null;
    if (data.minPurchaseAmount !== undefined) updateData.minPurchaseAmount = data.minPurchaseAmount || null;
    if (data.minQuantity !== undefined) updateData.minQuantity = data.minQuantity || null;
    if (data.availableChannels !== undefined) updateData.availableChannels = data.availableChannels as any;
    if (data.targetProductIds !== undefined) updateData.targetProductIds = data.targetProductIds;
    if (data.targetCategoryIds !== undefined) updateData.targetCategoryIds = data.targetCategoryIds;
    if (data.isPriority !== undefined) updateData.isPriority = data.isPriority;

    await prisma.promotion.update({
      where: { id: promotionId },
      data: updateData,
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Promotion updated successfully");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error updating promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update promotion",
    };
  }
}

// ========================================
// 🗑️ DELETE PROMOTION
// ========================================

export async function deletePromotionAction(
  promotionId: string
): Promise<ApiResponse<void>> {
  try {
    console.log("🎁 [SELLER PORTAL] Deleting promotion:", promotionId);

    // Check if promotion exists
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return {
        success: false,
        error: "Promoción no encontrada",
      };
    }

    // Soft delete - just deactivate instead of hard delete
    // This preserves historical data and analytics
    await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        isActive: false,
        endAt: new Date(), // Set end date to now
      },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Promotion deleted successfully");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error deleting promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete promotion",
    };
  }
}

// ========================================
// 🔄 TOGGLE PROMOTION ACTIVE STATUS
// ========================================

export async function togglePromotionActiveAction(
  promotionId: string,
  isActive: boolean
): Promise<ApiResponse<void>> {
  try {
    console.log("🎁 [SELLER PORTAL] Toggling promotion active:", promotionId, isActive);

    await prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Promotion active status toggled");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error toggling promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle promotion",
    };
  }
}

// ========================================
// 📋 DUPLICATE PROMOTION
// ========================================

export async function duplicatePromotionAction(
  promotionId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    console.log("🎁 [SELLER PORTAL] Duplicating promotion:", promotionId);

    // Get original promotion
    const original = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!original) {
      return {
        success: false,
        error: "Promoción no encontrada",
      };
    }

    // Create duplicate with modified name
    const duplicate = await prisma.promotion.create({
      data: {
        name: `${original.name} (Copia)`,
        description: original.description,
        type: original.type,
        discountType: original.discountType,
        discountValue: original.discountValue,
        appliesTo: original.appliesTo,
        startAt: new Date(), // Start from now
        endAt: original.endAt,
        isActive: false, // Start as inactive
        maxUsesTotal: original.maxUsesTotal,
        maxUsesPerUser: original.maxUsesPerUser,
        minPurchaseAmount: original.minPurchaseAmount,
        minQuantity: original.minQuantity,
        availableChannels: original.availableChannels as any,
        targetProductIds: original.targetProductIds,
        targetCategoryIds: original.targetCategoryIds,
        isPriority: original.isPriority,
        usageCount: 0,
      },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Promotion duplicated successfully:", duplicate.id);

    return {
      success: true,
      data: { id: duplicate.id },
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error duplicating promotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to duplicate promotion",
    };
  }
}

// ========================================
// 📊 QUERY ACTIONS (Replaces API Routes)
// ========================================

/**
 * Get paginated promotions with filters
 * Replaces: GET /api/seller-portal/promotions
 */
export async function getPromotionsAction(
  filters: PromotionFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<PromotionListItem>> {
  return await getPromotionsQuery(filters, page, pageSize);
}

/**
 * Get single promotion details
 * Replaces: GET /api/seller-portal/promotions/[id]
 */
export async function getPromotionDetailsAction(
  promotionId: string
): Promise<PromotionDetails | null> {
  return await getPromotionDetailsQuery(promotionId);
}

/**
 * Get active promotions count
 * Replaces: GET /api/seller-portal/promotions/active-count
 */
export async function getActivePromotionsCountAction(): Promise<number> {
  return await getActivePromotionsCountQuery();
}

/**
 * Get promotions statistics
 * Replaces: GET /api/seller-portal/promotions/stats
 */
export async function getPromotionsStatsAction() {
  return await getPromotionsStatsQuery();
}
