/**
 * 🎟️ COUPONS ACTIONS - Seller Portal
 * ====================================
 *
 * Server actions for coupons management
 * Complete CRUD operations and code validation
 *
 * Created: 2025-01-17
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/core/database/prisma";
import type { ApiResponse, PaginatedResponse, CouponFormData } from "../../types";
import {
  getCouponsQuery,
  getCouponDetailsQuery,
  getActiveCouponsCountQuery,
  getCouponsStatsQuery,
  isCouponCodeAvailableQuery,
  type CouponListItem,
  type CouponDetails,
  type CouponFilters,
} from "../queries/coupons.queries";

// ========================================
// 📝 CREATE COUPON
// ========================================

export async function createCouponAction(
  data: CouponFormData
): Promise<ApiResponse<{ id: string }>> {
  try {
    console.log("🎟️ [SELLER PORTAL] Creating coupon:", data.code);

    // Validate code is uppercase and alphanumeric
    const code = data.code.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (code.length < 3) {
      return {
        success: false,
        error: "El código debe tener al menos 3 caracteres alfanuméricos",
      };
    }

    // Check if code is available
    const isAvailable = await isCouponCodeAvailableQuery(code);
    if (!isAvailable) {
      return {
        success: false,
        error: `El código "${code}" ya está en uso`,
      };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        name: data.name,
        description: data.description || null,
        type: data.type,
        discountType: data.discountType,
        discountValue: data.discountValue,
        appliesTo: data.appliesTo,
        startAt: data.startAt || null,
        endAt: data.endAt || null,
        isActive: data.isActive ?? true,
        maxUsesTotal: data.maxUsesTotal || null,
        maxUsesPerUser: data.maxUsesPerUser ?? 1,
        minPurchaseAmount: data.minPurchaseAmount || null,
        maxDiscountAmount: data.maxDiscountAmount || null,
        availableChannels: data.availableChannels as any || [],
        targetProductIds: data.targetProductIds || [],
        targetCategoryIds: data.targetCategoryIds || [],
        usageCount: 0,
      },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Coupon created successfully:", coupon.id);

    return {
      success: true,
      data: { id: coupon.id },
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error creating coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create coupon",
    };
  }
}

// ========================================
// ✏️ UPDATE COUPON
// ========================================

export async function updateCouponAction(
  couponId: string,
  data: Partial<CouponFormData>
): Promise<ApiResponse<void>> {
  try {
    console.log("🎟️ [SELLER PORTAL] Updating coupon:", couponId);

    // Validate coupon exists
    const existing = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Cupón no encontrado",
      };
    }

    // If code is being updated, validate it
    if (data.code) {
      const code = data.code.toUpperCase().replace(/[^A-Z0-9]/g, "");

      if (code.length < 3) {
        return {
          success: false,
          error: "El código debe tener al menos 3 caracteres alfanuméricos",
        };
      }

      const isAvailable = await isCouponCodeAvailableQuery(code, couponId);
      if (!isAvailable) {
        return {
          success: false,
          error: `El código "${code}" ya está en uso`,
        };
      }

      data.code = code;
    }

    // Build update data
    const updateData: any = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.appliesTo !== undefined) updateData.appliesTo = data.appliesTo;
    if (data.startAt !== undefined) updateData.startAt = data.startAt || null;
    if (data.endAt !== undefined) updateData.endAt = data.endAt || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.maxUsesTotal !== undefined) updateData.maxUsesTotal = data.maxUsesTotal || null;
    if (data.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = data.maxUsesPerUser;
    if (data.minPurchaseAmount !== undefined) updateData.minPurchaseAmount = data.minPurchaseAmount || null;
    if (data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = data.maxDiscountAmount || null;
    if (data.availableChannels !== undefined) updateData.availableChannels = data.availableChannels as any;
    if (data.targetProductIds !== undefined) updateData.targetProductIds = data.targetProductIds;
    if (data.targetCategoryIds !== undefined) updateData.targetCategoryIds = data.targetCategoryIds;

    await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Coupon updated successfully");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error updating coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update coupon",
    };
  }
}

// ========================================
// 🗑️ DELETE COUPON
// ========================================

export async function deleteCouponAction(
  couponId: string
): Promise<ApiResponse<void>> {
  try {
    console.log("🎟️ [SELLER PORTAL] Deleting coupon:", couponId);

    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return {
        success: false,
        error: "Cupón no encontrado",
      };
    }

    // Soft delete - just deactivate
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        isActive: false,
        endAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Coupon deleted successfully");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error deleting coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete coupon",
    };
  }
}

// ========================================
// 🔄 TOGGLE COUPON ACTIVE STATUS
// ========================================

export async function toggleCouponActiveAction(
  couponId: string,
  isActive: boolean
): Promise<ApiResponse<void>> {
  try {
    console.log("🎟️ [SELLER PORTAL] Toggling coupon active:", couponId, isActive);

    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Coupon active status toggled");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error toggling coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle coupon",
    };
  }
}

// ========================================
// 📋 DUPLICATE COUPON
// ========================================

export async function duplicateCouponAction(
  couponId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    console.log("🎟️ [SELLER PORTAL] Duplicating coupon:", couponId);

    // Get original coupon
    const original = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!original) {
      return {
        success: false,
        error: "Cupón no encontrado",
      };
    }

    // Generate unique code
    let newCode = `${original.code}_COPY`;
    let counter = 1;
    while (!(await isCouponCodeAvailableQuery(newCode))) {
      newCode = `${original.code}_COPY${counter}`;
      counter++;
    }

    // Create duplicate
    const duplicate = await prisma.coupon.create({
      data: {
        code: newCode,
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
        maxDiscountAmount: original.maxDiscountAmount,
        availableChannels: original.availableChannels as any,
        targetProductIds: original.targetProductIds,
        targetCategoryIds: original.targetCategoryIds,
        usageCount: 0,
      },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");

    console.log("✅ [SELLER PORTAL] Coupon duplicated successfully:", duplicate.id);

    return {
      success: true,
      data: { id: duplicate.id },
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error duplicating coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to duplicate coupon",
    };
  }
}

// ========================================
// ✅ VALIDATE COUPON CODE
// ========================================

export async function validateCouponCodeAction(
  code: string,
  excludeCouponId?: string
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const available = await isCouponCodeAvailableQuery(cleanCode, excludeCouponId);

    return {
      success: true,
      data: { available },
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error validating coupon code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to validate coupon code",
    };
  }
}

// ========================================
// 📊 QUERY ACTIONS (Replaces API Routes)
// ========================================

/**
 * Get paginated coupons with filters
 */
export async function getCouponsAction(
  filters: CouponFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CouponListItem>> {
  return await getCouponsQuery(filters, page, pageSize);
}

/**
 * Get single coupon details
 */
export async function getCouponDetailsAction(
  couponId: string
): Promise<CouponDetails | null> {
  return await getCouponDetailsQuery(couponId);
}

/**
 * Get active coupons count
 */
export async function getActiveCouponsCountAction(): Promise<number> {
  return await getActiveCouponsCountQuery();
}

/**
 * Get coupons statistics
 */
export async function getCouponsStatsAction() {
  return await getCouponsStatsQuery();
}
