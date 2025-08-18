"use server";

/**
 * 📁 FILE-UPLOAD ENTERPRISE SERVER ACTIONS
 * ========================================
 *
 * Next.js 15 Server Actions siguiendo el patrón enterprise del módulo users
 * React 19 + Hexagonal Architecture + Enterprise patterns
 *
 * Updated: 2025-01-18 - Enterprise patterns refactor
 */

import { revalidateTag, revalidatePath } from "next/cache";
import * as schemas from "../../schemas";
import * as validators from "../validators/file.validators";
import { fileUploadService, fileCategoryService } from "../services";
import {
  fileUploadServerActionLogger,
  fileUploadSecurityLogger,
} from "../../utils/logger";
import { FILE_UPLOAD_CACHE_TAGS, FILE_UPLOAD_PATHS } from "../../constants";

// 🎯 Enterprise Action Result Interface
export interface FileActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// 📤 UPLOAD FILE (Enterprise Server Action)
export async function uploadFileServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const requestId = `upload-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateFileAccess(session.user.role);

    // 🔍 Parse and validate form data
    const file = formData.get("file") as File;
    const provider = (formData.get("provider") as "local" | "s3") || "local";
    const categoryId = (formData.get("categoryId") as string) || undefined;
    const makePublic = formData.get("makePublic") === "true";

    if (!file) {
      return {
        success: false,
        error: "Archivo requerido",
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    // ✅ Validate using schemas
    const uploadData = schemas.parseUploadFileInput({
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      provider,
      isPublic: makePublic,
      tags: [],
    });

    validators.validateProvider(uploadData.provider);
    validators.validateCategory(categoryId || null);
    validators.validateFileLimits([file]);

    // 🔐 Security audit log (CRÍTICO)
    fileUploadSecurityLogger.security("FILE_UPLOAD_ATTEMPT", {
      requestId,
      userId: session.user.id,
      filename: file.name,
      fileSize: file.size,
      provider: uploadData.provider,
    });

    // 🏢 Business logic via service
    const result = await fileUploadService.uploadFile(
      file,
      session.user.id,
      uploadData.provider,
      categoryId
    );

    // 🔄 Cache invalidation
    revalidateTag(FILE_UPLOAD_CACHE_TAGS.FILES);
    revalidateTag(FILE_UPLOAD_CACHE_TAGS.STATS);
    revalidatePath(FILE_UPLOAD_PATHS.FILES);
    revalidatePath(FILE_UPLOAD_PATHS.ADMIN_FILES);

    fileUploadServerActionLogger.info("File uploaded successfully", {
      requestId,
      fileId: result.id,
      filename: file.name,
      userId: session.user.id,
    });

    return {
      success: true,
      data: result,
      message: `Archivo "${file.name}" subido exitosamente`,
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Upload failed", error, { requestId });

    // 🔐 Security audit for failed attempt
    fileUploadSecurityLogger.security("FILE_UPLOAD_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de upload",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 📋 GET FILES (Enterprise Server Action)
export async function getFilesServerAction(
  formData?: FormData
): Promise<FileActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateFileAccess(session.user.role);

    // 📋 Parse filters from FormData
    const filters = formData
      ? {
          userId: session.user.id,
          categoryId: formData.get("categoryId") || undefined,
          provider: formData.get("provider") || undefined,
          search: formData.get("search") || undefined,
          mimeType: formData.get("mimeType") || undefined,
          isPublic: formData.get("isPublic")
            ? formData.get("isPublic") === "true"
            : undefined,
          limit: formData.get("limit")
            ? parseInt(formData.get("limit") as string, 10)
            : undefined,
          offset: formData.get("offset")
            ? parseInt(formData.get("offset") as string, 10)
            : undefined,
          sortBy: formData.get("sortBy") || undefined,
          sortOrder: formData.get("sortOrder") || undefined,
        }
      : { userId: session.user.id };

    const parsedFilters = schemas.parseFileFilters(filters);

    // 🏢 Business logic via service
    const files = await fileUploadService.getFilesForUI(parsedFilters);

    return {
      success: true,
      data: files,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Get files failed", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo archivos",
      timestamp: new Date().toISOString(),
    };
  }
}

// 📝 UPDATE FILE (Enterprise Server Action)
export async function updateFileServerAction(
  formData: FormData
): Promise<FileActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateFileAccess(session.user.role);

    // 🔍 Parse and validate form data
    const id = formData.get("id") as string;
    const filename = formData.get("filename") as string;
    const isPublic = formData.get("isPublic") === "true";
    const tags = formData.get("tags") as string;

    if (!id) {
      return {
        success: false,
        error: "ID de archivo requerido",
        timestamp: new Date().toISOString(),
      };
    }

    validators.validateUUID(id, "ID de archivo");

    // ✅ Use schema validation
    const updateData = schemas.parseUpdateUploadInput({
      id,
      ...(filename && { filename }),
      ...(isPublic !== undefined && { isPublic }),
      ...(tags && { tags: tags.split(",") }),
    });

    // 🏢 Business logic via service
    const updated = await fileUploadService.updateFile(
      updateData.id,
      updateData
    );

    // 🔄 Cache invalidation
    revalidateTag(FILE_UPLOAD_CACHE_TAGS.FILES);
    revalidatePath(FILE_UPLOAD_PATHS.FILES);
    revalidatePath(FILE_UPLOAD_PATHS.ADMIN_FILES);

    return {
      success: true,
      data: updated,
      message: "Archivo actualizado exitosamente",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Update file failed", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error actualizando archivo",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🗑️ DELETE FILE (Enterprise Server Action)
export async function deleteFileServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const requestId = `delete-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateFileAccess(session.user.role);

    // 🔍 Parse and validate form data
    const id = formData.get("id") as string;

    if (!id) {
      return {
        success: false,
        error: "ID de archivo requerido",
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    validators.validateUUID(id, "ID de archivo");

    // ✅ Use schema validation
    const validated = schemas.parseDeleteUploadInput({ id });

    // 🔐 Security audit log (CRÍTICO)
    fileUploadSecurityLogger.security("FILE_DELETE_ATTEMPT", {
      requestId,
      userId: session.user.id,
      fileId: validated.id,
    });

    // 🏢 Business logic via service
    await fileUploadService.deleteFile(validated.id);

    // 🔄 Cache invalidation
    revalidateTag(FILE_UPLOAD_CACHE_TAGS.FILES);
    revalidateTag(FILE_UPLOAD_CACHE_TAGS.STATS);
    revalidatePath(FILE_UPLOAD_PATHS.FILES);
    revalidatePath(FILE_UPLOAD_PATHS.ADMIN_FILES);

    fileUploadServerActionLogger.info("File deleted successfully", {
      requestId,
      fileId: validated.id,
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Archivo eliminado exitosamente",
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Delete file failed", error, {
      requestId,
    });

    // 🔐 Security audit for failed attempt
    fileUploadSecurityLogger.security("FILE_DELETE_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error eliminando archivo",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 📊 GET FILE STATS (Enterprise Server Action)
export async function getFileStatsServerAction(
  formData?: FormData
): Promise<FileActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateFileAccess(session.user.role);

    // 📋 Parse optional target user ID (for admins)
    const targetUserIdFromForm = formData?.get("userId");
    const userId =
      targetUserIdFromForm && targetUserIdFromForm !== ""
        ? (targetUserIdFromForm as string)
        : session.user.id;

    // 🛡️ Permission check for viewing other users' stats
    validators.validateStatsAccess(session.user.id, userId, session.user.role);

    // Only process if valid UUID
    const statsInputData: { userId?: string; period?: string } = {};

    try {
      validators.validateUUID(userId, "User ID");
      statsInputData.userId = userId;
    } catch {
      // If invalid UUID, use current user
      statsInputData.userId = session.user.id;
    }

    // Add period if provided
    const period = formData?.get("period");
    if (period && ["day", "week", "month", "year"].includes(period as string)) {
      statsInputData.period = period as string;
    }

    const statsInput = schemas.parseGetStatsInput(statsInputData);

    // 🏢 Business logic via service
    const stats = await fileUploadService.getStats(statsInput);

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Get stats failed", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo estadísticas",
      timestamp: new Date().toISOString(),
    };
  }
}

