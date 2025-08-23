/**
 * 📁 FILE UPLOAD QUERY HOOK - TANSTACK OPTIMIZED
 * ==============================================
 *
 * Hook súper optimizado usando TanStack Query para File Upload.
 * Performance enterprise, cache inteligente, optimistic updates.
 *
 * Enterprise: 2025-01-17 - TanStack Query migration
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import {
  uploadFileServerAction,
  getFilesServerAction,
  deleteFileServerAction,
  updateFileServerAction,
  getFileStatsServerAction,
  getCategoriesServerAction,
} from "../server/actions";
import { generateTempId } from "../utils";
import type {
  UploadFile,
  FileStatsData,
  UploadConfig,
  FileCategory,
  FileFilters,
} from "../types";

// 🎯 Query Keys
export const FILE_UPLOAD_QUERY_KEYS = {
  all: ["file-upload"] as const,
  files: () => [...FILE_UPLOAD_QUERY_KEYS.all, "files"] as const,
  filesList: (filters: FileFilters) =>
    [...FILE_UPLOAD_QUERY_KEYS.files(), filters] as const,
  stats: () => [...FILE_UPLOAD_QUERY_KEYS.all, "stats"] as const,
  userStats: (userId: string, period?: string) =>
    [...FILE_UPLOAD_QUERY_KEYS.stats(), userId, period] as const,
  categories: () => [...FILE_UPLOAD_QUERY_KEYS.all, "categories"] as const,
} as const;

// 📁 Files fetcher function
async function fetchFiles(filters?: FileFilters): Promise<UploadFile[]> {
  const formData = new FormData();

  if (filters?.categoryId) formData.append("categoryId", filters.categoryId);
  if (filters?.provider) formData.append("provider", filters.provider);
  if (filters?.search) formData.append("search", filters.search);
  if (filters?.mimeType) formData.append("mimeType", filters.mimeType);
  if (filters?.isPublic !== undefined)
    formData.append("isPublic", String(filters.isPublic));
  if (filters?.limit) formData.append("limit", String(filters.limit));
  if (filters?.offset) formData.append("offset", String(filters.offset));
  if (filters?.sortBy) formData.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) formData.append("sortOrder", filters.sortOrder);

  const result = await getFilesServerAction(formData);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch files");
  }
  return result.data as UploadFile[];
}

// 📊 Stats fetcher function
async function fetchStats(
  userId?: string,
  period?: string
): Promise<FileStatsData> {
  const formData = new FormData();
  if (userId) formData.append("userId", userId);
  if (period) formData.append("period", period);

  const result = await getFileStatsServerAction(formData);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch stats");
  }
  return result.data as FileStatsData;
}

// 📂 Categories fetcher function
async function fetchCategories(): Promise<FileCategory[]> {
  const result = await getCategoriesServerAction();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch categories");
  }
  return result.data as FileCategory[];
}

/**
 * 📁 USE FILE UPLOAD QUERY
 *
 * Hook principal para gestión de archivos con TanStack Query.
 * Incluye queries, mutations, cache inteligente y optimistic updates.
 */
