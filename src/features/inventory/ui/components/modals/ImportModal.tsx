/**
 * 📥 IMPORT MODAL COMPONENT
 * =========================
 *
 * Modal para importar productos desde CSV/Excel
 * Incluye validación, preview y manejo de errores
 *
 * Created: 2025-01-17 - Export/Import Feature
 */

"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Table,
  AlertCircle,
  CheckCircle,
  Download,
  X,
  Loader2,
} from "lucide-react";
import { BaseModal } from "@/shared/ui/components/BaseModal";
import { cn } from "@/shared/utils";
import {
  parseCSV,
  parseExcel,
  generateExampleFile,
  type ImportResult,
  type ImportedProduct,
} from "../../../utils/import";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: ImportedProduct[]) => Promise<void>;
}

type ImportStep = "upload" | "preview" | "processing" | "complete";

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [step, setStep] = useState<ImportStep>("upload");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setIsProcessing(true);

    try {
      let result: ImportResult;

      if (selectedFile.name.endsWith(".csv")) {
        result = await parseCSV(selectedFile);
      } else if (
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        result = await parseExcel(selectedFile);
      } else {
        result = {
          success: false,
          data: [],
          errors: [
            {
              row: 0,
              field: "file",
              message: "Formato de archivo no soportado. Use CSV o XLSX",
            },
          ],
          stats: { total: 0, valid: 0, invalid: 0 },
        };
      }

      setImportResult(result);
      setStep("preview");
    } catch {
      setImportResult({
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: "file",
            message: "Error al procesar el archivo",
          },
        ],
        stats: { total: 0, valid: 0, invalid: 0 },
      });
      setStep("preview");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!importResult || importResult.data.length === 0) return;

    setStep("processing");
    try {
      await onImport(importResult.data);
      setStep("complete");
    } catch {
      alert("Error al importar productos. Por favor intenta de nuevo.");
      setStep("preview");
    }
  };

  const handleReset = () => {
    setImportResult(null);
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Productos"
      description="Importa productos masivamente desde CSV o Excel"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* 📤 Paso 1: Upload */}
        {step === "upload" && (
          <>
            {/* Descargar ejemplo */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    ¿Primera vez importando?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Descarga un archivo de ejemplo para ver el formato correcto
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateExampleFile("xlsx")}
                      className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Table className="w-4 h-4 inline mr-1" />
                      Ejemplo XLSX
                    </button>
                    <button
                      onClick={() => generateExampleFile("csv")}
                      className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <FileText className="w-4 h-4 inline mr-1" />
                      Ejemplo CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Área de drop */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {isProcessing ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Procesando archivo...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Arrastra tu archivo aquí
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Soporta archivos CSV y Excel (XLSX)
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 👁️ Paso 2: Preview */}
        {step === "preview" && importResult && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total filas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {importResult.stats.total}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Válidas
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResult.stats.valid}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Con errores
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {importResult.stats.invalid}
                </p>
              </div>
            </div>

            {/* Errores */}
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-100">
                      Errores encontrados ({importResult.errors.length})
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Corrige estos errores antes de importar
                    </p>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {importResult.errors.slice(0, 10).map((error, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-red-900/10 rounded-lg p-3 text-sm"
                    >
                      <p className="font-medium text-red-900 dark:text-red-100">
                        Fila {error.row} - {error.field}
                      </p>
                      <p className="text-red-700 dark:text-red-300">
                        {error.message}
                      </p>
                      {error.value !== undefined && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Valor: &quot;{String(error.value)}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                  {importResult.errors.length > 10 && (
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      ... y {importResult.errors.length - 10} errores más
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Preview de productos válidos */}
            {importResult.data.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Preview de productos ({importResult.data.length})
                </h4>
                <div className="max-h-64 overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">SKU</th>
                        <th className="px-4 py-2 text-left font-semibold">Nombre</th>
                        <th className="px-4 py-2 text-left font-semibold">Precio</th>
                        <th className="px-4 py-2 text-left font-semibold">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {importResult.data.slice(0, 100).map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 font-mono text-xs">
                            {product.sku}
                          </td>
                          <td className="px-4 py-2">{product.name}</td>
                          <td className="px-4 py-2">${product.price}</td>
                          <td className="px-4 py-2">{product.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={importResult.data.length === 0}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                  importResult.data.length === 0
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                )}
              >
                <Upload className="w-5 h-5" />
                Importar {importResult.data.length} productos
              </button>
            </div>
          </>
        )}

        {/* ⏳ Paso 3: Processing */}
        {step === "processing" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Importando productos...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Por favor espera mientras procesamos tu archivo
              </p>
            </div>
          </div>
        )}

        {/* ✅ Paso 4: Complete */}
        {step === "complete" && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ¡Importación completada!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {importResult?.data.length} productos importados correctamente
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default ImportModal;