// 📁 CREATE CATEGORY (Enterprise Server Action)
export async function createCategoryServerAction(
  formData: FormData
): Promise<FileActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateAdminAccess(session.user.role);

    // 🔍 Parse and validate form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    const maxSize = formData.get("maxSize") as string;
    const allowedTypesString = formData.get("allowedTypes") as string;

    if (!name || !allowedTypesString) {
      return {
        success: false,
        error: "Nombre y tipos permitidos son requeridos",
        timestamp: new Date().toISOString(),
      };
    }

    // ✅ Use schema validation
    const categoryData = schemas.parseCreateCategoryInput({
      name,
      description,
      icon,
      maxSize: maxSize ? parseInt(maxSize) : undefined,
      allowedTypes: JSON.parse(allowedTypesString),
    });

    // 🏢 Business logic via service
    const category = await fileCategoryService.createCategory(categoryData);

    // 🔄 Cache invalidation
    revalidateTag(FILE_UPLOAD_CACHE_TAGS.CATEGORIES);
    revalidatePath(FILE_UPLOAD_PATHS.ADMIN_FILES);
    revalidatePath(FILE_UPLOAD_PATHS.CATEGORIES);

    return {
      success: true,
      data: category,
      message: `Categoría "${name}" creada exitosamente`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Create category failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error creando categoría",
      timestamp: new Date().toISOString(),
    };
  }
}

