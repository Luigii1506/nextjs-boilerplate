/**
 * 🎭 ANIMATED HEART BUTTON SHOWCASE
 * =================================
 *
 * Demo component para mostrar todas las variantes y estados
 * del nuevo botón de corazón súper animado
 *
 * Enterprise: 2025-01-26 - Showcase component
 */

"use client";

import React from "react";
import { AnimatedHeartButton } from "../shared/AnimatedHeartButton";
import type { ProductForCustomer } from "../../types/shared";

// Mock product for demo
const mockProduct: ProductForCustomer = {
  id: "demo-product",
  sku: "DEMO-001",
  name: "Demo Product",
  description: "Beautiful animated heart button demo",
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
  reviewCount: 128,
  salesCount: 1500,
  isWishlisted: false,
  isInCart: false,
  badges: ["NEW"],
  tags: ["demo"],
  estimatedDelivery: "2-3 días",
  createdAt: new Date(),
  updatedAt: new Date(),
  category: {
    id: "demo-cat",
    name: "Demo Category",
    slug: "demo-category",
    publicDescription: "Demo category",
    isPublic: true,
  },
  brand: "Demo Brand",
};

export const AnimatedHeartShowcase: React.FC = () => {
  const handleToggle = async (product: ProductForCustomer) => {
    console.log("💖 [Showcase] Heart clicked!", product.name);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: "Demo toggle" };
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        ❤️ Animated Heart Button Showcase
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Botón de corazón súper animado estilo X.com/Instagram con partículas,
        gradientes y transiciones fluidas
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Size Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            📏 Tamaños
          </h3>
          <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Small
              </p>
              <AnimatedHeartButton
                product={mockProduct}
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
                product={mockProduct}
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
                product={mockProduct}
                onToggle={handleToggle}
                size="lg"
                variant="inline"
                showSparkles={true}
              />
            </div>
          </div>
        </div>

        {/* State Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            💫 Estados
          </h3>
          <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Not Liked
              </p>
              <AnimatedHeartButton
                product={mockProduct}
                isWishlisted={false}
                onToggle={handleToggle}
                size="md"
                variant="inline"
                showSparkles={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Liked (Animated)
              </p>
              <AnimatedHeartButton
                product={mockProduct}
                isWishlisted={true}
                onToggle={handleToggle}
                size="md"
                variant="inline"
                showSparkles={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Loading
              </p>
              <AnimatedHeartButton
                product={mockProduct}
                isLoading={true}
                onToggle={handleToggle}
                size="md"
                variant="inline"
                showSparkles={true}
              />
            </div>
          </div>
        </div>

        {/* Variant Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            🎨 Variantes
          </h3>
          <div className="space-y-4">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                Inline
              </p>
              <div className="flex justify-center">
                <AnimatedHeartButton
                  product={mockProduct}
                  onToggle={handleToggle}
                  size="md"
                  variant="inline"
                  showSparkles={true}
                />
              </div>
            </div>

            <div className="relative p-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl shadow-sm overflow-hidden">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                Overlay
              </p>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg relative">
                <AnimatedHeartButton
                  product={mockProduct}
                  onToggle={handleToggle}
                  size="sm"
                  variant="overlay"
                  showSparkles={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          ✨ Características
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❤️</span>
            <span>Animación de corazón como X.com/Instagram</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">✨</span>
            <span>Partículas de sparkles en click</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-pink-500">🎨</span>
            <span>Gradientes vibrantes</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-500">💫</span>
            <span>Transiciones fluidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-purple-500">🔄</span>
            <span>Estados de loading</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">🎯</span>
            <span>Optimistic updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">📱</span>
            <span>Responsive design</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-indigo-500">🌙</span>
            <span>Dark mode support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeartShowcase;
