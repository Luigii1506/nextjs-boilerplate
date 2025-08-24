/**
 * 🎯 USE CREATE PRODUCT HOOK
 * ==========================
 *
 * Hook personalizado para crear productos con TanStack Query
 * Incluye optimistic updates, cache invalidation y notificaciones
 *
 * Created: 2025-01-18 - Product Management Hook
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "../actions";
import { INVENTORY_QUERY_KEYS } from "./useInventoryQuery";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductWithRelations,
} from "../types";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Hook options
interface UseCreateProductOptions {
  onSuccess?: (product: ProductWithRelations) => void;
  onError?: (error: string) => void;
  optimisticUpdate?: boolean;
}

// 🎯 Hook return type
interface UseCreateProductReturn {
  createProduct: (data: CreateProductInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * 🎯 useCreateProduct Hook
 */
export function useCreateProduct(
  options: UseCreateProductOptions = {}
): UseCreateProductReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError, optimisticUpdate = true } = options;

  // 🚀 Create Product Mutation
  const mutation = useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const result = await createProductAction(data);

      if (!result.success) {
        throw new Error(result.error || "Error al crear producto");
      }

      return result.data;
    },

    // 🎯 Optimistic Update (Optional)
    onMutate: optimisticUpdate
      ? async (newProduct: CreateProductInput) => {
          // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
          await queryClient.cancelQueries({
            queryKey: [INVENTORY_QUERY_KEYS.products],
          });

          // Snapshot the previous value
          const previousProducts = queryClient.getQueryData([
            INVENTORY_QUERY_KEYS.products,
          ]);

          // Optimistically update to the new value
          if (previousProducts) {
            const optimisticProduct: ProductWithRelations = {
              id: `optimistic-${Date.now()}`,
              ...newProduct,
              images: newProduct.images || [],
              tags: newProduct.tags || [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              // Mock relations - will be replaced when real data comes
              category: {
                id: newProduct.categoryId,
                name: "Cargando...",
                description: null,
                parentId: null,
                color: "#3B82F6",
                icon: "Package",
                isActive: true,
                sortOrder: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                parent: null,
                children: [],
                products: [],
                _count: { products: 0, children: 0 },
              },
              supplier: null,
              stockMovements: [],
              _count: { stockMovements: 0 },
            };

            queryClient.setQueryData(
              [INVENTORY_QUERY_KEYS.products],
              (old: unknown) => {
                const oldData = old as {
                  data?: { products?: ProductWithRelations[] };
                };
                return {
                  ...oldData,
                  data: {
                    ...oldData?.data,
                    products: [
                      optimisticProduct,
                      ...(oldData?.data?.products || []),
                    ],
                  },
                };
              }
            );
          }

          // Return a context object with the snapshotted value
          return { previousProducts };
        }
      : undefined,

    // 🎯 Success Handler
    onSuccess: (product) => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.products],
      });
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.stats],
      });
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.all],
      });

      // 📢 Success notification
      success(`${product.name} fue agregado exitosamente al inventario.`, {
        title: "¡Producto creado!",
        duration: 5000,
      });

      // 🎯 Custom success handler
      onSuccess?.(product);
    },

    // 🚨 Error Handler
    onError: (error: Error, variables, context) => {
      // 🔄 Rollback optimistic update if it exists
      if (context?.previousProducts && optimisticUpdate) {
        queryClient.setQueryData(
          [INVENTORY_QUERY_KEYS.products],
          context.previousProducts
        );
      }

      const errorMessage = error.message || "Error al crear producto";

      // 📢 Error notification
      notifyError(errorMessage, {
        title: "Error al crear producto",
        duration: 8000,
      });

      // 🎯 Custom error handler
      onError?.(errorMessage);
    },

    // ⚙️ Mutation settings
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    createProduct: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

// 🎯 Wrapper hook with pre-configured success/error handlers
export function useCreateProductWithNotifications() {
  return useCreateProduct({
    optimisticUpdate: true,
    onSuccess: (product) => {
      console.log("Product created successfully:", product);
    },
    onError: (error) => {
      console.error("Failed to create product:", error);
    },
  });
}

