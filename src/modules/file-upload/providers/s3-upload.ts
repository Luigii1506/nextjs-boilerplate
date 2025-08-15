// ☁️ S3 UPLOAD PROVIDER
// =====================
// Proveedor para manejar uploads a Amazon S3

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateUploadPath, getS3Config } from "../config";
import type { UploadResult, S3Config } from "../types";
import type { UploadProvider } from "./local-upload";

export class S3UploadProvider implements UploadProvider {
  private config: S3Config;
  private s3Client?: S3Client;
  private isServer: boolean;

  constructor(config?: S3Config) {
    this.isServer = typeof window === "undefined";
    this.config = config ||
      getS3Config() || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        region: "us-east-1",
        bucket: "clistenesbucket",
      };

    // Inicializar cliente S3 solo en el servidor
    if (this.isServer) {
      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });
    }
  }

  /**
   * Sube un archivo a S3
   */
  async upload(
    file: File,
    options?: {
      userId?: string;
      customKey?: string;
      makePublic?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "S3 is not configured correctly",
      };
    }

    // Si estamos en el servidor, usar AWS SDK directamente
    if (this.isServer) {
      return this.uploadToS3Direct(file, options);
    }

    // Si estamos en el cliente, usar fetch a la API route
    return this.uploadToS3ViaAPI(file, options);
  }

  /**
   * Upload directo usando AWS SDK (servidor)
   */
  private async uploadToS3Direct(
    file: File,
    options?: {
      userId?: string;
      customKey?: string;
      makePublic?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadResult> {
    const key =
      options?.customKey ||
      generateUploadPath(options?.userId || "anonymous", file.name);

    try {
      // Convertir File a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedBy: options?.userId || "anonymous",
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client!.send(command);

      // Construir URL del archivo
      const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;

      return {
        success: true,
        filename: key.split("/").pop() || file.name,
        url,
        key,
        bucket: this.config.bucket,
        provider: "s3",
        metadata: {
          uploadedAt: new Date().toISOString(),
          region: this.config.region,
        },
      };
    } catch (error) {
      console.error("Error uploading to S3:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Upload vía API route (cliente)
   */
  private async uploadToS3ViaAPI(
    file: File,
    options?: {
      userId?: string;
      customKey?: string;
      makePublic?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.userId) formData.append("userId", options.userId);
    if (options?.customKey) formData.append("customKey", options.customKey);
    if (options?.makePublic) formData.append("makePublic", "true");

    try {
      // Para progreso avanzado, usar XMLHttpRequest
      if (options?.onProgress) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && options.onProgress) {
              const progress = (event.loaded / event.total) * 100;
              options.onProgress(progress);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } else {
              reject(new Error(`Error: ${xhr.status} - ${xhr.statusText}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error"));
          });

          xhr.open("POST", "/api/modules/file-upload/s3");
          xhr.send(formData);
        });
      }

      // 🎯 ENTERPRISE-GRADE: Direct Server Action call
      const { uploadFileAction } = await import("../server/actions");

      // Preparar datos para Server Action
      const file = formData.get("file") as File;
      if (!file) throw new Error("No file provided");

      const uploadResult = await uploadFileAction(formData, "system", "s3");

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(
          `Upload failed: ${uploadResult.error || "Unknown error"}`
        );
      }

      // Convert UploadFile to UploadResult format
      return {
        success: true,
        url: uploadResult.data.url,
        key: uploadResult.data.key || uploadResult.data.url,
      };
    } catch (error) {
      console.error("Error uploading to S3:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Elimina un archivo de S3
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isServer) {
      // 🎯 ENTERPRISE-GRADE: Direct Server Action call
      try {
        const { deleteFileServerAction } = await import("../server/actions");
        const formData = new FormData();
        formData.append("key", key);
        formData.append("bucket", this.config.bucket);

        const result = await deleteFileServerAction(formData);
        return result.success;
      } catch (error) {
        console.error("Error deleting from S3:", error);
        return false;
      }
    } else {
      // En el servidor, usar AWS SDK directamente
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        });
        await this.s3Client!.send(command);
        return true;
      } catch (error) {
        console.error("Error deleting from S3:", error);
        return false;
      }
    }
  }

  /**
   * Verifica si un archivo existe en S3
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isServer || !this.s3Client) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Genera una URL firmada para acceso temporal
   */
  async getSignedUrl(
    filename: string,
    mimeType: string,
    isPublic = false,
    expiresIn = 3600
  ): Promise<string> {
    if (!this.isServer) {
      // 🎯 ENTERPRISE-GRADE: Direct Server Action call
      try {
        const { generateSignedUrlServerAction } = await import(
          "../server/actions"
        );
        const formData = new FormData();
        formData.append("filename", filename);
        formData.append("mimeType", mimeType);
        formData.append("isPublic", isPublic.toString());
        formData.append("expiresIn", expiresIn.toString());

        const result = await generateSignedUrlServerAction(formData);

        if (!result.success) {
          throw new Error(`Signed URL error: ${result.error}`);
        }

        if (!result.success) {
          throw new Error(`Failed to get signed URL: ${result.error}`);
        }

        // generateSignedUrlServerAction returns the URL directly in data
        return (result.data as string) || "";
      } catch (error) {
        console.error("Error getting signed URL:", error);
        throw error;
      }
    } else {
      // En el servidor, usar AWS SDK directamente
      try {
        const key = generateUploadPath("temp", filename);
        const command = new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        });
        const url = await getSignedUrl(this.s3Client!, command, { expiresIn });
        return url;
      } catch (error) {
        console.error("Error getting signed URL:", error);
        throw error;
      }
    }
  }

  /**
   * Genera URL firmada para upload directo
   */
  async getSignedUploadUrl(
    filename: string,
    mimeType: string,
    /* isPublic - not used in current implementation */
    expiresIn = 3600
  ): Promise<{ url: string; key: string }> {
    if (!this.isServer || !this.s3Client) {
      throw new Error("Signed upload URLs can only be generated on the server");
    }

    try {
      const key = generateUploadPath("uploads", filename);
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: mimeType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return { url, key };
    } catch (error) {
      console.error("Error getting signed upload URL:", error);
      throw error;
    }
  }

  /**
   * Verifica si S3 está configurado correctamente
   */
  private isConfigured(): boolean {
    return !!(
      this.config.accessKeyId &&
      this.config.secretAccessKey &&
      this.config.bucket &&
      this.config.region
    );
  }
}
