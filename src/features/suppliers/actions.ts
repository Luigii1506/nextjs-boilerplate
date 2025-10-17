/**
 * 🚛 SUPPLIER SERVER ACTIONS
 * ==========================
 *
 * Server Actions para operaciones con proveedores
 * SHARED module - can be used by inventory, pos, services, etc.
 *
 * Created: 2025-01-17 - Refactored from inventory to shared module
 */

"use server";

import { requireAuth } from "@/core/auth/server";
import { SupplierService } from "./server/service";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
  SupplierWithRelations,
  SupplierActionResult,
} from "@/shared/types/supplier";

/**
 * Create a new supplier
 */
export async function createSupplierAction(
  data: CreateSupplierInput
): Promise<SupplierActionResult<SupplierWithRelations<unknown>>> {
  try {
    const session = await requireAuth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    return await SupplierService.create(data, session.user.id);
  } catch (error) {
    console.error("[createSupplierAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all suppliers with optional filters
 */
export async function getSuppliersAction(
  filters?: SupplierFilters
): Promise<SupplierActionResult<SupplierWithRelations<unknown>[]>> {
  try {
    return await SupplierService.getMany(filters);
  } catch (error) {
    console.error("[getSuppliersAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get supplier by ID
 */
export async function getSupplierByIdAction(
  id: string
): Promise<SupplierActionResult<SupplierWithRelations<unknown>>> {
  try {
    return await SupplierService.getById(id);
  } catch (error) {
    console.error("[getSupplierByIdAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update supplier
 */
export async function updateSupplierAction(
  id: string,
  data: UpdateSupplierInput
): Promise<SupplierActionResult<SupplierWithRelations<unknown>>> {
  try {
    const session = await requireAuth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    return await SupplierService.update(id, data, session.user.id);
  } catch (error) {
    console.error("[updateSupplierAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete supplier
 */
export async function deleteSupplierAction(
  id: string
): Promise<SupplierActionResult<void>> {
  try {
    const session = await requireAuth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    return await SupplierService.delete(id, session.user.id);
  } catch (error) {
    console.error("[deleteSupplierAction]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
