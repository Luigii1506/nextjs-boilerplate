/**
 * 🔄 WISHLIST SYNC TEST COMPONENT
 * ===============================
 *
 * Componente para probar y demostrar que la sincronización
 * de wishlist funciona correctamente entre pestañas
 *
 * Enterprise: 2025-01-26 - Wishlist sync testing
 */

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/shared/utils";
import { Heart, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useStorefrontContext } from "../../../context";
import { ProfessionalProductCard } from "../shared/ProfessionalProductCard";

export const WishlistSyncTest: React.FC = () => {
  const {
    products,
    featuredProducts,
    wishlist,
    toggleWishlist,
    isAuthenticated,
    openLoginModal,
  } = useStorefrontContext();

  const [testResults, setTestResults] = useState<{
    productTab: ProductForCustomer[];
    overviewTab: ProductForCustomer[];
    wishlistTab: WishlistItem[];
    lastUpdate: Date;
  } | null>(null);

  const [isRunningTest, setIsRunningTest] = useState(false);

  // Get first few products for testing
  const testProducts = products.slice(0, 3);
  const testFeaturedProducts = featuredProducts.slice(0, 3);

  const runSyncTest = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setIsRunningTest(true);

    try {
      // Capture current state
      setTestResults({
        productTab: [...testProducts],
        overviewTab: [...testFeaturedProducts],
        wishlistTab: [...wishlist],
        lastUpdate: new Date(),
      });

      console.log("🧪 [WishlistSyncTest] Test completed - data captured");
    } catch (error) {
      console.error("❌ [WishlistSyncTest] Test failed:", error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleWishlistToggle = async (product: ProductForCustomer) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    console.log("🔄 [WishlistSyncTest] Toggling wishlist for:", product.name);
    const result = await toggleWishlist(product);

    if (result.success) {
      // Auto-refresh test results after toggle
      setTimeout(() => runSyncTest(), 500);
    }
  };

  // Auto-update test results when data changes
  useEffect(() => {
    if (testResults) {
      setTimeout(() => runSyncTest(), 100);
    }
  }, [products.length, featuredProducts.length, wishlist.length]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Iniciar Sesión Requerido
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Para probar la sincronización de wishlist, necesitas estar
              autenticado.
            </p>
            <button
              onClick={openLoginModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔄 Wishlist Sync Test
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Prueba la sincronización de wishlist entre las pestañas Overview,
            Products y Wishlist. Los cambios deberían reflejarse inmediatamente
            en todas las pestañas.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Test de Sincronización
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Haz clic en los corazones para probar la sincronización
              </p>
            </div>
            <button
              onClick={runSyncTest}
              disabled={isRunningTest}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors",
                isRunningTest
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <RefreshCw
                className={cn("w-4 h-4", isRunningTest && "animate-spin")}
              />
              <span>{isRunningTest ? "Ejecutando..." : "Ejecutar Test"}</span>
            </button>
          </div>
        </div>

        {/* Test Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Products Tab Simulation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Products Tab
            </h3>
            <div className="space-y-4">
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        product.isWishlisted
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4",
                          product.isWishlisted && "fill-current"
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overview Tab Simulation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Overview Tab (Featured)
            </h3>
            <div className="space-y-4">
              {testFeaturedProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        product.isWishlisted
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4",
                          product.isWishlisted && "fill-current"
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wishlist Tab Simulation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Wishlist Tab
            </h3>
            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No hay productos en wishlist
                </p>
              ) : (
                wishlist.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          Product ID: {item.productId}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Added: {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-full bg-red-100 text-red-600">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Resultados del Test de Sincronización
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Products Tab
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {testResults.productTab.filter((p) => p.isWishlisted).length}{" "}
                  de {testResults.productTab.length} en wishlist
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Overview Tab
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {testResults.overviewTab.filter((p) => p.isWishlisted).length}{" "}
                  de {testResults.overviewTab.length} en wishlist
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                  Wishlist Tab
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {testResults.wishlistTab.length} productos totales
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Última actualización:{" "}
              {testResults.lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Cómo Probar la Sincronización
              </h3>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                <li>
                  • <strong>Paso 1:</strong> Haz clic en un corazón para
                  agregar/quitar de wishlist
                </li>
                <li>
                  • <strong>Paso 2:</strong> Observa que el cambio se refleja en
                  las 3 pestañas simuladas
                </li>
                <li>
                  • <strong>Paso 3:</strong> Ve a las pestañas reales del
                  storefront para confirmar
                </li>
                <li>
                  • <strong>Resultado esperado:</strong> Todos los productos
                  deben mostrar el mismo estado de wishlist
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistSyncTest;
