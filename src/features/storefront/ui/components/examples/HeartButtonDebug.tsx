/**
 * 🔍 HEART BUTTON DEBUG COMPONENT
 * ================================
 *
 * Componente para debug visual del botón de corazón
 * Permite probar sin problemas de z-index o contenedores
 *
 * Enterprise: 2025-01-26 - Debug component
 */

"use client";

import React from "react";
import { AnimatedHeartButton } from "../shared/AnimatedHeartButton";
import type { ProductForCustomer } from "../../types/shared";

// Mock product for testing
const debugProduct: ProductForCustomer = {
  id: "debug-product-001",
  sku: "DEBUG-001",
  name: "Debug Test Product",
  description: "Product for testing heart button",
  price: 99.99,
  currentPrice: 99.99,
  originalPrice: 99.99,
  salePrice: null,
  isOnSale: false,
  discountPercentage: 0,
  stock: 10,
  isAvailable: true,
  stockStatus: "IN_STOCK",
  images: [],
  unit: "piece",
  rating: 4.5,
  reviewCount: 42,
  salesCount: 250,
  isWishlisted: false,
  isInCart: false,
  badges: ["NEW"],
  tags: ["test"],
  estimatedDelivery: "2-3 días",
  createdAt: new Date(),
  updatedAt: new Date(),
  category: {
    id: "debug-cat",
    name: "Debug Category",
    slug: "debug-category",
    publicDescription: "Debug category",
    isPublic: true,
  },
  brand: "Debug Brand",
};

export const HeartButtonDebug: React.FC = () => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async (product: ProductForCustomer) => {
    console.log("🔍 [Debug] Heart button clicked!", {
      productName: product.name,
      currentState: isWishlisted,
      willChangeTo: !isWishlisted,
    });

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsWishlisted(!isWishlisted);
    setIsLoading(false);

    return {
      success: true,
      message: `${!isWishlisted ? "Added to" : "Removed from"} wishlist`,
    };
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          🔍 Heart Button Debug
        </h1>

        {/* Debug Info */}
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Is Wishlisted:</strong>{" "}
              <span className={isWishlisted ? "text-red-500" : "text-gray-500"}>
                {isWishlisted ? "❤️ Yes" : "🤍 No"}
              </span>
            </div>
            <div>
              <strong>Is Loading:</strong>{" "}
              <span className={isLoading ? "text-blue-500" : "text-gray-500"}>
                {isLoading ? "⏳ Loading..." : "✅ Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-8">
          {/* Test 1: Isolated Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Test 1: Botón Aislado (Sin contenedores)
            </h3>
            <div className="flex justify-center">
              <AnimatedHeartButton
                product={{ ...debugProduct, isWishlisted }}
                isWishlisted={isWishlisted}
                isLoading={isLoading}
                onToggle={handleToggle}
                size="md"
                variant="inline"
                showSparkles={true}
              />
            </div>
          </div>

          {/* Test 2: Card Simulation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Test 2: Simulación de Tarjeta de Producto
            </h3>
            <div className="relative group bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64">
              <div className="absolute top-2 right-2 z-50">
                <AnimatedHeartButton
                  product={{ ...debugProduct, isWishlisted }}
                  isWishlisted={isWishlisted}
                  isLoading={isLoading}
                  onToggle={handleToggle}
                  size="sm"
                  variant="inline"
                  showSparkles={true}
                />
              </div>
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm">Mock Product Image</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test 3: All Sizes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Test 3: Todos los Tamaños
            </h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Small
                </p>
                <AnimatedHeartButton
                  product={{ ...debugProduct, isWishlisted }}
                  isWishlisted={isWishlisted}
                  isLoading={isLoading}
                  onToggle={handleToggle}
                  size="sm"
                  variant="inline"
                  showSparkles={true}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Medium
                </p>
                <AnimatedHeartButton
                  product={{ ...debugProduct, isWishlisted }}
                  isWishlisted={isWishlisted}
                  isLoading={isLoading}
                  onToggle={handleToggle}
                  size="md"
                  variant="inline"
                  showSparkles={true}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Large
                </p>
                <AnimatedHeartButton
                  product={{ ...debugProduct, isWishlisted }}
                  isWishlisted={isWishlisted}
                  isLoading={isLoading}
                  onToggle={handleToggle}
                  size="lg"
                  variant="inline"
                  showSparkles={true}
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              📝 Instrucciones de Debug
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li>Haz clic en cualquier botón de corazón</li>
              <li>Observa las animaciones y partículas</li>
              <li>Verifica que el estado cambie correctamente</li>
              <li>Confirma que no hay problemas de z-index</li>
              <li>Revisa los logs en la consola del navegador</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartButtonDebug;
