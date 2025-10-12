/**
 * 💖 WISHLIST TAB - ARQUITECTURA PROFESIONAL
 * ==========================================
 *
 * Componente principal del WishlistTab con nueva arquitectura profesional:
 * ✅ Single source of truth (StorefrontContext)
 * ✅ Zero hooks intermediarios
 * ✅ Simple, directo, mantenible
 * ✅ Zero bugs, zero complexity
 *
 * MIGRADO: 2025-01-28 - Professional Architecture
 */

"use client";

import React from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import { useCartContext } from "@/features/cart/context";

// 🎯 Import components necesarios
import EmptyWishlist from "./EmptyWishlist";

/**
 * 💖 WISHLIST TAB - PROFESIONAL Y SIMPLE
 */
const WishlistTab: React.FC = () => {
  // 🏪 Storefront data & actions - Todo en un lugar
  const {
    wishlist,
    products,
    globalSearchTerm,
    setGlobalSearchTerm,
    removeFromWishlist,
    setViewingProduct,
  } = useStorefrontContext();

  // 🛒 Cart actions - Directo
  const { addToCart } = useCartContext();

  // 📊 Wishlist con datos de productos
  const wishlistWithProducts = React.useMemo(() => {
    return wishlist
      .map((wishlistItem) => {
        const product = products.find((p) => p.id === wishlistItem.productId);
        return product ? { ...product, wishlistItem } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [wishlist, products]);

  // 🔍 Filtrado simple
  const filteredWishlist = React.useMemo(() => {
    if (!globalSearchTerm.trim()) return wishlistWithProducts;

    return wishlistWithProducts.filter((product) =>
      product.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [wishlistWithProducts, globalSearchTerm]);

  // ⚡ Acciones simples - Sin indirección
  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Remove from wishlist failed:", error);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    try {
      await addToCart(productId, quantity);
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const handleProductView = (product: (typeof wishlistWithProducts)[0]) => {
    setViewingProduct(product);
  };

  // 🚀 NO LOADING STATES - SUPER FAST UX!

  // 📭 Empty wishlist
  if (wishlistWithProducts.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <div className="wishlist-tab space-y-6">
      {/* Header simplificado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mi Wishlist</h1>
          <p className="text-gray-600">
            {filteredWishlist.length} productos en tu wishlist
            {globalSearchTerm &&
              ` (filtrados por &ldquo;${globalSearchTerm}&rdquo;)`}
          </p>
        </div>

        {/* Search box */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar en wishlist..."
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          {globalSearchTerm && (
            <button
              onClick={() => setGlobalSearchTerm("")}
              className="text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Wishlist grid simplificado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWishlist.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => handleProductView(product)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}

              {/* Wishlist indicator */}
              <div className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                ❤️
              </div>
            </div>

            {/* Product Info */}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            <p className="text-2xl font-bold text-gray-900 mb-4">
              ${product.price}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleAddToCart(product.id)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Agregar al carrito
              </button>
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors border border-red-200"
              >
                💔 Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredWishlist.length === 0 && wishlistWithProducts.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 mb-4">
            No hay productos en tu wishlist que coincidan con &ldquo;
            {globalSearchTerm}&rdquo;
          </p>
          <button
            onClick={() => setGlobalSearchTerm("")}
            className="text-red-600 hover:text-red-800"
          >
            Ver toda mi wishlist
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
