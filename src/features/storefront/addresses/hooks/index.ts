/**
 * 📍 ADDRESS HOOKS
 * ================
 *
 * TanStack Query hooks for address data management
 *
 * @version 1.0.0 - Address Feature
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  getUserAddressesAction,
} from "../server";
import type {
  CreateAddressInput,
  UpdateAddressInput,
  DeleteAddressInput,
  SetDefaultAddressInput,
  Address,
} from "../types";

// 🔑 Query Keys
export const addressKeys = {
  all: ["addresses"] as const,
  lists: () => [...addressKeys.all, "list"] as const,
  list: (userId: string) => [...addressKeys.lists(), userId] as const,
  details: () => [...addressKeys.all, "detail"] as const,
  detail: (id: string) => [...addressKeys.details(), id] as const,
};

/**
 * Hook to fetch user addresses
 */
export function useAddresses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: addressKeys.list(user?.id || ""),
    queryFn: async () => {
      const result = await getUserAddressesAction();
      if (!result.success) {
        throw new Error(result.error || "Error al obtener direcciones");
      }
      return {
        addresses: result.addresses || [],
        defaultAddress: result.defaultAddress || null,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new address
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAddressInput) => {
      const result = await createAddressAction(input);
      if (!result.success) {
        throw new Error(result.error || "Error al crear dirección");
      }
      return result.address!;
    },
    onSuccess: () => {
      // Invalidate addresses list
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: addressKeys.list(user.id),
        });
      }
    },
  });
}

/**
 * Hook to update an existing address
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateAddressInput) => {
      const result = await updateAddressAction(input);
      if (!result.success) {
        throw new Error(result.error || "Error al actualizar dirección");
      }
      return result.address!;
    },
    onSuccess: (_, variables) => {
      // Invalidate addresses list and specific address
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: addressKeys.list(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: addressKeys.detail(variables.addressId),
        });
      }
    },
  });
}

/**
 * Hook to delete an address
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: DeleteAddressInput) => {
      const result = await deleteAddressAction(input);
      if (!result.success) {
        throw new Error(result.error || "Error al eliminar dirección");
      }
    },
    onSuccess: () => {
      // Invalidate addresses list
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: addressKeys.list(user.id),
        });
      }
    },
  });
}

/**
 * Hook to set an address as default
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: SetDefaultAddressInput) => {
      const result = await setDefaultAddressAction(input);
      if (!result.success) {
        throw new Error(
          result.error || "Error al establecer dirección por defecto"
        );
      }
    },
    onSuccess: () => {
      // Invalidate addresses list
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: addressKeys.list(user.id),
        });
      }
    },
  });
}
