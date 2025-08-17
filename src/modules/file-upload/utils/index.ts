// 🛠️ FILE UPLOAD UTILITIES - ENTERPRISE GRADE
// ==============================================
// Utilities compartidos para evitar código duplicado

import React from "react";
import {
  Image as LucideImage,
  File,
  Video,
  Music,
  FileText,
} from "lucide-react";

// 🎯 ENTERPRISE UTILITIES - Shared across components

/**
 * Formatea el tamaño de archivo de bytes a formato legible
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatea fecha para mostrar en componentes
 * @param dateString - String de fecha ISO
 * @returns Fecha formateada en español
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formatea fecha simple sin hora
 * @param dateString - String de fecha ISO
 * @returns Fecha formateada simple
 */
export const formatDateSimple = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Obtiene el ícono apropiado según el tipo MIME
 * @param mimeType - Tipo MIME del archivo
 * @param size - Tamaño del ícono (por defecto 24)
 * @returns Componente React con el ícono
 */
export const getFileIcon = (
  mimeType: string,
  size: number = 24
): React.ReactElement => {
  const iconProps = { size, className: "flex-shrink-0" };

  if (mimeType.startsWith("image/"))
    return React.createElement(LucideImage, {
      ...iconProps,
      className: "flex-shrink-0 text-blue-500",
    });

  if (mimeType.startsWith("video/"))
    return React.createElement(Video, {
      ...iconProps,
      className: "flex-shrink-0 text-purple-500",
    });

  if (mimeType.startsWith("audio/"))
    return React.createElement(Music, {
      ...iconProps,
      className: "flex-shrink-0 text-green-500",
    });

  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return React.createElement(FileText, {
      ...iconProps,
      className: "flex-shrink-0 text-red-500",
    });

  return React.createElement(File, {
    ...iconProps,
    className: "flex-shrink-0 text-slate-500",
  });
};

/**
 * Obtiene la clase CSS para el grid responsivo según columnas
 * @param columns - Número de columnas deseadas
 * @returns String con clases CSS de Tailwind
 */
export const getGridColumns = (columns: number): string => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  };

  return gridClasses[columns as keyof typeof gridClasses] || gridClasses[3];
};

/**
 * Valida si un archivo es válido según configuración
 * @param file - Archivo a validar
 * @param config - Configuración de validación
 * @returns String con error o null si es válido
 */
export const validateFile = (
  file: File,
  config: {
    maxFileSize: number;
    allowedTypes: string[];
  }
): string | null => {
  // Validar tamaño
  if (file.size > config.maxFileSize) {
    return `El archivo es muy grande. Máximo ${formatFileSize(
      config.maxFileSize
    )}`;
  }

  // Validar tipo MIME
  const mimeType = file.type;
  const isValidType = config.allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return mimeType.startsWith(type.slice(0, -1));
    }
    return mimeType === type;
  });

  if (!isValidType) {
    return `Tipo de archivo no permitido. Permitidos: ${config.allowedTypes.join(
      ", "
    )}`;
  }

  return null;
};

/**
 * Obtiene el porcentaje de uso de almacenamiento
 * @param used - Espacio usado
 * @param limit - Límite total
 * @returns Porcentaje (0-100)
 */
export const getStoragePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.round((used / limit) * 100);
};

/**
 * Obtiene la clase CSS de color según porcentaje de uso
 * @param percentage - Porcentaje de uso
 * @returns Clase CSS de color
 */
export const getStorageColor = (percentage: number): string => {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 75) return "bg-yellow-500";
  return "bg-blue-500";
};

/**
 * Detecta si un archivo es una imagen
 * @param mimeType - Tipo MIME
 * @returns true si es imagen
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith("image/");
};

/**
 * Obtiene la extensión del archivo
 * @param filename - Nombre del archivo
 * @returns Extensión sin el punto
 */
export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toUpperCase() || "";
};

/**
 * Genera un ID temporal para optimistic UI
 * @returns ID temporal único
 */
export const generateTempId = (): string => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 🎯 ENTERPRISE CONSTANTS
export const FILE_UPLOAD_CONSTANTS = {
  // Límites por defecto
  DEFAULT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_ALLOWED_TYPES: ["image/*", "application/pdf", "text/*"],
  
  // Configuraciones de UI
  DEFAULT_GRID_COLUMNS: 3,
  UPLOAD_PROGRESS_UPDATE_INTERVAL: 100,
  
  // Colores para tipos de archivo
  FILE_TYPE_COLORS: {
    image: "text-blue-500",
    video: "text-purple-500",
    audio: "text-green-500",
    document: "text-red-500",
    default: "text-slate-500",
  },
  
  // Mensajes por defecto
  MESSAGES: {
    NO_FILES: "No hay archivos",
    DRAG_DROP: "Arrastra archivos aquí o haz clic para seleccionar",
    UPLOAD_SUCCESS: "Archivos subidos correctamente",
    UPLOAD_ERROR: "Error al subir archivos",
    DELETE_CONFIRM: "¿Estás seguro de que quieres eliminar este archivo?",
  },
} as const;