/**
 * 📍 ADDRESS QUERIES
 * ==================
 *
 * Database queries for address data retrieval
 *
 * @version 1.0.0 - Address Feature
 */

import { prisma } from "@/core/database/prisma";
import type { Address } from "../types";

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(
  userId: string
): Promise<{ addresses: Address[]; defaultAddress: Address | null }> {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const defaultAddress = addresses.find((addr) => addr.isDefault) || null;

  return {
    addresses: addresses.map(formatAddress),
    defaultAddress: defaultAddress ? formatAddress(defaultAddress) : null,
  };
}

/**
 * Get a specific address by ID
 */
export async function getAddressById(
  addressId: string,
  userId: string
): Promise<Address | null> {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  return address ? formatAddress(address) : null;
}

/**
 * Get the default address for a user
 */
export async function getDefaultAddress(
  userId: string
): Promise<Address | null> {
  const address = await prisma.address.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });

  return address ? formatAddress(address) : null;
}

/**
 * Format address from Prisma to our type
 */
function formatAddress(address: any): Address {
  return {
    id: address.id,
    userId: address.userId,
    type: address.type as "SHIPPING" | "BILLING" | "BOTH",
    label: address.label,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    street: address.street,
    street2: address.street2,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
    isVerified: address.isVerified,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}
