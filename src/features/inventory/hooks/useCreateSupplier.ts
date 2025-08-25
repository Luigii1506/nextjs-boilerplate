/**
 * 🚛 USE SUPPLIER MUTATIONS HOOKS
 * ==============================
 *
 * Hooks personalizados para CRUD de proveedores con TanStack Query
 * Incluye optimistic updates, cache invalidation y notificaciones
 *
 * Created: 2025-01-18 - Supplier Management Hooks
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
} from "../actions";
import { INVENTORY_QUERY_KEYS } from "./useInventoryQuery";
import type { CreateSupplierInput, SupplierWithRelations } from "../types";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Hook options
interface UseSupplierMutationOptions {
  onSuccess?: (supplier?: SupplierWithRelations) => void;
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
  updateSupplier: (
    id: string,
    data: CreateSupplierInput & { isActive?: boolean }
  ) => Promise<void>;
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

  // 🚀 Create Supplier Mutation
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
          // Cancel any outgoing refetches
          await queryClient.cancelQueries({
            queryKey: INVENTORY_QUERY_KEYS.suppliers(),
          });

          // Snapshot the previous value
          const previousSuppliers = queryClient.getQueryData(
            INVENTORY_QUERY_KEYS.suppliers()
          );

          // Optimistically update to the new value
          if (previousSuppliers) {
            const optimisticSupplier: SupplierWithRelations = {
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
              products: [],
              _count: { products: 0 },
            };

            queryClient.setQueryData(
              INVENTORY_QUERY_KEYS.suppliers(),
              (old: unknown) => {
                const oldData = old as {
                  data?: { suppliers?: SupplierWithRelations[] };
                };
                return {
                  ...oldData,
                  data: {
                    ...oldData?.data,
                    suppliers: [
                      ...(oldData?.data?.suppliers || []),
                      optimisticSupplier,
                    ],
                  },
                };
              }
            );
          }

          // Return a context with the previous and new data
          return { previousSuppliers };
        }
      : undefined,

    // 🎯 Success Handler
    onSuccess: (supplier) => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.suppliers(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.stats(),
      });
      // ✅ Invalidate ALL supplier list variations
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key[0] === "inventory" &&
            key[1] === "suppliers"
          );
        },
      });
      // ✅ Invalidate products since they depend on suppliers
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.products(),
      });
      // ✅ Invalidate the root inventory cache
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.all,
      });

      // 📢 Success notification
      success(`"${supplier.name}" fue creado exitosamente.`, {
        title: "¡Proveedor creado!",
        duration: 5000,
      });

      // 🎯 Custom success handler
      onSuccess?.(supplier);
    },

    // 🚨 Error Handler
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update if it was enabled
      if (context?.previousSuppliers) {
        queryClient.setQueryData(
          INVENTORY_QUERY_KEYS.suppliers(),
          context.previousSuppliers
        );
      }

      // 🚨 Error notification
      const errorMessage = error.message || "Error al crear proveedor";
      notifyError(errorMessage, {
        title: "Error",
        duration: 8000,
      });

      // 🎯 Custom error handler
      onError?.(errorMessage);
    },
  });

  return {
    createSupplier: mutation.mutateAsync,
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
      data: CreateSupplierInput & { isActive?: boolean };
    }) => {
      const result = await updateSupplierAction(id, data);

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar proveedor");
      }

      return result.data;
    },

    onSuccess: (supplier) => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.suppliers(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.supplier(supplier.id),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.products(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.stats(),
      });

      // 📢 Success notification
      success(`"${supplier.name}" fue actualizado exitosamente.`, {
        title: "¡Proveedor actualizado!",
        duration: 5000,
      });

      onSuccess?.(supplier);
    },

    onError: (error: Error) => {
      const errorMessage = error.message || "Error al actualizar proveedor";
      notifyError(errorMessage, {
        title: "Error",
        duration: 8000,
      });

      onError?.(errorMessage);
    },
  });

  return {
    updateSupplier: (
      id: string,
      data: CreateSupplierInput & { isActive?: boolean }
    ) => mutation.mutateAsync({ id, data }),
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

    onSuccess: (_result, supplierId) => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.suppliers(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.supplier(supplierId),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.products(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.stats(),
      });

      // 📢 Success notification
      success("Proveedor eliminado exitosamente.", {
        title: "¡Proveedor eliminado!",
        duration: 5000,
      });

      onSuccess?.();
    },

    onError: (error: Error) => {
      const errorMessage = error.message || "Error al eliminar proveedor";
      notifyError(errorMessage, {
        title: "Error",
        duration: 8000,
      });

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

// 🎯 Wrapper Hooks with Notifications (siguiendo el patrón establecido)
export function useCreateSupplierWithNotifications() {
  return useCreateSupplier({
    optimisticUpdate: true,
  });
}

export function useUpdateSupplierWithNotifications() {
  return useUpdateSupplier();
}

export function useDeleteSupplierWithNotifications() {
  return useDeleteSupplier();
}

// 🎯 Modal Integration Hooks (para uso directo en modales)
export function useCreateSupplierModal() {
  const { createSupplier, isLoading, error, reset } =
    useCreateSupplierWithNotifications();

  const handleCreateSupplier = async (data: CreateSupplierInput) => {
    try {
      await createSupplier(data);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleCreateSupplier,
    isLoading,
    error,
    reset,
  };
}

export function useUpdateSupplierModal() {
  const { updateSupplier, isLoading, error, reset } =
    useUpdateSupplierWithNotifications();

  const handleUpdateSupplier = async (
    id: string,
    data: CreateSupplierInput & { isActive?: boolean }
  ) => {
    try {
      await updateSupplier(id, data);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleUpdateSupplier,
    isLoading,
    error,
    reset,
  };
}

export function useDeleteSupplierModal() {
  const { deleteSupplier, isLoading, error, reset } =
    useDeleteSupplierWithNotifications();

  const handleDeleteSupplier = async (id: string) => {
    try {
      await deleteSupplier(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleDeleteSupplier,
    isLoading,
    error,
    reset,
  };
}

