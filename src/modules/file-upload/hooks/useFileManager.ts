// 🗂️ USE FILE MANAGER HOOK
// ========================
// Hook para gestión de archivos usando API endpoints

"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  getFilesAction,
  getCategoriesAction,
  deleteFileAction,
  getFileStatsAction,
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

  // Cargar archivos del usuario
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

  // Cargar categorías
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

  // Eliminar archivo
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

  // Descargar archivo
  const downloadFile = useCallback(async (file: UploadCardData) => {
    try {
      if (file.isPublic) {
        // Archivo público - usar URL directa
        window.open(file.url, "_blank");
      } else if (file.provider === "s3") {
        // Archivo privado en S3 - generar URL firmada
        const response = await fetch("/api/modules/file-upload/s3/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: file.id, expiresIn: 300 }),
          credentials: "include", // 🔑 Incluir cookies de sesión
        });

        if (response.ok) {
          const { url } = await response.json();
          window.open(url, "_blank");
        } else {
          setError("Error generando enlace de descarga");
        }
      } else {
        // Archivo local - usar URL directa
        window.open(file.url, "_blank");
      }
    } catch {
      setError("Error al descargar archivo");
    }
  }, []);

  // Buscar archivos con filtros actuales
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

  // Filtrar por provider
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

  // Cambiar categoría seleccionada
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

  // Refrescar archivos
  const refreshFiles = useCallback(async (): Promise<void> => {
    await loadFiles({
      categoryId: selectedCategory || undefined,
      provider: selectedProvider || undefined,
    });
  }, [loadFiles, selectedCategory, selectedProvider]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadFiles();
      loadCategories();
    }
  }, [user, loadFiles, loadCategories]);

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

  // Cargar estadísticas
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

  // Refrescar estadísticas
  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  // Formatear tamaño total
  const formattedTotalSize = `${
    Math.round(((stats.totalSize || 0) / (1024 * 1024)) * 100) / 100
  } MB`;

  // Cargar estadísticas al montar
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
    formattedTotalSize,
  };
}
