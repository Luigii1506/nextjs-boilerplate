/**
 * 🚛 USE SUPPLIER MUTATIONS HOOKS
 * ==============================
 *
 * Hooks personalizados para CRUD de proveedores con TanStack Query
 * SHARED module - can be used by inventory, pos, services, etc.
 *
 * Created: 2025-01-17 - Refactored from inventory to shared module
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
} from "../actions";
import { SUPPLIER_QUERY_KEYS } from "../constants";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierWithRelations,
} from "@/shared/types/supplier";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Hook options
interface UseSupplierMutationOptions {
  onSuccess?: (supplier?: SupplierWithRelations<unknown>) => void;
  onError?: (error: string) => void;
  optimisticUpdate?: boolean;
}

// 🎯 Hook return types
interface UseCreateSupplierReturn {
  createSupplier: (data: CreateSupplierInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseUpdateSupplierReturn {
  updateSupplier: (id: string, data: UpdateSupplierInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseDeleteSupplierReturn {
  deleteSupplier: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

// 🚀 Create Supplier Hook
export function useCreateSupplier(
  options: UseSupplierMutationOptions = {}
): UseCreateSupplierReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError, optimisticUpdate = true } = options;

  const mutation = useMutation({
    mutationFn: async (data: CreateSupplierInput) => {
      const result = await createSupplierAction(data);

      if (!result.success) {
        throw new Error(result.error || "Error al crear proveedor");
      }

      return result.data;
    },

    // 🎯 Optimistic Update (Optional)
    onMutate: optimisticUpdate
      ? async (newSupplier: CreateSupplierInput) => {
          await queryClient.cancelQueries({
            queryKey: SUPPLIER_QUERY_KEYS.ALL,
          });

          const previousSuppliers = queryClient.getQueryData(
            SUPPLIER_QUERY_KEYS.ALL
          );

          if (previousSuppliers) {
            const optimisticSupplier: SupplierWithRelations<unknown> = {
              id: `optimistic-${Date.now()}`,
              ...newSupplier,
              contactPerson: newSupplier.contactPerson || null,
              email: newSupplier.email || null,
              phone: newSupplier.phone || null,
              website: newSupplier.website || null,
              taxId: newSupplier.taxId || null,
              paymentTerms: newSupplier.paymentTerms || 30,
              rating: newSupplier.rating || null,
              notes: newSupplier.notes || null,
              addressLine1: newSupplier.addressLine1 || null,
              addressLine2: newSupplier.addressLine2 || null,
              city: newSupplier.city || null,
              state: newSupplier.state || null,
              postalCode: newSupplier.postalCode || null,
              country: newSupplier.country || "MX",
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              _count: { products: 0 },
            };

            queryClient.setQueryData(SUPPLIER_QUERY_KEYS.ALL, (old: any) => [
              ...(old || []),
              optimisticSupplier,
            ]);
          }

          return { previousSuppliers };
        }
      : undefined,

    // 🎯 Success Handler
    onSuccess: (supplier) => {
      // 🔄 Invalidate all supplier queries
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_QUERY_KEYS.ALL,
      });

      // 📢 Success notification
      if (supplier) {
        success(`"${supplier.name}" fue creado exitosamente.`, {
          duration: 5000,
        });
        onSuccess?.(supplier as SupplierWithRelations<unknown>);
      } else {
        success("Proveedor fue creado exitosamente.", {
          duration: 5000,
        });
      }
    },

    // 🚨 Error Handler
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousSuppliers) {
        queryClient.setQueryData(
          SUPPLIER_QUERY_KEYS.ALL,
          context.previousSuppliers
        );
      }

      const errorMessage = error.message || "Error al crear proveedor";
      notifyError(errorMessage, { duration: 8000 });
      onError?.(errorMessage);
    },
  });

  return {
    createSupplier: async (data: CreateSupplierInput) => {
      await mutation.mutateAsync(data);
    },
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

// 🔄 Update Supplier Hook
export function useUpdateSupplier(
  options: UseSupplierMutationOptions = {}
): UseUpdateSupplierReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError } = options;

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSupplierInput;
    }) => {
      const result = await updateSupplierAction(id, data);

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar proveedor");
      }

      return result.data;
    },

    onSuccess: (supplier) => {
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_QUERY_KEYS.ALL,
      });

      if (supplier) {
        success(`"${supplier.name}" fue actualizado exitosamente.`, {
          duration: 5000,
        });
        onSuccess?.(supplier as SupplierWithRelations<unknown>);
      } else {
        success("Proveedor fue actualizado exitosamente.", {
          duration: 5000,
        });
      }
    },

    onError: (error: Error) => {
      const errorMessage = error.message || "Error al actualizar proveedor";
      notifyError(errorMessage, { duration: 8000 });
      onError?.(errorMessage);
    },
  });

  return {
    updateSupplier: async (id: string, data: UpdateSupplierInput) => {
      await mutation.mutateAsync({ id, data });
    },
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

// 🗑️ Delete Supplier Hook
export function useDeleteSupplier(
  options: UseSupplierMutationOptions = {}
): UseDeleteSupplierReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError } = options;

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSupplierAction(id);

      if (!result.success) {
        throw new Error(result.error || "Error al eliminar proveedor");
      }

      return result.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_QUERY_KEYS.ALL,
      });

      success("Proveedor eliminado exitosamente.", { duration: 5000 });
      onSuccess?.();
    },

    onError: (error: Error) => {
      const errorMessage = error.message || "Error al eliminar proveedor";
      notifyError(errorMessage, { duration: 8000 });
      onError?.(errorMessage);
    },
  });

  return {
    deleteSupplier: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

// 🎯 Convenience Exports
export function useCreateSupplierWithNotifications() {
  return useCreateSupplier({ optimisticUpdate: true });
}

export function useUpdateSupplierWithNotifications() {
  return useUpdateSupplier();
}

export function useDeleteSupplierWithNotifications() {
  return useDeleteSupplier();
}
