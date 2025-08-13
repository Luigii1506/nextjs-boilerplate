// ✅ FILE UPLOAD VALIDATORS
// =========================
// Validadores de reglas de negocio para file-upload

import type {
  UploadFileInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  FileFilters,
} from "../../schemas";
import { getCategoryByIdQuery, getAllCategoriesQuery } from "../queries";

// ========================
// 📤 UPLOAD VALIDATORS
// ========================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export const validateUploadFile = async (
  input: UploadFileInput,
  file?: File
): Promise<ValidationResult> => {
  // Validar categoría si se especifica
  if (input.categoryId) {
    const categoryValidation = await validateCategoryExists(input.categoryId);
    if (!categoryValidation.isValid) {
      return categoryValidation;
    }

    // Validar restricciones de categoría
    const category = await getCategoryByIdQuery(input.categoryId);
    if (category) {
      // Validar tamaño máximo
      if (category.maxSize && input.size > category.maxSize) {
        return {
          isValid: false,
          error: `File size exceeds category limit of ${formatBytes(
            category.maxSize
          )}`,
          details: { maxSize: category.maxSize, fileSize: input.size },
        };
      }

      // Validar tipos permitidos
      if (category.allowedTypes.length > 0) {
        const isAllowed = category.allowedTypes.some(
          (type) =>
            input.mimeType.includes(type) || input.mimeType.startsWith(type)
        );
        if (!isAllowed) {
          return {
            isValid: false,
            error: `File type '${input.mimeType}' not allowed for this category`,
            details: {
              allowedTypes: category.allowedTypes,
              fileType: input.mimeType,
            },
          };
        }
      }
    }
  }

  // Validar tamaño global (100MB por defecto)
  const maxGlobalSize = 100 * 1024 * 1024; // 100MB
  if (input.size > maxGlobalSize) {
    return {
      isValid: false,
      error: `File size exceeds global limit of ${formatBytes(maxGlobalSize)}`,
      details: { maxSize: maxGlobalSize, fileSize: input.size },
    };
  }

  // Validar tipos de archivo peligrosos
  const dangerousTypes = [
    "application/x-executable",
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-dosexec",
    "application/x-winexe",
  ];

  if (dangerousTypes.includes(input.mimeType)) {
    return {
      isValid: false,
      error: "Executable files are not allowed for security reasons",
      details: { fileType: input.mimeType },
    };
  }

  // Validar extensión vs MIME type si tenemos el archivo
  if (file) {
    const extensionValidation = validateFileExtension(
      file.name,
      input.mimeType
    );
    if (!extensionValidation.isValid) {
      return extensionValidation;
    }
  }

  return { isValid: true };
};

export const validateFileExtension = (
  filename: string,
  mimeType: string
): ValidationResult => {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension) {
    return {
      isValid: false,
      error: "File must have an extension",
    };
  }

  // Mapeo básico de extensiones a MIME types
  const mimeTypeMap: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/gif": ["gif"],
    "image/webp": ["webp"],
    "application/pdf": ["pdf"],
    "text/plain": ["txt"],
    "application/json": ["json"],
    "text/csv": ["csv"],
    "application/zip": ["zip"],
    "application/x-rar-compressed": ["rar"],
  };

  // Buscar si el MIME type coincide con la extensión
  for (const [mime, extensions] of Object.entries(mimeTypeMap)) {
    if (
      mimeType.includes(mime.split("/")[0]) &&
      extensions.includes(extension)
    ) {
      return { isValid: true };
    }
  }

  // Si no encontramos una coincidencia exacta, permitir si el tipo general coincide
  const generalType = mimeType.split("/")[0];
  const extensionGeneralMap: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"],
    video: ["mp4", "avi", "mov", "wmv", "flv", "webm"],
    audio: ["mp3", "wav", "flac", "aac", "ogg"],
    text: ["txt", "md", "csv", "json", "xml", "html", "css", "js", "ts"],
  };

  if (extensionGeneralMap[generalType]?.includes(extension)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: `File extension '${extension}' doesn't match MIME type '${mimeType}'`,
    details: { extension, mimeType },
  };
};

