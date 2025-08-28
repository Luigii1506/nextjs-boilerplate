/**
 * 🏷️ CATEGORY CARD COMPONENT
 * ===========================
 *
 * Component para mostrar tarjetas de categorías con diseño profesional.
 * Incluye imagen, nombre, descripción y contador de productos.
 *
 * @version 2.0.0 - Clean Architecture
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Package } from "lucide-react";
import { CategoryCardProps } from "./types";

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  className,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate placeholder image for category
  const placeholderImage = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop&crop=center&q=80`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700",
        "shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer customer-smooth-transform",
        "animate-customerFadeInScale overflow-hidden",
        className
      )}
    >
      {/* Category Image */}
      <div className="relative aspect-[5/3] overflow-hidden rounded-t-2xl">
        <img
          src={placeholderImage}
          alt={category.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imageLoaded ? "opacity-100" : "opacity-0",
            isHovered && "scale-110"
          )}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 customer-shimmer" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Product Count Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center space-x-1.5">
            <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {category.productCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Category Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {category.description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {(category.productCount || 0) === 1
              ? "1 producto"
              : `${category.productCount || 0} productos`}
          </span>

          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
            <span className="text-sm">Explorar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-blue-500/20 dark:group-hover:ring-blue-400/20 transition-all duration-300" />
    </div>
  );
};

export default CategoryCard;
