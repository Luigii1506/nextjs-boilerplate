// ⚡ FILE UPLOAD ACTIONS - ENTERPRISE GRADE
// ==========================================
// React 19 + Next.js 15 Optimized Server Actions

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/core/auth/server/auth";
import {
  parseUploadFileInput,
  parseUpdateUploadInput,
  parseDeleteUploadInput,
  parseCreateCategoryInput,
  parseFileFilters,
  parseGetStatsInput,
  parseGetSignedUrlInput,
} from "../../schemas";
import { fileUploadService, fileCategoryService } from "../services";
import {
  fileUploadServerActionLogger,
  fileUploadSecurityLogger,
} from "../../utils/logger";

// 🎯 Enterprise Action Result Interface
export interface FileActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  optimisticId?: string; // For optimistic UI
}

// ========================
// 📤 UPLOAD ACTIONS (Optimized)
// ========================

export async function uploadFileServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();
  const requestId = `upload-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🛡️ Auth & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      fileUploadSecurityLogger.security("UNAUTHORIZED_UPLOAD_ATTEMPT", {
        requestId,
        timestamp,
      });
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Schema-based parsing (consistent with feature-flags)
    const file = formData.get("file") as File;
    const provider = (formData.get("provider") as "local" | "s3") || "local";
    const categoryId = (formData.get("categoryId") as string) || undefined;
    const makePublic = formData.get("makePublic") === "true";

    if (!file) {
      return {
        success: false,
        error: "Archivo requerido",
        timestamp,
      };
    }

    // ✅ Validate using schemas
    const uploadData = parseUploadFileInput({
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      provider,
      isPublic: makePublic,
      tags: [],
    });

    // 🚀 Upload with service layer
    fileUploadServerActionLogger.upload(
      requestId,
      file.name,
      file.size,
      "START",
      {
        userId: session.user.id,
        provider,
        requestId,
      }
    );

    const result = await fileUploadService.uploadFile(
      file,
      session.user.id,
      uploadData.provider,
      categoryId
    );

    // 📁 Log successful upload (CRÍTICO)
    fileUploadServerActionLogger.upload(
      requestId,
      file.name,
      file.size,
      "SUCCESS",
      {
        userId: session.user.id,
        provider,
        fileId: result.id,
        requestId,
      }
    );

    // 🔄 Smart cache invalidation
    revalidateTag("user-files");
    revalidateTag("file-stats");
    revalidatePath("/files");
    revalidatePath("/admin/files");

    // ✅ Upload completed - cache invalidated

    return {
      success: true,
      data: result,
      message: `Archivo "${file.name}" subido exitosamente`,
      timestamp,
    };
  } catch (error) {
    fileUploadServerActionLogger.error("Upload failed", error, { requestId });

    // 📁 Log failed upload (CRÍTICO)
    const fileName = formData.get("file") as File;
    if (fileName?.name) {
      fileUploadServerActionLogger.upload(
        requestId,
        fileName.name,
        fileName.size,
        "FAILED",
        {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de upload",
      timestamp,
    };
  }
}

export async function uploadMultipleFilesServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Parse form data
    const files = formData.getAll("files") as File[];
    const provider = (formData.get("provider") as "local" | "s3") || "local";
    const categoryId = (formData.get("categoryId") as string) || undefined;

    if (!files || files.length === 0) {
      return {
        success: false,
        error: "Archivos requeridos",
        timestamp,
      };
    }

    // 🚀 Bulk upload with service layer
    const result = await fileUploadService.uploadMultipleFiles(
      files,
      session.user.id,
      provider,
      categoryId
    );

    // 🔄 Smart cache invalidation
    revalidateTag("user-files");
    revalidateTag("file-stats");
    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      data: result,
      message: `${files.length} archivos procesados`,
      timestamp,
    };
  } catch (error) {
    console.error("📤 Bulk Upload Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error de upload múltiple",
      timestamp,
    };
  }
}

// ========================
// 📋 FILE MANAGEMENT ACTIONS
// ========================

export async function getFilesServerAction(
  formData?: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Parse filters from FormData if provided
    // Validate userId format before including it
    const isValidUUID = (id: string) =>
      id &&
      id.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
      );

    const filters = formData
      ? {
          ...(isValidUUID(session.user.id) && { userId: session.user.id }),
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
      : isValidUUID(session.user.id)
      ? { userId: session.user.id }
      : {};

    const parsedFilters = parseFileFilters(filters);

    // 🔄 Cache with tags for automatic invalidation (RESTORED)
    // 🔍 Starting files retrieval

    // 🔄 DIRECT DB call like users module (NO CACHE)
    const files = await fileUploadService.getFilesForUI(parsedFilters);

    // ✅ Files retrieved successfully

    return {
      success: true,
      data: files,
      timestamp,
    };
  } catch (error) {
    console.error("📋 Get Files Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo archivos",
      timestamp,
    };
  }
}

export async function updateFileServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Parse and validate form data
    const id = formData.get("id") as string;
    const filename = formData.get("filename") as string;
    const isPublic = formData.get("isPublic") === "true";
    const tags = formData.get("tags") as string;

    if (!id) {
      return {
        success: false,
        error: "ID de archivo requerido",
        timestamp,
      };
    }

    // ✅ Use schema validation
    const updateData = parseUpdateUploadInput({
      id,
      ...(filename && { filename }),
      ...(isPublic !== undefined && { isPublic }),
      ...(tags && { tags: tags.split(",") }),
    });

    const updated = await fileUploadService.updateFile(
      updateData.id,
      updateData
    );

    // 🔄 Smart cache invalidation
    revalidateTag("user-files");
    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      data: updated,
      message: "Archivo actualizado exitosamente",
      timestamp,
    };
  } catch (error) {
    console.error("📝 Update File Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error actualizando archivo",
      timestamp,
    };
  }
}

export async function deleteFileServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();
  const requestId = `delete-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // 🗑️ Starting file deletion process

  try {
    // 🛡️ Auth & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Parse form data
    const id = formData.get("id") as string;
    // 🗑️ Processing deletion request

    if (!id) {
      console.log("🗑️ DELETE SERVER: Missing ID", { requestId });
      return {
        success: false,
        error: "ID de archivo requerido",
        timestamp,
      };
    }

    // ✅ Use schema validation
    const validated = parseDeleteUploadInput({ id });

    console.log("🗑️ DELETE SERVER: Calling service deleteFile", {
      requestId,
      fileId: validated.id,
    });

    await fileUploadService.deleteFile(validated.id);

    // 📁 Log successful file deletion (CRÍTICO)
    fileUploadServerActionLogger.fileOperation(
      "DELETE_FILE",
      `file-${validated.id}`,
      true,
      {
        fileId: validated.id,
        userId: session.user.id,
        requestId,
      }
    );

    // 🔄 Smart cache invalidation
    revalidateTag("user-files");
    revalidateTag("file-stats");
    revalidatePath("/files");
    revalidatePath("/admin/files");

    console.log("✅ DELETE SERVER: Cache invalidated", {
      requestId,
      fileId: validated.id,
    });

    return {
      success: true,
      message: "Archivo eliminado exitosamente",
      timestamp,
    };
  } catch (error) {
    fileUploadServerActionLogger.error("File deletion failed", error, {
      requestId,
    });

    // 📁 Log failed file deletion (CRÍTICO)
    const fileId = formData.get("id") as string;
    if (fileId) {
      fileUploadServerActionLogger.fileOperation(
        "DELETE_FILE",
        `file-${fileId}`,
        false,
        {
          fileId,
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error eliminando archivo",
      timestamp,
    };
  }
}

export async function deleteMultipleFilesServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Parse IDs from form data
    const idsString = formData.get("ids") as string;
    if (!idsString) {
      return {
        success: false,
        error: "IDs de archivos requeridos",
        timestamp,
      };
    }

    const ids = JSON.parse(idsString) as string[];
    const result = await fileUploadService.deleteMultipleFiles(ids);

    // 🔄 Smart cache invalidation
    revalidateTag("user-files");
    revalidateTag("file-stats");
    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      data: result,
      message: `${result.deleted} archivos eliminados`,
      timestamp,
    };
  } catch (error) {
    console.error("🗑️ Bulk Delete Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error eliminando archivos",
      timestamp,
    };
  }
}

