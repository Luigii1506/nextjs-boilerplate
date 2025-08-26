/**
 * 🛒 STOREFRONT MAPPERS
 * =====================
 *
 * Data transformation layer para Customer-facing Storefront
 * Clean Architecture: Infrastructure Layer (Data Mapping)
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

import { STOREFRONT_DEFAULTS } from "../constants";

import type {
  ProductForCustomer,
  CategoryForCustomer,
  StorefrontStats,
  CustomerStats,
  WishlistItem,
  Cart,
  CartItem,
} from "../types";

// 🏷️ Raw data interfaces for type safety - Aligned with Prisma schema
interface RawProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: any; // Prisma Decimal (converted to number in mapper)
  cost: any | null; // Prisma Decimal (internal use)
  publicPrice: any | null; // Prisma Decimal (converted to number in mapper)
  // salePrice: number | null; // TODO: Add to schema when sale pricing is implemented
  stock: number;
  minStock: number;
  maxStock: number | null;
  unit: string;
  barcode: string | null;
  images: string[];
  isActive: boolean;
  supplierId: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  category?: RawCategory | null;
  supplier?: RawSupplier | null;

  // Customer-specific computed fields
  rating?: number | null;
  reviewCount?: number | null;
  salesCount?: number | null;

  // Wishlist status (joined from user context)
  wishlistItem?: RawWishlistItem | null;
}

interface RawCategory {
  id: string;
  name: string;
  description: string | null;
  // slug: string; // TODO: Add slug field to Category schema when URL routing is implemented
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  // metadata: Record<string, unknown> | null; // TODO: Add metadata field to Category schema if needed
  createdAt: Date;
  updatedAt: Date;

  // Computed fields for customer view
  productCount?: number;
  popularity?: number;
}

interface RawWishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: Date;
  product?: RawProduct;
}

interface RawCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
  updatedAt: Date;
  product?: RawProduct;
}

interface RawCart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: string;
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  items: RawCartItem[];
}

interface RawSupplier {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  isActive: boolean;
}

interface RawStorefrontStats {
  totalProducts: number;
  categoriesCount: number;
  onSaleCount: number;
  newArrivalsCount: number;
  avgRating: number;
  totalReviews: number;
  featuredProducts: number;
  popularCategories: number;
}

// 🏷️ PRODUCT MAPPING
// ==================

interface ProductMappingOptions {
  includeWishlistStatus?: boolean;
  userId?: string;
  includeInternalData?: boolean;
}

export function mapProductToCustomer(
  rawProduct: RawProduct,
  options: ProductMappingOptions = {}
): ProductForCustomer {
  const {
    includeWishlistStatus = false,
    userId,
    includeInternalData = false,
  } = options;

  // 💰 Price Logic - Customer-facing pricing
  const basePrice = Number(rawProduct.publicPrice || rawProduct.price);
  const currentPrice = basePrice; // TODO: Use salePrice when implemented
  const isOnSale = false; // TODO: Implement sale pricing logic when salePrice field is added
  const discountPercentage = 0; // TODO: Calculate when sale pricing is implemented

  // 🏷️ Category mapping
  const categoryName = rawProduct.category?.name || null;

  // 💖 Wishlist status
  const isWishlisted =
    includeWishlistStatus && userId ? !!rawProduct.wishlistItem : false;

  // 📦 Stock availability
  const isAvailable = rawProduct.isActive && rawProduct.stock > 0;
  const stockStatus =
    rawProduct.stock === 0
      ? "OUT_OF_STOCK"
      : rawProduct.stock <= rawProduct.minStock
      ? "LOW_STOCK"
      : "IN_STOCK";

  // 🎯 Customer-specific badges
  const badges: string[] = [];
  if (isOnSale) badges.push("ON_SALE");
  if (rawProduct.salesCount && rawProduct.salesCount > 100)
    badges.push("BESTSELLER");
  if (
    rawProduct.createdAt &&
    new Date(rawProduct.createdAt).getTime() >
      Date.now() - 30 * 24 * 60 * 60 * 1000
  ) {
    badges.push("NEW");
  }
  if (rawProduct.rating && rawProduct.rating >= 4.5) badges.push("TOP_RATED");

  // 🚚 Estimated delivery (business logic)
  const estimatedDelivery = calculateEstimatedDelivery(rawProduct);

  return {
    id: rawProduct.id,
    sku: rawProduct.sku,
    name: rawProduct.name,
    description: rawProduct.description,
    category: categoryName,
    brand: rawProduct.supplier?.name || null,

    // 💰 Customer Pricing
    price: basePrice,
    currentPrice,
    originalPrice: isOnSale ? basePrice : null,
    salePrice: null, // TODO: Implement when salePrice field is added to schema
    isOnSale,
    discountPercentage,

    // 📦 Availability
    stock: rawProduct.stock,
    isAvailable,
    stockStatus,

    // 🎨 Media & Presentation
    images: rawProduct.images,
    unit: rawProduct.unit,

    // ⭐ Social Proof
    rating: rawProduct.rating || null,
    reviewCount: rawProduct.reviewCount || 0,
    salesCount: rawProduct.salesCount || 0,

    // 💖 Customer State
    isWishlisted,
    isInCart: false, // TODO: Implement cart status checking

    // 🏷️ Marketing
    badges,
    tags: rawProduct.tags,

    // 🚚 Logistics
    estimatedDelivery,

    // 📅 Metadata
    createdAt: rawProduct.createdAt,
    updatedAt: rawProduct.updatedAt,

    // 🔒 Internal data (only if requested)
    ...(includeInternalData && {
      supplierId: rawProduct.supplierId,
      cost: rawProduct.cost,
      minStock: rawProduct.minStock,
      maxStock: rawProduct.maxStock,
      barcode: rawProduct.barcode,
      categoryId: rawProduct.categoryId,
    }),
  };
}

// 🏷️ CATEGORY MAPPING
// ===================

export function mapCategoryToCustomer(
  rawCategory: RawCategory
): CategoryForCustomer {
  // 📊 Compute category metrics
  const productCount = rawCategory.productCount || 0;
  const popularity = rawCategory.popularity || 0;
  const isPopular = productCount > 5; // Business rule for popular categories

  return {
    id: rawCategory.id,
    name: rawCategory.name,
    description: rawCategory.description,
    slug: rawCategory.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""), // Generated slug until schema is updated

    // 📊 Customer Metrics
    productCount,
    popularity,
    isPopular,

    // 📅 Metadata
    createdAt: rawCategory.createdAt,
    updatedAt: rawCategory.updatedAt,

    // 🔗 Hierarchy (if needed)
    parentId: rawCategory.parentId,
    sortOrder: rawCategory.sortOrder,
  };
}

// 💖 WISHLIST MAPPING
// ===================

export function mapWishlistToCustomer(
  rawWishlist: RawWishlistItem[]
): WishlistItem[] {
  return rawWishlist.map((item) => ({
    id: item.id,
    productId: item.productId,
    addedAt: item.addedAt,

    // Include full product data if available
    product: item.product
      ? mapProductToCustomer(item.product, {
          includeWishlistStatus: true,
          userId: item.userId,
        })
      : null,
  }));
}

// 🛒 CART MAPPING
// ==============

export function mapCartToCustomer(rawCart: RawCart): Cart {
  const mappedItems: CartItem[] = rawCart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    addedAt: item.addedAt,
    updatedAt: item.updatedAt,

    // Include product data if available
    product: item.product
      ? mapProductToCustomer(item.product, {
          includeWishlistStatus: false, // Cart doesn't need wishlist status
        })
      : null,
  }));

  return {
    id: rawCart.id,
    userId: rawCart.userId,
    sessionId: rawCart.sessionId,
    status: rawCart.status as any, // TODO: Type this properly
    totalItems: rawCart.totalItems,
    totalPrice: Number(rawCart.totalPrice),
    items: mappedItems,
    createdAt: rawCart.createdAt,
    updatedAt: rawCart.updatedAt,
  };
}

// 📊 STATS MAPPING
// ================

export function mapStatsToStorefront(
  rawStats: RawStorefrontStats
): StorefrontStats {
  return {
    totalProducts: rawStats.totalProducts,
    categoriesCount: rawStats.categoriesCount,
    onSaleCount: rawStats.onSaleCount,
    newArrivalsCount: rawStats.newArrivalsCount,
    avgRating: rawStats.avgRating,
    totalReviews: rawStats.totalReviews,
    featuredProducts: rawStats.featuredProducts,
    popularCategories: rawStats.popularCategories,
  };
}

// 🧮 UTILITY MAPPING FUNCTIONS
// ============================

export function calculateEstimatedDelivery(product: RawProduct): string {
  // 🚚 Business logic for delivery estimation
  const baseDeliveryDays = 3; // Standard delivery
  const stockMultiplier = product.stock > 10 ? 0 : 1; // Low stock adds a day
  const categoryMultiplier = 0; // Different categories could have different delivery times

  const totalDays = baseDeliveryDays + stockMultiplier + categoryMultiplier;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + totalDays);

  return deliveryDate.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateCustomerStats(
  wishlistItems: WishlistItem[],
  cartItems: CartItem[],
  orders: any[] = [], // TODO: Type this when orders are implemented
  recentlyViewed: ProductForCustomer[] = []
): CustomerStats {
  return {
    wishlistCount: wishlistItems.length,
    cartItemsCount: cartItems.length,
    ordersCount: orders.length,
    favoriteCategories: calculateFavoriteCategories(wishlistItems, orders),
    recentlyViewed,
    recommendations: [], // TODO: Implement recommendation algorithm
  };
}

function calculateFavoriteCategories(
  wishlistItems: WishlistItem[],
  orders: any[]
): string[] {
  // 🎯 Calculate favorite categories based on wishlist and order history
  const categoryCount: Record<string, number> = {};

  // Count categories from wishlist
  wishlistItems.forEach((item) => {
    if (item.product?.category) {
      categoryCount[item.product.category] =
        (categoryCount[item.product.category] || 0) + 1;
    }
  });

  // TODO: Add categories from orders when implemented

  // Return top 3 categories
  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
}

// 🔄 BATCH MAPPING UTILITIES
// ==========================

export function mapProductsToCustomer(
  rawProducts: RawProduct[],
  options: ProductMappingOptions = {}
): ProductForCustomer[] {
  return rawProducts.map((product) => mapProductToCustomer(product, options));
}

export function mapCategoriesToCustomer(
  rawCategories: RawCategory[]
): CategoryForCustomer[] {
  return rawCategories.map(mapCategoryToCustomer);
}

// 📈 PERFORMANCE MAPPING HELPERS
// ==============================

export function mapProductsWithWishlistStatus(
  rawProducts: RawProduct[],
  userId: string
): ProductForCustomer[] {
  return rawProducts.map((product) =>
    mapProductToCustomer(product, {
      includeWishlistStatus: true,
      userId,
    })
  );
}

export function mapProductsWithoutSensitiveData(
  rawProducts: RawProduct[]
): ProductForCustomer[] {
  return rawProducts.map((product) =>
    mapProductToCustomer(product, {
      includeInternalData: false,
    })
  );
}

// 👤 CUSTOMER MAPPING
// ===================
