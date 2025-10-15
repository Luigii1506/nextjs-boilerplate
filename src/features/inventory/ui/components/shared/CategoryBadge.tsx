/**
 * 🏷️ CATEGORY BADGE COMPONENT
 * ============================
 *
 * Badge reutilizable para mostrar categorías de productos
 * React 19 optimizado con dark mode y theming dinámico
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import React, { memo } from "react";
import { Tag, Package } from "lucide-react";
import { cn } from "@/shared/utils";
import { INVENTORY_UI } from "../../../constants";
import type { CategoryBadgeProps, Category } from "../../../types";

// 🎨 Helper to get icon component
function getCategoryIcon(iconName?: string | null) {
  // In a real implementation, you'd have a mapping of icon names to components
  // For now, we'll use a fallback
  switch (iconName) {
    case "Smartphone":
    case "Phone":
      return "📱";
    case "Shirt":
    case "Clothes":
      return "👕";
    case "Home":
    case "House":
      return "🏠";
    case "Trophy":
    case "Sports":
      return "🏆";
    case "Package":
    default:
      return "📦";
  }
}

// 🌈 Helper to get contrasting text color for background
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

// 🎨 Generate fallback color based on category name
function getFallbackColor(categoryName: string): string {
  const colors = INVENTORY_UI.FALLBACK_COLORS;
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

// 🎯 Main component
const CategoryBadge: React.FC<CategoryBadgeProps> = memo(
  ({
    category,
    size = "md",
    showIcon = true,
    clickable = false,
    onClick,
    className,
  }) => {
    // 🎨 Color calculations
    const categoryColor = category.color || getFallbackColor(category.name);
    const textColor = getContrastColor(categoryColor);
    const categoryIcon = getCategoryIcon(category.icon);

    // 📐 Size configurations
    const sizeClasses = {
      sm: {
        container: "px-2 py-1 text-xs",
        icon: "text-xs",
        spacing: "space-x-1",
      },
      md: {
        container: "px-3 py-1.5 text-sm",
        icon: "text-sm",
        spacing: "space-x-1.5",
      },
      lg: {
        container: "px-4 py-2 text-base",
        icon: "text-base",
        spacing: "space-x-2",
      },
    } as const;

    const sizes = sizeClasses[size];

    // 🎯 Click handler
    const handleClick = () => {
      if (clickable && onClick) {
        onClick(category);
      }
    };

    return (
      <span
        className={cn(
          // Base styles
          "inline-flex items-center font-medium rounded-full border transition-all duration-200",
          sizes.container,
          sizes.spacing,

          // Text color - better contrast in dark mode
          "text-gray-700 dark:text-gray-200",

          // Background and border
          "bg-gray-100 dark:bg-gray-700/50",
          "border-gray-300 dark:border-gray-600",

          // Interactive states
          clickable && [
            "cursor-pointer select-none",
            "hover:scale-105 hover:shadow-md hover:bg-gray-200 dark:hover:bg-gray-700",
            "active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "dark:focus:ring-offset-gray-800",
          ],

          // Disabled state
          !category.isActive && [
            "opacity-60",
            clickable && "cursor-not-allowed hover:scale-100",
          ],

          className
        )}
        onClick={clickable ? handleClick : undefined}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
      >
        {/* 🎨 Icon */}
        {showIcon && (
          <span className={cn("flex-shrink-0", sizes.icon)} aria-hidden="true">
            {categoryIcon}
          </span>
        )}

        {/* 📝 Category name */}
        <span className="truncate font-medium">{category.name}</span>

        {/* 📊 Product count (if available) */}
        {category._count?.products !== undefined && (
          <span
            className={cn(
              "ml-1 px-1.5 py-0.5 font-bold rounded-full",
              "bg-gray-200 dark:bg-gray-600",
              "text-gray-700 dark:text-gray-200",
              size === "sm" ? "text-[10px]" : "text-xs"
            )}
          >
            {category._count.products}
          </span>
        )}
      </span>
    );
  }
);

CategoryBadge.displayName = "CategoryBadge";

export default CategoryBadge;
