/**
 * 🚛 SUPPLIER QUERIES
 * ===================
 *
 * Database queries for Supplier entity
 * Clean separation: queries layer (thin) - service layer (thick)
 *
 * Created: 2025-01-17 - Refactored from inventory
 */

import { prisma } from "@/core/database/prisma";
import { mapSupplierToPlain, mapSuppliersToPlain } from "./mappers";
import type {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
} from "@/shared/types/supplier";

/**
 * Create a new supplier
 */
export async function createSupplierQuery(
  data: CreateSupplierInput
): Promise<Supplier> {
  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      website: data.website,
      taxId: data.taxId,
      paymentTerms: data.paymentTerms ?? 30,
      rating: data.rating,
      notes: data.notes,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country ?? "MX",
    },
  });

  return mapSupplierToPlain(supplier);
}

/**
 * Update an existing supplier
 */
export async function updateSupplierQuery(
  data: UpdateSupplierInput
): Promise<Supplier> {
  const { id, ...updateData } = data;

  const supplier = await prisma.supplier.update({
    where: { id },
    data: updateData,
  });

  return mapSupplierToPlain(supplier);
}

/**
 * Delete a supplier (soft delete - set isActive to false)
 */
export async function deleteSupplierQuery(id: string): Promise<Supplier> {
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { isActive: false },
  });

  return mapSupplierToPlain(supplier);
}

/**
 * Get suppliers with optional filters
 */
export async function getSuppliersQuery(
  filters?: SupplierFilters
): Promise<
  Array<
    Supplier & {
      _count: {
        products: number;
      };
    }
  >
> {
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { contactPerson: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters?.minRating) {
    where.rating = { gte: filters.minRating };
  }

  if (filters?.country) {
    where.country = filters.country;
  }

  if (filters?.hasEmail !== undefined) {
    where.email = filters.hasEmail ? { not: null } : null;
  }

  if (filters?.hasPhone !== undefined) {
    where.phone = filters.hasPhone ? { not: null } : null;
  }

  if (filters?.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }

  if (filters?.state) {
    where.state = { contains: filters.state, mode: "insensitive" };
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Map to plain objects with Decimal converted
  return suppliers.map((supplier) => ({
    ...mapSupplierToPlain(supplier),
    _count: supplier._count,
  }));
}

/**
 * Get supplier by ID
 */
export async function getSupplierByIdQuery(
  id: string
): Promise<Supplier | null> {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) return null;

  return mapSupplierToPlain(supplier);
}

/**
 * Get supplier with products count
 */
export async function getSupplierWithProductsQuery(id: string): Promise<
  | (Supplier & {
      _count: {
        products: number;
      };
    })
  | null
> {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!supplier) return null;

  return {
    ...mapSupplierToPlain(supplier),
    _count: supplier._count,
  };
}

/**
 * Validate that a supplier exists and is active
 */
export async function validateSupplierExists(id: string): Promise<boolean> {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });

  return supplier !== null && supplier.isActive;
}
