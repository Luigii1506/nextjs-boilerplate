/**
 * 🏆 PROFESSIONAL CARDS DEMO
 * ==========================
 *
 * Demo completo de las nuevas tarjetas profesionales
 * Muestra todos los estados, variantes y casos de uso
 *
 * Enterprise: 2025-01-26 - Professional cards showcase
 */

"use client";

import React, { useState } from "react";
import { ProfessionalProductCard } from "../shared/ProfessionalProductCard";
import type { ProductForCustomer } from "../../types/shared";
import { cn } from "@/shared/utils";

// Mock products with different states
const demoProducts: ProductForCustomer[] = [
  {
    id: "product-1",
    sku: "PRO-001",
    name: "iPhone 15 Pro Max",
    description: "El iPhone más avanzado con tecnología Pro",
    brand: "Apple",
    price: 29999,
    currentPrice: 29999,
    originalPrice: 29999,
    salePrice: null,
    isOnSale: false,
    discountPercentage: 0,
    stock: 10,
    isAvailable: true,
    stockStatus: "IN_STOCK",
    images: [],
    unit: "piece",
    rating: 4.9,
    reviewCount: 2847,
    salesCount: 15420,
    isWishlisted: false,
    isInCart: false,
    badges: ["NEW", "POPULAR"],
    tags: ["smartphone", "premium"],
    estimatedDelivery: "1-2 días",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "electronics",
      name: "Electrónicos",
      slug: "electronics",
      publicDescription: "Dispositivos electrónicos",
      isPublic: true,
    },
  },
  {
    id: "product-2",
    sku: "PRO-002",
    name: "MacBook Pro 16'' M3 Pro",
    description: "Laptop profesional con chip M3 Pro",
    brand: "Apple",
    price: 45999,
    currentPrice: 41399,
    originalPrice: 45999,
    salePrice: 41399,
    isOnSale: true,
    discountPercentage: 10,
    stock: 2,
    isAvailable: true,
    stockStatus: "LOW_STOCK",
    images: [],
    unit: "piece",
    rating: 4.8,
    reviewCount: 1256,
    salesCount: 3420,
    isWishlisted: true,
    isInCart: false,
    badges: ["LIMITED"],
    tags: ["laptop", "professional"],
    estimatedDelivery: "2-3 días",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "computers",
      name: "Computadoras",
      slug: "computers",
      publicDescription: "Computadoras y laptops",
      isPublic: true,
    },
  },
  {
    id: "product-3",
    sku: "PRO-003",
    name: "Sony WH-1000XM5",
    description: "Audífonos con cancelación de ruido premium",
    brand: "Sony",
    price: 7999,
    currentPrice: 5999,
    originalPrice: 7999,
    salePrice: 5999,
    isOnSale: true,
    discountPercentage: 25,
    stock: 0,
    isAvailable: false,
    stockStatus: "OUT_OF_STOCK",
    images: [],
    unit: "piece",
    rating: 4.7,
    reviewCount: 892,
    salesCount: 2156,
    isWishlisted: false,
    isInCart: false,
    badges: [],
    tags: ["audio", "headphones"],
    estimatedDelivery: "Sin stock",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "audio",
      name: "Audio",
      slug: "audio",
      publicDescription: "Productos de audio",
      isPublic: true,
    },
  },
  {
    id: "product-4",
    sku: "PRO-004",
    name: "Tesla Model Y Performance",
    description: "SUV eléctrico de alto rendimiento",
    brand: "Tesla",
    price: 1299000,
    currentPrice: 1299000,
    originalPrice: 1299000,
    salePrice: null,
    isOnSale: false,
    discountPercentage: 0,
    stock: 5,
    isAvailable: true,
    stockStatus: "IN_STOCK",
    images: [],
    unit: "piece",
    rating: 4.6,
    reviewCount: 156,
    salesCount: 89,
    isWishlisted: true,
    isInCart: false,
    badges: ["NEW"],
    tags: ["electric", "suv"],
    estimatedDelivery: "4-6 semanas",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "vehicles",
      name: "Vehículos",
      slug: "vehicles",
      publicDescription: "Vehículos eléctricos",
      isPublic: true,
    },
  },
];

export const ProfessionalCardsDemo: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [wishlistStates, setWishlistStates] = useState<Record<string, boolean>>(
    demoProducts.reduce(
      (acc, product) => ({
        ...acc,
        [product.id]: product.isWishlisted,
      }),
      {}
    )
  );

  const handleAddToCart = (product: ProductForCustomer) => {
    console.log("🛒 Adding to cart:", product.name);
    setLoadingStates((prev) => ({ ...prev, [product.id]: true }));

    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleToggleWishlist = async (product: ProductForCustomer) => {
    console.log("❤️ Toggle wishlist:", product.name);

    const newState = !wishlistStates[product.id];
    setWishlistStates((prev) => ({ ...prev, [product.id]: newState }));

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: `${newState ? "Added to" : "Removed from"} wishlist`,
    };
  };

  const handleQuickView = (product: ProductForCustomer) => {
    console.log("👁️ Quick view:", product.name);
    alert(`Quick view: ${product.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🏆 Professional Product Cards
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tarjetas de producto de nivel profesional con diseño moderno,
            animaciones fluidas y funcionalidad completa estilo Amazon/Shopify
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Diseño Profesional
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Diseño limpio y moderno inspirado en las mejores tiendas online
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Animaciones Fluidas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transiciones suaves y efectos hover que mejoran la UX
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">❤️</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Botón Animado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Botón de wishlist súper animado con partículas y efectos
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Responsive
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Diseño adaptable para móvil, tablet y desktop
            </p>
          </div>
        </div>

        {/* Grid View */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Vista de Cuadrícula (Grid)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {demoProducts.map((product, index) => (
              <ProfessionalProductCard
                key={product.id}
                product={{
                  ...product,
                  isWishlisted: wishlistStates[product.id] || false,
                }}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleToggleWishlist}
                onQuickView={handleQuickView}
                isAddingToCart={loadingStates[product.id] || false}
                variant="grid"
                className={cn(
                  "animate-fadeInScale",
                  `animate-stagger-${(index % 4) + 1}`
                )}
              />
            ))}
          </div>
        </div>

        {/* List View */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Vista de Lista (List)
          </h2>
          <div className="space-y-6 max-w-4xl">
            {demoProducts.slice(0, 2).map((product, index) => (
              <ProfessionalProductCard
                key={`list-${product.id}`}
                product={{
                  ...product,
                  isWishlisted: wishlistStates[product.id] || false,
                }}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleToggleWishlist}
                onQuickView={handleQuickView}
                isAddingToCart={loadingStates[product.id] || false}
                variant="list"
                className={cn(
                  "animate-slideInUp",
                  `animate-stagger-${index + 1}`
                )}
              />
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Responsive Design</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">60fps</div>
              <div className="text-blue-100">Animaciones Fluidas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-blue-100">UX Rating</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📝 Instrucciones de Prueba
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Haz hover sobre las tarjetas para ver las animaciones</li>
            <li>Presiona el corazón ❤️ para agregar/quitar de wishlist</li>
            <li>
              Haz clic en "Agregar al carrito" para ver el estado de loading
            </li>
            <li>Presiona "Vista rápida" en las tarjetas grid</li>
            <li>Observa diferentes estados: stock bajo, agotado, ofertas</li>
            <li>Prueba en diferentes tamaños de pantalla</li>
            <li>Revisa los logs en la consola del navegador</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCardsDemo;
