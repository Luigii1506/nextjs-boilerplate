// 🏆 LEGACY CONFIGURATION - Backwards compatibility
// =================================================
// Mantenido para compatibilidad con providers existentes

import { formatFileSize as utilFormatFileSize } from "../utils";

// 🎯 Legacy re-exports for backwards compatibility
export const formatFileSize = utilFormatFileSize;

// 🏗️ Legacy configuration functions
export function generateUploadPath(fileName: string, userId?: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

  if (userId) {
    return `uploads/${userId}/${timestamp}_${randomId}_${sanitizedFileName}`;
  }

  return `uploads/anonymous/${timestamp}_${randomId}_${sanitizedFileName}`;
}

export function getS3Config() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_S3_BUCKET || "",
  };
}

export function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("*")) {
      const baseType = type.slice(0, -1);
      return mimeType.startsWith(baseType);
    }
    return mimeType === type;
  });
}

export function validateFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "document";
  if (mimeType.startsWith("text/")) return "document";
  return "other";
}

export function parseFileFilters(filters?: Record<string, unknown>) {
  return {
    limit: 50,
    offset: 0,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
    ...filters,
  };
}

export const formatFileSizeConfig = formatFileSize;