export async function getFileStatsServerAction(
  formData?: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Parse optional user ID (for admins)
    const targetUserIdFromForm = formData?.get("userId");
    const userId =
      targetUserIdFromForm && targetUserIdFromForm !== ""
        ? (targetUserIdFromForm as string)
        : session.user.id;

    // 🛡️ Permission check for viewing other users' stats
    if (
      userId !== session.user.id &&
      session.user.role !== "admin" &&
      session.user.role !== "super_admin"
    ) {
      return {
        success: false,
        error: "Permisos insuficientes",
        timestamp,
      };
    }

    // Only pass userId if it's a valid UUID format, otherwise pass undefined
    const statsInputData: { userId?: string; period?: string } = {};

    // Use the same UUID validation function
    const isValidUUID = (id: string) =>
      id &&
      id.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
      );

    if (isValidUUID(userId)) {
      statsInputData.userId = userId;
    }

    // Add period if provided
    const period = formData?.get("period");
    if (period && ["day", "week", "month", "year"].includes(period as string)) {
      statsInputData.period = period as string;
    }

    const statsInput = parseGetStatsInput(statsInputData);
    const stats = await fileUploadService.getStats(statsInput);

    return {
      success: true,
      data: stats,
      timestamp,
    };
  } catch (error) {
    console.error("📊 Get Stats Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo estadísticas",
      timestamp,
    };
  }
}

