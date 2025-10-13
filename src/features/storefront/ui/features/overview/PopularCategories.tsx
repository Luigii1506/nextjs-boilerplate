/**
 * 🏷️ POPULAR CATEGORIES COMPONENT
 * ================================
 *
 * Component para mostrar categorías populares con grid profesional.
 * Utiliza CategoryCard para consistencia de diseño.
 *
 * @version 2.0.0 - Clean Architecture
 */

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, ArrowRight } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { PopularCategoriesProps } from "./types";

export const PopularCategories: React.FC<PopularCategoriesProps> = ({
  categories,
  onCategoryClick,
  onViewAllCategories,
  allowAnimations,
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Show only first 6 categories to avoid overcrowding
  const popularCategories = categories.slice(0, 6);

  return (
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
            Explora nuestras categorías más visitadas y encuentra exactamente lo
            que buscas
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => onCategoryClick(category)}
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
            onClick={onViewAllCategories}
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 hover:border-transparent transition-all duration-300 flex items-center space-x-3 mx-auto group shadow-lg hover:shadow-xl"
          >
            <span>Explorar Todas las Categorías</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
