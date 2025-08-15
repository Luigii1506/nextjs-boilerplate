// 🎯 FILE UPLOAD SERVICES
// =======================
// Capa de lógica de negocio para file-upload

import { Prisma } from "@prisma/client";
import type {
  UploadFileInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  UpdateUploadInput,
  FileFilters,
  GetStatsInput,
} from "../../schemas";
import {
  validateUploadFile,
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryDeletion,
  validateFileFilters,
  validateBulkUpload,
} from "../validators";
import {
  createUploadQuery,
  updateUploadQuery,
  deleteUploadQuery,
  bulkDeleteUploadsQuery,
  getAllUploadsQuery,
  getUploadByIdQuery,
  getUploadStatsQuery,
  createCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
  getAllCategoriesQuery,
  getCategoryByIdQuery,
} from "../queries";
import {
  mapPrismaToUploadFile,
  mapUploadToCardData,
  mapPrismaToCategoryDomain,
  mapStatsToFileStats,
} from "../mappers";
import { LocalUploadProvider } from "../../providers/local-upload";
import { S3UploadProvider } from "../../providers/s3-upload";
import type { UploadProvider } from "../../types";

// ========================
// 🎯 UPLOAD SERVICE
// ========================

export class FileUploadService {
  private providers = {
    local: new LocalUploadProvider(),
    s3: new S3UploadProvider(),
  };

  // Crear upload
  async uploadFile(
    file: File,
    userId: string,
    provider: UploadProvider = "local",
    categoryId?: string
  ) {
    // Validar que el provider esté soportado
    const supportedProvider = provider === "cloudinary" ? "s3" : provider;
    if (!this.providers[supportedProvider as keyof typeof this.providers]) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    const uploadInput: UploadFileInput = {
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      provider,
      isPublic: false,
      tags: [],
    };

    // Validar archivo
    const validation = await validateUploadFile(uploadInput, file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      // Upload usando provider específico
      const uploadResult = await this.providers[
        supportedProvider as keyof typeof this.providers
      ].upload(file, {
        userId,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      // Guardar en base de datos
      const dbRecord = await createUploadQuery({
        filename: uploadResult.filename || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        provider: supportedProvider,
        url: uploadResult.url || "",
        key: uploadResult.key,
        bucket: uploadResult.bucket,
        userId,
        categoryId,
        isPublic: false,
        tags: [],
        metadata: uploadResult.metadata as Prisma.InputJsonValue,
      });

      return mapPrismaToUploadFile(dbRecord);
    } catch (error) {
      throw new Error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Bulk upload
  async uploadMultipleFiles(
    files: File[],
    userId: string,
    provider: UploadProvider = "local",
    categoryId?: string
  ) {
    // Validar bulk upload
    const validation = await validateBulkUpload(files);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(
          file,
          userId,
          provider,
          categoryId
        );
        results.push(result);
      } catch (error) {
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { results, errors };
  }

  // Obtener archivos
  async getFiles(filters?: FileFilters) {
    if (filters) {
      const validation = validateFileFilters(filters);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
    }

    const uploads = await getAllUploadsQuery(filters);
    return uploads.map(mapPrismaToUploadFile);
  }

  // Obtener archivos como cards para UI
  async getFilesForUI(filters?: FileFilters) {
    const uploads = await this.getFiles(filters);
    return uploads.map(mapUploadToCardData);
  }

  // Obtener archivo por ID
  async getFileById(id: string) {
    const upload = await getUploadByIdQuery(id);
    if (!upload) {
      throw new Error(`File with ID '${id}' not found`);
    }
    return mapPrismaToUploadFile(upload);
  }

  // Actualizar archivo
  async updateFile(id: string, input: UpdateUploadInput) {
    // Destructure to exclude id from update data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _unused, ...updateData } = input;

    // Convertir metadata al tipo correcto si existe
    const prismaUpdateData = {
      ...updateData,
      metadata: updateData.metadata as Prisma.InputJsonValue,
    };

    const updated = await updateUploadQuery(id, prismaUpdateData);
    return mapPrismaToUploadFile(updated);
  }

  // Eliminar archivo
  async deleteFile(id: string) {
    const upload = await getUploadByIdQuery(id);
    if (!upload) {
      throw new Error(`File with ID '${id}' not found`);
    }

    try {
      // Eliminar del proveedor
      const supportedProvider =
        upload.provider === "cloudinary" ? "s3" : upload.provider;
      const provider =
        this.providers[supportedProvider as keyof typeof this.providers];
      if (upload.key && provider) {
        await provider.delete(upload.key);
      }

      // Eliminar de BD
      await deleteUploadQuery(id);

      return { success: true };
    } catch (error) {
      throw new Error(
        `Delete failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Eliminar múltiples archivos
  async deleteMultipleFiles(ids: string[]) {
    const uploads = await Promise.all(ids.map((id) => getUploadByIdQuery(id)));

    const existingUploads = uploads.filter(Boolean);
    const errors = [];

    // Eliminar de proveedores
    for (const upload of existingUploads) {
      if (upload && upload.key) {
        try {
          const supportedProvider =
            upload.provider === "cloudinary" ? "s3" : upload.provider;
          const provider =
            this.providers[supportedProvider as keyof typeof this.providers];
          if (provider) {
            await provider.delete(upload.key);
          }
        } catch (error) {
          errors.push({
            id: upload.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    // Eliminar de BD
    await bulkDeleteUploadsQuery(ids);

    return {
      deleted: existingUploads.length,
      errors,
    };
  }

  // Obtener estadísticas
  async getStats(input?: GetStatsInput) {
    const stats = await getUploadStatsQuery(input?.userId);
    return mapStatsToFileStats(stats);
  }

  // Generar URL firmada (para S3)
  async getSignedUrl(filename: string, mimeType: string, isPublic = false) {
    const s3Provider = this.providers.s3;
    return await s3Provider.getSignedUrl(filename, mimeType, isPublic);
  }
}

// ========================
// 📁 CATEGORY SERVICE
// ========================

export class FileCategoryService {
  // Crear categoría
  async createCategory(input: CreateCategoryInput) {
    const validation = await validateCreateCategory(input);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const category = await createCategoryQuery(input);
    return mapPrismaToCategoryDomain(category);
  }

  // Obtener todas las categorías
  async getCategories() {
    const categories = await getAllCategoriesQuery();
    return categories.map(mapPrismaToCategoryDomain);
  }

  // Obtener categoría por ID
  async getCategoryById(id: string) {
    const category = await getCategoryByIdQuery(id);
    if (!category) {
      throw new Error(`Category with ID '${id}' not found`);
    }
    return mapPrismaToCategoryDomain(category);
  }

  // Actualizar categoría
  async updateCategory(id: string, input: UpdateCategoryInput) {
    const validation = await validateUpdateCategory(id, input);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Destructure to exclude id from update data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _unused, ...updateData } = input;
    const updated = await updateCategoryQuery(id, updateData);
    return mapPrismaToCategoryDomain(updated);
  }

  // Eliminar categoría
  async deleteCategory(id: string) {
    const validation = await validateCategoryDeletion(id);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    await deleteCategoryQuery(id);
    return { success: true };
  }
}

// ========================
// 📦 EXPORTS
// ========================

export const fileUploadService = new FileUploadService();
export const fileCategoryService = new FileCategoryService();
