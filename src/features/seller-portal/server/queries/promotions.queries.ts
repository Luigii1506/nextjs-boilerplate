/**
 * 🎁 PROMOTIONS QUERIES - Seller Portal
 * =====================================
 *
 * Database queries for promotions management
 * Listing, filtering, and fetching promotion details
 *
 * Created: 2025-01-17
 */

import { prisma } from "@/core/database/prisma";
import type { PaginatedResponse } from "../../types";
import { PromotionType, DiscountType, AppliesTo } from "@prisma/client";

/**
 * Promotion list item for quick view
 */
export interface PromotionListItem {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: AppliesTo;
  startAt: Date;
  endAt?: Date;
  isActive: boolean;
  usageCount: number;
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  minPurchaseAmount?: number;
  minQuantity?: number;
  availableChannels: string[];
}

/**
 * Full promotion details
 */
export interface PromotionDetails extends PromotionListItem {
  createdAt: Date;
  updatedAt: Date;
  targetProductIds: string[];
  targetCategoryIds: string[];
  isPriority: boolean;
}

/**
 * Filters for promotion queries
 */
export interface PromotionFilters {
  type?: PromotionType;
  isActive?: boolean;
  searchQuery?: string;
  appliesTo?: AppliesTo;
}

/**
 * Get paginated promotions with filters
 */
export async function getPromotionsQuery(
  filters: PromotionFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<PromotionListItem>> {
  const skip = (page - 1) * pageSize;
  const now = new Date();

  // Build where clause
  const where: any = {};

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.appliesTo) {
    where.appliesTo = filters.appliesTo;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.searchQuery) {
    where.OR = [
      { name: { contains: filters.searchQuery, mode: "insensitive" } },
      { description: { contains: filters.searchQuery, mode: "insensitive" } },
    ];
  }

  // Fetch promotions
  const [promotions, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        discountType: true,
        discountValue: true,
        appliesTo: true,
        startAt: true,
        endAt: true,
        isActive: true,
        usageCount: true,
        maxUsesTotal: true,
        maxUsesPerUser: true,
        minPurchaseAmount: true,
        minQuantity: true,
        availableChannels: true,
      },
      orderBy: [
        { isActive: "desc" },
        { startAt: "desc" },
      ],
      skip,
      take: pageSize,
    }),
    prisma.promotion.count({ where }),
  ]);

  const items: PromotionListItem[] = promotions.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    type: p.type as PromotionType,
    discountType: p.discountType as DiscountType,
    discountValue: Number(p.discountValue),
    appliesTo: p.appliesTo as AppliesTo,
    startAt: p.startAt!,
    endAt: p.endAt || undefined,
    isActive: p.isActive,
    usageCount: p.usageCount,
    maxUsesTotal: p.maxUsesTotal || undefined,
    maxUsesPerUser: p.maxUsesPerUser || undefined,
    minPurchaseAmount: p.minPurchaseAmount ? Number(p.minPurchaseAmount) : undefined,
    minQuantity: p.minQuantity || undefined,
    availableChannels: p.availableChannels as string[],
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
 * Get single promotion details
 */
export async function getPromotionDetailsQuery(
  promotionId: string
): Promise<PromotionDetails | null> {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
  });

  if (!promotion) {
    return null;
  }

  return {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description || undefined,
    type: promotion.type as PromotionType,
    discountType: promotion.discountType as DiscountType,
    discountValue: Number(promotion.discountValue),
    appliesTo: promotion.appliesTo as AppliesTo,
    startAt: promotion.startAt!,
    endAt: promotion.endAt || undefined,
    isActive: promotion.isActive,
    usageCount: promotion.usageCount,
    maxUsesTotal: promotion.maxUsesTotal || undefined,
    maxUsesPerUser: promotion.maxUsesPerUser || undefined,
    minPurchaseAmount: promotion.minPurchaseAmount ? Number(promotion.minPurchaseAmount) : undefined,
    minQuantity: promotion.minQuantity || undefined,
    availableChannels: promotion.availableChannels as string[],
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
    targetProductIds: promotion.targetProductIds as string[],
    targetCategoryIds: promotion.targetCategoryIds as string[],
    isPriority: promotion.isPriority,
  };
}

/**
 * Get active promotions count
 */
export async function getActivePromotionsCountQuery(): Promise<number> {
  const now = new Date();

  return await prisma.promotion.count({
    where: {
      isActive: true,
      startAt: { lte: now },
      OR: [
        { endAt: null },
        { endAt: { gte: now } },
      ],
    },
  });
}

/**
 * Get promotions statistics
 */
export async function getPromotionsStatsQuery() {
  const now = new Date();

  const [
    totalPromotions,
    activePromotions,
    scheduledPromotions,
    expiredPromotions,
  ] = await Promise.all([
    prisma.promotion.count(),
    prisma.promotion.count({
      where: {
        isActive: true,
        startAt: { lte: now },
        OR: [
          { endAt: null },
          { endAt: { gte: now } },
        ],
      },
    }),
    prisma.promotion.count({
      where: {
        isActive: true,
        startAt: { gt: now },
      },
    }),
    prisma.promotion.count({
      where: {
        endAt: { lt: now },
      },
    }),
  ]);

  return {
    total: totalPromotions,
    active: activePromotions,
    scheduled: scheduledPromotions,
    expired: expiredPromotions,
  };
}
