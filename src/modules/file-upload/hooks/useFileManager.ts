// 🗂️ USE FILE MANAGER HOOK
// ========================
// Hook para gestión de archivos usando Server Actions (React Compiler optimized)

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  getFilesAction,
  getCategoriesAction,
  deleteFileAction,
  getFileStatsAction,
  generateSignedUrlServerAction,
} from "../server/actions";
import type {
  UploadCardData,
  FileCategory,
  UseFileManagerReturn,
} from "../types";

export function useFileManager(): UseFileManagerReturn {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // ⚡ Cargar archivos del usuario (React Compiler will memoize)
  const loadFiles = useCallback(
    async (filters?: {
      search?: string;
      provider?: string;
      mimeType?: string;
      categoryId?: string;
      page?: number;
      limit?: number;
    }) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // ✅ Usar server action en lugar de fetch directo
        const result = await getFilesAction(filters);

        if (result.success && result.data) {
          setFiles(result.data);
        } else {
          setError(result.error || "Error cargando archivos");
        }
      } catch {
        setError("Error de conexión al cargar archivos");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // ⚡ Cargar categorías (React Compiler will memoize)
  const loadCategories = useCallback(async () => {
    if (!user) return;

    try {
      // ✅ Usar server action en lugar de fetch directo
      const result = await getCategoriesAction();

      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (err) {
      console.warn("Error loading categories:", err);
    }
  }, [user]);

  // ⚡ Eliminar archivo (React Compiler will memoize)
  const deleteFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!user) return;

      try {
        // ✅ Usar server action en lugar de fetch directo
        const result = await deleteFileAction({ id: fileId });

        if (result.success) {
          // Remover archivo de la lista local
          setFiles((prev) => prev.filter((file) => file.id !== fileId));
        } else {
          setError(result.error || "Error eliminando archivo");
        }
      } catch {
        setError("Error de conexión al eliminar archivo");
      }
    },
    [user]
  );

  // ⚡ Descargar archivo (React Compiler optimized)
  const downloadFile = async (file: UploadCardData) => {
    try {
      if (file.isPublic) {
        // Archivo público - usar URL directa
        window.open(file.url, "_blank");
      } else if (file.provider === "s3") {
        // ✅ Archivo privado en S3 - usar Server Action
        const formData = new FormData();
        formData.append("fileId", file.id);
        formData.append("expiresIn", "300");

        const result = await generateSignedUrlServerAction(formData);

        if (
          result.success &&
          result.data &&
          typeof result.data === "object" &&
          "url" in result.data
        ) {
          window.open((result.data as { url: string }).url, "_blank");
        } else {
          setError(result.error || "Error generando enlace de descarga");
        }
      } else {
        // Archivo local - usar URL directa
        window.open(file.url, "_blank");
      }
    } catch {
      setError("Error al descargar archivo");
    }
  };

  // ⚡ Buscar archivos con filtros actuales (React Compiler will memoize)
  const searchFiles = useCallback(
    (query: string) => {
      loadFiles({
        search: query,
        categoryId: selectedCategory || undefined,
        provider: selectedProvider || undefined,
      });
    },
    [loadFiles, selectedCategory, selectedProvider]
  );

  // ⚡ Filtrar por provider (React Compiler will memoize)
  const filterByProvider = useCallback(
    (provider: string | null) => {
      setSelectedProvider(provider);
      loadFiles({
        provider: provider || undefined,
        categoryId: selectedCategory || undefined,
      });
    },
    [loadFiles, selectedCategory]
  );

  // ⚡ Cambiar categoría seleccionada (React Compiler will memoize)
  const handleCategoryChange = useCallback(
    (categoryId: string | null) => {
      setSelectedCategory(categoryId);
      loadFiles({
        categoryId: categoryId || undefined,
        provider: selectedProvider || undefined,
      });
    },
    [loadFiles, selectedProvider]
  );

  // ⚡ Refrescar archivos (React Compiler will memoize)
  const refreshFiles = useCallback(async (): Promise<void> => {
    await loadFiles({
      categoryId: selectedCategory || undefined,
      provider: selectedProvider || undefined,
    });
  }, [loadFiles, selectedCategory, selectedProvider]);

  // ⚡ Cargar datos iniciales (optimized for React Compiler)
  useEffect(() => {
    if (user) {
      loadFiles();
      loadCategories();
    }
  }, [user, loadFiles, loadCategories]); // React Compiler will optimize these

  return {
    files,
    loading,
    error,
    categories,
    selectedCategory,
    selectedProvider,
    setSelectedCategory: handleCategoryChange,
    setSelectedProvider: filterByProvider,
    refreshFiles,
    deleteFile,
    downloadFile,
    searchFiles,
  };
}

// Hook para estadísticas de archivos
export function useFileStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    byProvider: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⚡ Cargar estadísticas (React Compiler will memoize)
  const loadStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ Usar server action en lugar de fetch directo
      const result = await getFileStatsAction();

      if (result.success && result.data) {
        // Transformar arrays a Records para compatibilidad
        const byProvider: Record<string, number> = {};
        const byType: Record<string, number> = {};

        // Convertir byProvider array a Record
        if (result.data.byProvider) {
          result.data.byProvider.forEach((item) => {
            byProvider[item.provider] = item.count;
          });
        }

        // Convertir byMimeType array a Record
        if (result.data.byMimeType) {
          result.data.byMimeType.forEach((item) => {
            byType[item.mimeType] = item.count;
          });
        }

        setStats({
          totalFiles: result.data.totalFiles,
          totalSize: result.data.totalSize,
          byProvider,
          byType,
        });
      } else {
        setError(result.error || "Error cargando estadísticas");
      }
    } catch {
      setError("Error de conexión al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ⚡ Refrescar estadísticas (React Compiler will memoize)
  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  // Formatear tamaño total
  const formattedTotalSize = `${
    Math.round(((stats.totalSize || 0) / (1024 * 1024)) * 100) / 100
  } MB`;

  // ⚡ Cargar estadísticas al montar (optimized for React Compiler)
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, loadStats]); // React Compiler will optimize these

  return {
    stats,
    loading,
    error,
    refreshStats,
    formattedTotalSize,
  };
}
