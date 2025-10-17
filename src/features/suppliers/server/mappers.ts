/**
 * 🚛 SUPPLIER MAPPERS
 * ===================
 *
 * Data transformation layer - converts Prisma types to domain types
 * Handles Decimal to number conversion for client compatibility
 *
 * Created: 2025-01-17 - Supplier shared module
 */

import type { Supplier } from "@/shared/types/supplier";
import type { Supplier as PrismaSupplier } from "@prisma/client";

/**
 * Convert Prisma Decimal to nullable number
 */
function convertDecimalToNullableNumber(
  decimal: unknown
): number | null {
  if (decimal === null || decimal === undefined) return null;
  return Number(decimal);
}

/**
 * Map Prisma Supplier to domain Supplier (plain object for client)
 */
export function mapSupplierToPlain(
  prismaSupplier: PrismaSupplier
): Supplier {
  return {
    id: prismaSupplier.id,
    name: prismaSupplier.name,
    contactPerson: prismaSupplier.contactPerson,
    email: prismaSupplier.email,
    phone: prismaSupplier.phone,
    website: prismaSupplier.website,
    taxId: prismaSupplier.taxId,
    paymentTerms: Number(prismaSupplier.paymentTerms),
    isActive: prismaSupplier.isActive,
    rating: convertDecimalToNullableNumber(prismaSupplier.rating), // Convert Decimal to number
    notes: prismaSupplier.notes,
    addressLine1: prismaSupplier.addressLine1,
    addressLine2: prismaSupplier.addressLine2,
    city: prismaSupplier.city,
    state: prismaSupplier.state,
    postalCode: prismaSupplier.postalCode,
    country: prismaSupplier.country,
    createdAt: prismaSupplier.createdAt,
    updatedAt: prismaSupplier.updatedAt,
  };
}

/**
 * Map array of Prisma Suppliers to plain objects
 */
export function mapSuppliersToPlain(
  prismaSuppliers: PrismaSupplier[]
): Supplier[] {
  return prismaSuppliers.map(mapSupplierToPlain);
}
