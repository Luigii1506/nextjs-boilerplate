/**
 * 🔍 WISHLIST DEBUG PANEL
 * ======================
 *
 * Panel de debug para rastrear problemas con wishlist
 * Muestra estado en tiempo real para debugging
 */

"use client";

import React from "react";
import { useStorefrontContext } from "../../../context/StorefrontContext";

export const WishlistDebugPanel: React.FC = () => {
  const { isAuthenticated, wishlist, products, featuredProducts } =
    useStorefrontContext();

  console.log("productsproducts", products);

  const productsWithWishlist = products.filter((p) => p.isWishlisted);
  const featuredWithWishlist = featuredProducts.filter((p) => p.isWishlisted);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 WISHLIST DEBUG</h3>

      <div className="space-y-2">
        <div>
          <span className="text-blue-400">Auth:</span>{" "}
          {isAuthenticated ? "✅" : "❌"}
        </div>

        <div>
          <span className="text-green-400">Wishlist Items:</span>{" "}
          {wishlist.length}
        </div>

        <div>
          <span className="text-purple-400">Products with ❤️:</span>{" "}
          {productsWithWishlist.length}
        </div>

        <div>
          <span className="text-pink-400">Featured with ❤️:</span>{" "}
          {featuredWithWishlist.length}
        </div>

        {wishlist.length > 0 && (
          <div className="mt-3">
            <div className="text-yellow-400 font-semibold">Wishlist Items:</div>
            {wishlist.slice(0, 5).map((item, index) => (
              <div key={item.id} className="text-gray-300 text-[10px]">
                {index + 1}. {item.productId.slice(0, 8)}...
              </div>
            ))}
            {wishlist.length > 5 && (
              <div className="text-gray-500">
                + {wishlist.length - 5} more...
              </div>
            )}
          </div>
        )}

        {productsWithWishlist.length > 0 && (
          <div className="mt-3">
            <div className="text-blue-400 font-semibold">Products ❤️:</div>
            {productsWithWishlist.slice(0, 3).map((product, index) => (
              <div key={product.id} className="text-gray-300 text-[10px]">
                {index + 1}. {product.name.slice(0, 20)}...
              </div>
            ))}
            {productsWithWishlist.length > 3 && (
              <div className="text-gray-500">
                + {productsWithWishlist.length - 3} more...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-gray-500 text-[9px] mt-3">
        Updates in real-time • Check console for detailed logs
      </div>
    </div>
  );
};