export function useFileUploadQuery(config?: UploadConfig) {
  const {
    notify,
    error: notifyError,
    success: notifySuccess,
  } = useNotifications();
  const queryClient = useQueryClient();

  // 🔧 Configuration (default values)
  const {
    autoFetch = true,
    enableOptimistic = false, // 🚫 Disabled to prevent flickering during upload
    cacheTime = 10 * 60 * 1000, // 10 min
    staleTime = 30 * 1000, // 30s
    retry = 2,
    retryDelay = (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 5000),
  } = config || {};

  // 📁 FILES QUERY
  const {
    data: files = [],
    isLoading: isFilesLoading,
    isFetching: isFilesFetching,
    error: filesError,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: FILE_UPLOAD_QUERY_KEYS.filesList({}),
    queryFn: () => fetchFiles(),
    enabled: autoFetch,
    staleTime,
    gcTime: cacheTime,
    retry,
    retryDelay,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  // 📊 STATS QUERY
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: FILE_UPLOAD_QUERY_KEYS.userStats("current"),
    queryFn: () => fetchStats(),
    enabled: autoFetch,
    staleTime: 60 * 1000, // 1 min for stats
    gcTime: cacheTime,
    retry,
    retryDelay,
  });

  // 📂 CATEGORIES QUERY
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: FILE_UPLOAD_QUERY_KEYS.categories(),
    queryFn: fetchCategories,
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 min for categories (stable data)
    gcTime: cacheTime,
    retry,
    retryDelay,
  });

  // 📤 UPLOAD FILE MUTATION
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadFile> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("provider", "local"); // Default provider
      formData.append("makePublic", "false");

      const result = await uploadFileServerAction(formData);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload failed");
      }
      return result.data as UploadFile;
    },
    onMutate: enableOptimistic
      ? async (file: File) => {
          // 🔄 Cancel any outgoing refetches
          await queryClient.cancelQueries({
            queryKey: FILE_UPLOAD_QUERY_KEYS.files(),
          });

          // 📸 Snapshot the previous value
          const previousFiles = queryClient.getQueryData<UploadFile[]>(
            FILE_UPLOAD_QUERY_KEYS.filesList({})
          );

          // 🎯 Optimistically update files list
          const optimisticFile: UploadFile = {
            id: generateTempId(),
            filename: file.name,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: "", // Empty until upload completes
            isPublic: false,
            provider: "local",
            userId: "uploading...", // Temporary placeholder
            categoryId: null,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          queryClient.setQueryData<UploadFile[]>(
            FILE_UPLOAD_QUERY_KEYS.filesList({}),
            (old) => [optimisticFile, ...(old || [])]
          );

          return { previousFiles };
        }
      : undefined,
    onSuccess: (data: UploadFile, file: File) => {
      // 🔄 Simply invalidate and refetch for clean state
      queryClient.invalidateQueries({
        queryKey: FILE_UPLOAD_QUERY_KEYS.files(),
      });
      queryClient.invalidateQueries({
        queryKey: FILE_UPLOAD_QUERY_KEYS.stats(),
      });

      notifySuccess(`Archivo "${file.name}" subido exitosamente`);
    },
    onError: (error, file, context) => {
      // ❌ Rollback optimistic update
      if (context?.previousFiles && enableOptimistic) {
        queryClient.setQueryData(
          FILE_UPLOAD_QUERY_KEYS.filesList({}),
          context.previousFiles
        );
      }

      notifyError(`Error subiendo "${file.name}": ${error.message}`);
    },
    onSettled: () => {
      // 🔄 Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: FILE_UPLOAD_QUERY_KEYS.files(),
      });
    },
  });

  // 🗑️ DELETE FILE MUTATION
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string): Promise<void> => {
      const formData = new FormData();
      formData.append("id", fileId);

      const result = await deleteFileServerAction(formData);
      if (!result.success) {
        throw new Error(result.error || "Delete failed");
      }
    },
    onMutate: enableOptimistic
      ? async (fileId: string) => {
          await queryClient.cancelQueries({
            queryKey: FILE_UPLOAD_QUERY_KEYS.files(),
          });

          const previousFiles = queryClient.getQueryData<UploadFile[]>(
            FILE_UPLOAD_QUERY_KEYS.filesList({})
          );

          // 🎯 Optimistically remove file
          queryClient.setQueryData<UploadFile[]>(
            FILE_UPLOAD_QUERY_KEYS.filesList({}),
            (old) => old?.filter((file) => file.id !== fileId) || []
          );

          return { previousFiles };
        }
      : undefined,
    onSuccess: () => {
      // 📊 Invalidate stats
      queryClient.invalidateQueries({
        queryKey: FILE_UPLOAD_QUERY_KEYS.stats(),
      });
      notifySuccess("Archivo eliminado exitosamente");
    },
    onError: (error, _, context) => {
      // ❌ Rollback optimistic update
      if (context?.previousFiles && enableOptimistic) {
        queryClient.setQueryData(
          FILE_UPLOAD_QUERY_KEYS.filesList({}),
          context.previousFiles
        );
      }

      notifyError(`Error eliminando archivo: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: FILE_UPLOAD_QUERY_KEYS.files(),
      });
    },
  });

  // ✏️ UPDATE FILE MUTATION
  const updateFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      filename,
      isPublic,
      tags,
    }: {
      fileId: string;
      filename?: string;
      isPublic?: boolean;
      tags?: string[];
    }): Promise<UploadFile> => {
      const formData = new FormData();
      formData.append("id", fileId);
      if (filename) formData.append("filename", filename);
      if (isPublic !== undefined) formData.append("isPublic", String(isPublic));
      if (tags) formData.append("tags", tags.join(","));

      const result = await updateFileServerAction(formData);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Update failed");
      }
      return result.data as UploadFile;
    },
    onMutate: enableOptimistic
      ? async ({ fileId, filename, isPublic, tags }) => {
          await queryClient.cancelQueries({
            queryKey: FILE_UPLOAD_QUERY_KEYS.files(),
          });

          const previousFiles = queryClient.getQueryData<UploadFile[]>(
            FILE_UPLOAD_QUERY_KEYS.filesList({})
          );

          // 🎯 Optimistically update file
          queryClient.setQueryData<UploadFile[]>(
            FILE_UPLOAD_QUERY_KEYS.filesList({}),
            (old) =>
              old?.map((file) =>
                file.id === fileId
                  ? {
                      ...file,
                      ...(filename && { filename }),
                      ...(isPublic !== undefined && { isPublic }),
                      ...(tags && { tags }),
                      updatedAt: new Date(Date.now()).toISOString(),
                    }
                  : file
              ) || []
          );

          return { previousFiles };
        }
      : undefined,
    onSuccess: () => {
      notifySuccess("Archivo actualizado exitosamente");
    },
    onError: (error, variables, context) => {
      // ❌ Rollback optimistic update
      if (context?.previousFiles && enableOptimistic) {
        queryClient.setQueryData(
          FILE_UPLOAD_QUERY_KEYS.filesList({}),
          context.previousFiles
        );
      }

      notifyError(`Error actualizando archivo: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: FILE_UPLOAD_QUERY_KEYS.files(),
      });
    },
  });

  // 🔄 Refresh all data
  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: FILE_UPLOAD_QUERY_KEYS.all,
      type: "active",
    });
    notifySuccess("Datos actualizados");
  }, [queryClient, notifySuccess]);

  // 🔍 Filter files
  const filteredFiles = useMemo(() => {
    return files; // Basic implementation, extend with filters as needed
  }, [files]);

  // 🧮 Computed states
  const isLoading = isFilesLoading || isStatsLoading || isCategoriesLoading;
  const isRefreshing = isFilesFetching && !isFilesLoading;
  const hasError = filesError || statsError || categoriesError;

  return {
    // 📁 Data
    files: filteredFiles,
    stats: stats || null,
    categories,

    // 🔄 Loading states
    isLoading,
    isRefreshing,
    isFilesLoading,
    isStatsLoading,
    isCategoriesLoading,

    // ❌ Error states
    error: hasError
      ? filesError?.message ||
        statsError?.message ||
        categoriesError?.message ||
        "Error desconocido"
      : null,
    filesError,
    statsError,
    categoriesError,

    // 🚀 Actions
    uploadFile: uploadFileMutation.mutateAsync,
    deleteFile: deleteFileMutation.mutateAsync,
    updateFile: updateFileMutation.mutateAsync,
    refresh: refreshAll,
    refetchFiles,
    refetchStats,

    // 🔄 Mutation states
    isUploading: uploadFileMutation.isPending,
    isDeleting: deleteFileMutation.isPending,
    isUpdating: updateFileMutation.isPending,

    // 🎯 Utils
    getFileById: useCallback(
      (id: string) => files.find((file) => file.id === id),
      [files]
    ),

    filterFilesByType: useCallback(
      (mimeType: string) =>
        files.filter((file) => file.mimeType.startsWith(mimeType)),
      [files]
    ),

    getFilesByCategory: useCallback(
      (categoryId: string) =>
        files.filter((file) => file.categoryId === categoryId),
      [files]
    ),
  };
}
