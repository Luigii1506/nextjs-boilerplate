/**
 * 🏷️ PRODUCTS QUERIES - Seller Portal
 * ====================================
 *
 * Database queries for products management
 * Quick visibility and channel availability updates
 *
 * Created: 2025-01-17
 */

import { prisma } from "@/core/database/prisma";
import type { ProductQuickView, PaginatedResponse } from "../../types";
import { ProductVisibility, SalesChannel } from "@prisma/client";

/**
 * Get products with quick view data
 */
export async function getProductsQuickView(
  page: number = 1,
  pageSize: number = 20,
  searchQuery?: string,
  categoryId?: string,
  visibility?: ProductVisibility
): Promise<PaginatedResponse<ProductQuickView>> {
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { sku: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  if (visibility && visibility !== "ALL" as any) {
    where.visibility = visibility;
  }

  // Fetch products
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        publicPrice: true,
        salePrice: true,
        stock: true,
        visibility: true,
        availableChannels: true,
        isPublic: true,
        isActive: true,
        category: {
          select: {
            name: true,
          },
        },
        publicImages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const items: ProductQuickView[] = products.map((p: any) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: Number(p.price),
    publicPrice: p.publicPrice ? Number(p.publicPrice) : undefined,
    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
    stock: p.stock,
    visibility: p.visibility as ProductVisibility,
    availableChannels: p.availableChannels as SalesChannel[],
    isPublic: p.isPublic,
    isActive: p.isActive,
    categoryName: p.category.name,
    image: p.publicImages[0],
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get all categories for filter
 */
export async function getCategoriesForFilter() {
  return await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