// 🎯 Hook for modal integration
export function useCreateProductModal() {
  const { createProduct, isLoading, error, reset } =
    useCreateProductWithNotifications();

  const handleCreateProduct = async (data: CreateProductInput) => {
    try {
      await createProduct(data);
      // Modal will be closed by the ProductModal component
      return true;
    } catch {
      // Error is already handled by the hook
      return false;
    }
  };

  return {
    handleCreateProduct,
    isLoading,
    error,
    reset,
  };
}

// 🎯 useUpdateProduct Hook
interface UseUpdateProductOptions {
  onSuccess?: (product: ProductWithRelations) => void;
  onError?: (error: string) => void;
}

interface UseUpdateProductReturn {
  updateProduct: (id: string, data: UpdateProductInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useUpdateProduct(
  options: UseUpdateProductOptions = {}
): UseUpdateProductReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError } = options;

  // 🚀 Update Product Mutation
  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductInput;
    }) => {
      const result = await updateProductAction(id, data);

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar producto");
      }

      return result.data;
    },

    // 🎯 Success Handler
    onSuccess: (product) => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.products],
      });
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.stats],
      });
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.all],
      });

      // 📢 Success notification
      success(`${product.name} fue actualizado exitosamente.`, {
        title: "¡Producto actualizado!",
        duration: 5000,
      });

      // 🎯 Custom success handler
      onSuccess?.(product);
    },

    // 🚨 Error Handler
    onError: (error: Error) => {
      const errorMessage = error.message || "Error al actualizar producto";

      // 📢 Error notification
      notifyError(errorMessage, {
        title: "Error al actualizar producto",
        duration: 8000,
      });

      // 🎯 Custom error handler
      onError?.(errorMessage);
    },

    // ⚙️ Mutation settings
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    updateProduct: (id: string, data: UpdateProductInput) =>
      mutation.mutateAsync({ id, data }),
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

// 🎯 useDeleteProduct Hook
interface UseDeleteProductOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseDeleteProductReturn {
  deleteProduct: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useDeleteProduct(
  options: UseDeleteProductOptions = {}
): UseDeleteProductReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError } = options;

  // 🚀 Delete Product Mutation
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProductAction(id);

      if (!result.success) {
        throw new Error(result.error || "Error al eliminar producto");
      }

      return result.data;
    },

    // 🎯 Success Handler
    onSuccess: () => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.products],
      });
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.stats],
      });
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_QUERY_KEYS.all],
      });

      // 📢 Success notification
      success(`El producto fue eliminado exitosamente.`, {
        title: "¡Producto eliminado!",
        duration: 5000,
      });

      // 🎯 Custom success handler
      onSuccess?.();
    },

    // 🚨 Error Handler
    onError: (error: Error) => {
      const errorMessage = error.message || "Error al eliminar producto";

      // 📢 Error notification
      notifyError(errorMessage, {
        title: "Error al eliminar producto",
        duration: 8000,
      });

      // 🎯 Custom error handler
      onError?.(errorMessage);
    },

    // ⚙️ Mutation settings
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    deleteProduct: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

// 🎯 Wrapper hooks for modal integration
export function useUpdateProductModal() {
  const { updateProduct, isLoading, error, reset } = useUpdateProduct({
    onSuccess: (product) => {
      console.log("Product updated successfully:", product);
    },
    onError: (error) => {
      console.error("Failed to update product:", error);
    },
  });

  const handleUpdateProduct = async (id: string, data: UpdateProductInput) => {
    try {
      await updateProduct(id, data);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleUpdateProduct,
    isLoading,
    error,
    reset,
  };
}

export function useDeleteProductModal() {
  const { deleteProduct, isLoading, error, reset } = useDeleteProduct({
    onSuccess: () => {
      console.log("Product deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete product:", error);
    },
  });

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleDeleteProduct,
    isLoading,
    error,
    reset,
  };
}
