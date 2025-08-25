/**
 * 🏷️ USE CATEGORY MUTATIONS HOOKS
 * ==============================
 *
 * Hooks personalizados para CRUD de categorías con TanStack Query
 * Incluye optimistic updates, cache invalidation y notificaciones
 *
 * Created: 2025-01-17 - Category Management Hooks
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../actions";
import { INVENTORY_QUERY_KEYS } from "./useInventoryQuery";
import type { CreateCategoryInput, CategoryWithRelations } from "../types";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Hook options
interface UseCategoryMutationOptions {
  onSuccess?: (category?: CategoryWithRelations) => void;
  onError?: (error: string) => void;
  optimisticUpdate?: boolean;
}

// 🎯 Hook return types
interface UseCreateCategoryReturn {
  createCategory: (data: CreateCategoryInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseUpdateCategoryReturn {
  updateCategory: (
    id: string,
    data: CreateCategoryInput & { isActive?: boolean }
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

interface UseDeleteCategoryReturn {
  deleteCategory: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * 🎯 useCreateCategory Hook
 */
export function useCreateCategory(
  options: UseCategoryMutationOptions = {}
): UseCreateCategoryReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError, optimisticUpdate = true } = options;

  // 🚀 Create Category Mutation
  const mutation = useMutation({
    mutationFn: async (data: CreateCategoryInput) => {
      const result = await createCategoryAction(data);

      if (!result.success) {
        throw new Error(result.error || "Error al crear categoría");
      }

      return result.data;
    },

    // 🎯 Optimistic Update (Optional)
    onMutate: optimisticUpdate
      ? async (newCategory: CreateCategoryInput) => {
          // Cancel any outgoing refetches
          await queryClient.cancelQueries({
            queryKey: INVENTORY_QUERY_KEYS.categories(),
          });

          // Snapshot the previous value
          const previousCategories = queryClient.getQueryData(
            INVENTORY_QUERY_KEYS.categories()
          );

          // Optimistically update to the new value
          if (previousCategories) {
            const optimisticCategory: CategoryWithRelations = {
              id: `optimistic-${Date.now()}`,
              ...newCategory,
              description: newCategory.description || null,
              parentId: newCategory.parentId || null,
              color: newCategory.color || "#3B82F6",
              icon: newCategory.icon || null,
              isActive: true,
              sortOrder: newCategory.sortOrder || 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              parent: null,
              children: [],
              products: [],
              _count: { products: 0, children: 0 },
            };

            queryClient.setQueryData(
              INVENTORY_QUERY_KEYS.categories(),
              (old: unknown) => {
                const oldData = old as {
                  data?: { categories?: CategoryWithRelations[] };
                };
                return {
                  ...oldData,
                  data: {
                    ...oldData?.data,
                    categories: [
                      optimisticCategory,
                      ...(oldData?.data?.categories || []),
                    ],
                  },
                };
              }
            );
          }

          return { previousCategories };
        }
      : undefined,

    // 🎯 Success Handler
    onSuccess: (category) => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.stats(),
      });
      // ✅ Invalidate ALL category list variations
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key[0] === "inventory" &&
            key[1] === "categories"
          );
        },
      });
      // ✅ Invalidate products since they depend on categories
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.products(),
      });
      // ✅ Invalidate the root inventory cache
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.all,
      });

      // 📢 Success notification
      if (category) {
        success(`"${category.name}" fue creada exitosamente.`, {
          duration: 5000,
        });
      } else {
        success("Categoría fue creada exitosamente.", {
          duration: 5000,
        });
      }

      // 🎯 Custom success handler
      onSuccess?.(category);
    },

    // 🚨 Error Handler
    onError: (error: Error, variables, context) => {
      // 🔄 Rollback optimistic update if it exists
      if (context?.previousCategories && optimisticUpdate) {
        queryClient.setQueryData(
          INVENTORY_QUERY_KEYS.categories(),
          context.previousCategories
        );
      }

      const errorMessage = error.message || "Error al crear categoría";

      // 📢 Error notification
      notifyError(errorMessage, {
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
    createCategory: async (data: CreateCategoryInput) => {
      await mutation.mutateAsync(data);
    },
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

/**
 * 🎯 useUpdateCategory Hook
 */
export function useUpdateCategory(
  options: UseCategoryMutationOptions = {}
): UseUpdateCategoryReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError } = options;

  // 🚀 Update Category Mutation
  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateCategoryInput & { isActive?: boolean };
    }) => {
      const result = await updateCategoryAction(id, data);

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar categoría");
      }

      return result.data;
    },

    // 🎯 Success Handler
    onSuccess: (category) => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.stats(),
      });
      // ✅ Invalidate ALL category list variations
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key[0] === "inventory" &&
            key[1] === "categories"
          );
        },
      });
      // ✅ Invalidate products since they depend on categories
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.products(),
      });
      // ✅ Invalidate the root inventory cache
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.all,
      });

      // 📢 Success notification
      if (category) {
        success(`"${category.name}" fue actualizada exitosamente.`, {
          duration: 5000,
        });
      } else {
        success("Categoría fue actualizada exitosamente.", {
          duration: 5000,
        });
      }

      // 🎯 Custom success handler
      onSuccess?.(category);
    },

    // 🚨 Error Handler
    onError: (error: Error) => {
      const errorMessage = error.message || "Error al actualizar categoría";

      // 📢 Error notification
      notifyError(errorMessage, {
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
    updateCategory: async (
      id: string,
      data: CreateCategoryInput & { isActive?: boolean }
    ) => {
      await mutation.mutateAsync({ id, data });
    },
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

/**
 * 🎯 useDeleteCategory Hook
 */
export function useDeleteCategory(
  options: UseCategoryMutationOptions = {}
): UseDeleteCategoryReturn {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  const { onSuccess, onError } = options;

  // 🚀 Delete Category Mutation
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategoryAction(id);

      if (!result.success) {
        throw new Error(result.error || "Error al eliminar categoría");
      }

      return result.data;
    },

    // 🎯 Success Handler
    onSuccess: () => {
      // 🔄 Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.stats(),
      });
      // ✅ Invalidate ALL category list variations
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key[0] === "inventory" &&
            key[1] === "categories"
          );
        },
      });
      // ✅ Invalidate products since they depend on categories
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.products(),
      });
      // ✅ Invalidate the root inventory cache
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.all,
      });

      // 📢 Success notification
      success(`La categoría fue eliminada exitosamente.`, {
        duration: 5000,
      });

      // 🎯 Custom success handler
      onSuccess?.();
    },

    // 🚨 Error Handler
    onError: (error: Error) => {
      const errorMessage = error.message || "Error al eliminar categoría";

      // 📢 Error notification
      notifyError(errorMessage, {
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
    deleteCategory: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

// 🎯 Pre-configured hooks for easy usage

export function useCreateCategoryWithNotifications() {
  return useCreateCategory({
    optimisticUpdate: true,
    onSuccess: (category) => {
      console.log("Category created successfully:", category);
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
    },
  });
}

export function useUpdateCategoryWithNotifications() {
  return useUpdateCategory({
    onSuccess: (category) => {
      console.log("Category updated successfully:", category);
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
    },
  });
}

export function useDeleteCategoryWithNotifications() {
  return useDeleteCategory({
    onSuccess: () => {
      console.log("Category deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
    },
  });
}

// 🎯 Modal-specific hooks

export function useCreateCategoryModal() {
  const { createCategory, isLoading, error, reset } =
    useCreateCategoryWithNotifications();

  const handleCreateCategory = async (data: CreateCategoryInput) => {
    try {
      await createCategory(data);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleCreateCategory,
    isLoading,
    error,
    reset,
  };
}

export function useUpdateCategoryModal() {
  const { updateCategory, isLoading, error, reset } =
    useUpdateCategoryWithNotifications();

  const handleUpdateCategory = async (
    id: string,
    data: CreateCategoryInput & { isActive?: boolean }
  ) => {
    try {
      await updateCategory(id, data);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleUpdateCategory,
    isLoading,
    error,
    reset,
  };
}

export function useDeleteCategoryModal() {
  const { deleteCategory, isLoading, error, reset } =
    useDeleteCategoryWithNotifications();

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleDeleteCategory,
    isLoading,
    error,
    reset,
  };
}
