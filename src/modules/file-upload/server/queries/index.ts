// 📊 FILE UPLOAD QUERIES
// ======================
// Capa de acceso a datos para file-upload

import { prisma } from "@/core/database/prisma";
import type { FileFilters } from "../../schemas";
import type { Prisma } from "@prisma/client";

// ========================
// 📤 UPLOAD QUERIES
// ========================

// READ Operations
export const getAllUploadsQuery = async (filters?: FileFilters) => {
  const where: Prisma.UploadWhereInput = {};

  if (filters) {
    if (filters.userId) where.userId = filters.userId;
    if (filters.provider) where.provider = filters.provider;
    if (filters.mimeType) where.mimeType = { contains: filters.mimeType };
    if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search) {
      where.OR = [
        { filename: { contains: filters.search, mode: "insensitive" } },
        { originalName: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }
  }

  return await prisma.upload.findMany({
    where,
    include: {
      category: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: filters?.sortBy
      ? {
          [filters.sortBy]: filters.sortOrder,
        }
      : {
          createdAt: "desc",
        },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });
};

export const getUploadByIdQuery = async (id: string) => {
  return await prisma.upload.findUnique({
    where: { id },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
};

export const getUploadsByUserQuery = async (userId: string, limit?: number) => {
  return await prisma.upload.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit || 50,
  });
};

export const getUploadStatsQuery = async (userId?: string) => {
  const where = userId ? { userId } : {};

  const [totalFiles, totalSize, recentFiles, byProvider, byMimeType] =
    await Promise.all([
      // Total de archivos
      prisma.upload.count({ where }),

      // Tamaño total
      prisma.upload.aggregate({
        where,
        _sum: { size: true },
      }),

      // Archivos recientes (últimos 7 días)
      prisma.upload.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Por proveedor
      prisma.upload.groupBy({
        by: ["provider"],
        where,
        _count: { _all: true },
        _sum: { size: true },
      }),

      // Por tipo MIME
      prisma.upload.groupBy({
        by: ["mimeType"],
        where,
        _count: { _all: true },
        orderBy: { mimeType: "asc" },
        take: 10,
      }),
    ]);

  return {
    totalFiles,
    totalSize: totalSize._sum.size || 0,
    recentFiles,
    byProvider,
    byMimeType,
  };
};

// WRITE Operations
export const createUploadQuery = async (data: {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  provider: string;
  url: string;
  key?: string;
  bucket?: string;
  userId: string;
  categoryId?: string;
  metadata?: Prisma.InputJsonValue;
  isPublic: boolean;
  tags: string[];
}) => {
  return await prisma.upload.create({
    data,
    include: {
      category: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
};

export const updateUploadQuery = async (
  id: string,
  data: {
    filename?: string;
    isPublic?: boolean;
    tags?: string[];
    categoryId?: string;
    metadata?: Prisma.InputJsonValue;
  }
) => {
  return await prisma.upload.update({
    where: { id },
    data,
    include: {
      category: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
};

export const deleteUploadQuery = async (id: string) => {
  return await prisma.upload.delete({
    where: { id },
    include: {
      category: true,
    },
  });
};

export const bulkDeleteUploadsQuery = async (ids: string[]) => {
  return await prisma.upload.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};

// ========================
// 📁 CATEGORY QUERIES
// ========================

// READ Operations
export const getAllCategoriesQuery = async () => {
  return await prisma.fileCategory.findMany({
    include: {
      _count: {
        select: {
          uploads: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
};

export const getCategoryByIdQuery = async (id: string) => {
  return await prisma.fileCategory.findUnique({
    where: { id },
    include: {
      uploads: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          uploads: true,
        },
      },
    },
  });
};

// WRITE Operations
export const createCategoryQuery = async (data: {
  name: string;
  description?: string;
  icon?: string;
  maxSize?: number;
  allowedTypes: string[];
}) => {
  return await prisma.fileCategory.create({
    data,
    include: {
      _count: {
        select: {
          uploads: true,
        },
      },
    },
  });
};

export const updateCategoryQuery = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    maxSize?: number;
    allowedTypes?: string[];
  }
) => {
  return await prisma.fileCategory.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          uploads: true,
        },
      },
    },
  });
};

export const deleteCategoryQuery = async (id: string) => {
  return await prisma.fileCategory.delete({
    where: { id },
  });
};
