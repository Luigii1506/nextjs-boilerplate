/**
 * 🏪 OVERVIEW TAB - STOREFRONT
 * ============================
 *
 * Tab principal del storefront con productos destacados y estadísticas
 * Customer-focused con animaciones optimizadas y UX fluida
 *
 * Created: 2025-01-17 - Storefront Overview Tab
 */

"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Package,
  Grid3X3,
  TrendingUp,
  Star,
  Heart,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { AnimatedHeartButton } from "../shared/AnimatedHeartButton";
import { ProfessionalProductCard } from "../shared/ProfessionalProductCard";
import { OverviewPageSkeleton } from "../shared/ProductSkeleton";
import { cn } from "@/shared/utils";
import { useStorefrontContext } from "../../../context";
import { PriceDisplay } from "../shared";
import type { ProductForCustomer, CategoryForCustomer } from "../../../types";
import { PRODUCT_BADGES, AVAILABILITY_STATUS } from "../../../constants";

// 🎯 Product Card Component for Customers
interface CustomerProductCardProps {
  product: ProductForCustomer;
  onAddToCart?: (product: ProductForCustomer) => void;
  onAddToWishlist?: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  onQuickView?: (product: ProductForCustomer) => void;
  className?: string;
}

const CustomerProductCard: React.FC<CustomerProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  className,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate placeholder image
  const placeholderImage = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center&q=80`;

  const availabilityStatus = product.isAvailable
    ? product.stock <= 2
      ? AVAILABILITY_STATUS.LOW_STOCK
      : AVAILABILITY_STATUS.IN_STOCK
    : AVAILABILITY_STATUS.OUT_OF_STOCK;

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-lg transition-all duration-300 customer-smooth-transform",
        "animate-customerFadeInScale",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] rounded-t-xl">
        <img
          src={placeholderImage}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 rounded-t-xl overflow-hidden",
            imageLoaded ? "opacity-100" : "opacity-0",
            isHovered && "scale-110"
          )}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 customer-shimmer" />
        )}

        {/* Product Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {(product.badges || []).map((badge) => {
            const badgeStyle =
              PRODUCT_BADGES[
                badge.toUpperCase() as keyof typeof PRODUCT_BADGES
              ];
            return (
              <span
                key={badge}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  badgeStyle?.bgColor,
                  badgeStyle?.textColor,
                  badge.toLowerCase() === "on_sale" && "animate-saleBadgePulse"
                )}
              >
                {badgeStyle?.label || badge}
              </span>
            );
          })}
        </div>

        {/* Quick Actions on Hover */}
        <div
          className={cn(
            "absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-300 z-50",
            isHovered || product.isWishlisted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          )}
        >
          {/* Animated Wishlist Button */}
          <AnimatedHeartButton
            product={product}
            isWishlisted={product.isWishlisted}
            isLoading={false}
            onToggle={onAddToWishlist}
            size="sm"
            variant="inline"
            showSparkles={true}
          />

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 
                     hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition-all duration-200"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Availability Overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {product.category?.name}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <PriceDisplay
            price={product.price}
            salePrice={product.salePrice}
            size="md"
            showOriginal={true}
          />
        </div>

        {/* Availability Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                availabilityStatus.textColor.replace("text-", "bg-")
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                availabilityStatus.textColor
              )}
            >
              {availabilityStatus.label}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.estimatedDelivery}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          disabled={!product.isAvailable}
          className={cn(
            "w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2",
            product.isAvailable
              ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] active:scale-[0.98] animate-addToCartPulse"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.isInCart ? "En Carrito" : "Agregar"}</span>
        </button>
      </div>
    </div>
  );
};

// 🏷️ Category Card Component
interface CategoryCardProps {
  category: CategoryForCustomer;
  onClick?: (category: CategoryForCustomer) => void;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  className,
}) => {
  const placeholderImage = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&q=80`;

  return (
    <div
      onClick={() => onClick?.(category)}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer animate-customerFadeInUp",
        "hover:scale-[1.02] customer-smooth-transform",
        className
      )}
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-t-xl">
        <img
          src={placeholderImage}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg mb-1">
            {category.name}
          </h3>
          <p className="text-white/80 text-sm">
            {category.productCount} productos
          </p>
        </div>

        {/* Popular Badge */}
        {category.isPopular && (
          <div className="absolute top-3 right-3">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Popular</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎯 MAIN OVERVIEW TAB COMPONENT
const OverviewTab: React.FC = () => {
  const {
    featuredProducts,
    popularCategories,
    stats,
    isLoading,
    isError,
    error,
    addToCartOptimistic,
    toggleWishlist,
    openProductQuickView,
    setActiveTab,
  } = useStorefrontContext();

  // 🎯 Anti-flicker pattern (exactly like inventory module)
  const isFirstRender = useRef(true);
  const [allowAnimations, setAllowAnimations] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const timer = setTimeout(() => {
        setAllowAnimations(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return <OverviewPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 mb-2">
              ⚠️ Error al cargar los datos
            </div>
            <p className="text-red-800 dark:text-red-300 text-sm">
              {error?.message || "Ha ocurrido un error inesperado"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        {/* Professional Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div
                className={cn(
                  "space-y-6",
                  allowAnimations && "animate-customerFadeInUp"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium uppercase tracking-wide">
                      Tienda Online 24/7
                    </span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                    Encuentra Todo Lo Que
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                      {" "}
                      Necesitas
                    </span>
                  </h1>
                  <p className="text-xl text-slate-300 max-w-lg">
                    Descubre {stats?.totalProducts || 0} productos de calidad
                    con envío gratis, garantía y el mejor servicio al cliente.
                  </p>
                </div>

                {/* Hero Stats */}
                <div className="flex flex-wrap items-center gap-6 py-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stats?.totalProducts || 0}+
                    </div>
                    <div className="text-sm text-slate-400">Productos</div>
                  </div>
                  <div className="w-px h-8 bg-slate-700"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stats?.onSaleCount || 0}
                    </div>
                    <div className="text-sm text-slate-400">En Oferta</div>
                  </div>
                  <div className="w-px h-8 bg-slate-700"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stats?.avgRating || "4.2"} ⭐
                    </div>
                    <div className="text-sm text-slate-400">Rating</div>
                  </div>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveTab("products")}
                    className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-300 flex items-center justify-center space-x-3 group shadow-xl"
                  >
                    <Package className="w-5 h-5" />
                    <span>Explorar Productos</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setActiveTab("categories")}
                    className="border-2 border-slate-300 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <Grid3X3 className="w-5 h-5" />
                    <span>Ver Categorías</span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-sm">Envío Gratis +$999</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-sm">Garantía de Calidad</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-sm">Soporte 24/7</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual */}
              <div
                className={cn(
                  "relative",
                  allowAnimations &&
                    "animate-customerFadeInScale customer-stagger-1"
                )}
              >
                <div className="relative">
                  {/* Main product showcase */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 to-purple-900 rounded-xl mb-4 flex items-center justify-center">
                      <Package className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Producto Destacado
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        $999
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        -25%
                      </span>
                    </div>
                  </div>

                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg animate-bounce">
                    ¡Nuevo!
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-red-500 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg">
                    🔥 Hot Sale
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-12">
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-3 gap-8",
              allowAnimations && "animate-customerFadeInUp customer-stagger-1"
            )}
          >
            {/* Free Shipping */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.15 8a2 2 0 0 0-1.72-1H15V5a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h.67a3 3 0 0 0 5.66 0h3.34a3 3 0 0 0 5.66 0H21a1 1 0 0 0 1-1v-5a1.07 1.07 0 0 0-.14-.52zM7 19a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm10 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Envío Gratis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                En pedidos mayores a $999 pesos
              </p>
            </div>

            {/* Quality Guarantee */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Garantía de Calidad
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Productos verificados y garantizados
              </p>
            </div>

            {/* Customer Support */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3a4 4 0 0 1 4 4c0 .73-.19 1.41-.54 2.01L21 15v1a1 1 0 0 1-1 1h-3v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1H4a1 1 0 0 1-1-1v-1l5.54-5.99A3.97 3.97 0 0 1 8 7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2c0 .75.4 1.38 1 1.72V15h2V8.72c.6-.34 1-.97 1-1.72a2 2 0 0 0-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Soporte 24/7
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Atención al cliente siempre disponible
              </p>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-16">
          <div
            className={cn(
              "space-y-8",
              allowAnimations && "animate-customerFadeInUp customer-stagger-2"
            )}
          >
            {/* Section Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Productos Destacados
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Los productos más populares y mejor valorados por nuestros
                clientes
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {(featuredProducts || []).map((product, index) => (
                <ProfessionalProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(product) => addToCartOptimistic(product, 1)}
                  onAddToWishlist={(product) => toggleWishlist(product)}
                  onQuickView={(product) => openProductQuickView(product)}
                  variant="grid"
                  className={cn(
                    "transform-gpu will-change-transform",
                    allowAnimations && `customer-stagger-${(index % 5) + 1}`
                  )}
                />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => setActiveTab("products")}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 flex items-center space-x-3 mx-auto group shadow-xl"
              >
                <span>Ver Todos los Productos</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-16">
          <div
            className={cn(
              "space-y-8",
              allowAnimations && "animate-customerFadeInUp customer-stagger-3"
            )}
          >
            {/* Section Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Categorías Populares
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explora nuestras categorías más visitadas y encuentra
                exactamente lo que buscas
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(popularCategories || []).map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={(category) => {
                    // TODO: Set category filter and switch to products tab
                    setActiveTab("products");
                  }}
                  className={cn(
                    "group hover:shadow-2xl transition-all duration-500",
                    allowAnimations && `customer-stagger-${(index % 4) + 1}`
                  )}
                />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => setActiveTab("categories")}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 hover:border-transparent transition-all duration-300 flex items-center space-x-3 mx-auto group"
              >
                <span>Explorar Todas las Categorías</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OverviewTab;
