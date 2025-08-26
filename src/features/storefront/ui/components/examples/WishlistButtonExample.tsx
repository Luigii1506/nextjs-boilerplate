/**
 * 💖 WISHLIST BUTTON EXAMPLE COMPONENT
 * =====================================
 *
 * Ejemplo de cómo usar addToWishlist implementado
 * Demuestra diferentes patrones de uso del wishlist
 *
 * Created: 2025-01-17 - AddToWishlist Implementation Example
 */

"use client";

import React, { useState } from "react";
import { Heart, Plus, Minus, ShoppingHeart } from "lucide-react";
import { cn } from "@/shared/utils";
import { useWishlistActions } from "../../hooks/useWishlistActions";
import type { ProductForCustomer } from "../../types";

interface WishlistButtonExampleProps {
  product: ProductForCustomer;
  variant?: "heart" | "button" | "floating";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * 🎯 EJEMPLO 1: Botón específico para AGREGAR (sin toggle)
 */
export const AddToWishlistButton: React.FC<WishlistButtonExampleProps> = ({
  product,
  variant = "button",
  size = "md",
  className,
}) => {
  const { addToWishlist, isLoading, isProductWishlisted } =
    useWishlistActions();
  const [localLoading, setLocalLoading] = useState(false);

  // Ya está en wishlist - no mostrar botón
  if (isProductWishlisted(product.id)) {
    return null;
  }

  const handleAdd = async () => {
    setLocalLoading(true);

    // ✅ USANDO addToWishlist IMPLEMENTADO - NO toggleWishlist
    const result = await addToWishlist(product);

    if (result.success) {
      console.log("✅ Successfully added using addToWishlist:", product.name);
    } else {
      console.error("❌ Failed to add:", result.message);
    }

    setLocalLoading(false);
  };

  const isProcessing = isLoading || localLoading;

  if (variant === "heart") {
    return (
      <button
        onClick={handleAdd}
        disabled={isProcessing}
        className={cn(
          "p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200",
          isProcessing && "animate-pulse",
          className
        )}
        title="Agregar a lista de deseos"
      >
        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
      </button>
    );
  }

  if (variant === "floating") {
    return (
      <button
        onClick={handleAdd}
        disabled={isProcessing}
        className={cn(
          "fixed bottom-20 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
          isProcessing && "animate-bounce",
          className
        )}
        title="Agregar a wishlist"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isProcessing}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors duration-200",
        isProcessing && "opacity-50 cursor-not-allowed",
        size === "sm" && "px-3 py-1 text-sm",
        size === "lg" && "px-6 py-3 text-lg",
        className
      )}
    >
      {isProcessing ? (
        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Heart className="w-4 h-4" />
      )}
      <span>Agregar a Wishlist</span>
    </button>
  );
};

/**
 * 🎯 EJEMPLO 2: Botón específico para REMOVER (sin toggle)
 */
export const RemoveFromWishlistButton: React.FC<WishlistButtonExampleProps> = ({
  product,
  variant = "button",
  size = "md",
  className,
}) => {
  const { removeFromWishlist, isLoading, isProductWishlisted } =
    useWishlistActions();
  const [localLoading, setLocalLoading] = useState(false);

  // No está en wishlist - no mostrar botón
  if (!isProductWishlisted(product.id)) {
    return null;
  }

  const handleRemove = async () => {
    setLocalLoading(true);

    // ✅ USANDO removeFromWishlist IMPLEMENTADO - NO toggleWishlist
    const result = await removeFromWishlist(product);

    if (result.success) {
      console.log(
        "✅ Successfully removed using removeFromWishlist:",
        product.name
      );
    } else {
      console.error("❌ Failed to remove:", result.message);
    }

    setLocalLoading(false);
  };

  const isProcessing = isLoading || localLoading;

  return (
    <button
      onClick={handleRemove}
      disabled={isProcessing}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-lg transition-colors duration-200",
        isProcessing && "opacity-50 cursor-not-allowed",
        size === "sm" && "px-3 py-1 text-sm",
        size === "lg" && "px-6 py-3 text-lg",
        className
      )}
    >
      {isProcessing ? (
        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Minus className="w-4 h-4" />
      )}
      <span>Remover de Wishlist</span>
    </button>
  );
};

/**
 * 🎯 EJEMPLO 3: Componente completo que muestra diferentes usos
 */
export const WishlistExampleShowcase: React.FC<{
  products: ProductForCustomer[];
}> = ({ products }) => {
  const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    addMultipleToWishlist,
    getWishlistCount,
    isLoading,
  } = useWishlistActions();

  const handleBulkAdd = async () => {
    if (products.length === 0) return;

    console.log("🎯 Adding multiple products using addToWishlist");
    const result = await addMultipleToWishlist(products.slice(0, 3));

    console.log("Bulk add result:", result);
  };

  const handleIndividualAdd = async (product: ProductForCustomer) => {
    console.log("🎯 Using individual addToWishlist for:", product.name);
    const result = await addToWishlist(product);
    console.log("Individual add result:", result);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          🎯 AddToWishlist Implementation Examples
        </h3>
        <p className="text-gray-600">
          Wishlist Count:{" "}
          <span className="font-medium">{getWishlistCount()}</span>
          {isLoading && (
            <span className="ml-2 text-blue-600">Processing...</span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {/* Individual Actions */}
        <div>
          <h4 className="font-medium mb-2">Individual Actions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="p-4 border rounded-lg">
                <h5 className="font-medium truncate mb-2">{product.name}</h5>
                <div className="space-y-2">
                  <AddToWishlistButton product={product} size="sm" />
                  <RemoveFromWishlistButton product={product} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        <div>
          <h4 className="font-medium mb-2">Bulk Actions:</h4>
          <button
            onClick={handleBulkAdd}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            <ShoppingHeart className="w-4 h-4 inline mr-2" />
            Add First 3 Products to Wishlist
          </button>
        </div>

        {/* Direct Usage Examples */}
        <div>
          <h4 className="font-medium mb-2">Direct Usage:</h4>
          <div className="space-x-2">
            <button
              onClick={() => products[0] && handleIndividualAdd(products[0])}
              disabled={isLoading || !products[0]}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
            >
              Add First Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 📝 Usage Example in Comments:
/*
// In your component:
import { AddToWishlistButton, useWishlistActions } from "@/features/storefront";

const MyComponent = ({ product }) => {
  const { addToWishlist } = useWishlistActions();
  
  // Option 1: Use the pre-built component
  return <AddToWishlistButton product={product} variant="heart" />;
  
  // Option 2: Use the hook directly
  const handleCustomAdd = async () => {
    const result = await addToWishlist(product);
    if (result.success) {
      // Handle success
    }
  };
  
  return <button onClick={handleCustomAdd}>Custom Add</button>;
};
*/
