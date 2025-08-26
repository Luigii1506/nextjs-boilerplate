/**
 * 💖 CUSTOM WISHLIST ACTIONS HOOK
 * ===============================
 *
 * Hook personalizado para acciones específicas del wishlist
 * Demuestra el uso de addToWishlist implementado
 *
 * Created: 2025-01-17 - Wishlist Actions Implementation
 */

"use client";

import { useCallback } from "react";
import { useStorefrontContext } from "../context/StorefrontContext";
import type { ProductForCustomer } from "../types";

export const useWishlistActions = () => {
  const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isAddingToWishlist,
    wishlist,
    isAuthenticated,
  } = useStorefrontContext();

  // 💖 Add specific product to wishlist
  const handleAddToWishlist = useCallback(
    async (product: ProductForCustomer) => {
      if (!isAuthenticated) {
        console.warn("User must be authenticated to add to wishlist");
        return { success: false, message: "Authentication required" };
      }

      console.log("🎯 Using addToWishlist for:", product.name);
      return await addToWishlist(product);
    },
    [addToWishlist, isAuthenticated]
  );

  // 🗑️ Remove specific product from wishlist
  const handleRemoveFromWishlist = useCallback(
    async (product: ProductForCustomer) => {
      if (!isAuthenticated) {
        console.warn("User must be authenticated to remove from wishlist");
        return { success: false, message: "Authentication required" };
      }

      console.log("🎯 Using removeFromWishlist for:", product.name);
      return await removeFromWishlist(product);
    },
    [removeFromWishlist, isAuthenticated]
  );

  // 🔄 Smart toggle (existing functionality)
  const handleToggleWishlist = useCallback(
    async (product: ProductForCustomer) => {
      console.log(
        "🎯 Using toggleWishlist for:",
        product.name,
        "- Currently wishlisted:",
        product.isWishlisted
      );
      return await toggleWishlist(product);
    },
    [toggleWishlist]
  );

  // 📊 Utility functions
  const isProductWishlisted = useCallback(
    (productId: string): boolean => {
      return wishlist.some((item) => item.product?.id === productId);
    },
    [wishlist]
  );

  const getWishlistCount = useCallback((): number => {
    return wishlist.length;
  }, [wishlist]);

  // 🎯 Batch operations
  const addMultipleToWishlist = useCallback(
    async (products: ProductForCustomer[]) => {
      if (!isAuthenticated) {
        return { success: false, message: "Authentication required" };
      }

      console.log("🎯 Adding multiple products to wishlist:", products.length);

      const results = await Promise.all(
        products.map((product) => addToWishlist(product))
      );

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      return {
        success: failCount === 0,
        message: `${successCount} productos agregados, ${failCount} fallaron`,
        results,
      };
    },
    [addToWishlist, isAuthenticated]
  );

  return {
    // 🔧 Individual Actions (NEW - Implemented TODO)
    addToWishlist: handleAddToWishlist,
    removeFromWishlist: handleRemoveFromWishlist,

    // 🔄 Toggle Action (existing)
    toggleWishlist: handleToggleWishlist,

    // 📊 Utility Functions
    isProductWishlisted,
    getWishlistCount,

    // 🎯 Batch Operations
    addMultipleToWishlist,

    // 📱 State
    isLoading: isAddingToWishlist,
    wishlistItems: wishlist,
    isAuthenticated,
  };
};

// 🎯 Example Usage:
/*
const WishlistExampleComponent = () => {
  const {
    addToWishlist,        // ← TODO IMPLEMENTED!
    removeFromWishlist,   // ← Individual actions
    toggleWishlist,       // ← Smart toggle
    isProductWishlisted,
    getWishlistCount,
    isLoading
  } = useWishlistActions();

  const handleAddClick = async (product) => {
    // Direct add - no toggle logic
    const result = await addToWishlist(product);
    if (result.success) {
      console.log("Product added successfully!");
    }
  };

  const handleRemoveClick = async (product) => {
    // Direct remove - no toggle logic  
    const result = await removeFromWishlist(product);
    if (result.success) {
      console.log("Product removed successfully!");
    }
  };

  return (
    <div>
      <p>Wishlist Count: {getWishlistCount()}</p>
      {isLoading && <p>Loading...</p>}
    </div>
  );
};
*/
