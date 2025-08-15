// ⚡ FILE UPLOAD ACTIONS
// =====================
// Server Actions para file-upload

"use server";

import { revalidatePath } from "next/cache";
import {
  parseUpdateUploadInput,
  parseDeleteUploadInput,
  parseCreateCategoryInput,
  parseFileFilters,
  parseGetStatsInput,
  parseGetSignedUrlInput,
} from "../../schemas";
import { fileUploadService, fileCategoryService } from "../services";

// ========================
// 📤 UPLOAD ACTIONS
// ========================

export async function uploadFileAction(
  formData: FormData,
  userId: string,
  provider: "local" | "s3" = "local",
  categoryId?: string
) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    const result = await fileUploadService.uploadFile(
      file,
      userId,
      provider,
      categoryId
    );

    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function uploadMultipleFilesAction(
  formData: FormData,
  userId: string,
  provider: "local" | "s3" = "local",
  categoryId?: string
) {
  try {
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return {
        success: false,
        error: "No files provided",
      };
    }

    const result = await fileUploadService.uploadMultipleFiles(
      files,
      userId,
      provider,
      categoryId
    );

    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function getFilesAction(filtersInput?: unknown) {
  try {
    const filters = filtersInput ? parseFileFilters(filtersInput) : undefined;
    const files = await fileUploadService.getFilesForUI(filters);

    return {
      success: true,
      data: files,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch files",
    };
  }
}

export async function getFileByIdAction(id: string) {
  try {
    const file = await fileUploadService.getFileById(id);

    return {
      success: true,
      data: file,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "File not found",
    };
  }
}

export async function updateFileAction(input: unknown) {
  try {
    const validated = parseUpdateUploadInput(input);
    const updated = await fileUploadService.updateFile(validated.id, validated);

    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function deleteFileAction(input: unknown) {
  try {
    const validated = parseDeleteUploadInput(input);
    await fileUploadService.deleteFile(validated.id);

    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export async function deleteMultipleFilesAction(ids: string[]) {
  try {
    const result = await fileUploadService.deleteMultipleFiles(ids);

    revalidatePath("/files");
    revalidatePath("/admin/files");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bulk delete failed",
    };
  }
}

export async function getFileStatsAction(input?: unknown) {
  try {
    const validated = input ? parseGetStatsInput(input) : undefined;
    const stats = await fileUploadService.getStats(validated);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get stats",
    };
  }
}

export async function getSignedUrlAction(input: unknown) {
  try {
    const validated = parseGetSignedUrlInput(input);
    const signedUrl = await fileUploadService.getSignedUrl(
      validated.filename,
      validated.mimeType,
      validated.isPublic
    );

    return {
      success: true,
      data: signedUrl,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate signed URL",
    };
  }
}

// ========================
// 📁 CATEGORY ACTIONS
// ========================

export async function createCategoryAction(input: unknown) {
  try {
    const validated = parseCreateCategoryInput(input);
    const category = await fileCategoryService.createCategory(validated);

    revalidatePath("/admin/files");
    revalidatePath("/admin/categories");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function getCategoriesAction() {
  try {
    const categories = await fileCategoryService.getCategories();

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

export async function getCategoryByIdAction(id: string) {
  try {
    const category = await fileCategoryService.getCategoryById(id);

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Category not found",
    };
  }
}

export async function updateCategoryAction(id: string, input: unknown) {
  try {
    const validated = { id, ...parseCreateCategoryInput(input) };
    const updated = await fileCategoryService.updateCategory(id, validated);

    revalidatePath("/admin/files");
    revalidatePath("/admin/categories");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await fileCategoryService.deleteCategory(id);

    revalidatePath("/admin/files");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}

// ========================
// 🚀 SERVER ACTION FORM WRAPPERS (React 19 + Next.js 15)
// ========================
// FormData compatible wrappers for client components using useActionState

import { auth } from "@/core/auth/server/auth";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";

// 🎯 Action result interface for form actions
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 📤 GET Files Server Action (for forms)
export async function getFilesServerAction(): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    const result = await getFilesAction({ userId: session.user.id });

    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error getting files",
    };
  }
}

// 📊 Get File Stats Server Action (for forms)
export async function getFileStatsServerAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    const userId = (formData.get("userId") as string) || session.user.id;

    // Verify permissions
    if (
      userId !== session.user.id &&
      session.user.role !== "admin" &&
      session.user.role !== "super_admin"
    ) {
      throw new Error("No autorizado para ver estas estadísticas");
    }

    const result = await getFileStatsAction({ userId });

    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error getting stats",
    };
  }
}

// 🔑 Generate Signed URL Server Action (for forms)
export async function generateSignedUrlServerAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    const key = formData.get("key") as string;
    const fileId = formData.get("fileId") as string;
    const expiresIn = parseInt((formData.get("expiresIn") as string) || "3600");

    if (!key && !fileId) {
      throw new Error("Key de archivo o ID de archivo requerido");
    }

    // 🎯 ENTERPRISE-GRADE: Use configured expiration time
    const result = await getSignedUrlAction({
      filename: key || fileId,
      mimeType:
        (formData.get("mimeType") as string) || "application/octet-stream",
      isPublic: formData.get("isPublic") === "true",
      expiresIn,
    });

    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error generating signed URL",
    };
  }
}

