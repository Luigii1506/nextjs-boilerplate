/**
 * 🏠 OVERVIEW TAB - ARQUITECTURA PROFESIONAL
 * ==========================================
 *
 * Componente principal del OverviewTab con nueva arquitectura profesional:
 * ✅ Single source of truth (StorefrontContext)
 * ✅ Zero hooks intermediarios
 * ✅ Simple, directo, mantenible
 * ✅ Zero bugs, zero complexity
 *
 * MIGRADO: 2025-01-28 - Professional Architecture
 */

"use client";

import React from "react";
import { useStorefrontUI } from "@/features/storefront/context";
import { useStorefrontData, useWishlist } from "@/features/storefront/hooks";
import { useCart } from "@/features/storefront/cart";
import type { ProductForCustomer } from "@/features/storefront/types";

/**
 * 🏠 OVERVIEW TAB - PROFESIONAL Y SIMPLE
 */
const OverviewTab: React.FC = () => {
  // 🎨 UI State
  const { setViewingProduct, setActiveTab } = useStorefrontUI();

  // 📊 Data (TanStack Query)
  const { data, isLoading } = useStorefrontData();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Extract data
  const rawFeaturedProducts = data?.featuredProducts || [];
  const categories = data?.categories || [];
  const wishlist = data?.wishlist || [];

  // 💖 SINGLE SOURCE OF TRUTH - Derive isWishlisted from wishlist array
  const featuredProducts = React.useMemo(() => {
    const wishlistProductIds = new Set(
      wishlist.map((w: { productId: string }) => w.productId)
    );
    return rawFeaturedProducts.map((product: ProductForCustomer) => ({
      ...product,
      isWishlisted: wishlistProductIds.has(product.id),
    }));
  }, [rawFeaturedProducts, wishlist]);

  // ⚡ Acciones simples - Sin indirección
  const handleWishlistToggle = async (product: ProductForCustomer) => {
    try {
      if (product.isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    try {
      // UltraFast Cart expects direct parameters, not an object
      await addToCart(productId, quantity);
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const handleProductView = (product: ProductForCustomer) => {
    setViewingProduct(product);
  };

  const handleViewAllProducts = () => {
    setActiveTab("products");
  };

  const handleViewCategory = () => {
    setActiveTab("products");
  };

  // 🔄 Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="overview-tab space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Bienvenido a nuestra tienda
          </h1>
          <p className="text-xl mb-6 opacity-90">
            Descubre productos increíbles con la mejor calidad y precios únicos
          </p>
          <button
            onClick={handleViewAllProducts}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Productos destacados
          </h2>
          <button
            onClick={handleViewAllProducts}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todos →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden">
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
              </div>

              {/* Product Info */}
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {product.name}
              </h3>
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
                  onClick={() => handleWishlistToggle(product)}
                  className={`p-2 rounded-md border transition-colors ${
                    product.isWishlisted
                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {product.isWishlisted ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Categorías populares
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((category) => (
            <button
              key={category.id}
              onClick={handleViewCategory}
              className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow border"
            >
              <div className="text-3xl mb-2">{category.emoji || "📦"}</div>
              <h3 className="font-medium text-gray-800 text-sm">
                {category.name}
              </h3>
            </button>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {featuredProducts.length}+
            </div>
            <div className="text-gray-600">Productos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {categories.length}+
            </div>
            <div className="text-gray-600">Categorías</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-gray-600">Soporte</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-gray-600">Garantía</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