// 📂 GET CATEGORIES (Enterprise Server Action)
export async function getCategoriesServerAction(): Promise<FileActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateFileAccess(session.user.role);

    // 🏢 Business logic via service
    const categories = await fileCategoryService.getCategories();

    return {
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Get categories failed", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo categorías",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🔗 GET SIGNED URL (Enterprise Server Action)
export async function getSignedUrlServerAction(
  formData: FormData
): Promise<FileActionResult> {
  try {
    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateFileAccess(session.user.role);

    // 🔍 Parse and validate form data
    const filename = formData.get("filename") as string;
    const mimeType = formData.get("mimeType") as string;
    const isPublic = formData.get("isPublic") === "true";

    if (!filename || !mimeType) {
      return {
        success: false,
        error: "Nombre de archivo y tipo MIME requeridos",
        timestamp: new Date().toISOString(),
      };
    }

    // ✅ Use schema validation
    const validated = schemas.parseGetSignedUrlInput({
      filename,
      mimeType,
      isPublic,
    });

    // 🏢 Business logic via service
    const signedUrl = await fileUploadService.getSignedUrl(
      validated.filename,
      validated.mimeType,
      validated.isPublic
    );

    return {
      success: true,
      data: signedUrl,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Get signed URL failed", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error generando URL firmada",
      timestamp: new Date().toISOString(),
    };
  }
}

// 🎯 LEGACY COMPATIBILITY FUNCTIONS
// Re-export main functions with old names for compatibility
export const uploadFileAction = uploadFileServerAction;
export const getFilesAction = getFilesServerAction;
export const updateFileAction = updateFileServerAction;
export const deleteFileAction = deleteFileServerAction;
export const getFileStatsAction = getFileStatsServerAction;
export const createCategoryAction = createCategoryServerAction;
export const getCategoriesAction = getCategoriesServerAction;
export const generateSignedUrlServerAction = getSignedUrlServerAction;
