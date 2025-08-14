// 📤 USE FILE UPLOAD HOOK
// =======================
// Hook para manejo de uploads con API endpoints

"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { uploadFileAction } from "../server/actions";
import type {
  UseFileUploadReturn,
  UploadFile,
  UploadProgress,
  UploadConfig,
  UploadProvider,
} from "../types";

export function useFileUpload(
  config?: Partial<UploadConfig>
): UseFileUploadReturn {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress([]);
  }, []);

  const uploadFiles = useCallback(
    async (
      files: File[],
      options?: {
        provider?: UploadProvider;
        makePublic?: boolean;
        categoryId?: string | null;
        detectCategory?: (mimeType: string) => string | null;
      }
    ): Promise<
      Array<{
        success: boolean;
        file?: UploadFile;
        error?: string;
        fileId: string;
      }>
    > => {
      if (!user) {
        setError("Usuario no autenticado");
        return files.map((file) => ({
          success: false,
          error: "Usuario no autenticado",
          fileId: file.name,
        }));
      }

      setUploading(true);
      setError(null);

      // Inicializar progress para todos los archivos
      const initialProgress: UploadProgress[] = files.map((file, index) => ({
        fileId: `${file.name}-${index}`,
        progress: 0,
        status: "pending",
      }));
      setProgress(initialProgress);

      const results: Array<{
        success: boolean;
        file?: UploadFile;
        error?: string;
        fileId: string;
      }> = [];

      try {
        // Subir archivos uno por uno (podrías paralelizar esto)
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileId = `${file.name}-${i}`;

          try {
            // Actualizar progress a "uploading"
            setProgress((prev) =>
              prev.map((p) =>
                p.fileId === fileId
                  ? { ...p, status: "uploading", progress: 0 }
                  : p
              )
            );

            // Crear FormData
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
              "provider",
              options?.provider || config?.provider || "local"
            );
            formData.append("makePublic", String(options?.makePublic || false));

            // Detectar o usar categoría proporcionada
            let categoryId = options?.categoryId;
            if (!categoryId && options?.detectCategory) {
              categoryId = options.detectCategory(file.type);
            }
            if (categoryId) {
              formData.append("categoryId", categoryId);
            }

            // ✅ Usar server action en lugar de fetch directo
            const result = await uploadFileAction(
              formData,
              user.id,
              (options?.provider || config?.provider || "local") as
                | "local"
                | "s3",
              categoryId || undefined
            );

            if (result.success && result.data) {
              // Actualizar progress a "completed"
              setProgress((prev) =>
                prev.map((p) =>
                  p.fileId === fileId
                    ? { ...p, status: "completed", progress: 100 }
                    : p
                )
              );

              results.push({
                success: true,
                file: result.data,
                fileId,
              });
            } else {
              const errorMessage =
                result.error || `Error subiendo ${file.name}`;

              // Actualizar progress a "error"
              setProgress((prev) =>
                prev.map((p) =>
                  p.fileId === fileId
                    ? { ...p, status: "error", error: errorMessage }
                    : p
                )
              );

              results.push({
                success: false,
                error: errorMessage,
                fileId,
              });
            }
          } catch (fileError) {
            console.error("File upload error:", fileError);
            const errorMessage = `Error de red subiendo ${file.name}`;

            // Actualizar progress a "error"
            setProgress((prev) =>
              prev.map((p) =>
                p.fileId === fileId
                  ? { ...p, status: "error", error: errorMessage }
                  : p
              )
            );

            results.push({
              success: false,
              error: errorMessage,
              fileId,
            });
          }
        }

        return results;
      } catch (generalError) {
        const errorMessage =
          generalError instanceof Error
            ? generalError.message
            : "Error general de upload";

        setError(errorMessage);

        return files.map((file, index) => ({
          success: false,
          error: errorMessage,
          fileId: `${file.name}-${index}`,
        }));
      } finally {
        setUploading(false);
      }
    },
    [user, config]
  );

  const uploadFile = useCallback(
    async (
      file: File,
      options?: {
        provider?: UploadProvider;
        makePublic?: boolean;
        categoryId?: string | null;
        detectCategory?: (mimeType: string) => string | null;
      }
    ): Promise<{ success: boolean; file?: UploadFile; error?: string }> => {
      const results = await uploadFiles([file], options);
      const result = results[0];
      return {
        success: result.success,
        file: result.file,
        error: result.error,
      };
    },
    [uploadFiles]
  );

  return {
    uploading,
    progress,
    error,
    uploadFiles,
    uploadFile, // 🔧 Agregamos uploadFile al return
    clearError,
    resetProgress,
  };
}

// Hook simplified para upload de un solo archivo
export function useSingleFileUpload(config?: Partial<UploadConfig>) {
  const multiUpload = useFileUpload(config);

  const uploadFile = useCallback(
    async (
      file: File,
      options?: { provider?: UploadProvider; makePublic?: boolean }
    ) => {
      const results = await multiUpload.uploadFiles([file], options);
      return results[0];
    },
    [multiUpload]
  );

  return {
    uploading: multiUpload.uploading,
    progress: multiUpload.progress[0] || null,
    error: multiUpload.error,
    uploadFile,
    clearError: multiUpload.clearError,
    resetProgress: multiUpload.resetProgress,
  };
}
