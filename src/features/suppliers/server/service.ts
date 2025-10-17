/**
 * 🚛 SUPPLIER SERVICE
 * ===================
 *
 * Domain Service Layer - Business Logic for Supplier Management
 * SHARED across multiple features: inventory, pos, services, etc.
 *
 * Created: 2025-01-17 - Refactored from inventory service
 */

import { requireAuth } from "@/core/auth/server";
import {
  validateInventoryPermissions,
  sessionToPermissionUser,
} from "@/features/inventory/server/validators";
import {
  createSupplierQuery,
  updateSupplierQuery,
  deleteSupplierQuery,
  getSuppliersQuery,
  getSupplierByIdQuery,
  getSupplierWithProductsQuery,
} from "./queries";
import {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateSupplierFilters,
} from "./validators";
import type {
  Supplier,
  SupplierWithRelations,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
  SupplierActionResult,
} from "@/shared/types/supplier";

// 🚛 SUPPLIER SERVICE
export class SupplierService {
  /**
   * Create a new supplier
   * @requires CREATE_SUPPLIER permission
   */
  static async create(
    input: CreateSupplierInput,
    userId: string
  ): Promise<SupplierActionResult<SupplierWithRelations<unknown>>> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "CREATE_SUPPLIER");

      const validatedInput = validateCreateSupplier(input);

      // Business Logic - Name uniqueness
      const existing = await getSuppliersQuery({ search: validatedInput.name });
      if (
        existing.some(
          (s) => s.name.toLowerCase() === validatedInput.name.toLowerCase()
        )
      ) {
        return { success: false, error: "Supplier name already exists" };
      }

      // Email uniqueness if provided
      if (validatedInput.email) {
        const existingEmail = await getSuppliersQuery({
          search: validatedInput.email,
        });
        if (existingEmail.some((s) => s.email === validatedInput.email)) {
          return { success: false, error: "Supplier email already exists" };
        }
      }

      const supplier = await createSupplierQuery(validatedInput);

      await this.logSupplierAction("CREATED", supplier.id, userId);

      return {
        success: true,
        data: supplier as SupplierWithRelations<unknown>,
      };
    } catch (error) {
      return this.handleError(error, "Error creating supplier");
    }
  }

  /**
   * Get all suppliers with optional filters
   * ⚡ ULTRA-FAST READ - No auth needed for public suppliers
   */
  static async getMany(
    filters?: SupplierFilters
  ): Promise<SupplierActionResult<SupplierWithRelations<unknown>[]>> {
    try {
      const validatedFilters = filters ? validateSupplierFilters(filters) : {};
      const suppliers = await getSuppliersQuery(validatedFilters);

      return {
        success: true,
        data: suppliers.map(
          (supplier) =>
            ({
              ...supplier,
              products: undefined, // Omit for performance
            }) as SupplierWithRelations<unknown>
        ),
      };
    } catch (error) {
      return this.handleError(error, "Error fetching suppliers");
    }
  }

  /**
   * Get supplier by ID
   */
  static async getById(
    id: string
  ): Promise<SupplierActionResult<SupplierWithRelations<unknown>>> {
    try {
      const supplier = await getSupplierByIdQuery(id);
      if (!supplier) {
        return { success: false, error: "Supplier not found" };
      }

      return {
        success: true,
        data: supplier as SupplierWithRelations<unknown>,
      };
    } catch (error) {
      return this.handleError(error, "Error fetching supplier");
    }
  }

  /**
   * Update supplier
   * @requires UPDATE_SUPPLIER permission
   */
  static async update(
    id: string,
    input: UpdateSupplierInput,
    userId: string
  ): Promise<SupplierActionResult<SupplierWithRelations<unknown>>> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "UPDATE_SUPPLIER");

      const validatedInput = validateUpdateSupplier({ ...input, id });

      // Business Logic - Name uniqueness (except for current supplier)
      if (validatedInput.name) {
        const existing = await getSuppliersQuery({
          search: validatedInput.name,
        });
        const duplicateSupplier = existing.find(
          (s) =>
            s.name.toLowerCase() === validatedInput.name!.toLowerCase() &&
            s.id !== id
        );
        if (duplicateSupplier) {
          return { success: false, error: "Supplier name already exists" };
        }
      }

      // Email uniqueness if provided (except for current supplier)
      if (validatedInput.email) {
        const existingEmail = await getSuppliersQuery({
          search: validatedInput.email,
        });
        const duplicateEmail = existingEmail.find(
          (s) => s.email === validatedInput.email && s.id !== id
        );
        if (duplicateEmail) {
          return { success: false, error: "Supplier email already exists" };
        }
      }

      const supplier = await updateSupplierQuery(validatedInput);

      await this.logSupplierAction("UPDATED", supplier.id, userId);

      return {
        success: true,
        data: supplier as SupplierWithRelations<unknown>,
      };
    } catch (error) {
      return this.handleError(error, "Error updating supplier");
    }
  }

  /**
   * Delete supplier (soft delete)
   * @requires DELETE_SUPPLIER permission
   */
  static async delete(
    id: string,
    userId: string
  ): Promise<SupplierActionResult<void>> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateInventoryPermissions(user, "DELETE_SUPPLIER");

      // Business Logic - Check if supplier has products
      const supplierWithProducts = await getSupplierWithProductsQuery(id);
      if (!supplierWithProducts) {
        return { success: false, error: "Supplier not found" };
      }

      if (
        supplierWithProducts._count &&
        supplierWithProducts._count.products > 0
      ) {
        return {
          success: false,
          error: "Cannot delete supplier that has products",
        };
      }

      await deleteSupplierQuery(id);

      await this.logSupplierAction("DELETED", id, userId);

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return this.handleError(error, "Error deleting supplier");
    }
  }

  // 🔒 Private helper methods
  private static async logSupplierAction(
    action: string,
    supplierId: string,
    userId: string
  ): Promise<void> {
    console.log(`[AUDIT] ${action} supplier ${supplierId} by user ${userId}`);
  }

  private static handleError<T = unknown>(
    error: unknown,
    defaultMessage: string
  ): SupplierActionResult<T> {
    console.error(`[SUPPLIER_SERVICE] ${defaultMessage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage || defaultMessage };
  }
}

export default SupplierService;
