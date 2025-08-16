// 📋 FILE UPLOAD SCHEMAS
// =======================
// Esquemas de validación Zod para file-upload

import { z } from "zod";

// ========================
// 📤 UPLOAD SCHEMAS
// ========================

export const UploadFileSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().min(1, "File size must be greater than 0"),
  provider: z.enum(["local", "s3", "cloudinary"], {
    message: "Invalid upload provider",
  }),
  key: z.string().optional(),
  bucket: z.string().optional(),
  categoryId: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateUploadSchema = z.object({
  id: z.string().uuid("Invalid upload ID"),
  filename: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const DeleteUploadSchema = z.object({
  id: z.string().uuid("Invalid upload ID"),
});

// ========================
// 📁 CATEGORY SCHEMAS
// ========================

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  maxSize: z.number().min(1).optional(),
  allowedTypes: z.array(z.string()).default([]),
});

export const UpdateCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID"),
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  maxSize: z.number().min(1).optional(),
  allowedTypes: z.array(z.string()).optional(),
});

// ========================
// 🔍 FILTER SCHEMAS
// ========================

export const FileFiltersSchema = z.object({
  userId: z
    .string()
    .uuid()
    .optional()
    .or(z.null())
    .transform((val) => val || undefined),
  provider: z
    .enum(["local", "s3", "cloudinary"])
    .optional()
    .or(z.null())
    .transform((val) => val || undefined),
  mimeType: z
    .string()
    .optional()
    .or(z.null())
    .transform((val) => val || undefined),
  isPublic: z
    .boolean()
    .optional()
    .or(z.null())
    .transform((val) => val || undefined),
  tags: z
    .array(z.string())
    .optional()
    .or(z.null())
    .transform((val) => val || undefined),
  categoryId: z
    .string()
    .optional()
    .or(z.null())
    .transform((val) => val || undefined), // Removed .uuid() requirement
  search: z
    .string()
    .optional()
    .or(z.null())
    .transform((val) => val || undefined),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(["createdAt", "filename", "size"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ========================
// 📊 STATS SCHEMAS
// ========================

export const GetStatsSchema = z.object({
  userId: z
    .string()
    .uuid()
    .optional()
    .or(z.null())
    .transform((val) => val || undefined),
  period: z.enum(["day", "week", "month", "year"]).default("month"),
});

// ========================
// 🔗 SIGNED URL SCHEMAS
// ========================

export const GetSignedUrlSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().min(1),
  isPublic: z.boolean().default(false),
});

// ========================
// TYPE EXPORTS
// ========================

export type UploadFileInput = z.infer<typeof UploadFileSchema>;
export type UpdateUploadInput = z.infer<typeof UpdateUploadSchema>;
export type DeleteUploadInput = z.infer<typeof DeleteUploadSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type FileFilters = z.infer<typeof FileFiltersSchema>;
export type GetStatsInput = z.infer<typeof GetStatsSchema>;
export type GetSignedUrlInput = z.infer<typeof GetSignedUrlSchema>;

// ========================
// PARSING FUNCTIONS
// ========================

export const parseUploadFileInput = (input: unknown): UploadFileInput => {
  return UploadFileSchema.parse(input);
};

export const parseUpdateUploadInput = (input: unknown): UpdateUploadInput => {
  return UpdateUploadSchema.parse(input);
};

export const parseDeleteUploadInput = (input: unknown): DeleteUploadInput => {
  return DeleteUploadSchema.parse(input);
};

export const parseCreateCategoryInput = (
  input: unknown
): CreateCategoryInput => {
  return CreateCategorySchema.parse(input);
};

export const parseFileFilters = (input: unknown): FileFilters => {
  return FileFiltersSchema.parse(input);
};

export const parseGetStatsInput = (input: unknown): GetStatsInput => {
  return GetStatsSchema.parse(input);
};

export const parseGetSignedUrlInput = (input: unknown): GetSignedUrlInput => {
  return GetSignedUrlSchema.parse(input);
};
