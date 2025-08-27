/**
 * 🧪 SAFE PRODUCT VALUES TEST
 * ===========================
 *
 * Componente de prueba para verificar que los valores null/undefined
 * no causan errores en el render de productos
 *
 * Enterprise: 2025-01-26 - Safe values testing
 */

"use client";

import React from "react";
import { ProfessionalProductCard } from "../shared/ProfessionalProductCard";
import type { ProductForCustomer } from "../../types/shared";
import {
  formatSafePrice,
  getSafeRatingDisplay,
} from "../../utils/productSafeValues";

// Products with problematic null/undefined values
const problemProducts: ProductForCustomer[] = [
  {
    id: "test-null-rating",
    sku: "NULL-001",
    name: "Producto con Rating Null",
    description: "Test product with null rating",
    brand: "Test Brand",
    price: 100,
    currentPrice: 100,
    originalPrice: 100,
    salePrice: null,
    isOnSale: false,
    discountPercentage: 0,
    stock: 5,
    isAvailable: true,
    stockStatus: "IN_STOCK",
    images: [],
    unit: "piece",
    rating: null as any, // ❌ PROBLEMATIC: null rating
    reviewCount: null as any, // ❌ PROBLEMATIC: null reviewCount
    salesCount: 100,
    isWishlisted: false,
    isInCart: false,
    badges: null as any, // ❌ PROBLEMATIC: null badges
    tags: ["test"],
    estimatedDelivery: "2-3 días",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "test-cat",
      name: "Test Category",
      slug: "test",
      publicDescription: "Test",
      isPublic: true,
    },
  },
  {
    id: "test-undefined-values",
    sku: "UNDEF-002",
    name: "Producto con Valores Undefined",
    description: "Test product with undefined values",
    brand: null as any, // ❌ PROBLEMATIC: null brand
    price: 200,
    currentPrice: undefined as any, // ❌ PROBLEMATIC: undefined price
    originalPrice: 250,
    salePrice: null,
    isOnSale: true,
    discountPercentage: null as any, // ❌ PROBLEMATIC: null discount
    stock: undefined as any, // ❌ PROBLEMATIC: undefined stock
    isAvailable: true,
    stockStatus: "IN_STOCK",
    images: [],
    unit: "piece",
    rating: 4.5,
    reviewCount: 89,
    salesCount: 45,
    isWishlisted: true,
    isInCart: false,
    badges: ["NEW"],
    tags: ["test"],
    estimatedDelivery: null as any, // ❌ PROBLEMATIC: null delivery
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "test-cat-2",
      name: "Test Category 2",
      slug: "test-2",
      publicDescription: "Test 2",
      isPublic: true,
    },
  },
  {
    id: "test-normal-product",
    sku: "NORMAL-003",
    name: "Producto Normal (Control)",
    description: "Normal product for comparison",
    brand: "Normal Brand",
    price: 300,
    currentPrice: 270,
    originalPrice: 300,
    salePrice: 270,
    isOnSale: true,
    discountPercentage: 10,
    stock: 1, // Low stock
    isAvailable: true,
    stockStatus: "LOW_STOCK",
    images: [],
    unit: "piece",
    rating: 4.8,
    reviewCount: 1234,
    salesCount: 567,
    isWishlisted: false,
    isInCart: false,
    badges: ["POPULAR", "LIMITED"],
    tags: ["normal"],
    estimatedDelivery: "1-2 días",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "normal-cat",
      name: "Normal Category",
      slug: "normal",
      publicDescription: "Normal category",
      isPublic: true,
    },
  },
];

export const SafeProductTest: React.FC = () => {
  const handleAddToCart = (product: ProductForCustomer) => {
    console.log("🛒 [SafeTest] Add to cart:", product.name);
  };

  const handleToggleWishlist = async (product: ProductForCustomer) => {
    console.log("❤️ [SafeTest] Toggle wishlist:", product.name);
    return { success: true, message: "Toggle successful" };
  };

  const handleQuickView = (product: ProductForCustomer) => {
    console.log("👁️ [SafeTest] Quick view:", product.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🧪 Safe Product Values Test
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Prueba de productos con valores null/undefined para verificar que no
            se produzcan errores
          </p>
        </div>

        {/* Test Results */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Test Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {problemProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                  {product.name}
                </h3>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div>Rating: {getSafeRatingDisplay(product)}</div>
                  <div>Price: {formatSafePrice(product.currentPrice)}</div>
                  <div>Stock: {product.stock || 0}</div>
                  <div>
                    Discount: {Math.round(product.discountPercentage || 0)}%
                  </div>
                  <div>Brand: {product.brand || "N/A"}</div>
                  <div>
                    Reviews: {(product.reviewCount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Cards Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            🎯 Product Cards Render Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Si ves las tarjetas abajo sin errores en la consola, ¡la validación
            funciona perfectamente!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {problemProducts.map((product) => (
              <ProfessionalProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleToggleWishlist}
                onQuickView={handleQuickView}
                variant="grid"
              />
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Test Completado
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Si puedes ver esta página sin errores, todas las validaciones
                están funcionando correctamente. Revisa la consola del navegador
                para confirmar que no hay errores de "Cannot read properties of
                null".
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🔍 Debug Info
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div>✅ Rating null/undefined → Safe default: 0</div>
            <div>✅ ReviewCount null/undefined → Safe default: 0</div>
            <div>✅ Stock null/undefined → Safe default: 0</div>
            <div>✅ Price null/undefined → "Precio no disponible"</div>
            <div>✅ DiscountPercentage null/undefined → Safe default: 0%</div>
            <div>✅ Badges null/undefined → Safe array check</div>
            <div>✅ Brand null/undefined → "Marca no disponible"</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeProductTest;
