/**
 * 📍 ADDRESS ACTIONS
 * ==================
 *
 * Server actions for address mutations
 *
 * @version 1.0.0 - Address Feature
 */

"use server";

import { prisma } from "@/core/database/prisma";
import { getServerSession } from "@/core/auth/server";
import {
  createAddressSchema,
  updateAddressSchema,
  deleteAddressSchema,
  setDefaultAddressSchema,
} from "../schemas";
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
  DeleteAddressInput,
  SetDefaultAddressInput,
} from "../types";

/**
 * Create a new address for the user
 */
export async function createAddressAction(
  input: CreateAddressInput
): Promise<{ success: boolean; address?: Address; error?: string }> {
  try {
    // Validate session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Validate input
    const validated = createAddressSchema.parse(input);

    // If this is set as default, unset other defaults
    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create the address
    const address = await prisma.address.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      address: formatAddress(address),
    };
  } catch (error) {
    console.error("[createAddressAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear dirección",
    };
  }
}

/**
 * Update an existing address
 */
export async function updateAddressAction(
  input: UpdateAddressInput
): Promise<{ success: boolean; address?: Address; error?: string }> {
  try {
    // Validate session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Validate input
    const validated = updateAddressSchema.parse(input);

    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: validated.addressId,
        userId: session.user.id,
      },
    });

    if (!existingAddress) {
      return { success: false, error: "Dirección no encontrada" };
    }

    // If this is set as default, unset other defaults
    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Update the address
    const { addressId, ...updateData } = validated;
    const address = await prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });

    return {
      success: true,
      address: formatAddress(address),
    };
  } catch (error) {
    console.error("[updateAddressAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar dirección",
    };
  }
}

/**
 * Delete an address
 */
export async function deleteAddressAction(
  input: DeleteAddressInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Validate input
    const validated = deleteAddressSchema.parse(input);

    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: validated.addressId,
        userId: session.user.id,
      },
    });

    if (!existingAddress) {
      return { success: false, error: "Dirección no encontrada" };
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: validated.addressId },
    });

    // If this was the default address, set another as default
    if (existingAddress.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteAddressAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar dirección",
    };
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddressAction(
  input: SetDefaultAddressInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Validate input
    const validated = setDefaultAddressSchema.parse(input);

    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: validated.addressId,
        userId: session.user.id,
      },
    });

    if (!existingAddress) {
      return { success: false, error: "Dirección no encontrada" };
    }

    // Unset other defaults
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set this as default
    await prisma.address.update({
      where: { id: validated.addressId },
      data: { isDefault: true },
    });

    return { success: true };
  } catch (error) {
    console.error("[setDefaultAddressAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al establecer dirección por defecto",
    };
  }
}

/**
 * Get all addresses for the authenticated user
 */
export async function getUserAddressesAction(): Promise<{
  success: boolean;
  addresses?: Address[];
  defaultAddress?: Address | null;
  error?: string;
}> {
  try {
    // Validate session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Fetch addresses
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    const defaultAddress = addresses.find((addr) => addr.isDefault) || null;

    return {
      success: true,
      addresses: addresses.map(formatAddress),
      defaultAddress: defaultAddress ? formatAddress(defaultAddress) : null,
    };
  } catch (error) {
    console.error("[getUserAddressesAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener direcciones",
    };
  }
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
