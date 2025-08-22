/**
 * 🔍 AUDIT TRAIL QUERIES
 * ======================
 *
 * Database queries específicas para audit trail - Solo acceso a datos
 * Siguiendo el patrón de users module
 */

import { prisma } from "@/core/database/prisma";
import { Prisma } from "@prisma/client";
import type { AuditFilters } from "../types";

// 🔍 Build audit search condition
export const buildAuditSearchCondition = (
  filters: AuditFilters = {}
): Prisma.AuditEventWhereInput => {
  const where: Prisma.AuditEventWhereInput = {};

  if (filters.action) where.action = filters.action;
  if (filters.resource) where.resource = filters.resource;
  if (filters.userId) where.userId = filters.userId;
  if (filters.severity) where.severity = filters.severity;
  if (filters.resourceId) where.resourceId = filters.resourceId;
  if (filters.ipAddress) where.ipAddress = filters.ipAddress;

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }

  // Search filter
  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search, mode: "insensitive" } },
      { resourceName: { contains: filters.search, mode: "insensitive" } },
      { userName: { contains: filters.search, mode: "insensitive" } },
      { userEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
};

// 📊 Get audit events with pagination
export const getAuditEventsWithPagination = async (params: {
  where?: Prisma.AuditEventWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.AuditEventOrderByWithRelationInput;
}) => {
  const {
    where = {},
    skip = 0,
    take = 20,
    orderBy = { createdAt: "desc" },
  } = params;

  return prisma.auditEvent.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      changes: true,
    },
  });
};

// 📈 Get audit events count
export const getAuditEventsCount = async (
  where?: Prisma.AuditEventWhereInput
) => {
  return prisma.auditEvent.count({ where: where || {} });
};

// 👤 Get audit event by ID
export const getAuditEventById = async (eventId: string) => {
  return prisma.auditEvent.findUnique({
    where: { id: eventId },
    include: {
      changes: true,
    },
  });
};

// 📊 Get audit statistics (raw data)
export const getAuditStatsRaw = async (dateFrom?: Date, dateTo?: Date) => {
  const where: Prisma.AuditEventWhereInput = {};

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [
    totalCount,
    actionStats,
    resourceStats,
    severityStats,
    userStats,
    recentEvents,
  ] = await Promise.all([
    prisma.auditEvent.count({ where }),

    prisma.auditEvent.groupBy({
      by: ["action"],
      where,
      _count: { action: true },
    }),

    prisma.auditEvent.groupBy({
      by: ["resource"],
      where,
      _count: { resource: true },
    }),

    prisma.auditEvent.groupBy({
      by: ["severity"],
      where,
      _count: { severity: true },
    }),

    prisma.auditEvent.groupBy({
      by: ["userId", "userName"],
      where,
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 10,
    }),

    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { changes: true },
    }),
  ]);

  return {
    totalCount,
    actionStats,
    resourceStats,
    severityStats,
    userStats,
    recentEvents,
  };
};

// 🔍 Get events by resource
export const getEventsByResource = async (
  resource: string,
  resourceId: string,
  limit: number = 50
) => {
  return prisma.auditEvent.findMany({
    where: {
      resource,
      resourceId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      changes: true,
    },
  });
};

// 🔍 Get events by user
export const getEventsByUser = async (userId: string, limit: number = 50) => {
  return prisma.auditEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      changes: true,
    },
  });
};

// 🔍 Search audit events
export const searchAuditEventsRaw = async (
  query: string,
  filters: AuditFilters = {},
  limit: number = 50
) => {
  const where: Prisma.AuditEventWhereInput = {
    OR: [
      { description: { contains: query, mode: "insensitive" } },
      { resourceName: { contains: query, mode: "insensitive" } },
      { userName: { contains: query, mode: "insensitive" } },
      { userEmail: { contains: query, mode: "insensitive" } },
    ],
  };

  // Apply additional filters
  if (filters.action) where.action = filters.action;
  if (filters.resource) where.resource = filters.resource;
  if (filters.userId) where.userId = filters.userId;
  if (filters.severity) where.severity = filters.severity;

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }

  return prisma.auditEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      changes: true,
    },
  });
};

// 📊 Get activity summary (raw data)
export const getActivitySummaryRaw = async (days: number = 7) => {
  const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalEvents, uniqueUsers, topActions, topResources] =
    await Promise.all([
      prisma.auditEvent.count({
        where: { createdAt: { gte: dateFrom } },
      }),

      prisma.auditEvent.findMany({
        where: { createdAt: { gte: dateFrom } },
        select: { userId: true },
        distinct: ["userId"],
      }),

      prisma.auditEvent.groupBy({
        by: ["action"],
        where: { createdAt: { gte: dateFrom } },
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 5,
      }),

      prisma.auditEvent.groupBy({
        by: ["resource"],
        where: { createdAt: { gte: dateFrom } },
        _count: { resource: true },
        orderBy: { _count: { resource: "desc" } },
        take: 5,
      }),
    ]);

  return {
    totalEvents,
    uniqueUsers: uniqueUsers.length,
    topActions,
    topResources,
  };
};

// 🏥 Check if audit event exists
export const auditEventExists = async (eventId: string) => {
  const event = await prisma.auditEvent.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  return !!event;
};

// 📊 Get user activity (raw data)
export const getUserActivityRaw = async (userId: string, days: number = 30) => {
  const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalEvents, eventsByAction, recentEvents] = await Promise.all([
    prisma.auditEvent.count({
      where: { userId, createdAt: { gte: dateFrom } },
    }),

    prisma.auditEvent.groupBy({
      by: ["action"],
      where: { userId, createdAt: { gte: dateFrom } },
      _count: { action: true },
    }),

    prisma.auditEvent.findMany({
      where: { userId, createdAt: { gte: dateFrom } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { changes: true },
    }),
  ]);

  return {
    totalEvents,
    eventsByAction,
    recentEvents,
  };
};
