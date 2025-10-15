/**
 * 🎟️ COUPONS QUERIES - Seller Portal
 * ====================================
 *
 * Database queries for coupons management
 * Listing, filtering, and fetching coupon details
 *
 * Created: 2025-01-17
 */

import { prisma } from "@/core/database/prisma";
import type { PaginatedResponse } from "../../types";
import { CouponType, DiscountType, AppliesTo } from "@prisma/client";

/**
 * Coupon list item for quick view
 */
export interface CouponListItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: AppliesTo;
  startAt?: Date;
  endAt?: Date;
  isActive: boolean;
  usageCount: number;
  maxUsesTotal?: number;
  maxUsesPerUser: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  availableChannels: string[];
}

/**
 * Full coupon details
 */
export interface CouponDetails extends CouponListItem {
  createdAt: Date;
  updatedAt: Date;
  targetProductIds: string[];
  targetCategoryIds: string[];
}

/**
 * Filters for coupon queries
 */
export interface CouponFilters {
  type?: CouponType;
  isActive?: boolean;
  searchQuery?: string;
}

/**
 * Get paginated coupons with filters
 */
export async function getCouponsQuery(
  filters: CouponFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CouponListItem>> {
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.searchQuery) {
    where.OR = [
      { code: { contains: filters.searchQuery, mode: "insensitive" } },
      { name: { contains: filters.searchQuery, mode: "insensitive" } },
      { description: { contains: filters.searchQuery, mode: "insensitive" } },
    ];
  }

  // Fetch coupons
  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      select: {
        id: true,
        code: true,
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
        maxDiscountAmount: true,
        availableChannels: true,
      },
      orderBy: [
        { isActive: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: pageSize,
    }),
    prisma.coupon.count({ where }),
  ]);

  const items: CouponListItem[] = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description || undefined,
    type: c.type as CouponType,
    discountType: c.discountType as DiscountType,
    discountValue: Number(c.discountValue),
    appliesTo: c.appliesTo as AppliesTo,
    startAt: c.startAt || undefined,
    endAt: c.endAt || undefined,
    isActive: c.isActive,
    usageCount: c.usageCount,
    maxUsesTotal: c.maxUsesTotal || undefined,
    maxUsesPerUser: c.maxUsesPerUser,
    minPurchaseAmount: c.minPurchaseAmount ? Number(c.minPurchaseAmount) : undefined,
    maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : undefined,
    availableChannels: c.availableChannels as string[],
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
 * Get single coupon details
 */
export async function getCouponDetailsQuery(
  couponId: string
): Promise<CouponDetails | null> {
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    return null;
  }

  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description || undefined,
    type: coupon.type as CouponType,
    discountType: coupon.discountType as DiscountType,
    discountValue: Number(coupon.discountValue),
    appliesTo: coupon.appliesTo as AppliesTo,
    startAt: coupon.startAt || undefined,
    endAt: coupon.endAt || undefined,
    isActive: coupon.isActive,
    usageCount: coupon.usageCount,
    maxUsesTotal: coupon.maxUsesTotal || undefined,
    maxUsesPerUser: coupon.maxUsesPerUser,
    minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : undefined,
    maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined,
    availableChannels: coupon.availableChannels as string[],
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
    targetProductIds: coupon.targetProductIds as string[],
    targetCategoryIds: coupon.targetCategoryIds as string[],
  };
}

/**
 * Get active coupons count
 */
export async function getActiveCouponsCountQuery(): Promise<number> {
  const now = new Date();

  return await prisma.coupon.count({
    where: {
      isActive: true,
      OR: [
        { startAt: null },
        { startAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endAt: null },
            { endAt: { gte: now } },
          ],
        },
      ],
    },
  });
}

/**
 * Get coupons statistics
 */
export async function getCouponsStatsQuery() {
  const now = new Date();

  const [
    totalCoupons,
    activeCoupons,
    expiredCoupons,
    totalUsage,
  ] = await Promise.all([
    prisma.coupon.count(),
    prisma.coupon.count({
      where: {
        isActive: true,
        OR: [
          { startAt: null },
          { startAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endAt: null },
              { endAt: { gte: now } },
            ],
          },
        ],
      },
    }),
    prisma.coupon.count({
      where: {
        endAt: { lt: now },
      },
    }),
    prisma.coupon.aggregate({
      _sum: {
        usageCount: true,
      },
    }),
  ]);

  return {
    total: totalCoupons,
    active: activeCoupons,
    expired: expiredCoupons,
    totalUsage: totalUsage._sum.usageCount || 0,
  };
}

/**
 * Check if coupon code is available (not already in use)
 */
export async function isCouponCodeAvailableQuery(
  code: string,
  excludeCouponId?: string
): Promise<boolean> {
  const existing = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
    select: { id: true },
  });

  if (!existing) {
    return true;
  }

  // If excluding a coupon ID (for updates), check if it's the same one
  if (excludeCouponId && existing.id === excludeCouponId) {
    return true;
  }

  return false;
}
