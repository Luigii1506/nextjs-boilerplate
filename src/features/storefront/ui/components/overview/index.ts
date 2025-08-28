/**
 * 🛒 OVERVIEW COMPONENTS - BARREL EXPORTS
 * ========================================
 *
 * Exportaciones centralizadas para todos los componentes del OverviewTab.
 * Facilita las importaciones y mantiene la organización modular.
 *
 * @version 3.0.0 - Feature-First Architecture
 */

// 🎯 Main Tab Component
export { default as OverviewTab } from "./OverviewTab";

// 🧩 Sub-components
export { default as HeroSection } from "./HeroSection";
export { default as FeaturedProducts } from "./FeaturedProducts";
export { default as CategoryCard } from "./CategoryCard";
export { default as PopularCategories } from "./PopularCategories";

// Re-export types for convenience
export type {
  HeroSectionProps,
  FeaturedProductsProps,
  CategoryCardProps,
  PopularCategoriesProps,
} from "./types";
