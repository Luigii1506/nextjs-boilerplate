// 📏 FILE SIZE COMPONENT - ENTERPRISE REUSABLE
// ==============================================
// Componente reutilizable para mostrar tamaños de archivos

import React from "react";
import { formatFileSize } from "../../../utils";

interface FileSizeProps {
  bytes: number;
  className?: string;
}

/**
 * Componente reutilizable para mostrar tamaños de archivos formateados
 */
const FileSize: React.FC<FileSizeProps> = React.memo(({
  bytes,
  className = "text-sm text-slate-600",
}) => {
  return (
    <span className={className}>
      {formatFileSize(bytes)}
    </span>
  );
});

FileSize.displayName = "FileSize";

export default FileSize;
