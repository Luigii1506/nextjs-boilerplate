/**
 * 🎨 Product Formatters
 * =====================
 *
 * Pure functions for formatting product data for display.
 * Used across storefront for consistent data presentation.
 *
 * @module storefront/utils/formatters
 */

import type { ProductForCustomer } from "../types";

/**
 * Format stock status
 */
export function formatStockStatus(stock: number | null | undefined): {
  label: string;
  color: "success" | "warning" | "danger";
  inStock: boolean;
} {
  if (!stock || stock <= 0) {
    return { label: "Sin stock", color: "danger", inStock: false };
  }

  if (stock <= 10) {
    return {
      label: `Solo ${stock} disponibles`,
      color: "warning",
      inStock: true,
    };
  }

  return { label: "Disponible", color: "success", inStock: true };
}

/**
 * Format rating display
 */
export function formatRating(rating: number | null | undefined): {
  stars: number;
  label: string;
  percentage: number;
} {
  const stars = rating || 0;
  const percentage = (stars / 5) * 100;

  return {
    stars: Math.round(stars * 10) / 10, // Round to 1 decimal
    label: `${stars.toFixed(1)} estrellas`,
    percentage,
  };
}

/**
 * Format review count
 */
export function formatReviewCount(count: number | null | undefined): string {
  const reviewCount = count || 0;

  if (reviewCount === 0) return "Sin reseñas";
  if (reviewCount === 1) return "1 reseña";
  if (reviewCount >= 1000) {
    return `${(reviewCount / 1000).toFixed(1)}k reseñas`;
  }

  return `${reviewCount} reseñas`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Format product description for display
 */
export function formatProductDescription(
  description: string | null | undefined,
  maxLength: number = 150
): string {
  if (!description) return "Sin descripción disponible";
  return truncateText(description, maxLength);
}

/**
 * Get product image URL with fallback
 */
export function getProductImageUrl(
  product: ProductForCustomer,
  fallback: string = "/images/placeholder-product.png"
): string {
  if (product.images && product.images.length > 0) return product.images[0];
  return fallback;
}

/**
 * Get product badges (sale, new, bestseller, etc.)
 */
export interface ProductBadge {
  label: string;
  color: string;
  bgColor: string;
  priority: number;
}

export function getProductBadges(product: ProductForCustomer): ProductBadge[] {
  const badges: ProductBadge[] = [];

  // Sale badge (highest priority)
  if (
    product.isOnSale &&
    product.salePrice &&
    product.salePrice < product.price
  ) {
    const discount = Math.round(
      ((product.price - product.salePrice) / product.price) * 100
    );
    badges.push({
      label: `-${discount}%`,
      color: "text-white",
      bgColor: "bg-red-500",
      priority: 1,
    });
  }

  // New badge
  const createdDate = new Date(product.createdAt);
  const daysSinceCreated =
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 7) {
    badges.push({
      label: "Nuevo",
      color: "text-white",
      bgColor: "bg-blue-500",
      priority: 2,
    });
  }

  // Bestseller badge (using reviewCount as proxy)
  if (product.reviewCount && product.reviewCount >= 50) {
    badges.push({
      label: "Bestseller",
      color: "text-white",
      bgColor: "bg-yellow-500",
      priority: 3,
    });
  }

  // Low stock badge
  if (product.stock && product.stock > 0 && product.stock <= 5) {
    badges.push({
      label: "Últimas unidades",
      color: "text-white",
      bgColor: "bg-orange-500",
      priority: 4,
    });
  }

  // Featured badge
  if (product.featured) {
    badges.push({
      label: "Destacado",
      color: "text-white",
      bgColor: "bg-purple-500",
      priority: 5,
    });
  }

  // Sort by priority and return max 2 badges
  return badges.sort((a, b) => a.priority - b.priority).slice(0, 2);
}

/**
 * Format product URL slug
 */
export function formatProductSlug(productName: string, productId: string): string {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug}-${productId}`;
}

/**
 * Get availability status
 */
export function getAvailabilityStatus(product: ProductForCustomer): {
  available: boolean;
  message: string;
  canAddToCart: boolean;
} {
  if (!product.stock || product.stock <= 0) {
    return {
      available: false,
      message: "Producto no disponible",
      canAddToCart: false,
    };
  }

  if (product.stock <= 10) {
    return {
      available: true,
      message: `Solo quedan ${product.stock} unidades`,
      canAddToCart: true,
    };
  }

  return {
    available: true,
    message: "Disponible",
    canAddToCart: true,
  };
}
