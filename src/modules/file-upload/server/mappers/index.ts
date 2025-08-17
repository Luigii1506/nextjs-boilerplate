// 🔄 FILE UPLOAD MAPPERS
// ======================
// Transformaciones entre capas de datos

import type { Upload, FileCategory, User } from "@prisma/client";
import type {
  UploadFile,
  FileCategory as FileCategoryDomain,
  UploadProvider,
  FileStatsData,
  UploadCardData,
} from "../../types";

// ========================
// 📤 UPLOAD MAPPERS
// ========================

type UploadWithRelations = Upload & {
  category?: FileCategory | null;
  user?: Pick<User, "id" | "email" | "name"> | null;
};

export const mapPrismaToUploadFile = (
  upload: UploadWithRelations
): UploadFile => {
  return {
    id: upload.id,
    filename: upload.filename,
    originalName: upload.originalName,
    mimeType: upload.mimeType,
    size: upload.size,
    provider: upload.provider as UploadProvider,
    url: upload.url,
    key: upload.key || undefined,
    bucket: upload.bucket || undefined,
    userId: upload.userId,
    categoryId: upload.categoryId || undefined,
    metadata: (upload.metadata as Record<string, unknown>) || undefined,
    isPublic: upload.isPublic,
    tags: upload.tags,
    createdAt: upload.createdAt.toISOString(),
    updatedAt: upload.updatedAt.toISOString(),
    deletedAt: upload.deletedAt?.toISOString(),
    // Relaciones
    category: upload.category
      ? mapPrismaToCategoryDomain(upload.category)
      : undefined,
    user: upload.user
      ? {
          id: upload.user.id,
          email: upload.user.email,
          name: upload.user.name || undefined,
        }
      : undefined,
  };
};

export const mapUploadToCardData = (upload: UploadFile): UploadCardData => {
  return {
    id: upload.id,
    filename: upload.filename,
    originalName: upload.originalName,
    mimeType: upload.mimeType,
    size: upload.size,
    provider: upload.provider,
    url: upload.url,
    isPublic: upload.isPublic,
    tags: upload.tags,
    createdAt: upload.createdAt,
    metadata: upload.metadata, // ✅ Agregado para dimensiones de imagen, etc.
    category: upload.category,
    user: upload.user,
    // Campos calculados para UI
    fileType: getFileType(upload.mimeType),
    sizeFormatted: formatFileSize(upload.size),
    isImage: upload.mimeType.startsWith("image/"),
    extension: getFileExtension(upload.filename),
  };
};

// ========================
// 📁 CATEGORY MAPPERS
// ========================

type CategoryWithCount = FileCategory & {
  _count?: { uploads: number };
};

export const mapPrismaToCategoryDomain = (
  category: CategoryWithCount
): FileCategoryDomain => {
  return {
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    icon: category.icon || undefined,
    maxSize: category.maxSize || undefined,
    allowedTypes: category.allowedTypes,
    uploadsCount: category._count?.uploads || 0,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
};

// ========================
// 📊 STATS MAPPERS
// ========================

export const mapStatsToFileStats = (stats: {
  totalFiles: number;
  totalSize: number;
  recentFiles: number;
  byProvider: Array<{
    provider: string;
    _count: { _all: number };
    _sum: { size: number | null };
  }>;
  byMimeType: Array<{
    mimeType: string;
    _count: { _all: number };
    _sum: { size: number | null };
  }>;
}): FileStatsData => {
  // Calculate file type counts from byMimeType
  const imageCount = stats.byMimeType
    .filter((m) => m.mimeType.startsWith("image/"))
    .reduce((sum, m) => sum + m._count._all, 0);
  
  const documentCount = stats.byMimeType
    .filter((m) => 
      m.mimeType.includes("pdf") || 
      m.mimeType.includes("document") || 
      m.mimeType.includes("text/")
    )
    .reduce((sum, m) => sum + m._count._all, 0);
  
  const videoCount = stats.byMimeType
    .filter((m) => m.mimeType.startsWith("video/"))
    .reduce((sum, m) => sum + m._count._all, 0);
  
  const audioCount = stats.byMimeType
    .filter((m) => m.mimeType.startsWith("audio/"))
    .reduce((sum, m) => sum + m._count._all, 0);

  const otherCount = stats.totalFiles - (imageCount + documentCount + videoCount + audioCount);

  // Default storage limit (can be made configurable)
  const storageLimit = 1024 * 1024 * 1024 * 10; // 10GB default
  const storagePercentage = storageLimit > 0 ? Math.round((stats.totalSize / storageLimit) * 100) : 0;

  // Create legacy filesByType format
  const filesByType: Record<string, number> = {};
  stats.byMimeType.forEach((m) => {
    const fileType = getFileType(m.mimeType);
    filesByType[fileType] = (filesByType[fileType] || 0) + m._count._all;
  });

  return {
    // 📊 Basic Stats
    totalFiles: stats.totalFiles,
    totalSize: stats.totalSize,
    totalSizeFormatted: formatFileSize(stats.totalSize),
    recentFiles: stats.recentFiles,
    averageFileSize:
      stats.totalFiles > 0 ? Math.round(stats.totalSize / stats.totalFiles) : 0,

    // 💾 Storage Stats
    storageUsed: stats.totalSize,
    storageLimit,
    storagePercentage,

    // 📂 File Type Counts
    imageCount,
    documentCount,
    videoCount,
    audioCount,
    otherCount,

    // 🔗 Detailed Breakdowns
    byProvider: stats.byProvider.map((p) => ({
      provider: p.provider as UploadProvider,
      count: p._count._all,
      size: p._sum.size || 0,
      sizeFormatted: formatFileSize(p._sum.size || 0),
    })),
    byMimeType: stats.byMimeType.map((m) => ({
      mimeType: m.mimeType,
      count: m._count._all,
      fileType: getFileType(m.mimeType),
      size: m._sum.size || 0,
    })),

    // 📈 Legacy compatibility
    filesByType,
    recentUploads: stats.recentFiles, // Alias
  };
};

// ========================
// 🔧 UTILITY FUNCTIONS
// ========================

export const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "document";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "presentation";
  if (mimeType.includes("text/")) return "text";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar")
  )
    return "archive";
  return "other";
};

export const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith("image/");
};

export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith("video/");
};

export const isAudioFile = (mimeType: string): boolean => {
  return mimeType.startsWith("audio/");
};
