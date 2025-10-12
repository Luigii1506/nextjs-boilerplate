/**
 * 💖 WISHLIST MUTATIONS HOOK
 * ==========================
 *
 * Hook para manejar operaciones CRUD de wishlist con TanStack Query.
 *
 * Features:
 * - ✅ Optimistic updates (UI instantánea)
 * - ✅ Rollback automático si falla
 * - ✅ Sincronización automática con server
 * - ✅ Loading states por acción
 *
 * @version 3.0.0 - TanStack Query Migration
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { addToWishlistAction, removeFromWishlistAction } from "../server";
import { storefrontKeys } from "./queryKeys";
import type { StorefrontData, WishlistItem } from "../types";

/**
 * 💖 USE WISHLIST
 * ==============
 *
 * Hook principal para operaciones de wishlist.
 *
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const { addToWishlist, removeFromWishlist, isAddingToWishlist } = useWishlist();
 *
 *   const handleToggle = () => {
 *     if (product.isWishlisted) {
 *       removeFromWishlist(product.id);
 *     } else {
 *       addToWishlist(product.id);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleToggle} disabled={isAddingToWishlist}>
 *       {product.isWishlisted ? '❤️' : '🤍'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ➕ ADD TO WISHLIST MUTATION
  // ===========================
  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) {
        throw new Error("Authentication required to add to wishlist");
      }

      console.log("➕ [Wishlist Mutation] Adding product:", productId);

      const result = await addToWishlistAction(user.id, productId);

      if (!result.success) {
        throw new Error(result.error || "Failed to add to wishlist");
      }

      return result;
    },

    // 🎯 OPTIMISTIC UPDATE (UI updates instantly)
    onMutate: async (productId) => {
      console.log("⚡ [Optimistic] Adding to wishlist:", productId);

      // 1. Cancel any outgoing refetches (para evitar race conditions)
      await queryClient.cancelQueries({ queryKey: storefrontKeys.all });

      // 2. Snapshot previous value (para rollback si falla)
      const previousData = queryClient.getQueryData<StorefrontData>(
        storefrontKeys.all
      );

      // 3. Optimistically update cache (UI se actualiza INSTANTÁNEAMENTE)
      queryClient.setQueryData<StorefrontData>(storefrontKeys.all, (old) => {
        if (!old) return old;

        return {
          ...old,
          // Update products list
          products: old.products.map((p) =>
            p.id === productId ? { ...p, isWishlisted: true } : p
          ),
          // Update featured products
          featuredProducts: old.featuredProducts?.map((p) =>
            p.id === productId ? { ...p, isWishlisted: true } : p
          ),
          // Add to wishlist array
          wishlist: [
            ...(old.wishlist || []),
            {
              id: `temp-${productId}-${Date.now()}`,
              productId,
              userId: user!.id,
              addedAt: new Date(),
            } as WishlistItem,
          ],
        };
      });

      // Return context for rollback
      return { previousData };
    },

    // ❌ ROLLBACK on error (automático)
    onError: (err, productId, context) => {
      console.error("❌ [Wishlist Error] Failed to add, rolling back:", err);

      // Restore previous state
      if (context?.previousData) {
        queryClient.setQueryData(storefrontKeys.all, context.previousData);
      }
    },

    // ✅ SYNC with server after mutation
    onSuccess: (data, productId) => {
      console.log("✅ [Wishlist Success] Added to wishlist:", productId);
    },

    onSettled: () => {
      // Refetch para asegurar sincronización con server
      queryClient.invalidateQueries({ queryKey: storefrontKeys.all });
    },
  });

  // ➖ REMOVE FROM WISHLIST MUTATION
  // ================================
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) {
        throw new Error("Authentication required to remove from wishlist");
      }

      console.log("➖ [Wishlist Mutation] Removing product:", productId);

      const result = await removeFromWishlistAction(user.id, productId);

      if (!result.success) {
        throw new Error(result.error || "Failed to remove from wishlist");
      }

      return result;
    },

    // 🎯 OPTIMISTIC UPDATE
    onMutate: async (productId) => {
      console.log("⚡ [Optimistic] Removing from wishlist:", productId);

      await queryClient.cancelQueries({ queryKey: storefrontKeys.all });

      const previousData = queryClient.getQueryData<StorefrontData>(
        storefrontKeys.all
      );

      queryClient.setQueryData<StorefrontData>(storefrontKeys.all, (old) => {
        if (!old) return old;

        return {
          ...old,
          // Update products list
          products: old.products.map((p) =>
            p.id === productId ? { ...p, isWishlisted: false } : p
          ),
          // Update featured products
          featuredProducts: old.featuredProducts?.map((p) =>
            p.id === productId ? { ...p, isWishlisted: false } : p
          ),
          // Remove from wishlist array
          wishlist: old.wishlist?.filter((w) => w.productId !== productId),
        };
      });

      return { previousData };
    },

    // ❌ ROLLBACK on error
    onError: (err, productId, context) => {
      console.error(
        "❌ [Wishlist Error] Failed to remove, rolling back:",
        err
      );

      if (context?.previousData) {
        queryClient.setQueryData(storefrontKeys.all, context.previousData);
      }
    },

    // ✅ SUCCESS
    onSuccess: (data, productId) => {
      console.log("✅ [Wishlist Success] Removed from wishlist:", productId);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: storefrontKeys.all });
    },
  });

  // 🎯 PUBLIC API
  return {
    // Actions (async)
    addToWishlist: addMutation.mutateAsync,
    removeFromWishlist: removeMutation.mutateAsync,

    // Actions (sync - no espera resultado)
    addToWishlistSync: addMutation.mutate,
    removeFromWishlistSync: removeMutation.mutate,

    // Loading states
    isAddingToWishlist: addMutation.isPending,
    isRemovingFromWishlist: removeMutation.isPending,
    isWishlistMutating: addMutation.isPending || removeMutation.isPending,

    // Error states
    addError: addMutation.error,
    removeError: removeMutation.error,

    // Reset mutations
    resetAdd: addMutation.reset,
    resetRemove: removeMutation.reset,
  };
}

/**
 * 🎨 HELPER: useWishlistToggle
 * ============================
 *
 * Hook simplificado para toggle wishlist (agregar/remover).
 *
 * @example
 * ```tsx
 * function WishlistButton({ product }) {
 *   const { toggle, isToggling } = useWishlistToggle();
 *
 *   return (
 *     <button
 *       onClick={() => toggle(product.id, product.isWishlisted)}
 *       disabled={isToggling}
 *     >
 *       {product.isWishlisted ? 'Remove' : 'Add'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useWishlistToggle() {
  const { addToWishlist, removeFromWishlist, isWishlistMutating } =
    useWishlist();

  const toggle = async (productId: string, isCurrentlyWishlisted: boolean) => {
    if (isCurrentlyWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return {
    toggle,
    isToggling: isWishlistMutating,
  };
}