// 📁 Get Categories Server Action (for forms)
export async function getCategoriesServerAction(): Promise<
  ActionResult<unknown>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    const result = await getCategoriesAction();

    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error getting categories",
    };
  }
}

// 📁 Create Category Server Action (for forms)
export async function createCategoryServerAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      throw new Error("Permisos insuficientes");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    const maxSize = formData.get("maxSize") as string;
    const allowedTypesString = formData.get("allowedTypes") as string;

    if (!name || !allowedTypesString) {
      throw new Error("Nombre y tipos de archivo son requeridos");
    }

    const allowedTypes = JSON.parse(allowedTypesString);

    const result = await createCategoryAction({
      name,
      description,
      icon,
      maxSize: maxSize ? parseInt(maxSize) : undefined,
      allowedTypes,
    });

    revalidateTag("file-categories");

    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error creating category",
    };
  }
}

// 📁 Update Category Server Action (for forms)
export async function updateCategoryServerAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      throw new Error("Permisos insuficientes");
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    const maxSize = formData.get("maxSize") as string;
    const allowedTypesString = formData.get("allowedTypes") as string;

    if (!id) {
      throw new Error("ID de categoría requerido");
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (maxSize) updateData.maxSize = parseInt(maxSize);
    if (allowedTypesString)
      updateData.allowedTypes = JSON.parse(allowedTypesString);

    const result = await updateCategoryAction(id, updateData);

    revalidateTag("file-categories");

    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error updating category",
    };
  }
}

// 📁 Delete Category Server Action (for forms)
export async function deleteCategoryServerAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      throw new Error("Permisos insuficientes");
    }

    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("ID de categoría requerido");
    }

    const result = await deleteCategoryAction(id);

    revalidateTag("file-categories");

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error deleting category",
    };
  }
}

// 📤 Update File Server Action (for forms)
export async function updateFileServerAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("ID de archivo requerido");
    }

    // Build update object from form data
    const updateData: Record<string, unknown> = { id };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic");

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== null) updateData.isPublic = isPublic === "true";

    const result = await updateFileAction(updateData);

    revalidateTag("user-files");

    return {
      success: result.success,
      data: result.data,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error updating file",
    };
  }
}

// 🗑️ Delete File Server Action (for forms)
export async function deleteFileServerAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("ID de archivo requerido");
    }

    const result = await deleteFileAction({ id });

    revalidateTag("user-files");

    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error deleting file",
    };
  }
}