export async function getSignedUrlServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    // 📋 Parse form data
    const filename = formData.get("filename") as string;
    const mimeType = formData.get("mimeType") as string;
    const isPublic = formData.get("isPublic") === "true";

    if (!filename || !mimeType) {
      return {
        success: false,
        error: "Nombre de archivo y tipo MIME requeridos",
        timestamp,
      };
    }

    // ✅ Use schema validation
    const validated = parseGetSignedUrlInput({
      filename,
      mimeType,
      isPublic,
    });

    const signedUrl = await fileUploadService.getSignedUrl(
      validated.filename,
      validated.mimeType,
      validated.isPublic
    );

    return {
      success: true,
      data: signedUrl,
      timestamp,
    };
  } catch (error) {
    console.error("🔗 Signed URL Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error generando URL firmada",
      timestamp,
    };
  }
}

// ========================
// 📁 CATEGORY ACTIONS (Enterprise)
// ========================

export async function createCategoryServerAction(
  formData: FormData
): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth & Admin Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      return {
        success: false,
        error: "Permisos insuficientes",
        timestamp,
      };
    }

    // 📋 Parse form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    const maxSize = formData.get("maxSize") as string;
    const allowedTypesString = formData.get("allowedTypes") as string;

    if (!name || !allowedTypesString) {
      return {
        success: false,
        error: "Nombre y tipos permitidos son requeridos",
        timestamp,
      };
    }

    // ✅ Use schema validation
    const categoryData = parseCreateCategoryInput({
      name,
      description,
      icon,
      maxSize: maxSize ? parseInt(maxSize) : undefined,
      allowedTypes: JSON.parse(allowedTypesString),
    });

    const category = await fileCategoryService.createCategory(categoryData);

    // 🔄 Smart cache invalidation
    revalidateTag("file-categories");
    revalidatePath("/admin/files");
    revalidatePath("/admin/categories");

    return {
      success: true,
      data: category,
      message: `Categoría "${name}" creada exitosamente`,
      timestamp,
    };
  } catch (error) {
    console.error("📁 Create Category Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error creando categoría",
      timestamp,
    };
  }
}

export async function getCategoriesServerAction(): Promise<FileActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "No autorizado",
        timestamp,
      };
    }

    const categories = await fileCategoryService.getCategories();

    return {
      success: true,
      data: categories,
      timestamp,
    };
  } catch (error) {
    console.error("📁 Get Categories Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error obteniendo categorías",
      timestamp,
    };
  }
}

// ========================
// 🎯 LEGACY COMPATIBILITY FUNCTIONS
// ========================
// Backwards compatibility with existing code (will be deprecated)

// Re-export main functions with old names for compatibility
export const uploadFileAction = uploadFileServerAction;
export const getFilesAction = getFilesServerAction;
export const updateFileAction = updateFileServerAction;
export const deleteFileAction = deleteFileServerAction;
export const getFileStatsAction = getFileStatsServerAction;
export const createCategoryAction = createCategoryServerAction;
export const getCategoriesAction = getCategoriesServerAction;

// 🎯 Additional utility actions
export const generateSignedUrlServerAction = getSignedUrlServerAction;
