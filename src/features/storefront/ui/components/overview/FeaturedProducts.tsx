/**
 * 🌟 FEATURED PRODUCTS COMPONENT
 * ==============================
 *
 * Component para mostrar productos destacados con grid profesional.
 * Utiliza ProfessionalProductCard para consistencia de diseño.
 *
 * @version 2.0.0 - Clean Architecture
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProfessionalProductCard } from "@/features/storefront/ui/components/shared/ProfessionalProductCard";
import { FeaturedProductsProps } from "./types";

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onViewAllProducts,
  allowAnimations,
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-16">
      <div
        className={cn(
          "space-y-12",
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
            Los productos más populares y mejor valorados por nuestros clientes
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProfessionalProductCard
              key={product.id}
              product={product}
              onAddToCart={() => onAddToCart(product)}
              onAddToWishlist={onAddToWishlist}
              onQuickView={() => onQuickView(product)}
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
            onClick={onViewAllProducts}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 flex items-center space-x-3 mx-auto group shadow-xl hover:shadow-2xl"
          >
            <span>Ver Todos los Productos</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
