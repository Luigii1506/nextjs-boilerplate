/**
 * 📁 FILE-UPLOAD LITE LOGGER
 * ==========================
 *
 * Sistema de logging simplificado para operaciones críticas de file-upload
 * Solo mantiene lo esencial: errores, operaciones importantes y uploads críticos
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0 (Simplified)
 */

import { ENTERPRISE_CONFIG } from "../constants";

export type LogContext = Record<string, unknown>;

// 📁 File operation context
export interface FileLogContext extends LogContext {
  userId?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadId?: string;
  requestId?: string;
}

/**
 * 🏗️ FILE-UPLOAD LITE LOGGER
 *
 * Versión simplificada enfocada solo en lo crítico:
 * - ❌ Error logging para debugging
 * - 📁 File operation logging para auditoría
 * - 🚨 Security events para archivos sospechosos
 */
class FileUploadLiteLogger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private shouldLog(): boolean {
    return (
      ENTERPRISE_CONFIG.enableAdvancedLogging ||
      process.env.NODE_ENV === "production"
    );
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // ❌ ERROR LOGGING (Siempre habilitado)
  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`❌ ${this.module} | ${message}`, {
      timestamp: this.getTimestamp(),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      ...context,
    });
  }

  // 🚨 SECURITY LOGGING (Para archivos sospechosos)
  security(event: string, context: FileLogContext): void {
    console.warn(`🚨 ${this.module} | SECURITY: ${event}`, {
      timestamp: this.getTimestamp(),
      level: "SECURITY_AUDIT",
      ...context,
    });
  }

  // 📁 FILE OPERATION LOGGING (Solo operaciones críticas)
  fileOperation(
    operation: string,
    fileName: string,
    success: boolean,
    details?: FileLogContext
  ): void {
    const status = success ? "✅" : "❌";
    console.log(`📁 ${this.module} | ${operation} ${status}`, {
      timestamp: this.getTimestamp(),
      operation,
      fileName,
      success,
      ...(details || {}),
    });
  }

  // 📤 UPLOAD LOGGING (CRÍTICO)
  upload(
    uploadId: string,
    fileName: string,
    fileSize: number,
    status: "START" | "SUCCESS" | "FAILED",
    context?: FileLogContext
  ): void {
    const statusEmoji =
      status === "SUCCESS" ? "✅" : status === "FAILED" ? "❌" : "🔄";
    console.log(`📤 ${this.module} | UPLOAD_${status} ${statusEmoji}`, {
      timestamp: this.getTimestamp(),
      uploadId,
      fileName,
      fileSize,
      status,
      ...(context || {}),
    });
  }

  // ℹ️ INFO LOGGING (Solo en desarrollo)
  info(message: string, context?: LogContext): void {
    if (this.shouldLog()) {
      console.log(`ℹ️ ${this.module} | ${message}`, {
        timestamp: this.getTimestamp(),
        ...context,
      });
    }
  }

  // 🔍 DEBUG LOGGING (Solo en desarrollo)
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`🔍 ${this.module} | ${message}`, {
        timestamp: this.getTimestamp(),
        ...context,
      });
    }
  }
}

// 🏗️ Factory function simplificada
export function createFileUploadLogger(module: string): FileUploadLiteLogger {
  return new FileUploadLiteLogger(`[FileUpload] ${module}`);
}

// 🎯 Pre-configured loggers (solo los esenciales)
export const fileUploadHookLogger = createFileUploadLogger("Hook");
export const fileUploadServerActionLogger =
  createFileUploadLogger("ServerAction");
export const fileUploadSecurityLogger = createFileUploadLogger("Security");

// Para backward compatibility
export const fileUploadLogger = createFileUploadLogger("Main");
export const serverActionLogger = createFileUploadLogger("ServerAction"); // Alias
export const optimisticLogger = createFileUploadLogger("Optimistic");
