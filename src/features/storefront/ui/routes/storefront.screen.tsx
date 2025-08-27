/**
 * 🛒 STOREFRONT SPA SCREEN
 * ========================
 *
 * Single Page Application completa para Storefront Customer-Facing
 * Navegación por tabs internos con estado compartido y transiciones smooth
 * Diseñado específicamente para experiencia de usuario/cliente
 *
 * Created: 2025-01-17 - Storefront SPA Implementation
 */

"use client";

// Import custom animations
import "../styles/animations.css";

import React, { useMemo } from "react";
import {
  Home,
  Package,
  Grid3X3,
  Heart,
  User,
  HelpCircle,
  Search,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../../../shared/utils";
import {
  StorefrontProvider,
  useStorefrontContext,
  STOREFRONT_TABS,
  type TabId,
} from "../../context";
// import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { useScrollHeader } from "../../../../shared/hooks";
import {
  OverviewTab,
  ProductsTab,
  CategoriesTab,
  WishlistTab,
  AccountTab,
  SupportTab,
} from "../components";
import { WishlistDebugPanel } from "../components/debug/WishlistDebugPanel";

// 🎨 Icon mapping for tabs
const ICON_MAP = {
  Home,
  Package,
  Grid3X3,
  Heart,
  User,
  HelpCircle,
} as const;

// 🛒 Professional E-commerce Header (Amazon/eBay inspired)
interface CustomerHeaderProps {
  isHeaderVisible: boolean;
  scrollY: number;
  isPastThreshold: boolean;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  isHeaderVisible,
  scrollY,
  isPastThreshold,
}) => {
  const {
    globalSearchTerm,
    setGlobalSearchTerm,
    cartItemsCount,
    showCartPreview,
    openLoginModal,
    customer,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    stats,
    setActiveTab,
  } = useStorefrontContext();

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
                🔥 {stats?.onSaleCount || 0} productos en oferta
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-400">
                🌟 {stats?.totalProducts || 0} productos disponibles
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ⭐ Rating promedio: {stats?.avgRating || "4.2"}
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
                customer ? () => setActiveTab("account") : openLoginModal
              }
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {customer ? (
                  <span className="text-sm font-semibold text-white">
                    {customer.firstName?.[0]}
                    {customer.lastName?.[0]}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {customer ? "Mi cuenta" : "Iniciar sesión"}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 -mt-0.5">
                  {customer ? customer.firstName : "Cuenta"}
                </div>
              </div>
            </button>

            {/* Cart */}
            <button
              onClick={showCartPreview}
              className="relative flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Carrito
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 -mt-0.5">
                  {cartItemsCount} items
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

// 🛒 Professional E-commerce Navigation
const CustomerTabNavigation: React.FC = () => {
  const { activeTab, setActiveTab, wishlistCount, cartItemsCount, stats } =
    useStorefrontContext();

  // Calculate notification counts for each tab
  const notificationCounts = useMemo(
    () => ({
      overview:
        stats?.newArrivalsCount && stats.newArrivalsCount > 0
          ? stats.newArrivalsCount
          : 0,
      products: 0,
      categories: 0,
      wishlist: wishlistCount || 0,
      account: 0,
      support: 0,
    }),
    [stats, wishlistCount]
  );

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {STOREFRONT_TABS.map((tab) => {
            const IconComponent =
              ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Package;
            const isActive = activeTab === tab.id;
            const notificationCount =
              notificationCounts[tab.id as keyof typeof notificationCounts];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  "relative flex items-center justify-center space-x-2 px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                    : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-4 h-4",
                    isActive && "text-blue-600 dark:text-blue-400"
                  )}
                />
                <span>{tab.label}</span>

                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// 🎯 TRUE SPA TAB CONTENT - TODOS LOS TABS MONTADOS (OBLIGATORIO)
const TabContent: React.FC = () => {
  const { activeTab, isTabChanging } = useStorefrontContext();

  // 🚨 PATRÓN SPA OBLIGATORIO: Renderizar TODOS los tabs pero solo mostrar el activo
  // Esto previene unmounting/remounting que causaba el comportamiento de "refresh"
  return (
    <div className="relative min-h-screen">
      {/* Tab transition overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 pointer-events-none transition-opacity duration-150",
          isTabChanging ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Overview Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "overview"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "overview" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <OverviewTab />
      </div>

      {/* Products Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "products"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "products" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <ProductsTab />
      </div>

      {/* Categories Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "categories"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "categories" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <CategoriesTab />
      </div>

      {/* Wishlist Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "wishlist"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "wishlist" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <WishlistTab />
      </div>

      {/* Account Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "account"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "account" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <AccountTab />
      </div>

      {/* Support Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "support"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "support" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <SupportTab />
      </div>
    </div>
  );
};

// 🎯 Main SPA Component (without Provider)
const StorefrontSPAContent: React.FC = () => {
  // ✨ Enhanced Scroll Detection Hook (customer-optimized)
  const { scrollY, isHeaderVisible, isPastThreshold } = useScrollHeader({
    threshold: 20, // Slightly higher for customer experience
    wheelSensitivity: 0.6, // More sensitive
    useWheelFallback: true,
    debug: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 customer-scrollbar">
      {/* Professional Header */}
      <CustomerHeader
        isHeaderVisible={isHeaderVisible}
        scrollY={scrollY}
        isPastThreshold={isPastThreshold}
      />

      {/* Professional Navigation */}
      <CustomerTabNavigation />

      {/* Main E-commerce Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <TabContent />
      </main>

      {/* Professional Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Footer Top */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  ShopPro
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                Tu tienda de confianza con los mejores productos y el mejor
                servicio. Compra seguro, recibe rápido.
              </p>
              <div className="flex space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  📧 hola@shoppro.com
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  📞 +52 55 1234 5678
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Enlaces Rápidos
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Políticas de Envío
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Devoluciones
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Términos y Condiciones
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Atención al Cliente
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Seguir Pedido
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Programa de Lealtad
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 ShopPro. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tienda Online 24/7
                  </span>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                    STOREFRONT SPA v2.0 ⚡
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 🔍 DEBUG PANEL - Only in development */}
      {process.env.NODE_ENV === "development" && <WishlistDebugPanel />}
    </div>
  );
};

// 🎯 Main Exported Component (with Provider) - OBLIGATORIO
interface StorefrontScreenProps {
  className?: string;
}

const StorefrontScreen: React.FC<StorefrontScreenProps> = ({ className }) => {
  return (
    <div className={cn("w-full", className)}>
      <StorefrontProvider>
        <StorefrontSPAContent />
      </StorefrontProvider>
    </div>
  );
};

export default StorefrontScreen;
