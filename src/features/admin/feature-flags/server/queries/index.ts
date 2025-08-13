// 🔍 FEATURE FLAGS QUERIES
// ========================
// Consultas específicas para feature flags (Repository pattern)

import { prisma } from "@/core/database/prisma";
import type { FeatureFlagFilters } from "../../schemas";

// 📊 Obtener todas las feature flags
export const getAllFeatureFlagsQuery = async () => {
  return await prisma.featureFlag.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
};

// 🎯 Obtener una feature flag por key
export const getFeatureFlagByKeyQuery = async (key: string) => {
  return await prisma.featureFlag.findUnique({
    where: { key },
  });
};

// 🎯 Obtener flags habilitadas únicamente
export const getEnabledFeatureFlagsQuery = async () => {
  return await prisma.featureFlag.findMany({
    where: { enabled: true },
    select: { key: true, name: true, hasPrismaModels: true },
  });
};

// 🔍 Buscar flags con filtros
export const searchFeatureFlagsQuery = async (filters: FeatureFlagFilters) => {
  const where: Record<string, unknown> = {};

  // Filtrar por categoría
  if (filters.category !== "all") {
    where.category = filters.category;
  }

  // Filtrar por estado
  if (filters.status === "enabled") {
    where.enabled = true;
  } else if (filters.status === "disabled") {
    where.enabled = false;
  }

  // Filtrar por búsqueda
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { key: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return await prisma.featureFlag.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
};

// 📋 Obtener flags por categoría
export const getFeatureFlagsByCategoryQuery = async (category: string) => {
  return await prisma.featureFlag.findMany({
    where: { category },
    orderBy: { name: "asc" },
  });
};

// 🔗 Obtener flags con dependencias
export const getFeatureFlagsWithDependenciesQuery = async () => {
  return await prisma.featureFlag.findMany({
    where: {
      dependencies: { isEmpty: false },
    },
  });
};

// ⚡ Obtener flags que requieren regeneración de schema
export const getSchemaRelatedFlagsQuery = async () => {
  return await prisma.featureFlag.findMany({
    where: { hasPrismaModels: true },
    select: { key: true, enabled: true, name: true },
  });
};

// 📈 Obtener estadísticas básicas
export const getFeatureFlagStatsQuery = async () => {
  const [total, enabled, byCategory] = await Promise.all([
    prisma.featureFlag.count(),
    prisma.featureFlag.count({ where: { enabled: true } }),
    prisma.featureFlag.groupBy({
      by: ["category"],
      _count: true,
    }),
  ]);

  return {
    total,
    enabled,
    disabled: total - enabled,
    byCategory: byCategory.reduce((acc, item) => {
      acc[item.category] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
};

// 📚 Obtener historial de una flag
export const getFeatureFlagHistoryQuery = async (
  flagKey: string,
  limit = 50
) => {
  return await prisma.featureFlagHistory.findMany({
    where: { flagKey },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

// 🔄 Verificar si existe una flag
export const featureFlagExistsQuery = async (key: string): Promise<boolean> => {
  const count = await prisma.featureFlag.count({
    where: { key },
  });
  return count > 0;
};

// 🚫 Obtener flags con conflictos
export const getConflictingFlagsQuery = async (conflicts: string[]) => {
  if (conflicts.length === 0) return [];

  return await prisma.featureFlag.findMany({
    where: {
      key: { in: conflicts },
      enabled: true,
    },
    select: { key: true, name: true },
  });
};
