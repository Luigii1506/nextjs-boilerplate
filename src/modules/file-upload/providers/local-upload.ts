// 📁 LOCAL UPLOAD PROVIDER
// =========================
// Proveedor para manejar uploads en el sistema de archivos local

import { writeFile, mkdir, unlink, access, stat } from "fs/promises";
import { join } from "path";
import { generateUploadPath } from "../utils";
import type { UploadResult } from "../types";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export interface UploadProvider {
  upload(file: File, options?: Record<string, unknown>): Promise<UploadResult>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getSignedUrl?(
    filename: string,
    mimeType: string,
    isPublic?: boolean
  ): Promise<string>;
}

export class LocalUploadProvider implements UploadProvider {
  /**
   * Sube un archivo al sistema de archivos local
   */
  async upload(
    file: File,
    options?: {
      userId?: string;
      customPath?: string;
      makePublic?: boolean;
    }
  ): Promise<UploadResult> {
    try {
      // Generar path único
      const uploadPath =
        options?.customPath ||
        generateUploadPath(options?.userId || "anonymous", file.name);
      const fullPath = join(UPLOAD_DIR, uploadPath);
      const dirPath = join(fullPath, "..");

      // Crear directorio si no existe
      await mkdir(dirPath, { recursive: true });

      // Convertir File a Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Escribir archivo
      await writeFile(fullPath, buffer);

      // Crear URL pública
      const publicUrl = `/uploads/${uploadPath}`;

      return {
        success: true,
        filename: uploadPath.split("/").pop() || file.name,
        url: publicUrl,
        key: uploadPath,
        provider: "local",
        metadata: {
          path: uploadPath,
          fullPath,
          size: file.size,
        },
      };
    } catch (error) {
      console.error("Error uploading file locally:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Elimina un archivo del sistema local
   */
  async delete(key: string): Promise<boolean> {
    try {
      const fullPath = join(UPLOAD_DIR, key);
      await unlink(fullPath);
      return true;
    } catch (error) {
      console.error("Error deleting local file:", error);
      return false;
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullPath = join(UPLOAD_DIR, key);
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(key: string) {
    try {
      const fullPath = join(UPLOAD_DIR, key);
      const stats = await stat(fullPath);

      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error("Error getting file info:", error);
      return null;
    }
  }

  /**
   * Para el proveedor local, solo devuelve la URL pública
   */
  async getSignedUrl(filename: string): Promise<string> {
    // Para local, no necesitamos URLs firmadas
    return `/uploads/${filename}`;
  }
}