export const validateBulkUpload = async (
  files: File[]
): Promise<ValidationResult> => {
  // Validar número máximo de archivos
  const maxFiles = 50;
  if (files.length > maxFiles) {
    return {
      isValid: false,
      error: `Cannot upload more than ${maxFiles} files at once`,
      details: { maxFiles, fileCount: files.length },
    };
  }

  // Validar tamaño total
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = 500 * 1024 * 1024; // 500MB
  if (totalSize > maxTotalSize) {
    return {
      isValid: false,
      error: `Total size exceeds limit of ${formatBytes(maxTotalSize)}`,
      details: { maxTotalSize, totalSize },
    };
  }

  return { isValid: true };
};

// ========================
// 📁 CATEGORY VALIDATORS
// ========================

export const validateCreateCategory = async (
  input: CreateCategoryInput
): Promise<ValidationResult> => {
  // Validar nombre único
  const categories = await getAllCategoriesQuery();
  const existingCategory = categories.find(
    (cat) => cat.name.toLowerCase() === input.name.toLowerCase()
  );

  if (existingCategory) {
    return {
      isValid: false,
      error: `Category with name '${input.name}' already exists`,
      details: { existingId: existingCategory.id },
    };
  }

  // Validar tipos permitidos
  if (input.allowedTypes.length > 0) {
    const validMimeTypes = input.allowedTypes.every(
      (type) =>
        type.includes("/") ||
        ["image", "video", "audio", "text", "application"].includes(type)
    );

    if (!validMimeTypes) {
      return {
        isValid: false,
        error: "Invalid MIME types in allowedTypes",
        details: { allowedTypes: input.allowedTypes },
      };
    }
  }

  return { isValid: true };
};

export const validateUpdateCategory = async (
  id: string,
  input: UpdateCategoryInput
): Promise<ValidationResult> => {
  // Validar que existe
  const existsValidation = await validateCategoryExists(id);
  if (!existsValidation.isValid) {
    return existsValidation;
  }

  // Validar nombre único si se está cambiando
  if (input.name) {
    const categories = await getAllCategoriesQuery();
    const existingCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase() === input.name!.toLowerCase() && cat.id !== id
    );

    if (existingCategory) {
      return {
        isValid: false,
        error: `Category with name '${input.name}' already exists`,
        details: { existingId: existingCategory.id },
      };
    }
  }

  return { isValid: true };
};

export const validateCategoryExists = async (
  id: string
): Promise<ValidationResult> => {
  const category = await getCategoryByIdQuery(id);

  if (!category) {
    return {
      isValid: false,
      error: `Category with ID '${id}' not found`,
      details: { categoryId: id },
    };
  }

  return { isValid: true };
};

export const validateCategoryDeletion = async (
  id: string
): Promise<ValidationResult> => {
  const category = await getCategoryByIdQuery(id);

  if (!category) {
    return {
      isValid: false,
      error: `Category with ID '${id}' not found`,
    };
  }

  // Verificar si tiene archivos asociados
  if (category._count && category._count.uploads > 0) {
    return {
      isValid: false,
      error: `Cannot delete category with ${category._count.uploads} associated files`,
      details: { uploadsCount: category._count.uploads },
    };
  }

  return { isValid: true };
};

// ========================
// 🔍 FILTER VALIDATORS
// ========================

export const validateFileFilters = (input: FileFilters): ValidationResult => {
  // Validar límites
  if (input.limit && (input.limit < 1 || input.limit > 100)) {
    return {
      isValid: false,
      error: "Limit must be between 1 and 100",
      details: { limit: input.limit },
    };
  }

  if (input.offset && input.offset < 0) {
    return {
      isValid: false,
      error: "Offset must be >= 0",
      details: { offset: input.offset },
    };
  }

  return { isValid: true };
};

// ========================
// 🔧 UTILITY FUNCTIONS
// ========================

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
