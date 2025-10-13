/**
 * 🛒 STOREFRONT HEADER
 * ====================
 *
 * Professional e-commerce header with search, cart, and account
 */

"use client";

import React from "react";
import {
  Home,
  Package,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useAuth } from "@/shared/hooks/useAuth";
import { useStorefrontUI } from "../../../context";
import { useCartContext } from "@/features/storefront/cart";
import { CartBadge } from "../../features/cart";

interface StorefrontHeaderProps {
  scrollY: number;
  isPastThreshold: boolean;
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  scrollY,
  isPastThreshold,
}) => {
  const { globalSearchTerm, setGlobalSearchTerm, setActiveTab } =
    useStorefrontUI();
  const { user: authUser, isAuthenticated } = useAuth();
  const { summary, isLoading: isCartLoading } = useCartContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const itemCount = summary?.itemCount || 0;
  const totalAmount = summary?.total || 0;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const handleLogin = () => {
    setActiveTab("account");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700",
        "transform-gpu transition-all duration-300",
        isPastThreshold &&
          "shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
      )}
      style={{
        transform: `translateY(${
          scrollY > 0 ? Math.min(scrollY * 0.05, 5) : 0
        }px)`,
      }}
    >
      {/* Top Navigation Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-8 text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-400">
                📦 Envío gratis en pedidos +$999
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                🔥 12 productos en oferta
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-400">
                🌟 +150 productos disponibles
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ⭐ Rating promedio: 4.8
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú principal"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  ShopPro
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Tu tienda de confianza
                </p>
              </div>
            </div>
          </div>

          {/* Search Section - Center */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos, marcas o categorías..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 shadow-sm"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Buscar
              </button>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-2">
            {/* Search Button (Mobile) */}
            <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Account */}
            <button
              onClick={
                isAuthenticated ? () => setActiveTab("account") : handleLogin
              }
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {isAuthenticated && authUser ? (
                  <span className="text-sm font-semibold text-white">
                    {authUser.name?.[0] || authUser.email?.[0]?.toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 -mt-0.5">
                  {isAuthenticated && authUser
                    ? authUser.name || authUser.email
                    : "Cuenta"}
                </div>
              </div>
            </button>

            {/* Cart */}
            <button
              onClick={() => setActiveTab("cart")}
              className="relative flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <CartBadge
                itemCount={itemCount}
                formattedTotal={formatPrice(totalAmount)}
                showIcon={true}
                showAmount={false}
                size="md"
                variant="primary"
                animate={true}
                isLoading={isCartLoading}
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Carrito
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 -mt-0.5">
                  {itemCount} items
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Development Indicator */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-1 right-1 z-50">
          <div className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded opacity-75 hover:opacity-100 transition-opacity">
            STOREFRONT LIVE ⚡
          </div>
        </div>
      )}
    </header>
  );
};
