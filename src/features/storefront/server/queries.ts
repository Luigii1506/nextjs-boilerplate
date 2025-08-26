/**
 * 🛒 STOREFRONT QUERIES
 * ====================
 *
 * Data Access Layer - Database queries para Customer-facing Storefront
 * Clean Architecture: Infrastructure Layer (Database)
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

import { prisma } from "../../../core/database/prisma";
import type {
  ProductQueryOptions,
  CategoryQueryOptions,
  PaginatedResponse,
} from "../types";

// 🏷️ Raw query result interfaces (aligned with Prisma)
export interface RawProductQueryResult {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: any; // Prisma Decimal (converted to number in mapper)
  cost: any | null; // Prisma Decimal
  publicPrice: any | null; // Prisma Decimal (converted to number in mapper)
  // salePrice: number | null; // TODO: Add to schema when sale pricing is implemented
  stock: number;
  minStock: number;
  maxStock: number | null;
  unit: string;
  barcode: string | null;
  images: string[];
  isActive: boolean;
  isPublic: boolean;
  featured: boolean;
  supplierId: string | null;
  tags: string[];
  metadata: any;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  category?: {
    id: string;
    name: string;
    // slug: string; // TODO: Add slug field to Category schema when URL routing is implemented
  } | null;
  supplier?: {
    id: string;
    name: string;
  } | null;

  // Customer metrics (computed or joined)
  rating?: number | null;
  reviewCount?: number | null;
  salesCount?: number | null;
}

export interface RawCategoryQueryResult {
  id: string;
  name: string;
  description: string | null;
  // slug: string; // TODO: Add slug field to Category schema when URL routing is implemented
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  // metadata: any; // TODO: Add metadata field to Category schema if needed
  createdAt: Date;
  updatedAt: Date;

  // Computed fields
  _count?: {
    products: number;
  };
}

export interface RawWishlistQueryResult {
  id: string;
  userId: string;
  productId: string;
  addedAt: Date;
  product?: RawProductQueryResult;
}

export interface RawCartQueryResult {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: string;
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    product?: RawProductQueryResult;
  }[];
}

// 🔍 PRODUCT QUERIES
// ==================

export async function getPublicProductsQuery(
  options: Partial<ProductQueryOptions> = {}
): Promise<PaginatedResponse<RawProductQueryResult>> {
  const {
    query,
    categoryId,
    minPrice,
    maxPrice,
    featured,
    inStock = false, // Changed default - let business logic decide
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 20,
  } = options;

  // 🔍 Build where clause
  const where: any = {
    isPublic: true,
    isActive: true,
  };

  // Search filter
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { tags: { hasSome: [query] } },
    ];
  }

  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.OR = [
      // Use publicPrice if available, otherwise use price
      {
        publicPrice: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      },
      {
        AND: [
          { publicPrice: null },
          {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          },
        ],
      },
    ];
  }

  // Featured filter
  if (featured !== undefined) {
    where.featured = featured;
  }

  // Stock filter
  if (inStock) {
    where.stock = { gt: 0 };
  }

  // 📊 Build orderBy clause
  let orderBy: any;
  switch (sortBy) {
    case "price":
      orderBy = [
        { publicPrice: sortOrder },
        { price: sortOrder }, // Fallback
      ];
      break;
    case "createdAt":
      orderBy = { createdAt: sortOrder };
      break;
    case "stock":
      orderBy = { stock: sortOrder };
      break;
    case "rating":
      // TODO: Add rating sorting when reviews are implemented
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { [sortBy]: sortOrder };
  }

  // 📄 Calculate pagination
  const skip = (page - 1) * limit;

  try {
    // 🔄 Execute query with relations
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          // TODO: Add reviews aggregation when implemented
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products as RawProductQueryResult[],
      total,
      page,
      limit,
      totalPages,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in getPublicProductsQuery:",
      error
    );
    throw error;
  }
}

export async function getFeaturedProductsQuery(
  limit: number = 8
): Promise<RawProductQueryResult[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPublic: true,
        isActive: true,
        featured: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return products as RawProductQueryResult[];
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in getFeaturedProductsQuery:",
      error
    );
    throw error;
  }
}

// 🏷️ CATEGORY QUERIES
// ===================

export async function getPublicCategoriesQuery(
  options: Partial<CategoryQueryOptions> = {}
): Promise<PaginatedResponse<RawCategoryQueryResult>> {
  const {
    query,
    parentId,
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 20,
  } = options;

  // 🔍 Build where clause
  const where: any = {
    isActive: true,
  };

  // Search filter
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  // Parent filter
  if (parentId !== undefined) {
    where.parentId = parentId;
  }

  // 📊 Build orderBy
  const orderBy: any =
    sortBy === "productCount"
      ? { products: { _count: sortOrder } }
      : { [sortBy]: sortOrder };

  // 📄 Pagination
  const skip = (page - 1) * limit;

  try {
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              products: {
                where: {
                  isPublic: true,
                  isActive: true,
                },
              },
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: categories as RawCategoryQueryResult[],
      total,
      page,
      limit,
      totalPages,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in getPublicCategoriesQuery:",
      error
    );
    throw error;
  }
}

export async function getFeaturedCategoriesQuery(
  limit: number = 6
): Promise<RawCategoryQueryResult[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        {
          products: {
            _count: "desc",
          },
        },
      ],
      take: limit,
      include: {
        _count: {
          select: {
            products: {
              where: {
                isPublic: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    return categories as RawCategoryQueryResult[];
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in getFeaturedCategoriesQuery:",
      error
    );
    throw error;
  }
}

// 💖 WISHLIST QUERIES
// ===================

export async function getWishlistQuery(
  userId: string
): Promise<RawWishlistQueryResult[]> {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId,
      },
      orderBy: {
        addedAt: "desc",
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return wishlistItems as RawWishlistQueryResult[];
  } catch (error) {
    console.error("[StorefrontQueries] Error in getWishlistQuery:", error);
    throw error;
  }
}

export async function addWishlistItemQuery(
  userId: string,
  productId: string
): Promise<RawWishlistQueryResult> {
  console.log("💾 [QUERIES] addWishlistItemQuery called", {
    userId,
    productId,
  });

  try {
    console.log("💾 [QUERIES] Creating wishlist item in database...");
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log("✅ [QUERIES] Wishlist item successfully created:", {
      id: wishlistItem.id,
      userId: wishlistItem.userId,
      productId: wishlistItem.productId,
      addedAt: wishlistItem.addedAt,
    });

    return wishlistItem as RawWishlistQueryResult;
  } catch (error) {
    console.error("[StorefrontQueries] Error in addWishlistItemQuery:", error);
    throw error;
  }
}

export async function removeWishlistItemQuery(
  userId: string,
  productId: string
): Promise<void> {
  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in removeWishlistItemQuery:",
      error
    );
    throw error;
  }
}

export async function checkWishlistItemExistsQuery(
  userId: string,
  productId: string
): Promise<RawWishlistQueryResult | null> {
  try {
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return existingItem as RawWishlistQueryResult | null;
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in checkWishlistItemExistsQuery:",
      error
    );
    throw error;
  }
}

// 🛒 CART QUERIES
// ===============

export async function getCartQuery(
  userId?: string,
  sessionId?: string
): Promise<RawCartQueryResult | null> {
  if (!userId && !sessionId) {
    return null;
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: {
        ...(userId && { userId }),
        ...(sessionId && !userId && { sessionId }),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                supplier: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return cart as RawCartQueryResult | null;
  } catch (error) {
    console.error("[StorefrontQueries] Error in getCartQuery:", error);
    return null;
  }
}

// 📊 STATS QUERIES
// ================

export async function getStorefrontStatsQuery() {
  try {
    const [
      totalProducts,
      categoriesCount,
      onSaleProducts,
      newProducts,
      // TODO: Add review aggregations when implemented
    ] = await Promise.all([
      prisma.product.count({
        where: {
          isPublic: true,
          isActive: true,
        },
      }),
      prisma.category.count({
        where: {
          isActive: true,
        },
      }),
      prisma.product.count({
        where: {
          isPublic: true,
          isActive: true,
          // TODO: Implement sale price logic when salePrice field is added to schema
        },
      }),
      prisma.product.count({
        where: {
          isPublic: true,
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalProducts,
      categoriesCount,
      onSaleCount: onSaleProducts,
      newArrivalsCount: newProducts,
      avgRating: 4.5, // TODO: Calculate from reviews
      totalReviews: 0, // TODO: Calculate from reviews
      featuredProducts: 8, // TODO: Calculate dynamically
      popularCategories: 6, // TODO: Calculate dynamically
    };
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in getStorefrontStatsQuery:",
      error
    );
    throw error;
  }
}

// 🔍 VALIDATION QUERIES
// =====================

export async function validateProductExistsQuery(
  productId: string
): Promise<boolean> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isPublic: true,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found or not public`);
    }

    return true;
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in validateProductExistsQuery:",
      error
    );
    throw error;
  }
}

export async function validateCategoryExistsQuery(
  categoryId: string
): Promise<boolean> {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found or not active`);
    }

    return true;
  } catch (error) {
    console.error(
      "[StorefrontQueries] Error in validateCategoryExistsQuery:",
      error
    );
    throw error;
  }
}

// 🎯 PERSONALIZATION QUERIES (TODO)
// =================================

export async function getProductsWithWishlistStatusQuery(
  options: Partial<ProductQueryOptions>,
  _userId: string // TODO: Use when implementing wishlist join query
): Promise<PaginatedResponse<RawProductQueryResult>> {
  // TODO: Implement join query to include wishlist status
  // For now, use regular query
  return getPublicProductsQuery(options);
}

export async function getRecommendedProductsQuery(
  userId: string,
  limit: number = 8
): Promise<RawProductQueryResult[]> {
  // TODO: Implement recommendation algorithm
  // For now, return featured products
  return getFeaturedProductsQuery(limit);
}
